import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DisciplineLog } from '../types';
import { formatVietnameseDate } from '../lib/utils';

export function StudentPointEditor({ studentId, weekNumber, onClose }: { studentId: string; weekNumber: number; onClose: () => void }) {
  const { disciplineLogs, students, classConfig, activeAccount, isPeriodLocked, updateDisciplineLog } = useApp();
  const [editing, setEditing] = useState<DisciplineLog | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const logs = disciplineLogs.filter(log => log.studentId === studentId && log.weekNumber === weekNumber);
  const locked = (log: DisciplineLog) => isPeriodLocked('week', log.weekNumber) || isPeriodLocked('month', log.month) || isPeriodLocked('semester', classConfig.semester1Months.includes(log.month) ? 1 : 2);
  return <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-3">
    <section role="dialog" aria-modal="true" aria-label="Sửa điểm đã ghi nhận" className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Sửa điểm • {students.find(student => student.id === studentId)?.fullName} • Tuần {weekNumber}</h3><button disabled={busy} onClick={onClose} className="border rounded-lg px-3 py-2">Đóng</button></div>
      <p className="text-xs text-slate-500">Chọn bản ghi cộng hoặc trừ đã nhập sai. Mọi thay đổi được lưu vào lịch sử chỉnh sửa.</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-600">{notice}</p>}
      {editing ? <form className="space-y-3" onSubmit={async event => {
        event.preventDefault(); setBusy(true); setError(''); setNotice('');
        try {
          if (locked(editing)) throw new Error('Tuần, tháng hoặc học kỳ của bản ghi đã khóa. Không thể sửa điểm.');
          await updateDisciplineLog(editing.id, { type: editing.type, scorePerUnit: editing.scorePerUnit, count: editing.count, behaviorDescription: editing.behaviorDescription.trim(), note: editing.note || '' }, activeAccount?.displayName || classConfig.homeroomTeacher);
          setEditing(null); setNotice('Đã lưu chỉnh sửa. Điểm tổng kết đã được cập nhật.');
        } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
        finally { setBusy(false); }
      }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm">Loại điểm<select disabled={busy} value={editing.type} onChange={event => setEditing({ ...editing, type: event.target.value as 'deduct' | 'bonus' })} className="block w-full border rounded-lg p-2 bg-transparent"><option value="deduct">Trừ điểm</option><option value="bonus">Cộng điểm</option></select></label>
          <label className="text-sm">Điểm mỗi lần<input disabled={busy} required type="number" min="0" step="0.01" value={editing.scorePerUnit} onChange={event => setEditing({ ...editing, scorePerUnit: Number(event.target.value) })} className="block w-full border rounded-lg p-2 bg-transparent" /></label>
          <label className="text-sm">Số lần<input disabled={busy} required type="number" min="1" step="1" value={editing.count} onChange={event => setEditing({ ...editing, count: Number(event.target.value) })} className="block w-full border rounded-lg p-2 bg-transparent" /></label>
        </div>
        <label className="block text-sm">Nội dung<input disabled={busy} required value={editing.behaviorDescription} onChange={event => setEditing({ ...editing, behaviorDescription: event.target.value })} className="block w-full border rounded-lg p-2 bg-transparent" /></label>
        <label className="block text-sm">Ghi chú / lý do sửa<input disabled={busy} value={editing.note || ''} onChange={event => setEditing({ ...editing, note: event.target.value })} className="block w-full border rounded-lg p-2 bg-transparent" /></label>
        <p className="text-sm font-semibold">Tổng: {editing.type === 'deduct' ? '−' : '+'}{Math.round(editing.scorePerUnit * editing.count * 100) / 100} điểm</p>
        <div className="flex gap-2"><button disabled={busy || locked(editing)} className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-40">{busy ? 'Đang lưu…' : 'Lưu chỉnh sửa'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)} className="border rounded-lg px-4 py-2">Hủy</button></div>
      </form> : <div className="space-y-2">
        {logs.length === 0 && <p className="text-sm">Chưa có bản ghi cộng/trừ trong tuần này.</p>}
        {logs.map(log => <div key={log.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-3 flex items-center justify-between gap-3"><div className="text-sm"><p>{log.behaviorDescription}</p><p className="text-xs text-slate-500">{formatVietnameseDate(log.date)} • {log.count} lần × {log.scorePerUnit} điểm • {log.type === 'deduct' ? '−' : '+'}{log.totalScore} điểm</p></div><button disabled={locked(log)} onClick={() => { setEditing({ ...log }); setError(''); setNotice(''); }} className="shrink-0 border rounded-lg px-3 py-2 text-blue-600 disabled:opacity-40">{locked(log) ? 'Đã khóa' : 'Sửa'}</button></div>)}
      </div>}
    </section>
  </div>;
}
