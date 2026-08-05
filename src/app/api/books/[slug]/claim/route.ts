import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { anonymizeIp, generateToken } from "@/lib/utils";
import { parseBookFiles } from "@/lib/books";
import { sendBookDownloadEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(200),
  website: z.string().max(0).optional(), // honeypot
});

/**
 * Claims a free book: records the download, adds the reader to the newsletter,
 * and hands back a token the download route will accept.
 *
 * Subscribing is not a hidden side effect — the form states the exchange
 * before the reader types anything, and every issue carries a one-click
 * unsubscribe.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = clientIp(req);

    const limit = rateLimit(`claim:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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

    const book = await db.book.findUnique({ where: { slug } });
    if (!book || !book.published) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!book.downloadOpen) {
      return NextResponse.json(
        { error: "This book isn't available to download right now." },
        { status: 403 }
      );
    }

    const files = parseBookFiles(book.files);
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No file is attached to this book yet." },
        { status: 409 }
      );
    }

    // Someone who unsubscribed earlier still gets the book, but is not
    // quietly put back on the list.
    const existing = await db.subscriber.findUnique({ where: { email } });
    const maySubscribe = existing?.status !== "UNSUBSCRIBED";

    if (maySubscribe) {
      await db.subscriber.upsert({
        where: { email },
        update: {
          status: "CONFIRMED",
          confirmedAt: existing?.confirmedAt ?? new Date(),
        },
        create: {
          email,
          token: generateToken(),
          status: "CONFIRMED",
          confirmedAt: new Date(),
          source: `book:${book.slug}`,
          ip: anonymizeIp(ip),
        },
      });
    }

    // Re-claiming keeps the original token so an old emailed link still works.
    const claim = await db.bookDownload.upsert({
      where: { bookId_email: { bookId: book.id, email } },
      update: { subscribed: maySubscribe },
      create: {
        bookId: book.id,
        email,
        token: generateToken(),
        subscribed: maySubscribe,
        ip: anonymizeIp(ip),
      },
    });

    await sendBookDownloadEmail({
      to: email,
      bookTitle: book.title,
      bookSlug: book.slug,
      token: claim.token,
      files,
      subscribed: maySubscribe,
    });

    return NextResponse.json({ ok: true, token: claim.token, files });
  } catch (err) {
    console.error("[api/books/claim]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
