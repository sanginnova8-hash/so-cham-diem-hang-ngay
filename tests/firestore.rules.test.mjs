import fs from 'node:fs';
import { before, after, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from 'firebase/firestore';
let env;
const profile = (uid, role = 'teacher', extra = {}) => ({ uid, role, isActive: true, teacherId: '', ...extra });
const dbFor = (uid, provider = 'password') => env.authenticatedContext(uid, { firebase: { sign_in_provider: provider } }).firestore();
const log = (teacherId, createdBy, extra = {}) => ({ teacherId, createdBy, studentId: `student-${teacherId}`, classId: `cfg-${teacherId}`, type: 'deduct', weekNumber: 1, month: 9, count: 1, scorePerUnit: 1, totalScore: 1, ...extra });
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-so-cham-diem', firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') } }); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users', 'a'), profile('a')), setDoc(doc(db, 'users', 'b'), profile('b')),
      setDoc(doc(db, 'users', 'admin'), profile('admin', 'admin')),
      setDoc(doc(db, 'users', 'disabled'), profile('disabled', 'teacher', { isActive: false })),
      setDoc(doc(db, 'users', 'monitor'), profile('monitor', 'monitor', { teacherId: 'a', assignedClassId: 'class-a', permissions: { canAddViolations: true, canAddBonuses: false, canViewScores: true } })),
      setDoc(doc(db, 'classes', 'class-a'), { teacherId: 'a' }),
      setDoc(doc(db, 'students', 'student-a'), { teacherId: 'a', classId: 'cfg-a' }), setDoc(doc(db, 'students', 'student-b'), { teacherId: 'b', classId: 'cfg-b' }),
      setDoc(doc(db, 'classConfigs', 'cfg-a'), { teacherId: 'a', semester1Months: [9, 10, 11, 12, 1] }),
      setDoc(doc(db, 'classConfigs', 'cfg-b'), { teacherId: 'b', semester1Months: [9, 10, 11, 12, 1] }),
      setDoc(doc(db, 'disciplineLogs', 'old'), log('a', 'a')),
    ]);
  });
});
test('guest and anonymous sessions cannot access school data', async () => {
  for (const db of [env.unauthenticatedContext().firestore(), dbFor('a', 'anonymous')]) {
    await assertFails(getDoc(doc(db, 'students', 'student-a')));
    await assertFails(setDoc(doc(db, 'students', 'new'), { teacherId: 'a' }));
  }
});
test('teachers cannot access, list, overwrite or transfer other teachers data', async () => {
  const db = dbFor('a');
  await assertSucceeds(getDoc(doc(db, 'students', 'student-a')));
  await assertSucceeds(getDocs(query(collection(db, 'students'), where('teacherId', '==', 'a'))));
  await assertFails(getDocs(collection(db, 'students')));
  await assertFails(getDoc(doc(db, 'students', 'student-b')));
  await assertFails(setDoc(doc(db, 'students', 'student-b'), { teacherId: 'a' }));
  await assertFails(updateDoc(doc(db, 'students', 'student-a'), { teacherId: 'b' }));
});
test('profiles cannot self-escalate, unblock themselves or store passwords', async () => {
  const db = dbFor('a');
  await assertFails(updateDoc(doc(db, 'users', 'a'), { role: 'admin' }));
  await assertFails(updateDoc(doc(db, 'users', 'a'), { permissions: { canViewScores: true } }));
  await assertFails(updateDoc(doc(db, 'users', 'b'), { displayName: 'hacked' }));
  await assertFails(updateDoc(doc(dbFor('disabled'), 'users', 'disabled'), { isActive: true }));
  await assertFails(setDoc(doc(dbFor('new'), 'users', 'new'), profile('new', 'admin')));
  await assertFails(setDoc(doc(dbFor('new'), 'users', 'new'), profile('new', 'teacher', { password: 'secret' })));
  await assertSucceeds(setDoc(doc(dbFor('new'), 'users', 'new'), profile('new')));
});
test('teacher provisions monitors only for their own class', async () => {
  const db = dbFor('a');
  await assertSucceeds(setDoc(doc(db, 'users', 'new-monitor'), profile('new-monitor', 'monitor', { teacherId: 'a', assignedClassId: 'class-a' })));
  await assertFails(setDoc(doc(db, 'users', 'bad'), profile('bad', 'monitor', { teacherId: 'b', assignedClassId: 'class-a' })));
  await assertSucceeds(getDocs(query(collection(db, 'users'), where('teacherId', '==', 'a'), where('role', '==', 'monitor'))));
  await assertFails(getDocs(collection(db, 'users')));
});
test('monitor permissions and log creator identity apply on the server', async () => {
  const db = dbFor('monitor');
  await assertSucceeds(setDoc(doc(db, 'disciplineLogs', 'new'), log('a', 'monitor')));
  await assertFails(setDoc(doc(db, 'disciplineLogs', 'bonus'), log('a', 'monitor', { type: 'bonus' })));
  await assertFails(setDoc(doc(db, 'disciplineLogs', 'foreign'), log('b', 'monitor')));
  await assertFails(setDoc(doc(db, 'students', 'new'), { teacherId: 'a' }));
  await assertFails(updateDoc(doc(db, 'disciplineLogs', 'old'), { count: 2 }));
  await assertFails(setDoc(doc(dbFor('a'), 'disciplineLogs', 'forged'), log('a', 'b')));
});
test('period locks and account disabling block writes', async () => {
  await assertSucceeds(setDoc(doc(dbFor('admin'), 'periodLocks', 'week_1'), { isLocked: true }));
  await assertFails(setDoc(doc(dbFor('a'), 'disciplineLogs', 'locked'), log('a', 'a')));
  await assertFails(updateDoc(doc(dbFor('a'), 'disciplineLogs', 'old'), { weekNumber: 2 }));
  await assertFails(setDoc(doc(dbFor('a'), 'periodLocks', 'week_1'), { isLocked: false }));
  await assertFails(setDoc(doc(dbFor('disabled'), 'students', 'new'), { teacherId: 'disabled' }));
  await assertSucceeds(getDoc(doc(dbFor('admin'), 'students', 'student-b')));
});
test('semester locks and student/config references are enforced', async () => {
  const db = dbFor('a');
  await assertFails(setDoc(doc(db, 'disciplineLogs', 'foreign-student'), log('a', 'a', { studentId: 'student-b' })));
  await assertSucceeds(setDoc(doc(dbFor('admin'), 'periodLocks', 'semester_1'), { isLocked: true }));
  await assertFails(setDoc(doc(db, 'disciplineLogs', 'semester-locked'), log('a', 'a')));
  await assertFails(updateDoc(doc(db, 'disciplineLogs', 'old'), { month: 2 }));
});
