import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { anonymizeIp } from "@/lib/utils";
import { db } from "@/lib/db";
import { sendContactEmails } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const limit = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 10 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Honeypot triggered — pretend it worked so the bot doesn't retry.
    if (result.data.website) {
      return NextResponse.json({ ok: true });
    }

    await db.submission.create({
      data: {
        kind: "CONTACT",
        name: result.data.name,
        email: result.data.email,
        message: result.data.message,
        status: "NEW",
        ip: anonymizeIp(ip),
      },
    });

    // The message is already persisted; delivery is a bonus, not a gate.
    await sendContactEmails({
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
