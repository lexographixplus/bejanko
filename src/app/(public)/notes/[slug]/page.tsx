import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarginColumn } from "@/components/shared/margin-column";
import { getNoteBySlug } from "@/lib/actions/notes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return {};

  return {
    title: note.title ?? "Note",
    openGraph: {
      type: "article",
      title: note.title ?? "Note",
      publishedTime: note.createdAt.toISOString(),
    },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note || !note.published) notFound();

  return (
    <article className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All Notes
      </Link>

      <div className="flex gap-[var(--gap)]">
        <MarginColumn
          date={note.createdAt}
          type="Note"
          aside={note.aside}
        />

        <div className="flex-1 min-w-0 max-w-[var(--content)]">
          {note.title && (
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-6">
              {note.title}
            </h1>
          )}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>
    </article>
  );
}
