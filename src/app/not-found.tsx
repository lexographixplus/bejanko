import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const suggestions = [
  { label: "Essays", href: "/essays", hint: "Long-form pieces" },
  { label: "Notes", href: "/notes", hint: "Shorter fragments" },
  { label: "Guest Writing", href: "/guest-writing", hint: "Words from others" },
  { label: "Contests", href: "/contests", hint: "Open calls" },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[var(--shell)] px-6 py-24 md:py-32">
          <div className="max-w-xl">
            <p className="font-display text-7xl md:text-8xl font-bold text-rule leading-none tabular-nums">
              404
            </p>

            <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-ink">
              This page doesn&apos;t exist
            </h1>
            <p className="mt-3 text-soft text-lg font-reading leading-relaxed">
              The link may be old, or the piece may have been unpublished. Either
              way, there is plenty else to read.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-2">
              {suggestions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-rule bg-surface hover:border-mark/40 hover:bg-stone/30 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink group-hover:text-mark transition-colors">
                      {item.label}
                    </span>
                    <span className="block text-xs text-soft mt-0.5">
                      {item.hint}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-rule group-hover:text-mark group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors"
            >
              Back to the homepage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
