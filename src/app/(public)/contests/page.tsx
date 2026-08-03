import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getContests } from "@/lib/actions/contests";
import { stageLabel, stageStyle } from "@/lib/contest-stage";

export const metadata: Metadata = {
  title: "Contests",
  description: "Writing contests — submit your work, vote for your favorites.",
};

export default async function ContestsPage() {
  const contests = await getContests({ published: true });

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Writing Contests"
        description="Regular writing contests open to all. Submit your work, read others, vote for your favorites."
        count={contests.length}
        countLabel="contests"
      />

      {contests.length === 0 ? (
        <p className="mt-12 text-soft text-sm">No contests published yet.</p>
      ) : (
        <div className="mt-12 space-y-6">
          {contests.map((contest, i) => (
            <ScrollReveal key={contest.slug} delay={i * 100}>
              <Link
                href={`/contests/${contest.slug}`}
                className="group block rounded-xl border border-rule bg-surface hover:border-mark/30 hover:shadow-lg transition-all p-6 md:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="w-5 h-5 text-mark" />
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={stageStyle(contest.stage)}>
                        {stageLabel(contest.stage)}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-semibold text-ink group-hover:text-mark transition-colors">
                      {contest.title}
                    </h2>

                    {contest.excerpt && (
                      <p className="mt-2 text-soft text-sm leading-relaxed max-w-lg">
                        {contest.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-soft">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {contest._count.entries} entries
                      </span>
                      {contest.votingCloses && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Voting closes{" "}
                          {new Date(contest.votingCloses).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-rule group-hover:text-mark group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
