'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ── Read ──────────────────────────────────────────────

export async function getQuotes(opts?: { published?: boolean }) {
  return db.quote.findMany({
    where: opts?.published === true ? { published: true } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

// ── Mutations ─────────────────────────────────────────

export async function createQuote(data: {
  content: string
  source?: string
  aside?: string
  published?: boolean
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const quote = await db.quote.create({
    data: {
      ...data,
      authorId: session.user.id!,
    },
  })

  revalidatePath('/quotes')
  revalidatePath('/')
  revalidatePath('/dashboard/quotes')

  return quote
}

export async function updateQuote(
  id: string,
  data: {
    content?: string
    source?: string
    aside?: string
    published?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const quote = await db.quote.update({
    where: { id },
    data,
  })

  revalidatePath('/quotes')
  revalidatePath('/')
  revalidatePath('/dashboard/quotes')

  return quote
}

export async function deleteQuote(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.quote.delete({ where: { id } })

  revalidatePath('/quotes')
  revalidatePath('/')
  revalidatePath('/dashboard/quotes')
}

export async function togglePublish(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const quote = await db.quote.findUniqueOrThrow({ where: { id } })

  const updated = await db.quote.update({
    where: { id },
    data: { published: !quote.published },
  })

  revalidatePath('/quotes')
  revalidatePath('/')
  revalidatePath('/dashboard/quotes')

  return updated
}
