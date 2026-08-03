"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ExternalLink, Star } from "lucide-react";
import { createAuthor, updateAuthor, deleteAuthor } from "@/lib/actions/authors";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";
import { ContentEditor } from "./content-editor";
import { ImageUpload } from "./image-upload";

type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  excerpt: string | null;
  photo: string | null;
  role: string | null;
  link: string | null;
  published: boolean;
  featured: boolean;
  email: string | null;
  website: string | null;
  twitter: string | null;
};

interface AuthorsManagerProps {
  authors: Author[];
}

type FormState = {
  name: string;
  bio: string;
  excerpt: string;
  photo: string;
  role: string;
  link: string;
  published: boolean;
  featured: boolean;
  email: string;
  website: string;
  twitter: string;
};

const emptyForm: FormState = {
  name: "",
  bio: "",
  excerpt: "",
  photo: "",
  role: "",
  link: "",
  published: true,
  featured: false,
  email: "",
  website: "",
  twitter: "",
};

export function AuthorsManager({ authors }: AuthorsManagerProps) {
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

  function openEdit(author: Author) {
    setEditingId(author.id);
    setForm({
      name: author.name,
      bio: author.bio ?? "",
      excerpt: author.excerpt ?? "",
      photo: author.photo ?? "",
      role: author.role ?? "",
      link: author.link ?? "",
      published: author.published,
      featured: author.featured,
      email: author.email ?? "",
      website: author.website ?? "",
      twitter: author.twitter ?? "",
    });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      photo: form.photo.trim() || undefined,
      role: form.role.trim() || undefined,
      link: form.link.trim() || undefined,
      published: form.published,
      featured: form.featured,
      email: form.email.trim() || undefined,
      website: form.website.trim() || undefined,
      twitter: form.twitter.trim() || undefined,
    };

    startTransition(async () => {
      if (editingId) {
        await updateAuthor(editingId, payload);
      } else {
        await createAuthor(payload);
      }
      setSlideOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAuthor(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Author Profiles</h1>
          <p className="text-soft text-sm mt-1">Manage featured author profiles.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Author
        </button>
      </div>

      <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
        {authors.length === 0 ? (
          <p className="p-4 text-sm text-soft">No authors yet.</p>
        ) : (
          authors.map((author) => (
            <div
              key={author.id}
              className="flex items-center gap-4 p-4 hover:bg-stone/10 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-stone flex items-center justify-center shrink-0 overflow-hidden">
                {author.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-mark">
                    {author.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink flex items-center gap-1.5">
                  {author.name}
                  {author.featured && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" aria-label="Featured" />
                  )}
                </p>
                <p className="text-xs text-soft">{author.role ?? ""}</p>
                <span
                  className={
                    "mt-0.5 inline-block text-xs px-1.5 py-0.5 rounded-full " +
                    (author.published
                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")
                  }
                >
                  {author.published ? "Published" : "Draft"}
                </span>
              </div>
              {author.link && (
                <a
                  href={author.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Visit link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(author)}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Edit"
                  disabled={isPending}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(author.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                  title="Delete"
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
        title={editingId ? "Edit Author" : "Add Author"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
            <input
              type="text"
              placeholder="e.g. Guest Contributor, Fiction Writer"
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Excerpt</label>
            <textarea
              rows={2}
              placeholder="Short bio shown in listings…"
              className={inputClass + " resize-y"}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Bio</label>
            <ContentEditor
              content={form.bio}
              onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
              placeholder="Full biography…"
            />
          </div>

          <ImageUpload
            value={form.photo}
            onChange={(url) => setForm((f) => ({ ...f, photo: url }))}
            label="Photo"
            hint="Profile photo shown on About and Profile pages."
            aspect="portrait"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Website / Link</label>
            <input
              type="url"
              placeholder="https://…"
              className={inputClass}
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
          </div>

          <fieldset className="rounded-lg border border-rule p-4 space-y-4">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-soft">
              Public contacts
            </legend>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  X / Twitter
                </label>
                <input
                  type="text"
                  placeholder="handle"
                  className={inputClass}
                  value={form.twitter}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, twitter: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Website
              </label>
              <input
                type="url"
                placeholder="https://..."
                className={inputClass}
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>
          </fieldset>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
            />
            <span className="text-sm text-ink">
              Feature on homepage
              <span className="block text-xs text-soft">
                The homepage shows the first three featured authors.
              </span>
            </span>
          </label>

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
              disabled={isPending || !form.name.trim()}
              className="px-5 py-2.5 bg-mark text-white rounded-lg text-sm font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Save Changes" : "Add Author"}
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
        title="Delete author?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
