import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Settings2,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { ConductSheetRow } from './ConductSheetTable';
import {
  exportConductSheetToExcel,
  exportConductSheetToWord,
  copyConductSheetToClipboard,
  ConductReportExportOptions,
} from '../lib/conductReportExport';
import { formatVietnameseNumber } from '../lib/utils';

export interface ConductSheetPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  schoolYear: string;
  periodLabel: string; // e.g. "Tuần 5" hoặc "Tháng 10"
  homeroomTeacher?: string;
  rows: ConductSheetRow[];
  stats?: {
    totalStudents: number;
    avgScore: number;
    excellentCount?: number;
    goodCount?: number;
    fairCount?: number;
    mediumCount?: number;
    weakCount?: number;
    totalViolations?: number;
    totalBonuses?: number;
  };
}

export const ConductSheetPrintModal: React.FC<ConductSheetPrintModalProps> = ({
  isOpen,
  onClose,
  className,
  schoolYear,
  periodLabel,
  homeroomTeacher = 'Nguyễn Văn Sang',
  rows,
  stats,
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showAdministrativeHeader, setShowAdministrativeHeader] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [approverName, setApproverName] = useState<string>('Phạm Thị Thu Trang');
  const [teacherName, setTeacherName] = useState<string>(homeroomTeacher);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const now = new Date();
  const locationDate = `Thái Nguyên, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;

  const exportOptions: ConductReportExportOptions = {
    className,
    schoolYear,
    periodLabel,
    homeroomTeacher: teacherName,
    approverName,
    locationDate,
    rows,
    stats,
  };

  const handlePrint = () => {
    // Add print style dynamically for orientation
    const styleId = 'conduct-sheet-print-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      @media print {
        @page {
          size: A4 ${orientation};
          margin: 10mm 10mm 12mm 10mm;
        }
        body * {
          visibility: hidden !important;
        }
        #conduct-sheet-printable-area, #conduct-sheet-printable-area * {
          visibility: visible !important;
        }
        #conduct-sheet-printable-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          color: black !important;
        }
      }
    `;

    window.print();
  };

  const handleCopy = async () => {
    const success = await copyConductSheetToClipboard(exportOptions);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fontClass =
    fontSize === 'sm' ? 'text-[10px]' : fontSize === 'lg' ? 'text-[12px]' : 'text-[11px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* HEADER CONTROLS (SCREEN ONLY) */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>In & Xuất Báo Cáo Rèn Luyện (A4)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Chuẩn Sư phạm
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Lớp {className} • {periodLabel} • Năm học {schoolYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportConductSheetToExcel(exportOptions)}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              title="Xuất file Excel (.xlsx) chuẩn 2 tầng tiêu đề và chữ ký"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportConductSheetToWord(exportOptions)}
              className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              title="Xuất file Word (.doc) mở bằng Microsoft Word"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Xuất Word (.doc)</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              title="Sao chép bảng vào Clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In A4 (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR OPTIONS (SCREEN ONLY) */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 text-xs print:hidden">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Khổ giấy:</span>
              <div className="inline-flex rounded-md shadow-2xs">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-l-md font-semibold text-xs border ${
                    orientation === 'portrait'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  A4 Dọc
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-r-md font-semibold text-xs border-y border-r ${
                    orientation === 'landscape'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  A4 Ngang
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Cỡ chữ:</span>
              <select
                aria-label="Chọn cỡ chữ in"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="sm">Nhỏ gọn (10pt)</option>
                <option value="base">Chuẩn (11pt)</option>
                <option value="lg">Lớn (12pt)</option>
              </select>
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showAdministrativeHeader}
                onChange={(e) => setShowAdministrativeHeader(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Quốc hiệu & Trường</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Thống kê</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Chữ ký 3 bên</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            * Mẹo: Nhấn nút &quot;In A4&quot; để xuất file PDF hoặc in giấy sắc nét không bị nhòe.
          </div>
        </div>

        {/* WYSIWYG A4 PAPER PREVIEW (PRINT CANVAS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 dark:bg-slate-950 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div
            id="conduct-sheet-printable-area"
            ref={printAreaRef}
            className={`bg-white text-black shadow-lg border border-slate-300 print:border-none print:shadow-none p-8 sm:p-10 font-serif transition-all ${
              orientation === 'landscape' ? 'w-full max-w-[1100px]' : 'w-full max-w-[850px]'
            }`}
            style={{ minHeight: '1120px' }}
          >
            {/* 1. ADMINISTRATIVE HEADER */}
            {showAdministrativeHeader && (
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black/20 text-center text-xs">
                <div>
                  <p className="uppercase text-[11px] tracking-wide text-black">BỘ QUỐC PHÒNG</p>
                  <p className="font-bold uppercase text-[11.5px] text-black">
                    TRƯỜNG CAO ĐẲNG NGHỀ SỐ 1 - BQP
                  </p>
                  <p className="font-bold uppercase text-[11px] text-blue-900">KHOA CƠ BẢN</p>
                  <div className="w-24 h-0.5 bg-black mx-auto mt-1" />
                </div>
                <div>
                  <p className="font-bold uppercase text-[11.5px] text-black">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="font-bold text-[11px] text-black">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="w-32 h-0.5 bg-black mx-auto mt-1" />
                </div>
              </div>
            )}

            {/* 2. REPORT TITLE */}
            <div className="py-5 text-center">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
                BẢNG TỔNG HỢP KẾT QUẢ RÈN LUYỆN
              </h1>
              <p className="font-bold text-xs sm:text-sm uppercase text-black mt-1">
                LỚP: {className} • {periodLabel.toUpperCase()}
              </p>
              <p className="text-xs italic text-black/80 mt-1">
                Năm học: {schoolYear} • Giáo viên chủ nhiệm: {teacherName} • Sĩ số: {rows.length} học sinh
              </p>
            </div>

            {/* 3. TRADITIONAL CONDUCT TABLE */}
            <table className={`w-full border-collapse border border-black ${fontClass} leading-tight`}>
              <thead>
                <tr className="bg-slate-100 text-black">
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 text-center font-bold w-10"
                  >
                    TT
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 text-center font-bold min-w-[160px]"
                  >
                    Họ và tên
                  </th>
                  <th
                    colSpan={3}
                    className="border border-black p-1.5 text-center font-bold uppercase tracking-wider bg-slate-200"
                  >
                    {periodLabel}
                  </th>
                </tr>
                <tr className="bg-slate-50 text-black">
                  <th className="border border-black p-1.5 text-center font-bold w-20">
                    Điểm rèn luyện
                  </th>
                  <th className="border border-black p-1.5 text-center font-bold min-w-[200px]">
                    Lỗi vi phạm
                  </th>
                  <th className="border border-black p-1.5 text-center font-bold min-w-[180px]">
                    Cộng điểm
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-black p-6 text-center text-slate-500 italic">
                      Không có dữ liệu học sinh trong kỳ này.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.studentId} className="page-break-avoid">
                      <td className="border border-black p-1.5 text-center font-medium align-top">
                        {idx + 1}
                      </td>
                      <td className="border border-black p-1.5 font-bold align-top whitespace-nowrap">
                        {r.fullName}
                      </td>
                      <td className="border border-black p-1.5 text-center font-black align-top text-red-700">
                        {formatVietnameseNumber(r.finalScore)}
                      </td>
                      <td className="border border-black p-1.5 align-top leading-snug">
                        {r.violationsLines.length > 0 ? (
                          <div className="space-y-0.5">
                            {r.violationsLines.map((v, vIdx) => (
                              <div key={vIdx}>{v}</div>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="border border-black p-1.5 align-top leading-snug">
                        {r.bonusesList.length > 0 ? (
                          <div>{r.bonusesList.join(', ')}</div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 4. STATISTICAL SUMMARY */}
            {showStats && stats && (
              <div className="mt-3 text-[11px] italic text-black border-b border-black/20 pb-2">
                * <strong>Thống kê tổng hợp:</strong> Sĩ số: <strong>{stats.totalStudents}</strong> HS |
                Điểm trung bình: <strong>{formatVietnameseNumber(stats.avgScore)}</strong>
                {stats.goodCount !== undefined && ` | Tốt: ${stats.goodCount}`}
                {stats.fairCount !== undefined && ` | Khá: ${stats.fairCount}`}
                {stats.mediumCount !== undefined && ` | Đạt: ${stats.mediumCount}`}
                {stats.weakCount !== undefined && ` | Yếu: ${stats.weakCount}`}
              </div>
            )}

            {/* 5. PEDAGOGICAL SIGNATURE BLOCK */}
            {showSignatures && (
              <div className="mt-8 text-xs break-inside-avoid">
                <div className="text-right italic mb-2 text-[11px] text-black">
                  {locationDate}
                </div>
                <div className="grid grid-cols-3 text-center gap-2">
                  <div>
                    <p className="font-bold uppercase text-[11px]">LỚP TRƯỞNG</p>
                    <p className="text-[10px] italic text-black/70 mt-0.5">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                  </div>
                  <div>
                    <p className="font-bold uppercase text-[11px]">GIÁO VIÊN CHỦ NHIỆM</p>
                    <p className="text-[10px] italic text-black/70 mt-0.5">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16" />
                    <p className="font-bold text-[11px]">{teacherName}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-[11px]">TRƯỞNG KHOA / TTCM</p>
                    <p className="text-[10px] italic text-black/70 mt-0.5">(Ký và phê duyệt)</p>
                    <div className="h-16" />
                    <p className="font-bold text-[11px]">{approverName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
