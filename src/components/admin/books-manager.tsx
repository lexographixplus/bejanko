"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, GripVertical, Star, X } from "lucide-react";
import { createBook, updateBook, deleteBook } from "@/lib/actions/books";
import { parseBuyLinks, type BuyLink } from "@/lib/books";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";
import { ImageUpload } from "./image-upload";

type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  bookAuthor: string | null;
  year: number | null;
  shelf: "MINE" | "OTHERS";
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  link: string | null;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  publisher: string | null;
  isbn: string | null;
  pages: number | null;
  format: string | null;
  price: string | null;
  buyLinks: unknown;
};

interface BooksManagerProps {
  mine: Book[];
  others: Book[];
}

type FormState = {
  title: string;
  subtitle: string;
  bookAuthor: string;
  year: string;
  excerpt: string;
  content: string;
  coverImage: string;
  link: string;
  shelf: "MINE" | "OTHERS";
  published: boolean;
  featured: boolean;
  publisher: string;
  isbn: string;
  pages: string;
  format: string;
  price: string;
  buyLinks: BuyLink[];
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  bookAuthor: "",
  year: "",
  excerpt: "",
  content: "",
  coverImage: "",
  link: "",
  shelf: "OTHERS",
  published: true,
  featured: false,
  publisher: "",
  isbn: "",
  pages: "",
  format: "",
  price: "",
  buyLinks: [],
};

/** Blank string fields must be sent as null so they actually clear. */
const orNull = (value: string) => (value.trim() ? value.trim() : null);
const numOrNull = (value: string) => {
  const n = parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : null;
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
        <p className="font-medium text-sm text-ink flex items-center gap-1.5">
          {book.title}
          {book.featured && (
            <Star
              className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0"
              aria-label="Featured"
            />
          )}
        </p>
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
      subtitle: book.subtitle ?? "",
      bookAuthor: book.bookAuthor ?? "",
      year: book.year != null ? String(book.year) : "",
      excerpt: book.excerpt ?? "",
      content: book.content ?? "",
      coverImage: book.coverImage ?? "",
      link: book.link ?? "",
      shelf: book.shelf,
      published: book.published,
      featured: book.featured,
      publisher: book.publisher ?? "",
      isbn: book.isbn ?? "",
      pages: book.pages != null ? String(book.pages) : "",
      format: book.format ?? "",
      price: book.price ?? "",
      buyLinks: parseBuyLinks(book.buyLinks),
    });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      subtitle: orNull(form.subtitle),
      bookAuthor: form.bookAuthor.trim() || undefined,
      year: numOrNull(form.year),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      link: form.link.trim() || undefined,
      shelf: form.shelf,
      published: form.published,
      featured: form.featured,
      publisher: orNull(form.publisher),
      isbn: orNull(form.isbn),
      pages: numOrNull(form.pages),
      format: orNull(form.format),
      price: orNull(form.price),
      buyLinks: form.buyLinks.filter((l) => l.url.trim()),
    };

    startTransition(async () => {
      if (editingId) {
        await updateBook(editingId, payload);
      } else {
        await createBook(payload);
      }
      setSlideOpen(false);
      router.refresh();
    });
  }

  function setBuyLink(index: number, patch: Partial<BuyLink>) {
    setForm((f) => ({
      ...f,
      buyLinks: f.buyLinks.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              placeholder="Optional subtitle"
              className={inputClass}
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Full description
            </label>
            <textarea
              rows={6}
              placeholder="The long description shown on the book page. Basic HTML is supported."
              className={inputClass + " resize-y"}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            label="Cover Image"
            hint="Book cover displayed on the shelf."
            aspect="portrait"
          />

          {/* Publication details */}
          <fieldset className="rounded-lg border border-rule p-4 space-y-4">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-soft">
              Publication details
            </legend>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Publisher
                </label>
                <input
                  type="text"
                  placeholder="Publisher"
                  className={inputClass}
                  value={form.publisher}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, publisher: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  ISBN
                </label>
                <input
                  type="text"
                  placeholder="978-..."
                  className={inputClass}
                  value={form.isbn}
                  onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Pages
                </label>
                <input
                  type="number"
                  placeholder="320"
                  className={inputClass}
                  value={form.pages}
                  onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Format
                </label>
                <input
                  type="text"
                  placeholder="Paperback"
                  className={inputClass}
                  value={form.format}
                  onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="19.99"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>
          </fieldset>

          {/* Where to buy */}
          <fieldset className="rounded-lg border border-rule p-4 space-y-3">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-soft">
              Where to buy
            </legend>

            {form.buyLinks.length === 0 && (
              <p className="text-xs text-soft">
                No retailers yet. Add one, or leave this empty and use the fallback
                link below.
              </p>
            )}

            {form.buyLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Amazon"
                  aria-label={`Retailer name ${i + 1}`}
                  className={inputClass + " w-1/3"}
                  value={link.label}
                  onChange={(e) => setBuyLink(i, { label: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="https://..."
                  aria-label={`Retailer URL ${i + 1}`}
                  className={inputClass + " flex-1"}
                  value={link.url}
                  onChange={(e) => setBuyLink(i, { url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      buyLinks: f.buyLinks.filter((_, j) => j !== i),
                    }))
                  }
                  className="p-2.5 text-soft hover:text-red-500 transition-colors shrink-0"
                  aria-label={`Remove retailer ${i + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  buyLinks: [...f.buyLinks, { label: "", url: "" }],
                }))
              }
              className="inline-flex items-center gap-1.5 text-sm text-mark hover:text-mark-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add retailer
            </button>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Fallback link
            </label>
            <input
              type="url"
              placeholder="https://..."
              className={inputClass}
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
            <p className="mt-1 text-xs text-soft">
              Used only when no retailers are listed above.
            </p>
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

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
                className="w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
              />
              <span className="text-sm text-ink">Published</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
              />
              <span className="text-sm text-ink">
                Feature on homepage
                <span className="block text-xs text-soft">
                  Replaces any other featured book.
                </span>
              </span>
            </label>
          </div>

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
