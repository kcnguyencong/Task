import { uploadPresigned } from '@vercel/blob/client';

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
 * Tải trực tiếp tệp công văn lên Vercel Blob (chế độ Private, xác thực OIDC + Presigned URL).
 * Nếu đang chạy Vite thuần (npm run dev) chưa có /api/blob/upload, tự động chuyển sang chế độ xem cục bộ.
 */
export async function uploadDocumentToBlob(file: File): Promise<BlobUploadOutcome> {
  const safeName = sanitizeFileName(file.name) || 'van_ban.pdf';
  const pathname = `cong-van/${Date.now()}-${safeName}`;

  try {
    const result = await uploadPresigned(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/blob/upload',
    });

    return {
      blobPathname: result.pathname,
      storage: 'vercel_blob',
    };
  } catch (err) {
    console.warn('Không thể tải lên Vercel Blob, dùng chế độ tạm cục bộ:', err);
    return {
      blobPathname: undefined,
      storage: 'local_only',
    };
  }
}

/**
 * Kiểm tra tệp tồn tại trên Private Blob và trả về URL proxy cùng domain để hiển thị trực tiếp trong iframe.
 */
export async function getSignedDocumentViewUrl(blobPathname: string): Promise<string | null> {
  const viewUrl = `/api/blob/view?pathname=${encodeURIComponent(blobPathname)}`;
  try {
    const res = await fetch(`${viewUrl}&check=1`);
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok ? viewUrl : null;
  } catch {
    return null;
  }
}
