import React from 'react';
import {
  Home,
  CheckSquare,
  Sparkles,
  FileText,
  Database,
  Archive,
  ShieldCheck,
  Settings,
  Coffee
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setTab,
    taskFilterStatus,
    setTaskFilterStatus,
    setTaskFilterType
  } = useStore();

  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: Home,
      active: currentTab === 'tasks' && taskFilterStatus === 'all',
      onClick: () => {
        setTaskFilterStatus('all');
        setTaskFilterType('all');
        setTab('tasks');
      }
    },
    {
      id: 'tasks-urgent',
      label: 'Công việc',
      icon: CheckSquare,
      active: currentTab === 'tasks' && taskFilterStatus !== 'all',
      onClick: () => {
        setTaskFilterStatus('urgent');
        setTab('tasks');
      }
    },
    {
      id: 'workspace',
      label: 'Bàn việc',
      icon: Sparkles,
      active: currentTab === 'workspace',
      onClick: () => setTab('workspace')
    },
    {
      id: 'interpreter',
      label: 'Văn bản',
      icon: FileText,
      active: false,
      onClick: () => {
        setTaskFilterStatus('all');
        setTab('tasks');
      }
    },
    {
      id: 'knowledge',
      label: 'Kho số liệu',
      icon: Database,
      active: false,
      onClick: () => {
        setTaskFilterStatus('waiting_data');
        setTab('tasks');
      }
    },
    {
      id: 'reports',
      label: 'Lưu trữ',
      icon: Archive,
      active: false,
      onClick: () => {
        setTaskFilterStatus('completed');
        setTab('tasks');
      }
    },
  ];

  return (
    <aside className="w-[72px] bg-[#0E0E11] text-zinc-400 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none border-r border-[#1E1E23] z-20 py-3">
      {/* Top Logo: Refined dark bronze/gold instead of glowing neon */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => { setTaskFilterStatus('all'); setTab('tasks'); }}
          className="w-10 h-10 rounded-xl bg-[#1D1912] text-[#D4AF37] border border-[#3D321A] hover:border-[#6B5628] flex items-center justify-center font-bold text-xs tracking-tight shadow-sm hover:scale-105 transition-all"
          title="AI Workmate Cấp Xã"
        >
          <span>AI</span>
        </button>

        {/* Navigation Items (Icon + Label Below) */}
        <nav className="w-full flex flex-col items-center space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-[62px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all group ${
                  isActive
                    ? 'text-[#E5B54F] bg-[#221C12] border border-[#3E3219]'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#E5B54F]' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span className={`text-[10px] font-medium mt-1 leading-none tracking-tight ${isActive ? 'text-[#E5B54F] font-semibold' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tools */}
      <div className="w-full flex flex-col items-center space-y-1 pt-2 border-t border-[#1C1C21]">
        <button
          onClick={() => alert("Bảo mật công vụ: Toàn bộ dữ liệu xử lý nội bộ tại máy tính của cán bộ UBND Xã, không chuyển ra bên ngoài.")}
          className="w-[62px] py-2 px-1 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all group"
          title="Bảo mật công vụ cấp xã"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500/80 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-medium mt-1 text-zinc-400 group-hover:text-emerald-400">Bảo mật</span>
        </button>

        <button
          onClick={() => alert("Cài đặt hệ thống: Đang kết nối mô hình xử lý văn bản cục bộ & chuẩn thể thức NĐ 30/2020/NĐ-CP.")}
          className="w-[62px] py-2 px-1 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all group"
          title="Cài đặt"
        >
          <Settings className="w-4 h-4 text-zinc-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-medium mt-1 text-zinc-400">Cài đặt</span>
        </button>

        <button
          onClick={() => alert("Hướng dẫn sử dụng trợ lý thực thi công việc cấp xã.")}
          className="w-[62px] py-2 px-1 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all group"
          title="Trợ giúp"
        >
          <Coffee className="w-4 h-4 text-zinc-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-medium mt-1 text-zinc-400">Trợ giúp</span>
        </button>
      </div>
    </aside>
  );
};
