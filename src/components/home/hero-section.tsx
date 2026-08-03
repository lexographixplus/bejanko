import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden grain">
      <div className="absolute inset-0 bg-gradient-to-b from-stone/40 via-transparent to-transparent pointer-events-none" />

      <div className="mx-auto max-w-[var(--shell)] px-6 py-24 md:py-36 lg:py-44">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-mark animate-hero-word" />
            <p className="text-mark font-medium text-xs tracking-[0.2em] uppercase animate-hero-word delay-100">
              Writer &middot; Thinker &middot; Creator
            </p>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-ink leading-[1.05] tracking-tight">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-hero-word delay-200">
              A writing space first,
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-soft animate-hero-word delay-300">
              a literary community
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-hero-word delay-400">
              second.
            </span>
          </h1>

          {/* Subline */}
          <p className="mt-8 text-soft text-lg md:text-xl max-w-lg leading-relaxed font-reading animate-hero-word delay-500">
            Essays, notes, and fragments on language, meaning, and the quiet
            work of paying attention.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4 animate-hero-word delay-600">
            <Link
              href="/essays"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-all hover:shadow-lg hover:shadow-mark/20"
            >
              Read Essays
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 hover:border-soft/30 transition-all"
            >
              About Me
            </Link>
          </div>
        </div>

        {/* Decorative line */}
        <div className="mt-16 md:mt-24">
          <div className="h-px bg-gradient-to-r from-mark via-rule to-transparent animate-hero-word delay-700" />
        </div>
      </div>
    </section>
  );
}
