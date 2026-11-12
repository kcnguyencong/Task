import React, { useState } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Calendar,
  Layers,
  Flame,
  ChevronRight,
  FileCode2,
  CheckCircle,
  ArrowUpRight,
  Upload
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { TaskType, Task } from '../../types';
import { CreateTaskWizardModal } from '../tasks/CreateTaskWizardModal';

export const DashboardScreen: React.FC = () => {
  const { tasks, setTab, setSelectedTask, searchQuery } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'missing' | 'completed'>('all');
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);

  // Thống kê nhanh
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const waitingDataCount = tasks.filter(t => t.missingIndicators.some(m => !m.isFilled)).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  // Lọc theo search và filter
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'urgent' && t.priority !== 'urgent') return false;
    if (activeFilter === 'missing' && !t.missingIndicators.some(m => !m.isFilled)) return false;
    if (activeFilter === 'completed' && t.status !== 'completed') return false;

    if (!searchQuery) return true;
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'report':
        return { label: 'Báo cáo', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText };
      case 'plan':
        return { label: 'Kế hoạch', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Layers };
      case 'review':
        return { label: 'Rà soát', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertCircle };
      case 'statistics':
        return { label: 'Thống kê', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: FileSpreadsheet };
      case 'feedback':
        return { label: 'Góp ý văn bản', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileCode2 };
      default:
        return { label: 'Nhiệm vụ', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: FileText };
    }
  };

  const handleOpenTaskInWorkspace = (task: Task) => {
    setSelectedTask(task.id);
    setTab('workspace');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Executive Hero Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#173B66] via-[#1E4B82] to-[#173B66] p-6 text-white shadow-md relative overflow-hidden border border-slate-700/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Gợi ý ưu tiên điều hành thông minh</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Chào buổi sáng, Đ/c Minh! Bạn có <span className="text-amber-300 font-extrabold">3 công việc</span> cần tập trung xử lý hôm nay.
            </h2>

            <p className="text-slate-200 text-xs leading-relaxed font-normal">
              <strong>Báo cáo KT-XH tháng 10/2026</strong> đã tổng hợp được <strong>8/10 chỉ tiêu</strong>. Bạn chỉ cần bổ sung <strong>2 chỉ tiêu còn thiếu</strong> (Thu ngân sách & Tỷ lệ giải quyết TTHC đúng hạn) để Trợ lý AI tự động hoàn thiện toàn bộ dự thảo 4 mục trình Lãnh đạo UBND xã phê duyệt.
            </p>

            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-200">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Đã thu thập: <strong>8 chỉ tiêu</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-400/30 whitespace-nowrap">
                <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Cần bổ sung: <strong>2 chỉ tiêu</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span>Hạn nộp Huyện: <strong>28/10/2026</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setSelectedTask('task-1');
                setTab('workspace');
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Tiếp tục hoàn thiện báo cáo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Create task from document button */}
            <button
              onClick={() => setShowWizardModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Khởi tạo việc từ văn bản</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending */}
        <div
          onClick={() => setActiveFilter('all')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeFilter === 'all'
              ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Công việc cần xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
            <span className="text-xs text-slate-500 font-medium">nhiệm vụ</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-semibold flex items-center justify-between">
            <span>Đang trong chu kỳ thực hiện</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Urgent */}
        <div
          onClick={() => setActiveFilter('urgent')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeFilter === 'urgent'
              ? 'border-amber-500 shadow-sm ring-1 ring-amber-500/20'
              : 'border-slate-200 hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Công việc khẩn cấp</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-600">{urgentCount}</span>
            <span className="text-xs text-slate-500 font-medium">hạn trước 28/10</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center justify-between">
            <span>CV 142/UBND-TH (Huyện Tân Trực)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Missing data */}
        <div
          onClick={() => setActiveFilter('missing')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeFilter === 'missing'
              ? 'border-red-500 shadow-sm ring-1 ring-red-500/20'
              : 'border-slate-200 hover:border-red-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chờ bổ sung số liệu</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-600">{waitingDataCount}</span>
            <span className="text-xs text-slate-500 font-medium">báo cáo thiếu số</span>
          </div>
          <div className="mt-2 text-[11px] text-red-700 font-semibold flex items-center justify-between">
            <span>Kế toán & Một cửa chưa chốt</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Completed */}
        <div
          onClick={() => setActiveFilter('completed')}
          className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
            activeFilter === 'completed'
              ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đã hoàn thành</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-700">{completedCount}</span>
            <span className="text-xs text-slate-500 font-medium">văn bản / báo cáo</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
            <span>Lưu trong kho tri thức</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Task List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Quick Filter Pills */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <span>Danh mục nhiệm vụ trọng tâm</span>
              <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                {filteredTasks.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuyển hóa từ công văn cấp trên sang nhiệm vụ cụ thể, rõ hạn định và kết quả đầu ra
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveFilter('urgent')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'urgent' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Việc khẩn
            </button>
            <button
              onClick={() => setActiveFilter('missing')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'missing' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thiếu số liệu
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã xong
            </button>
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.map((task) => {
            const badge = getTaskTypeBadge(task.type);
            const BadgeIcon = badge.icon;
            const hasMissingData = task.missingIndicators.some(m => !m.isFilled);

            return (
              <div
                key={task.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left Task Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Task type badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.color}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    {/* Priority badge */}
                    {task.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
                        Khẩn cấp
                      </span>
                    )}

                    {/* Original Doc Code */}
                    <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      Nguồn: {task.originalDoc.code}
                    </span>

                    {/* Missing indicator warning pill */}
                    {hasMissingData && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md font-semibold border border-red-200">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>Thiếu {task.missingIndicators.filter(m => !m.isFilled).length} chỉ tiêu số liệu</span>
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => handleOpenTaskInWorkspace(task)}
                    className="text-sm font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                  >
                    {task.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* AI Recommended Next Action Pill */}
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[#173B66] font-bold text-[11px]">Gợi ý tiếp theo:</span>
                    <span className="text-[11px] text-slate-600 truncate">{task.recommendedAction}</span>
                  </div>
                </div>

                {/* Right Progress & Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:w-56 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hạn nộp: <strong className="text-slate-800 font-bold">{task.deadline}</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Tiến độ thực hiện</span>
                      <span className={task.progress === 100 ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'}>
                        {task.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.progress === 100 ? 'bg-emerald-600' : 'bg-[#173B66]'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleOpenTaskInWorkspace(task)}
                    className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 group-hover:text-white bg-slate-100 group-hover:bg-[#173B66] rounded-lg transition-all flex items-center justify-center space-x-1 active:scale-95"
                  >
                    <span>Vào không gian làm việc</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE TASK WIZARD MODAL */}
      <CreateTaskWizardModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
      />
    </div>
  );
};
