'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uniqueSlug } from '@/lib/slug'

export async function getAuthors(opts?: { published?: boolean }) {
  return db.authorProfile.findMany({
    where: opts?.published !== undefined ? { published: opts.published } : undefined,
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getAuthorBySlug(slug: string) {
  return db.authorProfile.findUnique({ where: { slug } })
}

/**
 * Authors for the homepage row. Falls back to the first published profiles so
 * the section still renders before anyone has been marked featured.
 */
export async function getFeaturedAuthors(limit = 3) {
  const featured = await db.authorProfile.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: 'asc' },
    take: limit,
  })

  if (featured.length >= limit) return featured

  const fill = await db.authorProfile.findMany({
    where: {
      published: true,
      id: { notIn: featured.map((a) => a.id) },
    },
    orderBy: { sortOrder: 'asc' },
    take: limit - featured.length,
  })

  return [...featured, ...fill]
}

export async function toggleAuthorFeatured(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const current = await db.authorProfile.findUniqueOrThrow({ where: { id } })

  const author = await db.authorProfile.update({
    where: { id },
    data: { featured: !current.featured },
  })

  revalidateAuthors(author.slug)
  return author
}

export async function createAuthor(data: {
  name: string
  bio?: string
  excerpt?: string
  photo?: string
  role?: string
  link?: string
  published?: boolean
  email?: string
  website?: string
  twitter?: string
  featured?: boolean
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await uniqueSlug('authorProfile', data.name)

  const author = await db.authorProfile.create({
    data: {
      ...data,
      slug,
    },
  })

  revalidateAuthors(author.slug)

  return author
}

export async function updateAuthor(
  id: string,
  data: {
    name?: string
    bio?: string
    excerpt?: string
    photo?: string
    role?: string
    link?: string
    published?: boolean
    email?: string
    website?: string
    twitter?: string
    featured?: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const update: typeof data & { slug?: string } = { ...data }

  if (data.name) {
    update.slug = await uniqueSlug('authorProfile', data.name, id)
  }

  const author = await db.authorProfile.update({
    where: { id },
    data: update,
  })

  revalidateAuthors(author.slug)

  return author
}

export async function deleteAuthor(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const author = await db.authorProfile.delete({ where: { id } })

  revalidateAuthors(author.slug)
}

async function revalidateAuthors(slug?: string) {
  revalidatePath('/about')
  revalidatePath('/authors')
  revalidatePath('/')
  revalidatePath('/dashboard/authors')
  if (slug) revalidatePath(`/authors/${slug}`)
}
