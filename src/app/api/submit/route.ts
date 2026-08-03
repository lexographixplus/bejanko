import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { anonymizeIp, wordCount } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slug";
import { db } from "@/lib/db";
import { sendGuestSubmissionEmails } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  title: z.string().min(1).max(200),
  bio: z.string().max(300).optional(),
  body: z.string().min(50).max(60_000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const limit = rateLimit(`submit:${ip}`, { limit: 3, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "You've submitted a few pieces already. Please try again later." },
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

    const words = wordCount(result.data.body);
    if (words < 50) {
      return NextResponse.json(
        { error: "Your piece must be at least 50 words" },
        { status: 400 }
      );
    }

    const slug = await uniqueSlug("guestPost", result.data.title);

    await db.$transaction([
      db.guestPost.create({
        data: {
          title: result.data.title,
          slug,
          content: result.data.body,
          contributorName: result.data.name,
          contributorEmail: result.data.email,
          contributorBio: result.data.bio || null,
          status: "PENDING",
          published: false,
        },
      }),
      db.submission.create({
        data: {
          kind: "GUEST",
          name: result.data.name,
          email: result.data.email,
          subject: result.data.title,
          message: result.data.body,
          status: "NEW",
          ip: anonymizeIp(ip),
        },
      }),
    ]);

    await sendGuestSubmissionEmails({
      name: result.data.name,
      email: result.data.email,
      title: result.data.title,
      body: result.data.body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/submit]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
