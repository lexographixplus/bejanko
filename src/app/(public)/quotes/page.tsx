import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { QuoteCard } from "@/components/shared/cards";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getQuotes } from "@/lib/actions/quotes";

export const metadata: Metadata = {
  title: "Quotes",
  description: "A commonplace book of words that stay.",
};

export default async function QuotesPage() {
  const quotes = await getQuotes({ published: true });

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Quotes"
        description="A commonplace book. Words that stopped me, changed me, or simply stayed."
        count={quotes.length}
        countLabel="quotes"
      />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote, i) => (
          <ScrollReveal key={quote.id} delay={i * 80}>
            <QuoteCard {...quote} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
