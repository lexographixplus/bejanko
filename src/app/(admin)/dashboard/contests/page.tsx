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

export default async function ContestsPage() {
  const contests = await getContestsWithEntries();
  return <ContestsManager contests={contests} />;
}
