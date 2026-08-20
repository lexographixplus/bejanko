import Link from 'next/link';
import EditorForm from '../EditorForm';
import { requireAdmin } from '@/lib/content';

export default async function NewPostPage(){await requireAdmin();return <main className="shell"><div className="heroRow"><div><div className="meta">New content</div><h1>Create post</h1></div><Link className="btn" href="/dashboard">Back to content</Link></div><EditorForm/></main>}
