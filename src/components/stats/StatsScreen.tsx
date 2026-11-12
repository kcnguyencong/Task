import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FilePlus2,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';

function parseViDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (!day || !month || !year || year < 2000) return null;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getTaskCreatedDate(task: Task): Date {
  // Ưu tiên timestamp từ id ("task-1794...") hoặc ngày ban hành văn bản
  const idMatch = task.id.match(/(\d{13})/);
  if (idMatch) {
    const dt = new Date(Number(idMatch[1]));
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  const docDate = parseViDate(task.originalDoc?.date);
  if (docDate) return docDate;
  return new Date();
}

function toMonthKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${m}/${date.getFullYear()}`;
}

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

type DeadlineHealth = 'on_time' | 'overdue_completed' | 'overdue_pending' | 'in_progress';

function evaluateTaskDeadline(task: Task, today: Date): DeadlineHealth {
  const deadlineDate = parseViDate(task.deadline);

  if (task.status === 'completed') {
    if (!deadlineDate) return 'on_time';
    const completedDate = parseViDate(task.completedAt) || today;
    return completedDate.getTime() <= deadlineDate.getTime() ? 'on_time' : 'overdue_completed';
  }

  if (deadlineDate && deadlineDate.getTime() < today.getTime()) {
    return 'overdue_pending';
  }
  return 'in_progress';
}

export const StatsScreen: React.FC = () => {
  const { tasks, locality, currentUser, setSelectedTask, setTab } = useStore();
  const today = useMemo(() => getStartOfToday(), []);
  const currentMonthKey = useMemo(() => toMonthKey(today), [today]);

  // Danh sách các tháng có phát sinh công việc + tháng hiện tại
  const monthOptions = useMemo(() => {
    const keys = new Set<string>([currentMonthKey]);
    for (const t of tasks) {
      keys.add(toMonthKey(getTaskCreatedDate(t)));
    }
    return Array.from(keys).sort((a, b) => {
      const [ma, ya] = a.split('/').map(Number);
      const [mb, yb] = b.split('/').map(Number);
      return yb !== ya ? yb - ya : mb - ma;
    });
  }, [tasks, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const scopedTasks = useMemo(() => {
    if (selectedMonth === 'all') return tasks;
    return tasks.filter((t) => toMonthKey(getTaskCreatedDate(t)) === selectedMonth);
  }, [tasks, selectedMonth]);

  // Tính toán các chỉ số thống kê trong kỳ đã chọn
  const metrics = useMemo(() => {
    const total = scopedTasks.length;
    let completed = 0;
    let onTimeCompleted = 0;
    let overdueCompleted = 0;
    let overduePending = 0;
    let inProgressOnTrack = 0;

    for (const t of scopedTasks) {
      const health = evaluateTaskDeadline(t, today);
      if (t.status === 'completed') {
        completed += 1;
        if (health === 'on_time') onTimeCompleted += 1;
        else overdueCompleted += 1;
      } else {
        if (health === 'overdue_pending') overduePending += 1;
        else inProgressOnTrack += 1;
      }
    }

    const totalOverdue = overdueCompleted + overduePending;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onTimeRateAmongCompleted =
      completed > 0 ? Math.round((onTimeCompleted / completed) * 100) : 0;
    const overdueRate = total > 0 ? Math.round((totalOverdue / total) * 100) : 0;

    return {
      total,
      completed,
      onTimeCompleted,
      overdueCompleted,
      overduePending,
      inProgressOnTrack,
      totalOverdue,
      completionRate,
      onTimeRateAmongCompleted,
      overdueRate,
    };
  }, [scopedTasks, today]);

  // Số liệu biểu đồ theo tháng (tối đa 6 tháng gần nhất)
  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; created: number; completed: number; overdue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = toMonthKey(d);
      months.push({
        key,
        label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`,
        created: 0,
        completed: 0,
        overdue: 0,
      });
    }

    const map = new Map(months.map((m) => [m.key, m]));
    for (const t of tasks) {
      const key = toMonthKey(getTaskCreatedDate(t));
      const bucket = map.get(key);
      if (!bucket) continue;
      bucket.created += 1;
      if (t.status === 'completed') bucket.completed += 1;
      const health = evaluateTaskDeadline(t, today);
      if (health === 'overdue_completed' || health === 'overdue_pending') {
        bucket.overdue += 1;
      }
    }

    return months;
  }, [tasks, today]);

  const maxBarValue = useMemo(() => {
    const maxVal = Math.max(1, ...monthlySeries.map((m) => m.created));
    return maxVal;
  }, [monthlySeries]);

  const handleOpenTask = (taskId: string) => {
    setSelectedTask(taskId);
    setTab('workspace');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header + Bộ lọc tháng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
            <span>UBND {locality.communeName}</span>
            <span className="text-zinc-600">·</span>
            <span>{currentUser?.department || 'Phòng Văn hóa - Xã hội'}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#E5B54F]" />
            <span>Thống kê hiệu quả xử lý công việc</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              selectedMonth === 'all'
                ? 'bg-[#C59B27] text-slate-950 border-[#C59B27] font-bold'
                : 'bg-[#141418] text-zinc-300 border-[#24242c] hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setSelectedMonth(currentMonthKey)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              selectedMonth === currentMonthKey
                ? 'bg-[#C59B27] text-slate-950 border-[#C59B27] font-bold'
                : 'bg-[#141418] text-zinc-300 border-[#24242c] hover:text-white'
            }`}
          >
            Tháng này ({currentMonthKey})
          </button>

          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-8 pr-4 py-1.5 bg-[#141418] border border-[#24242c] rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none focus:border-[#C59B27] cursor-pointer"
            >
              <option value="all">Tất cả các tháng</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Công việc khởi tạo</span>
            <div className="w-8 h-8 rounded-xl bg-[#241E15] border border-[#3E3219] text-[#E5B54F] flex items-center justify-center">
              <FilePlus2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics.total}</div>
          <p className="text-[11px] text-zinc-500">
            {selectedMonth === 'all' ? 'Tổng số công việc từ trước đến nay' : `Khởi tạo trong tháng ${selectedMonth}`}
          </p>
        </div>

        <div className="bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Văn bản hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.completed}</span>
            <span className="text-xs font-bold text-emerald-400">({metrics.completionRate}%)</span>
          </div>
          <div className="w-full bg-[#1e1e26] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Tỷ lệ hoàn thành đúng hạn</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/50 border border-sky-800/40 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.onTimeRateAmongCompleted}%</span>
            <span className="text-xs text-zinc-400">({metrics.onTimeCompleted}/{metrics.completed} việc)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Tính trên tổng số văn bản đã hoàn thành
          </p>
        </div>

        <div className="bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Công việc quá hạn</span>
            <div className="w-8 h-8 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalOverdue}</span>
            <span className="text-xs font-bold text-red-400">({metrics.overdueRate}%)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {metrics.overduePending} chưa xong quá hạn · {metrics.overdueCompleted} xong trễ hạn
          </p>
        </div>
      </div>

      {/* Biểu đồ theo tháng + Cơ cấu trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-white">Biểu đồ khối lượng công việc 6 tháng gần nhất</h2>
              <p className="text-[11px] text-zinc-400">So sánh số lượng khởi tạo, đã hoàn thành và quá hạn theo tháng</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C59B27]" />
                Khởi tạo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Hoàn thành
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                Quá hạn
              </span>
            </div>
          </div>

          <div className="h-52 pt-4 flex items-end justify-between gap-3 border-b border-[#22222a] pb-2">
            {monthlySeries.map((m) => {
              const createdH = Math.round((m.created / maxBarValue) * 140);
              const completedH = Math.round((m.completed / maxBarValue) * 140);
              const overdueH = Math.round((m.overdue / maxBarValue) * 140);

              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <div className="flex items-end justify-center gap-1.5 h-40 w-full">
                    <div className="flex flex-col items-center gap-1">
                      {m.created > 0 && <span className="text-[10px] font-bold text-[#E5B54F]">{m.created}</span>}
                      <div
                        className="w-3.5 sm:w-4 bg-[#C59B27] rounded-t-md transition-all"
                        style={{ height: `${Math.max(m.created > 0 ? 8 : 2, createdH)}px` }}
                        title={`Khởi tạo: ${m.created}`}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {m.completed > 0 && <span className="text-[10px] font-bold text-emerald-400">{m.completed}</span>}
                      <div
                        className="w-3.5 sm:w-4 bg-emerald-500 rounded-t-md transition-all"
                        style={{ height: `${Math.max(m.completed > 0 ? 8 : 2, completedH)}px` }}
                        title={`Hoàn thành: ${m.completed}`}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {m.overdue > 0 && <span className="text-[10px] font-bold text-red-400">{m.overdue}</span>}
                      <div
                        className="w-3.5 sm:w-4 bg-red-500 rounded-t-md transition-all"
                        style={{ height: `${Math.max(m.overdue > 0 ? 8 : 2, overdueH)}px` }}
                        title={`Quá hạn: ${m.overdue}`}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tóm tắt trạng thái hạn */}
        <div className="bg-[#131317] border border-[#22222a] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Phân bổ tiến độ hạn xử lý</h2>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Hoàn thành đúng hạn
                </span>
                <span className="font-bold text-white">{metrics.onTimeCompleted}</span>
              </div>
              <div className="w-full bg-[#1e1e26] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${metrics.total > 0 ? Math.round((metrics.onTimeCompleted / metrics.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5B54F] font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Đang thực hiện (còn hạn)
                </span>
                <span className="font-bold text-white">{metrics.inProgressOnTrack}</span>
              </div>
              <div className="w-full bg-[#1e1e26] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C59B27] rounded-full"
                  style={{ width: `${metrics.total > 0 ? Math.round((metrics.inProgressOnTrack / metrics.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Quá hạn (trễ / chưa xong)
                </span>
                <span className="font-bold text-white">{metrics.totalOverdue}</span>
              </div>
              <div className="w-full bg-[#1e1e26] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${metrics.overdueRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#22222a] text-[11px] text-zinc-400 leading-relaxed">
            Dữ liệu được tổng hợp trực tiếp từ danh sách công việc và văn bản đã lưu của đơn vị.
          </div>
        </div>
      </div>

      {/* Bảng chi tiết công việc trong kỳ */}
      <div className="bg-[#131317] border border-[#22222a] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#22222a] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            Chi tiết công việc ({scopedTasks.length})
          </h2>
          <span className="text-[11px] text-zinc-400">
            Bấm vào từng dòng để mở bàn làm việc
          </span>
        </div>

        {scopedTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Chưa có công việc nào trong khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#17171d] text-zinc-400 border-b border-[#22222a]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Số / Ký hiệu</th>
                  <th className="px-5 py-3 font-semibold">Tên công việc</th>
                  <th className="px-5 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-5 py-3 font-semibold">Hạn xử lý</th>
                  <th className="px-5 py-3 font-semibold">Tình trạng hạn</th>
                  <th className="px-5 py-3 font-semibold text-right">Tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e26]">
                {scopedTasks.map((t) => {
                  const created = getTaskCreatedDate(t).toLocaleDateString('vi-VN');
                  const health = evaluateTaskDeadline(t, today);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleOpenTask(t.id)}
                      className="hover:bg-[#191920] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                        {t.originalDoc?.code || t.code}
                      </td>
                      <td className="px-5 py-3 font-semibold text-zinc-200 group-hover:text-white max-w-md truncate">
                        {t.title}
                      </td>
                      <td className="px-5 py-3 text-zinc-400 whitespace-nowrap">{created}</td>
                      <td className="px-5 py-3 text-zinc-300 whitespace-nowrap">{t.deadline}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {health === 'on_time' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Hoàn thành đúng hạn
                          </span>
                        )}
                        {health === 'overdue_completed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Hoàn thành trễ hạn
                          </span>
                        )}
                        {health === 'overdue_pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            Đang quá hạn
                          </span>
                        )}
                        {health === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#241E15] text-[#E5B54F] border border-[#3E3219]">
                            Đang xử lý · Còn hạn
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-bold text-zinc-300 group-hover:text-[#E5B54F]">
                          <span>{t.progress}%</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
