import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  UserAccount,
  SchoolClass,
  Student,
  DisciplineLog,
  BehaviorCategory,
  ClassConfig,
  PeriodLockStatus,
} from '../types';

// ======================== USER ACCOUNTS ========================
export async function saveUserToCloud(user: UserAccount): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        username: user.username || '',
        displayName: user.displayName,
        role: user.role,
        assignedClassId: user.assignedClassId,
        assignedClassName: user.assignedClassName,
        department: user.department || '',
        phone: user.phone || '',
        password: user.password || '',
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserFromCloud(uid: string): Promise<UserAccount | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch user ${uid} from cloud:`, error);
    return null;
  }
}

export async function getAllUsersFromCloud(): Promise<UserAccount[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserAccount);
  } catch (error) {
    console.warn('Could not fetch all users from cloud:', error);
    return [];
  }
}

// ======================== CLASSES ========================
export async function saveClassToCloud(cls: SchoolClass): Promise<void> {
  const path = `classes/${cls.id}`;
  try {
    const classRef = doc(db, 'classes', cls.id);
    await setDoc(
      classRef,
      {
        ...cls,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAllClassesFromCloud(): Promise<SchoolClass[]> {
  const path = 'classes';
  try {
    const snap = await getDocs(collection(db, 'classes'));
    return snap.docs.map((d) => d.data() as SchoolClass);
  } catch (error) {
    console.warn('Could not fetch classes from cloud:', error);
    return [];
  }
}

export async function deleteClassFromCloud(classId: string): Promise<void> {
  const path = `classes/${classId}`;
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    console.warn('Could not delete class from cloud:', error);
  }
}

// ======================== CLASS CONFIG ========================
export async function saveClassConfigToCloud(config: ClassConfig): Promise<void> {
  const path = `classConfigs/${config.id}`;
  try {
    await setDoc(
      doc(db, 'classConfigs', config.id),
      {
        ...config,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getClassConfigFromCloud(teacherId: string): Promise<ClassConfig | null> {
  const path = 'classConfigs';
  try {
    const q = query(collection(db, 'classConfigs'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ClassConfig;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch class config from cloud:', error);
    return null;
  }
}

// ======================== STUDENTS ========================
export async function saveStudentToCloud(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await setDoc(
      doc(db, 'students', student.id),
      {
        ...student,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveStudentsToCloud(students: Student[]): Promise<void> {
  try {
    await Promise.all(students.map((s) => saveStudentToCloud(s)));
  } catch (error) {
    console.warn('Batch saving students failed:', error);
  }
}

export async function deleteStudentFromCloud(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getStudentsFromCloud(teacherId: string): Promise<Student[]> {
  const path = 'students';
  try {
    const q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Student);
  } catch (error) {
    console.warn(`Could not fetch students for teacher ${teacherId}:`, error);
    return [];
  }
}

// ======================== DISCIPLINE LOGS ========================
export async function saveDisciplineLogToCloud(log: DisciplineLog): Promise<void> {
  const path = `disciplineLogs/${log.id}`;
  try {
    await setDoc(
      doc(db, 'disciplineLogs', log.id),
      {
        ...log,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDisciplineLogFromCloud(logId: string): Promise<void> {
  const path = `disciplineLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'disciplineLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getDisciplineLogsFromCloud(teacherId: string): Promise<DisciplineLog[]> {
  const path = 'disciplineLogs';
  try {
    const q = query(collection(db, 'disciplineLogs'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DisciplineLog);
  } catch (error) {
    console.warn(`Could not fetch discipline logs for teacher ${teacherId}:`, error);
    return [];
  }
}

// ======================== BEHAVIOR CATEGORIES ========================
export async function saveBehaviorCategoryToCloud(cat: BehaviorCategory): Promise<void> {
  const path = `behaviorCategories/${cat.id}`;
  try {
    await setDoc(
      doc(db, 'behaviorCategories', cat.id),
      {
        ...cat,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getBehaviorCategoriesFromCloud(teacherId: string): Promise<BehaviorCategory[]> {
  const path = 'behaviorCategories';
  try {
    const q = query(collection(db, 'behaviorCategories'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BehaviorCategory);
  } catch (error) {
    console.warn(`Could not fetch categories for teacher ${teacherId}:`, error);
    return [];
  }
}

// ======================== PERIOD LOCKS ========================
export async function savePeriodLockToCloud(lock: PeriodLockStatus): Promise<void> {
  const id = `${lock.periodType}_${lock.periodValue}`;
  const path = `periodLocks/${id}`;
  try {
    await setDoc(
      doc(db, 'periodLocks', id),
      {
        id,
        periodType: lock.periodType,
        periodValue: lock.periodValue,
        isLocked: lock.isLocked,
        lockedAt: lock.lockedAt || new Date().toISOString(),
        lockedBy: lock.lockedBy || 'Quản trị viên',
        reason: lock.reason || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn(`Could not save lock ${id} to cloud:`, error);
  }
}

export async function getPeriodLocksFromCloud(): Promise<PeriodLockStatus[]> {
  const path = 'periodLocks';
  try {
    const snap = await getDocs(collection(db, 'periodLocks'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        periodType: data.periodType,
        periodValue: data.periodValue,
        isLocked: data.isLocked,
        lockedAt: data.lockedAt,
        lockedBy: data.lockedBy,
        reason: data.reason,
      } as PeriodLockStatus;
    });
  } catch (error) {
    console.warn('Could not fetch period locks from cloud:', error);
    return [];
  }
}
