import React, { useState } from 'react';
import {
  LogIn,
  X,
  Lock,
  User,
  UserPlus,
  KeyRound,
  Mail,
  School,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Building2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    userRole,
    activeAccount,
    isGoogleAuth,
    logout,
    login,
    registerWithGoogle,
    registerQuickOneTouch,
    loginAsGuest,
    registerWithEmailPassword,
    loginUserWithEmailPassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClassName, setRegClassName] = useState('');
  const [regDepartment, setRegDepartment] = useState('Khoa Điện - Điện tử');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

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
          'Không thể hoàn tất đăng nhập Google OAuth. Thầy cô có thể đăng nhập bằng Tên đăng nhập & Mật khẩu bên dưới (sanginnova / Baotran2010).'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setRegLoading(true);
    setRegError(null);
    try {
      await registerWithGoogle(
        regClassName || 'Lớp Mới K46',
        regDepartment
      );
      setRegSuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.warn('Google register error:', err);
      setRegError(
        err?.message ||
          'Không thể hoàn tất đăng ký Google OAuth. Thầy cô vui lòng sử dụng biểu mẫu Đăng ký bằng Tên đăng nhập & Mật khẩu bên dưới.'
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickOneTouchRegister = async () => {
    setRegLoading(true);
    setRegError(null);
    try {
      await registerQuickOneTouch({
        displayName: regName || 'Thầy Trần Văn Sang',
        emailOrUsername: regEmail || 'sanginnova8@gmail.com',
        className: regClassName || 'Lớp Điện CN K46',
        department: regDepartment,
        phone: regPhone,
      });
      setRegSuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setRegError(err?.message || 'Khởi tạo 1 chạm thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập Tên đăng nhập / Email và Mật khẩu');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      await loginUserWithEmailPassword(loginEmail, loginPassword);
      onClose();
    } catch (err: any) {
      setLoginError(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regClassName) {
      setRegError('Vui lòng điền đủ: Họ tên, Tên đăng nhập/Email, Mật khẩu và Tên lớp chủ nhiệm');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu tối thiểu phải từ 6 ký tự trở lên');
      return;
    }
    setRegLoading(true);
    setRegError(null);
    try {
      await registerWithEmailPassword({
        name: regName,
        email: regEmail,
        pass: regPassword,
        className: regClassName,
        department: regDepartment,
        phone: regPhone,
      });
      setRegSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setRegError(err?.message || 'Đăng ký tài khoản không thành công. Tên đăng nhập hoặc Email có thể đã tồn tại.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-5 animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cổng Tài Khoản & Cơ Sở Dữ Liệu Lớp Học
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trường Cao đẳng Nghề 01 - Bộ Quốc Phòng
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

        {/* Active Account Status & Logout for Teachers */}
        {(activeAccount || userRole !== 'guest') && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-750 dark:to-slate-700 border border-blue-200 dark:border-slate-650 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeAccount?.displayName || 'Tài khoản đang đăng nhập'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {userRole === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                    </span>
                    {isGoogleAuth ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span>● Google OAuth Thật</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <span>● Tài khoản Nội bộ (Mật khẩu)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {activeAccount?.assignedClassName || 'Lớp chủ nhiệm'} • {activeAccount?.email || activeAccount?.username || 'Đang hoạt động'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200/60 dark:border-slate-600 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogOut className="h-4 w-4" />
                <span>ĐĂNG XUẤT KHỎI HỆ THỐNG</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher: Đăng Nhập vs Đăng Ký */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-700/60 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Tạo Tài Khoản & Lớp Mới</span>
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Login Option */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng nhập nhanh bằng Google</span>
            </button>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              * Trong môi trường Cloud Run / iframe xem trước, nếu pop-up Google bị chặn, thầy cô có thể đăng nhập bằng Tên đăng nhập & Mật khẩu bên dưới (hoặc dùng tài khoản Quản trị <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">sanginnova</span> / <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">Baotran2010</span>).
            </p>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
              <span className="shrink mx-2 text-[10px] uppercase font-bold text-slate-400">hoặc bằng Tên đăng nhập</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* Email / Username Login Form */}
            <form onSubmit={handleEmailLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập hoặc Email:
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu:
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{loginLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
              </button>
            </form>

            {/* Guest Access Option */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4 text-slate-500" />
                <span>Vào xem với vai trò Khách (Xem nề nếp & tra cứu học sinh)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER ACCOUNT & CREATE CLASS DATABASE */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Khởi tạo CSDL riêng biệt cho lớp chủ nhiệm của bạn</strong>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  Hệ thống tự động sinh mã lớp, lưu trữ dữ liệu trực tiếp trên Cloud Firestore và nạp sẵn 50+ tiêu chí rèn luyện chuẩn.
                </span>
              </div>
            </div>

            {regError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Khởi tạo tài khoản và CSDL lớp thành công! Đang chuyển hướng...</span>
              </div>
            )}

            {/* Quick 1-Touch Provisioning Options */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleQuickOneTouchRegister}
                disabled={regLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>⚡ Đăng ký nhanh 1 chạm (Khởi tạo CSDL lớp ngay)</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={regLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng ký với tài khoản Google</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
              <span className="shrink mx-2 text-[10px] uppercase font-bold text-slate-400">hoặc điền thông tin chi tiết</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* Username/Email Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên giáo viên: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="vd: Thầy Hoàng Văn Nam"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên đăng nhập hoặc Email: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="vd: hoangnam hoặc nam@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu (từ 6 ký tự): <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên lớp chủ nhiệm: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="vd: Điện Lạnh K46, Hàn K45..."
                      value={regClassName}
                      onChange={(e) => setRegClassName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Khoa / Bộ môn phụ trách:
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="vd: Khoa Điện, Khoa Cơ khí..."
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại giáo viên (tùy chọn):
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="vd: 0988.xxx.xxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <Sparkles className="h-4 w-4" />
                <span>{regLoading ? 'ĐANG KHỞI TẠO CSDL LỚP MỚI...' : 'TẠO TÀI KHOẢN & KHỞI TẠO CSDL LỚP'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
