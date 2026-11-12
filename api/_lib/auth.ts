import crypto from 'node:crypto';
import { ensureSchema, getSql, type DbUser } from './db.js';

const SESSION_COOKIE_NAME = 'ai_workmate_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

interface SessionPayload {
  sub: number;
  username: string;
  exp: number;
}

function getSigningSecret(): string {
  const base =
    process.env.AUTH_SECRET ||
    process.env.BLOB_WEBHOOK_PUBLIC_KEY ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'dev-fallback-secret';
  return crypto.createHash('sha256').update(`ai-workmate:${base}`).digest('hex');
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signToken(payload: SessionPayload): string {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;

  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');

  const a = Buffer.from(providedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!parsed.sub || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

export function buildSessionCookie(user: { id: number; username: string }): string {
  const token = signToken({
    sub: user.id,
    username: user.username,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${isProd ? '; Secure' : ''}`;
}

export function buildClearSessionCookie(): string {
  const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
}

export async function getSessionUser(request: Request): Promise<DbUser | null> {
  const cookies = parseCookies(request.headers.get('cookie'));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, username, full_name, role, department, commune_name, created_at
    FROM users
    WHERE id = ${payload.sub}
    LIMIT 1
  `;

  if (rows.length === 0) return null;
  return rows[0] as DbUser;
}
