import { localDateString } from './logValidation';

export interface ReportPeriodSelection {
  period: 'week' | 'month' | 'semester';
  weekNumber?: number;
  month?: number;
  semester?: 1 | 2;
}

// Week numbers are unique within a class/year. A week can cross a month boundary.
export function logsForWeek<T extends { weekNumber: number }>(logs: T[], weekNumber: number): T[] {
  return logs.filter(log => log.weekNumber === weekNumber);
}

export function currentSchoolWeek<T extends { startDate: string; endDate: string }>(weeks: T[], date = localDateString()): T | undefined {
  return weeks.find(week => week.startDate <= date && date <= week.endDate) || weeks[0];
}
