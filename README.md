# AI WORKMATE — TRỢ LÝ THỰC THI CÔNG VIỆC CẤP XÃ

> **"Nhận yêu cầu → Hiểu việc → Làm việc → Hoàn thành"**  
> *Sản phẩm Trợ lý số hỗ trợ cán bộ, công chức UBND xã/phường thực thi công vụ sau khi nhận văn bản chỉ đạo.*

---

## 1. TỔNG QUAN VỀ SẢN PHẨM

**AI Workmate** là không gian làm việc số thông minh dành riêng cho cán bộ, công chức cấp cơ sở (UBND xã, phường, thị trấn) tại Việt Nam theo mô hình chính quyền địa phương 2 cấp.

### Nguyên lý cốt lõi:
- **Văn bản là đầu vào — Công việc là đơn vị thực thi cốt lõi.**
- Một văn bản có thể phát sinh nhiều nhiệm vụ; nhiều văn bản có thể đóng góp vào một báo cáo/kế hoạch chung.
- AI Workmate **KHÔNG PHẢI** là hệ thống quản lý văn bản (DMS), không phải phần mềm ký số/trình ký hay chatbot chung chung.
- AI Workmate **LÀ** bàn làm việc thông minh (Workbench) chuyển hóa các yêu cầu hành chính phức tạp thành công việc cụ thể, hỗ trợ tự động bóc tách chỉ tiêu, dự thảo báo cáo, kiểm soát số liệu thiếu và xuất file văn bản chuẩn thể thức Nhà nước (Nghị định 30/2020/NĐ-CP).

---

## 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend Core:** React 18 + TypeScript + Vite 6
- **Giao diện & Thiết kế:** Tailwind CSS + Lucide Icons + Google Fonts (*Be Vietnam Pro* & *Inter*)
- **Hệ thống màu GovTech:**
  - Primary: Deep Navy Blue (`#173B66`)
  - Secondary: Professional Blue (`#2563EB`)
  - Accent: Teal (`#0D9488`)
  - Background: Light Gray (`#F8FAFC`)
- **Quản lý trạng thái tập trung:** Zustand 5
- **Xuất văn bản Word hành chính:** Thư viện `docx` + `file-saver` (Tải file .docx thật chuẩn font Times New Roman, cỡ chữ, căn lề, quốc hiệu, tiêu ngữ và chữ ký số)
- **Hiệu ứng công vụ:** `canvas-confetti` (chúc mừng khi hoàn tất nhiệm vụ)
- **Kiến trúc AI Layer:** Modular Service Layer, chạy 100% **Deterministic Demo Mode**, không yêu cầu khóa API ngoài, sẵn sàng tích hợp LLM thật qua Adapter Interface.

---

## 3. CẤU TRÚC 5 PHÂN HỆ CHỨC NĂNG CHÍNH

### 1. Tổng quan (Personal Workspace Dashboard)
- Lời chào công vụ buổi sáng kèm ngày tháng hiện tại.
- 4 thẻ đo lường công việc trọng tâm: *Công việc cần xử lý, Công việc sắp đến hạn (khẩn), Công việc đang chờ bổ sung số liệu, Công việc đã hoàn thành*.
- Bảng gợi ý điều hành thông minh từ Trợ lý AI: phát hiện công việc đã có 8/10 chỉ tiêu, hướng dẫn bổ sung 2 chỉ tiêu còn thiếu để hoàn thiện.
- Danh mục công việc trọng tâm gắn với loại hình nhiệm vụ và công văn nguồn.

### 2. Công việc của tôi (Task Management Engine)
- Hỗ trợ 5 loại hình công việc hành chính cơ sở:
  1. **Báo cáo (Report):** Dự thảo báo cáo định kỳ 4 mục, thu thập chỉ tiêu thống kê.
  2. **Kế hoạch (Plan):** Lộ trình hành động, mục tiêu, phân công trách nhiệm.
  3. **Rà soát (Review):** Bảng kiểm tra tiêu chuẩn chức danh, đánh giá hiện trạng.
  4. **Thống kê (Statistics):** Bảng biểu số liệu tiếp nhận và giải quyết TTHC Một cửa.
  5. **Góp ý văn bản (Feedback):** So sánh dự thảo đề án, biên soạn văn bản đóng góp ý kiến.
- Bộ lọc đa chiều theo loại việc, trạng thái tiến độ và độ khẩn.

### 3. Trợ lý AI (Xử lý & Diễn giải công văn)
- Đầu vào: Chọn công văn mẫu có sẵn, dán văn bản trực tiếp hoặc tải tệp PDF/DOCX.
- 5 văn bản hành chính thực tế chuẩn hóa:
  - *CV 142/UBND-TH:* Báo cáo tình hình KT-XH tháng 10 và phương hướng tháng 11/2026.
  - *KH 89/KH-UBND:* Rà soát đánh giá đội ngũ cán bộ, công chức cấp xã theo NĐ 33/2023/NĐ-CP.
  - *QĐ 215/QĐ-UBND:* Kế hoạch triển khai chuyển đổi số và chính quyền số xã năm 2026.
  - *CV 310/VP-TTHC:* Thống kê kết quả giải quyết TTHC Một cửa tháng 10/2026.
  - *CV 158/HĐND-KT:* Góp ý dự thảo Đề án nông nghiệp công nghệ cao 2026-2030.
- Kết quả bóc tách tự động 4 phần:
  - **A. Tóm tắt nội dung:** 3-5 câu súc tích.
  - **B. Những việc cần thực hiện:** Tên nhiệm vụ, hạn nộp, kết quả đầu ra, độ khẩn.
  - **C. Hồ sơ, dữ liệu cần chuẩn bị:** Danh mục số liệu từ Tài chính, Nông nghiệp, Một cửa.
  - **D. Đề xuất kế hoạch từng bước thực hiện.**
- Nút tương tác: *"Xác nhận & Bắt đầu làm việc"*.

### 4. Không gian làm việc AI (AI Workbench - Trọng tâm sản phẩm)
Bố cục 3 bảng (Three-panel Workbench) chuyên nghiệp:
- **Cột Trái (Bối cảnh & Tiến độ):** Trích xuất công văn nguồn, tỷ lệ tiến độ, danh sách Checklist động (Phân tích yêu cầu → Thu thập số liệu → Tổng hợp nội dung → Kiểm tra báo cáo → Hoàn thiện xuất Word).
- **Cột Giữa (Tài liệu làm việc - Working Document):** Mô phỏng trang giấy văn bản hành chính thực tế (Quốc hiệu, Tiêu ngữ, Tên UBND xã, Tiêu đề in hoa đậm, 4 phần I, II, III, IV, Nơi nhận và Chữ ký Chủ tịch xã). Đánh dấu thẻ màu vàng nổi bật cho các số liệu chưa có. Cán bộ có thể chỉnh sửa trực tiếp từng đoạn.
- **Cột Phải (Trợ lý AI Công vụ):**
  - Tự động nhận diện số liệu thiếu trong văn bản.
  - Cung cấp **Form nhập liệu có cấu trúc** (VD: *Tỷ lệ hồ sơ TTHC đúng hạn (%), Tổng thu ngân sách (Triệu đồng), Nguồn số liệu*).
  - Nút **"Cập nhật số liệu vào báo cáo"**: Tự động thay thế nội dung trong văn bản và tăng tiến độ công việc!
  - Các công cụ AI: *Diễn đạt theo văn phong hành chính, Rút gọn nội dung súc tích, Bổ sung nhiệm vụ trọng tâm tháng 11*.
  - Nút **"Kiểm tra báo cáo"**: Đối chiếu toàn diện văn bản với yêu cầu của công văn 142/UBND-TH, trả về bảng thẩm định tỷ lệ đạt chuẩn.
  - Nút **"Xuất file Word (.docx)"**: Tải file Word thật về máy tính.
  - Nút **"Hoàn tất & Lưu kho"**: Hiệu ứng confetti và lưu vào Kho tri thức.

### 5. Kho dữ liệu & tri thức số cấp xã (Knowledge & Data Reuse)
- Danh mục chỉ tiêu định lượng (Thu ngân sách, TTHC Một cửa, Diện tích lúa, Bao phủ BHYT...).
- Trạng thái xác thực rõ ràng (*Đã xác nhận* / *Chờ duyệt* / *Kỳ cũ*).
- **Cơ chế kiểm soát an toàn:** Cảnh báo đỏ khi dữ liệu thuộc kỳ cũ (Tháng 09) tránh nhầm lẫn khi đưa vào báo cáo kỳ mới (Tháng 10).

### 6. Báo cáo đã thực hiện & Kế thừa định kỳ
- Lưu trữ các văn bản báo cáo đã hoàn thành.
- Cho phép tải lại file Word bất kỳ lúc nào.
- **Tính năng độc quyền: "1-Click Tái sử dụng cho tháng mới":**
  - Ví dụ: Khởi tạo báo cáo Tháng 11 từ báo cáo Tháng 10.
  - Trợ lý AI giữ nguyên khung kết cấu 4 mục chuẩn của Huyện, đổi tên kỳ báo cáo và gắn cờ vàng `[CẦN CẬP NHẬT SỐ LIỆU MỚI]` để cán bộ chỉ cần điền số liệu mới mà không phải gõ lại báo cáo từ đầu!

---

## 4. KỊCH BẢN TRẢI NGHIỆM TRỌN VẸN 13 BƯỚC (END-TO-END DEMO)

Ứng dụng tích hợp sẵn nút **"Hướng dẫn trải nghiệm 13 bước"** ở góc dưới màn hình:

1. **Bước 1:** Cán bộ mở màn hình **Tổng quan**, xem các việc cần xử lý và cảnh báo thiếu số liệu.
2. **Bước 2:** Nhấn nút **"Phân tích công văn mới"** trên thanh tiêu đề.
3. **Bước 3:** Tại phân hệ Trợ lý AI, chọn văn bản mẫu **CV 142/UBND-TH** (Yêu cầu báo cáo KT-XH tháng 10).
4. **Bước 4:** AI phân tích và hiển thị kết quả: Tóm tắt 4 câu, trích xuất nhiệm vụ, hồ sơ cần chuẩn bị và lộ trình 4 bước.
5. **Bước 5:** Nhấn **"Xác nhận & Bắt đầu làm việc"** trên nhiệm vụ 1.
6. **Bước 6:** Màn hình chuyển vào **Không gian làm việc AI** với bản dự thảo 4 phần và Checklist tiến độ.
7. **Bước 7:** Bảng Trợ lý AI bên phải tự động quét mục II và thông báo thiếu 2 chỉ tiêu: *Tỷ lệ TTHC đúng hạn* và *Thu ngân sách*.
8. **Bước 8:** Nhập các giá trị vào form có cấu trúc (ví dụ: `99.2%` và `3.120 triệu đồng`) rồi bấm **"Cập nhật số liệu vào báo cáo"**.
9. **Bước 9:** Văn bản ở giữa tự động cập nhật số liệu mới, các thẻ cảnh báo biến mất, tiến độ nhảy lên **95%**.
10. **Bước 10:** Nhấn nút **"Kiểm tra báo cáo"** trên thanh công cụ.
11. **Bước 11:** Hộp thoại đối chiếu AI mở ra, xác nhận báo cáo đã thỏa mãn **100% tiêu chí** công văn 142/UBND-TH.
12. **Bước 12:** Nhấn **"Xuất file Word (.docx)"** → trình duyệt tải xuống tệp DOCX chuẩn thể thức.
13. **Bước 13:** Nhấn **"Hoàn tất & Lưu kho"** → chuyển sang phân hệ **"Báo cáo đã thực hiện"** và bấm **"Tái sử dụng cho tháng mới"** để tạo ngay báo cáo Tháng 11!

---

## 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Yêu cầu môi trường:
- Node.js >= 18.0.0
- Trình duyệt hiện đại (Chrome, Edge, Firefox, Safari)

### Các bước khởi chạy:
```bash
# 1. Chuyển vào thư mục dự án
cd /Users/congnh/Task

# 2. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Sau khi chạy lệnh, truy cập địa chỉ hiển thị trên terminal (mặc định: `http://localhost:3000` hoặc cổng được Vite cấp phát).

### Kiểm tra build sản phẩm:
```bash
npm run build
```

---

## 6. DANH MỤC TÍNH NĂNG ĐÃ TRIỂN KHAI VÀ MÔ PHỎNG

| STT | Phân hệ / Tính năng | Trạng thái | Mô tả chi tiết |
|:---:|:---|:---:|:---|
| 1 | Màn hình Tổng quan cá nhân hóa | **Hoàn chỉnh 100%** | Thống kê 4 khối, AI gợi ý điều hành, danh mục việc ưu tiên |
| 2 | Phân tích văn bản đến (Interpreter) | **Hoàn chỉnh 100%** | Bóc tách 4 phần: Tóm tắt, Việc cần làm, Hồ sơ chuẩn bị, Kế hoạch |
| 3 | 5 Mẫu công văn chỉ đạo cấp huyện | **Hoàn chỉnh 100%** | CV 142, KH 89, QĐ 215, CV 310, CV 158 sát thực tế công vụ |
| 4 | Bàn làm việc AI 3 cột (Workbench) | **Hoàn chỉnh 100%** | Cột bối cảnh checklist, Cột soạn thảo thể thức hành chính, Cột trợ lý AI |
| 5 | Điền số liệu thiếu có cấu trúc | **Hoàn chỉnh 100%** | Form nhập TTHC & Thu ngân sách, đồng bộ tức thì vào nội dung văn bản |
| 6 | Thẩm định đối chiếu công văn | **Hoàn chỉnh 100%** | AI chấm điểm tỷ lệ tuân thủ, kiểm tra 10/10 chỉ tiêu công văn gốc |
| 7 | Tinh chỉnh văn phong hành chính | **Hoàn chỉnh 100%** | Chuẩn hóa thuật ngữ công vụ, rút gọn súc tích, bổ sung giải pháp |
| 8 | Xuất file Word (.docx) thật | **Hoàn chỉnh 100%** | Thư viện `docx` tạo file .docx đúng quy chuẩn văn thư NĐ 30/2020 |
| 9 | Kho dữ liệu chỉ tiêu thống kê | **Hoàn chỉnh 100%** | Quản lý xác thực, kiểm soát cảnh báo lệch kỳ báo cáo (Tháng 9 vs Tháng 10) |
| 10 | Báo cáo đã thực hiện & Tái sử dụng | **Hoàn chỉnh 100%** | Lưu kho và 1-click kế thừa khung báo cáo sang tháng mới |
| 11 | Động cơ nhiệm vụ (5 Task Types) | **Hoàn chỉnh** | Hoàn thiện luồng Báo cáo; tích hợp Kế hoạch, Rà soát, Thống kê, Góp ý |
| 12 | Tích hợp OCR văn bản quét PDF | *Mô phỏng Demo* | Nhận diện mẫu qua Mock service cục bộ; thiết kế sẵn interface |
| 13 | Kết nối LLM bên ngoài qua API Key | *Kiến trúc Adapter* | Hiện chạy 100% Local Demo để đảm bảo an toàn bí mật nhà nước |

---

## 7. ĐẢM BẢO AN TOÀN THÔNG TIN & BẢO MẬT CÔNG VỤ (GOVTECH SECURITY)

- Toàn bộ dữ liệu demo được lưu trữ cục bộ trong trình duyệt và bộ nhớ client (Zustand state).
- Không gửi văn bản hay số liệu hành chính ra các API trí tuệ nhân tạo của bên thứ ba trong chế độ thử nghiệm.
- Luôn hiển thị nhãn dự thảo rõ ràng và yêu cầu cán bộ xem xét, xác nhận trước khi phát hành.
- Kiến trúc hệ thống tách biệt phần Trợ lý thực thi với hệ thống Trình ký / Ký số chính thức, tuân thủ nguyên tắc phân quyền và an toàn thông tin công quyền.
# Task
