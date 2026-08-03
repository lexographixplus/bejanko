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

export async function createAuthor(data: {
  name: string
  bio?: string
  excerpt?: string
  photo?: string
  role?: string
  link?: string
  published?: boolean
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

  revalidatePath('/about')
  revalidatePath('/dashboard/authors')

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

  revalidatePath('/about')
  revalidatePath('/dashboard/authors')

  return author
}

export async function deleteAuthor(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.authorProfile.delete({ where: { id } })

  revalidatePath('/about')
  revalidatePath('/dashboard/authors')
}
