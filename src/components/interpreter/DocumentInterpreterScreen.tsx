import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle,
  CheckSquare,
  ArrowRight,
  Calendar,
  FolderArchive,
  ListOrdered,
  Edit2,
  Info
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { OfficialDocument, Task } from '../../types';

export const DocumentInterpreterScreen: React.FC = () => {
  const {
    runAnalyzeDocument,
    isAnalyzing,
    analyzedDoc,
    confirmTaskFromDoc,
    showNotification
  } = useStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('CV_142_UBND_TH_BaoCaoKTXH.pdf');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('248.5 KB');
  const [pastedText, setPastedText] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    }
  };

  const handleAnalyze = async () => {
    let input = '';
    if (activeTab === 'upload') {
      input = 'doc-142'; // Map to realistic doc for demo
    } else {
      if (!pastedText.trim()) {
        showNotification('Vui lòng dán nội dung văn bản để phân tích');
        return;
      }
      input = pastedText;
    }

    await runAnalyzeDocument(input);
  };

  const handleConfirmAndStartTask = (task: Partial<Task>, originalDoc: OfficialDocument) => {
    confirmTaskFromDoc(task, originalDoc);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Phân hệ: Trí tuệ nhân tạo đọc hiểu & bóc tách công vụ</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Chuyển hóa văn bản chỉ đạo thành công việc thực thi
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Tải tệp văn bản chỉ đạo (.pdf, .docx) hoặc dán nội dung → Trợ lý AI tự động đọc hiểu, bóc tách chỉ tiêu, thời hạn và lập kế hoạch thực hiện chuẩn hóa cho cán bộ xã.
          </p>
        </div>

        {/* Info pill */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 max-w-md shrink-0 shadow-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="leading-snug">
            <strong>Chế độ Trực tiếp:</strong> Tải tệp văn bản từ máy tính của bạn để AI tiến hành quét nội dung và trích xuất nhiệm vụ.
          </span>
        </div>
      </div>

      {/* Input Selector Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-6">
        {/* Segmented Tab Controls (Only Upload and Paste, NO incoming dispatch list) */}
        <div className="flex p-1.5 bg-slate-100/90 rounded-xl max-w-md border border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>1. Tải lên tệp (.pdf, .docx)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-4 h-4 text-purple-600" />
            <span>2. Dán nội dung công văn</span>
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <input
              type="file"
              id="file-interpreter-upload"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-interpreter-upload" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#173B66] flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <Upload className="w-6 h-6" />
              </div>
              {uploadedFileName ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">{uploadedFileName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({uploadedFileSize})</span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-semibold mt-1">Tệp đã sẵn sàng phân tích</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Kéo thả hoặc nhấn để chọn tệp công văn (.pdf, .docx)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hệ thống tự động quét nhận dạng chữ viết OCR và bóc tách nhiệm vụ
                  </p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Tab 2: Paste Content */}
        {activeTab === 'paste' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Dán toàn văn hoặc trích yếu công văn của cơ quan cấp trên:
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="ỦY BAN NHÂN DÂN HUYỆN... Số: 142/UBND-TH. V/v yêu cầu báo cáo tình hình kinh tế - xã hội tháng 10..."
              className="w-full p-4 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
            />
          </div>
        )}

        {/* Submit Analyze Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Trợ lý AI sẽ tóm tắt, trích xuất nhiệm vụ, hồ sơ số liệu cần thu thập và lập kế hoạch thực hiện.
          </span>

          <button
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-[#173B66] hover:bg-[#1E4A7F] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>AI đang đọc hiểu văn bản...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bắt đầu phân tích văn bản</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analyzedDoc && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Card of Analyzed Document */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-7 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#173B66] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md font-mono">
                    {analyzedDoc.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Ban hành: {analyzedDoc.issueDate}</span>
                  <span className="text-xs text-slate-400">• Người ký: <strong className="text-slate-700">{analyzedDoc.signer}</strong></span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2 leading-tight">
                  {analyzedDoc.title}
                </h3>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0 font-medium">
                Cơ quan ban hành: <strong className="text-slate-800">{analyzedDoc.issuedBy}</strong>
              </div>
            </div>

            {/* Section A: Tóm tắt nội dung */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#173B66] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>A. Tóm tắt nội dung văn bản</span>
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                {analyzedDoc.summary}
              </p>
            </div>

            {/* Section B: Những việc cần thực hiện (Extracted Tasks) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#173B66] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <span>B. Những việc cần thực hiện (AI trích xuất tự động)</span>
                </h4>
                <span className="text-[11px] text-slate-400 italic font-medium">
                  Cán bộ kiểm tra và xác nhận trước khi đưa vào bàn làm việc
                </span>
              </div>

              <div className="space-y-3">
                {analyzedDoc.tasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className="p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/40 to-indigo-50/30 hover:border-blue-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-extrabold bg-[#173B66] text-white px-2.5 py-0.5 rounded-md">
                          Nhiệm vụ {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{task.title}</span>
                        {task.priority === 'urgent' && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-red-200">
                            Khẩn cấp
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Hạn chót: <strong className="text-slate-900 font-extrabold">{task.deadline}</strong>
                        </span>
                        <span>Đầu ra: <strong className="text-slate-700">{task.requiredOutput}</strong></span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmAndStartTask(task, analyzedDoc)}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4 text-amber-200" />
                        <span>Xác nhận & Bắt đầu làm việc</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section C: Hồ sơ, dữ liệu cần chuẩn bị */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#173B66] uppercase tracking-wider flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-600" />
                <span>C. Hồ sơ, tài liệu & số liệu cần chuẩn bị</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {analyzedDoc.requiredFiles.map((file, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{file}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section D: Đề xuất kế hoạch từng bước thực hiện */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#173B66] uppercase tracking-wider flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                <span>D. Đề xuất kế hoạch từng bước thực hiện</span>
              </h4>
              <div className="space-y-2.5 pt-1">
                {analyzedDoc.actionPlan.map((step) => (
                  <div
                    key={step.step}
                    className="flex items-start gap-3.5 p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#173B66] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {step.step}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
