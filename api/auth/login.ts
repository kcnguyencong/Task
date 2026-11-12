import { ensureSchema, getSql, verifyPassword } from '../_lib/db.js';
import { buildSessionCookie } from '../_lib/auth.js';

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as LoginBody;
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!username || !password) {
      return Response.json(
        { error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' },
        { status: 400 }
      );
    }

    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT id, username, password_hash, full_name, role, department, commune_name, created_at
      FROM users
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' },
        { status: 401 }
      );
    }

    const row = rows[0] as {
      id: number;
      username: string;
      password_hash: string;
      full_name: string;
      role: string;
      department: string;
      commune_name: string;
      created_at: string;
    };

    if (!verifyPassword(password, row.password_hash)) {
      return Response.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' },
        { status: 401 }
      );
    }

    const user = {
      id: row.id,
      username: row.username,
      full_name: row.full_name,
      role: row.role,
      department: row.department,
      commune_name: row.commune_name,
      created_at: row.created_at,
    };

    return Response.json(
      { user },
      {
        status: 200,
        headers: {
          'Set-Cookie': buildSessionCookie({ id: row.id, username: row.username }),
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: (error as Error).message || 'Lỗi máy chủ khi đăng nhập' },
      { status: 500 }
    );
  }
}
