import React, { useEffect, useState } from 'react';
import './admin.css';

const empty = { title: '', slug: '', excerpt: '', body: '', image_url: '', status: 'draft' };
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers } });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'Something went wrong.'); }
  return response.status === 204 ? null : response.json();
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

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
  return <main className="admin-shell"><header><div><img src="/assets/images/hosmed-ai-logo.png" alt="HosmedAI" /><span>Content Admin</span></div><div><small>{user.username}</small><button onClick={async () => { await api('/api/admin/logout', { method: 'POST' }); setUser(null); }}>Sign out</button></div></header><section className="admin-layout"><form className="admin-editor" onSubmit={save}><div className="admin-title"><h1>{editing ? 'Edit content' : 'Create content'}</h1>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }}>New</button>}</div><label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} required /></label><label>Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required /></label><label>Short description<textarea rows="3" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></label><label>Content<textarea rows="10" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label><div className="admin-upload"><label>Featured image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} /></label>{form.image_url && <img src={form.image_url} alt="Preview" />}</div><label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label>{message && <p className={message.includes('saved') || message.includes('uploaded') ? 'admin-success' : ''}>{message}</p>}<button className="admin-primary">{editing ? 'Update content' : 'Create content'}</button></form><section className="admin-list"><h2>All content <span>{items.length}</span></h2>{items.length === 0 && <p>No content yet. Create your first item.</p>}{items.map(item => <article key={item.id}>{item.image_url ? <img src={item.image_url} alt="" /> : <div className="admin-placeholder">No image</div>}<div><span className={`admin-status ${item.status}`}>{item.status}</span><h3>{item.title}</h3><small>/{item.slug}</small><p>{item.excerpt}</p><button onClick={() => choose(item)}>Edit</button><button className="admin-delete" onClick={() => remove(item)}>Delete</button></div></article>)}</section></section></main>;
}
