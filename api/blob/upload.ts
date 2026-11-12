import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { getSessionUser } from '../_lib/auth';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    if (body.type !== 'blob.upload-completed') {
      const user = await getSessionUser(request);
      if (!user) {
        return Response.json({ error: 'Vui lòng đăng nhập để tải văn bản lên.' }, { status: 401 });
      }
    }

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        const validUntil = Date.now() + 60 * 60 * 1000;
        const allowedContentTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'application/octet-stream',
        ];
        const maximumSizeInBytes = 25 * 1024 * 1024;

        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          validUntil,
          allowedContentTypes,
          maximumSizeInBytes,
        });

        return {
          token,
          urlOptions: {
            validUntil,
            allowedContentTypes,
            maximumSizeInBytes,
            addRandomSuffix: true,
          },
        };
      },
      ...(process.env.VERCEL === '1'
        ? {
            onUploadCompleted: async ({ blob }) => {
              console.log('Vercel Blob private upload completed:', blob.pathname);
            },
          }
        : {}),
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error('Vercel Blob upload route error:', error);
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
