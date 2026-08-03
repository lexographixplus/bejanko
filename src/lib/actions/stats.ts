'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

// ── Dashboard stats (auth required) ──────────────────────────────────────────

export async function getDashboardStats() {
  await requireAuth();

  const [
    essays,
    notes,
    quotes,
    guestPosts,
    books,
    contests,
    unreadMessages,
    pendingEntries,
    pendingGuestPosts,
  ] = await Promise.all([
    db.essay.count(),
    db.note.count(),
    db.quote.count(),
    db.guestPost.count(),
    db.book.count(),
    db.contest.count(),
    db.submission.count({ where: { status: 'NEW' } }),
    db.contestEntry.count({ where: { state: 'PENDING' } }),
    db.guestPost.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    essays,
    notes,
    quotes,
    guestPosts,
    books,
    contests,
    unreadMessages,
    pendingEntries,
    pendingGuestPosts,
  };
}

// ── Recent activity (auth required) ──────────────────────────────────────────

export async function getRecentActivity() {
  await requireAuth();

  const [essays, notes, quotes] = await Promise.all([
    db.essay.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true },
    }),
    db.note.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true },
    }),
    db.quote.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, content: true, source: true, updatedAt: true },
    }),
  ]);

  const items = [
    ...essays.map((e) => ({
      id: e.id,
      type: 'Essay' as const,
      title: e.title,
      updatedAt: e.updatedAt,
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: 'Note' as const,
      title: n.title ?? n.id,
      updatedAt: n.updatedAt,
    })),
    ...quotes.map((q) => ({
      id: q.id,
      type: 'Quote' as const,
      title: q.source
        ? `${q.content.slice(0, 40)}… — ${q.source}`
        : q.content.slice(0, 60),
      updatedAt: q.updatedAt,
    })),
  ];

  return items
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);
}

// ── Public content counts (no auth) ──────────────────────────────────────────

export async function getContentCounts() {
  const [essays, notes, quotes, guestPosts, contests] = await Promise.all([
    db.essay.count({ where: { published: true } }),
    db.note.count({ where: { published: true } }),
    db.quote.count({ where: { published: true } }),
    db.guestPost.count({ where: { published: true } }),
    db.contest.count({ where: { published: true } }),
  ]);

  return {
    essays,
    notes,
    quotes,
    guestPosts,
    contests,
  };
}
