import { OfficialDocument, Task, Indicator, CompletedReport } from '../types';

export const SAMPLE_DOCUMENTS: OfficialDocument[] = [
  {
    id: 'doc-142',
    code: '142/UBND-TH',
    title: 'V/v báo cáo tình hình kinh tế - xã hội tháng 10 và phương hướng nhiệm vụ tháng 11/2026',
    issuedBy: 'Ủy ban nhân dân huyện Tân Trực',
    issueDate: '24/10/2026',
    signer: 'Phó Chủ tịch Trần Văn Hùng',
    summary: 'UBND huyện yêu cầu UBND các xã, thị trấn báo cáo kết quả thực hiện các chỉ tiêu phát triển kinh tế - xã hội, quốc phòng - an ninh tháng 10/2026; trọng tâm là tiến độ thu ngân sách, sản xuất vụ đông, giải ngân vốn đầu tư công và công tác giải quyết TTHC tại bộ phận Một cửa. Báo cáo bằng văn bản gửi về Văn phòng HĐND & UBND huyện trước 16h00 ngày 28/10/2026 kèm file mềm.',
    briefing: {
      directiveContext: 'UBND huyện yêu cầu báo cáo kết quả thực hiện các chỉ tiêu phát triển kinh tế - xã hội, quốc phòng - an ninh tháng 10/2026 phục vụ phiên họp thường kỳ của UBND huyện.',
      coreDemands: [
        'Đánh giá toàn diện kết quả thực hiện nhiệm vụ phát triển kinh tế - xã hội tháng 10 trên địa bàn.',
        'Báo cáo số liệu thu ngân sách nhà nước trên địa bàn và tiến độ giải ngân vốn đầu tư công.',
        'Thống kê tiến độ sản xuất nông nghiệp vụ đông và công tác phòng dịch bệnh.',
        'Báo cáo kết quả giải quyết TTHC Một cửa (tỷ lệ trực tuyến và tỷ lệ giải quyết đúng hạn).'
      ],
      responsibleDepartments: ['Kế toán ngân sách', 'Bộ phận Một cửa', 'Công chức Nông nghiệp - Địa chính'],
      estimatedWorkload: 'Thu thập 10 chỉ tiêu KT-XH & Lập báo cáo 4 phần'
    },
    excerpt: 'Yêu cầu Chủ tịch UBND các xã, thị trấn tập trung chỉ đạo các bộ phận chuyên môn tổng hợp đầy đủ số liệu 10 chỉ tiêu KT-XH chủ yếu; nêu rõ khó khăn, vướng mắc trong công tác giải phóng mặt bằng và tỷ lệ hồ sơ TTHC giải quyết đúng hạn. Báo cáo gửi về UBND huyện trước ngày 28/10/2026.',
    fullContent: `ỦY BAN NHÂN DÂN HUYỆN TÂN TRỰC
Số: 142/UBND-TH
V/v báo cáo tình hình kinh tế - xã hội tháng 10 và nhiệm vụ tháng 11/2026

Kính gửi: Ủy ban nhân dân các xã, thị trấn

Để phục vụ phiên họp thường kỳ tháng 10/2026 của UBND huyện và chuẩn bị nội dung báo cáo Ban Thường vụ Huyện ủy, Chủ tịch UBND huyện yêu cầu Chủ tịch UBND các xã, thị trấn thực hiện các nội dung sau:

1. Đánh giá toàn diện kết quả thực hiện nhiệm vụ phát triển kinh tế - xã hội, quốc phòng - an ninh tháng 10/2026 trên địa bàn.
2. Báo cáo cụ thể tiến độ sản xuất nông nghiệp vụ đông; công tác phòng chống dịch bệnh gia súc, gia cầm.
3. Báo cáo số liệu thu ngân sách nhà nước trên địa bàn, tỷ lệ giải ngân nguồn vốn xây dựng cơ bản và kết quả giải quyết TTHC (đặc biệt tỷ lệ hồ sơ tiếp nhận trực tuyến và tỷ lệ giải quyết đúng hạn).
4. Đề xuất các giải pháp cụ thể trong tháng 11/2026 nhằm phấn đấu hoàn thành các chỉ tiêu kế hoạch năm.

Báo cáo gửi về UBND huyện (qua Văn phòng HĐND & UBND huyện) trước 16h00 ngày 28/10/2026 để tổng hợp.`,
    requiredFiles: [
      'Bảng tổng hợp thu ngân sách xã tháng 10/2026 (Bộ phận Tài chính - Kế toán)',
      'Báo cáo thống kê tình hình tiếp nhận và giải quyết TTHC tháng 10/2026 (Bộ phận Một cửa)',
      'Số liệu diện tích gieo trồng rau màu vụ đông 2026 (Công chức Nông nghiệp - Địa chính)'
    ],
    actionPlan: [
      { step: 1, title: 'Thu thập chỉ tiêu thống kê', desc: 'Lấy số liệu từ bộ phận Tài chính, Một cửa và Nông nghiệp theo biểu mẫu' },
      { step: 2, title: 'Tổng hợp và đối soát số liệu', desc: 'Kiểm tra tính nhất quán giữa kỳ báo cáo tháng 10 và lũy kế 10 tháng' },
      { step: 3, title: 'Dự thảo báo cáo 4 phần', desc: 'Xây dựng dự thảo theo đúng đề cương chuẩn của huyện' },
      { step: 4, title: 'Trình Lãnh đạo UBND xã phê duyệt', desc: 'Hoàn thiện bản Word chính thức và ký phát hành trước 16h00 ngày 28/10' }
    ],
    tasks: [
      {
        id: 'task-1',
        code: 'CV-142-T1',
        title: 'Báo cáo tình hình kinh tế - xã hội tháng 10/2026',
        description: 'Tổng hợp số liệu 10 chỉ tiêu KT-XH chủ yếu, đánh giá kết quả nông nghiệp, ngân sách, một cửa và phương hướng tháng 11/2026 gửi UBND huyện.',
        type: 'report',
        deadline: '28/10/2026',
        priority: 'urgent',
        requiredOutput: 'Báo cáo định dạng .docx hoàn chỉnh (khoảng 4-6 trang) kèm bảng chỉ tiêu KT-XH.',
      }
    ]
  },
  {
    id: 'doc-89',
    code: '89/KH-UBND',
    title: 'Kế hoạch rà soát, đánh giá đội ngũ cán bộ, công chức cấp xã năm 2026',
    issuedBy: 'Phòng Nội vụ huyện Tân Trực',
    issueDate: '18/10/2026',
    signer: 'Trưởng phòng Lê Minh Đức',
    summary: 'Rà soát cơ cấu ngạch, trình độ chuyên môn, lý luận chính trị và mức độ đáp ứng vị trí việc làm của cán bộ, công chức cấp xã để chuẩn bị phương án kiện toàn nhân sự nhiệm kỳ tới.',
    briefing: {
      directiveContext: 'Phòng Nội vụ huyện yêu cầu rà soát cơ cấu ngạch, trình độ chuyên môn và mức độ đáp ứng vị trí việc làm của công chức cấp xã theo Nghị định 33/2023/NĐ-CP.',
      coreDemands: [
        'Lập danh sách trích ngang 21 vị trí cán bộ, công chức cấp xã theo mẫu chuẩn.',
        'Đối chiếu văn bằng chứng chỉ tin học, ngoại ngữ, quản lý nhà nước theo tiêu chuẩn ngạch.',
        'Lập bảng phân loại đánh giá và đề xuất phương án cử đào tạo, bồi dưỡng chuẩn hóa.'
      ],
      responsibleDepartments: ['Công chức Văn phòng - Thống kê', 'Ban Tổ chức Nội vụ'],
      estimatedWorkload: 'Rà soát 21 hồ sơ cán bộ công chức & Lập 01 báo cáo'
    },
    excerpt: 'Lập danh sách trích ngang 21 vị trí công chức cấp xã, phân loại theo tiêu chuẩn chức danh theo Nghị định 33/2023/NĐ-CP.',
    requiredFiles: ['Hồ sơ cán bộ công chức', 'Bảng phân loại đánh giá năm 2025', 'Văn bằng chứng chỉ bổ sung'],
    actionPlan: [
      { step: 1, title: 'Lập danh sách trích ngang', desc: 'Thu thập thông tin 21 cán bộ, công chức xã' },
      { step: 2, title: 'Đối chiếu tiêu chuẩn ngạch', desc: 'Kiểm tra chứng chỉ tin học, ngoại ngữ, quản lý nhà nước' },
      { step: 3, title: 'Lập biểu đánh giá', desc: 'Gửi về Phòng Nội vụ trước ngày 05/11/2026' }
    ],
    tasks: [
      {
        id: 'task-2',
        code: 'KH-89-T1',
        title: 'Rà soát tình hình đội ngũ cán bộ, công chức xã',
        description: 'Lập bảng rà soát 21 cán bộ công chức xã theo tiêu chuẩn chức danh Nghị định 33/2023/NĐ-CP, xác định vị trí thiếu hụt.',
        type: 'review',
        deadline: '05/11/2026',
        priority: 'high',
        requiredOutput: 'Bảng thống kê trích ngang và Báo cáo rà soát thực trạng công chức xã.',
      }
    ]
  },
  {
    id: 'doc-215',
    code: '215/QĐ-UBND',
    title: 'Kế hoạch triển khai chuyển đổi số và xây dựng chính quyền số cấp xã năm 2026',
    issuedBy: 'Ủy ban nhân dân huyện Tân Trực',
    issueDate: '05/10/2026',
    signer: 'Chủ tịch UBND huyện Nguyễn Văn Bình',
    summary: 'Giao chỉ tiêu tỷ lệ hồ sơ trực tuyến toàn trình đạt tối thiểu 75%, 100% cán bộ sử dụng chữ ký số cá nhân trong xử lý văn bản điện tử và thanh toán số tại chợ dân sinh.',
    briefing: {
      directiveContext: 'UBND huyện ban hành kế hoạch triển khai chuyển đổi số cấp xã năm 2026, giao chỉ tiêu tỷ lệ hồ sơ trực tuyến toàn trình đạt tối thiểu 75%.',
      coreDemands: [
        'Xây dựng lộ trình 5 mục tiêu trọng tâm: hạ tầng số, chính quyền số, kinh tế số và xã hội số.',
        '100% cán bộ, công chức sử dụng chữ ký số cá nhân trong xử lý văn bản điện tử.',
        'Thành lập và duy trì hoạt động hiệu quả của 10 Tổ công nghệ số cộng đồng tại các thôn.'
      ],
      responsibleDepartments: ['Công chức Văn hóa - Xã hội', 'Tổ Công nghệ số cộng đồng', 'Đoàn Thanh niên'],
      estimatedWorkload: 'Lập Kế hoạch hành động chi tiết năm 2026'
    },
    excerpt: 'UBND các xã xây dựng kế hoạch chi tiết, thành lập và duy trì hiệu quả 10 Tổ công nghệ số cộng đồng tại các thôn/xóm.',
    requiredFiles: ['Danh sách thành viên Tổ công nghệ số cộng đồng', 'Thống kê trang thiết bị máy tính bộ phận Một cửa'],
    actionPlan: [
      { step: 1, title: 'Khảo sát hạ tầng công nghệ', desc: 'Kiểm tra đường truyền số liệu chuyên dùng và máy tính' },
      { step: 2, title: 'Soạn thảo kế hoạch hành động', desc: 'Phân công nhiệm vụ cụ thể từng ngành, từng thôn' },
      { step: 3, title: 'Ban hành quyết định kiện toàn Tổ CNSCĐ', desc: 'Hoàn thành trước 10/11/2026' }
    ],
    tasks: [
      {
        id: 'task-3',
        code: 'QD-215-T1',
        title: 'Xây dựng kế hoạch triển khai chuyển đổi số xã năm 2026',
        description: 'Xây dựng lộ trình 5 mục tiêu trọng tâm chuyển đổi số: hạ tầng số, chính quyền số, kinh tế số và xã hội số cấp xã.',
        type: 'plan',
        deadline: '10/11/2026',
        priority: 'normal',
        requiredOutput: 'Kế hoạch hành động chi tiết năm 2026 trình UBND xã ký ban hành.',
      }
    ]
  },
  {
    id: 'doc-310',
    code: '310/VP-TTHC',
    title: 'V/v tổng hợp kết quả giải quyết thủ tục hành chính tháng 10/2026',
    issuedBy: 'Văn phòng HĐND & UBND huyện Tân Trực',
    issueDate: '22/10/2026',
    signer: 'Chánh Văn phòng Hoàng Quốc Toản',
    summary: 'Yêu cầu trích xuất dữ liệu từ Hệ thống thông tin giải quyết TTHC của tỉnh, làm rõ các hồ sơ quá hạn (nếu có) và thư xin lỗi người dân.',
    excerpt: 'Báo cáo biểu mẫu số 02/BCTTHC: tổng số tiếp nhận, số kỳ trước chuyển qua, số giải quyết trước hạn, đúng hạn, quá hạn và đang giải quyết.',
    requiredFiles: ['Báo cáo chiết xuất từ Cổng DVC quốc gia', 'Sổ theo dõi tiếp nhận hồ sơ'],
    actionPlan: [
      { step: 1, title: 'Trích xuất báo cáo từ Cổng DVC', desc: 'Lấy dữ liệu từ ngày 01 đến 25/10/2026' },
      { step: 2, title: 'Xác minh hồ sơ trễ hạn', desc: 'Làm rõ nguyên nhân chủ quan/khách quan' },
      { step: 3, title: 'Tổng hợp biểu thống kê số 02', desc: 'Báo cáo Văn phòng UBND huyện' }
    ],
    tasks: [
      {
        id: 'task-4',
        code: 'CV-310-T1',
        title: 'Tổng hợp kết quả giải quyết thủ tục hành chính tháng 10/2026',
        description: 'Lập bảng thống kê 6 tiêu chí tiếp nhận hồ sơ Một cửa và tỷ lệ hài lòng của người dân.',
        type: 'statistics',
        deadline: '30/10/2026',
        priority: 'high',
        requiredOutput: 'Bảng thống kê số liệu theo mẫu Biểu số 02 kèm thuyết minh tóm tắt.',
      }
    ]
  },
  {
    id: 'doc-158',
    code: '158/HĐND-KT',
    title: 'V/v góp ý dự thảo Đề án phát triển nông nghiệp công nghệ cao giai đoạn 2026 - 2030',
    issuedBy: 'Thường trực HĐND huyện Tân Trực',
    issueDate: '26/10/2026',
    signer: 'Phó Chủ tịch HĐND huyện Vũ Thị Mai',
    summary: 'Đề nghị UBND xã Tân Triều tham gia ý kiến cụ thể vào cơ chế hỗ trợ tích tụ ruộng đất, chuyển đổi cây trồng giá trị kinh tế cao và hỗ trợ chứng nhận VietGAP.',
    excerpt: 'Tập trung đóng góp ý kiến về tính khả thi của quy hoạch vùng trồng bưởi diễn và rau hữu cơ 50ha tại bãi bồi sông Hồng.',
    requiredFiles: ['Bản dự thảo Đề án 25 trang của huyện', 'Quy hoạch sử dụng đất cấp xã đến năm 2030'],
    actionPlan: [
      { step: 1, title: 'Nghiên cứu dự thảo đề án', desc: 'Lọc các điều khoản liên quan trực tiếp đến địa phương' },
      { step: 2, title: 'Họp lấy ý kiến HTX nông nghiệp', desc: 'Tổng hợp các khó khăn về vốn và mặt bằng' },
      { step: 3, title: 'Dự thảo văn bản tham gia ý kiến', desc: 'Gửi về Thường trực HĐND huyện' }
    ],
    tasks: [
      {
        id: 'task-5',
        code: 'CV-158-T1',
        title: 'Góp ý dự thảo kế hoạch phát triển kinh tế - xã hội & nông nghiệp CNC',
        description: 'So sánh dự thảo với thực tế địa bàn, đề xuất sửa đổi 3 nội dung về hỗ trợ lãi suất và diện tích tối thiểu chuyển đổi.',
        type: 'feedback',
        deadline: '02/11/2026',
        priority: 'normal',
        requiredOutput: 'Văn bản góp ý của UBND xã gửi Ban Kinh tế - Xã hội HĐND huyện.',
      }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    code: 'CV-142-T1',
    title: 'Báo cáo tình hình kinh tế - xã hội tháng 10/2026',
    description: 'Tổng hợp số liệu 10 chỉ tiêu KT-XH chủ yếu, đánh giá kết quả nông nghiệp, ngân sách, giải quyết TTHC và phương hướng tháng 11/2026.',
    type: 'report',
    deadline: '28/10/2026',
    priority: 'urgent',
    status: 'in_progress',
    progress: 75,
    requiredOutput: 'Báo cáo định dạng .docx hoàn chỉnh (khoảng 4-6 trang) kèm bảng chỉ tiêu KT-XH gửi UBND huyện.',
    requiredData: [
      'Tổng thu ngân sách nhà nước tháng 10/2026',
      'Tỷ lệ giải quyết thủ tục hành chính đúng hạn',
      'Diện tích gieo cấy rau màu vụ đông',
      'Tỷ lệ bao phủ BHYT toàn dân'
    ],
    originalDoc: {
      id: 'doc-142',
      code: '142/UBND-TH',
      title: 'V/v báo cáo tình hình kinh tế - xã hội tháng 10 và phương hướng nhiệm vụ tháng 11/2026',
      issuedBy: 'Ủy ban nhân dân huyện Tân Trực',
      date: '24/10/2026',
      excerpt: 'Yêu cầu UBND các xã, thị trấn báo cáo kết quả thực hiện các chỉ tiêu phát triển kinh tế - xã hội... trọng tâm là tiến độ thu ngân sách và công tác giải quyết TTHC tại bộ phận Một cửa.'
    },
    checklist: [
      { id: 'c1', label: 'Phân tích yêu cầu công văn 142/UBND-TH', status: 'completed' },
      { id: 'c2', label: 'Thu thập số liệu từ các bộ phận (Tài chính, Một cửa, Nông nghiệp)', status: 'in_progress' },
      { id: 'c3', label: 'Tổng hợp và dự thảo nội dung báo cáo 4 mục', status: 'in_progress' },
      { id: 'c4', label: 'Kiểm tra đối chiếu số liệu và yêu cầu công văn', status: 'pending' },
      { id: 'c5', label: 'Hoàn thiện dự thảo và xuất file Word trình Lãnh đạo ký', status: 'pending' }
    ],
    missingIndicators: [
      {
        id: 'mi-1',
        key: 'tthc_dung_han',
        name: 'Tỷ lệ hồ sơ TTHC giải quyết đúng hạn',
        unit: '%',
        targetSection: 'II. Kết quả thực hiện - 2. Cải cách hành chính',
        currentValue: undefined,
        suggestedSource: 'Hệ thống Một cửa điện tử / Bộ phận Một cửa xã',
        period: 'Tháng 10/2026',
        isFilled: false
      },
      {
        id: 'mi-2',
        key: 'thu_ngan_sach',
        name: 'Tổng thu ngân sách nhà nước trên địa bàn',
        unit: 'Triệu đồng',
        targetSection: 'II. Kết quả thực hiện - 1. Phát triển kinh tế',
        currentValue: undefined,
        suggestedSource: 'Kế toán ngân sách xã Tân Triều',
        period: 'Tháng 10/2026',
        isFilled: false
      }
    ],
    sections: [
      {
        id: 'sec-1',
        number: 'I',
        title: 'ĐÁNH GIÁ TÌNH HÌNH CHUNG',
        content: `Trong tháng 10/2026, tình hình kinh tế - xã hội trên địa bàn xã Tân Triều tiếp tục duy trì ổn định và có bước phát triển tích cực. Ủy ban nhân dân xã đã tập trung chỉ đạo quyết liệt các ban, ngành, đoàn thể triển khai đồng bộ các nhiệm vụ phát triển kinh tế, đảm bảo an sinh xã hội và giữ vững an ninh trật tự cơ sở. Hoạt động sản xuất tiểu thủ công nghiệp và thương mại dịch vụ duy trì tốc độ tăng trưởng khá; công tác quản lý đất đai và trật tự xây dựng được tăng cường, không để phát sinh vi phạm mới.`,
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Nghị quyết Đảng ủy xã tháng 10/2026', 'Báo cáo giao ban tuần UBND xã']
      },
      {
        id: 'sec-2',
        number: 'II',
        title: 'KẾT QUẢ THỰC HIỆN TRÊN CÁC LĨNH VỰC',
        content: `1. Phát triển kinh tế:\n- Sản xuất nông nghiệp: Đã thu hoạch xong 450 ha lúa mùa, năng suất ước đạt 58 tạ/ha. Triển khai gieo trồng 120 ha rau màu vụ đông đạt 85% kế hoạch giao.\n- Thu - chi ngân sách: [CHƯA CÓ DỮ LIỆU THU NGÂN SÁCH - CẦN CÁN BỘ BỔ SUNG]. Chi ngân sách đảm bảo đúng dự toán, ưu tiên an sinh xã hội và phòng chống thiên tai.\n\n2. Văn hóa - Xã hội và Cải cách hành chính:\n- Tình hình văn hóa, giáo dục duy trì ổn định; công tác chăm sóc sức khỏe ban đầu cho nhân dân được đảm bảo; tỷ lệ bao phủ BHYT đạt 94.2% dân số.\n- Công tác cải cách hành chính: Bộ phận Một cửa đã tiếp nhận 1.245 hồ sơ. [CHƯA CÓ DỮ LIỆU TỶ LỆ ĐÚNG HẠN - CẦN CÁN BỘ BỔ SUNG]. Không có phản ánh tiêu cực của công dân trên Cổng dịch vụ công quốc gia.\n\n3. Quốc phòng - An ninh:\n- Duy trì nghiêm chế độ trực sẵn sàng chiến đấu; hoàn thành sơ tuyển 45 thanh niên sẵn sàng nhập ngũ năm 2027; an ninh nông thôn được giữ vững ổn định.`,
        isDraft: true,
        hasMissingData: true,
        sourceReferences: ['Sổ giao dịch Một cửa', 'Báo cáo BCH Quân sự xã', 'Kế toán xã']
      },
      {
        id: 'sec-3',
        number: 'III',
        title: 'KHÓ KHĂN, VƯỚNG MẮC VÀ NGUYÊN NHÂN',
        content: `1. Khó khăn, vướng mắc:\n- Tiến độ giải phóng mặt bằng Dự án đường giao thông liên xã đoạn qua thôn 3 còn chậm do một số hộ dân chưa thống nhất với phương án bồi thường cây trồng trên đất.\n- Thời tiết chuyển mùa mưa bão ảnh hưởng đến tiến độ gieo trồng rau màu vụ đông sớm của bà con nhân dân.\n\n2. Nguyên nhân chủ yếu:\n- Công tác tuyên truyền, vận động của một số chi bộ thôn chưa thực sự sát sao; nhận thức pháp luật đất đai của một bộ phận người dân còn hạn chế.`,
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Biên bản họp giải phóng mặt bằng ngày 20/10/2026']
      },
      {
        id: 'sec-4',
        number: 'IV',
        title: 'NHIỆM VỤ, GIẢI PHÁP TRỌNG TÂM THÁNG 11/2026',
        content: `1. Tập trung chỉ đạo hoàn thành 100% diện tích gieo trồng cây vụ đông; chủ động phòng chống rét và dịch bệnh cho đàn vật nuôi.\n2. Đôn đốc thu ngân sách, đặc biệt là các khoản thu tiền thuê đất, phí môn bài, phấn đấu đạt và vượt chỉ tiêu huyện giao quý IV.\n3. Nâng cao tỷ lệ hồ sơ tiếp nhận trực tuyến toàn trình và giữ vững tỷ lệ giải quyết đúng hạn trên 98%; đẩy mạnh tuyên truyền người dân số hóa giấy tờ cá nhân.\n4. Tổ chức khám sức khỏe nghĩa vụ quân sự cấp huyện cho số thanh niên đã qua sơ tuyển, đảm bảo chỉ tiêu giao quân chất lượng, an toàn.`,
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Chỉ đạo của Chủ tịch UBND xã tại Hội nghị giao ban tháng 10']
      }
    ],
    recommendedAction: 'Báo cáo đã có 8/10 chỉ tiêu. Bạn cần bổ sung 2 chỉ tiêu còn thiếu (Thu ngân sách & Tỷ lệ giải quyết TTHC đúng hạn) để hoàn thiện dự thảo.'
  },
  {
    id: 'task-2',
    code: 'KH-89-T1',
    title: 'Rà soát tình hình đội ngũ cán bộ, công chức cấp xã',
    description: 'Lập bảng rà soát 21 cán bộ công chức theo tiêu chuẩn chức danh Nghị định 33/2023/NĐ-CP, xác định vị trí thiếu hụt.',
    type: 'review',
    deadline: '05/11/2026',
    priority: 'high',
    status: 'pending',
    progress: 30,
    requiredOutput: 'Bảng thống kê trích ngang và Báo cáo rà soát thực trạng công chức xã gửi Phòng Nội vụ huyện.',
    requiredData: ['Danh sách 21 công chức', 'Chứng chỉ ngoại ngữ/tin học', 'Quy hoạch cán bộ 2026-2031'],
    originalDoc: {
      id: 'doc-89',
      code: '89/KH-UBND',
      title: 'Kế hoạch rà soát, đánh giá đội ngũ cán bộ, công chức cấp xã năm 2026',
      issuedBy: 'Phòng Nội vụ huyện Tân Trực',
      date: '18/10/2026',
      excerpt: 'Lập danh sách trích ngang 21 vị trí công chức cấp xã, phân loại theo tiêu chuẩn chức danh theo Nghị định 33/2023/NĐ-CP.'
    },
    checklist: [
      { id: 'c1', label: 'Thu thập hồ sơ trích ngang 21 công chức', status: 'completed' },
      { id: 'c2', label: 'Đối chiếu tiêu chuẩn ngạch và bằng cấp', status: 'in_progress' },
      { id: 'c3', label: 'Lập bảng phân loại đánh giá', status: 'pending' },
      { id: 'c4', label: 'Soạn thảo báo cáo kết quả rà soát', status: 'pending' }
    ],
    missingIndicators: [],
    sections: [],
    recommendedAction: 'Cần kiểm tra văn bằng chứng chỉ quản lý nhà nước của 2 công chức Tư pháp mới tuyển dụng.'
  },
  {
    id: 'task-3',
    code: 'QD-215-T1',
    title: 'Xây dựng kế hoạch triển khai chuyển đổi số xã năm 2026',
    description: 'Xây dựng lộ trình 5 mục tiêu trọng tâm chuyển đổi số: hạ tầng số, chính quyền số, kinh tế số và xã hội số.',
    type: 'plan',
    deadline: '10/11/2026',
    priority: 'normal',
    status: 'waiting_data',
    progress: 45,
    requiredOutput: 'Kế hoạch hành động chi tiết năm 2026 trình UBND xã ký ban hành.',
    requiredData: ['Khảo sát hạ tầng 10 thôn', 'Tỷ lệ điện thoại thông minh người trưởng thành', 'Chữ ký số cá nhân'],
    originalDoc: {
      id: 'doc-215',
      code: '215/QĐ-UBND',
      title: 'Kế hoạch triển khai chuyển đổi số và xây dựng chính quyền số cấp xã năm 2026',
      issuedBy: 'Ủy ban nhân dân huyện Tân Trực',
      date: '05/10/2026',
      excerpt: 'UBND các xã xây dựng kế hoạch chi tiết, thành lập và duy trì hiệu quả 10 Tổ công nghệ số cộng đồng tại các thôn/xóm.'
    },
    checklist: [
      { id: 'c1', label: 'Thu thập hiện trạng hạ tầng số các thôn', status: 'completed' },
      { id: 'c2', label: 'Dự thảo mục tiêu và lộ trình thực hiện', status: 'in_progress' },
      { id: 'c3', label: 'Xin ý kiến các trưởng thôn và đoàn thể', status: 'pending' }
    ],
    missingIndicators: [],
    sections: [],
    recommendedAction: 'Đang chờ báo cáo số liệu phổ cập điện thoại thông minh từ 3 thôn (Thôn 1, Thôn 4, Thôn 7).'
  },
  {
    id: 'task-4',
    code: 'CV-310-T1',
    title: 'Tổng hợp kết quả giải quyết thủ tục hành chính tháng 10/2026',
    description: 'Lập bảng thống kê 6 tiêu chí tiếp nhận hồ sơ Một cửa và tỷ lệ hài lòng của người dân.',
    type: 'statistics',
    deadline: '30/10/2026',
    priority: 'high',
    status: 'in_progress',
    progress: 60,
    requiredOutput: 'Bảng thống kê số liệu theo mẫu Biểu số 02 kèm thuyết minh tóm tắt.',
    requiredData: ['Hồ sơ tiếp nhận trực tiếp', 'Hồ sơ trực tuyến', 'Hồ sơ đã trả kết quả', 'Hồ sơ xin gia hạn'],
    originalDoc: {
      id: 'doc-310',
      code: '310/VP-TTHC',
      title: 'V/v tổng hợp kết quả giải quyết thủ tục hành chính tháng 10/2026',
      issuedBy: 'Văn phòng HĐND & UBND huyện Tân Trực',
      date: '22/10/2026',
      excerpt: 'Báo cáo biểu mẫu số 02/BCTTHC: tổng số tiếp nhận, số giải quyết trước hạn, đúng hạn, quá hạn.'
    },
    checklist: [
      { id: 'c1', label: 'Trích xuất dữ liệu Cổng dịch vụ công', status: 'completed' },
      { id: 'c2', label: 'Kiểm tra 03 hồ sơ đất đai có nguy cơ quá hạn', status: 'completed' },
      { id: 'c3', label: 'Hoàn thiện biểu số 02/BCTTHC', status: 'in_progress' }
    ],
    missingIndicators: [],
    sections: [],
    recommendedAction: 'Hoàn thiện bảng số liệu trước ngày 28/10 để kịp đồng bộ vào Báo cáo KT-XH tháng 10.'
  },
  {
    id: 'task-5',
    code: 'CV-158-T1',
    title: 'Góp ý dự thảo kế hoạch phát triển kinh tế - xã hội & nông nghiệp CNC',
    description: 'So sánh dự thảo với thực tế địa bàn, đề xuất sửa đổi 3 nội dung về hỗ trợ lãi suất và diện tích tối thiểu.',
    type: 'feedback',
    deadline: '02/11/2026',
    priority: 'normal',
    status: 'pending',
    progress: 15,
    requiredOutput: 'Văn bản góp ý của UBND xã gửi Ban Kinh tế - Xã hội HĐND huyện.',
    requiredData: ['Dự thảo đề án 25 trang', 'Quy hoạch sử dụng đất xã', 'Ý kiến 2 Hợp tác xã nông nghiệp'],
    originalDoc: {
      id: 'doc-158',
      code: '158/HĐND-KT',
      title: 'V/v góp ý dự thảo Đề án phát triển nông nghiệp công nghệ cao giai đoạn 2026 - 2030',
      issuedBy: 'Thường trực HĐND huyện Tân Trực',
      date: '26/10/2026',
      excerpt: 'Tập trung đóng góp ý kiến về tính khả thi của quy hoạch vùng trồng bưởi diễn và rau hữu cơ 50ha tại bãi bồi.'
    },
    checklist: [
      { id: 'c1', label: 'Tổng hợp ý kiến từ Hội Nông dân & 2 HTX', status: 'completed' },
      { id: 'c2', label: 'Dự thảo bảng so sánh góp ý điều khoản', status: 'pending' },
      { id: 'c3', label: 'Dự thảo văn bản đóng góp ý kiến', status: 'pending' }
    ],
    missingIndicators: [],
    sections: [],
    recommendedAction: 'Xem trước 3 điểm mâu thuẫn giữa quy hoạch sử dụng đất cấp xã và ranh giới đề xuất của huyện.'
  }
];

export const INITIAL_INDICATORS: Indicator[] = [
  {
    id: 'ind-1',
    name: 'Tổng số hồ sơ TTHC tiếp nhận trong tháng',
    value: '1.245',
    unit: 'Hồ sơ',
    period: 'Tháng 10/2026',
    area: 'Xã Tân Triều',
    source: 'Báo cáo Bộ phận Một cửa xã',
    status: 'verified',
    lastUpdated: '25/10/2026 14:30',
    category: 'Cải cách hành chính'
  },
  {
    id: 'ind-2',
    name: 'Số hồ sơ giải quyết trực tuyến toàn trình',
    value: '982',
    unit: 'Hồ sơ (78.8%)',
    period: 'Tháng 10/2026',
    area: 'Xã Tân Triều',
    source: 'Cổng Dịch vụ công Quốc gia',
    status: 'verified',
    lastUpdated: '25/10/2026 14:30',
    category: 'Cải cách hành chính'
  },
  {
    id: 'ind-3',
    name: 'Tỷ lệ người dân hài lòng về phục vụ TTHC',
    value: '99.4',
    unit: '%',
    period: 'Tháng 10/2026',
    area: 'Xã Tân Triều',
    source: 'Đánh giá qua máy tính bảng tại Một cửa',
    status: 'verified',
    lastUpdated: '24/10/2026 17:00',
    category: 'Cải cách hành chính'
  },
  {
    id: 'ind-4',
    name: 'Diện tích thu hoạch lúa mùa',
    value: '450',
    unit: 'ha (100% diện tích)',
    period: 'Vụ mùa 2026',
    area: 'Xã Tân Triều',
    source: 'Công chức Nông nghiệp - Địa chính',
    status: 'verified',
    lastUpdated: '22/10/2026 10:15',
    category: 'Nông nghiệp'
  },
  {
    id: 'ind-5',
    name: 'Năng suất lúa mùa bình quân',
    value: '58.2',
    unit: 'tạ/ha',
    period: 'Vụ mùa 2026',
    area: 'Xã Tân Triều',
    source: 'Hội đồng nghiệm thu năng suất lúa xã',
    status: 'verified',
    lastUpdated: '22/10/2026 10:15',
    category: 'Nông nghiệp'
  },
  {
    id: 'ind-6',
    name: 'Diện tích cây rau màu vụ đông đã gieo trồng',
    value: '120',
    unit: 'ha',
    period: 'Vụ đông 2026',
    area: 'Xã Tân Triều',
    source: 'Hợp tác xã dịch vụ nông nghiệp Tân Triều',
    status: 'verified',
    lastUpdated: '24/10/2026 09:00',
    category: 'Nông nghiệp'
  },
  {
    id: 'ind-7',
    name: 'Tỷ lệ bao phủ bảo hiểm y tế toàn dân',
    value: '94.2',
    unit: '%',
    period: 'Tháng 10/2026',
    area: 'Xã Tân Triều',
    source: 'Bảo hiểm Xã hội huyện Tân Trực',
    status: 'verified',
    lastUpdated: '20/10/2026 16:00',
    category: 'Văn hóa - Xã hội'
  },
  {
    id: 'ind-8',
    name: 'Số thanh niên đạt sơ tuyển nghĩa vụ quân sự',
    value: '45',
    unit: 'Thanh niên',
    period: 'Đợt 1 năm 2027',
    area: 'Xã Tân Triều',
    source: 'Ban Chỉ huy Quân sự xã',
    status: 'verified',
    lastUpdated: '23/10/2026 11:30',
    category: 'Quốc phòng - An ninh'
  },
  {
    id: 'ind-9',
    name: 'Tổng thu ngân sách nhà nước tháng 09/2026 (Kỳ trước)',
    value: '2.850',
    unit: 'Triệu đồng',
    period: 'Tháng 09/2026',
    area: 'Xã Tân Triều',
    source: 'Báo cáo quyết toán tháng 09/2026',
    status: 'unverified',
    lastUpdated: '28/09/2026 15:00',
    category: 'Tài chính - Ngân sách',
    warning: 'Cảnh báo: Số liệu thuộc kỳ Tháng 09/2026. Không được tự ý đưa vào báo cáo Tháng 10/2026 mà chưa cập nhật kỳ mới!'
  },
  {
    id: 'ind-10',
    name: 'Tỷ lệ giải quyết TTHC đúng hạn tháng 09/2026 (Kỳ trước)',
    value: '98.5',
    unit: '%',
    period: 'Tháng 09/2026',
    area: 'Xã Tân Triều',
    source: 'Hệ thống Một cửa điện tử tháng 09',
    status: 'unverified',
    lastUpdated: '29/09/2026 08:30',
    category: 'Cải cách hành chính',
    warning: 'Cảnh báo: Dữ liệu kỳ báo cáo cũ (Tháng 09/2026). Cần số liệu chính thức tháng 10/2026.'
  }
];

export const INITIAL_COMPLETED_REPORTS: CompletedReport[] = [
  {
    id: 'rep-09',
    code: '128/BC-UBND',
    title: 'Báo cáo tình hình kinh tế - xã hội tháng 09 và nhiệm vụ trọng tâm tháng 10/2026',
    taskType: 'report',
    completionDate: '27/09/2026',
    period: 'Tháng 09/2026',
    department: 'UBND Xã Tân Triều',
    signatory: 'Chủ tịch UBND xã Nguyễn Văn Hảo',
    dataSources: ['Chi cục Thuế khu vực', 'Văn phòng HĐND-UBND', 'Trạm Y tế xã', 'Bộ phận Một cửa'],
    indicators: [
      { name: 'Tổng thu ngân sách nhà nước', value: '2.850', unit: 'Triệu đồng' },
      { name: 'Tỷ lệ giải quyết TTHC đúng hạn', value: '98.5', unit: '%' },
      { name: 'Tổng số hồ sơ tiếp nhận', value: '1.180', unit: 'Hồ sơ' },
      { name: 'Tỷ lệ bao phủ BHYT', value: '93.8', unit: '%' }
    ],
    sections: [
      {
        id: 's1',
        number: 'I',
        title: 'ĐÁNH GIÁ TÌNH HÌNH CHUNG THÁNG 09/2026',
        content: 'Tháng 09/2026, UBND xã đã tập trung chỉ đạo quyết liệt hoàn thành gieo cấy lúa mùa, kiểm soát tốt dịch bệnh sốt xuất huyết và tổ chức thành công ngày hội toàn dân đưa trẻ đến trường.',
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Nghị quyết HĐND xã']
      },
      {
        id: 's2',
        number: 'II',
        title: 'KẾT QUẢ THỰC HIỆN TRÊN CÁC LĨNH VỰC',
        content: 'Tổng thu ngân sách đạt 2.850 triệu đồng, lũy kế 9 tháng đạt 82.5% dự toán huyện giao. Bộ phận Một cửa tiếp nhận 1.180 hồ sơ, giải quyết đúng hạn đạt 98.5%.',
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Bộ phận Tài chính', 'Bộ phận Một cửa']
      }
    ]
  },
  {
    id: 'rep-q3',
    code: '115/BC-UBND',
    title: 'Báo cáo kết quả công tác cải cách hành chính Quý III năm 2026',
    taskType: 'statistics',
    completionDate: '20/09/2026',
    period: 'Quý III/2026',
    department: 'UBND Xã Tân Triều',
    signatory: 'Phó Chủ tịch UBND xã Lê Thị Oanh',
    dataSources: ['Cổng Dịch vụ công quốc gia', 'Hệ thống thông tin giải quyết TTHC tỉnh'],
    indicators: [
      { name: 'Hồ sơ tiếp nhận trong quý', value: '3.420', unit: 'Hồ sơ' },
      { name: 'Tỷ lệ hồ sơ trực tuyến', value: '76.4', unit: '%' },
      { name: 'Mức độ hài lòng của công dân', value: '99.1', unit: '%' }
    ],
    sections: [
      {
        id: 's1',
        number: 'I',
        title: 'KẾT QUẢ CẢI CÁCH HÀNH CHÍNH QUÝ III/2026',
        content: 'Bộ phận tiếp nhận và trả kết quả xã đã thực hiện niêm yết công khai đầy đủ 175 thủ tục hành chính thuộc thẩm quyền cấp xã.',
        isDraft: false,
        hasMissingData: false,
        sourceReferences: ['Báo cáo CCHC quý 3']
      }
    ]
  }
];
