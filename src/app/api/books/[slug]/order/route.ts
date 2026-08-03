import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { anonymizeIp } from "@/lib/utils";
import { sendBookOrderEmails } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  address: z.string().max(1000).optional(),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
  format: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = clientIp(req);

    const limit = rateLimit(`order:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many orders. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please check the form and try again." },
        { status: 400 }
      );
    }

    if (result.data.website) {
      return NextResponse.json({ ok: true });
    }

    const book = await db.book.findUnique({ where: { slug } });
    if (!book || !book.published) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await db.bookOrder.create({
      data: {
        bookId: book.id,
        name: result.data.name,
        email: result.data.email.toLowerCase(),
        phone: result.data.phone || null,
        address: result.data.address || null,
        quantity: result.data.quantity,
        format: result.data.format || book.format || null,
        message: result.data.message || null,
        ip: anonymizeIp(ip),
      },
    });

    // The order is recorded; delivery of the notification is best-effort.
    await sendBookOrderEmails({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      address: result.data.address,
      quantity: result.data.quantity,
      format: result.data.format || book.format,
      message: result.data.message,
      bookTitle: book.title,
      bookSlug: book.slug,
      price: book.price,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/books/order]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
