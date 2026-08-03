import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function GuestBandSection() {
  return (
    <section className="relative bg-ink text-paper overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5 dot-pattern text-white" />

      <div className="relative mx-auto max-w-[var(--shell)] px-6 py-20 md:py-28">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-6">
              <PenLine className="w-6 h-6 text-mark" />
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              Write With Us
            </h2>

            <p className="mt-4 text-paper/70 text-lg font-reading leading-relaxed max-w-md mx-auto">
              This space is open to guest writers. If you have something to say,
              we&apos;d love to read it. No account needed.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
              >
                Submit a Piece
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/guest-writing"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg text-paper font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Read Guest Writing
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 max-w-sm mx-auto">
              <p className="text-sm text-paper/60 mb-3">
                Or just follow along — new writing by email.
              </p>
              <NewsletterForm source="home" tone="dark" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
