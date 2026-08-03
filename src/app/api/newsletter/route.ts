import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { anonymizeIp, generateToken } from "@/lib/utils";
import { sendSubscriberConfirmationEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(60).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const limit = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (result.data.website) {
      return NextResponse.json({ ok: true });
    }

    const email = result.data.email.toLowerCase();
    const existing = await db.subscriber.findUnique({ where: { email } });

    // Never confirm or deny an existing subscription to a stranger — the same
    // response goes back either way.
    if (existing?.status === "CONFIRMED") {
      return NextResponse.json({ ok: true });
    }

    const token = generateToken();

    await db.subscriber.upsert({
      where: { email },
      update: { token, status: "PENDING", ip: anonymizeIp(ip) },
      create: {
        email,
        token,
        status: "PENDING",
        source: result.data.source || null,
        ip: anonymizeIp(ip),
      },
    });

    await sendSubscriberConfirmationEmail({ email, token });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/newsletter]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
