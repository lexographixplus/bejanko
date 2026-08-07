import { db } from "@/lib/db";
import { deriveStage } from "@/lib/contest-stage";
import { ContestsManager } from "@/components/admin/contests-manager";

async function getContestsWithEntries() {
  const contests = await db.contest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { entries: true } },
      entries: {
        include: {
          _count: {
            select: {
              votes: { where: { status: "CONFIRMED" } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return contests.map((contest) => ({
    ...contest,
    stage: deriveStage(contest),
  }));
}

/**
 * Every vote, including excluded ones — the audit trail is the evidence that
 * makes a result defensible, so nothing is filtered out here.
 */
async function getVotes() {
  return db.vote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      entry: { select: { id: true, title: true, entryNumber: true } },
      contest: { select: { id: true, title: true } },
    },
  });
}

export default async function ContestsPage() {
  const [contests, votes] = await Promise.all([
    getContestsWithEntries(),
    getVotes(),
  ]);

  return <ContestsManager contests={contests} votes={votes} />;
}
