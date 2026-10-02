import type { ClassConfig, SchoolWeek, UserAccount } from '../types';
import { localDateString } from './logValidation';

export function monitorMatchesClass(account: UserAccount, config: ClassConfig): boolean {
  return account.role === 'monitor' && (account.classConfigId === config.id
    || account.assignedClassId === (config.classDirectoryId || config.id)
    || (!account.classConfigId && config.scopeVersion !== 2 && account.teacherId === config.teacherId));
}

export function rowsForClass<T extends { classId?: string }>(rows: T[], config: ClassConfig, allowLegacy = false): T[] {
  return rows.filter(row => row.classId === config.id || (allowLegacy && !row.classId && config.scopeVersion !== 2));
}

export function schoolWeeksFrom(start: string, count = 35): SchoolWeek[] {
  const date = new Date(`${start}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !Number.isFinite(date.getTime()) || localDateString(date) !== start) throw new Error('Ngày bắt đầu năm học không hợp lệ.');
  return Array.from({ length: count }, (_, index) => {
    const first = new Date(date); first.setDate(date.getDate() + index * 7);
    const last = new Date(first); last.setDate(first.getDate() + 6);
    const month = first.getMonth() + 1;
    return { weekNumber: index + 1, startDate: localDateString(first), endDate: localDateString(last), semester: index < 19 ? 1 : 2, month, title: `Tuần ${index + 1} (T${month})` };
  });
}

export function validateSchoolYear(year: string): string {
  const match = year.trim().match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
  if (!match || Number(match[2]) !== Number(match[1]) + 1) throw new Error('Niên khóa cần có dạng 2026-2027, gồm hai năm liên tiếp.');
  return `${match[1]}-${match[2]}`;
}
