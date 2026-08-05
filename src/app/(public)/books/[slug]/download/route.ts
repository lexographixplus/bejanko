import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseBookFiles } from "@/lib/books";

/**
 * Hands over the file for a claimed book.
 *
 * Redirects rather than streaming: a serverless response body is capped well
 * below the size of a book, so the bytes must come from the storage host.
 *
 * The token is what makes the email form worth having — without it this would
 * be a public URL that walks straight around the claim step.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const wanted = req.nextUrl.searchParams.get("format")?.toUpperCase();

  const bookUrl = new URL(`/books/${slug}`, req.nextUrl.origin);

  if (!token) {
    bookUrl.searchParams.set("claim", "required");
    return NextResponse.redirect(bookUrl);
  }

  const claim = await db.bookDownload.findUnique({
    where: { token },
    include: { book: true },
  });

  if (!claim || claim.book.slug !== slug) {
    bookUrl.searchParams.set("claim", "invalid");
    return NextResponse.redirect(bookUrl);
  }

  // Closing the giveaway closes it for everyone, including old links.
  if (!claim.book.downloadOpen || !claim.book.published) {
    bookUrl.searchParams.set("claim", "closed");
    return NextResponse.redirect(bookUrl);
  }

  const files = parseBookFiles(claim.book.files);
  const file = files.find((f) => f.format === wanted) ?? files[0];

  if (!file) {
    bookUrl.searchParams.set("claim", "missing");
    return NextResponse.redirect(bookUrl);
  }

  // Counting is best-effort; a bookkeeping failure shouldn't deny the file.
  try {
    await db.bookDownload.update({
      where: { id: claim.id },
      data: { downloadCount: { increment: 1 } },
    });
  } catch (err) {
    console.error("[books/download] count failed", err);
  }

  return NextResponse.redirect(file.url);
}
