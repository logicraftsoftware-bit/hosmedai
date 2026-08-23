import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ensureSchema, pool } from './db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadDir = path.join(root, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const app = express();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir, { maxAge: '1d', index: false }));

const upload = multer({
  storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, done) => done(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) => done(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype))
});

function requireAdmin(req, res, next) {
  try { req.admin = jwt.verify(req.cookies.hosmed_admin, jwtSecret); next(); }
  catch { res.status(401).json({ error: 'Please sign in.' }); }
}

app.post('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }), async (req, res) => {
  const username = String(req.body.username || '').trim();
  const [rows] = await pool.execute('SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1', [username]);
  if (!rows[0] || !(await bcrypt.compare(String(req.body.password || ''), rows[0].password_hash))) return res.status(401).json({ error: 'Invalid username or password.' });
  const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, jwtSecret, { expiresIn: '8h' });
  res.cookie('hosmed_admin', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
  res.json({ username: rows[0].username });
});
app.post('/api/admin/logout', (_req, res) => { res.clearCookie('hosmed_admin'); res.status(204).end(); });
app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ username: req.admin.username }));
app.get('/api/admin/content', requireAdmin, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM content_items ORDER BY updated_at DESC'); res.json(rows);
});
app.get('/api/admin/pages', requireAdmin, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM page_settings ORDER BY page_name'); res.json(rows);
});
app.get('/api/admin/website-settings', requireAdmin, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM website_settings WHERE id=1'); res.json(rows[0] || null);
});
app.put('/api/admin/website-settings', requireAdmin, async (req, res) => {
  const cleanList = value => Array.isArray(value) ? value.map(item => String(item || '').trim()).filter(Boolean).slice(0, 20) : [];
  const socialLinks = Array.isArray(req.body.social_links) ? req.body.social_links.map(item => ({ icon: String(item.icon || '').trim(), link: String(item.link || '').trim() })).filter(item => item.icon || item.link).slice(0, 20) : [];
  const values = [String(req.body.header_logo || ''), String(req.body.footer_logo || ''), String(req.body.email || '').trim(), JSON.stringify(cleanList(req.body.phones)), String(req.body.address || '').trim(), JSON.stringify(socialLinks)];
  await pool.execute(`INSERT INTO website_settings (id,header_logo,footer_logo,email,phones,address,social_links) VALUES (1,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE header_logo=VALUES(header_logo),footer_logo=VALUES(footer_logo),email=VALUES(email),phones=VALUES(phones),address=VALUES(address),social_links=VALUES(social_links)`, values);
  const [rows] = await pool.query('SELECT * FROM website_settings WHERE id=1'); res.json(rows[0]);
});
app.get('/api/admin/pages/:key', requireAdmin, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM page_settings WHERE page_key=? LIMIT 1', [req.params.key]);
  res.json(rows[0] || null);
});
app.put('/api/admin/pages/:key', requireAdmin, async (req, res) => {
  const key = String(req.params.key).toLowerCase().replace(/[^a-z0-9-]/g, '');
  const value = field => String(req.body[field] || '').trim();
  const values = [key, value('page_name'), value('page_title'), value('seo_description'), value('hero_title'), value('hero_subtitle'), String(req.body.body || ''), value('image_url'), req.body.status === 'published' ? 'published' : 'draft'];
  if (!key || !values[1]) return res.status(400).json({ error: 'Page name is required.' });
  await pool.execute(`INSERT INTO page_settings (page_key,page_name,page_title,seo_description,hero_title,hero_subtitle,body,image_url,status)
    VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE page_name=VALUES(page_name),page_title=VALUES(page_title),seo_description=VALUES(seo_description),hero_title=VALUES(hero_title),hero_subtitle=VALUES(hero_subtitle),body=VALUES(body),image_url=VALUES(image_url),status=VALUES(status)`, values);
  const [rows] = await pool.execute('SELECT * FROM page_settings WHERE page_key=?', [key]); res.json(rows[0]);
});
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a JPG, PNG, WebP, or GIF image under 5 MB.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

function contentValues(body) {
  const title = String(body.title || '').trim();
  const slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  if (!title || !slug) throw new Error('Title and slug are required.');
  return [title, slug, String(body.excerpt || ''), String(body.body || ''), String(body.image_url || ''), body.status === 'published' ? 'published' : 'draft'];
}
const contentError = (error, res) => res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 400).json({ error: error.code === 'ER_DUP_ENTRY' ? 'That slug already exists.' : error.message });
app.post('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute('INSERT INTO content_items (title, slug, excerpt, body, image_url, status) VALUES (?, ?, ?, ?, ?, ?)', contentValues(req.body));
    const [rows] = await pool.execute('SELECT * FROM content_items WHERE id = ?', [result.insertId]); res.status(201).json(rows[0]);
  } catch (error) { contentError(error, res); }
});
app.put('/api/admin/content/:id', requireAdmin, async (req, res) => {
  try {
    await pool.execute('UPDATE content_items SET title=?, slug=?, excerpt=?, body=?, image_url=?, status=? WHERE id=?', [...contentValues(req.body), req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM content_items WHERE id = ?', [req.params.id]);
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Content not found.' });
  } catch (error) { contentError(error, res); }
});
app.delete('/api/admin/content/:id', requireAdmin, async (req, res) => {
  const [result] = await pool.execute('DELETE FROM content_items WHERE id = ?', [req.params.id]); res.status(result.affectedRows ? 204 : 404).end();
});
app.get('/api/content', async (_req, res) => {
  const [rows] = await pool.query("SELECT id,title,slug,excerpt,body,image_url,updated_at FROM content_items WHERE status='published' ORDER BY updated_at DESC"); res.json(rows);
});
app.get('/api/content/:slug', async (req, res) => {
  const [rows] = await pool.execute("SELECT id,title,slug,excerpt,body,image_url,updated_at FROM content_items WHERE status='published' AND slug=? LIMIT 1", [req.params.slug]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Content not found.' });
});
app.get('/api/pages/:key', async (req, res) => {
  const [rows] = await pool.execute("SELECT page_key,page_name,page_title,seo_description,hero_title,hero_subtitle,body,image_url,updated_at FROM page_settings WHERE page_key=? AND status='published' LIMIT 1", [req.params.key]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Published page settings not found.' });
});
app.get('/api/website-settings', async (_req, res) => {
  const [rows] = await pool.query('SELECT header_logo,footer_logo,email,phones,address,social_links,updated_at FROM website_settings WHERE id=1');
  res.json(rows[0] || {});
});

const dist = path.join(root, 'dist');
app.use(express.static(dist, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));
app.get(/.*/, (_req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(dist, 'index.html')));
app.use((error, _req, res, _next) => res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB.' : 'Server error.' }));

await ensureSchema();
app.listen(Number(process.env.PORT || 3000), () => console.log(`HosmedAI server listening on port ${process.env.PORT || 3000}`));
