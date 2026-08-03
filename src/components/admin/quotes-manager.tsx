"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { createQuote, updateQuote, deleteQuote } from "@/lib/actions/quotes";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";

type Quote = {
  id: string;
  content: string;
  source: string | null;
  published: boolean;
  createdAt: Date;
};

interface QuotesManagerProps {
  quotes: Quote[];
}

export function QuotesManager({ quotes }: QuotesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Inline new-quote form state
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newPublished, setNewPublished] = useState(true);

  // SlideOver edit state
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  // Confirm delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleCreate() {
    if (!newContent.trim()) return;
    startTransition(async () => {
      await createQuote({
        content: newContent.trim(),
        source: newSource.trim() || undefined,
        published: newPublished,
      });
      setNewContent("");
      setNewSource("");
      setNewPublished(true);
      setShowNew(false);
      router.refresh();
    });
  }

  function openEdit(quote: Quote) {
    setEditingQuote(quote);
    setEditContent(quote.content);
    setEditSource(quote.source ?? "");
    setEditPublished(quote.published);
    setSlideOpen(true);
  }

  function handleUpdate() {
    if (!editingQuote || !editContent.trim()) return;
    startTransition(async () => {
      await updateQuote(editingQuote.id, {
        content: editContent.trim(),
        source: editSource.trim() || undefined,
        published: editPublished,
      });
      setSlideOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteQuote(id);
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
          <h1 className="font-display text-2xl font-bold text-ink">Quotes</h1>
          <p className="text-soft text-sm mt-1">{quotes.length} quotes</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Quote
        </button>
      </div>

      {/* Inline new-quote form */}
      {showNew && (
        <div className="rounded-xl border border-mark/30 bg-surface p-5 space-y-4">
          <textarea
            rows={3}
            placeholder="The quote…"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark font-reading italic resize-y"
          />
          <input
            type="text"
            placeholder="Source / Attribution"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newPublished}
              onChange={(e) => setNewPublished(e.target.checked)}
              className="w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
            />
            <span className="text-sm text-ink">Publish immediately</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={isPending || !newContent.trim()}
              className="px-4 py-2 bg-mark text-white rounded-lg text-xs font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Quote"}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 border border-rule rounded-lg text-xs font-medium text-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="rounded-xl border border-rule bg-surface p-5 hover:shadow-sm transition-shadow"
          >
            <blockquote className="font-reading text-ink italic leading-relaxed">
              &ldquo;{quote.content}&rdquo;
            </blockquote>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-soft">
                <span className="w-4 h-px bg-mark" />
                {quote.source ?? "Unknown"}
                <span className="text-soft/50">&middot;</span>
                <span className="text-xs">
                  {new Date(quote.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={
                    "ml-1 text-xs px-1.5 py-0.5 rounded-full " +
                    (quote.published
                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")
                  }
                >
                  {quote.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(quote)}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(quote.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Edit Quote"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="The quote text…"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={inputClass + " font-reading italic resize-y"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Source / Attribution</label>
            <input
              type="text"
              placeholder="Author or source"
              value={editSource}
              onChange={(e) => setEditSource(e.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editPublished}
              onChange={(e) => setEditPublished(e.target.checked)}
              className="w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
            />
            <span className="text-sm text-ink">Published</span>
          </label>

          <div className="flex gap-2 pt-2 border-t border-rule">
            <button
              onClick={handleUpdate}
              disabled={isPending || !editContent.trim()}
              className="px-5 py-2.5 bg-mark text-white rounded-lg text-sm font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Changes"}
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
        title="Delete quote?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
