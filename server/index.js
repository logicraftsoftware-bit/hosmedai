import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { ensureSchema, pool } from "./db.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadDir = path.join(root, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const app = express();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32)
  throw new Error("JWT_SECRET must contain at least 32 characters.");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadDir, { maxAge: "1d", index: false }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) =>
    done(
      null,
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.mimetype,
      ),
    ),
});

async function saveAsWebp(file) {
  const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
  await sharp(file.buffer, { animated: true })
    .rotate()
    .webp({ quality: 82, effort: 4 })
    .toFile(path.join(uploadDir, filename));
  return { filename, url: `/uploads/${filename}` };
}

function requireAdmin(req, res, next) {
  try {
    req.admin = jwt.verify(req.cookies.hosmed_admin, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Please sign in." });
  }
}

app.post(
  "/api/admin/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }),
  async (req, res) => {
    const username = String(req.body.username || "").trim();
    const [rows] = await pool.execute(
      "SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1",
      [username],
    );
    if (
      !rows[0] ||
      !(await bcrypt.compare(
        String(req.body.password || ""),
        rows[0].password_hash,
      ))
    )
      return res.status(401).json({ error: "Invalid username or password." });
    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username },
      jwtSecret,
      { expiresIn: "8h" },
    );
    res.cookie("hosmed_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ username: rows[0].username });
  },
);
app.post("/api/admin/logout", (_req, res) => {
  res.clearCookie("hosmed_admin");
  res.status(204).end();
});
app.get("/api/admin/me", requireAdmin, (req, res) =>
  res.json({ username: req.admin.username }),
);
app.get("/api/admin/content", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM content_items ORDER BY updated_at DESC",
  );
  res.json(rows);
});
app.get("/api/admin/pages", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM page_settings ORDER BY page_name",
  );
  res.json(rows);
});
app.get("/api/admin/website-settings", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM website_settings WHERE id=1");
  res.json(rows[0] || null);
});
app.put("/api/admin/website-settings", requireAdmin, async (req, res) => {
  const cleanList = (value) =>
    Array.isArray(value)
      ? value
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];
  const socialLinks = Array.isArray(req.body.social_links)
    ? req.body.social_links
        .map((item) => ({
          icon: String(item.icon || "").trim(),
          link: String(item.link || "").trim(),
        }))
        .filter((item) => item.icon || item.link)
        .slice(0, 20)
    : [];
  const objectJson = (value) =>
    JSON.stringify(
      value && typeof value === "object" && !Array.isArray(value) ? value : {},
    );
  const values = [
    String(req.body.header_logo || ""),
    String(req.body.footer_logo || ""),
    String(req.body.email || "").trim(),
    JSON.stringify(cleanList(req.body.phones)),
    String(req.body.address || "").trim(),
    JSON.stringify(socialLinks),
    objectJson(req.body.header_settings),
    objectJson(req.body.footer_settings),
  ];
  await pool.execute(
    `INSERT INTO website_settings (id,header_logo,footer_logo,email,phones,address,social_links,header_settings,footer_settings) VALUES (1,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE header_logo=VALUES(header_logo),footer_logo=VALUES(footer_logo),email=VALUES(email),phones=VALUES(phones),address=VALUES(address),social_links=VALUES(social_links),header_settings=VALUES(header_settings),footer_settings=VALUES(footer_settings)`,
    values,
  );
  const [rows] = await pool.query("SELECT * FROM website_settings WHERE id=1");
  res.json(rows[0]);
});
app.get("/api/admin/pages/:key", requireAdmin, async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM page_settings WHERE page_key=? LIMIT 1",
    [req.params.key],
  );
  res.json(rows[0] || null);
});
app.put("/api/admin/pages/:key", requireAdmin, async (req, res) => {
  const key = String(req.params.key)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  const value = (field) => String(req.body[field] || "").trim();
  const sections =
    req.body.sections &&
    typeof req.body.sections === "object" &&
    !Array.isArray(req.body.sections)
      ? req.body.sections
      : {};
  const sectionsJson = JSON.stringify(sections);
  if (sectionsJson.length > 750000)
    return res.status(413).json({ error: "Page sections are too large." });
  const values = [
    key,
    value("page_name"),
    value("page_title"),
    value("seo_description"),
    value("hero_title"),
    value("hero_subtitle"),
    String(req.body.body || ""),
    value("image_url"),
    sectionsJson,
    req.body.status === "published" ? "published" : "draft",
  ];
  if (!key || !values[1])
    return res.status(400).json({ error: "Page name is required." });
  await pool.execute(
    `INSERT INTO page_settings (page_key,page_name,page_title,seo_description,hero_title,hero_subtitle,body,image_url,sections,status)
    VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE page_name=VALUES(page_name),page_title=VALUES(page_title),seo_description=VALUES(seo_description),hero_title=VALUES(hero_title),hero_subtitle=VALUES(hero_subtitle),body=VALUES(body),image_url=VALUES(image_url),sections=VALUES(sections),status=VALUES(status)`,
    values,
  );
  const [rows] = await pool.execute(
    "SELECT * FROM page_settings WHERE page_key=?",
    [key],
  );
  res.json(rows[0]);
});
app.post(
  "/api/admin/upload",
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    if (!req.file)
      return res
        .status(400)
        .json({ error: "Choose a JPG, PNG, WebP, or GIF image under 5 MB." });
    try {
      const image = await saveAsWebp(req.file);
      res.status(201).json({ url: image.url });
    } catch (error) {
      next(error);
    }
  },
);

app.get("/api/admin/gallery", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM gallery_images ORDER BY created_at DESC, id DESC",
  );
  res.json(rows);
});
app.post(
  "/api/admin/gallery",
  requireAdmin,
  upload.array("images", 30),
  async (req, res, next) => {
    if (!req.files?.length)
      return res.status(400).json({ error: "Choose at least one image." });
    const savedFiles = [];
    const created = [];
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const file of req.files) {
        const saved = await saveAsWebp(file);
        savedFiles.push(saved.filename);
        const [result] = await connection.execute(
          "INSERT INTO gallery_images (image_url, original_name) VALUES (?, ?)",
          [saved.url, String(file.originalname || "").slice(0, 255)],
        );
        created.push({
          id: result.insertId,
          image_url: saved.url,
          original_name: file.originalname,
        });
      }
      await connection.commit();
      res.status(201).json(created);
    } catch (error) {
      await connection.rollback();
      await Promise.all(
        savedFiles.map((filename) =>
          fs.promises.unlink(path.join(uploadDir, filename)).catch(() => {}),
        ),
      );
      next(error);
    } finally {
      connection.release();
    }
  },
);
app.delete("/api/admin/gallery/:id", requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT image_url FROM gallery_images WHERE id=? LIMIT 1",
      [req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Gallery image not found." });
    await pool.execute("DELETE FROM gallery_images WHERE id=?", [
      req.params.id,
    ]);
    const filename = path.basename(rows[0].image_url);
    if (rows[0].image_url === `/uploads/${filename}`)
      await fs.promises.unlink(path.join(uploadDir, filename)).catch(() => {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

function contentValues(body) {
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!title || !slug) throw new Error("Title and slug are required.");
  return [
    title,
    slug,
    String(body.excerpt || ""),
    String(body.body || ""),
    String(body.image_url || ""),
    String(body.category || "")
      .trim()
      .slice(0, 120),
    String(body.author || "")
      .trim()
      .slice(0, 160),
    body.published_at ? new Date(body.published_at) : null,
    String(body.seo_title || "")
      .trim()
      .slice(0, 255),
    String(body.seo_description || "")
      .trim()
      .slice(0, 500),
    body.status === "published" ? "published" : "draft",
  ];
}
const contentError = (error, res) =>
  res.status(error.code === "ER_DUP_ENTRY" ? 409 : 400).json({
    error:
      error.code === "ER_DUP_ENTRY"
        ? "That slug already exists."
        : error.message,
  });
app.post("/api/admin/content", requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO content_items (title, slug, excerpt, body, image_url, category, author, published_at, seo_title, seo_description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      contentValues(req.body),
    );
    const [rows] = await pool.execute(
      "SELECT * FROM content_items WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    contentError(error, res);
  }
});
app.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
  try {
    await pool.execute(
      "UPDATE content_items SET title=?, slug=?, excerpt=?, body=?, image_url=?, category=?, author=?, published_at=?, seo_title=?, seo_description=?, status=? WHERE id=?",
      [...contentValues(req.body), req.params.id],
    );
    const [rows] = await pool.execute(
      "SELECT * FROM content_items WHERE id = ?",
      [req.params.id],
    );
    rows[0]
      ? res.json(rows[0])
      : res.status(404).json({ error: "Content not found." });
  } catch (error) {
    contentError(error, res);
  }
});
app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
  const [result] = await pool.execute(
    "DELETE FROM content_items WHERE id = ?",
    [req.params.id],
  );
  res.status(result.affectedRows ? 204 : 404).end();
});

const testimonialValues = (body) => {
  const projectName = String(body.project_name || "").trim();
  const clientName = String(body.client_name || "").trim();
  const review = String(body.review || "").trim();
  if (!projectName || !clientName || !review)
    throw new Error("Project name, client name and review are required.");
  return [
    projectName.slice(0, 255),
    clientName.slice(0, 255),
    Math.min(5, Math.max(1, Number(body.star_rating) || 5)),
    review,
    body.status === "draft" ? "draft" : "published",
  ];
};
app.get("/api/admin/testimonials", requireAdmin, async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM testimonials ORDER BY updated_at DESC, id DESC",
  );
  res.json(rows);
});
app.post("/api/admin/testimonials", requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO testimonials (project_name,client_name,star_rating,review,status) VALUES (?,?,?,?,?)",
      testimonialValues(req.body),
    );
    const [rows] = await pool.execute("SELECT * FROM testimonials WHERE id=?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.put("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "UPDATE testimonials SET project_name=?,client_name=?,star_rating=?,review=?,status=? WHERE id=?",
      [...testimonialValues(req.body), req.params.id],
    );
    if (!result.affectedRows)
      return res.status(404).json({ error: "Testimonial not found." });
    const [rows] = await pool.execute("SELECT * FROM testimonials WHERE id=?", [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
  const [result] = await pool.execute("DELETE FROM testimonials WHERE id=?", [
    req.params.id,
  ]);
  res.status(result.affectedRows ? 204 : 404).end();
});

const policyTitles = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  cookie: "Cookie Policy",
};
app.get("/api/admin/policies/:key", requireAdmin, async (req, res) => {
  if (!policyTitles[req.params.key])
    return res.status(404).json({ error: "Policy not found." });
  const [rows] = await pool.execute(
    "SELECT * FROM policy_pages WHERE policy_key=?",
    [req.params.key],
  );
  res.json(
    rows[0] || {
      policy_key: req.params.key,
      title: policyTitles[req.params.key],
      body: "",
    },
  );
});
app.put("/api/admin/policies/:key", requireAdmin, async (req, res) => {
  const key = req.params.key;
  if (!policyTitles[key])
    return res.status(404).json({ error: "Policy not found." });
  const body = String(req.body.body || "");
  if (body.length > 750000)
    return res.status(413).json({ error: "Policy content is too large." });
  await pool.execute(
    "INSERT INTO policy_pages (policy_key,title,body) VALUES (?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),body=VALUES(body)",
    [key, policyTitles[key], body],
  );
  const [rows] = await pool.execute(
    "SELECT * FROM policy_pages WHERE policy_key=?",
    [key],
  );
  res.json(rows[0]);
});
app.get("/api/content", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id,title,slug,excerpt,body,image_url,updated_at FROM content_items WHERE status='published' ORDER BY updated_at DESC",
  );
  res.json(rows);
});
app.get("/api/content/:slug", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id,title,slug,excerpt,body,image_url,updated_at FROM content_items WHERE status='published' AND slug=? LIMIT 1",
    [req.params.slug],
  );
  rows[0]
    ? res.json(rows[0])
    : res.status(404).json({ error: "Content not found." });
});
app.get("/api/pages/:key", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT page_key,page_name,page_title,seo_description,hero_title,hero_subtitle,body,image_url,sections,updated_at FROM page_settings WHERE page_key=? AND status='published' LIMIT 1",
    [req.params.key],
  );
  rows[0]
    ? res.json(rows[0])
    : res.status(404).json({ error: "Published page settings not found." });
});
app.get("/api/website-settings", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT header_logo,footer_logo,email,phones,address,social_links,header_settings,footer_settings,updated_at FROM website_settings WHERE id=1",
  );
  res.json(rows[0] || {});
});

const dist = path.join(root, "dist");
app.use(
  express.static(dist, {
    maxAge: "1y",
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html"))
        res.setHeader("Cache-Control", "no-cache");
    },
  }),
);
app.get(/.*/, (_req, res) =>
  res.set("Cache-Control", "no-cache").sendFile(path.join(dist, "index.html")),
);
app.use((error, _req, res, _next) =>
  res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 500).json({
    error:
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be under 5 MB."
        : "Server error.",
  }),
);

await ensureSchema();
app.listen(Number(process.env.PORT || 3000), () =>
  console.log(`HosmedAI server listening on port ${process.env.PORT || 3000}`),
);
