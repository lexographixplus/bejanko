"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Send,
  Star,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createEssay,
  updateEssay,
  deleteEssay,
  togglePublish,
  toggleStartHere,
} from "@/lib/actions/essays";
import { notifySubscribers } from "@/lib/actions/newsletter";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";
import { ContentEditor } from "./content-editor";
import { ImageUpload } from "./image-upload";

type Essay = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  aside: string | null;
  published: boolean;
  notifiedAt: Date | null;
  startHere: boolean;
  readingTime: number | null;
  createdAt: Date;
};

interface EssaysManagerProps {
  essays: Essay[];
}

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  aside: string;
  startHere: boolean;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  aside: "",
  startHere: false,
  published: false,
};

export function EssaysManager({ essays }: EssaysManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifyId, setNotifyId] = useState<string | null>(null);

  const filtered = essays.filter((e) => {
    if (filter === "published" && !e.published) return false;
    if (filter === "draft" && e.published) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(essay: Essay) {
    setEditingId(essay.id);
    setForm({
      title: essay.title,
      excerpt: essay.excerpt ?? "",
      content: essay.content,
      coverImage: essay.coverImage ?? "",
      aside: essay.aside ?? "",
      startHere: essay.startHere,
      published: essay.published,
    });
    setSlideOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    startTransition(async () => {
      if (editingId) {
        await updateEssay(editingId, {
          title: form.title.trim(),
          excerpt: form.excerpt.trim() || undefined,
          content: form.content,
          coverImage: form.coverImage.trim() || undefined,
          aside: form.aside.trim() || undefined,
          startHere: form.startHere,
          published: form.published,
        });
      } else {
        await createEssay({
          title: form.title.trim(),
          excerpt: form.excerpt.trim() || undefined,
          content: form.content,
          coverImage: form.coverImage.trim() || undefined,
          aside: form.aside.trim() || undefined,
          startHere: form.startHere,
          published: form.published,
        });
      }
      setSlideOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEssay(id);
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

  function handleNotify(id: string) {
    const essay = essays.find((e) => e.id === id);
    const resend = Boolean(essay?.notifiedAt);

    startTransition(async () => {
      try {
        const result = await notifySubscribers("essay", id, { resend });
        setNotifyId(null);
        router.refresh();

        if (result.total === 0) {
          toast.info("No confirmed subscribers to email yet.");
        } else if (result.failed > 0) {
          toast.warning(
            `Sent to ${result.sent} of ${result.total}. ${result.failed} failed.`
          );
        } else {
          toast.success(`Emailed ${result.sent} subscriber${result.sent === 1 ? "" : "s"}.`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not email subscribers."
        );
      }
    });
  }

  function handleToggleStartHere(id: string) {
    startTransition(async () => {
      await toggleStartHere(id);
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

  function field(key: keyof FormState) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Essays</h1>
          <p className="text-soft text-sm mt-1">{essays.length} total essays</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Essay
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          <input
            type="text"
            placeholder="Search essays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-rule bg-surface text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
        </div>
        <div className="flex gap-1 bg-stone/30 rounded-lg p-1">
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

      {/* Table */}
      <div className="rounded-xl border border-rule bg-surface overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rule bg-stone/20">
              <th className="text-left text-xs font-medium text-soft px-4 py-3">Title</th>
              <th className="text-left text-xs font-medium text-soft px-4 py-3 hidden md:table-cell">Status</th>
              <th className="text-left text-xs font-medium text-soft px-4 py-3 hidden sm:table-cell">Date</th>
              <th className="text-left text-xs font-medium text-soft px-4 py-3 hidden lg:table-cell">Reading Time</th>
              <th className="text-right text-xs font-medium text-soft px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filtered.map((essay) => (
              <tr
                key={essay.id}
                className={cn(
                  "hover:bg-stone/10 transition-colors",
                  isPending && "opacity-60"
                )}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStartHere(essay.id)}
                      title={essay.startHere ? "Remove from Start Here" : "Add to Start Here"}
                      className="shrink-0"
                      disabled={isPending}
                    >
                      <Star
                        className={cn(
                          "w-3.5 h-3.5 transition-colors",
                          essay.startHere
                            ? "text-amber-500 fill-amber-500"
                            : "text-rule hover:text-amber-400"
                        )}
                      />
                    </button>
                    <span className="font-medium text-sm text-ink">
                      {essay.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <button
                    onClick={() => handleTogglePublish(essay.id)}
                    disabled={isPending}
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-70",
                      essay.published
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    )}
                  >
                    {essay.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-sm text-soft hidden sm:table-cell">
                  {formatDate(essay.createdAt)}
                </td>
                <td className="px-4 py-3.5 text-sm text-soft hidden lg:table-cell">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {essay.readingTime ?? "—"} min
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/essays/${essay.slug}`}
                      className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setNotifyId(essay.id)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        essay.notifiedAt
                          ? "text-green-600 hover:bg-stone/50"
                          : "text-soft hover:text-mark hover:bg-stone/50",
                        !essay.published && "opacity-30 cursor-not-allowed"
                      )}
                      title={
                        !essay.published
                          ? "Publish before emailing subscribers"
                          : essay.notifiedAt
                            ? `Subscribers emailed ${formatDate(essay.notifiedAt)}`
                            : "Email subscribers"
                      }
                      disabled={isPending || !essay.published}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(essay)}
                      className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                      title="Edit"
                      disabled={isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(essay.id)}
                      className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-soft text-sm">
            No essays found.
          </div>
        )}
      </div>

      {/* SlideOver: create / edit */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editingId ? "Edit Essay" : "New Essay"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Essay title"
              className={inputClass}
              {...field("title")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Excerpt</label>
            <textarea
              rows={2}
              placeholder="Short description shown in listings…"
              className={inputClass + " resize-y"}
              {...field("excerpt")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Content</label>
            <ContentEditor
              content={form.content}
              onChange={(v) => setForm((f) => ({ ...f, content: v }))}
              placeholder="Write your essay here…"
            />
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            label="Cover Image"
            hint="Displayed on essay cards and detail page."
            aspect="landscape"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Aside / Margin Note</label>
            <textarea
              rows={2}
              placeholder="Optional aside text shown in the margin…"
              className={inputClass + " resize-y"}
              {...field("aside")}
            />
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.startHere}
                onChange={(e) => setForm((f) => ({ ...f, startHere: e.target.checked }))}
                className="w-4 h-4 rounded border-rule text-mark focus:ring-mark/30"
              />
              <span className="text-sm text-ink">Feature in &ldquo;Start Here&rdquo;</span>
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
          </div>

          <div className="flex gap-2 pt-2 border-t border-rule">
            <button
              onClick={handleSave}
              disabled={isPending || !form.title.trim()}
              className="px-5 py-2.5 bg-mark text-white rounded-lg text-sm font-medium hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Save Changes" : "Create Essay"}
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
        title="Delete essay?"
        description="This cannot be undone. The essay and all its data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
      <ConfirmDialog
        open={notifyId !== null}
        title={
          essays.find((e) => e.id === notifyId)?.notifiedAt
            ? "Email subscribers again?"
            : "Email subscribers?"
        }
        description={
          essays.find((e) => e.id === notifyId)?.notifiedAt
            ? "Subscribers have already been emailed about this piece. Sending again means they get it twice."
            : "Every confirmed subscriber will get an email linking to this essay. This cannot be undone."
        }
        confirmLabel="Send"
        onConfirm={() => notifyId && handleNotify(notifyId)}
        onCancel={() => setNotifyId(null)}
      />
    </div>
  );
}
