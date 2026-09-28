import React from 'react';
import {
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
  CalendarCheck,
  CalendarRange,
  Users,
  Tag,
  MessageSquareShare,
  Settings,
  PlusCircle,
  Cloud,
  HardDrive,
  LogIn,
  LogOut,
  RefreshCw,
  Award,
  Edit2,
  UserCog,
  MessageSquareText,
  ShieldCheck,
  User,
  UserCheck,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType =
  | 'portal'
  | 'dashboard'
  | 'daily-log'
  | 'weekly'
  | 'monthly'
  | 'semester'
  | 'students'
  | 'categories'
  | 'parent-report'
  | 'zalo-composer'
  | 'settings'
  | 'admin';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewLogModal: () => void;
  onOpenEditClassTeacherModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLogModal,
  onOpenEditClassTeacherModal,
  onOpenLoginModal,
}) => {
  const {
    currentUser,
    isLocalMode,
    isCloudSyncing,
    classConfig,
    login,
    logout,
    syncLocalToCloud,
    userRole,
    activeAccount,
    inspectorModeClass,
  } = useApp();

  const baseNavItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: CalendarDays },
    { id: 'daily-log', label: 'Nhật ký hằng ngày', icon: FileSpreadsheet },
    { id: 'weekly', label: 'Tổng kết tuần', icon: CalendarCheck },
    { id: 'monthly', label: 'Tổng kết tháng', icon: CalendarRange },
    { id: 'semester', label: 'Học kỳ', icon: Award },
    { id: 'students', label: 'Hồ sơ học sinh', icon: Users },
    { id: 'categories', label: 'Danh mục lỗi & Thưởng', icon: Tag },
    { id: 'parent-report', label: 'Báo cáo phụ huynh', icon: MessageSquareShare },
    { id: 'zalo-composer', label: 'Soạn tin Zalo', icon: MessageSquareText },
    { id: 'settings', label: 'Cài đặt & sao lưu', icon: Settings },
  ];

  // If role is guest, show public portal tab only. If admin, show admin tab. If teacher, show teacher tabs.
  const navItems = userRole === 'guest'
    ? [{ id: 'portal' as TabType, label: 'Trang chủ & Tra cứu rèn luyện HSSV', icon: Search }]
    : userRole === 'admin'
    ? [...baseNavItems, { id: 'admin' as TabType, label: 'Quản trị hệ thống', icon: ShieldCheck }]
    : baseNavItems;

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 print:hidden">
      {/* Top Bar: Title, Class info & Account */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                SỔ CHẤM ĐIỂM HÀNG NGÀY
              </h1>
              <button
                type="button"
                onClick={onOpenEditClassTeacherModal}
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1 transition"
                title="Bấm để thay đổi thông tin giáo viên và lớp học"
              >
                <span>Lớp {classConfig.className}</span>
                <Edit2 className="h-2.5 w-2.5 opacity-70" />
              </button>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>Năm học {classConfig.schoolYear}</span>
              {classConfig.schoolName && <span>• {classConfig.schoolName}</span>}
              <span>• GVCN: <span className="text-slate-200 font-medium">{classConfig.homeroomTeacher}</span></span>
              {classConfig.teacherPhone && <span className="text-slate-400 hidden lg:inline">({classConfig.teacherPhone})</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons & Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Edit Class & Teacher Info Button */}
          {onOpenEditClassTeacherModal && (
            <button
              onClick={onOpenEditClassTeacherModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-medium rounded-lg border border-slate-700 shadow-sm transition-all active:scale-95"
              title="Thay đổi thông tin giáo viên chủ nhiệm và thông tin lớp học"
            >
              <UserCog className="h-4 w-4 text-blue-400" />
              <span className="hidden md:inline">Đổi thông tin GV & Lớp</span>
              <span className="md:hidden">Đổi GV/Lớp</span>
            </button>
          )}

          {/* Quick Action Button (disabled if in guest or inspector mode) */}
          {userRole !== 'guest' && !inspectorModeClass && (
            <button
              onClick={onOpenNewLogModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Ghi nhận vi phạm hoặc điểm cộng mới"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Thêm ghi nhận</span>
            </button>
          )}

          {/* Account Profile Button */}
          {onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                activeAccount
                  ? 'bg-blue-900/50 border-blue-500/40 text-blue-200 hover:bg-blue-800/70'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
              title="Tài khoản cá nhân"
            >
              <div className="flex items-center gap-1.5">
                {activeAccount ? (
                  <UserCheck className="h-4 w-4 text-blue-400" />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
                <div className="flex flex-col text-left">
                  <span className="leading-tight text-[11px] font-bold truncate max-w-[130px]">
                    {activeAccount?.displayName || 'Tài khoản'}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">
                    {activeAccount ? (activeAccount.assignedClassName || 'Giáo viên') : 'Chưa đăng nhập'}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-1" />
            </button>
          )}

          {/* Direct Logout Button for Teacher / Admin */}
          {(activeAccount || userRole !== 'guest' || currentUser) && (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          )}

          {/* Persistent CSDL Cloud Status */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-xs shadow-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <Cloud className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSDL Cloud Online</span>
            </span>
            <button
              onClick={syncLocalToCloud}
              disabled={isCloudSyncing}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition cursor-pointer"
              title="Kiểm tra & Đồng bộ CSDL Cloud Firestore"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCloudSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            {(currentUser || activeAccount) && (
              <>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-300 max-w-[110px] truncate hidden sm:inline text-[11px]" title={activeAccount?.displayName || currentUser?.displayName || activeAccount?.email || currentUser?.email || ''}>
                  {activeAccount?.displayName || currentUser?.displayName || activeAccount?.email || currentUser?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
