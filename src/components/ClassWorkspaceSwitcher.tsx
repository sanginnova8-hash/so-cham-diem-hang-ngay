import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export function ClassWorkspaceSwitcher() {
  const { userRole, classConfig, workspaceClasses, selectWorkspaceClass, createWorkspaceClass, inspectorModeClass } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const year = new Date().getFullYear();
  const [schoolYear, setSchoolYear] = useState(`${year}-${year + 1}`);
  const [start, setStart] = useState(`${year}-09-01`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (userRole === 'guest') return null;
  return <section className="mx-3 sm:mx-6 mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
    <div className="flex flex-wrap gap-2 items-center">
      <label className="text-xs font-semibold flex-1 min-w-0">Lớp / Niên khóa đang làm việc
        <select aria-label="Chọn lớp và niên khóa" value={classConfig.id} disabled={busy} onChange={event => selectWorkspaceClass(event.target.value)} className="block w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
          {workspaceClasses.map(config => <option key={config.id} value={config.id}>{config.className} · {config.schoolYear}</option>)}
        </select>
      </label>
      {userRole !== 'monitor' && !inspectorModeClass && <button onClick={() => { setOpen(!open); setError(''); }} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold">{open ? 'Đóng' : '+ Lớp / Niên khóa mới'}</button>}
    </div>
    {open && <form className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError('');
      try { await createWorkspaceClass(name, schoolYear, start); setOpen(false); setName(''); }
      catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
      finally { setBusy(false); }
    }}>
      <label className="text-xs">Tên lớp<input required value={name} onChange={event => setName(event.target.value)} placeholder="Ví dụ: 10A8" className="block w-full mt-1 border rounded-lg p-2" /></label>
      <label className="text-xs">Niên khóa<input required value={schoolYear} onChange={event => setSchoolYear(event.target.value)} placeholder="2026-2027" className="block w-full mt-1 border rounded-lg p-2" /></label>
      <label className="text-xs">Ngày bắt đầu tuần 1<input required type="date" value={start} onChange={event => setStart(event.target.value)} className="block w-full mt-1 border rounded-lg p-2" /></label>
      <p className="sm:col-span-3 text-xs text-slate-500">Lớp mới bắt đầu với danh sách học sinh và nhật ký trống, sao chép biểu điểm hiện tại. Lớp cũ vẫn được giữ để tra cứu. Có thể chỉnh lịch tuần trong Cài đặt.</p>
      {error && <p role="alert" className="sm:col-span-3 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50">{busy ? 'Đang tạo…' : 'Tạo và chuyển sang lớp mới'}</button>
    </form>}
  </section>;
}
