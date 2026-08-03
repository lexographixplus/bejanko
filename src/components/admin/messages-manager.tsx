"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  AlertOctagon,
  Search,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markRead,
  markReplied,
  markSpam,
  deleteMessage,
} from "@/lib/actions/messages";

type SubmissionKind = "CONTACT" | "GUEST";
type SubmissionStatus = "NEW" | "READ" | "REPLIED" | "SPAM";

interface Message {
  id: string;
  kind: SubmissionKind;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface MessagesManagerProps {
  messages: Message[];
}

export function MessagesManager({ messages }: MessagesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = messages.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (
      search &&
      !m.name.toLowerCase().includes(search.toLowerCase()) &&
      !(m.subject ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const selectedMsg = messages.find((m) => m.id === selected);
  const newCount = messages.filter((m) => m.status === "NEW").length;

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markRead(id);
      router.refresh();
    });
  }

  function handleMarkReplied(id: string) {
    startTransition(async () => {
      await markReplied(id);
      router.refresh();
    });
  }

  function handleMarkSpam(id: string) {
    startTransition(async () => {
      await markSpam(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMessage(id);
      if (selected === id) setSelected(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-3">
          Messages
          {newCount > 0 && (
            <span className="text-xs font-medium bg-mark text-white px-2 py-0.5 rounded-full">
              {newCount} new
            </span>
          )}
        </h1>
        <p className="text-soft text-sm mt-1">Contact messages and guest submission inquiries.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-rule bg-surface text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
        </div>
        <div className="flex gap-1 bg-stone/30 rounded-lg p-1">
          {(["all", "NEW", "READ", "REPLIED", "SPAM"] as const).map((f) => (
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
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Message List */}
        <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
          {filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => setSelected(msg.id)}
              className={cn(
                "w-full text-left p-4 hover:bg-stone/20 transition-colors",
                selected === msg.id && "bg-stone/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-sm text-mark">
                    {msg.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm truncate",
                      msg.status === "NEW" ? "font-semibold text-ink" : "font-medium text-ink"
                    )}>
                      {msg.name}
                    </p>
                    {msg.status === "NEW" && (
                      <span className="w-2 h-2 rounded-full bg-mark shrink-0" />
                    )}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                      msg.kind === "GUEST"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    )}>
                      {msg.kind.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-soft truncate mt-0.5">{msg.subject ?? "(no subject)"}</p>
                  <p className="text-[11px] text-soft/60 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-12 text-center text-soft text-sm">
              No messages found.
            </div>
          )}
        </div>

        {/* Message Detail */}
        {selectedMsg ? (
          <div className="rounded-xl border border-rule bg-surface p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-stone flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-mark">
                    {selectedMsg.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-ink">{selectedMsg.name}</p>
                  <p className="text-xs text-soft">{selectedMsg.email}</p>
                </div>
              </div>
              <span className="text-xs text-soft flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(selectedMsg.createdAt)}
              </span>
            </div>

            <h3 className="font-medium text-ink mb-3">
              {selectedMsg.subject ?? "(no subject)"}
            </h3>
            <p className="text-soft text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMsg.message}
            </p>

            <div className="mt-6 pt-4 border-t border-rule flex flex-wrap gap-2">
              <a
                href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject ?? "")}`}
                onClick={() => handleMarkReplied(selectedMsg.id)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-mark text-white rounded-lg text-xs font-medium hover:bg-mark-hover transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply via Email
              </a>
              {selectedMsg.status !== "READ" && selectedMsg.status !== "REPLIED" && (
                <button
                  onClick={() => handleMarkRead(selectedMsg.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-rule rounded-lg text-xs font-medium text-soft hover:text-ink hover:bg-stone/30 transition-colors disabled:opacity-50"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  Mark Read
                </button>
              )}
              {selectedMsg.status !== "SPAM" && (
                <button
                  onClick={() => handleMarkSpam(selectedMsg.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-rule rounded-lg text-xs font-medium text-soft hover:text-ink hover:bg-stone/30 transition-colors disabled:opacity-50"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Spam
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedMsg.id)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-rule rounded-lg text-xs font-medium text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-rule bg-surface p-12 flex flex-col items-center justify-center text-center">
            <Mail className="w-8 h-8 text-rule mb-3" />
            <p className="text-soft text-sm">Select a message to read it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
