import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Flame,
  Calendar,
  Clock,
  BookOpen,
  Trash2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';
import { CreateTaskWizardModal } from './CreateTaskWizardModal';

function parseViDate(dateStr: string): number {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return Number.MAX_SAFE_INTEGER;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).getTime() || Number.MAX_SAFE_INTEGER;
}

function getPriorityTask(tasks: Task[]): { task: Task | undefined; reason: string } {
  if (tasks.length === 0) {
    return { task: undefined, reason: 'Chưa có công việc nào' };
  }

  const active = tasks.filter(t => t.status !== 'completed');
  if (active.length === 0) {
    return { task: undefined, reason: 'Đã hoàn thành toàn bộ công việc hiện có' };
  }

  const priorityRank = { urgent: 0, high: 1, normal: 2 } as const;
  const sorted = [...active].sort((a, b) => {
    const rankDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (rankDiff !== 0) return rankDiff;

    const dateDiff = parseViDate(a.deadline) - parseViDate(b.deadline);
    if (dateDiff !== 0) return dateDiff;

    const missingA = a.missingIndicators.filter(m => !m.isFilled).length;
    const missingB = b.missingIndicators.filter(m => !m.isFilled).length;
    return missingB - missingA;
  });

  const top = sorted[0];
  const levelLabel =
    top.priority === 'urgent'
      ? 'Mức độ Khẩn cấp'
      : top.priority === 'high'
      ? 'Mức độ Ưu tiên cao'
      : 'Mức độ Bình thường';

  return {
    task: top,
    reason: `${levelLabel} · Hạn gần nhất (${top.deadline})`
  };
}

export const TaskManagementScreen: React.FC = () => {
  const {
    tasks,
    locality,
    currentUser,
    setTab,
    setSelectedTask,
    deleteTask,
    searchQuery
  } = useStore();

  const shortName = currentUser?.full_name?.trim().split(/\s+/).pop() || 'Minh';

  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'waiting_data' | 'completed'>('all');

  // Công việc ưu tiên số 1 dựa trên tiêu chí rõ ràng: Chưa xong -> Độ khẩn cao nhất -> Hạn nộp gần nhất
  const { task: priorityTask, reason: priorityReason } = getPriorityTask(tasks);
  const priorityMissingCount = priorityTask ? priorityTask.missingIndicators.filter(m => !m.isFilled).length : 0;

  // Filtered task list
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'urgent' && t.priority !== 'urgent') return false;
    if (statusFilter === 'waiting_data' && !t.missingIndicators.some(m => !m.isFilled)) return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.originalDoc.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const urgentCount = tasks.filter(t => t.priority === 'urgent').length;
  const waitingDataCount = tasks.filter(t => t.missingIndicators.some(m => !m.isFilled)).length;

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task.id);
    setTab('workspace');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* 1. TOP HEADER & GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
            <span>UBND {locality.communeName}</span>
            <span className="text-zinc-600">·</span>
            <span>{currentUser?.department || 'Phòng Văn hóa - Xã hội'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Chào buổi sáng, Đ/c {shortName}!
          </h1>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white bg-[#16161A] hover:bg-[#1D1D22] border border-[#23232A] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hướng dẫn 3 bước</span>
          </button>
        </div>
      </div>

      {/* 2. TOP ACTION SPLIT: TRÁI LÀ TẠO CÔNG VIỆC MỚI | PHẢI LÀ CÔNG VIỆC ƯU TIÊN SỐ 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card (4 cols): Tạo công việc mới (như bản cũ) */}
        <div
          onClick={() => setShowWizardModal(true)}
          className="lg:col-span-4 bg-gradient-to-br from-[#1C1710] to-[#12110E] hover:from-[#241D14] hover:to-[#171510] border-2 border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] rounded-2xl p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-lg shadow-amber-950/20 hover:shadow-amber-950/40"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#E5B54F] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#C59B27] group-hover:text-slate-950 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#E5B54F] bg-[#C59B27]/15 px-2.5 py-1 rounded-lg border border-[#C59B27]/30">
                + Khởi tạo
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#E5B54F] group-hover:text-[#F3CA68] mt-4 tracking-tight">
              Tạo công việc mới
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Tải văn bản chỉ đạo hoặc tự nhập công việc.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#3A2E19] text-xs text-[#E5B54F] group-hover:text-[#F3CA68] flex items-center justify-between font-bold">
            <span>Bắt đầu ngay</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Right Card (8 cols): Công việc ưu tiên số 1 */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1911] via-[#16161A] to-[#121215] border border-[#3E3219] p-6 shadow-xl flex flex-col justify-between">
          {priorityTask ? (
            <>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      title="Tiêu chí xếp hạng: Việc chưa xong → Độ khẩn cao nhất → Hạn nộp gần nhất"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Ưu tiên số 1</span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#E5B54F] bg-[#241E12] px-2.5 py-0.5 rounded-full border border-[#443518]">
                      {priorityReason}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400 font-mono">
                    {priorityTask.originalDoc.code}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {priorityTask.title}
                  </h2>
                </div>

                {/* Quick indicators status */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tiến độ {priorityTask.progress}%</span>
                  </div>
                  {priorityMissingCount > 0 ? (
                    <div className="flex items-center space-x-1.5 text-[#E5B54F] font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Thiếu {priorityMissingCount} chỉ tiêu</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đủ số liệu</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span>Hạn {priorityTask.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#2E2618] flex items-center justify-end">
                <button
                  onClick={() => handleOpenTask(priorityTask)}
                  className="px-5 py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <span>Vào bàn làm việc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-2.5">
              <FileText className="w-8 h-8 text-[#E5B54F]/80" />
              <h2 className="text-base font-bold text-white">Chưa có công việc nào</h2>
              <p className="text-xs text-zinc-400 max-w-xs">
                Hãy tải văn bản chỉ đạo hoặc tạo công việc mới ở bên trái để bắt đầu xử lý.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Đã hoàn thành tất cả công việc</h2>
            </div>
          )}
        </div>
      </div>

      {/* 3. DANH SÁCH CÔNG VIỆC ĐANG THỰC HIỆN (FULL WIDTH) */}
      <div className="space-y-3 pt-1">
        {/* Header & Filter Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Công việc đang thực hiện
          </h3>

          <div className="flex items-center bg-[#131316] border border-[#202026] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#22222A] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                statusFilter === 'urgent'
                  ? 'bg-[#22222A] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Khẩn cấp ({urgentCount})
            </button>
            <button
              onClick={() => setStatusFilter('waiting_data')}
              className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                statusFilter === 'waiting_data'
                  ? 'bg-[#22222A] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Chờ số liệu ({waitingDataCount})
            </button>
          </div>
        </div>

        {/* Full-width Task rows */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#131316] border border-[#202026] rounded-xl p-6 text-center space-y-2.5">
              {tasks.length === 0 ? (
                <>
                  <p className="text-xs font-semibold text-zinc-300">
                    Danh sách công việc hiện đang trống.
                  </p>
                  <button
                    onClick={() => setShowWizardModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo công việc mới</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-zinc-300">
                    Không có công việc nào khớp với bộ lọc hiện tại.
                  </p>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="text-[11px] font-bold text-[#E5B54F] hover:underline cursor-pointer"
                  >
                    Xem tất cả công việc
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const missingCount = task.missingIndicators.filter(m => !m.isFilled).length;

              return (
                <div
                  key={task.id}
                  onClick={() => handleOpenTask(task)}
                  className="bg-[#131316] hover:bg-[#18181D] border border-[#202026] hover:border-zinc-700 rounded-xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-[10px] text-zinc-400 bg-[#1A1A20] px-2 py-0.5 rounded border border-[#25252E]">
                        {task.code}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white truncate">
                        {task.title}
                      </h4>
                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                          Khẩn cấp
                        </span>
                      )}
                      {task.status === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Hoàn thành
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-zinc-500 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-zinc-500" />
                        <span>Từ công văn: <strong className="text-zinc-300">{task.originalDoc.code}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>Hạn nộp: <strong className="text-zinc-300">{task.deadline}</strong></span>
                      </span>
                      {missingCount > 0 && (
                        <span className="text-[#E5B54F] font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Thiếu {missingCount} chỉ tiêu thực địa</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-zinc-300">{task.progress}%</div>
                      <div className="w-24 bg-[#202026] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-[#C59B27]'}`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Xóa công việc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button className="px-3.5 py-2 bg-[#1C1C22] group-hover:bg-[#C59B27] text-zinc-300 group-hover:text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      Làm việc →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Wizard Khởi tạo việc từ văn bản */}
      {showWizardModal && (
        <CreateTaskWizardModal onClose={() => setShowWizardModal(false)} />
      )}

      {/* MODAL: Xác nhận xóa công việc */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151518] border border-[#282832] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Xác nhận xóa công việc?</h3>
                <p className="text-xs text-zinc-300 font-medium break-words">
                  {taskToDelete.title}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Công việc và văn bản đính kèm (nếu có trên hệ thống) sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#222228]">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#1e1e26] hover:bg-[#272732] rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Xóa công việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hướng dẫn 3 bước */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151518] border border-[#282832] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#E5B54F]" />
                <h3 className="text-sm font-bold text-white">Quy trình làm việc 3 bước cấp xã</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#101013] border border-[#1E1E24]">
                <div className="w-6 h-6 rounded-full bg-[#261E12] text-[#E5B54F] border border-[#45361A] flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Tiếp nhận văn bản & Xác định nhiệm vụ</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">
                    Tải tệp PDF/DOCX hoặc dán nội dung chỉ đạo. AI phân tích yêu cầu, xác định rõ nhiệm vụ cụ thể, thời hạn nộp và sản phẩm đầu ra.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#101013] border border-[#1E1E24]">
                <div className="w-6 h-6 rounded-full bg-[#261E12] text-[#E5B54F] border border-[#45361A] flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Bổ sung số liệu còn thiếu tại Bàn làm việc</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">
                    Trợ lý AI tự động phát hiện số liệu khuyết (như số hồ sơ Một cửa, thu ngân sách). Cán bộ điền số liệu, văn bản tự động cập nhật.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#101013] border border-[#1E1E24]">
                <div className="w-6 h-6 rounded-full bg-[#261E12] text-[#E5B54F] border border-[#45361A] flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Đối soát thể thức & Xuất file Word (.docx)</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">
                    Kiểm tra căn cứ pháp lý và thể thức văn bản theo Nghị định 30/2020/NĐ-CP, xuất file Word hoàn chỉnh để trình Chủ tịch ký.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Đã hiểu, bắt đầu làm việc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
