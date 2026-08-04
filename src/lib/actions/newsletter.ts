'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendNewPostEmail } from '@/lib/email'
import { siteUrl } from '@/lib/site'
import { truncate, stripHtml, generateToken } from '@/lib/utils'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

// ── Subscribers ───────────────────────────────────────

export async function getSubscribers() {
  await requireAuth()

  return db.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getSubscriberCounts() {
  await requireAuth()

  const [confirmed, pending, unsubscribed] = await Promise.all([
    db.subscriber.count({ where: { status: 'CONFIRMED' } }),
    db.subscriber.count({ where: { status: 'PENDING' } }),
    db.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
  ])

  return { confirmed, pending, unsubscribed }
}

export async function removeSubscriber(id: string) {
  await requireAuth()

  await db.subscriber.delete({ where: { id } })
  revalidatePath('/dashboard/subscribers')
}

export async function unsubscribeSubscriber(id: string) {
  await requireAuth()

  await db.subscriber.update({
    where: { id },
    data: { status: 'UNSUBSCRIBED' },
  })
  revalidatePath('/dashboard/subscribers')
}

// ── Import ────────────────────────────────────────────

export interface ImportResult {
  added: number
  updated: number
  skipped: number
  invalid: string[]
}

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/

/**
 * Bulk-adds addresses pasted or uploaded as CSV.
 *
 * Imported addresses land as CONFIRMED: they come from a list the site owner
 * already holds, and putting them through double opt-in would mean emailing
 * people who never asked for a confirmation request. Anyone previously
 * UNSUBSCRIBED is left alone — re-adding them would override a withdrawal of
 * consent, which is exactly what an unsubscribe is meant to prevent.
 */
export async function importSubscribers(
  raw: string,
  opts?: { source?: string }
): Promise<ImportResult> {
  await requireAuth()

  const result: ImportResult = { added: 0, updated: 0, skipped: 0, invalid: [] }

  // Accept CSV, one-per-line, or comma/semicolon separated. If a header row
  // names an email column, use it; otherwise take the first field that parses.
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return result

  let emailIndex = 0
  const header = lines[0].split(/[,;\t]/).map((c) => c.trim().toLowerCase())
  const headerHit = header.findIndex((c) => c.replace(/"/g, '') === 'email')

  if (headerHit !== -1) {
    emailIndex = headerHit
    lines.shift()
  }

  const seen = new Set<string>()
  const emails: string[] = []

  for (const line of lines) {
    const cells = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''))
    const candidate = (cells[emailIndex] ?? cells[0] ?? '').toLowerCase()

    if (!candidate) continue

    if (!EMAIL_RE.test(candidate)) {
      if (result.invalid.length < 10) result.invalid.push(candidate)
      continue
    }

    if (seen.has(candidate)) continue
    seen.add(candidate)
    emails.push(candidate)
  }

  if (emails.length === 0) return result

  const existing = await db.subscriber.findMany({
    where: { email: { in: emails } },
    select: { email: true, status: true },
  })

  const byEmail = new Map(existing.map((s) => [s.email, s.status]))

  for (const email of emails) {
    const status = byEmail.get(email)

    if (status === 'CONFIRMED' || status === 'UNSUBSCRIBED') {
      result.skipped++
      continue
    }

    if (status === 'PENDING') {
      await db.subscriber.update({
        where: { email },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      })
      result.updated++
      continue
    }

    await db.subscriber.create({
      data: {
        email,
        token: generateToken(),
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        source: opts?.source || 'import',
      },
    })
    result.added++
  }

  revalidatePath('/dashboard/subscribers')
  return result
}

// ── Broadcast ─────────────────────────────────────────

export interface BroadcastResult {
  sent: number
  failed: number
  total: number
}

/**
 * Emails confirmed subscribers about a published piece.
 *
 * Deliberately manual rather than fired from `togglePublish`: unpublishing and
 * republishing is a normal editing move and must never re-send. `notifiedAt`
 * records that an issue went out, and resending requires an explicit override.
 */
export async function notifySubscribers(
  kind: 'essay' | 'note',
  id: string,
  opts?: { resend?: boolean }
): Promise<BroadcastResult> {
  await requireAuth()

  // Fetched per branch so the fields differing between the two models stay
  // properly typed rather than collapsing into a union.
  const post =
    kind === 'essay'
      ? await db.essay.findUniqueOrThrow({ where: { id } }).then((e) => ({
          published: e.published,
          notifiedAt: e.notifiedAt,
          slug: e.slug,
          title: e.title,
          excerpt: e.excerpt ?? truncate(stripHtml(e.content), 180),
          readingTime: e.readingTime,
        }))
      : await db.note.findUniqueOrThrow({ where: { id } }).then((n) => ({
          published: n.published,
          notifiedAt: n.notifiedAt,
          slug: n.slug,
          title: n.title || truncate(stripHtml(n.content), 60),
          excerpt: truncate(stripHtml(n.content), 180),
          readingTime: null as number | null,
        }))

  if (!post.published) {
    throw new Error('Publish this piece before emailing subscribers.')
  }

  if (post.notifiedAt && !opts?.resend) {
    throw new Error('Subscribers have already been emailed about this piece.')
  }

  const subscribers = await db.subscriber.findMany({
    where: { status: 'CONFIRMED' },
    select: { email: true, token: true },
  })

  if (subscribers.length === 0) {
    return { sent: 0, failed: 0, total: 0 }
  }

  const url = `${siteUrl()}/${kind === 'essay' ? 'essays' : 'notes'}/${post.slug}`

  // Small concurrent batches: one address at a time is slow on a big list,
  // and all at once trips Resend's rate limit.
  const BATCH = 8
  let sent = 0
  let failed = 0

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)

    const results = await Promise.all(
      batch.map((sub) =>
        sendNewPostEmail({
          to: sub.email,
          token: sub.token,
          kind: kind === 'essay' ? 'Essay' : 'Note',
          title: post.title,
          url,
          excerpt: post.excerpt,
          readingTime: post.readingTime,
        })
      )
    )

    for (const r of results) {
      if (r.ok) sent++
      else failed++
    }
  }

  // Mark as sent even on partial failure so a retry is a deliberate resend
  // rather than an accidental second delivery to everyone who did receive it.
  if (sent > 0) {
    if (kind === 'essay') {
      await db.essay.update({ where: { id }, data: { notifiedAt: new Date() } })
    } else {
      await db.note.update({ where: { id }, data: { notifiedAt: new Date() } })
    }
  }

  revalidatePath(`/dashboard/${kind}s`)
  revalidatePath('/dashboard/subscribers')

  return { sent, failed, total: subscribers.length }
}
