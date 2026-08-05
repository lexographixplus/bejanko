'use server'

import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uniqueSlug } from '@/lib/slug'
import {
  parseBuyLinks,
  parseBookFiles,
  type BuyLink,
  type BookFile,
} from '@/lib/books'

type BookShelf = 'MINE' | 'OTHERS'

// ── Read ──────────────────────────────────────────────

export async function getBooks(shelf?: BookShelf) {
  return db.book.findMany({
    where: shelf ? { shelf } : undefined,
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getPublishedBooks(shelf?: BookShelf) {
  return db.book.findMany({
    where: { published: true, ...(shelf ? { shelf } : {}) },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getBookBySlug(slug: string) {
  return db.book.findUnique({ where: { slug } })
}

/**
 * The book highlighted on the homepage: the one explicitly marked featured,
 * else the first of the author's own books so the section is never empty.
 */
export async function getFeaturedBook() {
  const featured = await db.book.findFirst({
    where: { published: true, featured: true },
    orderBy: { sortOrder: 'asc' },
  })
  if (featured) return featured

  return db.book.findFirst({
    where: { published: true, shelf: 'MINE' },
    orderBy: { sortOrder: 'asc' },
  })
}

// ── Mutations ─────────────────────────────────────────

interface BookInput {
  title: string
  subtitle?: string | null
  content?: string
  excerpt?: string
  coverImage?: string
  bookAuthor?: string
  year?: number | null
  link?: string
  shelf?: BookShelf
  published?: boolean
  publisher?: string | null
  isbn?: string | null
  pages?: number | null
  format?: string | null
  price?: string | null
  buyLinks?: BuyLink[]
  featured?: boolean
  files?: BookFile[]
  downloadOpen?: boolean
}

export async function createBook(data: BookInput) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await uniqueSlug('book', data.title)
  const { buyLinks, files, ...rest } = data

  const book = await db.book.create({
    data: {
      ...rest,
      slug,
      // Prisma's Json input type doesn't accept an interface array directly.
      buyLinks: buyLinks
        ? (parseBuyLinks(buyLinks) as unknown as Prisma.InputJsonValue)
        : undefined,
      files: files
        ? (parseBookFiles(files) as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  })

  revalidateBooks(book.slug)
  return book
}

export async function updateBook(id: string, data: Partial<BookInput>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const { buyLinks, files, ...rest } = data
  const update: Record<string, unknown> = { ...rest }

  if (buyLinks !== undefined)
    update.buyLinks = parseBuyLinks(buyLinks) as unknown as Prisma.InputJsonValue
  if (files !== undefined)
    update.files = parseBookFiles(files) as unknown as Prisma.InputJsonValue
  if (data.title) update.slug = await uniqueSlug('book', data.title, id)

  const book = await db.book.update({ where: { id }, data: update })

  revalidateBooks(book.slug)
  return book
}

export async function deleteBook(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const book = await db.book.delete({ where: { id } })

  revalidateBooks(book.slug)
}

export async function toggleBookFeatured(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const current = await db.book.findUniqueOrThrow({ where: { id } })

  // Only one book is featured at a time, so clear the rest when setting one.
  if (!current.featured) {
    await db.book.updateMany({
      where: { featured: true },
      data: { featured: false },
    })
  }

  const book = await db.book.update({
    where: { id },
    data: { featured: !current.featured },
  })

  revalidateBooks(book.slug)
  return book
}

export async function reorderBooks(orderedIds: string[]) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.book.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  revalidateBooks()
}

async function revalidateBooks(slug?: string) {
  revalidatePath('/books')
  revalidatePath('/')
  revalidatePath('/dashboard/books')
  if (slug) revalidatePath(`/books/${slug}`)
}
