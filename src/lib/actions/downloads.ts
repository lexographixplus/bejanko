'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

export async function getDownloads() {
  await requireAuth()

  return db.bookDownload.findMany({
    orderBy: { createdAt: 'desc' },
    include: { book: { select: { title: true, slug: true } } },
  })
}

/** Claims per book, for seeing which giveaway actually earned its keep. */
export async function getDownloadStats() {
  await requireAuth()

  const grouped = await db.bookDownload.groupBy({
    by: ['bookId'],
    _count: { _all: true },
    _sum: { downloadCount: true },
  })

  const books = await db.book.findMany({
    where: { id: { in: grouped.map((g) => g.bookId) } },
    select: { id: true, title: true, slug: true },
  })

  return grouped
    .map((g) => {
      const book = books.find((b) => b.id === g.bookId)
      return {
        bookId: g.bookId,
        title: book?.title ?? 'Unknown book',
        slug: book?.slug ?? '',
        claims: g._count._all,
        downloads: g._sum.downloadCount ?? 0,
      }
    })
    .sort((a, b) => b.claims - a.claims)
}

export async function deleteDownload(id: string) {
  await requireAuth()

  await db.bookDownload.delete({ where: { id } })

  revalidatePath('/dashboard/downloads')
}
