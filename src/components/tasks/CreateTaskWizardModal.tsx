import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  FileCheck,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Edit3
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { OfficialDocument, TaskType, Task } from '../../types';
import { extractTextFromFile } from '../../services/fileParser';

interface CreateTaskWizardModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const CreateTaskWizardModal: React.FC<CreateTaskWizardModalProps> = ({ isOpen = true, onClose }) => {
  const { runAnalyzeDocument, confirmTaskFromDoc, addNewTask, showNotification, locality } = useStore();

  // Mode: upload document or direct input
  const [sourceType, setSourceType] = useState<'document' | 'direct'>('document');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [extractedWordCount, setExtractedWordCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(1);
  const [analyzedDoc, setAnalyzedDoc] = useState<OfficialDocument | null>(null);

  // Editable task fields
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskType, setTaskType] = useState<TaskType>('report');
  const [taskDeadline, setTaskDeadline] = useState<string>('28/10/2026');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskOutput, setTaskOutput] = useState<string>('Báo cáo văn bản chính thức .docx');
  const [taskAssigner, setTaskAssigner] = useState<string>('Chủ tịch UBND xã');
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);

  if (!isOpen) return null;

  // Process selected or dropped file
  const processSelectedFile = async (file: File) => {
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    try {
      const text = await extractTextFromFile(file);
      if (text && text.trim().length > 0) {
        const words = text.trim().split(/\s+/).length;
        setExtractedWordCount(words);
      } else {
        setExtractedWordCount(0);
      }
    } catch {
      setExtractedWordCount(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  // Quick suggestion titles for direct mode
  const quickSuggestions = [
    { title: 'Kế hoạch tổ chức lễ hội văn hóa thôn', type: 'plan' as TaskType },
    { title: 'Báo cáo công tác giáo dục, y tế tháng 10', type: 'report' as TaskType },
    { title: 'Rà soát hộ nghèo, cận nghèo năm 2026', type: 'review' as TaskType },
    { title: 'Thống kê gia đình văn hóa năm 2026', type: 'statistics' as TaskType }
  ];

  // Run AI analysis with animated progression
  const handleRunAnalysis = async () => {
    if (!uploadedFile) {
      showNotification('Vui lòng chọn tệp văn bản (.pdf, .docx, .txt)');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 500);
    setTimeout(() => setAnalysisStep(3), 1000);

    let query = '';
    const fileName = uploadedFile.name;

    try {
      const text = await extractTextFromFile(uploadedFile);
      query = text || '';
    } catch {
      query = '';
    }

    try {
      const doc = await runAnalyzeDocument(query, fileName);
      const isPdf = uploadedFile.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      doc.fileName = fileName;
      doc.fileType = isPdf ? 'pdf' : fileName.split('.').pop()?.toLowerCase() || 'txt';
      if (isPdf) {
        doc.fileUrl = URL.createObjectURL(uploadedFile);
      }

      setTimeout(() => {
        setAnalyzedDoc(doc);

        if (doc.tasks && doc.tasks.length > 0) {
          const firstTask = doc.tasks[0];
          const cleanT = firstTask.title || doc.title;
          setTaskTitle(cleanT);
          setTaskType((firstTask.type as TaskType) || 'report');
          setTaskDeadline(firstTask.deadline || '30/10/2026');
          setTaskDesc(firstTask.description || doc.summary);
          setTaskOutput(firstTask.requiredOutput || 'Kết quả thực hiện công việc');
        } else {
          setTaskTitle(doc.title);
          setTaskDesc(doc.summary);
          setTaskDeadline('30/10/2026');
          setTaskOutput('Kết quả thực hiện công việc');
        }

        setIsAnalyzing(false);
      }, 1400);
    } catch {
      setIsAnalyzing(false);
      showNotification('Lỗi khi phân tích văn bản');
    }
  };

  // Confirm task & open workspace
  const handleConfirmAndStart = () => {
    if (!taskTitle.trim()) {
      showNotification('Vui lòng nhập tên công việc cần làm');
      return;
    }

    const taskData: Partial<Task> = {
      title: taskTitle,
      type: taskType,
      deadline: taskDeadline,
      description: taskDesc,
      requiredOutput: taskOutput,
      originalDoc: analyzedDoc ? undefined : {
        id: `manual-doc-${Date.now()}`,
        code: 'Giao việc trực tiếp',
        title: taskTitle,
        issuedBy: taskAssigner || `UBND ${locality.communeName}`,
        date: new Date().toLocaleDateString('vi-VN'),
        excerpt: taskDesc || `Chỉ đạo của ${taskAssigner} về việc ${taskTitle}`
      }
    };

    if (analyzedDoc) {
      confirmTaskFromDoc(taskData, analyzedDoc);
    } else {
      addNewTask(taskData);
      showNotification('Đã tạo công việc mới và mở Bàn làm việc!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in select-none">
      <div className="bg-[#151518] rounded-2xl shadow-2xl border border-[#2a2a32] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#24242a] flex items-center justify-between bg-[#111114] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#261E12] border border-[#45361A] text-[#E5B54F] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#E5B54F]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {analyzedDoc ? `Kết quả phân tích · ${analyzedDoc.code}` : 'Tạo công việc mới'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Mode Toggle (Only show before analysis) */}
          {!analyzedDoc && (
            <div className="grid grid-cols-2 bg-[#1C1C22] p-1 rounded-xl text-xs font-semibold border border-[#2B2B36]">
              <button
                type="button"
                onClick={() => { setSourceType('document'); setAnalyzedDoc(null); }}
                className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center space-x-2 cursor-pointer ${
                  sourceType === 'document' ? 'bg-[#292933] text-white shadow-xs font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#E5B54F]" />
                <span>Tải văn bản chỉ đạo</span>
              </button>
              <button
                type="button"
                onClick={() => { setSourceType('direct'); setAnalyzedDoc(null); }}
                className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center space-x-2 cursor-pointer ${
                  sourceType === 'direct' ? 'bg-[#292933] text-white shadow-xs font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nhập công việc trực tiếp</span>
              </button>
            </div>
          )}

          {/* STEP 1: UPLOAD DOCUMENT */}
          {sourceType === 'document' && !analyzedDoc && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-7 text-center bg-[#111114] transition-colors ${
                  isDragging
                    ? 'border-[#D4AF37] bg-[#1a160f]'
                    : 'border-[#2b2b36] hover:border-[#D4AF37]/60'
                }`}
              >
                <input
                  type="file"
                  id="doc-upload"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer block">
                  <div className="w-10 h-10 rounded-xl bg-[#1C1C22] text-[#E5B54F] flex items-center justify-center mx-auto mb-3 border border-[#2d2d38]">
                    <Upload className="w-5 h-5" />
                  </div>
                  {uploadedFileName ? (
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 bg-[#1b1b22] px-3 py-1.5 rounded-lg border border-[#2d2d38]">
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-bold text-white">{uploadedFileName}</span>
                        <span className="text-[10px] text-zinc-400">({uploadedFileSize})</span>
                      </div>
                      {extractedWordCount > 0 && (
                        <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{extractedWordCount} từ</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-zinc-200">
                        Chọn hoặc kéo thả tệp văn bản (.pdf, .docx, .txt)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Action trigger button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={isAnalyzing || !uploadedFile}
                  onClick={handleRunAnalysis}
                  className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>
                        {analysisStep === 1 && 'Đang đọc văn bản...'}
                        {analysisStep === 2 && 'Đang bóc tách nhiệm vụ...'}
                        {analysisStep === 3 && 'Đang lập kế hoạch...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Phân tích văn bản</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHOWCASE REAL AI VALUE — DOSSIER PHÂN TÍCH THÔNG MINH */}
          {analyzedDoc && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Badge: Căn cứ văn bản */}
              <div className="p-3 rounded-xl bg-[#1A1A22] border border-[#2B2B38] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-300">
                    <strong className="text-white">{analyzedDoc.code}</strong> · {analyzedDoc.issuedBy} ({analyzedDoc.issueDate})
                  </span>
                </div>
                <button
                  onClick={() => { setAnalyzedDoc(null); setIsEditingForm(false); }}
                  className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Đổi tệp
                </button>
              </div>

              {/* Toggle view */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5B54F]" />
                  <span>Nội dung bóc tách</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditingForm(!isEditingForm)}
                  className="text-[11px] text-[#E5B54F] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingForm ? 'Xem tóm lược' : 'Chỉnh sửa thông tin'}</span>
                </button>
              </div>

              {/* A. VIEW 1: CLEAN AI DOSSIER */}
              {!isEditingForm ? (
                <div className="space-y-3.5">
                  {/* Card A: Yêu cầu từ văn bản */}
                  <div className="p-4 rounded-xl bg-[#141418] border border-[#262632] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#22222B] pb-2">
                      <span className="text-[11px] font-bold text-[#E5B54F] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#E5B54F]" />
                        <span>1. Yêu cầu đối với xã</span>
                      </span>
                      {analyzedDoc.briefing?.estimatedWorkload && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#241E12] text-[#E5B54F] border border-[#423419] font-medium">
                          {analyzedDoc.briefing.estimatedWorkload}
                        </span>
                      )}
                    </div>

                    {/* Bối cảnh */}
                    <div className="p-3 rounded-lg bg-[#181611]/80 border-l-2 border-[#D4AF37] text-xs text-zinc-300 leading-relaxed">
                      {analyzedDoc.briefing?.directiveContext || analyzedDoc.summary}
                    </div>

                    {/* Yêu cầu cụ thể */}
                    {analyzedDoc.briefing?.coreDemands && analyzedDoc.briefing.coreDemands.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {analyzedDoc.briefing.coreDemands.map((demand, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                            <span className="w-4 h-4 rounded-full bg-[#1F1F28] text-[#E5B54F] border border-[#343444] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{demand}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Phối hợp */}
                    {analyzedDoc.briefing?.responsibleDepartments && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[11px]">
                        <span className="text-zinc-500 font-medium">Phối hợp:</span>
                        {analyzedDoc.briefing.responsibleDepartments.map((dept, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[#1B1B22] text-zinc-300 border border-[#2B2B38] text-[10px] font-medium">
                            {dept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card B: Nhiệm vụ & Kế hoạch */}
                  <div className="p-4 rounded-xl bg-[#141418] border border-[#262632] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#22222B] pb-2">
                      <span className="text-[11px] font-bold text-[#E5B54F] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E5B54F]" />
                        <span>2. Nhiệm vụ & Kế hoạch thực hiện</span>
                      </span>
                      <span className="text-[11px] text-red-400 font-bold flex items-center gap-1 bg-red-950/30 px-2.5 py-0.5 rounded-md border border-red-900/40">
                        <Clock className="w-3 h-3" />
                        <span>Hạn: {taskDeadline}</span>
                      </span>
                    </div>

                    {/* Task Title Banner */}
                    <div className="p-3 rounded-lg bg-[#181820] border border-[#2A2A38] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white leading-snug break-words">
                          {taskTitle}
                        </h4>
                        <div className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="text-zinc-500">Đầu ra:</span>
                          <span className="text-[#E5B54F] font-semibold">{taskOutput}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action plan checklist steps */}
                    <div className="space-y-1.5 pt-1">
                      {analyzedDoc.actionPlan.map((action, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 text-xs p-2.5 rounded-lg bg-[#181820]/70 border border-[#242432]">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {action.step}
                            </span>
                            <div className="min-w-0">
                              <span className="text-zinc-200 font-semibold">{action.title}</span>
                              <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{action.desc}</p>
                            </div>
                          </div>
                          {action.role && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#1F1F28] text-zinc-400 border border-[#2E2E3E]">
                              {action.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card C: Hồ sơ & Số liệu cần thu thập */}
                  <div className="p-3.5 rounded-xl bg-[#131317] border border-[#23232C] space-y-2">
                    <span className="text-[10px] font-bold text-[#E5B54F] uppercase tracking-wider block">
                      3. Hồ sơ & Số liệu cần thu thập
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {analyzedDoc.requiredFiles.map((req, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#18181E] border border-[#282834] flex items-center space-x-2 text-zinc-300">
                          <Layers className="w-3.5 h-3.5 text-[#E5B54F] shrink-0" />
                          <span className="text-[11px] truncate">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* B. VIEW 2: FORM CHỈNH SỬA THÔNG TIN CHI TIẾT */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#131317] border border-[#23232C]">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Tên nhiệm vụ cần thực thi <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-bold text-white focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Phân loại công việc
                    </label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-semibold text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="report">Báo cáo định kỳ / chuyên đề</option>
                      <option value="plan">Kế hoạch triển khai</option>
                      <option value="review">Rà soát danh sách / chỉ tiêu</option>
                      <option value="statistics">Biểu số liệu thống kê</option>
                      <option value="feedback">Góp ý dự thảo văn bản</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Hạn nộp báo cáo
                    </label>
                    <input
                      type="text"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-semibold text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Sản phẩm đầu ra yêu cầu
                    </label>
                    <input
                      type="text"
                      value={taskOutput}
                      onChange={(e) => setTaskOutput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Mô tả nội dung & yêu cầu
                    </label>
                    <textarea
                      rows={3}
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg text-zinc-200 focus:outline-none focus:border-[#C59B27] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons for analyzed doc */}
              <div className="pt-3 border-t border-[#24242a] flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Đóng lại
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndStart}
                  className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <span>Vào Bàn làm việc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PATH 3: DIRECT INPUT FORM (Khi chọn tự nhập việc) */}
          {sourceType === 'direct' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Quick Suggestions for Direct mode */}
              {!taskTitle && (
                <div className="space-y-1.5 pb-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Gợi ý nhiệm vụ thường gặp tại xã:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTaskTitle(item.title);
                          setTaskType(item.type);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#16161C] hover:bg-[#202028] border border-[#262632] text-[11px] text-zinc-300 transition-colors"
                      >
                        + {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Tên công việc / nhiệm vụ cần làm <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="VD: Báo cáo công tác chuyển đổi số tháng 10/2026..."
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-bold text-white focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Loại hình công việc
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-semibold text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                  >
                    <option value="report">Báo cáo định kỳ / chuyên đề</option>
                    <option value="plan">Kế hoạch triển khai</option>
                    <option value="review">Rà soát danh sách / chỉ tiêu</option>
                    <option value="statistics">Biểu số liệu thống kê</option>
                    <option value="feedback">Góp ý dự thảo văn bản</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Thời hạn hoàn thành
                  </label>
                  <input
                    type="text"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    placeholder="VD: 30/10/2026"
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg font-semibold text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Cơ quan / Lãnh đạo giao việc
                  </label>
                  <input
                    type="text"
                    value={taskAssigner}
                    onChange={(e) => setTaskAssigner(e.target.value)}
                    placeholder="VD: Chủ tịch UBND xã / Thường trực Đảng ủy..."
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Sản phẩm đầu ra yêu cầu
                  </label>
                  <input
                    type="text"
                    value={taskOutput}
                    onChange={(e) => setTaskOutput(e.target.value)}
                    placeholder="VD: Báo cáo hoàn chỉnh định dạng .docx, phụ lục số liệu..."
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg text-zinc-200 focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Mô tả nội dung & yêu cầu thực hiện
                  </label>
                  <textarea
                    rows={3}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Tóm tắt yêu cầu cần thực hiện hoặc chỉ đạo của Lãnh đạo..."
                    className="w-full px-3 py-2 text-xs bg-[#111114] border border-[#2b2b36] rounded-lg text-zinc-200 focus:outline-none focus:border-[#C59B27] leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#24242a] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndStart}
                  className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Khởi tạo công việc & Bắt đầu làm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
