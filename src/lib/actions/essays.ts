'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { readingTime } from '@/lib/utils'
import { uniqueSlug } from '@/lib/slug'

// ── Read ──────────────────────────────────────────────

export async function getEssays(opts?: { published?: boolean }) {
  return db.essay.findMany({
    where: opts?.published === true ? { published: true } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getEssayBySlug(slug: string) {
  const essay = await db.essay.findUnique({ where: { slug } })
  if (!essay) return null

  // Fetch all published essays ordered by createdAt asc to determine neighbours
  const published = await db.essay.findMany({
    where: { published: true },
    orderBy: { createdAt: 'asc' },
    select: { slug: true, title: true },
  })

  const idx = published.findIndex((e) => e.slug === slug)

  const prev = idx > 0 ? published[idx - 1] : null
  const next = idx !== -1 && idx < published.length - 1 ? published[idx + 1] : null

  return { ...essay, prev, next }
}

export async function getStartHereEssays() {
  return db.essay.findMany({
    where: { published: true, startHere: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRecentEssays(limit = 3) {
  return db.essay.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// ── Mutations ─────────────────────────────────────────

export async function createEssay(data: {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  aside?: string
  startHere?: boolean
  published?: boolean
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await uniqueSlug('essay', data.title)
  const rt = readingTime(data.content)

  const essay = await db.essay.create({
    data: {
      ...data,
      slug,
      readingTime: rt,
      authorId: session.user.id!,
    },
  })

  revalidatePath('/essays')
  revalidatePath('/')
  revalidatePath('/dashboard/essays')

  return essay
}

export async function updateEssay(
  id: string,
  data: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    coverImage?: string
    aside?: string
    startHere?: boolean
    published?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const update: typeof data & { readingTime?: number } = { ...data }

  if (data.content) {
    update.readingTime = readingTime(data.content)
  }

  if (data.title && !data.slug) {
    update.slug = await uniqueSlug('essay', data.title, id)
  }

  const essay = await db.essay.update({
    where: { id },
    data: update,
  })

  revalidatePath('/essays')
  revalidatePath('/')
  revalidatePath('/dashboard/essays')

  return essay
}

export async function deleteEssay(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.essay.delete({ where: { id } })

  revalidatePath('/essays')
  revalidatePath('/')
  revalidatePath('/dashboard/essays')
}

export async function togglePublish(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const essay = await db.essay.findUniqueOrThrow({ where: { id } })

  const updated = await db.essay.update({
    where: { id },
    data: { published: !essay.published },
  })

  revalidatePath('/essays')
  revalidatePath('/')
  revalidatePath('/dashboard/essays')

  return updated
}

export async function toggleStartHere(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const essay = await db.essay.findUniqueOrThrow({ where: { id } })

  const updated = await db.essay.update({
    where: { id },
    data: { startHere: !essay.startHere },
  })

  revalidatePath('/essays')
  revalidatePath('/')
  revalidatePath('/dashboard/essays')

  return updated
}
