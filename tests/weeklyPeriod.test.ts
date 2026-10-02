import { test } from 'node:test';
import assert from 'node:assert/strict';
import { logsForWeek, currentSchoolWeek } from '../src/lib/weeklyPeriod';

test('a weekly total includes both months when the week crosses a month boundary', () => {
  const logs = [{weekNumber:4,month:9,totalScore:10}, {weekNumber:4,month:10,totalScore:1}, {weekNumber:5,month:10,totalScore:2}];
  assert.deepEqual(logsForWeek(logs,4),logs.slice(0,2));
});
test('the initial filter uses the current school week and its configured month', () => {
  const weeks=[{weekNumber:1,month:9,startDate:'2026-09-01',endDate:'2026-09-07'}, {weekNumber:5,month:9,startDate:'2026-09-29',endDate:'2026-10-05'}];
  assert.equal(currentSchoolWeek(weeks,'2026-10-02')?.weekNumber,5);
  assert.equal(currentSchoolWeek(weeks,'2026-10-02')?.month,9);
});
