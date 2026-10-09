import React from 'react';
import { Printer, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatVietnameseNumber } from '../lib/utils';

export interface ConductSheetRow {
  stt: number;
  studentId: string;
  studentCode: string;
  fullName: string;
  finalScore: number;
  violationsLines: string[];
  bonusesList: string[];
}

export interface ConductSheetTableProps {
  className: string;
  periodLabel: string; // e.g. "Tuần 5" hoặc "Tháng 10"
  rows: ConductSheetRow[];
  sortField?: 'stt' | 'name' | 'score';
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: 'stt' | 'name' | 'score') => void;
  onPrint?: () => void;
  onExportExcel?: () => void;
}

export const ConductSheetTable: React.FC<ConductSheetTableProps> = ({
  className,
  periodLabel,
  rows,
  sortField = 'stt',
  sortDirection = 'asc',
  onSortChange,
  onPrint,
  onExportExcel,
}) => {
  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
      {/* TOOLBAR FOR SCREEN VIEW */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-750 print:hidden">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
            Mẫu Sổ Rèn Luyện (Chuẩn truyền thống)
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị 3 cột trọng tâm: Điểm rèn luyện, Lỗi vi phạm và Cộng điểm chi tiết theo đúng mẫu sổ lớp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              title="Xuất file Excel đúng định dạng mẫu 5 cột này"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất Excel mẫu này</span>
            </button>
          )}

          {onPrint && (
            <button
              onClick={onPrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              title="In hoặc lưu PDF mẫu sổ rèn luyện A4 dọc"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In bảng rèn luyện (A4)</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE TITLE (PRINT & SCREEN) */}
      <div className="py-4 text-center">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          KẾT QUẢ RÈN LUYỆN LỚP {className}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
          {periodLabel}
        </p>
      </div>

      {/* TRADITIONAL CONDUCT TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-300 dark:border-slate-600">
          <thead>
            {/* ROW 1: TT, Họ và tên, Cột gộp Tuần/Tháng */}
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <th
                rowSpan={2}
                onClick={() => onSortChange && onSortChange('stt')}
                className="py-2.5 px-2 w-12 text-center font-bold border border-slate-300 dark:border-slate-600 select-none cursor-pointer hover:bg-slate-200/80 transition"
                title="Sắp xếp theo STT"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>TT</span>
                  {onSortChange && sortField === 'stt' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600 print:hidden" /> : <ArrowDown className="h-3 w-3 text-blue-600 print:hidden" />
                  )}
                </div>
              </th>

              <th
                rowSpan={2}
                onClick={() => onSortChange && onSortChange('name')}
                className="py-2.5 px-3 min-w-[170px] sm:min-w-[200px] text-center font-bold border border-slate-300 dark:border-slate-600 select-none cursor-pointer hover:bg-slate-200/80 transition"
                title="Sắp xếp theo Họ và tên A-Z"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Họ và tên</span>
                  {onSortChange && sortField === 'name' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600 print:hidden" /> : <ArrowDown className="h-3 w-3 text-blue-600 print:hidden" />
                  )}
                </div>
              </th>

              <th
                colSpan={3}
                className="py-2 px-3 text-center font-black text-sm uppercase bg-slate-200 dark:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 tracking-wide"
              >
                {periodLabel}
              </th>
            </tr>

            {/* ROW 2: Điểm rèn luyện, Lỗi vi phạm, Cộng điểm */}
            <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-slate-200 font-bold">
              <th
                onClick={() => onSortChange && onSortChange('score')}
                className="py-2 px-2 w-28 text-center font-bold border border-slate-300 dark:border-slate-600 select-none cursor-pointer hover:bg-slate-200/80 transition"
                title="Sắp xếp theo Điểm rèn luyện"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Điểm rèn luyện</span>
                  {onSortChange && sortField === 'score' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600 print:hidden" /> : <ArrowDown className="h-3 w-3 text-blue-600 print:hidden" />
                  )}
                </div>
              </th>

              <th className="py-2 px-3 min-w-[240px] text-center font-bold border border-slate-300 dark:border-slate-600">
                Lỗi vi phạm
              </th>

              <th className="py-2 px-3 min-w-[240px] text-center font-bold border border-slate-300 dark:border-slate-600">
                Cộng điểm
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300 dark:divide-slate-700 bg-white dark:bg-slate-850">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 font-medium border border-slate-300">
                  Không có dữ liệu học sinh trong kỳ này.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const hasViolations = r.violationsLines.length > 0;
                const hasBonuses = r.bonusesList.length > 0;

                return (
                  <tr
                    key={r.studentId}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* 1. TT */}
                    <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400 font-medium border border-slate-300 dark:border-slate-600 align-top">
                      {idx + 1}
                    </td>

                    {/* 2. Họ và tên */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 align-top whitespace-nowrap">
                      {r.fullName}
                    </td>

                    {/* 3. Điểm rèn luyện (In màu đỏ đậm nổi bật như ảnh mẫu) */}
                    <td className="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-600 align-top">
                      <span className="font-black text-sm sm:text-base text-red-600 dark:text-red-400 tabular-nums">
                        {formatVietnameseNumber(r.finalScore)}
                      </span>
                    </td>

                    {/* 4. Lỗi vi phạm (Xuống dòng từng lỗi kèm số lần) */}
                    <td className="py-2.5 px-3 border border-slate-300 dark:border-slate-600 align-top text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      {hasViolations ? (
                        <div className="space-y-1">
                          {r.violationsLines.map((vLine, vIdx) => (
                            <div key={vIdx} className="leading-snug">
                              {vLine}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 select-none"></span>
                      )}
                    </td>

                    {/* 5. Cộng điểm (Cách nhau dấu phẩy hoặc xuống dòng) */}
                    <td className="py-2.5 px-3 border border-slate-300 dark:border-slate-600 align-top text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      {hasBonuses ? (
                        <div className="leading-snug">
                          {r.bonusesList.join(', ')}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 select-none"></span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
