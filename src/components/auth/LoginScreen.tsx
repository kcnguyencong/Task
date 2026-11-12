import React, { useState } from 'react';
import { ShieldCheck, LogIn, UserPlus, Lock, User, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const LoginScreen: React.FC = () => {
  const { login, register, authLoading } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [communeName, setCommuneName] = useState('Xã Dị Sử');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const err = await login(username.trim(), password);
      if (err) setError(err);
    } else {
      const err = await register({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        communeName: communeName.trim() || 'Xã Dị Sử',
      });
      if (err) setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#131318] border border-[#24242d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-[#202028] bg-gradient-to-b from-[#1a1710] to-[#131318]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#241E15] border border-[#3E3219] text-[#E5B54F] flex items-center justify-center font-extrabold text-sm">
              AI
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">
                AI Workmate <span className="text-[#E5B54F] font-semibold text-xs">Cấp Xã</span>
              </h1>
              <p className="text-xs text-zinc-400">Hệ thống quản lý công việc & văn bản đến</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-3 py-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Yêu cầu đăng nhập tài khoản cán bộ để truy cập hệ thống</span>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="px-7 pt-5">
          <div className="grid grid-cols-2 bg-[#0e0e12] border border-[#22222b] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#C59B27] text-slate-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#C59B27] text-slate-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Đăng ký mới
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 pt-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-xs rounded-xl px-3.5 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-300">Họ và tên cán bộ</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-300">Đơn vị (Xã / Phường)</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={communeName}
                    onChange={(e) => setCommuneName(e.target.value)}
                    placeholder="Xã Dị Sử"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-300">Tên đăng nhập</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-zinc-300">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d11] border border-[#262630] rounded-xl text-white placeholder:text-zinc-600 focus:border-[#C59B27] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 bg-[#C59B27] hover:bg-[#D4AF37] disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập hệ thống</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Tạo tài khoản & Đăng nhập</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
