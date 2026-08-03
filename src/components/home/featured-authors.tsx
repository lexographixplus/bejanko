import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Section } from "@/components/shared/section";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { AuthorCard } from "@/components/shared/author-card";

type Author = {
  id: string;
  name: string;
  slug: string;
  role?: string | null;
  excerpt?: string | null;
  bio?: string | null;
  photo?: string | null;
};

export function FeaturedAuthorsSection({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  return (
    <Section className="bg-stone/20">
      <ScrollReveal>
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-mark" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
                Featured Authors
              </h2>
            </div>
            <p className="text-soft">The people behind the writing here.</p>
          </div>
          <Link
            href="/authors"
            className="hidden sm:inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors shrink-0"
          >
            All authors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>

      {/* Three across on desktop, as requested; stacks down gracefully. */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {authors.map((author, i) => (
          <ScrollReveal key={author.id} delay={i * 100}>
            <AuthorCard {...author} className="h-full" />
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors"
        >
          View all authors
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
