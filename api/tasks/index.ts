import { ensureSchema, getSql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/auth.js';

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT data
      FROM tasks
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    const tasks = rows.map((r) => r.data);
    return Response.json({ tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return Response.json(
      { error: (error as Error).message || 'Không thể tải danh sách công việc' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = (await request.json()) as { task?: { id?: string; [key: string]: unknown } };
    const task = body.task;
    if (!task || !task.id) {
      return Response.json({ error: 'Dữ liệu công việc không hợp lệ' }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();
    const taskJson = JSON.stringify(task);

    await sql`
      INSERT INTO tasks (id, user_id, data, created_at, updated_at)
      VALUES (${task.id}, ${user.id}, ${taskJson}::jsonb, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW()
      WHERE tasks.user_id = ${user.id}
    `;

    return Response.json({ ok: true });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return Response.json(
      { error: (error as Error).message || 'Không thể lưu công việc' },
      { status: 500 }
    );
  }
}
