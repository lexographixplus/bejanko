import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/shared/section";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { EssayCard } from "@/components/shared/cards";

type Essay = {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readingTime?: number | null;
  createdAt: Date | string;
};

export function RecentFeedSection({ essays }: { essays: Essay[] }) {
  return (
    <Section className="bg-stone/20">
      <ScrollReveal>
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
              Recent Writing
            </h2>
            <p className="mt-2 text-soft">Latest essays and long-form pieces.</p>
          </div>
          <Link
            href="/essays"
            className="hidden sm:inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors"
          >
            All essays
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>

      {essays.length === 0 ? (
        <p className="text-soft text-sm">No essays published yet. Check back soon.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured first essay — spans full left column */}
          <ScrollReveal>
            <EssayCard {...essays[0]} className="h-full" />
          </ScrollReveal>

          {/* Remaining essays stacked in right column */}
          {essays.length > 1 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {essays.slice(1).map((post, i) => (
                <ScrollReveal key={post.slug} delay={(i + 1) * 100}>
                  <EssayCard {...post} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 sm:hidden">
        <Link
          href="/essays"
          className="inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors"
        >
          View all essays
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
