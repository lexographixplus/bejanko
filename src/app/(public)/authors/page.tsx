import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AuthorCard } from "@/components/shared/author-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getAuthors } from "@/lib/actions/authors";

export const metadata: Metadata = {
  title: "Authors",
  description:
    "The people behind Mind Substances — writers, thinkers and contributors.",
};

export default async function AuthorsPage() {
  const authors = await getAuthors({ published: true });

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Authors"
        description="The people behind the writing here — and the guests who've joined them."
      />

      {authors.length === 0 ? (
        <p className="mt-12 text-soft text-sm rounded-xl border border-rule bg-surface p-6">
          No author profiles have been published yet.
        </p>
      ) : (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((author, i) => (
            <ScrollReveal key={author.id} delay={i * 100}>
              <AuthorCard {...author} className="h-full" />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
