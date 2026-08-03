import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShoppingCart } from "lucide-react";
import { Section } from "@/components/shared/section";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { truncate, stripHtml } from "@/lib/utils";

type Book = {
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  bookAuthor?: string | null;
  year?: number | null;
  link?: string | null;
  buyLinks?: unknown;
};

export function FeaturedBookSection({ book }: { book: Book | null }) {
  if (!book) return null;

  const blurb =
    book.excerpt ||
    (book.content ? truncate(stripHtml(book.content), 220) : null);

  return (
    <Section>
      <ScrollReveal>
        <div className="rounded-2xl border border-rule/60 bg-surface overflow-hidden">
          <div className="grid md:grid-cols-[260px_1fr] gap-8 md:gap-10 p-6 sm:p-8 md:p-10">
            {/* Cover */}
            <Link
              href={`/books/${book.slug}`}
              className="group block w-40 md:w-full mx-auto md:mx-0 shrink-0"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-stone shadow-xl group-hover:shadow-2xl transition-shadow">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    width={260}
                    height={390}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-mark/20 to-mark/5 flex flex-col items-center justify-center gap-3 p-5 text-center">
                    <BookOpen className="w-7 h-7 text-mark/50" />
                    <span className="font-display text-sm text-mark/70 leading-tight">
                      {book.title}
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* Detail */}
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-px bg-mark" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-mark font-medium">
                  Featured Book
                </span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight">
                <Link
                  href={`/books/${book.slug}`}
                  className="hover:text-mark transition-colors"
                >
                  {book.title}
                </Link>
              </h2>

              {book.subtitle && (
                <p className="mt-1.5 font-reading text-lg text-soft leading-snug">
                  {book.subtitle}
                </p>
              )}

              {book.bookAuthor && (
                <p className="mt-3 text-sm text-soft">
                  by <span className="text-ink font-medium">{book.bookAuthor}</span>
                  {book.year && (
                    <span className="text-soft/60"> &middot; {book.year}</span>
                  )}
                </p>
              )}

              {blurb && (
                <p className="mt-4 text-soft font-reading leading-relaxed">
                  {blurb}
                </p>
              )}

              {/* Ordering happens on the book page, so both routes land there
                  rather than sending people straight to a retailer. */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/books/${book.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order a copy
                </Link>

                <Link
                  href={`/books/${book.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
                >
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
