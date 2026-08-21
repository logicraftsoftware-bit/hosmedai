import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { ensureSchema, pool } from './db.js';

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
if (!username || !password || password.length < 12) {
  console.error('Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters.');
  process.exit(1);
}

try {
  await ensureSchema();
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    `INSERT INTO admins (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, hash]
  );
  console.log(`Admin account '${username}' is ready.`);
} finally {
  await pool.end();
}
