import { getNotes } from "@/lib/actions/notes";
import { NotesManager } from "@/components/admin/notes-manager";

export default async function NotesPage() {
  const notes = await getNotes();
  return <NotesManager notes={notes} />;
}
