import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorForm from '../EditorForm';
import { readStore, requireAdmin } from '@/lib/content';

export default async function EditPostPage({params}:{params:Promise<{id:string}>}){await requireAdmin();const {id}=await params;const store=await readStore();const post=store.posts.find(p=>p.id===id);if(!post)notFound();return <main className="shell"><div className="heroRow"><div><div className="meta">{post.type} · {post.status.replace('_',' ')}</div><h1>Edit post</h1><p className="muted">Changes save back to the public content repository.</p></div><Link className="btn" href="/dashboard">Back to content</Link></div><EditorForm post={post}/></main>}
