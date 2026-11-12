import { ensureSchema, getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';

interface UpdateProfileBody {
  fullName?: string;
  communeName?: string;
  department?: string;
  role?: string;
}

async function handleUpdateProfile(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfileBody;
    const fullName = (body.fullName ?? user.full_name).trim();
    const communeName = (body.communeName ?? user.commune_name).trim();
    const department = (body.department ?? user.department).trim();
    const role = (body.role ?? user.role).trim();

    if (!fullName || !communeName || !department) {
      return Response.json(
        { error: 'Vui lòng nhập đầy đủ Họ tên, Đơn vị UBND và Phòng ban.' },
        { status: 400 }
      );
    }

    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      UPDATE users
      SET
        full_name = ${fullName},
        commune_name = ${communeName},
        department = ${department},
        role = ${role || user.role}
      WHERE id = ${user.id}
      RETURNING id, username, full_name, role, department, commune_name, created_at
    `;

    return Response.json({ user: rows[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json(
      { error: (error as Error).message || 'Không thể cập nhật cấu hình tài khoản.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<Response> {
  return handleUpdateProfile(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleUpdateProfile(request);
}
