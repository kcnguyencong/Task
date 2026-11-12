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

function compactDocumentText(raw: string): string {
  // Cắt bỏ phần Nơi nhận / Lưu VT ở cuối văn bản và gộp khoảng trắng thừa để giảm input token
  const cleaned = raw
    .replace(/\nNơi nhận\s*:[\s\S]*$/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.slice(0, 12000);
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

    const compactText = compactDocumentText(text);

    const prompt = `Trợ lý hành chính công cho "${role}" - "${department}", UBND "${communeName}". Tệp: "${fileName}".
Trích xuất JSON thông tin và các đầu việc CÓ THẬT trong văn bản (không bịa thêm):
- "actionPlan": ưu tiên bóc tách từng ý (a, b, c...) giao trực tiếp cho UBND cấp xã/phường hoặc phòng ban chuyên môn.
- "title" & mỗi "actionPlan.title": ngắn gọn <= 90 ký tự.
- "deadline": DD/MM/YYYY nếu có ngày cụ thể, không có thì "".

VĂN BẢN:
${compactText}`;

    parts.push({ text: prompt });

    const model = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const requestBody = (includeThinkingConfig: boolean) =>
      JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          ...(includeThinkingConfig ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
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
      });

    let geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: requestBody(true),
    });

    if (geminiRes.status === 400) {
      geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25000),
        body: requestBody(false),
      });
    }

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
