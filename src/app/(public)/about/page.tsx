import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/shared/section";
import { getAuthors } from "@/lib/actions/authors";

export const metadata: Metadata = {
  title: "About",
  description: "About B.E. Janko Jnr — writer, thinker, builder of quiet digital spaces.",
};

export default async function AboutPage() {
  const authors = await getAuthors({ published: true });
  const author = authors[0];

  const displayName = author?.name ?? "B.E. Janko Jnr";
  const displayBio = author?.bio ?? author?.excerpt ?? null;
  const displayPhoto = author?.photo ?? null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-b from-stone/30 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-[var(--shell)] px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1fr,320px] gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-mark" />
                <p className="text-mark font-medium text-xs tracking-[0.2em] uppercase">
                  About
                </p>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.15] tracking-tight">
                {displayName}
              </h1>
              <div className="mt-6 prose max-w-xl">
                {displayBio ? (
                  <p>{displayBio}</p>
                ) : (
                  <>
                    <p>
                      I write essays, notes, and fragments about language, meaning,
                      and the quiet work of paying attention. This site is my primary
                      writing space — a place where long-form thinking lives alongside
                      shorter observations and the occasional borrowed quote.
                    </p>
                    <p>
                      I believe in the power of slow writing, careful reading, and the
                      kind of conversation that happens when you give people space to
                      think before they speak.
                    </p>
                    <p>
                      This site also hosts guest writing from contributors who have
                      something to say. No accounts, no friction — just words.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/essays"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-all hover:shadow-lg hover:shadow-mark/20"
                >
                  Read my essays
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
                >
                  Get in touch
                </Link>
              </div>
            </div>

            {displayPhoto && (
              <div className="hidden lg:block">
                <div className="relative w-72 h-80 rounded-2xl overflow-hidden shadow-2xl mx-auto">
                  <Image
                    src={displayPhoto}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile Link */}
      <Section className="border-t border-rule bg-surface/30">
        <div className="text-center max-w-md mx-auto">
          <h2 className="font-display text-xl font-semibold text-ink mb-3">
            Looking for my profile?
          </h2>
          <p className="text-soft text-sm mb-6">
            My full profile with contact details, bio, and more.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-mark hover:text-mark-hover text-sm font-medium transition-colors"
          >
            View full profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
