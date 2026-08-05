import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { getBookBySlug, getPublishedBooks } from "@/lib/actions/books";
import { parseBuyLinks, parseBookFiles } from "@/lib/books";
import { BookCard } from "@/components/shared/cards";
import { BookOrderForm } from "@/components/shared/book-order-form";
import { BookDownloadForm } from "@/components/shared/book-download-form";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { buildToc, truncate, stripHtml } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book || !book.published) return {};

  const description =
    book.excerpt ||
    (book.content ? truncate(stripHtml(book.content), 160) : undefined);

  return {
    title: book.title,
    description,
    openGraph: {
      type: "book",
      title: book.title,
      description,
      images: book.coverImage ? [book.coverImage] : undefined,
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book || !book.published) notFound();

  const files = parseBookFiles(book.files);
  // A giveaway needs both the switch on and something to hand over.
  const giveawayLive = book.downloadOpen && files.length > 0;

  const buyLinks = parseBuyLinks(book.buyLinks);
  // The legacy single `link` field still counts as a place to buy or read.
  const links = buyLinks.length
    ? buyLinks
    : book.link
      ? [{ label: "View book", url: book.link }]
      : [];

  const { html: description } = book.content
    ? buildToc(book.content)
    : { html: "" };

  const facts = [
    book.bookAuthor && { label: "Author", value: book.bookAuthor },
    book.publisher && { label: "Publisher", value: book.publisher },
    book.year && { label: "Published", value: String(book.year) },
    book.pages && { label: "Pages", value: String(book.pages) },
    book.format && { label: "Format", value: book.format },
    book.isbn && { label: "ISBN", value: book.isbn },
    book.price && { label: "Price", value: book.price },
  ].filter(Boolean) as { label: string; value: string }[];

  const related = (await getPublishedBooks(book.shelf))
    .filter((b) => b.id !== book.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.bookAuthor || SITE_NAME },
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.publisher ? { publisher: book.publisher } : {}),
    ...(book.year ? { datePublished: String(book.year) } : {}),
    ...(book.coverImage ? { image: book.coverImage } : {}),
    ...(book.excerpt ? { description: book.excerpt } : {}),
    url: `${siteUrl()}/books/${book.slug}`,
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
          href="/books"
          className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All Books
        </Link>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-14">
          {/* Cover + buying */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="w-44 lg:w-full mx-auto lg:mx-0 aspect-[2/3] rounded-xl overflow-hidden bg-stone shadow-xl">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  width={280}
                  height={420}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-mark/20 to-mark/5 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <BookOpen className="w-8 h-8 text-mark/50" />
                  <span className="font-display text-sm text-mark/70 leading-tight">
                    {book.title}
                  </span>
                </div>
              )}
            </div>

            {/* While a giveaway runs, the free download leads and ordering a
                physical copy steps back. Otherwise ordering is the main path. */}
            <div className="mt-6 space-y-4">
              {giveawayLive ? (
                <>
                  <BookDownloadForm
                    slug={book.slug}
                    title={book.title}
                    files={files}
                  />
                  <details className="group">
                    <summary className="text-sm text-soft hover:text-mark transition-colors cursor-pointer list-none">
                      Prefer a physical copy?
                    </summary>
                    <div className="mt-3">
                      <BookOrderForm
                        slug={book.slug}
                        title={book.title}
                        price={book.price}
                        format={book.format}
                      />
                    </div>
                  </details>
                </>
              ) : (
                <BookOrderForm
                  slug={book.slug}
                  title={book.title}
                  price={book.price}
                  format={book.format}
                />
              )}
            </div>

            {links.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-2">
                  Or find it at
                </p>
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-5 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {facts.length > 0 && (
              <dl className="mt-6 rounded-xl border border-rule bg-surface p-5 space-y-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex justify-between gap-4 text-sm">
                    <dt className="text-soft shrink-0">{fact.label}</dt>
                    <dd className="text-ink text-right font-medium break-words min-w-0">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Description */}
          <div className="min-w-0">
            <span className="inline-block text-[11px] uppercase tracking-[0.14em] text-mark font-medium mb-3">
              {book.shelf === "MINE" ? "Written by Janko" : "Recommended reading"}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight tracking-tight">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="mt-2 font-reading text-xl text-soft leading-snug">
                {book.subtitle}
              </p>
            )}

            {book.bookAuthor && (
              <p className="mt-4 text-soft">
                by <span className="text-ink font-medium">{book.bookAuthor}</span>
                {book.year && <span className="text-soft/70"> · {book.year}</span>}
              </p>
            )}

            {book.excerpt && (
              <p className="mt-6 font-reading text-lg text-soft leading-relaxed">
                {book.excerpt}
              </p>
            )}

            {description ? (
              <div
                className="prose mt-8"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              !book.excerpt && (
                <p className="mt-8 text-soft">
                  A fuller description of this book is on the way.
                </p>
              )
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-rule">
            <h2 className="font-display text-xl font-semibold text-ink mb-6">
              {book.shelf === "MINE" ? "More from Janko" : "More recommendations"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((b) => (
                <BookCard key={b.id} {...b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
