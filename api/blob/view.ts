import { get, head } from '@vercel/blob';
import { getSessionUser } from '../_lib/auth.js';

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Vui lòng đăng nhập để xem văn bản.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');
    const checkOnly = searchParams.get('check') === '1';

    if (!pathname) {
      return Response.json({ error: 'Thiếu tham số pathname' }, { status: 400 });
    }

    if (checkOnly) {
      const meta = await head(pathname);
      return Response.json({ ok: true, contentType: meta.contentType });
    }

    const result = await get(pathname, { access: 'private' });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return Response.json({ error: 'Không tìm thấy văn bản trên Vercel Blob' }, { status: 404 });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType || 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || 'Không thể tải văn bản từ Vercel Blob' },
      { status: 500 }
    );
  }
}
