import { del } from '@vercel/blob';
import { ensureSchema, getSql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/auth.js';

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

    const taskData = rows[0]?.data as {
      originalDoc?: { blobPathname?: string };
      attachments?: Array<{ blobPathname?: string }>;
    } | undefined;

    const pathnamesToDelete = new Set<string>();
    if (taskData?.originalDoc?.blobPathname) {
      pathnamesToDelete.add(taskData.originalDoc.blobPathname);
    }
    if (Array.isArray(taskData?.attachments)) {
      for (const att of taskData.attachments) {
        if (att?.blobPathname) {
          pathnamesToDelete.add(att.blobPathname);
        }
      }
    }

    await sql`
      DELETE FROM tasks
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    for (const pathname of pathnamesToDelete) {
      try {
        await del(pathname);
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
