import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarginColumn } from "@/components/shared/margin-column";
import { ReadingProgress } from "@/components/shared/reading-progress";
import { TableOfContents } from "@/components/shared/table-of-contents";
import { formatDate, buildToc } from "@/lib/utils";
import { getEssayBySlug } from "@/lib/actions/essays";
import { SITE_NAME, siteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEssayBySlug(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.excerpt || undefined,
    openGraph: {
      type: "article",
      title: data.title,
      description: data.excerpt || undefined,
      publishedTime: data.createdAt.toISOString(),
    },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getEssayBySlug(slug);
  if (!data || !data.published) notFound();

  const { prev, next, ...essay } = data;

  // Heading ids are injected here so the TOC anchors resolve — TipTap output
  // has none of its own.
  const { html: body, toc } = buildToc(essay.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: essay.title,
    description: essay.excerpt ?? undefined,
    image: essay.coverImage ?? undefined,
    datePublished: essay.createdAt.toISOString(),
    dateModified: essay.updatedAt.toISOString(),
    author: { "@type": "Person", name: SITE_NAME },
    publisher: { "@type": "Person", name: SITE_NAME },
    mainEntityOfPage: `${siteUrl()}/essays/${essay.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ReadingProgress />

      <article className="mx-auto max-w-[var(--shell)] px-6 py-12">
        {/* Header */}
        <header className="max-w-[var(--content)] mb-10">
          <Link
            href="/essays"
            className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All Essays
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-[1.15] tracking-tight">
            {essay.title}
          </h1>

          {essay.excerpt && (
            <p className="mt-4 text-soft text-lg font-reading leading-relaxed">
              {essay.excerpt}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4 text-sm text-soft">
            <time dateTime={essay.createdAt.toISOString()}>
              {formatDate(essay.createdAt)}
            </time>
            {essay.readingTime && (
              <>
                <span>&middot;</span>
                <span>{essay.readingTime} min read</span>
              </>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {essay.coverImage && (
          <div className="max-w-[var(--content)] mb-12 rounded-xl overflow-hidden">
            <Image
              src={essay.coverImage}
              alt={essay.title}
              width={720}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Body with Margin Column */}
        <div className="flex gap-[var(--gap)]">
          <MarginColumn
            date={essay.createdAt}
            type="Essay"
            readingTime={essay.readingTime}
            aside={essay.aside}
          />

          <div className="flex-1 min-w-0 max-w-[var(--content)]">
            {/* TOC */}
            <TableOfContents items={toc} />

            {/* Content */}
            <div
              className="prose essay-body"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>

        {/* Post Navigation */}
        <nav className="mt-16 pt-8 border-t border-rule max-w-[var(--content)]">
          <div className="flex justify-between gap-8">
            {prev ? (
              <Link
                href={`/essays/${prev.slug}`}
                className="group flex items-center gap-3 text-soft hover:text-mark transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <span className="text-xs uppercase tracking-wider block mb-1">Previous</span>
                  <span className="text-sm font-medium text-ink group-hover:text-mark transition-colors">
                    {prev.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/essays/${next.slug}`}
                className="group flex items-center gap-3 text-right text-soft hover:text-mark transition-colors"
              >
                <div>
                  <span className="text-xs uppercase tracking-wider block mb-1">Next</span>
                  <span className="text-sm font-medium text-ink group-hover:text-mark transition-colors">
                    {next.title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </article>
    </>
  );
}
