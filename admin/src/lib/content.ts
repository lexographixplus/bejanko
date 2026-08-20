import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

export const postStatuses = ['draft','pending_review','published','rejected','archived'] as const;
export const postTypes = ['essay','note','quote','book'] as const;

export const PostSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  type: z.enum(postTypes),
  title: z.string().min(1),
  excerpt: z.string().default(''),
  coverImage: z.string().default(''),
  readingMinutes: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  startHere: z.boolean().default(false),
  publishedAt: z.string().nullable().default(null),
  status: z.enum(postStatuses),
  author: z.string().default('B.E. Janko Jnr.'),
  bodyHtml: z.string().default(''),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional()
});

export type Post = z.infer<typeof PostSchema>;
export type ContentStore = { version: number; updatedAt: string; posts: Post[] };

const owner = process.env.GITHUB_OWNER || 'lexographixplus';
const repo = process.env.GITHUB_REPO || 'bejanko';
const branch = process.env.GITHUB_BRANCH || 'github-pages-clean';
const token = process.env.GITHUB_TOKEN;
const path = 'content/posts.json';

function headers() {
  if (!token) throw new Error('GITHUB_TOKEN is not configured');
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  if (!email || !allowed.includes(email)) throw new Error('Forbidden');
  return { user, email };
}

export async function readStore(): Promise<ContentStore> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub read failed: ${res.status}`);
  const file = await res.json();
  const json = Buffer.from(file.content, 'base64').toString('utf8');
  const parsed = JSON.parse(json) as ContentStore;
  return { ...parsed, posts: parsed.posts.map(p => PostSchema.parse(p)) };
}

export async function writeStore(store: ContentStore, message: string) {
  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, { headers: headers(), cache: 'no-store' });
  if (!getRes.ok) throw new Error(`GitHub read-before-write failed: ${getRes.status}`);
  const current = await getRes.json();
  const content = Buffer.from(JSON.stringify(store, null, 2) + '\n', 'utf8').toString('base64');
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ message, content, sha: current.sha, branch })
  });
  if (!res.ok) throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function textToSafeHtml(value: string) {
  const escaped = value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  return escaped.split(/\n\s*\n/).filter(Boolean).map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
}
