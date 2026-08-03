import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, BookOpen, PenLine, ArrowRight, Quote, Trophy } from "lucide-react";
import { getAuthors } from "@/lib/actions/authors";
import { getSettings } from "@/lib/actions/settings";

export const metadata: Metadata = {
  title: "Profile",
  description: "B.E. Janko Jnr — writer, thinker, builder.",
};

export default async function ProfilePage() {
  const [authors, settings] = await Promise.all([
    getAuthors({ published: true }),
    getSettings(),
  ]);
  const author = authors[0];

  const displayName = author?.name ?? "B.E. Janko Jnr";
  const displayRole = author?.role ?? "Writer · Thinker · Creator";
  const displayExcerpt =
    author?.excerpt ??
    "I write about language, meaning, and the quiet work of paying attention. This site is my primary writing space.";
  const displayBio = author?.bio ?? null;
  const displayPhoto = author?.photo || settings.portraitUrl || null;

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
          {displayPhoto ? (
            <div className="relative w-32 h-40 rounded-xl overflow-hidden shadow-lg shrink-0">
              <Image
                src={displayPhoto}
                alt={displayName}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="w-32 h-40 rounded-xl bg-gradient-to-br from-mark/20 via-stone to-mark/5 flex items-center justify-center shrink-0 shadow-lg">
              <span className="font-display text-4xl font-bold text-mark/40">
                {displayName.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h1 className="font-display text-3xl font-bold text-ink">
              {displayName}
            </h1>
            <p className="text-mark font-medium text-sm mt-1">
              {displayRole}
            </p>
            <p className="mt-4 text-soft leading-relaxed">
              {displayExcerpt}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact
              </Link>
              <Link
                href="/essays"
                className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Essays
              </Link>
              {author?.link && (
                <a
                  href={author.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
                >
                  Website
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <section className="mb-12">
          <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-mark" />
            Bio
          </h2>
          <div className="prose">
            {displayBio ? (
              <p>{displayBio}</p>
            ) : (
              <>
                <p>
                  B.E. Janko Jnr is a writer whose work explores the intersections
                  of language, thought, and experience. Through essays, notes, and
                  guest collaborations, he builds a space where careful writing meets
                  open conversation.
                </p>
                <p>
                  His writing practice centers on long-form essays, shorter
                  observational notes, and a running commonplace book of quotes that
                  have shaped his thinking. He also runs regular writing contests to
                  encourage new voices.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Writing */}
        <section className="mb-12">
          <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-mark" />
            Writing
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Essays", href: "/essays", icon: BookOpen, desc: "Long-form thinking" },
              { label: "Notes", href: "/notes", icon: PenLine, desc: "Short fragments" },
              { label: "Quotes", href: "/quotes", icon: Quote, desc: "Words that stay" },
              { label: "Contests", href: "/contests", icon: Trophy, desc: "Writing challenges" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 p-4 rounded-xl border border-rule hover:border-mark/30 hover:bg-stone/20 transition-all"
              >
                <item.icon className="w-5 h-5 text-mark mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-ink group-hover:text-mark transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-soft mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-rule mt-0.5 group-hover:text-mark group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
