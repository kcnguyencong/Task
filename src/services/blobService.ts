import { upload } from '@vercel/blob/client';

export interface BlobUploadOutcome {
  blobPathname?: string;
  storage: 'vercel_blob' | 'local_only';
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Tải trực tiếp tệp công văn lên Vercel Blob (chế độ Private).
 * Nếu đang chạy Vite thuần (npm run dev) chưa có /api/blob/upload, tự động chuyển sang chế độ xem cục bộ.
 */
export async function uploadDocumentToBlob(file: File): Promise<BlobUploadOutcome> {
  const safeName = sanitizeFileName(file.name) || 'van_ban.pdf';
  const pathname = `cong-van/${Date.now()}-${safeName}`;

  try {
    const result = await upload(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/blob/upload',
    });

    return {
      blobPathname: result.pathname,
      storage: 'vercel_blob',
    };
  } catch {
    return {
      blobPathname: undefined,
      storage: 'local_only',
    };
  }
}

/**
 * Lấy Signed URL tạm thời (15 phút) từ /api/blob/view để hiển thị tệp Private Blob.
 */
export async function getSignedDocumentViewUrl(blobPathname: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/blob/view?pathname=${encodeURIComponent(blobPathname)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url || null;
  } catch {
    return null;
  }
}
