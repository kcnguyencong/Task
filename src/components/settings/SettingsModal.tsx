import React, { useState, useEffect } from 'react';
import { X, Settings, User, Building2, Briefcase, BadgeCheck, Save, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const SettingsModal: React.FC = () => {
  const { showSettingsModal, setShowSettingsModal, currentUser, locality, updateProfile } = useStore();

  const [fullName, setFullName] = useState('');
  const [communeName, setCommuneName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showSettingsModal && currentUser) {
      setFullName(currentUser.full_name || '');
      setCommuneName(currentUser.commune_name || locality.communeName || '');
      setDepartment(currentUser.department || 'Phòng Văn hóa - Xã hội');
      setRole(currentUser.role || 'Công chức VH-XH');
      setError('');
    }
  }, [showSettingsModal, currentUser, locality.communeName]);

  if (!showSettingsModal || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !communeName.trim() || !department.trim()) {
      setError('Vui lòng nhập đầy đủ Họ tên, Đơn vị UBND và Phòng ban.');
      return;
    }

    setSaving(true);
    const err = await updateProfile({
      fullName: fullName.trim(),
      communeName: communeName.trim(),
      department: department.trim(),
      role: role.trim() || 'Công chức VH-XH',
    });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    setShowSettingsModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#151518] border border-[#282832] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222228] flex items-center justify-between bg-[#18181d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241E15] border border-[#3E3219] text-[#E5B54F] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cấu hình tài khoản & Đơn vị</h3>
              <p className="text-[11px] text-zinc-400">Tài khoản: <span className="font-mono text-zinc-200">{currentUser.username}</span></p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-xs rounded-xl px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Họ và tên cán bộ</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Vũ Dũng"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Đơn vị UBND (Xã / Phường)</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={communeName}
                onChange={(e) => setCommuneName(e.target.value)}
                placeholder="Ví dụ: Xã Dị Sử hoặc Phường Nhân Hòa"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Phòng / Ban chuyên môn</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ví dụ: Phòng Văn hóa - Xã hội"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Chức danh hiển thị</label>
            <div className="relative">
              <BadgeCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ví dụ: Công chức VH-XH"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#222228] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#1e1e26] hover:bg-[#272732] rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#C59B27] hover:bg-[#D4AF37] disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu cấu hình</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
