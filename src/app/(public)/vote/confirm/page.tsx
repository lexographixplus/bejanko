import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, AlertCircle, Vote } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Confirm your vote",
  robots: { index: false, follow: false },
};

type Outcome = "confirmed" | "already" | "invalid" | "missing";

async function confirm(token: string | undefined): Promise<{
  outcome: Outcome;
  contestSlug?: string;
  contestTitle?: string;
  entryTitle?: string;
}> {
  if (!token) return { outcome: "missing" };

  const vote = await db.vote.findUnique({
    where: { token },
    include: { contest: true, entry: true },
  });

  if (!vote) return { outcome: "invalid" };

  const details = {
    contestSlug: vote.contest.slug,
    contestTitle: vote.contest.title,
    entryTitle: vote.entry.title,
  };

  if (vote.status === "CONFIRMED") return { outcome: "already", ...details };

  await db.vote.update({
    where: { token },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  return { outcome: "confirmed", ...details };
}

const copy: Record<Outcome, { title: string; body: string }> = {
  confirmed: {
    title: "Your vote is counted",
    body: "Thank you for taking the time to read and choose. Results are published when the contest closes.",
  },
  already: {
    title: "Already confirmed",
    body: "This vote was confirmed earlier — you're all set. Each person gets one vote per contest.",
  },
  invalid: {
    title: "This link isn't valid",
    body: "The confirmation link is incorrect or has already been replaced by a newer one. Try voting again from the contest page.",
  },
  missing: {
    title: "No confirmation token",
    body: "This page needs the confirmation link from your email. Open the link we sent you directly.",
  },
};

export default async function VoteConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await confirm(token);
  const { title, body } = copy[result.outcome];

  const good = result.outcome === "confirmed" || result.outcome === "already";

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
          <div className="mt-8 rounded-xl border border-rule bg-surface p-5 text-left">
            <p className="text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-2">
              Your pick
            </p>
            <p className="font-display font-semibold text-ink flex items-center gap-2">
              <Vote className="w-4 h-4 text-mark shrink-0" />
              {result.entryTitle}
            </p>
            <p className="text-sm text-soft mt-1">in {result.contestTitle}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href={
              result.contestSlug ? `/contests/${result.contestSlug}` : "/contests"
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
          >
            Back to the contest
          </Link>
          <Link
            href="/essays"
            className="inline-flex items-center gap-2 px-6 py-3 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
          >
            Read something
          </Link>
        </div>
      </div>
    </div>
  );
}
