'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { postStatuses, postTypes, readStore, requireAdmin, slugify, textToSafeHtml, writeStore, type Post } from '@/lib/content';

function bool(form: FormData, key: string) { return form.get(key) === 'on'; }
function str(form: FormData, key: string) { return String(form.get(key) || '').trim(); }

export async function savePost(form: FormData) {
  const { email } = await requireAdmin();
  const store = await readStore();
  const now = new Date().toISOString();
  const id = str(form, 'id') || crypto.randomUUID();
  const title = str(form, 'title');
  const type = str(form, 'type');
  if (!title || !postTypes.includes(type as (typeof postTypes)[number])) throw new Error('Title and valid type are required');
  const existing = store.posts.find(p => p.id === id);
  const bodyText = str(form, 'bodyText');
  const post: Post = {
    id,
    slug: str(form, 'slug') || slugify(title),
    type: type as Post['type'],
    title,
    excerpt: str(form, 'excerpt'),
    coverImage: str(form, 'coverImage'),
    readingMinutes: Math.max(0, Number(str(form, 'readingMinutes') || '0')),
    featured: bool(form, 'featured'),
    startHere: bool(form, 'startHere'),
    publishedAt: existing?.publishedAt || null,
    status: existing?.status || 'draft',
    author: str(form, 'author') || 'B.E. Janko Jnr.',
    bodyHtml: textToSafeHtml(bodyText),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    updatedBy: email
  };
  store.posts = existing ? store.posts.map(p => p.id === id ? post : p) : [post, ...store.posts];
  store.updatedAt = now;
  await writeStore(store, `CMS: save ${post.status} ${post.type} ${post.title}`);
  revalidatePath('/dashboard');
  redirect(`/dashboard/${id}?saved=1`);
}

const allowedTransitions: Record<Post['status'], Post['status'][]> = {
  draft: ['pending_review','archived'],
  pending_review: ['draft','published','rejected'],
  published: ['archived'],
  rejected: ['draft','archived'],
  archived: ['draft']
};

export async function transitionPost(form: FormData) {
  const { email } = await requireAdmin();
  const id = str(form, 'id');
  const target = str(form, 'status') as Post['status'];
  if (!postStatuses.includes(target)) throw new Error('Invalid status');
  const store = await readStore();
  const post = store.posts.find(p => p.id === id);
  if (!post) throw new Error('Post not found');
  if (!allowedTransitions[post.status].includes(target)) throw new Error(`Invalid transition: ${post.status} → ${target}`);
  const now = new Date().toISOString();
  post.status = target;
  post.updatedAt = now;
  post.updatedBy = email;
  if (target === 'published' && !post.publishedAt) post.publishedAt = now;
  store.updatedAt = now;
  await writeStore(store, `CMS: ${target} ${post.type} ${post.title}`);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
