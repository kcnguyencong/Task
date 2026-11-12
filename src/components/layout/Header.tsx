import React from 'react';
import {
  Search,
  Bell,
  Command,
  ShieldCheck,
  Sparkles,
  Building2,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';

function getInitials(fullName?: string): string {
  if (!fullName) return 'CB';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Header: React.FC = () => {
  const { notification, searchQuery, setSearchQuery, tasks, locality, currentUser, logout, setShowSettingsModal } = useStore();

  const missingCount = tasks.filter(t => t.missingIndicators.some(m => !m.isFilled)).length;

  return (
    <header className="h-11 bg-[#0E0E11] border-b border-[#1E1E23] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Window Title & App Identification */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
          <span className="text-xs font-semibold text-zinc-300">
            Trang chủ <span className="text-zinc-600">·</span> <span className="text-zinc-200 font-bold">AI Workmate</span> <span className="text-[10px] text-zinc-400 font-normal">Cấp Xã</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#16161A] border border-[#23232A] text-[10px] text-zinc-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-500/80" />
          <span>Bảo mật nội bộ máy cán bộ</span>
        </div>

        {/* Locality badge */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#181822] border border-[#2A2A38] text-[10px] text-zinc-300 font-medium">
          <Building2 className="w-3 h-3 text-[#E5B54F]" />
          <span>UBND {locality.communeName}</span>
          <span className="text-zinc-500 font-normal">({locality.provinceName})</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="relative w-72 sm:w-80">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm công việc, chỉ tiêu, số liệu... (⌘K)"
          className="w-full pl-8 pr-9 py-1 text-xs bg-[#141417] hover:bg-[#18181C] focus:bg-[#1A1A1F] border border-[#24242A] rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 transition-all font-medium text-zinc-200 placeholder:text-zinc-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-[#1E1E24] px-1 py-0.5 rounded text-[9px] font-mono text-zinc-400 pointer-events-none">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right: Notifications, User Profile & Desktop Window Controls */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <button
          onClick={() => alert(`Bạn có ${missingCount} công việc đang chờ bổ sung số liệu để hoàn thiện dự thảo.`)}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-[#18181C] rounded-lg transition-colors relative"
          title="Thông báo công việc"
        >
          <Bell className="w-3.5 h-3.5" />
          {missingCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          )}
        </button>

        {/* User Mini Tag & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#1E1E23]">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-2 hover:bg-white/5 px-1.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Cấu hình họ tên & đơn vị"
          >
            <div className="w-6 h-6 rounded-lg bg-[#241E15] border border-[#3E3219] text-[#E5B54F] flex items-center justify-center font-bold text-[10px]">
              {getInitials(currentUser?.full_name)}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-zinc-300">
              {currentUser?.full_name || 'Cán bộ xã'}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">
                ({currentUser?.role || 'Công chức VH-XH'})
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="ml-1 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Floating toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16161A] text-zinc-200 px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </header>
  );
};
