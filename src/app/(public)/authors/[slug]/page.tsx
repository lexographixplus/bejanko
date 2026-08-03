import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe, Mail } from "lucide-react";
import { getAuthorBySlug, getAuthors } from "@/lib/actions/authors";
import { getPublishedGuestPosts } from "@/lib/actions/guest-posts";
import { AuthorCard } from "@/components/shared/author-card";
import { siteUrl } from "@/lib/site";
import { truncate, stripHtml, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author || !author.published) return {};

  const description =
    author.excerpt ||
    (author.bio ? truncate(stripHtml(author.bio), 160) : undefined);

  return {
    title: author.name,
    description,
    openGraph: {
      type: "profile",
      title: author.name,
      description,
      images: author.photo ? [author.photo] : undefined,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author || !author.published) notFound();

  const [allAuthors, guestPosts] = await Promise.all([
    getAuthors({ published: true }),
    getPublishedGuestPosts(),
  ]);

  // Guest pieces credited to this person, matched on the name they submitted.
  const contributions = guestPosts.filter(
    (post) =>
      post.contributorName.trim().toLowerCase() ===
      author.name.trim().toLowerCase()
  );

  const others = allAuthors.filter((a) => a.id !== author.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.role ? { jobTitle: author.role } : {}),
    ...(author.excerpt ? { description: author.excerpt } : {}),
    ...(author.photo ? { image: author.photo } : {}),
    ...(author.website ? { url: author.website } : {}),
    mainEntityOfPage: `${siteUrl()}/authors/${author.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All Authors
        </Link>

        <div className="grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative w-32 h-32 lg:w-full lg:h-auto lg:aspect-square rounded-2xl overflow-hidden bg-stone ring-1 ring-rule">
              {author.photo ? (
                <Image
                  src={author.photo}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 128px, 240px"
                  priority
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mark/20 to-mark/5 font-display font-bold text-3xl text-mark">
                  {author.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")}
                </span>
              )}
            </div>

            {(author.email || author.website || author.link || author.twitter) && (
              <div className="mt-5 space-y-2">
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {author.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
                {author.link && author.link !== author.website && (
                  <a
                    href={author.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {author.link.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
                {author.twitter && (
                  <a
                    href={`https://x.com/${author.twitter.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors"
                  >
                    <span className="w-4 h-4 shrink-0 text-center font-medium">
                      𝕏
                    </span>
                    <span className="truncate">
                      @{author.twitter.replace(/^@/, "")}
                    </span>
                  </a>
                )}
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{author.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {author.role && (
              <span className="inline-block text-[11px] uppercase tracking-[0.14em] text-mark font-medium mb-3">
                {author.role}
              </span>
            )}

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight tracking-tight">
              {author.name}
            </h1>

            {author.excerpt && (
              <p className="mt-4 font-reading text-lg text-soft leading-relaxed">
                {author.excerpt}
              </p>
            )}

            {author.bio && (
              <div className="prose mt-8">
                {author.bio
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            )}

            {contributions.length > 0 && (
              <section className="mt-12 pt-8 border-t border-rule">
                <h2 className="font-display text-lg font-semibold text-ink mb-4">
                  Writing here
                </h2>
                <ul className="space-y-1">
                  {contributions.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/guest-writing/${post.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-3 border-b border-rule/50 hover:bg-stone/20 -mx-3 px-3 rounded-lg transition-colors"
                      >
                        <span className="font-medium text-ink group-hover:text-mark transition-colors">
                          {post.title}
                        </span>
                        <span className="text-xs text-soft shrink-0 tabular-nums">
                          {formatDate(post.createdAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-20 pt-10 border-t border-rule">
            <h2 className="font-display text-xl font-semibold text-ink mb-6">
              Other authors
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((a) => (
                <AuthorCard key={a.id} {...a} className="h-full" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
