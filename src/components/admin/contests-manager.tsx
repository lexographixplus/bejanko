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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stageLabel, stageStyle } from "@/lib/contest-stage";
import {
  approveEntry,
  rejectEntry,
  toggleWinner,
} from "@/lib/actions/contests";
import type { ContestStage } from "@/lib/contest-stage";

type EntryState = "PENDING" | "APPROVED" | "REJECTED";

interface ContestEntry {
  id: string;
  contestId: string;
  title: string;
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

interface Contest {
  id: string;
  title: string;
  reference: string | null;
  stage: ContestStage;
  entries: ContestEntry[];
  _count: { entries: number };
  createdAt: Date;
  updatedAt: Date;
}

interface ContestsManagerProps {
  contests: Contest[];
}

export function ContestsManager({ contests }: ContestsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"overview" | "entries" | "results">("overview");
  const [entryFilter, setEntryFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");

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
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors">
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
            <p className="text-soft text-sm text-center py-12">No contests yet.</p>
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
                      <button className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors" title="View">
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
              <p className="text-xs text-soft mt-1">Confirmed Votes</p>
            </div>
            <div className="rounded-xl border border-rule bg-surface p-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{approvedEntries.length}</p>
              <p className="text-xs text-soft mt-1">Approved Entries</p>
            </div>
            <div className="rounded-xl border border-rule bg-surface p-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{contests.length}</p>
              <p className="text-xs text-soft mt-1">Total Contests</p>
            </div>
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
                      <td className="px-4 py-3 text-right">
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
    </div>
  );
}
