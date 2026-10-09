import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { ConductSheetRow } from '../src/components/ConductSheetTable';

test('conduct sheet excel generation structure test', () => {
  const rows: ConductSheetRow[] = [
    {
      stt: 1,
      studentId: 's1',
      studentCode: '10A8-01',
      fullName: 'Nguyễn Văn An',
      finalScore: 9.5,
      violationsLines: [],
      bonusesList: ['2đ đi học đầy đủ', '1đ tổ trưởng'],
    },
    {
      stt: 2,
      studentId: 's2',
      studentCode: '10A8-02',
      fullName: 'Trần Thị Bích',
      finalScore: 7.0,
      violationsLines: ['Mất trật tự (2 lần)', 'Không thuộc bài 1 lần'],
      bonusesList: [],
    },
  ];

  const aoa: (string | number)[][] = [];
  aoa.push(['BỘ QUỐC PHÒNG', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', '']);
  aoa.push(['TRƯỜNG CAO ĐẲNG NGHỀ SỐ 1 - BQP', '', '', 'Độc lập - Tự do - Hạnh phúc', '']);
  aoa.push(['KHOA CƠ BẢN', '', '', '------------------------', '']);
  aoa.push(['', '', '', '', '']);
  aoa.push(['BẢNG TỔNG HỢP KẾT QUẢ RÈN LUYỆN HỌC SINH', '', '', '', '']);
  aoa.push(['Lớp: 10A8 • TUẦN 5 • Năm học: 2024 - 2025 • GVCN: Nguyễn Văn Sang', '', '', '', '']);
  aoa.push(['', '', '', '', '']);
  aoa.push(['TT', 'Họ và tên', 'KẾT QUẢ ĐÁNH GIÁ (TUẦN 5)', '', '']);
  aoa.push(['', '', 'Điểm rèn luyện', 'Lỗi vi phạm', 'Cộng điểm']);

  rows.forEach((r, idx) => {
    aoa.push([
      idx + 1,
      r.fullName,
      r.finalScore,
      r.violationsLines.join('\n'),
      r.bonusesList.join(', '),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tuan_5');

  assert.ok(wb.SheetNames.includes('Tuan_5'));
  assert.equal(ws['A1'].v, 'BỘ QUỐC PHÒNG');
  assert.equal(ws['D1'].v, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
  assert.equal(ws['A10'].v, 1);
  assert.equal(ws['B10'].v, 'Nguyễn Văn An');
  assert.equal(ws['C10'].v, 9.5);
  assert.equal(ws['E10'].v, '2đ đi học đầy đủ, 1đ tổ trưởng');
  assert.equal(ws['D11'].v, 'Mất trật tự (2 lần)\nKhông thuộc bài 1 lần');
});
