import { get } from '@vercel/blob';
import { getSessionUser } from '../_lib/auth.js';

interface AnalyzeRequestBody {
  text?: string;
  fileName?: string;
  blobPathname?: string;
  communeName?: string;
  department?: string;
  role?: string;
}

interface GeminiTaskBreakdown {
  code?: string;
  issuedBy?: string;
  title?: string;
  summary?: string;
  deadline?: string;
  priority?: 'urgent' | 'high' | 'normal';
  type?: 'report' | 'review' | 'plan' | 'directive';
  requiredOutput?: string;
  requiredFiles?: string[];
  actionPlan?: { step: number; title: string; desc: string; role?: string }[];
}

async function streamToBase64(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLength += value.byteLength;
    }
  }

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return Buffer.from(merged).toString('base64');
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as AnalyzeRequestBody;
    const text = (body.text || '').trim();
    const fileName = body.fileName || 'van_ban.pdf';
    const communeName = body.communeName || user.commune_name || 'UBND xã';
    const department = body.department || user.department || 'Phòng Văn hóa - Xã hội';
    const role = body.role || user.role || 'Công chức VH-XH';

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Nếu PDF là bản scan (ít chữ trích xuất được) và có blobPathname, đọc thẳng PDF gửi cho Gemini
    if (text.length < 80 && body.blobPathname && fileName.toLowerCase().endsWith('.pdf')) {
      try {
        const blobResult = await get(body.blobPathname, { access: 'private' });
        if (blobResult && blobResult.statusCode === 200 && blobResult.stream) {
          const base64Pdf = await streamToBase64(blobResult.stream);
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          });
        }
      } catch (err) {
        console.warn('Không đọc được PDF từ Blob để OCR Gemini:', err);
      }
    }

    if (text.length === 0 && parts.length === 0) {
      return Response.json(
        { error: 'Không có nội dung văn bản để AI phân tích.' },
        { status: 400 }
      );
    }

    const prompt = `Bạn là trợ lý nghiệp vụ hành chính công cho cán bộ "${role}" thuộc "${department}", UBND "${communeName}".
Hãy đọc kỹ văn bản hành chính đính kèm (tên tệp: "${fileName}") và bóc tách chính xác các thông tin & đầu việc cần thực hiện.

QUY TẮC BẮT BUỘC:
1. Chỉ trích xuất các thông tin và đầu việc CÓ THẬT trong văn bản, không tự bịa nội dung ngoài văn bản.
2. Trong mục "actionPlan", hãy tập trung bóc tách các nhiệm vụ giao trực tiếp cho **UBND cấp xã / phường** hoặc **phòng ban chuyên môn cấp xã** (nếu văn bản chia mục cho tỉnh, sở, ngành, xã thì ưu tiên bóc tách cụ thể từng ý a, b, c... của mục giao cho UBND xã/phường).
3. Mỗi mục trong "actionPlan" gồm:
   - "step": số thứ tự (1, 2, 3...)
   - "title": tên đầu việc ngắn gọn, rõ hành động (tối đa 90 ký tự)
   - "desc": mô tả cụ thể nội dung cần làm theo văn bản
   - "role": bộ phận/cán bộ thực hiện hoặc phối hợp (ví dụ: "${department}", "Công an xã", "Trường học trên địa bàn")
4. "deadline": định dạng DD/MM/YYYY nếu văn bản nêu rõ ngày hết hạn; nếu văn bản chỉ ghi "định kỳ", "khẩn", hoặc không ghi ngày cụ thể thì trả về chuỗi rỗng "".
5. "title": tên công việc tổng quát ngắn gọn, súc tích bằng tiếng Việt (tối đa 90 ký tự).

NỘI DUNG VĂN BẢN:
${text.slice(0, 30000)}`;

    parts.push({ text: prompt });

    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              code: { type: 'STRING' },
              issuedBy: { type: 'STRING' },
              title: { type: 'STRING' },
              summary: { type: 'STRING' },
              deadline: { type: 'STRING' },
              priority: { type: 'STRING', enum: ['urgent', 'high', 'normal'] },
              type: { type: 'STRING', enum: ['report', 'review', 'plan', 'directive'] },
              requiredOutput: { type: 'STRING' },
              requiredFiles: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              actionPlan: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    step: { type: 'INTEGER' },
                    title: { type: 'STRING' },
                    desc: { type: 'STRING' },
                    role: { type: 'STRING' },
                  },
                  required: ['step', 'title', 'desc'],
                },
              },
            },
            required: ['code', 'issuedBy', 'title', 'summary', 'priority', 'type', 'requiredOutput', 'actionPlan'],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return Response.json(
        { error: `Gemini API lỗi (${geminiRes.status})` },
        { status: 502 }
      );
    }

    const geminiData = (await geminiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return Response.json(
        { error: 'AI không trả về dữ liệu phân tích.' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawJsonText) as GeminiTaskBreakdown;
    return Response.json({ analysis: parsed, model });
  } catch (error) {
    console.error('Analyze route error:', error);
    return Response.json(
      { error: (error as Error).message || 'Lỗi khi phân tích văn bản bằng AI' },
      { status: 500 }
    );
  }
}
