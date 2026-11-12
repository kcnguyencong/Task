import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

export interface DbUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  department: string;
  commune_name: string;
  created_at: string;
}

export function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('Thiếu biến môi trường DATABASE_URL hoặc POSTGRES_URL');
  }
  return neon(connectionString);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

let schemaInitPromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'Công chức VH-XH',
          department TEXT NOT NULL DEFAULT 'Phòng Văn hóa - Xã hội',
          commune_name TEXT NOT NULL DEFAULT 'Xã Dị Sử',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`;

      // Tạo tài khoản cán bộ mặc định nếu bảng users chưa có dữ liệu
      const countRows = await sql`SELECT COUNT(*)::int AS total FROM users`;
      const total = Number(countRows[0]?.total ?? 0);
      if (total === 0) {
        const defaultPasswordHash = hashPassword('123456');
        await sql`
          INSERT INTO users (username, password_hash, full_name, role, department, commune_name)
          VALUES ('minhtv', ${defaultPasswordHash}, 'Trần Văn Minh', 'Công chức VH-XH', 'Phòng Văn hóa - Xã hội', 'Xã Dị Sử')
          ON CONFLICT (username) DO NOTHING
        `;
      }
    })().catch((err) => {
      schemaInitPromise = null;
      throw err;
    });
  }

  return schemaInitPromise;
}
