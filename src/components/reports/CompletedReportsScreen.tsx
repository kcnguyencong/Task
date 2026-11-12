import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Copy,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CompletedReport } from '../../types';
import { exportTaskToDocx } from '../../services/docxExport';

export const CompletedReportsScreen: React.FC = () => {
  const { completedReports, cloneReportForNewMonth, showNotification } = useStore();

  const [cloningReport, setCloningReport] = useState<CompletedReport | null>(null);
  const [targetPeriod, setTargetPeriod] = useState<string>('Tháng 11/2026');

  const handleStartClone = (report: CompletedReport) => {
    setCloningReport(report);
  };

  const handleConfirmClone = () => {
    if (!cloningReport) return;
    try {
      cloneReportForNewMonth(cloningReport.id, targetPeriod);
      setCloningReport(null);
    } catch {
      showNotification('Không thể tái sử dụng báo cáo này.');
    }
  };

  const handleDownloadCompletedDocx = async (report: CompletedReport) => {
    const mockTaskForExport = {
      id: report.id,
      code: report.code,
      title: report.title,
      description: `Báo cáo chính thức kỳ ${report.period}`,
      type: report.taskType,
      deadline: report.completionDate,
      priority: 'high' as const,
      status: 'completed' as const,
      progress: 100,
      requiredOutput: 'File Word chính thức',
      requiredData: report.dataSources,
      originalDoc: {
        id: 'completed-doc',
        code: report.code,
        title: report.title,
        issuedBy: report.department,
        date: report.completionDate,
        excerpt: 'Báo cáo chính thức đã phê duyệt.'
      },
      checklist: [],
      missingIndicators: [],
      sections: report.sections,
      recommendedAction: 'Báo cáo lưu trữ.'
    };

    await exportTaskToDocx(mockTaskForExport);
    showNotification(`Đang tải file "${report.title}.docx"...`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phân hệ: Báo cáo đã thực hiện & Tái sử dụng mẫu</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Kho lưu trữ báo cáo công vụ & Kế thừa định kỳ
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Tất cả các báo cáo, kế hoạch đã hoàn thành được lưu trữ tại đây. Cán bộ có thể tải file Word (.docx) chuẩn thể thức hoặc <strong>"1-Click khởi tạo báo cáo tháng mới"</strong> kế thừa toàn bộ khung xương và cấu trúc chuẩn.
          </p>
        </div>
      </div>

      {/* Feature Highlight: 1-Click Periodic Reuse */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0F2744] to-[#1E3A8A] text-white p-6 border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-extrabold">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <span className="uppercase tracking-wider">Kế thừa báo cáo định kỳ thông minh</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            Không cần gõ lại từ đầu hay lục tìm file Word cũ trong máy tính. Nhấn <strong>"Tái sử dụng cho tháng mới"</strong>, Trợ lý AI sẽ tự động nhân bản khung báo cáo chuẩn và chỉ nhắc bạn cập nhật đúng những số liệu mới của tháng sau!
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card p-6 flex flex-col justify-between transition-all group hover:border-blue-400"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#132A46] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {report.code}
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Kỳ: {report.period}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                {report.title}
              </h3>

              <div className="text-xs text-slate-500 space-y-1 font-medium">
                <div>Đơn vị: <strong className="text-slate-800">{report.department}</strong></div>
                <div>Người ký: <strong className="text-slate-800">{report.signatory}</strong></div>
                <div>Ngày hoàn thành: <strong className="text-slate-800">{report.completionDate}</strong></div>
              </div>

              {/* Data sources tags */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nguồn dữ liệu tích hợp:</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.dataSources.map((source, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              {/* Indicator summary pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Chỉ tiêu trọng tâm đã chốt:</span>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {report.indicators.map((ind, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-[11px] flex justify-between items-center">
                      <span className="text-slate-600 truncate font-medium">{ind.name}:</span>
                      <strong className="text-[#132A46] ml-1 shrink-0 font-bold">{ind.value} {ind.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadCompletedDocx(report)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Word (.docx)</span>
              </button>

              <button
                onClick={() => handleStartClone(report)}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 border border-blue-400/30"
              >
                <Copy className="w-3.5 h-3.5 text-amber-200" />
                <span>Tái sử dụng cho tháng mới</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clone Confirmation Modal */}
      {cloningReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-7 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-[#132A46] text-white flex items-center justify-center shadow-sm">
                <Copy className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Khởi tạo báo cáo mới kế thừa từ {cloningReport.code}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Giữ nguyên cấu trúc, xóa số liệu cũ để cập nhật mới</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 mb-1">Báo cáo gốc:</p>
                <p className="text-slate-600 font-medium">{cloningReport.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">Kỳ cũ: {cloningReport.period}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhập kỳ báo cáo mới:
                </label>
                <input
                  type="text"
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  placeholder="VD: Tháng 11/2026"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-700"
                />
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-3.5 rounded-xl text-teal-950 text-[11px] leading-relaxed font-medium">
                <strong className="block mb-1 text-teal-900 font-bold">Trợ lý AI sẽ:</strong>
                1. Tự động đổi tên thành <strong>"Báo cáo ... {targetPeriod}"</strong><br />
                2. Giữ nguyên toàn bộ 4 mục kết cấu chuẩn của UBND huyện<br />
                3. Đánh dấu các vị trí số liệu cần cập nhật mới bằng thẻ vàng<br />
                4. Mở thẳng <strong>Không gian làm việc AI</strong> để bạn thao tác ngay lập tức!
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCloningReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmClone}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <span>Tạo báo cáo {targetPeriod} ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
