'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendGuestDecisionEmail } from '@/lib/email'

type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export async function getGuestPosts(opts?: { status?: PostStatus }) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return db.guestPost.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublishedGuestPosts() {
  return db.guestPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getGuestPostBySlug(slug: string) {
  return db.guestPost.findFirst({ where: { slug, published: true } })
}

export async function getGuestPostBySlugAdmin(slug: string) {
  return db.guestPost.findUnique({ where: { slug } })
}

export async function approveGuestPost(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const post = await db.guestPost.update({
    where: { id },
    data: { status: 'APPROVED', published: true },
  })

  // Contributors have no account, so email is the only way they learn the
  // outcome. A delivery failure must not undo the approval.
  await sendGuestDecisionEmail({
    name: post.contributorName,
    email: post.contributorEmail,
    title: post.title,
    slug: post.slug,
    approved: true,
  })

  revalidatePath('/guest-writing')
  revalidatePath('/dashboard/guest-posts')

  return post
}

export async function rejectGuestPost(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const post = await db.guestPost.update({
    where: { id },
    data: { status: 'REJECTED', published: false },
  })

  await sendGuestDecisionEmail({
    name: post.contributorName,
    email: post.contributorEmail,
    title: post.title,
    slug: post.slug,
    approved: false,
  })

  revalidatePath('/guest-writing')
  revalidatePath('/dashboard/guest-posts')

  return post
}

export async function deleteGuestPost(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db.guestPost.delete({ where: { id } })

  revalidatePath('/guest-writing')
  revalidatePath('/dashboard/guest-posts')
}
