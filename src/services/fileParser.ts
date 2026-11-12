import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { fixVietnameseOcrText } from './aiService';

// Configure pdfjs worker for browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
  width?: number;
  transform?: number[];
}

function reconstructPdfPageText(items: PdfTextItem[]): string {
  let pageText = '';
  let prevY: number | null = null;
  let prevEndX: number | null = null;

  for (const item of items) {
    const str = item.str ?? '';
    const transform = Array.isArray(item.transform) ? item.transform : [];
    const x = typeof transform[4] === 'number' ? transform[4] : null;
    const y = typeof transform[5] === 'number' ? transform[5] : null;
    const fontSize = typeof transform[0] === 'number' && transform[0] > 0 ? Math.abs(transform[0]) : 11;
    const width = typeof item.width === 'number' ? item.width : 0;

    if (prevY !== null && y !== null) {
      const dy = Math.abs(y - prevY);
      if (dy > fontSize * 1.6) {
        pageText += '\n\n';
        prevEndX = null;
      } else if (dy > 3) {
        pageText += '\n';
        prevEndX = null;
      }
    }

    if (str.length > 0) {
      if (
        prevEndX !== null &&
        x !== null &&
        !pageText.endsWith('\n') &&
        !pageText.endsWith(' ') &&
        !str.startsWith(' ') &&
        x - prevEndX > fontSize * 0.16
      ) {
        pageText += ' ';
      }
      pageText += str;
    }

    if (item.hasEOL) {
      pageText += '\n';
      prevEndX = null;
    } else if (x !== null) {
      prevEndX = x + width;
    }

    if (y !== null && str.trim().length > 0) {
      prevY = y;
    }
  }

  return pageText;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    // 1. Text-based files (.txt, .md, .csv)
    if (extension === 'txt' || extension === 'md' || extension === 'csv' || extension === 'log') {
      const text = await file.text();
      return fixVietnameseOcrText(text);
    }

    // 2. Word documents (.docx)
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return fixVietnameseOcrText(result.value);
      }
    }

    // 3. PDF documents (.pdf) - giữ nguyên ngắt dòng và bố cục đoạn văn
    if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = reconstructPdfPageText(textContent.items as PdfTextItem[]);
        fullText += pageText + '\n\n';
      }

      if (fullText.trim().length > 0) {
        return fixVietnameseOcrText(fullText);
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc nội dung file thực tế:', err);
  }

  // Fallback return empty string if couldn't parse text directly
  return '';
}
