'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { stripHtml } from '@/lib/utils'
import { uniqueSlug } from '@/lib/slug'

// ── Helpers ───────────────────────────────────────────

/**
 * Derive a slug from the note title, or fall back to the first few words of
 * the content when no title is provided. Notes are often untitled, so the
 * content fallback is the common path rather than the exception.
 */
function deriveSlug(title: string | undefined, content: string, id?: string) {
  const source =
    title && title.trim()
      ? title
      : stripHtml(content).trim().split(/\s+/).slice(0, 8).join(' ')

  return uniqueSlug('note', source || 'note', id)
}

// ── Read ──────────────────────────────────────────────

export async function getNotes(opts?: { published?: boolean }) {
  return db.note.findMany({
    where: opts?.published === true ? { published: true } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getNoteBySlug(slug: string) {
  return db.note.findUnique({ where: { slug } })
}

// ── Mutations ─────────────────────────────────────────

export async function createNote(data: {
  title?: string
  content: string
  aside?: string
  published?: boolean
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await deriveSlug(data.title, data.content)

  const note = await db.note.create({
    data: {
      ...data,
      slug,
      authorId: session.user.id!,
    },
  })

  revalidatePath('/notes')
  revalidatePath('/')
  revalidatePath('/dashboard/notes')

  return note
}

export async function updateNote(
  id: string,
  data: {
    title?: string
    content?: string
    aside?: string
    published?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const note = await db.note.update({
    where: { id },
    data,
  })

  revalidatePath('/notes')
  revalidatePath('/')
  revalidatePath('/dashboard/notes')

  return note
}

export async function deleteNote(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.note.delete({ where: { id } })

  revalidatePath('/notes')
  revalidatePath('/')
  revalidatePath('/dashboard/notes')
}

export async function togglePublish(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const note = await db.note.findUniqueOrThrow({ where: { id } })

  const updated = await db.note.update({
    where: { id },
    data: { published: !note.published },
  })

  revalidatePath('/notes')
  revalidatePath('/')
  revalidatePath('/dashboard/notes')

  return updated
}
