import { db } from "@/lib/db";
import { siteUrl, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { stripHtml, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const base = siteUrl();

  const [essays, notes] = await Promise.all([
    db.essay.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        createdAt: true,
      },
    }),
    db.note.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { title: true, slug: true, content: true, createdAt: true },
    }),
  ]);

  const items = [
    ...essays.map((e) => ({
      title: e.title,
      link: `${base}/essays/${e.slug}`,
      description: e.excerpt || truncate(stripHtml(e.content), 300),
      date: e.createdAt,
      category: "Essay",
    })),
    ...notes.map((n) => ({
      title: n.title || truncate(stripHtml(n.content), 60),
      link: `${base}/notes/${n.slug}`,
      description: truncate(stripHtml(n.content), 300),
      date: n.createdAt,
      category: "Note",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <category>${item.category}</category>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
