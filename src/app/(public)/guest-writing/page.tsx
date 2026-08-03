import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GuestPostCard } from "@/components/shared/cards";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getPublishedGuestPosts } from "@/lib/actions/guest-posts";

export const metadata: Metadata = {
  title: "Guest Writing",
  description: "Contributions from guest writers. No account needed — just words.",
};

export default async function GuestWritingPage() {
  const posts = await getPublishedGuestPosts();

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Guest Writing"
        description="This space is open. These are contributions from guest writers."
        count={posts.length}
        countLabel="pieces"
      />

      {posts.length === 0 ? (
        <p className="mt-12 text-soft text-sm">No guest posts published yet.</p>
      ) : (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 80}>
              <GuestPostCard {...post} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* CTA Band */}
      <div className="mt-20 rounded-2xl bg-stone/40 border border-rule p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <PenLine className="w-5 h-5 text-mark" />
            <h3 className="font-display text-xl font-semibold text-ink">
              Want to contribute?
            </h3>
          </div>
          <p className="text-soft leading-relaxed">
            We welcome guest submissions from writers of all backgrounds. No
            account needed — just your words and an email address.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors shrink-0"
        >
          Submit a Piece
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
