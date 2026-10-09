import * as XLSX from 'xlsx';
import { ConductSheetRow } from '../components/ConductSheetTable';
import { formatVietnameseNumber } from './utils';

export interface ConductReportExportOptions {
  className: string;
  schoolYear: string;
  periodLabel: string; // e.g. "Tuần 5" hoặc "Tháng 10"
  homeroomTeacher?: string;
  departmentName?: string; // e.g. "Khoa Cơ bản"
  schoolName?: string; // e.g. "Trường Cao đẳng Nghề số 1 - BQP"
  approverName?: string; // e.g. "Phạm Thị Thu Trang"
  locationDate?: string; // e.g. "Thái Nguyên, ngày 10 tháng 10 năm 2026"
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

/**
 * Xuất file Excel (.xlsx) chuẩn Sư phạm:
 * - Có Header Quốc hiệu, Cơ quan chủ quản (Bộ Quốc Phòng / Trường CĐN01 / Khoa Cơ bản)
 * - Có Tiêu đề trung tâm in hoa, gộp ô
 * - Bảng 2 tầng chuẩn (TT, Họ tên, Nhóm kỳ [Điểm rèn luyện, Lỗi vi phạm, Cộng điểm])
 * - Độ rộng cột tối ưu, ô lỗi vi phạm tự động ngắt dòng
 * - Dòng thống kê tổng hợp (Sĩ số, Điểm TB, Xếp loại)
 * - Khung chữ ký 3 bên (Lớp trưởng, GVCN, Trưởng khoa / TTCM)
 */
export function exportConductSheetToExcel(options: ConductReportExportOptions) {
  const {
    className,
    schoolYear,
    periodLabel,
    homeroomTeacher = 'Nguyễn Văn Sang',
    departmentName = 'KHOA CƠ BẢN',
    schoolName = 'TRƯỜNG CAO ĐẲNG NGHỀ SỐ 1 - BQP',
    approverName = 'Phạm Thị Thu Trang',
    locationDate,
    rows,
    stats,
  } = options;

  const todayStr = locationDate || `Thái Nguyên, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

  // Build 2D matrix of cells
  const aoa: (string | number)[][] = [];

  // Row 0-2: Administrative headers
  aoa.push(['BỘ QUỐC PHÒNG', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', '']);
  aoa.push([schoolName, '', '', 'Độc lập - Tự do - Hạnh phúc', '']);
  aoa.push([departmentName, '', '', '------------------------', '']);
  aoa.push(['', '', '', '', '']); // Row 3 empty

  // Row 4: Title
  aoa.push([`BẢNG TỔNG HỢP KẾT QUẢ RÈN LUYỆN HỌC SINH`, '', '', '', '']);
  // Row 5: Subtitle
  aoa.push([`Lớp: ${className} • ${periodLabel.toUpperCase()} • Năm học: ${schoolYear} • GVCN: ${homeroomTeacher}`, '', '', '', '']);
  aoa.push(['', '', '', '', '']); // Row 6 empty

  // Table Headers (Row 7 & 8)
  const headerRow1Idx = 7;
  const headerRow2Idx = 8;
  aoa.push(['TT', 'Họ và tên', `KẾT QUẢ ĐÁNH GIÁ (${periodLabel.toUpperCase()})`, '', '']);
  aoa.push(['', '', 'Điểm rèn luyện', 'Lỗi vi phạm', 'Cộng điểm']);

  // Data rows (Row 9 onwards)
  rows.forEach((r, idx) => {
    aoa.push([
      idx + 1,
      r.fullName,
      r.finalScore,
      r.violationsLines.length > 0 ? r.violationsLines.join('\n') : '',
      r.bonusesList.length > 0 ? r.bonusesList.join(', ') : '',
    ]);
  });

  const dataEndRowIdx = aoa.length - 1;

  // Statistics Summary Row
  if (stats) {
    aoa.push(['', '', '', '', '']); // empty separator
    const summaryText = `Tổng số học sinh: ${stats.totalStudents} | Điểm trung bình: ${formatVietnameseNumber(stats.avgScore)}` +
      (stats.goodCount !== undefined ? ` | Tốt: ${stats.goodCount}` : '') +
      (stats.fairCount !== undefined ? ` | Khá: ${stats.fairCount}` : '') +
      (stats.mediumCount !== undefined ? ` | Đạt: ${stats.mediumCount}` : '') +
      (stats.weakCount !== undefined ? ` | Yếu: ${stats.weakCount}` : '');
    aoa.push(['THỐNG KÊ', summaryText, '', '', '']);
  }

  // Signature section
  aoa.push(['', '', '', '', '']); // empty
  aoa.push(['', '', '', todayStr, '']);
  aoa.push(['LỚP TRƯỞNG', '', 'GIÁO VIÊN CHỦ NHIỆM', 'TRƯỞNG KHOA / TTCM', '']);
  aoa.push(['(Ký và ghi rõ họ tên)', '', '(Ký và ghi rõ họ tên)', '(Ký và phê duyệt)', '']);
  aoa.push(['', '', '', '', '']);
  aoa.push(['', '', '', '', '']);
  aoa.push(['', '', '', '', '']);
  aoa.push(['', '', homeroomTeacher, approverName, '']);

  // Convert AOA to worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },   // TT
    { wch: 26 },  // Họ và tên
    { wch: 16 },  // Điểm rèn luyện
    { wch: 46 },  // Lỗi vi phạm
    { wch: 38 },  // Cộng điểm
  ];

  // Set cell merges
  const merges: XLSX.Range[] = [
    // Header merges
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Bộ Quốc Phòng
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Trường
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Khoa
    { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Quốc hiệu
    { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } }, // Tiêu ngữ
    { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } }, // Gạch chân
    // Title merges
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Tiêu đề chính
    { s: { r: 5, c: 0 }, e: { r: 5, c: 4 } }, // Dòng phụ
    // Table Header merges
    { s: { r: headerRow1Idx, c: 0 }, e: { r: headerRow2Idx, c: 0 } }, // TT
    { s: { r: headerRow1Idx, c: 1 }, e: { r: headerRow2Idx, c: 1 } }, // Họ và tên
    { s: { r: headerRow1Idx, c: 2 }, e: { r: headerRow1Idx, c: 4 } }, // Cụm kỳ đánh giá
  ];

  if (stats) {
    const statsRowIdx = dataEndRowIdx + 2;
    merges.push({ s: { r: statsRowIdx, c: 1 }, e: { r: statsRowIdx, c: 4 } });
  }

  // Signature row merges
  const sigDateRowIdx = aoa.length - 7;
  const sigTitleRowIdx = aoa.length - 6;
  const sigSubRowIdx = aoa.length - 5;
  const sigNameRowIdx = aoa.length - 1;

  merges.push({ s: { r: sigDateRowIdx, c: 3 }, e: { r: sigDateRowIdx, c: 4 } });
  merges.push({ s: { r: sigTitleRowIdx, c: 0 }, e: { r: sigTitleRowIdx, c: 1 } });
  merges.push({ s: { r: sigTitleRowIdx, c: 3 }, e: { r: sigTitleRowIdx, c: 4 } });
  merges.push({ s: { r: sigSubRowIdx, c: 0 }, e: { r: sigSubRowIdx, c: 1 } });
  merges.push({ s: { r: sigSubRowIdx, c: 3 }, e: { r: sigSubRowIdx, c: 4 } });
  merges.push({ s: { r: sigNameRowIdx, c: 0 }, e: { r: sigNameRowIdx, c: 1 } });
  merges.push({ s: { r: sigNameRowIdx, c: 3 }, e: { r: sigNameRowIdx, c: 4 } });

  ws['!merges'] = merges;

  // Create workbook and write
  const wb = XLSX.utils.book_new();
  const cleanSheetName = periodLabel.replace(/\s+/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, cleanSheetName.slice(0, 31));

  const fileName = `So_Ren_Luyen_Lop_${className}_${periodLabel.replace(/\s+/g, '_')}_${schoolYear.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Xuất file Word (.doc) chuẩn Sư phạm mở trực tiếp trong Microsoft Word:
 * - Định dạng bảng viền đen vector rõ nét
 * - Phông chữ Times New Roman chuẩn giáo dục
 * - Đầy đủ Quốc hiệu, Tiêu ngữ, Khung chữ ký 3 bên
 */
export function exportConductSheetToWord(options: ConductReportExportOptions) {
  const {
    className,
    schoolYear,
    periodLabel,
    homeroomTeacher = 'Nguyễn Văn Sang',
    departmentName = 'KHOA CƠ BẢN',
    schoolName = 'TRƯỜNG CAO ĐẲNG NGHỀ SỐ 1 - BQP',
    approverName = 'Phạm Thị Thu Trang',
    locationDate,
    rows,
    stats,
  } = options;

  const todayStr = locationDate || `Thái Nguyên, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

  const tableRowsHtml = rows
    .map((r, idx) => {
      const violationsHtml = r.violationsLines.length > 0
        ? r.violationsLines.map(v => `<div>${v}</div>`).join('')
        : '';
      const bonusesHtml = r.bonusesList.length > 0
        ? `<div>${r.bonusesList.join(', ')}</div>`
        : '';

      return `
        <tr>
          <td style="text-align: center; padding: 6px 4px; border: 1px solid #000;">${idx + 1}</td>
          <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold; white-space: nowrap;">${r.fullName}</td>
          <td style="text-align: center; padding: 6px 4px; border: 1px solid #000; font-weight: bold; color: #b91c1c;">${formatVietnameseNumber(r.finalScore)}</td>
          <td style="padding: 6px 8px; border: 1px solid #000; line-height: 1.4;">${violationsHtml}</td>
          <td style="padding: 6px 8px; border: 1px solid #000; line-height: 1.4;">${bonusesHtml}</td>
        </tr>
      `;
    })
    .join('');

  const statsHtml = stats ? `
    <div style="margin-top: 10px; font-size: 11pt; font-style: italic;">
      * <strong>Thống kê chung:</strong> Sĩ số: ${stats.totalStudents} học sinh | Điểm trung bình: ${formatVietnameseNumber(stats.avgScore)}
      ${stats.goodCount !== undefined ? ` | Tốt: ${stats.goodCount}` : ''}
      ${stats.fairCount !== undefined ? ` | Khá: ${stats.fairCount}` : ''}
      ${stats.mediumCount !== undefined ? ` | Đạt: ${stats.mediumCount}` : ''}
      ${stats.weakCount !== undefined ? ` | Yếu: ${stats.weakCount}` : ''}
    </div>
  ` : '';

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Sổ rèn luyện lớp ${className}</title>
      <style>
        @page {
          size: 210mm 297mm;
          margin: 15mm 15mm 15mm 15mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #000;
          font-size: 10.5pt;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: center;
          padding: 6px;
        }
      </style>
    </head>
    <body>
      <!-- ADMINISTRATIVE HEADER -->
      <table style="width: 100%; border: none; margin-bottom: 12px;">
        <tr style="border: none;">
          <td style="width: 45%; text-align: center; border: none; vertical-align: top;">
            <div style="font-size: 10pt; text-transform: uppercase;">BỘ QUỐC PHÒNG</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">${schoolName}</div>
            <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a;">${departmentName}</div>
            <div style="width: 100px; height: 1px; background-color: #000; margin: 4px auto 0;"></div>
          </td>
          <td style="width: 55%; text-align: center; border: none; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 10.5pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
            <div style="width: 140px; height: 1px; background-color: #000; margin: 4px auto 0;"></div>
          </td>
        </tr>
      </table>

      <!-- TITLE -->
      <div style="text-align: center; margin: 16px 0 10px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase;">
          BẢNG TỔNG HỢP KẾT QUẢ RÈN LUYỆN
        </h2>
        <div style="font-size: 11pt; font-weight: bold; margin-top: 4px;">
          LỚP: ${className} • ${periodLabel.toUpperCase()}
        </div>
        <div style="font-size: 10pt; font-style: italic; margin-top: 2px;">
          Năm học: ${schoolYear} • Giáo viên chủ nhiệm: ${homeroomTeacher} • Sĩ số: ${rows.length} HS
        </div>
      </div>

      <!-- MAIN TABLE -->
      <table>
        <thead>
          <tr>
            <th rowspan="2" style="width: 35px;">TT</th>
            <th rowspan="2" style="width: 170px;">Họ và tên</th>
            <th colspan="3">${periodLabel.toUpperCase()}</th>
          </tr>
          <tr>
            <th style="width: 85px;">Điểm rèn luyện</th>
            <th>Lỗi vi phạm</th>
            <th>Cộng điểm</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      ${statsHtml}

      <!-- SIGNATURE SECTION -->
      <table style="width: 100%; border: none; margin-top: 24px; page-break-inside: avoid;">
        <tr style="border: none;">
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td style="border: none; text-align: center; font-style: italic; font-size: 10pt;">
            ${todayStr}
          </td>
        </tr>
        <tr style="border: none;">
          <td style="width: 33%; text-align: center; border: none; vertical-align: top;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 10.5pt;">LỚP TRƯỞNG</div>
            <div style="font-size: 9.5pt; font-style: italic;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 60px;"></div>
          </td>
          <td style="width: 34%; text-align: center; border: none; vertical-align: top;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 10.5pt;">GIÁO VIÊN CHỦ NHIỆM</div>
            <div style="font-size: 9.5pt; font-style: italic;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: bold; font-size: 10.5pt;">${homeroomTeacher}</div>
          </td>
          <td style="width: 33%; text-align: center; border: none; vertical-align: top;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 10.5pt;">TRƯỞNG KHOA / TTCM</div>
            <div style="font-size: 9.5pt; font-style: italic;">(Ký và phê duyệt)</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: bold; font-size: 10.5pt;">${approverName}</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `So_Ren_Luyen_Lop_${className}_${periodLabel.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sao chép bảng rèn luyện vào Clipboard dưới định dạng văn bản / HTML để dán nhanh vào Word/Excel
 */
export async function copyConductSheetToClipboard(options: ConductReportExportOptions): Promise<boolean> {
  try {
    const { rows, periodLabel } = options;
    const header = `TT\tHọ và tên\tĐiểm rèn luyện (${periodLabel})\tLỗi vi phạm\tCộng điểm\n`;
    const body = rows.map((r, idx) => {
      const v = r.violationsLines.join('; ');
      const b = r.bonusesList.join(', ');
      return `${idx + 1}\t${r.fullName}\t${r.finalScore}\t${v}\t${b}`;
    }).join('\n');

    await navigator.clipboard.writeText(header + body);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
