import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Remove your vote",
  robots: { index: false, follow: false },
};

type Outcome = "removed" | "already" | "invalid";

/**
 * Lets someone take back a vote cast with their address.
 *
 * The row is kept and marked disqualified rather than deleted — the fact that
 * a vote was cast and withdrawn is part of the audit trail.
 */
async function revoke(token: string | undefined): Promise<{
  outcome: Outcome;
  contestSlug?: string;
  entryTitle?: string;
}> {
  if (!token) return { outcome: "invalid" };

  const vote = await db.vote.findUnique({
    where: { token },
    include: { contest: true, entry: true },
  });

  if (!vote) return { outcome: "invalid" };

  const details = {
    contestSlug: vote.contest.slug,
    entryTitle: vote.entry.title,
  };

  if (vote.status === "DISQUALIFIED") return { outcome: "already", ...details };

  await db.vote.update({
    where: { token },
    data: { status: "DISQUALIFIED", note: "Removed by the voter" },
  });

  return { outcome: "removed", ...details };
}

const copy: Record<Outcome, { title: string; body: string }> = {
  removed: {
    title: "Your vote has been removed",
    body: "It no longer counts toward the result. If this was a mistake you can vote again from the contest page.",
  },
  already: {
    title: "Already removed",
    body: "This vote was withdrawn earlier, so it isn't counting toward the result.",
  },
  invalid: {
    title: "This link isn't valid",
    body: "The link is incorrect or has been replaced by a newer one. Open the link from your most recent receipt.",
  },
};

export default async function VoteRevokePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await revoke(token);
  const { title, body } = copy[result.outcome];

  const good = result.outcome !== "invalid";

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-md text-center">
        <div
          className={
            good
              ? "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 mb-6"
              : "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6"
          }
        >
          {good ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <AlertCircle className="w-7 h-7" />
          )}
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {title}
        </h1>
        <p className="mt-3 text-soft leading-relaxed font-reading">{body}</p>

        {result.entryTitle && (
          <p className="mt-6 text-sm text-soft">
            The vote was for{" "}
            <span className="text-ink font-medium">{result.entryTitle}</span>.
          </p>
        )}

        <div className="mt-8">
          <Link
            href={
              result.contestSlug ? `/contests/${result.contestSlug}` : "/contests"
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
          >
            Back to the contest
          </Link>
        </div>
      </div>
    </div>
  );
}
