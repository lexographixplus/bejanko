"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check, X, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { approveGuestPost, rejectGuestPost } from "@/lib/actions/guest-posts";

type PostStatus = "PENDING" | "APPROVED" | "REJECTED";

interface GuestPost {
  id: string;
  title: string;
  slug: string;
  contributorName: string;
  contributorEmail: string;
  status: PostStatus;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GuestPostsManagerProps {
  posts: GuestPost[];
}

export function GuestPostsManager({ posts }: GuestPostsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");

  const pendingCount = posts.filter((p) => p.status === "PENDING").length;

  const filtered = posts.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveGuestPost(id);
      router.refresh();
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      await rejectGuestPost(id);
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
        <p className="text-soft text-sm mt-1">Review and manage guest submissions.</p>
      </div>

      <div className="flex gap-1 bg-stone/30 rounded-lg p-1 w-fit">
        {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
              filter === f ? "bg-surface text-ink shadow-sm" : "text-soft hover:text-ink"
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
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink">{post.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-soft">
                  <span>by {post.contributorName}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    post.status === "APPROVED" && "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
                    post.status === "PENDING" && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                    post.status === "REJECTED" && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                  )}>
                    {post.status.toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {post.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <a
                  href={`mailto:${post.contributorEmail}`}
                  className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                  title="Email contributor"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-soft text-sm">No guest posts found.</div>
        )}
      </div>
    </div>
  );
}
