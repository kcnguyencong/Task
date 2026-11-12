import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB max per official document
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Vercel Blob private upload completed:', blob.pathname);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
