'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

/**
 * Every vote for a contest, newest first, with the entry it backs.
 *
 * Disqualified votes come back too — the record of a vote being cast and then
 * excluded is the point of keeping an audit trail.
 */
export async function getContestVotes(contestId: string) {
  await requireAuth()

  return db.vote.findMany({
    where: { contestId },
    orderBy: { createdAt: 'desc' },
    include: { entry: { select: { id: true, title: true, entryNumber: true } } },
  })
}

/** Excludes a vote from the tally, or puts it back, with a reason on record. */
export async function setVoteStatus(
  id: string,
  status: 'CONFIRMED' | 'DISQUALIFIED',
  note?: string
) {
  await requireAuth()

  const vote = await db.vote.update({
    where: { id },
    data: {
      status,
      note: status === 'DISQUALIFIED' ? note?.trim() || 'Excluded after review' : null,
      confirmedAt: status === 'CONFIRMED' ? new Date() : null,
    },
  })

  revalidatePath('/dashboard/contests')
  return vote
}
