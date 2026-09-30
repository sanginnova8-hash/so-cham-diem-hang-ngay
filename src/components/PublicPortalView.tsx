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
                        Học viên Trường CĐ Nghề 01 - BQP • Năm học {classConfig.schoolYear || '2025–2026'}
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

      {/* Khu vực đăng nhập dành cho Cán bộ & Giáo viên */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-800/50">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Lock className="h-3.5 w-3.5" />
            <span>Khu Vực Dành Cho Cán Bộ Giảng Dạy & Quản Trị</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Không Gian Quản Lý Sổ Chấm Điểm & Nề Nếp
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl">
            Thầy/cô giáo viên chủ nhiệm và Ban Giám Hiệu vui lòng đăng nhập để vào sổ chấm điểm nề nếp hàng ngày, tổng hợp thi đua tuần/tháng và gửi thông báo cho phụ huynh.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenLoginModal}
          className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition flex items-center gap-2.5 cursor-pointer active:scale-95 shrink-0 tracking-wide uppercase"
        >
          <LogIn className="h-4 w-4" />
          <span>ĐĂNG NHẬP KHÔNG GIAN LÀM VIỆC</span>
        </button>
      </section>
    </div>
  );
};
