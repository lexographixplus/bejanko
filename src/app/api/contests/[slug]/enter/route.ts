import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { wordCount } from "@/lib/utils";
import { deriveStage } from "@/lib/contest-stage";
import { sendContestEntryEmails } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(120_000),
  entrantName: z.string().min(1).max(120),
  entrantEmail: z.string().email().max(200),
  fileName: z.string().max(300).optional(),
  fileUrl: z.string().url().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = clientIp(req);

    const limit = rateLimit(`enter:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (result.data.website) {
      return NextResponse.json({ ok: true });
    }

    const contest = await db.contest.findUnique({ where: { slug } });
    if (!contest || !contest.published) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const stage = deriveStage(contest);
    if (stage !== "SUBMITTING") {
      return NextResponse.json(
        { error: "This contest is not currently accepting entries" },
        { status: 400 }
      );
    }

    // A file is only acceptable when the contest asks for one, and is the
    // only acceptable substitute when it requires one.
    if (contest.uploadMode === "TEXT" && result.data.fileUrl) {
      return NextResponse.json(
        { error: "This contest accepts written entries only" },
        { status: 400 }
      );
    }
    if (contest.uploadMode === "REQUIRED" && !result.data.fileUrl) {
      return NextResponse.json(
        { error: "This contest requires a file upload" },
        { status: 400 }
      );
    }

    const words = wordCount(result.data.content);
    if (contest.wordMin && words < contest.wordMin) {
      return NextResponse.json(
        { error: `Entry must be at least ${contest.wordMin} words` },
        { status: 400 }
      );
    }
    if (contest.wordMax && words > contest.wordMax) {
      return NextResponse.json(
        { error: `Entry must be at most ${contest.wordMax} words` },
        { status: 400 }
      );
    }

    // entryNumber is the public-facing label used during anonymous voting.
    const entryCount = await db.contestEntry.count({
      where: { contestId: contest.id },
    });

    await db.contestEntry.create({
      data: {
        contestId: contest.id,
        title: result.data.title,
        content: result.data.content,
        entrantName: result.data.entrantName,
        entrantEmail: result.data.entrantEmail.toLowerCase(),
        wordCount: words,
        entryNumber: entryCount + 1,
        state: "PENDING",
        fileName: result.data.fileName || null,
        fileUrl: result.data.fileUrl || null,
      },
    });

    await sendContestEntryEmails({
      entrantName: result.data.entrantName,
      entrantEmail: result.data.entrantEmail,
      entryTitle: result.data.title,
      contestTitle: contest.title,
      contestSlug: contest.slug,
      wordCount: words,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // @@unique([contestId, entrantEmail]) — one entry per person per contest.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You've already entered this contest with that email address." },
        { status: 409 }
      );
    }

    console.error("[api/contests/enter]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
