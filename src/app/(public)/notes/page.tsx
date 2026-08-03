import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { NoteCard } from "@/components/shared/cards";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getNotes } from "@/lib/actions/notes";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short fragments, observations, and thoughts too brief for an essay.",
};

export default async function NotesPage() {
  const notes = await getNotes({ published: true });

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Notes"
        description="Short fragments, observations, and thoughts too brief for an essay."
        count={notes.length}
        countLabel="notes"
      />

      <div className="mt-10 max-w-2xl">
        {notes.map((note, i) => (
          <ScrollReveal key={note.slug} delay={i * 60}>
            <NoteCard {...note} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
