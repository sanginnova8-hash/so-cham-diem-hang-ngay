import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  LogIn,
  UserCheck,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Users,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  FileText,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { formatVietnameseDate, formatVietnameseNumber, getRankBadgeClass } from '../lib/utils';

interface PublicPortalViewProps {
  onOpenLoginModal: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({ onOpenLoginModal }) => {
  const {
    students,
    classConfig,
    getWeeklySummary,
    getMonthlySummary,
    getStudentLogs,
    loginAsRole,
    userAccounts,
  } = useApp();

  // Search state for student/parent
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCopied, setSearchCopied] = useState(false);

  // Default to Week 1 or Week 2
  const currentWeek = 1;
  const currentMonth = 9;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResult(null);
      setHasSearched(false);
      return;
    }

    const found = students.find(
      (s) =>
        s.studentCode.toLowerCase() === query ||
        s.fullName.toLowerCase().includes(query) ||
        (s.parentPhone && s.parentPhone.includes(query))
    );

    setSearchResult(found || null);
    setHasSearched(true);
  };

  // Student summary for result
  const studentWeeklySummaries = getWeeklySummary(currentWeek, currentMonth);
  const studentWeekly = searchResult
    ? studentWeeklySummaries.find((w) => w.studentId === searchResult.id)
    : null;

  const studentLogs = searchResult ? getStudentLogs(searchResult.id) : [];
  const weekLogs = studentLogs.filter((l) => l.weekNumber === currentWeek);
  const deductLogs = weekLogs.filter((l) => l.type === 'deduct');
  const bonusLogs = weekLogs.filter((l) => l.type === 'bonus');

  const handleCopyPersonalReport = () => {
    if (!searchResult || !studentWeekly) return;
    const text = `PHIẾU KẾT QUẢ RÈN LUYỆN CÁ NHÂN
Học sinh: ${searchResult.fullName} (Mã: ${searchResult.studentCode})
Lớp: ${classConfig.className} - Trường: ${classConfig.schoolName || 'CĐ Nghề 01 - BQP'}
Thời gian: Tuần ${currentWeek} (Tháng ${currentMonth})
--------------------------------------------
• Điểm rèn luyện đạt được: ${formatVietnameseNumber(studentWeekly.finalScore)} / 10.0 điểm
• Xếp loại thi đua: ${studentWeekly.rank}
• Lỗi vi phạm trong tuần: ${deductLogs.length === 0 ? 'Không có vi phạm nào (Tác phong chuẩn mực 100%)' : deductLogs.map((l) => `${l.behaviorDescription} (-${l.totalScore}đ)`).join(', ')}
• Điểm cộng biểu dương: ${bonusLogs.length === 0 ? 'Chưa có ghi nhận' : bonusLogs.map((l) => `${l.behaviorDescription} (+${l.totalScore}đ)`).join(', ')}
• Lời dặn dò GVCN: ${studentWeekly.finalScore >= 9.0 ? 'Em rèn luyện rất tốt, gương mẫu trong học tập và kỷ luật!' : 'Gia đình cùng nhắc nhở em duy trì tốt nề nếp giờ giấc.'}
GVCN: ${classConfig.homeroomTeacher} - SĐT: ${classConfig.teacherPhone || 'Chưa cập nhật'}`;

    navigator.clipboard.writeText(text);
    setSearchCopied(true);
    setTimeout(() => setSearchCopied(false), 3000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>Trường Cao đẳng Nghề 01 - Bộ Quốc Phòng</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            HỆ THỐNG SỔ CHẤM ĐIỂM HÀNG NGÀY & QUẢN LÝ RÈN LUYỆN HSSV
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Giải pháp công nghệ số hóa toàn diện công tác chấm điểm thi đua, rèn luyện nề nếp học viên,
            tác phong kỷ luật quân sự và an toàn thực hành nghề. Minh bạch, tự động hóa và bảo mật dữ liệu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>ĐĂNG NHẬP KHÔNG GIAN LÀM VIỆC</span>
            </button>

            <a
              href="#tra-cuu"
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Search className="h-4 w-4 text-emerald-400" />
              <span>Tra cứu điểm học sinh</span>
            </a>
          </div>

          {/* Quick Stats Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">10.0</div>
              <div className="text-slate-400 mt-0.5">Điểm xuất phát tuần</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">100%</div>
              <div className="text-slate-400 mt-0.5">Minh bạch tiêu chí lỗi/thưởng</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">3 Cấp</div>
              <div className="text-slate-400 mt-0.5">Phân quyền bảo mật (RBAC)</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">1 Chạm</div>
              <div className="text-slate-400 mt-0.5">Soạn báo cáo Zalo tự động</div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT / PARENT SECURE SEARCH PORTAL */}
      <section id="tra-cuu" className="scroll-mt-24 space-y-4">
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Cổng Tra Cứu Rèn Luyện Dành Cho Phụ Huynh & Học Sinh
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bảo mật riêng tư 100%: Chỉ hiển thị kết quả cá nhân của học sinh tra cứu, không công khai danh sách người khác.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>Chế độ Khách vãng lai (Chỉ xem)</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Nhập Mã học sinh (vd: 250101, 250102...) hoặc họ tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              Tra Cứu Điểm
            </button>
          </form>

          {/* Sample quick test tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Mã gợi ý tra cứu thử:</span>
            {['250101', '250102', '250105', '250108'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSearchQuery(code);
                  const found = students.find((s) => s.studentCode === code);
                  setSearchResult(found || null);
                  setHasSearched(true);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-mono rounded-md transition"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Search Result Card */}
          {hasSearched && (
            <div className="max-w-2xl mx-auto pt-4">
              {searchResult && studentWeekly ? (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {searchResult.fullName}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-semibold">
                          Mã: {searchResult.studentCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Lớp: {classConfig.className} • Năm học {classConfig.schoolYear} • GVCN: {classConfig.homeroomTeacher}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        {formatVietnameseNumber(studentWeekly.finalScore)}
                        <span className="text-xs text-slate-400 font-sans font-normal"> / 10đ</span>
                      </div>
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${getRankBadgeClass(studentWeekly.rank)}`}>
                        {studentWeekly.rank}
                      </span>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Vi phạm trong tuần:</span>
                      <div className="font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        {deductLogs.length === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Không có vi phạm
                          </span>
                        ) : (
                          `${deductLogs.length} lỗi (-${formatVietnameseNumber(studentWeekly.totalDeduct)}đ)`
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Khen thưởng / Điểm cộng:</span>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {bonusLogs.length === 0 ? (
                          <span className="text-slate-400">Chưa có ghi nhận</span>
                        ) : (
                          `${bonusLogs.length} lần (+${formatVietnameseNumber(studentWeekly.totalBonus)}đ)`
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Log list if any */}
                  {deductLogs.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Chi tiết vi phạm:</span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-2">
                        {deductLogs.map((l) => (
                          <li key={l.id} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>
                              {formatVietnameseDate(l.date)}: {l.behaviorDescription} (-{formatVietnameseNumber(l.totalScore)}đ)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-400">
                      Cập nhật: Tuần {currentWeek} (Tháng {currentMonth})
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPersonalReport}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1.5 transition"
                    >
                      {searchCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{searchCopied ? 'Đã sao chép!' : 'Sao chép phiếu điểm'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">Không tìm thấy thông tin học sinh!</p>
                  <p className="mt-1">
                    Vui lòng kiểm tra lại Mã học sinh hoặc liên hệ trực tiếp với Giáo viên chủ nhiệm để được hỗ trợ.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECURE ACCESS CONTROL INTRODUCTION */}
      <section className="bg-slate-100 dark:bg-slate-850 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Hệ Thống Phân Quyền Bảo Mật Chuẩn Quân Sự (RBAC)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Không Gian Làm Việc Xác Thực Định Danh Độc Lập
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống áp dụng chính sách bảo mật đa cấp, mã hóa định danh và bảo đảm dữ liệu của từng lớp được lưu trữ độc lập trên CSDL Cloud Firestore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Level 3: Admin */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Cấp độ 3: Ban Quản Trị Hệ Thống
                </span>
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ban Giám Hiệu & Quản Trị Viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Giám sát thi đua nề nếp toàn trường, chế độ thanh tra chuyên môn từng lớp, quản trị danh sách giáo viên và khóa sổ thi đua định kỳ.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-purple-500" />
              <span>Yêu cầu đăng nhập xác thực tài khoản</span>
            </div>
          </div>

          {/* Level 2: Teacher */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Cấp độ 2: Giáo Viên Chủ Nhiệm
                </span>
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Không Gian Lớp Chủ Nhiệm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Mỗi giáo viên sở hữu CSDL độc lập của lớp mình: chấm điểm hằng ngày, quản lý học sinh, tổng kết tuần/tháng, soạn tin Zalo tự động.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-500" />
              <span>Dữ liệu cô lập • Không thể truy cập chéo</span>
            </div>
          </div>

          {/* Level 1: Public */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Cấp độ 1: Phụ Huynh & Học Sinh
                </span>
                <Globe className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cổng Tra Cứu Riêng Tư
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tra cứu kết quả rèn luyện từng cá nhân thông qua Mã học sinh. Không công khai danh sách lớp, bảo mật thông tin gia đình học viên.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Truy cập công khai an toàn</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>Đăng Nhập Cổng Giáo Viên & Quản Trị</span>
          </button>
        </div>
      </section>

      {/* RBAC MATRIX EXPLANATION */}
      <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <span>Bảng Đối Chiếu Ma Trận Phân Quyền 3 Cấp Độ (RBAC Matrix)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3">Nghiệp vụ / Chức năng</th>
                <th className="py-2.5 px-3 text-center">Khách / Phụ huynh (Cấp 1)</th>
                <th className="py-2.5 px-3 text-center">Giáo viên chủ nhiệm (Cấp 2)</th>
                <th className="py-2.5 px-3 text-center">Quản trị viên / BGH (Cấp 3)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Xem trang chủ & quy chế nề nếp</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Được xem</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Được xem</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Được xem</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Tra cứu điểm cá nhân (nhập Mã HS)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Chỉ 01 HS đó</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Toàn lớp</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Toàn trường</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Chấm điểm & Ghi nhận vi phạm/thưởng hàng ngày</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Bị ẩn</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Lớp chủ nhiệm</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Toàn trường</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Thêm, sửa, xóa học sinh & thông tin lớp</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Bị ẩn</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Lớp của mình</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Mọi lớp</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Xem dữ liệu của giáo viên / lớp khác</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Bị cấm</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Bảo mật độc lập</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Chế độ thanh tra</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Khóa sổ thi đua tuần/tháng (chống sửa điểm)</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Không có quyền</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Tuân thủ khóa</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Quyền Admin</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Quản lý tài khoản giáo viên & Cấp lại mật khẩu</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Không có quyền</td>
                <td className="py-2 px-3 text-center text-rose-500 font-bold">❌ Không có quyền</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✅ Quyền Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
