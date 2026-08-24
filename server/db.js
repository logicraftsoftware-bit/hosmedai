import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS content_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NULL,
    body LONGTEXT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_updated (status, updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const blogColumns = {
    category: "VARCHAR(120) NULL AFTER image_url",
    author: "VARCHAR(160) NULL AFTER category",
    published_at: "DATETIME NULL AFTER author",
    seo_title: "VARCHAR(255) NULL AFTER published_at",
    seo_description: "VARCHAR(500) NULL AFTER seo_title",
  };
  for (const [column, definition] of Object.entries(blogColumns)) {
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM content_items LIKE '${column}'`,
    );
    if (!columns.length)
      await pool.query(
        `ALTER TABLE content_items ADD COLUMN ${column} ${definition}`,
      );
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS page_settings (
    page_key VARCHAR(80) PRIMARY KEY,
    page_name VARCHAR(120) NOT NULL,
    page_title VARCHAR(255) NULL,
    seo_description VARCHAR(500) NULL,
    hero_title VARCHAR(255) NULL,
    hero_subtitle TEXT NULL,
    body LONGTEXT NULL,
    image_url VARCHAR(500) NULL,
    sections JSON NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [pageColumns] = await pool.query(
    "SHOW COLUMNS FROM page_settings LIKE 'sections'",
  );
  if (!pageColumns.length)
    await pool.query(
      "ALTER TABLE page_settings ADD COLUMN sections JSON NULL AFTER image_url",
    );
  await pool.query(`CREATE TABLE IF NOT EXISTS website_settings (
    id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    header_logo VARCHAR(500) NULL,
    footer_logo VARCHAR(500) NULL,
    email VARCHAR(255) NULL,
    phones JSON NULL,
    address TEXT NULL,
    social_links JSON NULL,
    header_settings JSON NULL,
    footer_settings JSON NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  for (const column of ["header_settings", "footer_settings"]) {
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM website_settings LIKE '${column}'`,
    );
    if (!columns.length)
      await pool.query(
        `ALTER TABLE website_settings ADD COLUMN ${column} JSON NULL AFTER social_links`,
      );
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS gallery_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    star_rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    review TEXT NOT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_testimonial_status (status, updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS policy_pages (
    policy_key VARCHAR(40) PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    body LONGTEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try {
    const [[galleryCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM gallery_images",
    );
    if (!Number(galleryCount.total))
      await pool.query(
        "INSERT INTO gallery_images (image_url, original_name) VALUES ?",
        [
          ["/assets/images/donations/donation-1-1.jpg", "HosmedAI gallery 1"],
          ["/assets/images/donations/donation-1-2.jpg", "HosmedAI gallery 2"],
          ["/assets/images/donations/donation-1-3.jpg", "HosmedAI gallery 3"],
          ["/assets/images/donations/donation-1-4.jpg", "HosmedAI gallery 4"],
          ["/assets/images/donations/donation-1-5.jpg", "HosmedAI gallery 5"],
        ],
      );

    const [[testimonialCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM testimonials",
    );
    if (!Number(testimonialCount.total))
      await pool.query(
        "INSERT INTO testimonials (project_name, client_name, star_rating, review, status) VALUES ?",
        [
          [
            "Integrated Healthcare Project",
            "Hospital Leadership Team",
            5,
            "HosmedAI brought planning, compliance and technology together with a practical understanding of hospital operations.",
            "published",
          ],
          [
            "NABH Readiness Programme",
            "Quality Management Team",
            5,
            "Their structured approach helped our team improve workflows, documentation and accreditation readiness.",
            "published",
          ],
          [
            "Hospital Development Project",
            "Clinical Planning Team",
            5,
            "Their planning team translated complex clinical requirements into clear, practical workflows for our hospital.",
            "published",
          ],
          [
            "Connected Hospital Programme",
            "Digital Transformation Team",
            5,
            "The integrated approach to technology and operations gave our leadership team better visibility and control.",
            "published",
          ],
        ],
      );

    const [[blogCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM content_items",
    );
    if (!Number(blogCount.total))
      await pool.query(
        "INSERT INTO content_items (title, slug, excerpt, body, image_url, category, author, published_at, seo_title, seo_description, status) VALUES ?",
        [
          [
            "Preparing Your Hospital for NABH Accreditation",
            "preparing-your-hospital-for-nabh-accreditation",
            "A practical roadmap for building quality systems and accreditation readiness.",
            "Learn how structured planning, documentation, training and internal audits prepare hospitals for NABH accreditation.",
            "/assets/images/blog/blog-1-1.jpg",
            "Healthcare",
            "HosmedAI Editorial Team",
            new Date("2026-08-26T09:00:00Z"),
            "Preparing Your Hospital for NABH Accreditation",
            "A practical NABH accreditation readiness guide for hospitals.",
            "published",
          ],
          [
            "Building a Connected Hospital with ERP, HIS and AI",
            "building-a-connected-hospital-with-erp-his-and-ai",
            "Connect hospital workflows, teams and decisions through one digital ecosystem.",
            "Explore how ERP, HIS, EMR and AI can work together to improve visibility, efficiency and patient care.",
            "/assets/images/blog/blog-1-2.jpg",
            "Healthcare",
            "HosmedAI Editorial Team",
            new Date("2026-03-27T09:00:00Z"),
            "Building a Connected Hospital with ERP, HIS and AI",
            "How integrated hospital technology supports smarter healthcare operations.",
            "published",
          ],
          [
            "Planning Future-Ready Hospitals",
            "planning-future-ready-hospitals",
            "Design hospital infrastructure and workflows for safety, efficiency and growth.",
            "Future-ready hospitals begin with coordinated clinical planning, infrastructure, equipment and operational workflows.",
            "/assets/images/blog/blog-1-3.jpg",
            "Hospital Planning",
            "HosmedAI Editorial Team",
            new Date("2026-06-03T09:00:00Z"),
            "Planning Future-Ready Hospitals",
            "Key principles for planning efficient and scalable hospitals.",
            "published",
          ],
          [
            "AI and Analytics for Smarter Hospital Operations",
            "ai-and-analytics-for-smarter-hospital-operations",
            "Turn hospital data into timely operational intelligence and better decisions.",
            "Discover how dashboards, analytics and purposeful AI help healthcare leaders improve hospital performance.",
            "/assets/images/blog/blog-1-4.jpg",
            "Healthcare AI",
            "HosmedAI Editorial Team",
            new Date("2026-07-18T09:00:00Z"),
            "AI and Analytics for Smarter Hospital Operations",
            "Using healthcare AI and analytics to improve hospital operations.",
            "published",
          ],
        ],
      );
  } catch (error) {
    console.error("Optional home content seed skipped:", error.message);
  }
}
