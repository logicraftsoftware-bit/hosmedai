import React, { useEffect, useState } from 'react';

const empty = { title: '', slug: '', excerpt: '', body: '', image_url: '', status: 'draft' };
const websitePages = [
  ['home', 'Home Page', 'fas fa-home'],
  ['about', 'About Page', 'fas fa-hospital-user'],
  ['why-hosmedai', 'Why HosmedAI Page', 'fas fa-shield-alt'],
  ['hospital-planning', 'Hospital Planning Page', 'fas fa-drafting-compass'],
  ['nabh-nabl', 'NABH / NABL Page', 'fas fa-award'],
  ['hospital-software', 'Hospital Software Page', 'fas fa-laptop-medical'],
  ['ai-healthcare', 'AI Healthcare Page', 'fas fa-brain'],
  ['solutions', 'Solutions Page', 'fas fa-th-large'],
  ['who-we-serve', 'Who We Serve Page', 'fas fa-users'],
  ['projects', 'Projects Page', 'fas fa-briefcase-medical'],
  ['contact', 'Contact Page', 'fas fa-envelope']
];
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers } });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'Something went wrong.'); }
  return response.status === 204 ? null : response.json();
}

function PageEditor({ pageKey }) {
  const pageName = websitePages.find(([key]) => key === pageKey)?.[1] || pageKey;
  const blank = { page_name: pageName, page_title: '', seo_description: '', hero_title: '', hero_subtitle: '', body: '', image_url: '', status: 'draft' };
  const [page, setPage] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setLoading(true); setMessage('');
    api(`/api/admin/pages/${pageKey}`).then(data => setPage(data || blank)).catch(error => setMessage(error.message)).finally(() => setLoading(false));
  }, [pageKey]);
  const change = event => setPage(current => ({ ...current, [event.target.name]: event.target.value }));
  const save = async event => {
    event.preventDefault(); setMessage('Saving…');
    try { setPage(await api(`/api/admin/pages/${pageKey}`, { method: 'PUT', body: JSON.stringify(page) })); setMessage('Page settings saved.'); }
    catch (error) { setMessage(error.message); }
  };
  const upload = async event => {
    if (!event.target.files[0]) return;
    const data = new FormData(); data.append('image', event.target.files[0]); setMessage('Uploading…');
    try { const result = await api('/api/admin/upload', { method: 'POST', body: data }); setPage(current => ({ ...current, image_url: result.url })); setMessage('Image uploaded. Save the page to keep it.'); }
    catch (error) { setMessage(error.message); }
  };
  if (loading) return <section className="admin-page-editor"><p>Loading page settings…</p></section>;
  return <form className="admin-page-editor" onSubmit={save}><div className="admin-page-heading"><div><small>Website Settings</small><h1>{pageName}</h1><p>Manage the primary content and search information for this page.</p></div><a href={pageKey === 'home' ? '/' : `/${pageKey}`} target="_blank" rel="noreferrer">View page <i className="fas fa-external-link-alt" /></a></div><div className="admin-page-fields"><label>Browser/SEO title<input name="page_title" value={page.page_title || ''} onChange={change} placeholder={`${pageName} | HosmedAI`} /></label><label>SEO description<textarea name="seo_description" rows="3" maxLength="500" value={page.seo_description || ''} onChange={change} /></label><label>Hero heading<input name="hero_title" value={page.hero_title || ''} onChange={change} /></label><label>Hero supporting text<textarea name="hero_subtitle" rows="4" value={page.hero_subtitle || ''} onChange={change} /></label><label>Page content<textarea name="body" rows="12" value={page.body || ''} onChange={change} placeholder="Add the main page content here…" /></label><div className="admin-upload admin-page-upload"><label>Hero / featured image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} /></label>{page.image_url && <img src={page.image_url} alt="Page preview" />}</div><label>Publishing status<select name="status" value={page.status || 'draft'} onChange={change}><option value="draft">Draft</option><option value="published">Published</option></select></label>{message && <p className={message.includes('saved') || message.includes('uploaded') ? 'admin-success' : 'admin-error'}>{message}</p>}<button className="admin-primary">Save page settings</button></div></form>;
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [section, setSection] = useState('page');
  const [pageKey, setPageKey] = useState('home');

  const load = async () => setItems(await api('/api/admin/content'));
  useEffect(() => { api('/api/admin/me').then(data => { setUser(data); return load(); }).catch(() => {}).finally(() => setChecking(false)); }, []);
  const login = async event => {
    event.preventDefault(); setMessage('');
    const data = new FormData(event.currentTarget);
    try { const signedIn = await api('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) }); setUser(signedIn); await load(); }
    catch (error) { setMessage(error.message); }
  };
  const save = async event => {
    event.preventDefault(); setMessage('Saving…');
    try {
      await api(editing ? `/api/admin/content/${editing}` : '/api/admin/content', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setForm(empty); setEditing(null); setMessage('Content saved.'); await load();
    } catch (error) { setMessage(error.message); }
  };
  const choose = item => { setEditing(item.id); setForm({ title: item.title, slug: item.slug, excerpt: item.excerpt || '', body: item.body || '', image_url: item.image_url || '', status: item.status }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async item => { if (!confirm(`Delete “${item.title}”?`)) return; await api(`/api/admin/content/${item.id}`, { method: 'DELETE' }); if (editing === item.id) { setEditing(null); setForm(empty); } await load(); };
  const upload = async event => {
    const data = new FormData(); data.append('image', event.target.files[0]); setMessage('Uploading…');
    try { const result = await api('/api/admin/upload', { method: 'POST', body: data }); setForm(current => ({ ...current, image_url: result.url })); setMessage('Image uploaded.'); }
    catch (error) { setMessage(error.message); }
  };
  if (checking) return <main className="admin-shell admin-center">Loading…</main>;
  if (!user) return <main className="admin-shell admin-center"><form className="admin-login" onSubmit={login}><img src="/assets/images/hosmed-ai-logo.png" alt="HosmedAI" /><h1>Admin sign in</h1><label>Username<input name="username" autoComplete="username" required autoFocus /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{message && <p className="admin-error">{message}</p>}<button>Sign in</button><a href="/">← Back to website</a></form></main>;
  const contentLibrary = <section className="admin-layout"><form className="admin-editor" onSubmit={save}><div className="admin-title"><h1>{editing ? 'Edit content' : 'Create content'}</h1>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }}>New</button>}</div><label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} required /></label><label>Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required /></label><label>Short description<textarea rows="3" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></label><label>Content<textarea rows="10" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label><div className="admin-upload"><label>Featured image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} /></label>{form.image_url && <img src={form.image_url} alt="Preview" />}</div><label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label>{message && <p className={message.includes('saved') || message.includes('uploaded') ? 'admin-success' : ''}>{message}</p>}<button className="admin-primary">{editing ? 'Update content' : 'Create content'}</button></form><section className="admin-list"><h2>All content <span>{items.length}</span></h2>{items.length === 0 && <p>No content yet. Create your first item.</p>}{items.map(item => <article key={item.id}>{item.image_url ? <img src={item.image_url} alt="" /> : <div className="admin-placeholder">No image</div>}<div><span className={`admin-status ${item.status}`}>{item.status}</span><h3>{item.title}</h3><small>/{item.slug}</small><p>{item.excerpt}</p><button onClick={() => choose(item)}>Edit</button><button className="admin-delete" onClick={() => remove(item)}>Delete</button></div></article>)}</section></section>;
  return <main className="admin-shell"><header><div><img src="/assets/images/hosmed-ai-logo.png" alt="HosmedAI" /><span>Website Admin</span></div><div><small>{user.username}</small><button onClick={async () => { await api('/api/admin/logout', { method: 'POST' }); setUser(null); }}>Sign out</button></div></header><div className="admin-dashboard"><aside className="admin-sidebar"><div className="admin-sidebar-title"><i className="fas fa-sliders-h" /><span>Website Settings</span></div><nav>{websitePages.map(([key, label, icon]) => <button key={key} className={section === 'page' && pageKey === key ? 'active' : ''} onClick={() => { setSection('page'); setPageKey(key); }}><i className={icon} /><span>{label}</span></button>)}</nav><div className="admin-sidebar-title admin-sidebar-title--secondary"><i className="fas fa-folder-open" /><span>Content</span></div><button className={`admin-library-link ${section === 'content' ? 'active' : ''}`} onClick={() => setSection('content')}><i className="fas fa-file-alt" /><span>Content Library</span></button></aside><section className="admin-workspace">{section === 'page' ? <PageEditor pageKey={pageKey} /> : contentLibrary}</section></div></main>;
}
