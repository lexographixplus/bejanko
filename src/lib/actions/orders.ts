'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type OrderStatus = 'NEW' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

export async function getOrders(opts?: { status?: OrderStatus }) {
  await requireAuth()

  return db.bookOrder.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { book: { select: { title: true, slug: true } } },
  })
}

export async function getNewOrderCount() {
  await requireAuth()
  return db.bookOrder.count({ where: { status: 'NEW' } })
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAuth()

  const order = await db.bookOrder.update({ where: { id }, data: { status } })

  revalidatePath('/dashboard/orders')
  return order
}

export async function setOrderNotes(id: string, notes: string) {
  await requireAuth()

  const order = await db.bookOrder.update({
    where: { id },
    data: { notes: notes.trim() || null },
  })

  revalidatePath('/dashboard/orders')
  return order
}

export async function deleteOrder(id: string) {
  await requireAuth()

  await db.bookOrder.delete({ where: { id } })

  revalidatePath('/dashboard/orders')
}
