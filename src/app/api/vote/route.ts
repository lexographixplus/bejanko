import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { anonymizeIp, generateToken } from "@/lib/utils";
import { deriveStage } from "@/lib/contest-stage";
import { sendVoteReceiptEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  entryId: z.string().min(1),
  voterName: z.string().min(1).max(120),
  voterEmail: z.string().email().max(200),
  website: z.string().max(0).optional(), // honeypot
});

/**
 * Casts a vote and counts it immediately.
 *
 * Votes used to wait on an email click, which lost most of them: by the time
 * someone types their address they have already read the entries and decided,
 * so every later step could only shed votes. The email is now a receipt with a
 * revoke link, and the audit trail is what makes a result defensible.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const limit = rateLimit(`vote:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many votes from this connection. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please check your name and email." },
        { status: 400 }
      );
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
        { error: "Voting is not open for this contest." },
        { status: 400 }
      );
    }

    // Anyone who entered is out of the vote entirely, not just barred from
    // backing their own piece — otherwise entrants can trade votes with each
    // other, which is the collusion this rule exists to stop.
    const ownEntry = await db.contestEntry.findFirst({
      where: { contestId: entry.contestId, entrantEmail: email },
      select: { id: true },
    });

    if (ownEntry) {
      return NextResponse.json(
        { error: "You can't vote in a contest you've entered." },
        { status: 400 }
      );
    }

    const existing = await db.vote.findUnique({
      where: {
        contestId_voterEmail: { contestId: entry.contestId, voterEmail: email },
      },
      include: { entry: { select: { title: true } } },
    });

    if (existing && existing.status !== "DISQUALIFIED") {
      return NextResponse.json(
        {
          error:
            existing.entryId === entry.id
              ? `You've already voted for "${existing.entry.title}".`
              : `You've already voted in this contest, for "${existing.entry.title}". One vote each.`,
        },
        { status: 409 }
      );
    }

    const token = generateToken();
    // Coarse IP and user agent are duplicate-voting signals for review, not
    // identification — the IP keeps only its network prefix.
    const audit = {
      ip: anonymizeIp(ip),
      userAgent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
    };

    const vote = existing
      ? // A disqualified voter gets one more go rather than being locked out.
        await db.vote.update({
          where: { id: existing.id },
          data: {
            entryId: entry.id,
            voterName: result.data.voterName,
            status: "CONFIRMED",
            note: null,
            token,
            confirmedAt: new Date(),
            ...audit,
          },
        })
      : await db.vote.create({
          data: {
            contestId: entry.contestId,
            entryId: entry.id,
            voterName: result.data.voterName,
            voterEmail: email,
            status: "CONFIRMED",
            token,
            confirmedAt: new Date(),
            ...audit,
          },
        });

    // The vote is already counted, so a mail failure must not fail the request.
    await sendVoteReceiptEmail({
      voterName: vote.voterName,
      voterEmail: vote.voterEmail,
      entryTitle: entry.title,
      contestTitle: entry.contest.title,
      contestSlug: entry.contest.slug,
      token: vote.token,
    });

    const votes = await db.vote.count({
      where: { entryId: entry.id, status: "CONFIRMED" },
    });

    return NextResponse.json({ ok: true, entryTitle: entry.title, votes });
  } catch (err) {
    console.error("[api/vote]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
