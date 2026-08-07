"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Plus,
  Check,
  X,
  Eye,
  Download,
  Award,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { stageLabel, stageStyle } from "@/lib/contest-stage";
import {
  approveEntry,
  rejectEntry,
  toggleWinner,
  createContest,
  updateContest,
  deleteContest,
} from "@/lib/actions/contests";
import { SlideOver } from "./slide-over";
import { setVoteStatus } from "@/lib/actions/votes";
import { flagVotes, FLAG_LABEL } from "@/lib/votes";
import { formatDate, wordCount, stripHtml } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { ContentEditor } from "./content-editor";
import { ImageUpload } from "./image-upload";
import type { ContestStage } from "@/lib/contest-stage";

type EntryState = "PENDING" | "APPROVED" | "REJECTED";

interface ContestEntry {
  id: string;
  contestId: string;
  title: string;
  content: string;
  entrantName: string;
  entrantEmail: string;
  wordCount: number | null;
  entryNumber: number | null;
  state: EntryState;
  isWinner: boolean;
  fileName: string | null;
  fileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { votes: number };
}

type UploadMode = "TEXT" | "OPTIONAL" | "REQUIRED";

interface Contest {
  id: string;
  title: string;
  slug: string;
  reference: string | null;
  content: string | null;
  excerpt: string | null;
  coverImage: string | null;
  entriesOpen: Date | null;
  entriesClose: Date | null;
  votingOpens: Date | null;
  votingCloses: Date | null;
  wordGuidance: string | null;
  wordMin: number | null;
  wordMax: number | null;
  uploadMode: UploadMode;
  pinnedStage: ContestStage | null;
  published: boolean;
  stage: ContestStage;
  entries: ContestEntry[];
  _count: { entries: number };
  createdAt: Date;
  updatedAt: Date;
}

interface ContestForm {
  title: string;
  reference: string;
  excerpt: string;
  content: string;
  coverImage: string;
  entriesOpen: string;
  entriesClose: string;
  votingOpens: string;
  votingCloses: string;
  wordGuidance: string;
  wordMin: string;
  wordMax: string;
  uploadMode: UploadMode;
  pinnedStage: "" | ContestStage;
  published: boolean;
}

const emptyForm: ContestForm = {
  title: "",
  reference: "",
  excerpt: "",
  content: "",
  coverImage: "",
  entriesOpen: "",
  entriesClose: "",
  votingOpens: "",
  votingCloses: "",
  wordGuidance: "",
  wordMin: "",
  wordMax: "",
  uploadMode: "TEXT",
  pinnedStage: "",
  published: false,
};

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors";

const STAGES: ContestStage[] = [
  "OPEN",
  "SUBMITTING",
  "REVIEW",
  "VOTING",
  "CLOSED",
];

/**
 * `datetime-local` speaks local wall-clock time with no zone, which is what an
 * admin setting a deadline means. These convert between that and a Date.
 */
function toLocalInput(value: Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface VoteRow {
  id: string;
  voterName: string;
  voterEmail: string;
  status: "PENDING" | "CONFIRMED" | "DISQUALIFIED";
  note: string | null;
  ip: string | null;
  createdAt: Date;
  entry: { id: string; title: string; entryNumber: number | null };
  contest: { id: string; title: string };
}

interface ContestsManagerProps {
  contests: Contest[];
  votes: VoteRow[];
}

export function ContestsManager({ contests, votes }: ContestsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"overview" | "entries" | "results">("overview");
  const [entryFilter, setEntryFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContestForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [entryPreview, setEntryPreview] = useState<ContestEntry | null>(null);
  const [openVotesFor, setOpenVotesFor] = useState<string | null>(null);

  // Flatten all entries across all contests for the entries tab
  const allEntries = contests.flatMap((c) => c.entries);

  const filteredEntries = allEntries.filter((e) => {
    if (entryFilter === "all") return true;
    return e.state === entryFilter;
  });

  // Aggregate results: approved entries sorted by vote count
  const approvedEntries = allEntries
    .filter((e) => e.state === "APPROVED")
    .map((e) => ({
      ...e,
      votes: e._count?.votes ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = approvedEntries.reduce((sum, e) => sum + e.votes, 0);
  const excludedCount = votes.filter((v) => v.status === "DISQUALIFIED").length;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  }

  function openEdit(contest: Contest) {
    setEditingId(contest.id);
    setForm({
      title: contest.title,
      reference: contest.reference ?? "",
      excerpt: contest.excerpt ?? "",
      content: contest.content ?? "",
      coverImage: contest.coverImage ?? "",
      entriesOpen: toLocalInput(contest.entriesOpen),
      entriesClose: toLocalInput(contest.entriesClose),
      votingOpens: toLocalInput(contest.votingOpens),
      votingCloses: toLocalInput(contest.votingCloses),
      wordGuidance: contest.wordGuidance ?? "",
      wordMin: contest.wordMin?.toString() ?? "",
      wordMax: contest.wordMax?.toString() ?? "",
      uploadMode: contest.uploadMode,
      pinnedStage: contest.pinnedStage ?? "",
      published: contest.published,
    });
    setEditorOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const title = form.title.trim();
    if (!title) {
      toast.error("A contest needs a title.");
      return;
    }

    const opens = fromLocalInput(form.entriesOpen);
    const closes = fromLocalInput(form.entriesClose);
    const voteOpens = fromLocalInput(form.votingOpens);
    const voteCloses = fromLocalInput(form.votingCloses);

    // Stages are derived from these dates, so an out-of-order set would
    // silently produce a stage the admin did not intend.
    const order: [string, Date | null][] = [
      ["entries open", opens],
      ["entries close", closes],
      ["voting opens", voteOpens],
      ["voting closes", voteCloses],
    ];
    const given = order.filter(([, d]) => d !== null) as [string, Date][];
    for (let i = 1; i < given.length; i++) {
      if (given[i][1] < given[i - 1][1]) {
        toast.error(`"${given[i][0]}" cannot be before "${given[i - 1][0]}".`);
        return;
      }
    }

    const min = form.wordMin ? Number(form.wordMin) : null;
    const max = form.wordMax ? Number(form.wordMax) : null;
    if (min !== null && max !== null && min > max) {
      toast.error("Minimum words cannot exceed the maximum.");
      return;
    }

    startTransition(async () => {
      try {
        const shared = {
          title,
          content: form.content.trim() || undefined,
          excerpt: form.excerpt.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          reference: form.reference.trim() || undefined,
          wordGuidance: form.wordGuidance.trim() || undefined,
          uploadMode: form.uploadMode,
          published: form.published,
        };

        if (editingId) {
          // Update accepts null, so clearing a field actually clears it.
          await updateContest(editingId, {
            ...shared,
            entriesOpen: opens,
            entriesClose: closes,
            votingOpens: voteOpens,
            votingCloses: voteCloses,
            wordMin: min,
            wordMax: max,
            pinnedStage: form.pinnedStage || null,
          });
          toast.success("Contest updated.");
        } else {
          await createContest({
            ...shared,
            ...(opens ? { entriesOpen: opens } : {}),
            ...(closes ? { entriesClose: closes } : {}),
            ...(voteOpens ? { votingOpens: voteOpens } : {}),
            ...(voteCloses ? { votingCloses: voteCloses } : {}),
            ...(min !== null ? { wordMin: min } : {}),
            ...(max !== null ? { wordMax: max } : {}),
            ...(form.pinnedStage ? { pinnedStage: form.pinnedStage } : {}),
          });
          toast.success("Contest created.");
        }

        setEditorOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not save the contest."
        );
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteContest(id);
        setDeleteId(null);
        router.refresh();
        toast.success("Contest deleted.");
      } catch {
        toast.error("Could not delete the contest.");
      }
    });
  }

  const voteFlags = flagVotes(votes);
  const flaggedCount = votes.filter(
    (v) => v.status !== "DISQUALIFIED" && (voteFlags.get(v.id)?.length ?? 0) > 0
  ).length;

  function handleVoteStatus(
    id: string,
    status: "CONFIRMED" | "DISQUALIFIED"
  ) {
    startTransition(async () => {
      try {
        await setVoteStatus(id, status);
        router.refresh();
        toast.success(
          status === "DISQUALIFIED" ? "Vote excluded." : "Vote reinstated."
        );
      } catch {
        toast.error("Could not update the vote.");
      }
    });
  }

  function exportVotes() {
    const rows = [
      ["contest", "entry", "entry_number", "voter", "email", "status", "note", "network", "flags", "cast_at"],
      ...votes.map((v) => [
        v.contest.title,
        v.entry.title,
        v.entry.entryNumber?.toString() ?? "",
        v.voterName,
        v.voterEmail,
        v.status,
        v.note ?? "",
        v.ip ?? "",
        (voteFlags.get(v.id) ?? []).join(" "),
        new Date(v.createdAt).toISOString(),
      ]),
    ];

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `contest-votes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveEntry(id);
      router.refresh();
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      await rejectEntry(id);
      router.refresh();
    });
  }

  function handleToggleWinner(id: string) {
    startTransition(async () => {
      await toggleWinner(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Contests</h1>
          <p className="text-soft text-sm mt-1">Manage writing contests, entries, and results.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Contest
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-rule">
        {(["overview", "entries", "results"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
              tab === t
                ? "border-mark text-mark"
                : "border-transparent text-soft hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          {contests.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-8 h-8 text-soft/40 mx-auto mb-3" />
              <p className="text-soft text-sm">
                No contests yet. Create one to start accepting entries.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Contest
              </button>
            </div>
          )}
          {contests.map((contest) => {
            const pendingCount = contest.entries.filter((e) => e.state === "PENDING").length;
            const totalVotesForContest = contest.entries
              .filter((e) => e.state === "APPROVED")
              .reduce((sum, e) => sum + (e._count?.votes ?? 0), 0);

            return (
              <div key={contest.id} className="rounded-xl border border-rule bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-mark" />
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={stageStyle(contest.stage)}>
                        {stageLabel(contest.stage)}
                      </span>
                      {contest.reference && (
                        <span className="text-xs text-soft font-mono">{contest.reference}</span>
                      )}
                    </div>
                    <h2 className="font-display text-lg font-semibold text-ink">{contest.title}</h2>
                    {!contest.published && (
                      <span className="mt-1 inline-block text-xs text-amber-600">
                        Draft — not visible on the site
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {contest.published && (
                      <Link
                        href={`/contests/${contest.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                        title="View on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => openEdit(contest)}
                      className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                      title="Edit"
                      disabled={isPending}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(contest.id)}
                      className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-stone/20">
                    <p className="font-display text-xl font-bold text-ink">{contest._count.entries}</p>
                    <p className="text-xs text-soft">Entries</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-stone/20">
                    <p className="font-display text-xl font-bold text-ink">{pendingCount}</p>
                    <p className="text-xs text-soft">Pending</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-stone/20">
                    <p className="font-display text-xl font-bold text-ink">{totalVotesForContest}</p>
                    <p className="text-xs text-soft">Votes</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entries Tab */}
      {tab === "entries" && (
        <div className="space-y-4">
          <div className="flex gap-1 bg-stone/30 rounded-lg p-1 w-fit">
            {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setEntryFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                  entryFilter === f ? "bg-surface text-ink shadow-sm" : "text-soft hover:text-ink"
                )}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-rule bg-surface divide-y divide-rule overflow-hidden">
            {filteredEntries.length === 0 && (
              <div className="p-12 text-center text-soft text-sm">No entries found.</div>
            )}
            {filteredEntries.map((entry) => {
              const voteCount = entry._count?.votes ?? 0;
              return (
                <div key={entry.id} className="p-4 hover:bg-stone/10 transition-colors">
                  <div className="flex items-center gap-4">
                    {entry.entryNumber && (
                      <span className="font-mono text-xs text-soft w-16 shrink-0">
                        #{entry.entryNumber}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink flex items-center gap-2">
                        {entry.title}
                        {entry.isWinner && <Award className="w-4 h-4 text-amber-500" />}
                      </p>
                      <p className="text-xs text-soft mt-0.5">
                        by {entry.entrantName}
                        {entry.wordCount ? ` · ${entry.wordCount} words` : ""}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      entry.state === "APPROVED" && "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
                      entry.state === "PENDING" && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                      entry.state === "REJECTED" && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                    )}>
                      {entry.state.toLowerCase()}
                    </span>
                    {voteCount > 0 && (
                      <span className="text-xs text-soft tabular-nums">{voteCount} votes</span>
                    )}
                    <div className="flex items-center gap-1">
                      {entry.state === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(entry.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(entry.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEntryPreview(entry)}
                        className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                        title="Read entry"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {entry.fileUrl && (
                        <a
                          href={entry.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {tab === "results" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-rule bg-surface p-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{totalVotes}</p>
              <p className="text-xs text-soft mt-1">Counted Votes</p>
            </div>
            <div className="rounded-xl border border-rule bg-surface p-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{approvedEntries.length}</p>
              <p className="text-xs text-soft mt-1">Approved Entries</p>
            </div>
            <div className="rounded-xl border border-rule bg-surface p-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{excludedCount}</p>
              <p className="text-xs text-soft mt-1">Excluded</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-soft">
              {flaggedCount > 0
                ? `${flaggedCount} ${flaggedCount === 1 ? "vote" : "votes"} flagged for review — open a row's voters to look.`
                : "Nothing flagged for review."}
            </p>
            {votes.length > 0 && (
              <button
                onClick={exportVotes}
                className="inline-flex items-center gap-2 px-4 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export all votes
              </button>
            )}
          </div>

          <div className="rounded-xl border border-rule bg-surface overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule bg-stone/20">
                  <th className="text-left text-xs font-medium text-soft px-4 py-3">Rank</th>
                  <th className="text-left text-xs font-medium text-soft px-4 py-3">Entry</th>
                  <th className="text-left text-xs font-medium text-soft px-4 py-3">Entrant</th>
                  <th className="text-right text-xs font-medium text-soft px-4 py-3">Votes</th>
                  <th className="text-right text-xs font-medium text-soft px-4 py-3">%</th>
                  <th className="text-right text-xs font-medium text-soft px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {approvedEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-soft text-sm">
                      No approved entries yet.
                    </td>
                  </tr>
                )}
                {approvedEntries.map((entry, i) => {
                  const pct = totalVotes > 0 ? Math.round((entry.votes / totalVotes) * 100) : 0;
                  const rank = i + 1;
                  return (
                    <tr key={entry.id} className="hover:bg-stone/10 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn(
                          "font-display font-bold text-lg tabular-nums",
                          rank === 1 ? "text-mark" : "text-soft"
                        )}>
                          #{rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-ink flex items-center gap-2">
                          {entry.title}
                          {entry.isWinner && <Award className="w-4 h-4 text-amber-500" />}
                        </p>
                        {entry.entryNumber && (
                          <p className="text-xs text-soft font-mono">#{entry.entryNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-soft">{entry.entrantName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-display font-bold text-ink tabular-nums">
                          {entry.votes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-16 h-1.5 bg-stone rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mark rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-soft tabular-nums w-8">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            setOpenVotesFor(
                              openVotesFor === entry.id ? null : entry.id
                            )
                          }
                          className="text-xs font-medium text-soft hover:text-ink transition-colors mr-3"
                        >
                          {openVotesFor === entry.id ? "Hide" : "Voters"}
                        </button>
                        <button
                          onClick={() => handleToggleWinner(entry.id)}
                          disabled={isPending}
                          className={cn(
                            "text-xs font-medium transition-colors disabled:opacity-50",
                            entry.isWinner
                              ? "text-amber-600 hover:text-amber-700"
                              : "text-mark hover:text-mark-hover"
                          )}
                        >
                          {entry.isWinner ? "Unmark" : "Winner"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Who voted for what — the record behind the tally */}
      {tab === "results" && openVotesFor && (
        <div className="rounded-xl border border-rule bg-surface overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-rule bg-stone/20">
            <p className="text-sm font-medium text-ink">
              Voters for{" "}
              {approvedEntries.find((e) => e.id === openVotesFor)?.title}
            </p>
            <button
              onClick={() => setOpenVotesFor(null)}
              className="text-soft hover:text-ink transition-colors"
              aria-label="Close voter list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {votes.filter((v) => v.entry.id === openVotesFor).length === 0 ? (
            <p className="px-4 py-8 text-sm text-soft text-center">
              No votes for this entry yet.
            </p>
          ) : (
            <div className="divide-y divide-rule">
              {votes
                .filter((v) => v.entry.id === openVotesFor)
                .map((vote) => {
                  const flags = voteFlags.get(vote.id) ?? [];
                  const excluded = vote.status === "DISQUALIFIED";

                  return (
                    <div
                      key={vote.id}
                      className={cn(
                        "flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3",
                        excluded && "opacity-60"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium text-ink",
                            excluded && "line-through"
                          )}
                        >
                          {vote.voterName}
                        </p>
                        <a
                          href={`mailto:${vote.voterEmail}`}
                          className="text-xs text-soft hover:text-mark transition-colors"
                        >
                          {vote.voterEmail}
                        </a>
                        {vote.note && (
                          <p className="text-xs text-soft/70 mt-0.5">{vote.note}</p>
                        )}
                      </div>

                      {flags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {flags.map((flag) => (
                            <span
                              key={flag}
                              title={FLAG_LABEL[flag]}
                              className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-500"
                            >
                              {flag.replace("_", " ").toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      <span
                        className="text-xs text-soft tabular-nums shrink-0"
                        title={vote.ip ? `Network ${vote.ip}` : undefined}
                      >
                        {formatDate(vote.createdAt)}
                      </span>

                      <button
                        onClick={() =>
                          handleVoteStatus(
                            vote.id,
                            excluded ? "CONFIRMED" : "DISQUALIFIED"
                          )
                        }
                        disabled={isPending}
                        className={cn(
                          "text-xs font-medium transition-colors disabled:opacity-50 shrink-0",
                          excluded
                            ? "text-mark hover:text-mark-hover"
                            : "text-soft hover:text-red-600"
                        )}
                      >
                        {excluded ? "Reinstate" : "Exclude"}
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Read a submission */}
      <SlideOver
        open={entryPreview !== null}
        onClose={() => setEntryPreview(null)}
        title={entryPreview?.title ?? ""}
      >
        {entryPreview && (
          <div className="space-y-6">
            <div className="rounded-lg border border-rule bg-paper p-4 space-y-1.5">
              <p className="text-sm font-medium text-ink">
                {entryPreview.entrantName}
              </p>
              <a
                href={`mailto:${entryPreview.entrantEmail}`}
                className="block text-sm text-soft hover:text-mark transition-colors"
              >
                {entryPreview.entrantEmail}
              </a>
              <p className="text-xs text-soft/70 pt-1">
                {entryPreview.entryNumber !== null &&
                  `Entry #${entryPreview.entryNumber} · `}
                {entryPreview.wordCount ??
                  wordCount(stripHtml(entryPreview.content))}{" "}
                words · {entryPreview.state.toLowerCase()} ·{" "}
                {formatDate(entryPreview.createdAt)}
              </p>
            </div>

            {/* Entries arrive as plain text from the public form, so whitespace
                is preserved rather than rendered as untrusted HTML. */}
            <div className="font-reading text-ink leading-relaxed whitespace-pre-wrap">
              {stripHtml(entryPreview.content)}
            </div>

            {entryPreview.fileUrl && (
              <a
                href={entryPreview.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-mark hover:text-mark-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                {entryPreview.fileName || "Attached file"}
              </a>
            )}

            {entryPreview.state === "PENDING" && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-rule">
                <button
                  onClick={() => {
                    handleApprove(entryPreview.id);
                    setEntryPreview(null);
                  }}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(entryPreview.id);
                    setEntryPreview(null);
                  }}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </SlideOver>

      {/* Create / edit */}
      <SlideOver
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? "Edit Contest" : "New Contest"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="c-title" className="block text-sm font-medium text-ink mb-1.5">
              Title *
            </label>
            <input
              id="c-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="The Silence Prize 2026"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="c-ref" className="block text-sm font-medium text-ink mb-1.5">
              Reference <span className="text-soft font-normal">(optional)</span>
            </label>
            <input
              id="c-ref"
              maxLength={40}
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              placeholder="MS-2026-01"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-soft">
              A short code shown beside the title, for your own records.
            </p>
          </div>

          <div>
            <label htmlFor="c-excerpt" className="block text-sm font-medium text-ink mb-1.5">
              Excerpt
            </label>
            <textarea
              id="c-excerpt"
              rows={2}
              maxLength={300}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Shown in listings and social previews…"
              className={cn(inputClass, "resize-y")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Brief</label>
            <ContentEditor
              content={form.content}
              onChange={(v) => setForm((f) => ({ ...f, content: v }))}
              placeholder="The prompt, the rules, what you are looking for…"
            />
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            label="Cover image"
            aspect="landscape"
          />

          <fieldset className="rounded-lg border border-rule p-4 space-y-4">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-soft">
              Schedule
            </legend>

            <p className="text-xs text-soft -mt-1">
              The stage is worked out from these dates. Leave them blank and the
              contest stays &ldquo;Coming Soon&rdquo; until you set them or pin a
              stage below.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {(
                [
                  ["entriesOpen", "Entries open"],
                  ["entriesClose", "Entries close"],
                  ["votingOpens", "Voting opens"],
                  ["votingCloses", "Voting closes"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={`c-${key}`}
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    {label}
                  </label>
                  <input
                    id={`c-${key}`}
                    type="datetime-local"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="c-stage" className="block text-sm font-medium text-ink mb-1.5">
                Pin stage
              </label>
              <select
                id="c-stage"
                value={form.pinnedStage}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pinnedStage: e.target.value as ContestForm["pinnedStage"],
                  }))
                }
                className={inputClass}
              >
                <option value="">Automatic — follow the dates</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabel(stage)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-soft">
                Overrides the dates entirely. Useful to open or close a contest by
                hand.
              </p>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-rule p-4 space-y-4">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-soft">
              Entry rules
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-min" className="block text-sm font-medium text-ink mb-1.5">
                  Minimum words
                </label>
                <input
                  id="c-min"
                  type="number"
                  min={0}
                  value={form.wordMin}
                  onChange={(e) => setForm((f) => ({ ...f, wordMin: e.target.value }))}
                  placeholder="500"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="c-max" className="block text-sm font-medium text-ink mb-1.5">
                  Maximum words
                </label>
                <input
                  id="c-max"
                  type="number"
                  min={0}
                  value={form.wordMax}
                  onChange={(e) => setForm((f) => ({ ...f, wordMax: e.target.value }))}
                  placeholder="2000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="c-guidance" className="block text-sm font-medium text-ink mb-1.5">
                Length note
              </label>
              <input
                id="c-guidance"
                maxLength={80}
                value={form.wordGuidance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, wordGuidance: e.target.value }))
                }
                placeholder="500–2000 words"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-soft">
                Shown next to the word counter as entrants write.
              </p>
            </div>

            <div>
              <label htmlFor="c-upload" className="block text-sm font-medium text-ink mb-1.5">
                File uploads
              </label>
              <select
                id="c-upload"
                value={form.uploadMode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uploadMode: e.target.value as UploadMode }))
                }
                className={inputClass}
              >
                <option value="TEXT">Typed entries only</option>
                <option value="OPTIONAL">Allow a file as well</option>
                <option value="REQUIRED">Require a file</option>
              </select>
            </div>
          </fieldset>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-[var(--mark)]"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
            />
            <span className="text-sm">
              <span className="font-medium text-ink">Published</span>
              <span className="block text-xs text-soft mt-0.5">
                Unpublished contests are invisible on the site and reject entries.
              </span>
            </span>
          </label>

          <div className="flex gap-3 pt-2 border-t border-rule">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50"
            >
              {isPending
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Create contest"}
            </button>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="px-5 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this contest?"
        description="Its entries and votes are deleted with it. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
