"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, MailX, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import {
  importSubscribers,
  removeSubscriber,
  unsubscribeSubscriber,
} from "@/lib/actions/newsletter";
import type { ImportResult } from "@/lib/actions/newsletter";
import { ConfirmDialog } from "./confirm-dialog";
import { cn, formatDate } from "@/lib/utils";

type Status = "PENDING" | "CONFIRMED" | "UNSUBSCRIBED";

type Subscriber = {
  id: string;
  email: string;
  status: Status;
  source: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
};

const statusStyles: Record<Status, string> = {
  CONFIRMED: "bg-green-500/10 text-green-600 dark:text-green-400",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
  UNSUBSCRIBED: "bg-stone text-soft",
};

export function SubscribersManager({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [rawImport, setRawImport] = useState("");
  const [importReport, setImportReport] = useState<ImportResult | null>(null);

  const visible =
    filter === "ALL"
      ? subscribers
      : subscribers.filter((s) => s.status === filter);

  const counts = subscribers.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  function handleImport() {
    startTransition(async () => {
      try {
        const report = await importSubscribers(rawImport, { source: "csv" });
        setImportReport(report);
        setRawImport("");
        router.refresh();

        const touched = report.added + report.updated;
        if (touched === 0) {
          toast.info("No new addresses to add.");
        } else {
          toast.success(`Imported ${touched} subscriber${touched === 1 ? "" : "s"}.`);
        }
      } catch {
        toast.error("Could not import that list.");
      }
    });
  }

  function handleUnsubscribe(id: string) {
    startTransition(async () => {
      try {
        await unsubscribeSubscriber(id);
        router.refresh();
        toast.success("Marked unsubscribed.");
      } catch {
        toast.error("Could not update the subscriber.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await removeSubscriber(id);
        setDeleteId(null);
        router.refresh();
        toast.success("Subscriber deleted.");
      } catch {
        toast.error("Could not delete the subscriber.");
      }
    });
  }

  /** Exports the current filter as CSV, built client-side. */
  function exportCsv() {
    const rows = [
      ["email", "status", "source", "subscribed", "confirmed"],
      ...visible.map((s) => [
        s.email,
        s.status,
        s.source ?? "",
        new Date(s.createdAt).toISOString(),
        s.confirmedAt ? new Date(s.confirmedAt).toISOString() : "",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Subscribers
          </h1>
          <p className="text-soft text-sm mt-1">
            {counts.CONFIRMED ?? 0} confirmed
            {counts.PENDING ? ` · ${counts.PENDING} awaiting confirmation` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>

          {subscribers.length > 0 && (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {importOpen && (
        <div className="rounded-xl border border-rule bg-surface p-5 space-y-4">
          <div>
            <p className="font-display font-semibold text-ink">
              Import subscribers
            </p>
            <p className="text-sm text-soft mt-1 leading-relaxed">
              Upload a CSV or paste addresses below — one per line, or a column
              headed <code className="text-xs">email</code>. Imported addresses
              are marked confirmed, so only import lists where people already
              agreed to hear from you. Anyone who previously unsubscribed is
              skipped.
            </p>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setRawImport(await file.text());
                e.target.value = "";
              }}
              className="block w-full text-sm text-soft file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border file:border-rule file:bg-paper file:text-ink file:text-sm file:font-medium hover:file:bg-stone/50 file:cursor-pointer"
            />
          </label>

          <textarea
            rows={6}
            value={rawImport}
            onChange={(e) => setRawImport(e.target.value)}
            placeholder={"email\nreader@example.com\nanother@example.com"}
            className="w-full px-3.5 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm font-mono placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark resize-y"
          />

          {importReport && (
            <div className="rounded-lg border border-rule bg-paper p-3 text-sm">
              <p className="text-ink">
                Added {importReport.added} · Confirmed {importReport.updated} ·
                Skipped {importReport.skipped}
              </p>
              {importReport.invalid.length > 0 && (
                <p className="text-amber-600 mt-1 text-xs break-words">
                  Ignored invalid: {importReport.invalid.join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              disabled={isPending || !rawImport.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Import addresses
            </button>
            <button
              onClick={() => {
                setImportOpen(false);
                setRawImport("");
                setImportReport(null);
              }}
              className="px-4 py-2.5 text-sm text-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ALL", "CONFIRMED", "PENDING", "UNSUBSCRIBED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === s
                ? "bg-mark text-white"
                : "border border-rule text-soft hover:text-ink hover:bg-stone/50"
            )}
          >
            {s}
            {s !== "ALL" && counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-rule bg-surface overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-soft/40 mx-auto mb-3" />
            <p className="text-sm text-soft">
              {subscribers.length === 0
                ? "No subscribers yet. The signup form is in the footer and on the homepage."
                : "No subscribers with this status."}
            </p>
          </div>
        ) : (
          visible.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-4 p-4 border-b border-rule last:border-0 hover:bg-stone/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{sub.email}</p>
                <p className="text-xs text-soft mt-0.5">
                  {formatDate(sub.createdAt)}
                  {sub.source ? ` · via ${sub.source}` : ""}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                  statusStyles[sub.status]
                )}
              >
                {sub.status}
              </span>

              {sub.status !== "UNSUBSCRIBED" && (
                <button
                  onClick={() => handleUnsubscribe(sub.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-md text-soft hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors disabled:opacity-50"
                  title="Mark unsubscribed"
                  aria-label={`Unsubscribe ${sub.email}`}
                >
                  <MailX className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setDeleteId(sub.id)}
                disabled={isPending}
                className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                title="Delete"
                aria-label={`Delete ${sub.email}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete subscriber?"
        description="This removes them entirely. To stop emails but keep the record, use unsubscribe instead."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
