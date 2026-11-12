import { issueSignedToken, presignUrl } from '@vercel/blob';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return Response.json({ error: 'Thiếu tham số pathname' }, { status: 400 });
    }

    const validUntil = Date.now() + 15 * 60 * 1000; // 15 minutes

    const token = await issueSignedToken({
      pathname,
      operations: ['get'],
      validUntil,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: 'get',
      pathname,
      access: 'private',
      validUntil,
    });

    return Response.json({ url: presignedUrl });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || 'Không thể tạo liên kết xem văn bản' },
      { status: 500 }
    );
  }
}
