"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { createBook, updateBook, deleteBook } from "@/lib/actions/books";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";
import { ImageUpload } from "./image-upload";

type Book = {
  id: string;
  title: string;
  bookAuthor: string | null;
  year: number | null;
  shelf: "MINE" | "OTHERS";
  excerpt: string | null;
  coverImage: string | null;
  link: string | null;
  published: boolean;
  sortOrder: number;
};

interface BooksManagerProps {
  mine: Book[];
  others: Book[];
}

type FormState = {
  title: string;
  bookAuthor: string;
  year: string;
  excerpt: string;
  coverImage: string;
  link: string;
  shelf: "MINE" | "OTHERS";
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  bookAuthor: "",
  year: "",
  excerpt: "",
  coverImage: "",
  link: "",
  shelf: "OTHERS",
  published: true,
};

function BookRow({
  book,
  onEdit,
  onDelete,
  isPending,
}: {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const isMine = book.shelf === "MINE";
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-stone/10 transition-colors">
      <GripVertical className="w-4 h-4 text-rule cursor-grab" />
      <div
        className={`w-10 h-14 rounded shrink-0 ${
          isMine
            ? "bg-gradient-to-br from-mark/20 to-mark/5"
            : "bg-gradient-to-br from-stone to-stone/50"
        }`}
      />
      <div className="flex-1">
        <p className="font-medium text-sm text-ink">{book.title}</p>
        <p className="text-xs text-soft">
          {book.bookAuthor ?? "Unknown"}
          {book.year ? ` \u00b7 ${book.year}` : ""}
        </p>
        <span
          className={
            "mt-0.5 inline-block text-xs px-1.5 py-0.5 rounded-full " +
            (book.published
              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")
          }
        >
          {book.published ? "Published" : "Draft"}
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(book)}
          className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
          title="Edit"
          disabled={isPending}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(book.id)}
          disabled={isPending}
          className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function BooksManager({ mine, others }: BooksManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(book: Book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      bookAuthor: book.bookAuthor ?? "",
      year: book.year != null ? String(book.year) : "",
      excerpt: book.excerpt ?? "",
      coverImage: book.coverImage ?? "",
      link: book.link ?? "",
      shelf: book.shelf,
      published: book.published,
    });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const yearNum = form.year.trim() ? parseInt(form.year.trim(), 10) : undefined;

    startTransition(async () => {
      if (editingId) {
        await updateBook(editingId, {
          title: form.title.trim(),
          bookAuthor: form.bookAuthor.trim() || undefined,
          year: yearNum,
          excerpt: form.excerpt.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          link: form.link.trim() || undefined,
          shelf: form.shelf,
          published: form.published,
        });
      } else {
        await createBook({
          title: form.title.trim(),
          bookAuthor: form.bookAuthor.trim() || undefined,
          year: yearNum,
          excerpt: form.excerpt.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          link: form.link.trim() || undefined,
          shelf: form.shelf,
          published: form.published,
        });
      }
      setSlideOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBook(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  function requestDelete(id: string) {
    setDeleteId(id);
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Books</h1>
          <p className="text-soft text-sm mt-1">
            {mine.length + others.length} books on the shelf
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* My Books */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-3">
          <span className="w-6 h-px bg-mark" />
          Written by Janko
        </h2>
        <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
          {mine.length === 0 ? (
            <p className="p-4 text-sm text-soft">No books yet.</p>
          ) : (
            mine.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                onEdit={openEdit}
                onDelete={requestDelete}
                isPending={isPending}
              />
            ))
          )}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-3">
          <span className="w-6 h-px bg-mark" />
          Recommended Reading
        </h2>
        <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
          {others.length === 0 ? (
            <p className="p-4 text-sm text-soft">No books yet.</p>
          ) : (
            others.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                onEdit={openEdit}
                onDelete={requestDelete}
                isPending={isPending}
              />
            ))
          )}
        </div>
      </section>

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editingId ? "Edit Book" : "Add Book"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Book title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Author</label>
              <input
                type="text"
                placeholder="Book author"
                className={inputClass}
                value={form.bookAuthor}
                onChange={(e) => setForm((f) => ({ ...f, bookAuthor: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Year</label>
              <input
                type="number"
                placeholder="2024"
                className={inputClass}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Excerpt / Notes</label>
            <textarea
              rows={3}
              placeholder="A short description or your thoughts…"
              className={inputClass + " resize-y"}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            label="Cover Image"
            hint="Book cover displayed on the shelf."
            aspect="portrait"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Link</label>
            <input
              type="url"
              placeholder="https://…"
              className={inputClass}
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Shelf</label>
            <select
              className={inputClass}
              value={form.shelf}
              onChange={(e) =>
                setForm((f) => ({ ...f, shelf: e.target.value as "MINE" | "OTHERS" }))
              }
            >
              <option value="MINE">Written by Janko (MINE)</option>
              <option value="OTHERS">Recommended Reading (OTHERS)</option>
            </select>
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
              disabled={isPending || !form.title.trim()}
              className="px-5 py-2.5 bg-mark text-white rounded-lg text-sm font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Save Changes" : "Add Book"}
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
        title="Delete book?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
