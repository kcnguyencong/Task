import { del } from '@vercel/blob';
import { ensureSchema, getSql } from '../_lib/db';
import { getSessionUser } from '../_lib/auth';

export async function DELETE(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = decodeURIComponent(segments[segments.length - 1] || '');

    if (!id) {
      return Response.json({ error: 'Thiếu mã công việc' }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();

    const rows = await sql`
      SELECT data
      FROM tasks
      WHERE id = ${id} AND user_id = ${user.id}
      LIMIT 1
    `;

    const blobPathname = (
      rows[0]?.data as { originalDoc?: { blobPathname?: string } } | undefined
    )?.originalDoc?.blobPathname;

    await sql`
      DELETE FROM tasks
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (blobPathname) {
      try {
        await del(blobPathname);
      } catch (blobErr) {
        console.warn('Không thể xóa tệp đính kèm trên Vercel Blob:', blobErr);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return Response.json(
      { error: (error as Error).message || 'Không thể xóa công việc' },
      { status: 500 }
    );
  }
}
