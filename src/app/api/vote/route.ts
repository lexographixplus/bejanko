import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { anonymizeIp, generateToken } from "@/lib/utils";
import { deriveStage } from "@/lib/contest-stage";
import { sendVoteConfirmationEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  entryId: z.string().min(1),
  voterName: z.string().min(1).max(120),
  voterEmail: z.string().email().max(200),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const limit = rateLimit(`vote:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many vote attempts. Please try again later." },
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

    const email = result.data.voterEmail.toLowerCase();

    const entry = await db.contestEntry.findUnique({
      where: { id: result.data.entryId },
      include: { contest: true },
    });

    if (!entry || entry.state !== "APPROVED") {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (deriveStage(entry.contest) !== "VOTING") {
      return NextResponse.json(
        { error: "Voting is not open for this contest" },
        { status: 400 }
      );
    }

    // Entrants shouldn't vote on their own contest.
    if (entry.entrantEmail.toLowerCase() === email) {
      return NextResponse.json(
        { error: "You can't vote on a contest you've entered." },
        { status: 400 }
      );
    }

    const existing = await db.vote.findUnique({
      where: {
        contestId_voterEmail: { contestId: entry.contestId, voterEmail: email },
      },
    });

    if (existing?.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "You've already voted in this contest." },
        { status: 409 }
      );
    }

    // An unconfirmed vote is not a commitment: let them change their pick and
    // re-send the link rather than locking them out of the contest entirely.
    const vote = existing
      ? await db.vote.update({
          where: { id: existing.id },
          data: {
            entryId: entry.id,
            voterName: result.data.voterName,
            token: generateToken(),
            ip: anonymizeIp(ip),
          },
        })
      : await db.vote.create({
          data: {
            contestId: entry.contestId,
            entryId: entry.id,
            voterName: result.data.voterName,
            voterEmail: email,
            token: generateToken(),
            ip: anonymizeIp(ip),
            status: "PENDING",
          },
        });

    const mail = await sendVoteConfirmationEmail({
      voterName: vote.voterName,
      voterEmail: vote.voterEmail,
      entryTitle: entry.title,
      contestTitle: entry.contest.title,
      token: vote.token,
    });

    if (!mail.ok) {
      return NextResponse.json(
        {
          error:
            "We couldn't send your confirmation email. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/vote]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
