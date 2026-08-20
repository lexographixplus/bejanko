import Link from 'next/link';
import { readStore, requireAdmin } from '@/lib/content';
import { transitionPost } from '@/app/actions';

export default async function DashboardPage(){
  await requireAdmin();
  const store=await readStore();
  const counts=Object.fromEntries(['draft','pending_review','published','rejected','archived'].map(s=>[s,store.posts.filter(p=>p.status===s).length]));
  return <main className="shell"><div className="heroRow"><div><div className="meta">Editorial workspace</div><h1>Content</h1><p className="muted">Create, review and publish Mind Substances content.</p></div><Link className="btn primary" href="/dashboard/new">New post</Link></div><section className="grid">{Object.entries(counts).slice(0,4).map(([k,v])=><div className="stat" key={k}><span className="meta">{k.replace('_',' ')}</span><b>{v}</b></div>)}</section><section>{store.posts.map(post=><article className="card" key={post.id}><div><div className="meta">{post.type} · <span className="status">{post.status.replace('_',' ')}</span></div><h3>{post.title}</h3><p className="muted">{post.excerpt || 'No excerpt yet.'}</p></div><div className="actions"><Link className="btn" href={`/dashboard/${post.id}`}>Edit</Link>{post.status==='draft'&&<Action id={post.id} status="pending_review" label="Submit for review"/>}{post.status==='pending_review'&&<><Action id={post.id} status="published" label="Publish" primary/><Action id={post.id} status="rejected" label="Reject"/></>}{post.status==='rejected'&&<Action id={post.id} status="draft" label="Return to draft"/>}{post.status==='published'&&<Action id={post.id} status="archived" label="Archive"/>}{post.status==='archived'&&<Action id={post.id} status="draft" label="Restore draft"/>}</div></article>)}</section></main>;
}

function Action({id,status,label,primary=false}:{id:string;status:string;label:string;primary?:boolean}){return <form action={transitionPost}><input type="hidden" name="id" value={id}/><input type="hidden" name="status" value={status}/><button className={`btn ${primary?'primary':''}`} type="submit">{label}</button></form>}
