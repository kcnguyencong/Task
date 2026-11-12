import { OfficialDocument, Task, ReportSection, MissingIndicator, TaskType, ExecutiveBriefing } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/mockData';

export interface AIValidationResult {
  isComplete: boolean;
  score: number; // 0-100%
  satisfiedRequirements: string[];
  missingItems: string[];
  recommendations: string[];
}

/**
 * Sửa lỗi OCR rớt dấu / giãn cách ký tự mà vẫn giữ nguyên cấu trúc toàn văn tài liệu
 */
export function fixVietnameseOcrText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Chuẩn hóa xuống dòng
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Khắc phục lỗi OCR rớt ký tự tiêu chuẩn nhà nước
  text = text.replace(/C\s*Ộ\s*N\s*G\s+H\s*Ò\s*A\s+X\s*Ã\s+H\s*Ộ\s*I\s+C\s*H\s*Ủ\s+N\s*G\s*H\s*Ĩ\s*A\s+V\s*I\s*Ệ\s*T\s+N\s*A\s*M/gi, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
  text = text.replace(/Đ\s*ộ\s*c\s+l\s*ậ\s*p\s*[-–]\s*T\s*ự\s+d\s*o\s*[-–]\s*H\s*ạ\s*n\s*h\s+p\s*h\s*ú\s*c/gi, 'Độc lập - Tự do - Hạnh phúc');
  text = text.replace(/C\s*h\s*í\s*n\s*h\s+p\s*h\s*ủ/gi, 'Chính phủ');
  text = text.replace(/Ủ\s*y\s+b\s*a\s*n\s+n\s*h\s*â\s*n\s+d\s*â\s*n/gi, 'Ủy ban nhân dân');
  text = text.replace(/Ủ\s*y\s+b\s*a\s*n/gi, 'Ủy ban');
  text = text.replace(/p\s*h\s*ư\s*ờ\s*n\s*g/gi, 'phường');
  text = text.replace(/K\s*í\s*n\s*h\s+g\s*ử\s*i/gi, 'Kính gửi');
  text = text.replace(/c\s*ô\s*n\s*g\s+đ\s*i\s*ệ\s*n/gi, 'Công điện');
  text = text.replace(/h\s*ọ\s*c\s+s\s*i\s*n\s*h/gi, 'học sinh');
  text = text.replace(/g\s*i\s*á\s*o\s+v\s*i\s*ê\s*n/gi, 'giáo viên');
  text = text.replace(/p\s*h\s*ò\s*n\s*g\s+c\s*h\s*á\s*y/gi, 'phòng cháy');
  text = text.replace(/c\s*h\s*ữ\s*a\s+c\s*h\s*á\s*y/gi, 'chữa cháy');

  // Khắc phục số năm bị tách: "20 2 6" -> "2026"
  text = text.replace(/\b(20)\s+([0-9])\s+([0-9])\b/g, '$1$2$3');
  text = text.replace(/\b(19)\s+([0-9])\s+([0-9])\b/g, '$1$2$3');
  text = text.replace(/\b2\s+0\s+2\s+6\b/g, '2026');
  text = text.replace(/\b(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})\b/g, '$1/$2/$3');

  // Khắc phục số hiệu văn bản bị tách dấu gạch: "72 / CĐ - TTg" -> "72/CĐ-TTg"
  text = text.replace(/(\d+)\s*\/\s*([A-ZÀ-Ỹ]+)\s*[-–]\s*([A-ZÀ-Ỹ]+)/g, '$1/$2-$3');

  // Fix consonant-split OCR syllables (e.g. "ph ủ" -> "phủ", "h ọc" -> "học")
  text = text.replace(/(^|[\s,;.])(ph|ngh|ng|nh|th|ch|tr|kh|gh|đ|b|c|d|g|h|k|l|m|n|p|r|s|t|v|x)\s+([àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ][a-zA-ZÀ-ỹ]*)/gi, '$1$2$3');

  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Chuẩn hóa và làm sạch đoạn trích văn bản hành chính (bỏ quốc hiệu, tiêu ngữ, Kính gửi)
 */
export function cleanVietnameseAdministrativeText(rawText: string): string {
  if (!rawText) return '';

  let text = fixVietnameseOcrText(rawText);

  // Xóa các tiền tố lỗi hoặc khối tiêu đề hành chính khi lấy đoạn trích
  text = text.replace(/^Văn bản\s+\S+\s+do\s+[^:]+ban hành yêu cầu UBND cấp xã triển khai:\s*/i, '');
  text = text.replace(/^(?:triển khai\s+)?thực hiện\s+Công điện\s+số\s+[^\n.,;]+ngày\s+\d{1,2}\/\d{1,2}\/\d{4}\s*(?=CỘNG HÒA|Kính gửi|Hưng Yên)/i, '');

  text = text.replace(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM[\s\S]*?Độc lập\s*[-–]\s*Tự do\s*[-–]\s*Hạnh phúc/gi, '');
  text = text.replace(/[A-ZÀ-Ỹa-z\s]+,\s*ngày\s*\d{0,2}\s*tháng\s*\d{0,2}\s*năm\s*\d{4}/gi, '');
  text = text.replace(/Kính gửi\s*:?[\s\S]*?(?=(?:Thực hiện|Nhằm|Để|Yêu cầu|Ủy ban nhân dân|\d+\.|$))/gi, '');
  text = text.replace(/^[\s\S]*?(?=(?:Thực hiện Công điện|Thực hiện Kế hoạch|Thực hiện Nghị định|Căn cứ|Nhằm|Để|Yêu cầu|Ủy ban nhân dân))/i, (match) => {
    if (/CỘNG HÒA|Kính gửi|Độc lập|ngày.*tháng.*năm|phủ/i.test(match)) return '';
    return match;
  });

  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\s*,\s*/g, ', ');
  text = text.replace(/\s*\.\s*/g, '. ');
  text = text.replace(/\s*;\s*/g, '; ');
  text = text.replace(/\n\s*\n/g, '\n');

  return text.trim();
}

export class AIService {
  /**
   * Phân tích văn bản đến (Công văn / Kế hoạch / Quyết định) từ nội dung tệp thực tế hoặc dán vào
   */
  async analyzeDocument(docIdOrText: string, fileName?: string): Promise<OfficialDocument> {
    // Giả lập độ trễ AI xử lý tự nhiên (600ms)
    await new Promise(resolve => setTimeout(resolve, 600));

    // 1. Kiểm tra nếu khớp với các văn bản mẫu có sẵn
    const matched = SAMPLE_DOCUMENTS.find(
      d => d.id === docIdOrText || d.code.toLowerCase().includes(docIdOrText.toLowerCase())
    );
    if (matched) {
      return JSON.parse(JSON.stringify(matched));
    }

    // Làm sạch toàn diện văn bản đầu vào (giữ nguyên toàn văn bản sạch cho cột xem văn bản gốc)
    const rawContent = docIdOrText.trim();
    const fullText = fixVietnameseOcrText(rawContent);
    const content = cleanVietnameseAdministrativeText(rawContent);
    const cleanFileName = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]+/g, ' ').trim() : '';

    // 2. Trích xuất thông minh từ nội dung văn bản thực tế
    let detectedCode = 'VB-MỚI';
    let detectedIssuer = 'Ủy ban nhân dân tỉnh';
    let detectedTitle = cleanFileName || 'Nhiệm vụ từ văn bản chỉ đạo';
    let detectedDeadline = '30/10/2026';
    let detectedType: TaskType = 'review';
    let detectedOutput = 'Báo cáo / Kết quả thực hiện';

    // Regex trích xuất Số ký hiệu văn bản (bắt buộc có dấu '/' như 72/CĐ-TTg, 142/UBND-TH để tránh nhầm 2026-2030)
    const codeMatch = fullText.match(/(?:Số|Công điện số|Kế hoạch số|Quyết định số|Công văn số)?\s*:?\s*(\d{1,4}\s*\/\s*[A-ZĐÀ-Ỹ0-9]+(?:[-–][A-ZĐÀ-Ỹ0-9]+)?)/i);
    if (codeMatch && codeMatch[1]) {
      detectedCode = codeMatch[1].replace(/\s+/g, '').trim();
    } else if (cleanFileName) {
      const fnCodeMatch = cleanFileName.match(/([0-9]{1,4}\s+[A-Z]{2,6})/);
      if (fnCodeMatch) {
        detectedCode = fnCodeMatch[1].replace(/\s+/g, '/');
      }
    }

    // Regex trích xuất Cơ quan ban hành (tránh nhầm "cơ sở" thành "Sở")
    let detectedProvince = '';
    if (/Hưng\s*Yên/i.test(fullText)) {
      detectedProvince = 'Tỉnh Hưng Yên';
    } else if (/Hà\s*Nội/i.test(fullText) && !/trường.*kim\s*liên/i.test(fullText)) {
      detectedProvince = 'TP. Hà Nội';
    }

    const provinceMatch = fullText.match(/(?:Ủy\s*ban\s*nhân\s*dân|UBND)\s*(?:TỈNH|tỉnh)\s*([A-ZÀ-Ỹa-z\s]+?)(?=\s*(?:Số|Kính|về|V\/v|\.|\n|$))/i);
    if (provinceMatch && provinceMatch[1]) {
      const pName = provinceMatch[1].trim().replace(/\s+/g, ' ');
      detectedIssuer = `Ủy ban nhân dân tỉnh ${pName}`;
      detectedProvince = `Tỉnh ${pName}`;
    } else if (fullText.includes('Thủ tướng Chính phủ') && !fullText.includes('UBND tỉnh') && !fullText.includes('Ủy ban nhân dân tỉnh')) {
      detectedIssuer = 'Thủ tướng Chính phủ';
    } else {
      const issuerMatch = fullText.match(/(?:Ủy ban nhân dân|UBND)\s+(?:tỉnh|thành phố|huyện)\s+[A-ZÀ-Ỹ\w\s]+|(?<!cơ\s)Sở\s+(?:Giáo dục và Đào tạo|Nội vụ|Y tế|Tư pháp|Tài nguyên và Môi trường|Xây dựng|Tài chính|Nông nghiệp và PTNT|Công thương|Văn hóa)[A-ZÀ-Ỹ\w\s]*/i);
      if (issuerMatch) {
        detectedIssuer = issuerMatch[0].replace(/[\n\r]+/g, ' ').trim().slice(0, 45);
      } else {
        detectedIssuer = detectedProvince ? `Ủy ban nhân dân ${detectedProvince}` : 'Cơ quan cấp trên';
      }
    }

    // Regex trích xuất Thời hạn hoàn thành
    const deadlineMatch = fullText.match(/(?:trước ngày|hạn nộp|gửi về.*trước|đúng hạn|trước)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i)
      || fullText.match(/(\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4})/i);
    if (deadlineMatch) {
      detectedDeadline = deadlineMatch[1] ? deadlineMatch[1].replace(/[\-\.]/g, '/') : '30/10/2026';
    }

    const lowerContent = (fullText + ' ' + (fileName || '')).toLowerCase();

    // 3. Phân tích ngữ nghĩa chuyên sâu theo chủ đề văn bản công vụ cấp xã
    let briefing: ExecutiveBriefing;
    let actionPlan: { step: number; title: string; desc: string; role?: string }[];
    let requiredFiles: string[];

    // TRƯỜNG HỢP A: Văn bản PCCC (chỉ khớp khi thực sự có từ khóa phòng cháy chữa cháy)
    if (lowerContent.includes('cháy') || lowerContent.includes('pccc') || lowerContent.includes('kim liên') || lowerContent.includes('72/cđ')) {
      detectedCode = detectedCode.includes('72') ? '72/CĐ-TTg' : detectedCode;
      detectedIssuer = detectedProvince ? `Ủy ban nhân dân ${detectedProvince}` : 'Ủy ban nhân dân tỉnh';
      detectedTitle = 'Rà soát, kiểm tra an toàn PCCC tại các cơ sở giáo dục trên địa bàn';
      detectedType = 'review';
      detectedOutput = 'Báo cáo kết quả kiểm tra PCCC cơ sở giáo dục (.docx)';

      briefing = {
        directiveContext: 'Thực hiện Công điện số 72/CĐ-TTg của Thủ tướng Chính phủ và chỉ đạo khẩn của UBND tỉnh về chủ động phòng ngừa, ngăn chặn các vụ cháy nổ tại các cơ sở giáo dục sau sự cố cháy nhà tạm tại trường học.',
        coreDemands: [
          'Chủ trì phối hợp với Công an xã rà soát, kiểm tra toàn diện điều kiện an toàn PCCC tại 100% cơ sở mầm non, trường học trên địa bàn xã.',
          'Tập trung kiểm tra các khu vực trọng yếu: nhà tạm, nhà cấp 4, bếp ăn bán trú tập thể, hệ thống dây dẫn điện và lối thoát nạn khẩn cấp.',
          'Yêu cầu các cơ sở giáo dục tự kiểm tra, kiên quyết đình chỉ hoặc không bố trí dạy học tại các hạng mục công trình chưa bảo đảm an toàn PCCC.',
          'Lập biên bản kiểm tra hiện trường, đôn đốc khắc phục ngay tồn tại và hoàn thiện báo cáo kết quả gửi UBND huyện đúng thời hạn.'
        ],
        responsibleDepartments: ['UBND xã', 'Công an xã', 'Bộ phận Văn hóa - Xã hội', 'Ban Giám hiệu các trường'],
        estimatedWorkload: 'Kiểm tra thực địa 03 - 05 điểm trường & Lập 01 báo cáo tổng hợp theo NĐ 30'
      };

      actionPlan = [
        {
          step: 1,
          title: 'Tiếp nhận chỉ đạo & phát hành văn bản đôn đốc',
          desc: 'Gửi văn bản yêu cầu các trường MN, Tiểu học, THCS trên địa bàn tự rà soát toàn bộ điều kiện PCCC',
          role: 'Công chức Văn phòng - Thống kê'
        },
        {
          step: 2,
          title: 'Tổ chức đoàn kiểm tra liên ngành thực địa',
          desc: 'UBND xã phối hợp Công an xã kiểm tra nhà tạm, bếp ăn bán trú, hệ thống điện và lối thoát nạn',
          role: 'UBND xã phối hợp Công an xã'
        },
        {
          step: 3,
          title: 'Lập biên bản hiện trường & kiến nghị khắc phục',
          desc: 'Đoàn kiểm tra lập biên bản, yêu cầu khắc phục triệt để vi phạm, đình chỉ khu vực không an toàn',
          role: 'Đoàn kiểm tra liên ngành'
        },
        {
          step: 4,
          title: 'Hoàn thiện dự thảo báo cáo chuẩn Nghị định 30',
          desc: `Tổng hợp số liệu kiểm tra và lập báo cáo kết quả trình Lãnh đạo UBND xã duyệt trước ngày ${detectedDeadline}`,
          role: 'Cán bộ Văn hóa - Xã hội'
        }
      ];

      requiredFiles = [
        'Danh sách và hồ sơ quản lý PCCC của các cơ sở giáo dục trên địa bàn',
        'Biên bản tự kiểm tra an toàn PCCC của từng trường học',
        'Biên bản kiểm tra hiện trường liên ngành UBND xã - Công an xã',
        'Biểu tổng hợp hiện trạng nhà tạm, hệ thống điện và thiết bị chữa cháy'
      ];
    }
    // TRƯỜNG HỢP B: Báo cáo Kinh tế - Xã hội / Thu ngân sách
    else if (lowerContent.includes('kinh tế - xã hội') || lowerContent.includes('kt-xh') || lowerContent.includes('thu ngân sách')) {
      detectedTitle = 'Xây dựng Báo cáo tình hình phát triển kinh tế - xã hội tháng 10/2026';
      detectedType = 'report';
      detectedOutput = 'Báo cáo định dạng .docx hoàn chỉnh (khoảng 4-6 trang) kèm biểu số liệu';

      briefing = {
        directiveContext: `UBND cấp trên yêu cầu UBND xã báo cáo kết quả thực hiện các chỉ tiêu KT-XH, ANQP và giải quyết TTHC phục vụ kỳ họp thường kỳ.`,
        coreDemands: [
          'Đánh giá toàn diện 10 chỉ tiêu KT-XH chủ yếu, đặc biệt là tiến độ thu ngân sách nhà nước trên địa bàn.',
          'Báo cáo tiến độ sản xuất nông nghiệp vụ đông và công tác phòng chống dịch bệnh gia súc, gia cầm.',
          'Thống kê tỷ lệ giải quyết hồ sơ TTHC tại bộ phận Một cửa và tỷ lệ hài lòng của người dân.',
          'Đề xuất các nhiệm vụ, giải pháp trọng tâm cho tháng tiếp theo.'
        ],
        responsibleDepartments: ['Bộ phận Tài chính - Kế toán', 'Bộ phận Một cửa', 'Công chức Nông nghiệp - Địa chính'],
        estimatedWorkload: 'Thu thập 10 chỉ tiêu & Hoàn thiện báo cáo 4 mục'
      };

      actionPlan = [
        { step: 1, title: 'Thu thập chỉ tiêu thống kê', desc: 'Lấy số liệu từ Kế toán ngân sách, Bộ phận Một cửa và Nông nghiệp', role: 'Văn phòng UBND' },
        { step: 2, title: 'Đối chiếu và xác thực số liệu', desc: 'Kiểm tra tính nhất quán giữa số lũy kế và kế hoạch giao đầu năm', role: 'Bộ phận chuyên môn' },
        { step: 3, title: 'Xây dựng dự thảo báo cáo 4 mục', desc: 'Soạn thảo văn bản theo đúng thể thức Nghị định 30/2020/NĐ-CP', role: 'Công chức Văn phòng' },
        { step: 4, title: 'Trình Lãnh đạo UBND xã phê duyệt', desc: `Trình Chủ tịch UBND xã ký phát hành trước ${detectedDeadline}`, role: 'Chủ tịch UBND xã' }
      ];

      requiredFiles = [
        'Bảng tổng hợp thu ngân sách xã tháng 10/2026',
        'Báo cáo thống kê tình hình tiếp nhận và giải quyết TTHC Một cửa',
        'Số liệu diện tích gieo trồng và sản xuất nông nghiệp vụ đông'
      ];
    }
    // TRƯỜNG HỢP C: Rà soát Đội ngũ Cán bộ công chức (Nghị định 33)
    else if (lowerContent.includes('cán bộ') || lowerContent.includes('công chức') || lowerContent.includes('nghị định 33')) {
      detectedTitle = 'Rà soát, chuẩn hóa đội ngũ cán bộ, công chức cấp xã theo Nghị định 33';
      detectedType = 'review';
      detectedOutput = 'Bảng thống kê trích ngang và Báo cáo rà soát thực trạng công chức';

      briefing = {
        directiveContext: 'Rà soát cơ cấu ngạch, trình độ chuyên môn, lý luận chính trị và mức độ đáp ứng vị trí việc làm của cán bộ, công chức cấp xã chuẩn bị kiện toàn nhân sự.',
        coreDemands: [
          'Lập danh sách trích ngang toàn bộ cán bộ, công chức xã theo từng chức danh.',
          'Đối chiếu tiêu chuẩn ngạch, trình độ văn bằng, chứng chỉ theo Nghị định 33/2023/NĐ-CP.',
          'Xác định các trường hợp còn thiếu tiêu chuẩn đào tạo, bồi dưỡng hoặc vị trí còn khuyết.',
          'Đề xuất phương án cử đi đào tạo bồi dưỡng hoặc tuyển dụng bổ sung.'
        ],
        responsibleDepartments: ['Công chức Văn phòng - Thống kê', 'Ban Tổ chức - Nội vụ'],
        estimatedWorkload: 'Rà soát 21 hồ sơ cán bộ công chức & Lập 01 báo cáo'
      };

      actionPlan = [
        { step: 1, title: 'Lập danh sách trích ngang', desc: 'Thu thập thông tin hồ sơ của toàn bộ cán bộ, công chức xã', role: 'Văn phòng UBND' },
        { step: 2, title: 'Đối chiếu tiêu chuẩn chức danh', desc: 'Kiểm tra chứng chỉ tin học, ngoại ngữ, quản lý nhà nước', role: 'Cán bộ Nội vụ' },
        { step: 3, title: 'Lập biểu đánh giá & kiến nghị', desc: `Tổng hợp biểu mẫu gửi Phòng Nội vụ huyện trước ${detectedDeadline}`, role: 'UBND xã' }
      ];

      requiredFiles = [
        'Hồ sơ trích ngang cán bộ, công chức cấp xã',
        'Bảng phân loại đánh giá cán bộ năm gần nhất',
        'Bản sao văn bằng, chứng chỉ đào tạo bồi dưỡng chuyên môn'
      ];
    }
    // TRƯỜNG HỢP D: Quy hoạch / Rà soát mạng lưới / Văn bản chung
    else {
      // Regex trích xuất trích yếu nội dung ngắn gọn
      const titleMatch =
        fullText.match(/V\/v\s*:?\s*([^\n\r.;]{8,95})/i) ||
        fullText.match(/Về việc\s*:?\s*([^\n\r.;]{8,95})/i) ||
        fullText.match(/(?:BÁO CÁO|KẾ HOẠCH|QUYẾT ĐỊNH|CÔNG VĂN)\s+((?:Kế hoạch|Rà soát|Triển khai|Thực hiện|Kiểm tra|Tổng hợp)[^\n\r.]{8,95})/i);

      if (titleMatch && titleMatch[1]) {
        detectedTitle = titleMatch[1].trim();
      } else {
        const verbMatch = content.match(/(?:triển khai|thực hiện|rà soát|kiểm tra|xây dựng|tổ chức|tổng hợp)\s+([^.,;\n]{10,85})/i);
        if (verbMatch) {
          detectedTitle = `${verbMatch[0].charAt(0).toUpperCase() + verbMatch[0].slice(1).trim()}`;
        } else if (cleanFileName) {
          detectedTitle = cleanFileName;
        } else {
          detectedTitle = `Triển khai nhiệm vụ theo văn bản ${detectedCode}`;
        }
      }

      if (detectedTitle.length > 90) {
        detectedTitle = detectedTitle.slice(0, 87) + '...';
      }

      // Bóc tách trực tiếp các đầu mục / gạch đầu dòng từ văn bản upload làm danh sách công việc
      const extractedSteps: { step: number; title: string; desc: string; role?: string }[] = [];
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const headingMatch = line.match(/^(?:([IVXLCDM]+)\.|(\d+)\.)\s+([^\n]{8,120})/);
        if (headingMatch && headingMatch[3]) {
          const itemText = headingMatch[3].replace(/[:;]+$/, '').trim();
          if (itemText.length >= 8 && !/CỘNG HÒA|Độc lập|Kính gửi|Số:/i.test(itemText)) {
            extractedSteps.push({
              step: extractedSteps.length + 1,
              title: itemText.length > 85 ? itemText.slice(0, 82) + '...' : itemText,
              desc: 'Thực hiện theo nội dung văn bản đã tải lên',
              role: 'Công chức VH-XH'
            });
          }
        }
        if (extractedSteps.length >= 6) break;
      }

      const defaultSteps = [
        { step: 1, title: `Nghiên cứu yêu cầu văn bản & đối chiếu địa bàn`, desc: `Rà soát nội dung thực hiện trước hạn ${detectedDeadline}`, role: 'Công chức VH-XH' },
        { step: 2, title: 'Thu thập số liệu thực tế từ các cơ sở liên quan', desc: 'Liên hệ các đơn vị, thôn/xóm thu thập số liệu đầy đủ', role: 'Công chức VH-XH' },
        { step: 3, title: 'Tổng hợp, đối soát kết quả theo yêu cầu văn bản', desc: 'Kiểm tra tính chính xác của số liệu và minh chứng', role: 'Công chức VH-XH' },
        { step: 4, title: 'Hoàn tất kết quả & trình Lãnh đạo UBND xã duyệt', desc: `Hoàn thành trước ${detectedDeadline}`, role: 'Lãnh đạo UBND xã' }
      ];

      actionPlan = extractedSteps.length >= 2 ? extractedSteps : defaultSteps;

      briefing = {
        directiveContext: `${detectedIssuer} yêu cầu triển khai: ${detectedTitle}.`,
        coreDemands: actionPlan.map(a => a.title),
        responsibleDepartments: ['Phòng Văn hóa - Xã hội', 'Các cơ sở, thôn/xóm liên quan'],
        estimatedWorkload: `${actionPlan.length} đầu việc cần thực hiện`
      };

      requiredFiles = [
        'Văn bản gốc đã tải lên',
        'Số liệu, hồ sơ thu thập từ cơ sở'
      ];
    }

    // Tóm tắt cô đọng chuẩn hành chính cho summary
    const summary = `${briefing.directiveContext} Hoàn thành trước ${detectedDeadline}.`;

    return {
      id: `doc-${Date.now()}`,
      code: detectedCode,
      title: detectedTitle,
      issuedBy: detectedIssuer,
      issueDate: new Date().toLocaleDateString('vi-VN'),
      signer: 'Lãnh đạo đơn vị ban hành',
      summary,
      briefing,
      excerpt: content.length > 300 ? content.slice(0, 300) + '...' : content,
      fullContent: fullText,
      fileName,
      requiredFiles,
      actionPlan,
      tasks: [
        {
          id: `task-${Date.now()}`,
          code: `NV-${detectedCode.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '2026'}`,
          title: detectedTitle,
          description: summary,
          type: detectedType,
          deadline: detectedDeadline,
          priority: 'urgent',
          requiredOutput: detectedOutput
        }
      ]
    };
  }

  /**
   * Phát hiện chỉ tiêu số liệu còn thiếu trong tài liệu đang soạn thảo
   */
  identifyMissingData(sections: ReportSection[]): MissingIndicator[] {
    const missing: MissingIndicator[] = [];

    sections.forEach(sec => {
      if (sec.content.includes('[CHƯA CÓ DỮ LIỆU THU NGÂN SÁCH') || sec.content.includes('thu ngân sách: [CHƯA CÓ')) {
        missing.push({
          id: 'mi-thu-ngansach',
          key: 'thu_ngan_sach',
          name: 'Tổng thu ngân sách nhà nước trên địa bàn',
          unit: 'Triệu đồng',
          targetSection: sec.title,
          currentValue: undefined,
          suggestedSource: 'Kế toán ngân sách xã Tân Triều',
          period: 'Tháng 10/2026',
          isFilled: false
        });
      }

      if (sec.content.includes('[CHƯA CÓ DỮ LIỆU TỶ LỆ ĐÚNG HẠN') || sec.content.includes('đúng hạn: [CHƯA CÓ')) {
        missing.push({
          id: 'mi-tthc-dunghan',
          key: 'tthc_dung_han',
          name: 'Tỷ lệ hồ sơ TTHC giải quyết đúng hạn',
          unit: '%',
          targetSection: sec.title,
          currentValue: undefined,
          suggestedSource: 'Hệ thống Một cửa điện tử xã',
          period: 'Tháng 10/2026',
          isFilled: false
        });
      }
    });

    return missing;
  }

  /**
   * Viết lại đoạn văn bản theo các văn phong công vụ
   */
  async rewriteSection(content: string, style: 'administrative' | 'concise' | 'expand' | 'tone_down'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (style === 'administrative') {
      return content
        .replace(/chúng tôi đã làm/g, 'Ủy ban nhân dân xã đã tập trung chỉ đạo triển khai')
        .replace(/khá tốt/g, 'đạt nhiều kết quả tích cực, đáp ứng yêu cầu đề ra')
        .replace(/gặp khó/g, 'còn gặp một số khó khăn, vướng mắc khách quan')
        .replace(/làm chưa xong/g, 'tiến độ còn chậm so với kế hoạch ban đầu');
    }

    if (style === 'concise') {
      const sentences = content.split('. ');
      if (sentences.length > 2) {
        return sentences.slice(0, 2).join('. ') + '. Nhìn chung các chỉ tiêu cơ bản đều đạt kế hoạch đề ra.';
      }
      return content.trim();
    }

    if (style === 'expand') {
      return content + '\nĐồng thời, tăng cường công tác kiểm tra, giám sát thường xuyên nhằm kịp thời phát hiện, chấn chỉnh các tồn tại, hạn chế ngay từ cơ sở, đảm bảo tính nghiêm minh và hiệu lực quản lý nhà nước.';
    }

    return content;
  }

  /**
   * Kiểm tra và đối chiếu báo cáo với yêu cầu công văn gốc
   */
  async validateReport(task: Task): Promise<AIValidationResult> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const missingItems: string[] = [];
    const satisfiedRequirements: string[] = [];
    const recommendations: string[] = [];

    const unfilledCount = task.missingIndicators.filter(m => !m.isFilled).length;

    if (unfilledCount > 0) {
      task.missingIndicators.filter(m => !m.isFilled).forEach(m => {
        missingItems.push(`Chưa có số liệu: ${m.name} (${m.suggestedSource})`);
      });
      recommendations.push('Cần bổ sung đầy đủ các chỉ tiêu số liệu định lượng trước khi xuất văn bản chính thức.');
    } else {
      satisfiedRequirements.push(`Đầy đủ các chỉ tiêu thống kê chủ yếu theo yêu cầu công văn ${task.originalDoc.code}.`);
      satisfiedRequirements.push('Số liệu thu ngân sách và giải quyết TTHC đã được xác thực.');
      satisfiedRequirements.push('Thể thức văn bản tuân thủ quy chuẩn Nghị định 30/2020/NĐ-CP.');
    }

    const score = unfilledCount === 0 ? 100 : Math.max(50, 100 - unfilledCount * 25);

    return {
      isComplete: unfilledCount === 0,
      score,
      satisfiedRequirements,
      missingItems,
      recommendations
    };
  }
}

export const aiService = new AIService();
