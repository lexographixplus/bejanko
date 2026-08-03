import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, Users, Clock } from "lucide-react";
import { getContestBySlug } from "@/lib/actions/contests";
import { stageLabel, stageStyle } from "@/lib/contest-stage";
import { ExpandableEntry } from "@/components/shared/expandable-entry";
import { ContestEntryForm } from "@/components/shared/contest-entry-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contest = await getContestBySlug(slug);
  if (!contest) return {};

  return {
    title: contest.title,
    description: contest.excerpt || undefined,
    openGraph: {
      type: "article",
      title: contest.title,
      description: contest.excerpt || undefined,
    },
  };
}

export default async function ContestPage({ params }: Props) {
  const { slug } = await params;
  const contest = await getContestBySlug(slug);

  if (!contest || !contest.published) notFound();

  const formatDate = (date: Date | null) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <Link
        href="/contests"
        className="inline-flex items-center gap-2 text-sm text-soft hover:text-mark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All Contests
      </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-mark" />
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={stageStyle(contest.stage)}>
            {stageLabel(contest.stage)}
          </span>
          {contest.reference && (
            <span className="text-xs text-soft font-mono">{contest.reference}</span>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink leading-tight">
          {contest.title}
        </h1>

        {/* Facts */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Calendar,
              label: "Entry Period",
              value: `${formatDate(contest.entriesOpen)} – ${formatDate(contest.entriesClose)}`,
            },
            {
              icon: Clock,
              label: "Voting",
              value: `${formatDate(contest.votingOpens)} – ${formatDate(contest.votingCloses)}`,
            },
            {
              icon: Users,
              label: "Submissions",
              value: `${contest.entries.length} approved`,
            },
            {
              icon: Trophy,
              label: "Length",
              value: contest.wordGuidance ?? "Open",
            },
          ].map((fact) => (
            <div
              key={fact.label + fact.value}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-rule/50"
            >
              <fact.icon className="w-4 h-4 text-mark mt-0.5" />
              <div>
                <p className="text-xs text-soft">{fact.label}</p>
                <p className="text-sm text-ink font-medium">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {contest.content && (
          <div
            className="mt-8 prose"
            dangerouslySetInnerHTML={{ __html: contest.content }}
          />
        )}

        {/* Enter (Submitting Stage) */}
        {contest.stage === "SUBMITTING" && (
          <section className="mt-12 scroll-mt-24" id="enter">
            <h2 className="font-display text-xl font-semibold text-ink mb-2">
              Enter this contest
            </h2>
            <p className="text-soft text-sm mb-6">
              One entry per person. You&apos;ll get an email receipt, and we&apos;ll
              let you know when voting opens.
            </p>

            <ContestEntryForm
              slug={contest.slug}
              uploadMode={contest.uploadMode}
              wordMin={contest.wordMin}
              wordMax={contest.wordMax}
              wordGuidance={contest.wordGuidance}
            />
          </section>
        )}

        {/* Entries Gallery (Voting Stage) */}
        {contest.stage === "VOTING" && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink mb-2">
              Entries — Vote for Your Favorite
            </h2>
            <p className="text-soft text-sm mb-6">
              Read all entries and cast your vote. One vote per person — you&apos;ll
              receive a confirmation email. Vote counts are private until the
              contest ends.
            </p>

            {contest.entries.length === 0 ? (
              <p className="text-soft text-sm rounded-xl border border-rule bg-surface p-6">
                No entries have been approved for voting yet. Check back shortly.
              </p>
            ) : (
              <div className="space-y-3">
                {contest.entries.map((entry) => (
                  <ExpandableEntry
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    entrantName={entry.entrantName}
                    entryNumber={entry.entryNumber}
                    content={entry.content}
                    fileName={entry.fileName}
                    fileUrl={entry.fileUrl}
                    canVote
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Closed — show results if any winners */}
        {contest.stage === "CLOSED" && contest.entries.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink mb-6">
              Entries
            </h2>
            <div className="space-y-3">
              {contest.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-rule bg-surface"
                >
                  {entry.entryNumber !== null && (
                    <span className="font-mono text-xs text-soft shrink-0">
                      #{entry.entryNumber}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-ink">
                      {entry.title}
                    </p>
                    <p className="text-xs text-soft mt-0.5">
                      by {entry.entrantName}
                    </p>
                  </div>
                  {entry.isWinner && (
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full shrink-0">
                      Winner
                    </span>
                  )}
                  <span className="text-xs text-soft shrink-0">
                    {entry._count.votes} vote{entry._count.votes !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
