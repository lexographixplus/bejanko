"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Trash2, Mail, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { deleteDownload } from "@/lib/actions/downloads";
import { ConfirmDialog } from "./confirm-dialog";
import { cn, formatDate } from "@/lib/utils";

type Claim = {
  id: string;
  email: string;
  subscribed: boolean;
  downloadCount: number;
  createdAt: Date;
  book: { title: string; slug: string };
};

type Stat = {
  bookId: string;
  title: string;
  slug: string;
  claims: number;
  downloads: number;
};

export function DownloadsManager({
  claims,
  stats,
}: {
  claims: Claim[];
  stats: Stat[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bookFilter, setBookFilter] = useState<string>("all");

  const visible =
    bookFilter === "all"
      ? claims
      : claims.filter((c) => c.book.slug === bookFilter);

  const subscribedCount = claims.filter((c) => c.subscribed).length;

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteDownload(id);
        setDeleteId(null);
        router.refresh();
        toast.success("Claim removed.");
      } catch {
        toast.error("Could not remove the claim.");
      }
    });
  }

  function exportCsv() {
    const rows = [
      ["email", "book", "subscribed", "downloads", "claimed"],
      ...visible.map((c) => [
        c.email,
        c.book.title,
        c.subscribed ? "yes" : "no",
        String(c.downloadCount),
        new Date(c.createdAt).toISOString(),
      ]),
    ];

    const csv = rows
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-downloads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Downloads</h1>
          <p className="text-soft text-sm mt-1">
            {claims.length} {claims.length === 1 ? "claim" : "claims"}
            {claims.length > 0 && ` · ${subscribedCount} joined the newsletter`}
          </p>
        </div>

        {claims.length > 0 && (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Per-book totals — which giveaway actually pulled. */}
      {stats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Link
              key={stat.bookId}
              href={`/books/${stat.slug}`}
              className="group rounded-xl border border-rule bg-surface p-4 hover:border-mark/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-mark shrink-0" />
                <p className="text-sm font-medium text-ink truncate group-hover:text-mark transition-colors">
                  {stat.title}
                </p>
              </div>
              <p className="font-display text-2xl font-bold text-ink tabular-nums">
                {stat.claims}
              </p>
              <p className="text-xs text-soft mt-0.5">
                {stat.claims === 1 ? "reader" : "readers"} ·{" "}
                {stat.downloads} {stat.downloads === 1 ? "download" : "downloads"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {stats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBookFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              bookFilter === "all"
                ? "bg-mark text-white"
                : "border border-rule text-soft hover:text-ink hover:bg-stone/50"
            )}
          >
            All
          </button>
          {stats.map((stat) => (
            <button
              key={stat.bookId}
              onClick={() => setBookFilter(stat.slug)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                bookFilter === stat.slug
                  ? "bg-mark text-white"
                  : "border border-rule text-soft hover:text-ink hover:bg-stone/50"
              )}
            >
              {stat.title}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-rule bg-surface overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-soft text-center">
            {claims.length === 0
              ? "No claims yet. Attach a file to a book and switch the giveaway on."
              : "No claims for this book."}
          </p>
        ) : (
          visible.map((claim) => (
            <div
              key={claim.id}
              className="flex items-center gap-4 p-4 border-b border-rule last:border-0 hover:bg-stone/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-mark/10 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-mark" />
              </div>

              <div className="flex-1 min-w-0">
                <a
                  href={`mailto:${claim.email}`}
                  className="text-sm font-medium text-ink hover:text-mark transition-colors truncate block"
                >
                  {claim.email}
                </a>
                <p className="text-xs text-soft truncate">
                  {claim.book.title} · {formatDate(claim.createdAt)}
                </p>
              </div>

              {claim.subscribed && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 shrink-0"
                  title="Also joined the newsletter"
                >
                  <Mail className="w-3 h-3" />
                  Subscribed
                </span>
              )}

              <span
                className="text-xs text-soft tabular-nums shrink-0"
                title="Times the file was fetched"
              >
                {claim.downloadCount}&times;
              </span>

              <button
                onClick={() => setDeleteId(claim.id)}
                disabled={isPending}
                className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50 shrink-0"
                aria-label="Remove claim"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Remove this claim?"
        description="Their download link stops working. This does not unsubscribe them — do that from Subscribers."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
