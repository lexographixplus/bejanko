import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarginColumn, MobileMeta } from "@/components/shared/margin-column";
import { getGuestPostBySlug } from "@/lib/actions/guest-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getGuestPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  };
}

export default async function GuestPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getGuestPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <Link
        href="/guest-writing"
        className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All Guest Writing
      </Link>

      <div className="flex flex-col lg:flex-row gap-[var(--gap)]">
        <MarginColumn
          date={post.createdAt}
          type="Guest"
        />

        <div className="flex-1 min-w-0 max-w-[var(--content)]">
          <MobileMeta date={post.createdAt} type="Guest" />

          {/* Guest Badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-xs font-medium text-mark bg-mark/10 px-3 py-1 rounded-full">
              Guest Writer
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
            {post.title}
          </h1>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Contributor Box */}
          <div className="mt-12 pt-8 border-t border-rule">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mark/20 to-mark/5 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-mark text-lg">
                  {post.contributorName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-display font-semibold text-ink">
                  {post.contributorName}
                </p>
                {post.contributorBio && (
                  <p className="text-sm text-soft mt-1 leading-relaxed">
                    {post.contributorBio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
