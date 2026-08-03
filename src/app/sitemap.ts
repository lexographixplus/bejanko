import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

// Content changes whenever the admin publishes, so this is generated per request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/essays`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/notes`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/quotes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/books`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guest-writing`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contests`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/submit`, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const [essays, notes, guests, contests] = await Promise.all([
      db.essay.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.note.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.guestPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.contest.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...essays.map((e) => ({
        url: `${base}/essays/${e.slug}`,
        lastModified: e.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...notes.map((n) => ({
        url: `${base}/notes/${n.slug}`,
        lastModified: n.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...guests.map((g) => ({
        url: `${base}/guest-writing/${g.slug}`,
        lastModified: g.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...contests.map((c) => ({
        url: `${base}/contests/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (err) {
    // A database blip shouldn't produce a broken sitemap.
    console.error("[sitemap]", err);
    return staticRoutes;
  }
}
