import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Section } from "@/components/shared/section";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

type Essay = {
  title: string;
  slug: string;
  excerpt?: string | null;
  readingTime?: number | null;
};

export function StartHereSection({ essays }: { essays: Essay[] }) {
  if (essays.length === 0) return null;

  return (
    <Section>
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-mark" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
            Start Here
          </h2>
        </div>

        <p className="text-soft mb-10 max-w-xl">
          New around here? These essays are a good place to begin.
        </p>
      </ScrollReveal>

      <div className="space-y-1">
        {essays.map((essay, i) => (
          <ScrollReveal key={essay.slug} delay={i * 100}>
            <Link
              href={`/essays/${essay.slug}`}
              className="group flex items-start gap-6 py-5 border-b border-rule/50 hover:bg-stone/20 -mx-4 px-4 rounded-lg transition-colors"
            >
              <span className="font-display text-3xl font-bold text-rule group-hover:text-mark transition-colors tabular-nums pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-mark transition-colors">
                  {essay.title}
                </h3>
                <p className="mt-1 text-soft text-sm leading-relaxed">
                  {essay.excerpt}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0 text-sm text-soft">
                {essay.readingTime && <span>{essay.readingTime} min</span>}
                <ArrowRight className="w-4 h-4 text-rule group-hover:text-mark group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-8">
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
