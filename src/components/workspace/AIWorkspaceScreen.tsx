import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  FileText,
  Calendar,
  Plus,
  Trash2,
  Check,
  Building2,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import { fixVietnameseOcrText } from '../../services/aiService';
import { getSignedDocumentViewUrl } from '../../services/blobService';

function viDateToIso(viDate: string): string {
  const parts = viDate.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function isoToViDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export const AIWorkspaceScreen: React.FC = () => {
  const {
    tasks,
    documents,
    selectedTaskId,
    setTab,
    updateTaskStatus,
    updateTaskDeadline,
    updateChecklistStatus,
    addChecklistItem,
    removeChecklistItem,
    completeTaskAndArchive,
    deleteTask
  } = useStore();

  const currentTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const [deadlineInput, setDeadlineInput] = useState<string>(currentTask?.deadline || '');
  const [newTaskItem, setNewTaskItem] = useState<string>('');
  const [docViewMode, setDocViewMode] = useState<'pdf' | 'text'>('pdf');
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    if (currentTask) {
      setDeadlineInput(currentTask.deadline);
      const isPdf =
        currentTask.originalDoc.fileType === 'pdf' ||
        currentTask.originalDoc.fileName?.toLowerCase().endsWith('.pdf');

      if (currentTask.originalDoc.fileUrl) {
        setResolvedPdfUrl(currentTask.originalDoc.fileUrl);
        setDocViewMode('pdf');
      } else if (isPdf && currentTask.originalDoc.blobPathname) {
        setResolvedPdfUrl(null);
        setDocViewMode('pdf');
        getSignedDocumentViewUrl(currentTask.originalDoc.blobPathname).then((signedUrl) => {
          if (!cancelled) {
            if (signedUrl) {
              setResolvedPdfUrl(signedUrl);
            } else {
              setDocViewMode('text');
            }
          }
        });
      } else {
        setResolvedPdfUrl(null);
        setDocViewMode('text');
      }
    }

    return () => {
      cancelled = true;
    };
  }, [currentTask?.id]);

  if (!currentTask) {
    return (
      <div className="p-16 text-center space-y-3">
        <p className="text-zinc-400 font-medium text-sm">
          Chưa có công việc nào được chọn. Vui lòng quay lại trang chủ để tạo hoặc chọn công việc.
        </p>
        <button
          onClick={() => setTab('tasks')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách công việc</span>
        </button>
      </div>
    );
  }

  // Tìm nội dung đầy đủ của văn bản gốc
  const matchedSourceDoc = documents.find(d => d.id === currentTask.originalDoc.id);
  const fullDocumentText = fixVietnameseOcrText(
    currentTask.originalDoc.fullContent ||
      matchedSourceDoc?.fullContent ||
      matchedSourceDoc?.summary ||
      currentTask.originalDoc.excerpt ||
      ''
  );

  const completedCount = currentTask.checklist.filter(c => c.status === 'completed').length;
  const totalCount = currentTask.checklist.length;

  const handleSaveDeadline = () => {
    const trimmed = deadlineInput.trim();
    if (trimmed && trimmed !== currentTask.deadline) {
      updateTaskDeadline(currentTask.id, trimmed);
    }
  };

  const handleDatePickerChange = (isoVal: string) => {
    if (!isoVal) return;
    const vi = isoToViDate(isoVal);
    setDeadlineInput(vi);
    updateTaskDeadline(currentTask.id, vi);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskItem.trim()) return;
    addChecklistItem(currentTask.id, newTaskItem);
    setNewTaskItem('');
  };

  const handleCompleteAndArchive = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    completeTaskAndArchive(currentTask.id);
  };

  return (
    <div className="h-[calc(100vh-2.75rem)] flex flex-col bg-[#0c0c0e] overflow-hidden select-none">
      {/* TOP BAR */}
      <div className="h-13 bg-[#121215] border-b border-[#202025] px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <button
            onClick={() => setTab('tasks')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-[#E5B54F] px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>

          <span className="font-mono text-xs font-extrabold text-[#E5B54F] bg-[#1c1c22] px-2 py-0.5 rounded border border-[#2b2b36] shrink-0">
            {currentTask.code}
          </span>

          <h2 className="text-xs sm:text-sm font-bold text-white truncate">
            {currentTask.title}
          </h2>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xóa công việc này"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa</span>
          </button>

          {currentTask.status !== 'completed' ? (
            <button
              onClick={handleCompleteAndArchive}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm border border-emerald-500/30 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hoàn tất công việc</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Đã hoàn thành</span>
            </span>
          )}
        </div>
      </div>

      {/* 2-COLUMN WORKBENCH: TRÁI (THAO TÁC CÁN BỘ) | PHẢI (VĂN BẢN ĐÃ UPLOAD) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* CỘT TRÁI (5 cols): DÀNH CHO CÁN BỘ THAO TÁC */}
        <div className="lg:col-span-5 bg-[#121215] border-r border-[#202025] flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* 1. HẠN THỰC HIỆN & TRẠNG THÁI */}
            <div className="bg-[#17171c] border border-[#252530] rounded-2xl p-4 space-y-4">
              {/* Hạn thực hiện */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E5B54F]" />
                  <span>Hạn thực hiện</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    onBlur={handleSaveDeadline}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveDeadline();
                    }}
                    placeholder="DD/MM/YYYY"
                    className="flex-1 px-3 py-2 text-xs bg-[#101013] border border-[#2b2b36] rounded-xl text-white font-bold focus:border-[#C59B27] focus:outline-none"
                  />

                  <input
                    type="date"
                    value={viDateToIso(deadlineInput)}
                    onChange={(e) => handleDatePickerChange(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-[#101013] border border-[#2b2b36] rounded-xl text-zinc-200 focus:border-[#C59B27] focus:outline-none [color-scheme:dark] cursor-pointer"
                    title="Chọn ngày từ lịch"
                  />

                  <button
                    type="button"
                    onClick={handleSaveDeadline}
                    className="px-3 py-2 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
                  >
                    Lưu hạn
                  </button>
                </div>
              </div>

              {/* Trạng thái & Tiến độ */}
              <div className="pt-3 border-t border-[#23232c] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Tiến độ thực hiện
                  </span>
                  <span className="font-extrabold text-[#E5B54F]">
                    {completedCount}/{totalCount} việc ({currentTask.progress}%)
                  </span>
                </div>

                <div className="w-full bg-[#101013] rounded-full h-2 overflow-hidden border border-[#24242c]">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      currentTask.progress === 100 ? 'bg-emerald-500' : 'bg-[#C59B27]'
                    }`}
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(currentTask.id, 'in_progress')}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      currentTask.status === 'in_progress'
                        ? 'bg-[#2E2514] text-[#E5B54F] border-[#664D1B]'
                        : 'bg-[#121216] text-zinc-400 border-[#22222a] hover:text-zinc-200'
                    }`}
                  >
                    Đang làm
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(currentTask.id, 'waiting_data')}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      currentTask.status === 'waiting_data'
                        ? 'bg-blue-950/40 text-blue-300 border-blue-800/50'
                        : 'bg-[#121216] text-zinc-400 border-[#22222a] hover:text-zinc-200'
                    }`}
                  >
                    Chờ phối hợp
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(currentTask.id, 'completed')}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      currentTask.status === 'completed'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50'
                        : 'bg-[#121216] text-zinc-400 border-[#22222a] hover:text-zinc-200'
                    }`}
                  >
                    Hoàn thành
                  </button>
                </div>
              </div>
            </div>

            {/* 2. DANH SÁCH NHỮNG CÔNG VIỆC CẦN THỰC HIỆN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Danh sách công việc cần thực hiện
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {completedCount}/{totalCount} đã xong
                </span>
              </div>

              <div className="space-y-2">
                {currentTask.checklist.map((item, idx) => {
                  const isDone = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                        isDone
                          ? 'bg-[#141a16] border-emerald-900/40'
                          : 'bg-[#17171d] border-[#262632] hover:border-[#C59B27]/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateChecklistStatus(
                            currentTask.id,
                            item.id,
                            isDone ? 'pending' : 'completed'
                          )
                        }
                        className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'bg-[#101014] border-zinc-600 group-hover:border-[#E5B54F]'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-semibold leading-relaxed block ${
                              isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                            }`}
                          >
                            {idx + 1}. {item.label}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateChecklistStatus(
                              currentTask.id,
                              item.id,
                              isDone ? 'pending' : 'completed'
                            )
                          }
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                            isDone
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                              : 'bg-[#1f1f26] text-zinc-400 border-[#2e2e3a] hover:text-white'
                          }`}
                        >
                          {isDone ? 'Đã xong' : 'Chưa xong'}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeChecklistItem(currentTask.id, item.id)}
                          className="p-1 text-zinc-600 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa đầu việc"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thêm đầu việc mới */}
              <form onSubmit={handleAddChecklist} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newTaskItem}
                  onChange={(e) => setNewTaskItem(e.target.value)}
                  placeholder="Thêm công việc cần làm..."
                  className="flex-1 px-3 py-2 text-xs bg-[#101013] border border-[#2b2b36] rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#1e1e26] hover:bg-[#2a2a36] text-[#E5B54F] border border-[#323240] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 cols): HIỂN THỊ LẠI VĂN BẢN ĐÃ UPLOAD LÊN */}
        <div className="lg:col-span-7 bg-[#09090b] flex flex-col overflow-hidden">
          {/* Document Viewer Header */}
          <div className="bg-[#121215] border-b border-[#202025] px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-[#E5B54F] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentTask.originalDoc.fileName || currentTask.originalDoc.title}
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 truncate">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-500" />
                    {currentTask.originalDoc.issuedBy}
                  </span>
                  <span>·</span>
                  <span>Số: {currentTask.originalDoc.code}</span>
                  <span>·</span>
                  <span>Ngày: {currentTask.originalDoc.date}</span>
                </div>
              </div>
            </div>

            {resolvedPdfUrl && (
              <div className="flex items-center bg-[#18181f] border border-[#282834] p-0.5 rounded-lg text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => setDocViewMode('pdf')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    docViewMode === 'pdf' ? 'bg-[#C59B27] text-slate-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Bản gốc PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocViewMode('text')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                    docViewMode === 'text' ? 'bg-[#C59B27] text-slate-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Văn bản chữ
                </button>
              </div>
            )}
          </div>

          {/* Document Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {resolvedPdfUrl && docViewMode === 'pdf' ? (
              <iframe
                src={resolvedPdfUrl}
                title={currentTask.originalDoc.fileName || 'Văn bản đã tải lên'}
                className="w-full h-full min-h-[75vh] rounded-xl border border-[#262630] bg-white"
              />
            ) : (
              <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl border border-zinc-700/30 px-8 py-9 sm:px-10 sm:py-10 font-serif">
                <div className="pb-4 mb-5 border-b border-slate-200 flex items-center justify-between font-sans text-xs text-slate-500">
                  <span>Văn bản: <strong className="text-slate-800">{currentTask.originalDoc.code}</strong></span>
                  <span>Ban hành: <strong className="text-slate-800">{currentTask.originalDoc.issuedBy}</strong></span>
                </div>

                <div className="text-[14px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words select-text">
                  {fullDocumentText || 'Chưa có nội dung văn bản.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151518] border border-[#282832] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Xác nhận xóa công việc?</h3>
                <p className="text-xs text-zinc-300 font-medium break-words">
                  {currentTask.title}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Công việc và tệp văn bản đính kèm trên Vercel Blob sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#222228]">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#1e1e26] hover:bg-[#272732] rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = currentTask.id;
                  setConfirmDelete(false);
                  deleteTask(idToDelete);
                  setTab('tasks');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Xóa công việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
