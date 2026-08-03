'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { SubmissionStatus, SubmissionKind } from '@prisma/client';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

// ── Revalidation helper ───────────────────────────────────────────────────────

function revalidateMessages() {
  revalidatePath('/dashboard/messages');
}

// ── Read actions ──────────────────────────────────────────────────────────────

export async function getMessages(opts?: {
  status?: SubmissionStatus;
  kind?: SubmissionKind;
}) {
  await requireAuth();

  return db.submission.findMany({
    where: {
      ...(opts?.status ? { status: opts.status } : {}),
      ...(opts?.kind ? { kind: opts.kind } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMessage(id: string) {
  await requireAuth();

  return db.submission.findUnique({ where: { id } });
}

// ── Status mutation actions (auth required) ───────────────────────────────────

export async function markRead(id: string) {
  await requireAuth();

  const message = await db.submission.update({
    where: { id },
    data: { status: 'READ' },
  });

  revalidateMessages();
  return message;
}

export async function markReplied(id: string) {
  await requireAuth();

  const message = await db.submission.update({
    where: { id },
    data: { status: 'REPLIED' },
  });

  revalidateMessages();
  return message;
}

export async function markSpam(id: string) {
  await requireAuth();

  const message = await db.submission.update({
    where: { id },
    data: { status: 'SPAM' },
  });

  revalidateMessages();
  return message;
}

export async function deleteMessage(id: string) {
  await requireAuth();

  await db.submission.delete({ where: { id } });

  revalidateMessages();
}
