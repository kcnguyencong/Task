import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { Task, OrganizationInfo } from '../types';

export async function exportTaskToDocx(
  task: Task,
  locality?: OrganizationInfo
): Promise<void> {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const communeName = locality?.communeName || 'XÃ DỊ SỬ';
  const districtName = locality?.districtName || 'Huyện Mỹ Hào';
  const chairmanName = locality?.chairmanName || 'Đào Văn Hùng';
  const shortCommune = communeName.replace(/^(?:Xã|Phường|Thị\s*trấn)\s+/i, '').trim();

  // Tạo tiêu đề đầu trang theo Nghị định 30/2020/NĐ-CP về công tác văn thư
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          // Cột trái: Cơ quan ban hành
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ỦY BAN NHÂN DÂN',
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: communeName.toUpperCase(),
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Số:       /BC-UBND',
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
          // Cột phải: Quốc hiệu, tiêu ngữ
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    underline: {},
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${shortCommune}, ngày ${day} tháng ${month} năm ${year}`,
                    italics: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Tên báo cáo
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 150 },
    children: [
      new TextRun({
        text: 'BÁO CÁO',
        bold: true,
        size: 28,
        font: 'Times New Roman',
      }),
    ],
  });

  const subtitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: task.title.toUpperCase(),
        bold: true,
        size: 24,
        font: 'Times New Roman',
      }),
    ],
  });

  // Mảng các đoạn văn cho các phần
  const contentParagraphs: Paragraph[] = [];

  task.sections.forEach(section => {
    // Tiêu đề mục (VD: I. ĐÁNH GIÁ TÌNH HÌNH CHUNG)
    contentParagraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: `${section.number}. ${section.title}`,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Nội dung mục, tách theo dòng
    const lines = section.content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        contentParagraphs.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 }, // Thụt đầu dòng 1.27cm
            children: [
              new TextRun({
                text: trimmed,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          })
        );
      }
    });
  });

  // Chân trang: Nơi nhận và Chữ ký
  const footerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 300 },
                children: [
                  new TextRun({
                    text: 'Nơi nhận:\n',
                    bold: true,
                    italics: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: `- UBND ${districtName} (để b/c);\n- Thường trực Đảng ủy xã;\n- Thường trực HĐND xã;\n- Lãnh đạo UBND xã;\n- Lưu: VT.`,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 300 },
                children: [
                  new TextRun({
                    text: 'TM. ỦY BAN NHÂN DÂN\n',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: 'CHỦ TỊCH\n\n\n\n\n',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: chairmanName,
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.5cm
              bottom: 1440,
              left: 1728, // 3cm (lề chuẩn văn thư)
              right: 1152, // 2cm
            },
          },
        },
        children: [
          headerTable,
          titleParagraph,
          subtitleParagraph,
          ...contentParagraphs,
          footerTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${task.title.replace(/[\/\s:]+/g, '_')}_ChinhThuc.docx`;
  saveAs(blob, fileName);
}
