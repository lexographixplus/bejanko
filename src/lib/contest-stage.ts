import { ContestStage } from "@prisma/client";

interface ContestDates {
  entriesOpen: Date | null;
  entriesClose: Date | null;
  votingOpens: Date | null;
  votingCloses: Date | null;
  pinnedStage: ContestStage | null;
}

export function deriveStage(contest: ContestDates): ContestStage {
  if (contest.pinnedStage) return contest.pinnedStage;

  const now = new Date();

  if (contest.votingCloses && now > contest.votingCloses) return "CLOSED";
  if (contest.votingOpens && now >= contest.votingOpens) return "VOTING";
  if (contest.entriesClose && now > contest.entriesClose) return "REVIEW";
  if (contest.entriesOpen && now >= contest.entriesOpen) return "SUBMITTING";

  return "OPEN";
}

export function stageLabel(stage: ContestStage): string {
  const labels: Record<ContestStage, string> = {
    OPEN: "Coming Soon",
    SUBMITTING: "Accepting Entries",
    REVIEW: "Under Review",
    VOTING: "Voting Open",
    CLOSED: "Finished",
  };
  return labels[stage];
}

export function stageColor(stage: ContestStage): string {
  const colors: Record<ContestStage, string> = {
    OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    SUBMITTING: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    VOTING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    CLOSED: "bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400",
  };
  return colors[stage];
}
