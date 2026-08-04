"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Check,
  X,
  Mail,
  User,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, wordCount, stripHtml } from "@/lib/utils";
import {
  approveGuestPost,
  rejectGuestPost,
  deleteGuestPost,
} from "@/lib/actions/guest-posts";
import { SlideOver } from "./slide-over";
import { ConfirmDialog } from "./confirm-dialog";

type PostStatus = "PENDING" | "APPROVED" | "REJECTED";

interface GuestPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  contributorName: string;
  contributorEmail: string;
  contributorBio: string | null;
  status: PostStatus;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GuestPostsManagerProps {
  posts: GuestPost[];
}

const statusStyles: Record<PostStatus, string> = {
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export function GuestPostsManager({ posts }: GuestPostsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | PostStatus>("all");

  const [preview, setPreview] = useState<GuestPost | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    action: "approve" | "reject" | "delete";
  } | null>(null);

  const pendingCount = posts.filter((p) => p.status === "PENDING").length;

  const filtered = posts.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  function run(
    id: string,
    action: "approve" | "reject" | "delete",
    closePreview = false
  ) {
    startTransition(async () => {
      try {
        if (action === "approve") {
          await approveGuestPost(id);
          toast.success("Published. The writer has been emailed.");
        } else if (action === "reject") {
          await rejectGuestPost(id);
          toast.success("Declined. The writer has been emailed.");
        } else {
          await deleteGuestPost(id);
          toast.success("Submission deleted.");
        }

        setConfirm(null);
        if (closePreview) setPreview(null);
        router.refresh();
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  const confirmCopy = {
    approve: {
      title: "Publish this piece?",
      description:
        "It goes live on the site straight away, and the writer gets an email with the link.",
      confirmLabel: "Publish",
      variant: "default" as const,
    },
    reject: {
      title: "Decline this piece?",
      description:
        "The writer gets an email letting them know. You can still read it here afterwards.",
      confirmLabel: "Decline",
      variant: "default" as const,
    },
    delete: {
      title: "Delete this submission?",
      description:
        "The piece is removed permanently and cannot be recovered. No email is sent.",
      confirmLabel: "Delete",
      variant: "danger" as const,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-3">
          Guest Posts
          {pendingCount > 0 && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </h1>
        <p className="text-soft text-sm mt-1">
          Read each piece before deciding — nothing is published until you say so.
        </p>
      </div>

      <div className="flex gap-1 bg-stone/30 rounded-lg p-1 w-fit">
        {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
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
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
        {filtered.map((post) => (
          <div key={post.id} className="p-4 hover:bg-stone/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-soft" />
              </div>

              {/* The whole row opens the piece — reading it is the main job. */}
              <button
                onClick={() => setPreview(post)}
                className="flex-1 min-w-0 text-left group"
              >
                <p className="font-medium text-sm text-ink group-hover:text-mark transition-colors">
                  {post.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-soft">
                  <span>by {post.contributorName}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{wordCount(stripHtml(post.content))} words</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full",
                      statusStyles[post.status]
                    )}
                  >
                    {post.status.toLowerCase()}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setPreview(post)}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Read submission"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {post.status === "PENDING" && (
                  <>
                    <button
                      onClick={() =>
                        setConfirm({ id: post.id, action: "approve" })
                      }
                      disabled={isPending}
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors disabled:opacity-50"
                      title="Approve and publish"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirm({ id: post.id, action: "reject" })
                      }
                      disabled={isPending}
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                <a
                  href={`mailto:${post.contributorEmail}`}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Email contributor"
                >
                  <Mail className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setConfirm({ id: post.id, action: "delete" })}
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

        {filtered.length === 0 && (
          <div className="p-12 text-center text-soft text-sm">
            {posts.length === 0
              ? "No submissions yet. They'll appear here when someone sends a piece."
              : "No guest posts with this status."}
          </div>
        )}
      </div>

      {/* Full submission */}
      <SlideOver
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ""}
      >
        {preview && (
          <div className="space-y-6">
            <div className="rounded-lg border border-rule bg-paper p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">
                  {preview.contributorName}
                </p>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full",
                    statusStyles[preview.status]
                  )}
                >
                  {preview.status.toLowerCase()}
                </span>
              </div>
              <a
                href={`mailto:${preview.contributorEmail}`}
                className="flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {preview.contributorEmail}
              </a>
              {preview.contributorBio && (
                <p className="text-sm text-soft leading-relaxed pt-1">
                  {preview.contributorBio}
                </p>
              )}
              <p className="text-xs text-soft/70 pt-1">
                Submitted {formatDate(preview.createdAt)} ·{" "}
                {wordCount(stripHtml(preview.content))} words
              </p>
            </div>

            {preview.excerpt && (
              <p className="font-reading text-lg text-soft leading-relaxed">
                {preview.excerpt}
              </p>
            )}

            {/* Submissions arrive as plain text from the public form, so
                whitespace is preserved rather than rendered as HTML. */}
            <div className="font-reading text-ink leading-relaxed whitespace-pre-wrap">
              {stripHtml(preview.content)}
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-rule">
              {preview.status !== "APPROVED" && (
                <button
                  onClick={() =>
                    setConfirm({ id: preview.id, action: "approve" })
                  }
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Publish
                </button>
              )}

              {preview.status !== "REJECTED" && (
                <button
                  onClick={() => setConfirm({ id: preview.id, action: "reject" })}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
              )}

              {preview.published && (
                <Link
                  href={`/guest-writing/${preview.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View live
                </Link>
              )}

              <button
                onClick={() => setConfirm({ id: preview.id, action: "delete" })}
                disabled={isPending}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-soft hover:text-red-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? confirmCopy[confirm.action].title : ""}
        description={confirm ? confirmCopy[confirm.action].description : ""}
        confirmLabel={confirm ? confirmCopy[confirm.action].confirmLabel : ""}
        variant={confirm ? confirmCopy[confirm.action].variant : "default"}
        onConfirm={() =>
          confirm && run(confirm.id, confirm.action, confirm.action === "delete")
        }
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
