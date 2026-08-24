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
}
