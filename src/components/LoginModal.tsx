import React, { useState } from 'react';
import {
  LogIn,
  X,
  Lock,
  User,
  School,
  LogOut,
  UserCheck,
  ShieldCheck,
  ArrowRightLeft,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const {
    userRole,
    activeAccount,
    isGoogleAuth,
    classConfig,
    schoolClasses,
    logout,
    login,
    loginUserWithEmailPassword,
    switchWorkingClass,
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login();
      onClose();
    } catch (err: any) {
      console.warn('Google login error:', err);
      setLoginError(
        err?.message ||
          'Không thể hoàn tất đăng nhập Google OAuth. Thầy cô vui lòng kiểm tra lại quyền truy cập hoặc đăng nhập bằng Tên đăng nhập & Mật khẩu bên dưới.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Vui lòng nhập đầy đủ Tên đăng nhập/Email và Mật khẩu');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      await loginUserWithEmailPassword(loginEmail.trim(), loginPassword.trim());
      onClose();
    } catch (err: any) {
      console.warn('Email login error:', err);
      setLoginError(
        err?.message ||
          'Tên đăng nhập hoặc mật khẩu không chính xác. Thầy cô vui lòng liên hệ Ban Giám Hiệu để được cấp lại mật khẩu.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const isUserAuthenticated = activeAccount !== null && userRole !== 'guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-5 animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
        
        {/* ========================================================= */}
        {/* BRANCH 1: KHI ĐÃ ĐĂNG NHẬP -> THẺ QUẢN LÝ TÀI KHOẢN       */}
        {/* ========================================================= */}
        {isUserAuthenticated ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tài Khoản & Phiên Làm Việc
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trường Cao đẳng Nghề 01 - BQP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Identity Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200/80 dark:border-slate-650 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {(activeAccount?.displayName || 'GV').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {activeAccount?.displayName || 'Thầy Sang'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        userRole === 'owner'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                          : userRole === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                      }`}
                    >
                      {userRole === 'owner'
                        ? '👑 Chủ hệ thống'
                        : userRole === 'admin'
                        ? '🛡 Ban Giám Hiệu'
                        : '👨‍🏫 Giáo viên Chủ nhiệm'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isGoogleAuth ? '● Google OAuth' : '● Tài khoản trường'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {activeAccount?.email || activeAccount?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Working Class Card */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <School className="h-3.5 w-3.5" />
                  Lớp đang làm việc
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {classConfig.schoolYear || '2025–2026'}
                </span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Lớp {classConfig.className}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  GVCN: {classConfig.homeroomTeacher || activeAccount?.displayName}
                </p>
              </div>
            </div>

            {/* Switch Class Tool for Owner / Admin */}
            {schoolClasses.length > 1 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ArrowRightLeft className="h-3 w-3 text-blue-500" />
                  <span>Chuyển sang lớp khác làm việc:</span>
                </label>
                <select
                  value={classConfig.className}
                  onChange={(e) => {
                    const targetClass = schoolClasses.find(
                      (c) =>
                        c.className.toLowerCase() === e.target.value.toLowerCase() ||
                        c.className.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    if (targetClass) {
                      switchWorkingClass(targetClass);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {schoolClasses.map((cls) => (
                    <option key={cls.id} value={cls.className}>
                      {cls.className} — GV: {cls.teacherName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Link to Admin Panel for Admin/Owner */}
            {(userRole === 'owner' || userRole === 'admin') && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateTab) {
                    onNavigateTab('admin');
                  } else {
                    window.dispatchEvent(new CustomEvent('navigate-to-admin'));
                  }
                }}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Quản lý trường học & Phân quyền</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            )}

            {/* Logout Action Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 uppercase tracking-wide"
              >
                <LogOut className="h-4 w-4" />
                <span>ĐĂNG XUẤT</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* BRANCH 2: KHI CHƯA ĐĂNG NHẬP -> BIỂU MẪU ĐĂNG NHẬP CHUẨN  */
          /* ========================================================= */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ĐĂNG NHẬP HỆ THỐNG
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dành cho Giáo viên & Ban Giám Hiệu
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Google OAuth Login Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.12 0-5.77-2.1-6.72-4.93H1.2v3.15C3.25 21.45 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.2C.44 8.1 0 9.99 0 12s.44 3.9 1.2 5.42l4.08-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.55 1.2 6.58l4.08 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Tiếp tục với Google</span>
              </button>
            </div>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="px-3 text-[11px] font-medium text-slate-400">
                hoặc đăng nhập bằng tài khoản
              </span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* Email / Username & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập hoặc Email:
                </label>
                <input
                  type="text"
                  placeholder="vd: sanginnova8@gmail.com hoặc hoa.le"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu được cấp..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl leading-relaxed">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>{loginLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400">
                  Tài khoản giáo viên do Ban Giám Hiệu tạo và phân công lớp trong mục Quản trị. Quên mật khẩu xin liên hệ BGH để được cấp lại.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
