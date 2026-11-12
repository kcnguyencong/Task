import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { cleanVietnameseAdministrativeText } from './aiService';

// Configure pdfjs worker for browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    // 1. Text-based files (.txt, .md, .csv)
    if (extension === 'txt' || extension === 'md' || extension === 'csv' || extension === 'log') {
      const text = await file.text();
      return cleanVietnameseAdministrativeText(text);
    }

    // 2. Word documents (.docx)
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return cleanVietnameseAdministrativeText(result.value);
      }
    }

    // 3. PDF documents (.pdf)
    if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (fullText.trim().length > 0) {
        return cleanVietnameseAdministrativeText(fullText);
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc nội dung file thực tế:', err);
  }

  // Fallback return empty string if couldn't parse text directly
  return '';
}
