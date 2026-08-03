export type ContestStage = "OPEN" | "SUBMITTING" | "REVIEW" | "VOTING" | "CLOSED";

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
  const classes: Record<ContestStage, string> = {
    OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    SUBMITTING: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    VOTING: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    CLOSED: "bg-stone/60 text-soft",
  };
  return classes[stage];
}

export function stageStyle(stage: ContestStage): React.CSSProperties {
  const styles: Record<ContestStage, { bg: string; color: string }> = {
    OPEN: { bg: "rgba(59,130,246,0.12)", color: "rgb(37,99,235)" },
    SUBMITTING: { bg: "rgba(34,197,94,0.12)", color: "rgb(22,163,74)" },
    REVIEW: { bg: "rgba(245,158,11,0.12)", color: "rgb(180,83,9)" },
    VOTING: { bg: "rgba(168,85,247,0.12)", color: "rgb(126,34,206)" },
    CLOSED: { bg: "rgba(120,113,108,0.12)", color: "rgb(87,83,78)" },
  };
  const s = styles[stage];
  return { backgroundColor: s.bg, color: s.color };
}
