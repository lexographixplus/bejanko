"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createNote, updateNote, deleteNote, togglePublish } from "@/lib/actions/notes";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";
import { ContentEditor } from "./content-editor";

type Note = {
  id: string;
  title: string | null;
  slug: string;
  content: string;
  aside: string | null;
  published: boolean;
  createdAt: Date;
};

interface NotesManagerProps {
  notes: Note[];
}

type FormState = {
  title: string;
  content: string;
  aside: string;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  content: "",
  aside: "",
  published: false,
};

export function NotesManager({ notes }: NotesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = notes.filter((n) => {
    if (filter === "published" && !n.published) return false;
    if (filter === "draft" && n.published) return false;
    if (!search) return true;
    const haystack = (n.title ?? n.content).toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(note: Note) {
    setEditingId(note.id);
    setForm({
      title: note.title ?? "",
      content: note.content,
      aside: note.aside ?? "",
      published: note.published,
    });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.content.trim()) return;
    startTransition(async () => {
      if (editingId) {
        await updateNote(editingId, {
          title: form.title.trim() || undefined,
          content: form.content,
          aside: form.aside.trim() || undefined,
          published: form.published,
        });
      } else {
        await createNote({
          title: form.title.trim() || undefined,
          content: form.content,
          aside: form.aside.trim() || undefined,
          published: form.published,
        });
      }
      setSlideOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNote(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  function handleTogglePublish(id: string) {
    startTransition(async () => {
      await togglePublish(id);
      router.refresh();
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function wordCount(content: string) {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  function preview(note: Note) {
    if (note.title) return note.title;
    return note.content.slice(0, 50) + (note.content.length > 50 ? "..." : "");
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Notes</h1>
          <p className="text-soft text-sm mt-1">{notes.length} total notes</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-rule bg-surface text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
        </div>
        <div className="flex gap-1 bg-stone/30 rounded-lg p-1 w-fit">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                filter === f
                  ? "bg-surface text-ink shadow-sm"
                  : "text-soft hover:text-ink"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden",
          isPending && "opacity-60"
        )}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-soft text-sm">No notes found.</div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-4 p-4 hover:bg-stone/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{preview(note)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-soft">{formatDate(note.createdAt)}</span>
                  <span className="text-xs text-soft">{wordCount(note.content)} words</span>
                  <button
                    onClick={() => handleTogglePublish(note.id)}
                    disabled={isPending}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full transition-opacity hover:opacity-70",
                      note.published
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    )}
                  >
                    {note.published ? "Published" : "Draft"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(note)}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Edit"
                  disabled={isPending}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(note.id)}
                  className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete"
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editingId ? "Edit Note" : "New Note"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Title <span className="text-soft font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Leave blank to use content as title…"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <ContentEditor
              content={form.content}
              onChange={(v) => setForm((f) => ({ ...f, content: v }))}
              placeholder="Write your note here…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Aside</label>
            <textarea
              rows={2}
              placeholder="Optional margin note…"
              className={inputClass + " resize-y"}
              value={form.aside}
              onChange={(e) => setForm((f) => ({ ...f, aside: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
            />
            <span className="text-sm text-ink">Published</span>
          </label>

          <div className="flex gap-2 pt-2 border-t border-rule">
            <button
              onClick={handleSave}
              disabled={isPending || !form.content.trim()}
              className="px-5 py-2.5 bg-mark text-white rounded-lg text-sm font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Save Changes" : "Create Note"}
            </button>
            <button
              onClick={() => setSlideOpen(false)}
              className="px-5 py-2.5 border border-rule rounded-lg text-sm font-medium text-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </SlideOver>

      {/* Confirm delete */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete note?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
