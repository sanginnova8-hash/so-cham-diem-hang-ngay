import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  User,
  GraduationCap,
  School,
  Calendar,
  Phone,
  Mail,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  Users,
  Award,
  Sparkles,
  MapPin,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface EditClassTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'teacher' | 'class' | 'cadres' | 'scoring';
}

export const EditClassTeacherModal: React.FC<EditClassTeacherModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'teacher',
}) => {
  const { classConfig, updateClassConfig, students } = useApp();

  const [activeTab, setActiveTab] = useState<'teacher' | 'class' | 'cadres' | 'scoring'>(defaultTab);

  // Form states
  const [homeroomTeacher, setHomeroomTeacher] = useState(classConfig.homeroomTeacher || '');
  const [teacherPhone, setTeacherPhone] = useState(classConfig.teacherPhone || '');
  const [teacherEmail, setTeacherEmail] = useState(classConfig.teacherEmail || '');
  const [teachingSubject, setTeachingSubject] = useState(classConfig.teachingSubject || '');
  const [defaultTeacherNote, setDefaultTeacherNote] = useState(classConfig.defaultTeacherNote || '');

  const [className, setClassName] = useState(classConfig.className || '');
  const [schoolYear, setSchoolYear] = useState(classConfig.schoolYear || '');
  const [schoolName, setSchoolName] = useState(classConfig.schoolName || '');
  const [grade, setGrade] = useState(classConfig.grade || '');
  const [roomNumber, setRoomNumber] = useState(classConfig.roomNumber || '');

  const [classPresident, setClassPresident] = useState(classConfig.classPresident || '');
  const [academicVicePresident, setAcademicVicePresident] = useState(classConfig.academicVicePresident || '');
  const [disciplineVicePresident, setDisciplineVicePresident] = useState(classConfig.disciplineVicePresident || '');
  const [youthUnionSecretary, setYouthUnionSecretary] = useState(classConfig.youthUnionSecretary || '');

  const [baseScore, setBaseScore] = useState<number>(classConfig.baseScore ?? 10);
  const [minScore, setMinScore] = useState<number>(classConfig.minScore ?? 0);
  const [maxScore, setMaxScore] = useState<number>(classConfig.maxScore ?? 10);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync inputs whenever modal opens or classConfig updates
  useEffect(() => {
    if (isOpen) {
      setHomeroomTeacher(classConfig.homeroomTeacher || '');
      setTeacherPhone(classConfig.teacherPhone || '');
      setTeacherEmail(classConfig.teacherEmail || '');
      setTeachingSubject(classConfig.teachingSubject || '');
      setDefaultTeacherNote(classConfig.defaultTeacherNote || '');

      setClassName(classConfig.className || '');
      setSchoolYear(classConfig.schoolYear || '');
      setSchoolName(classConfig.schoolName || '');
      setGrade(classConfig.grade || '');
      setRoomNumber(classConfig.roomNumber || '');

      setClassPresident(classConfig.classPresident || '');
      setAcademicVicePresident(classConfig.academicVicePresident || '');
      setDisciplineVicePresident(classConfig.disciplineVicePresident || '');
      setYouthUnionSecretary(classConfig.youthUnionSecretary || '');

      setBaseScore(classConfig.baseScore ?? 10);
      setMinScore(classConfig.minScore ?? 0);
      setMaxScore(classConfig.maxScore ?? 10);

      setSaveSuccess(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, classConfig, defaultTab]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!className.trim()) {
      alert('Vui lòng nhập tên lớp học (ví dụ: 10A8).');
      return;
    }
    if (!homeroomTeacher.trim()) {
      alert('Vui lòng nhập họ tên Giáo viên chủ nhiệm.');
      return;
    }

    try {
      setIsSaving(true);
      await updateClassConfig({
        homeroomTeacher: homeroomTeacher.trim(),
        teacherPhone: teacherPhone.trim(),
        teacherEmail: teacherEmail.trim(),
        teachingSubject: teachingSubject.trim(),
        defaultTeacherNote: defaultTeacherNote.trim(),

        className: className.trim(),
        schoolYear: schoolYear.trim(),
        schoolName: schoolName.trim(),
        grade: grade.trim(),
        roomNumber: roomNumber.trim(),

        classPresident: classPresident.trim(),
        academicVicePresident: academicVicePresident.trim(),
        disciplineVicePresident: disciplineVicePresident.trim(),
        youthUnionSecretary: youthUnionSecretary.trim(),

        baseScore: Number(baseScore),
        minScore: Number(minScore),
        maxScore: Number(maxScore),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert('Lỗi lưu cấu hình: ' + (err?.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const activeStudentsCount = students.filter((s) => s.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Thay Đổi Thông Tin Giáo Viên & Lớp Học
              </h3>
              <p className="text-xs text-blue-100">
                Cập nhật hồ sơ GVCN, lớp phụ trách, ban cán sự và thang điểm thi đua
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-4 pt-2 gap-2 overflow-x-auto text-xs sm:text-sm font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition ${
              activeTab === 'teacher'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Thông Tin Giáo Viên</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('class')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition ${
              activeTab === 'class'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <School className="h-4 w-4" />
            <span>Thông Tin Lớp & Trường</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cadres')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition ${
              activeTab === 'cadres'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Ban Cán Sự Lớp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl border-b-2 transition ${
              activeTab === 'scoring'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Thang Điểm Thi Đua</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* TAB 1: TEACHER INFO */}
          {activeTab === 'teacher' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Thông tin Giáo viên chủ nhiệm sẽ xuất hiện trang trọng trong tất cả các báo cáo nề nếp, phiếu rèn luyện Zalo gửi phụ huynh và xuất file Excel.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên Giáo viên chủ nhiệm <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={homeroomTeacher}
                      onChange={(e) => setHomeroomTeacher(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Sang"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Môn giảng dạy chính
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                      placeholder="Ví dụ: Toán học, Ngữ văn, Tiếng Anh..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại liên hệ (GVCN)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={teacherPhone}
                      onChange={(e) => setTeacherPhone(e.target.value)}
                      placeholder="Ví dụ: 0912 345 678"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Hiển thị ở chân chữ ký tin nhắn gửi phụ huynh học sinh
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email liên hệ của GVCN
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="Ví dụ: giaovien@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lời dặn dò / Lời nhắn mặc định gửi Phụ huynh
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={defaultTeacherNote}
                    onChange={(e) => setDefaultTeacherNote(e.target.value)}
                    placeholder="Ví dụ: Kính mong Quý Phụ huynh tiếp tục đồng hành, nhắc nhở và phối hợp cùng GVCN để động viên các con rèn luyện nề nếp thật tốt!"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-normal focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Đoạn tin này sẽ tự động xuất hiện làm lời dặn dò mẫu trong phiếu Zalo và màn hình báo cáo cá nhân.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CLASS & SCHOOL INFO */}
          {activeTab === 'class' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên lớp học <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="Ví dụ: 10A8, 12 Tin, 9A..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Khối lớp
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ví dụ: Khối 10, Khối 11, Khối 12"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Năm học <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={schoolYear}
                      onChange={(e) => setSchoolYear(e.target.value)}
                      placeholder="Ví dụ: 2026–2027"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên trường / Đơn vị trường học
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Ví dụ: Trường THPT Chuyên, THPT Lê Quý Đôn"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phòng học / Vị trí lớp
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Ví dụ: Phòng 204 - Dãy nhà A"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sĩ số lớp hiện tại
                  </label>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200">
                    {activeStudentsCount} học sinh đang học (Tổng số: {students.length})
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    (Tự động đồng bộ từ danh sách Học sinh)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CADRES */}
          {activeTab === 'cadres' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Danh sách Ban cán sự lớp hỗ trợ GVCN theo dõi sổ chấm điểm, điểm danh và ghi nhận vi phạm / khen thưởng hàng ngày.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lớp trưởng
                  </label>
                  <input
                    type="text"
                    value={classPresident}
                    onChange={(e) => setClassPresident(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lớp phó học tập
                  </label>
                  <input
                    type="text"
                    value={academicVicePresident}
                    onChange={(e) => setAcademicVicePresident(e.target.value)}
                    placeholder="Ví dụ: Trần Thị Bích"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lớp phó phụ trách nề nếp / Kỷ luật
                  </label>
                  <input
                    type="text"
                    value={disciplineVicePresident}
                    onChange={(e) => setDisciplineVicePresident(e.target.value)}
                    placeholder="Ví dụ: Lê Hoàng Cường"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bí thư chi đoàn
                  </label>
                  <input
                    type="text"
                    value={youthUnionSecretary}
                    onChange={(e) => setYouthUnionSecretary(e.target.value)}
                    placeholder="Ví dụ: Phạm Thu Dung"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCORING & THRESHOLDS */}
          {activeTab === 'scoring' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm nền ban đầu
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={baseScore}
                    onChange={(e) => setBaseScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Chuẩn thi đua đầu tuần/tháng: 10,0đ
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm thấp nhất (Điểm sàn)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Mặc định giới hạn: 0,0đ
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm cao nhất (Điểm trần)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Mặc định giới hạn: 10,0đ
                  </span>
                </div>
              </div>

              {/* Standard Rank Rules Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Tiêu chuẩn xếp loại rèn luyện thi đua theo thang điểm [0..10]:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold">
                    <span className="block text-[11px]">Xuất sắc</span>
                    <span className="text-sm font-black">≥ 9.5đ</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <span className="block text-[11px]">Tốt</span>
                    <span className="text-sm font-black">≥ 8.5đ</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-semibold">
                    <span className="block text-[11px]">Khá</span>
                    <span className="text-sm font-black">≥ 7.0đ</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="block text-[11px]">Trung bình</span>
                    <span className="text-sm font-black">≥ 5.0đ</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-semibold">
                    <span className="block text-[11px]">Yếu</span>
                    <span className="text-sm font-black">&lt; 5.0đ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REALTIME PREVIEW CARD */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Xem trước hiển thị thực tế:
            </span>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded-lg text-xs">
                    Lớp {className || '---'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {schoolName || 'Trường THPT'}
                  </span>
                  {grade && <span className="text-slate-400">({grade})</span>}
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Năm học: <strong>{schoolYear || '2026–2027'}</strong>
                  {roomNumber && <span> • Phòng: <strong>{roomNumber}</strong></span>}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  GVCN: <strong className="text-blue-600 dark:text-blue-400">{homeroomTeacher || 'Chưa đặt tên'}</strong>
                  {teachingSubject && <span> (Môn {teachingSubject})</span>}
                  {teacherPhone && <span> • SĐT: {teacherPhone}</span>}
                </p>
              </div>

              {(classPresident || disciplineVicePresident) && (
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Ban cán sự:</p>
                  {classPresident && <p>• Lớp trưởng: {classPresident}</p>}
                  {disciplineVicePresident && <p>• Lớp phó nề nếp: {disciplineVicePresident}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs sm:text-sm animate-fadeIn">
                <CheckCircle2 className="h-5 w-5" />
                <span>Đã lưu thành công thông tin GV và Lớp!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 hidden sm:inline">
                * Dữ liệu sẽ lập tức được lưu vào máy và đồng bộ Cloud nếu đã đăng nhập.
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
