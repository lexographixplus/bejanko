import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripHtml, truncate } from "@/lib/utils";

export interface SearchResult {
  id: string;
  kind: "Essay" | "Note" | "Quote" | "Book" | "Guest" | "Contest";
  title: string;
  excerpt: string;
  href: string;
}

const LIMIT = 5;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = { contains: q, mode: "insensitive" as const };

  try {
    const [essays, notes, quotes, books, guests, contests] = await Promise.all([
      db.essay.findMany({
        where: {
          published: true,
          OR: [{ title: like }, { excerpt: like }, { content: like }],
        },
        select: { id: true, title: true, slug: true, excerpt: true, content: true },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
      db.note.findMany({
        where: { published: true, OR: [{ title: like }, { content: like }] },
        select: { id: true, title: true, slug: true, content: true },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
      db.quote.findMany({
        where: { published: true, OR: [{ content: like }, { source: like }] },
        select: { id: true, content: true, source: true },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
      db.book.findMany({
        where: {
          published: true,
          OR: [{ title: like }, { bookAuthor: like }, { excerpt: like }],
        },
        select: { id: true, title: true, slug: true, excerpt: true, bookAuthor: true },
        orderBy: { sortOrder: "asc" },
        take: LIMIT,
      }),
      db.guestPost.findMany({
        where: {
          published: true,
          OR: [{ title: like }, { excerpt: like }, { content: like }],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          contributorName: true,
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
      db.contest.findMany({
        where: { published: true, OR: [{ title: like }, { excerpt: like }] },
        select: { id: true, title: true, slug: true, excerpt: true },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      }),
    ]);

    const results: SearchResult[] = [
      ...essays.map((e) => ({
        id: e.id,
        kind: "Essay" as const,
        title: e.title,
        excerpt: truncate(e.excerpt || stripHtml(e.content), 120),
        href: `/essays/${e.slug}`,
      })),
      ...notes.map((n) => ({
        id: n.id,
        kind: "Note" as const,
        title: n.title || truncate(stripHtml(n.content), 50),
        excerpt: truncate(stripHtml(n.content), 120),
        href: `/notes/${n.slug}`,
      })),
      ...quotes.map((q2) => ({
        id: q2.id,
        kind: "Quote" as const,
        title: truncate(stripHtml(q2.content), 60),
        excerpt: q2.source ? `— ${q2.source}` : "",
        href: "/quotes",
      })),
      ...books.map((b) => ({
        id: b.id,
        kind: "Book" as const,
        title: b.title,
        excerpt: b.bookAuthor ? `by ${b.bookAuthor}` : truncate(b.excerpt ?? "", 120),
        href: "/books",
      })),
      ...guests.map((g) => ({
        id: g.id,
        kind: "Guest" as const,
        title: g.title,
        excerpt: `by ${g.contributorName}`,
        href: `/guest-writing/${g.slug}`,
      })),
      ...contests.map((c) => ({
        id: c.id,
        kind: "Contest" as const,
        title: c.title,
        excerpt: truncate(c.excerpt ?? "", 120),
        href: `/contests/${c.slug}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
