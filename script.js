const menu=document.querySelector('.menu-btn');const links=document.querySelector('.nav-links');if(menu&&links){menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));}document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

const root=document.body?.dataset.root||'./';
const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const postHref=post=>`${root}essays/#${encodeURIComponent(post.slug)}`;
const published=post=>post.status==='published';

function renderStartHere(posts){const target=document.querySelector('[data-start-here]');if(!target)return;const items=posts.filter(p=>published(p)&&p.startHere).slice(0,3);if(!items.length)return;target.innerHTML=items.map((p,i)=>`<a class="reading-item" href="${postHref(p)}"><div class="reading-num">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div><div class="reading-time">${Number(p.readingMinutes)||1} min read</div></a>`).join('');}

function renderRecent(posts){const target=document.querySelector('[data-recent-writing]');if(!target)return;const items=posts.filter(p=>published(p)&&p.type==='essay').sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,3);if(!items.length)return;target.innerHTML=items.map(p=>`<a class="card" href="${postHref(p)}">${p.coverImage?`<img class="card-img" alt="" src="${esc(p.coverImage)}">`:''}<div class="card-body"><div class="meta"><span>Essay</span><span>${Number(p.readingMinutes)||1} min</span></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></a>`).join('');}

function renderEssayArchive(posts){const target=document.querySelector('[data-essay-archive]');if(!target)return;const items=posts.filter(p=>published(p)&&p.type==='essay').sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));if(!items.length)return;target.innerHTML=items.map(p=>`<article class="card" id="${esc(p.slug)}">${p.coverImage?`<img class="card-img" src="${esc(p.coverImage)}" alt="">`:''}<div class="card-body"><div class="meta"><span>Essay</span><span>${Number(p.readingMinutes)||1} min read</span></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div></article>`).join('');}

async function loadPublicContent(){try{const response=await fetch(`${root}content/posts.json`,{cache:'no-cache'});if(!response.ok)throw new Error(`Content request failed: ${response.status}`);const data=await response.json();const posts=Array.isArray(data.posts)?data.posts:[];renderStartHere(posts);renderRecent(posts);renderEssayArchive(posts);}catch(error){console.warn('Mind Substances content adapter: using embedded fallback content.',error);}}

loadPublicContent();