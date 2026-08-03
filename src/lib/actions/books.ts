'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uniqueSlug } from '@/lib/slug'

type BookShelf = 'MINE' | 'OTHERS'

export async function getBooks(shelf?: BookShelf) {
  return db.book.findMany({
    where: shelf ? { shelf } : undefined,
    orderBy: { sortOrder: 'asc' },
  })
}

export async function createBook(data: {
  title: string
  content?: string
  excerpt?: string
  coverImage?: string
  bookAuthor?: string
  year?: number
  link?: string
  shelf?: BookShelf
  published?: boolean
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await uniqueSlug('book', data.title)

  const book = await db.book.create({
    data: {
      ...data,
      slug,
    },
  })

  revalidatePath('/books')
  revalidatePath('/dashboard/books')

  return book
}

export async function updateBook(
  id: string,
  data: {
    title?: string
    content?: string
    excerpt?: string
    coverImage?: string
    bookAuthor?: string
    year?: number
    link?: string
    shelf?: BookShelf
    published?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const update: typeof data & { slug?: string } = { ...data }

  if (data.title) {
    update.slug = await uniqueSlug('book', data.title, id)
  }

  const book = await db.book.update({
    where: { id },
    data: update,
  })

  revalidatePath('/books')
  revalidatePath('/dashboard/books')

  return book
}

export async function deleteBook(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.book.delete({ where: { id } })

  revalidatePath('/books')
  revalidatePath('/dashboard/books')
}

export async function reorderBooks(orderedIds: string[]) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.book.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  revalidatePath('/books')
  revalidatePath('/dashboard/books')
}
