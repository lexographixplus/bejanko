'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateToken, anonymizeIp, wordCount } from '@/lib/utils';
import { uniqueSlug } from '@/lib/slug';
import { deriveStage } from '@/lib/contest-stage';
import type { UploadMode, EntryState } from '@prisma/client';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

// ── Revalidation helper ───────────────────────────────────────────────────────

function revalidateContests() {
  revalidatePath('/contests');
  revalidatePath('/dashboard/contests');
}

// ── Read actions ──────────────────────────────────────────────────────────────

export async function getContests(opts?: { published?: boolean }) {
  const where =
    opts?.published !== undefined ? { published: opts.published } : {};

  const contests = await db.contest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entries: true } },
    },
  });

  return contests.map((contest) => ({
    ...contest,
    stage: deriveStage(contest),
  }));
}

export async function getContestBySlug(slug: string) {
  const contest = await db.contest.findUnique({
    where: { slug },
    include: {
      entries: {
        where: { state: 'APPROVED' },
        include: {
          _count: {
            select: {
              votes: { where: { status: 'CONFIRMED' } },
            },
          },
        },
        orderBy: { entryNumber: 'asc' },
      },
    },
  });

  if (!contest) return null;

  return {
    ...contest,
    stage: deriveStage(contest),
  };
}

export async function getContestEntries(
  contestId: string,
  state?: EntryState
) {
  await requireAuth();

  return db.contestEntry.findMany({
    where: {
      contestId,
      ...(state ? { state } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
}

// ── Contest mutation actions (auth required) ───────────────────────────────────

export async function createContest(data: {
  title: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  reference?: string;
  entriesOpen?: Date;
  entriesClose?: Date;
  votingOpens?: Date;
  votingCloses?: Date;
  wordGuidance?: string;
  wordMin?: number;
  wordMax?: number;
  uploadMode?: UploadMode;
  published?: boolean;
}) {
  await requireAuth();

  const slug = await uniqueSlug('contest', data.title);

  const contest = await db.contest.create({
    data: {
      ...data,
      slug,
    },
  });

  revalidateContests();
  return contest;
}

export async function updateContest(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    reference?: string;
    entriesOpen?: Date | null;
    entriesClose?: Date | null;
    votingOpens?: Date | null;
    votingCloses?: Date | null;
    wordGuidance?: string;
    wordMin?: number | null;
    wordMax?: number | null;
    uploadMode?: UploadMode;
    published?: boolean;
  }
) {
  await requireAuth();

  const contest = await db.contest.update({
    where: { id },
    data,
  });

  revalidateContests();
  return contest;
}

export async function deleteContest(id: string) {
  await requireAuth();

  await db.contest.delete({ where: { id } });

  revalidateContests();
}

// ── Entry moderation (auth required) ─────────────────────────────────────────

export async function approveEntry(id: string) {
  await requireAuth();

  const entry = await db.contestEntry.update({
    where: { id },
    data: { state: 'APPROVED' },
  });

  revalidateContests();
  return entry;
}

export async function rejectEntry(id: string) {
  await requireAuth();

  const entry = await db.contestEntry.update({
    where: { id },
    data: { state: 'REJECTED' },
  });

  revalidateContests();
  return entry;
}

export async function toggleWinner(id: string) {
  await requireAuth();

  const current = await db.contestEntry.findUnique({
    where: { id },
    select: { isWinner: true },
  });

  if (!current) throw new Error('Entry not found');

  const entry = await db.contestEntry.update({
    where: { id },
    data: { isWinner: !current.isWinner },
  });

  revalidateContests();
  return entry;
}

// ── Public submission actions (no auth) ───────────────────────────────────────

export async function submitEntry(data: {
  contestId: string;
  title: string;
  content: string;
  entrantName: string;
  entrantEmail: string;
  fileName?: string;
  fileUrl?: string;
}) {
  const contest = await db.contest.findUnique({
    where: { id: data.contestId },
  });

  if (!contest) throw new Error('Contest not found');

  const stage = deriveStage(contest);
  if (stage !== 'SUBMITTING') {
    throw new Error('This contest is not currently accepting entries');
  }

  const count = wordCount(data.content);

  const entry = await db.contestEntry.create({
    data: {
      contestId: data.contestId,
      title: data.title,
      content: data.content,
      entrantName: data.entrantName,
      entrantEmail: data.entrantEmail,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      wordCount: count,
      state: 'PENDING',
    },
  });

  revalidateContests();
  return entry;
}

export async function castVote(data: {
  contestId: string;
  entryId: string;
  voterName: string;
  voterEmail: string;
  ip?: string;
}) {
  const contest = await db.contest.findUnique({
    where: { id: data.contestId },
  });

  if (!contest) throw new Error('Contest not found');

  const stage = deriveStage(contest);
  if (stage !== 'VOTING') {
    throw new Error('This contest is not currently accepting votes');
  }

  const token = generateToken();
  const ip = data.ip ? anonymizeIp(data.ip) : undefined;

  const vote = await db.vote.create({
    data: {
      contestId: data.contestId,
      entryId: data.entryId,
      voterName: data.voterName,
      voterEmail: data.voterEmail,
      token,
      ip,
      status: 'PENDING',
    },
  });

  return vote;
}

export async function confirmVote(token: string) {
  const vote = await db.vote.findUnique({ where: { token } });

  if (!vote) throw new Error('Vote not found');
  if (vote.status === 'CONFIRMED') throw new Error('Vote already confirmed');

  const confirmed = await db.vote.update({
    where: { token },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  return confirmed;
}
