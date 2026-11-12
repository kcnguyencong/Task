import { ensureSchema, getSql, hashPassword } from '../_lib/db';
import { buildSessionCookie } from '../_lib/auth';

interface RegisterBody {
  username?: string;
  password?: string;
  fullName?: string;
  communeName?: string;
  department?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as RegisterBody;
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';
    const fullName = (body.fullName || '').trim();
    const communeName = (body.communeName || 'Xã Dị Sử').trim();
    const department = (body.department || 'Phòng Văn hóa - Xã hội').trim();

    if (!username || username.length < 3 || !/^[a-z0-9._@-]+$/.test(username)) {
      return Response.json(
        { error: 'Tên đăng nhập từ 3 ký tự trở lên (chữ không dấu, số, ., _, -, @).' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return Response.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }
    if (!fullName) {
      return Response.json(
        { error: 'Vui lòng nhập họ và tên cán bộ.' },
        { status: 400 }
      );
    }

    await ensureSchema();
    const sql = getSql();
    const existing = await sql`SELECT id FROM users WHERE LOWER(username) = ${username} LIMIT 1`;
    if (existing.length > 0) {
      return Response.json(
        { error: 'Tên đăng nhập này đã tồn tại.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const inserted = await sql`
      INSERT INTO users (username, password_hash, full_name, role, department, commune_name)
      VALUES (${username}, ${passwordHash}, ${fullName}, 'Công chức VH-XH', ${department}, ${communeName})
      RETURNING id, username, full_name, role, department, commune_name, created_at
    `;

    const user = inserted[0] as {
      id: number;
      username: string;
      full_name: string;
      role: string;
      department: string;
      commune_name: string;
      created_at: string;
    };

    return Response.json(
      { user },
      {
        status: 201,
        headers: {
          'Set-Cookie': buildSessionCookie({ id: user.id, username: user.username }),
        },
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { error: (error as Error).message || 'Lỗi máy chủ khi đăng ký' },
      { status: 500 }
    );
  }
}
