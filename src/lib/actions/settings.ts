'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

// ── Read actions ──────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany();

  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// ── Mutation actions ──────────────────────────────────────────────────────────

export async function updateSettings(data: Record<string, string>) {
  await requireAuth();

  await db.$transaction(
    Object.entries(data).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  revalidatePath('/');
  revalidatePath('/dashboard/settings');
}
