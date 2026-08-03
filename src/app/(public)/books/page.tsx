import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { BookCard } from "@/components/shared/cards";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getBooks } from "@/lib/actions/books";

export const metadata: Metadata = {
  title: "Books",
  description: "Books I've written and books I recommend.",
};

export default async function BooksPage() {
  const [mine, others] = await Promise.all([getBooks("MINE"), getBooks("OTHERS")]);

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Books"
        description="What I've written, and what I think you should read."
      />

      {/* My Books */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-mark" />
          Written by Janko
          <span className="text-sm font-normal text-soft">({mine.length})</span>
        </h2>
        {mine.length === 0 ? (
          <p className="text-soft text-sm">No books yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {mine.map((book, i) => (
              <ScrollReveal key={book.slug} delay={i * 100}>
                <BookCard {...book} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Recommendations */}
      <section className="mt-16">
        <h2 className="font-display text-xl font-semibold text-ink mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-mark" />
          Recommended Reading
          <span className="text-sm font-normal text-soft">({others.length})</span>
        </h2>
        {others.length === 0 ? (
          <p className="text-soft text-sm">No recommendations yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {others.map((book, i) => (
              <ScrollReveal key={book.slug} delay={i * 100}>
                <BookCard {...book} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
