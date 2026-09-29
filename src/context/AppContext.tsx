import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import {
  Student,
  BehaviorCategory,
  DisciplineLog,
  ClassConfig,
  AchievementBonusRule,
  StudentWeeklySummary,
  StudentMonthlySummary,
  StudentSemesterSummary,
  EditHistoryEntry,
  UserRole,
  UserAccount,
  SchoolClass,
  PeriodLockStatus,
} from '../types';
import {
  auth,
  db,
  loginWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
  ensureFirebaseAuth,
} from '../lib/firebase';
import {
  saveUserToCloud,
  getUserFromCloud,
  getAllUsersFromCloud,
  saveClassToCloud,
  getAllClassesFromCloud,
  deleteClassFromCloud,
  saveClassConfigToCloud,
  getClassConfigFromCloud,
  saveStudentToCloud,
  deleteStudentFromCloud,
  getStudentsFromCloud,
  saveDisciplineLogToCloud,
  deleteDisciplineLogFromCloud,
  getDisciplineLogsFromCloud,
  saveBehaviorCategoryToCloud,
  getBehaviorCategoriesFromCloud,
  savePeriodLockToCloud,
  getPeriodLocksFromCloud,
} from '../lib/firestoreService';
import {
  INITIAL_CLASS_CONFIG,
  INITIAL_BEHAVIOR_CATEGORIES,
  INITIAL_STUDENTS,
  INITIAL_DISCIPLINE_LOGS,
  DEFAULT_ACHIEVEMENT_RULES,
  INITIAL_TEACHER_ID,
} from '../data/initialData';
import {
  INITIAL_USER_ACCOUNTS,
  INITIAL_SCHOOL_CLASSES,
  INITIAL_LOCKED_PERIODS,
} from '../data/rbacAccounts';
import { calculateRank, clampScore } from '../lib/utils';

interface AppContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  isLocalMode: boolean;
  setLocalMode: (val: boolean) => void;
  isCloudSyncing: boolean;
  cloudSyncError: string | null;
  isGoogleAuth: boolean;
  login: (fallbackEmail?: string) => Promise<void>;
  registerWithGoogle: (customClassName?: string, department?: string, fallbackEmail?: string) => Promise<void>;
  registerQuickOneTouch: (params: {
    displayName?: string;
    emailOrUsername?: string;
    className?: string;
    department?: string;
    phone?: string;
  }) => Promise<UserAccount>;
  loginAsGuest: () => void;
  registerWithEmailPassword: (params: {
    email: string;
    pass: string;
    name: string;
    className: string;
    department: string;
    phone?: string;
  }) => Promise<void>;
  loginUserWithEmailPassword: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;

  // RBAC Roles & Accounts
  userRole: UserRole;
  activeAccount: UserAccount | null;
  userAccounts: UserAccount[];
  schoolClasses: SchoolClass[];
  lockedPeriods: PeriodLockStatus[];
  inspectorModeClass: SchoolClass | null;
  isPeriodLocked: (periodType: 'week' | 'month', periodValue: number) => boolean;
  loginAsRole: (role: UserRole, accountUid?: string) => void;
  switchAccount: (accountUid: string) => void;
  enterInspectorMode: (classItem: SchoolClass) => void;
  exitInspectorMode: () => void;
  switchWorkingClass: (classItem: SchoolClass) => void;
  toggleLockPeriod: (periodType: 'week' | 'month', periodValue: number, reason?: string) => void;
  updateUserAccount: (uid: string, updates: Partial<UserAccount>) => void;
  resetUserPassword: (uid: string) => { success: boolean; tempPass: string };
  toggleUserAccountStatus: (uid: string) => void;
  deleteUserAccount: (uid: string) => void;
  addUserAccount: (acc: Omit<UserAccount, 'uid' | 'lastLoginAt'>) => UserAccount;
  deleteSchoolClass: (classId: string) => void;
  purgeOrphanedClasses: () => number;
  addSchoolClass: (cls: SchoolClass) => void;

  // Data
  classConfig: ClassConfig;
  students: Student[];
  behaviorCategories: BehaviorCategory[];
  disciplineLogs: DisciplineLog[];

  // Mutators
  updateClassConfig: (config: Partial<ClassConfig>) => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId'>) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string, deleteRelatedLogs?: boolean) => Promise<void>;
  deleteStudentsBatch: (ids: string[], deleteRelatedLogs?: boolean) => Promise<{ count: number }>;
  toggleStudentStatus: (id: string) => Promise<void>;
  importStudentsBatch: (newStudents: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId'>>) => Promise<{ imported: number; updated: number }>;

  addBehaviorCategory: (cat: Omit<BehaviorCategory, 'id' | 'createdAt' | 'updatedAt' | 'teacherId'>) => Promise<BehaviorCategory>;
  updateBehaviorCategory: (id: string, updates: Partial<BehaviorCategory>) => Promise<void>;
  toggleBehaviorCategoryActive: (id: string) => Promise<void>;
  deleteBehaviorCategory: (id: string) => Promise<{ success: boolean; message?: string }>;
  resetBehaviorCategoriesToDefault: () => Promise<void>;

  // Achievement bonus rules & awards
  updateAchievementRule: (id: string, updates: Partial<AchievementBonusRule>) => Promise<void>;
  addAchievementRule: (rule: Omit<AchievementBonusRule, 'id'>) => Promise<AchievementBonusRule>;
  deleteAchievementRule: (id: string) => Promise<void>;
  resetAchievementRulesToDefault: () => Promise<void>;
  awardAchievementBonus: (params: {
    studentId: string;
    rule?: AchievementBonusRule;
    weekNumber?: number;
    month?: number;
    customScore?: number;
    customNote?: string;
  }) => Promise<{ log: DisciplineLog; alreadyAwarded?: boolean }>;
  batchAwardAchievementBonus: (params: {
    studentIds: string[];
    rule: AchievementBonusRule;
    weekNumber?: number;
    month?: number;
    customScore?: number;
    customNote?: string;
  }) => Promise<{ awardedCount: number; skippedCount: number }>;
  revokeAchievementBonus: (logId: string) => Promise<void>;

  addDisciplineLog: (log: Omit<DisciplineLog, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId' | 'totalScore'>) => Promise<{ log: DisciplineLog; duplicateWarning?: boolean }>;
  updateDisciplineLog: (id: string, updates: Partial<DisciplineLog>, editorName: string) => Promise<void>;
  deleteDisciplineLog: (id: string, editorName: string) => Promise<void>;
  importDisciplineLogsBatch: (newLogs: Array<Omit<DisciplineLog, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId' | 'totalScore'>>) => Promise<{ imported: number }>;

  // Calculated views
  getWeeklySummary: (weekNumber: number, month?: number) => StudentWeeklySummary[];
  getMonthlySummary: (month: number) => StudentMonthlySummary[];
  getSemesterSummary: (semester: 1 | 2) => StudentSemesterSummary[];
  getStudentLogs: (studentId: string) => DisciplineLog[];

  // Backup & Restore
  exportFullBackupJson: () => string;
  restoreFromJson: (jsonStr: string) => Promise<{ success: boolean; message: string; studentCount?: number; logCount?: number }>;
  resetToSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'so_cham_diem_local_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false); // Always default to Cloud CSDL
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // Core collections in memory
  const [classConfig, setClassConfig] = useState<ClassConfig>(INITIAL_CLASS_CONFIG);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [behaviorCategories, setBehaviorCategories] = useState<BehaviorCategory[]>(INITIAL_BEHAVIOR_CATEGORIES);
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineLog[]>(INITIAL_DISCIPLINE_LOGS);

  // RBAC state
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    try {
      const savedAccs = localStorage.getItem('so_cham_diem_user_accounts');
      if (savedAccs) return JSON.parse(savedAccs);
    } catch (e) {
      console.warn('Error reading user accounts:', e);
    }
    return INITIAL_USER_ACCOUNTS;
  });

  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>(() => {
    try {
      const savedClasses = localStorage.getItem('so_cham_diem_school_classes');
      if (savedClasses) return JSON.parse(savedClasses);
    } catch (e) {
      console.warn('Error reading school classes:', e);
    }
    return INITIAL_SCHOOL_CLASSES;
  });

  const [lockedPeriods, setLockedPeriods] = useState<PeriodLockStatus[]>(() => {
    try {
      const savedLocked = localStorage.getItem('so_cham_diem_locked_periods');
      if (savedLocked) return JSON.parse(savedLocked);
    } catch (e) {
      console.warn('Error reading locked periods:', e);
    }
    return INITIAL_LOCKED_PERIODS;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('so_cham_diem_user_role') as UserRole;
      if (savedRole && ['guest', 'teacher', 'admin'].includes(savedRole)) return savedRole;
    } catch (e) {
      // fallback
    }
    return 'guest'; // default to guest so no admin information is exposed before login
  });

  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(() => {
    try {
      const savedUid = localStorage.getItem('so_cham_diem_active_uid');
      if (savedUid) {
        const found = INITIAL_USER_ACCOUNTS.find((a) => a.uid === savedUid);
        if (found) return found;
      }
    } catch (e) {
      // fallback
    }
    return null; // Not logged in by default
  });

  const [inspectorModeClass, setInspectorModeClass] = useState<SchoolClass | null>(null);

  // Save RBAC state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('so_cham_diem_user_accounts', JSON.stringify(userAccounts));
      localStorage.setItem('so_cham_diem_locked_periods', JSON.stringify(lockedPeriods));
      localStorage.setItem('so_cham_diem_user_role', userRole);
      if (activeAccount) {
        localStorage.setItem('so_cham_diem_active_uid', activeAccount.uid);
      } else {
        localStorage.removeItem('so_cham_diem_active_uid');
      }
    } catch (e) {
      console.warn('Error saving RBAC state:', e);
    }
  }, [userAccounts, lockedPeriods, userRole, activeAccount]);

  const isPeriodLocked = (periodType: 'week' | 'month', periodValue: number): boolean => {
    return lockedPeriods.some(
      (p) => p.periodType === periodType && p.periodValue === periodValue && p.isLocked
    );
  };

  const loginAsRole = (role: UserRole, accountUid?: string) => {
    if (role === 'guest') {
      setUserRole('guest');
      setActiveAccount(null);
      setInspectorModeClass(null);
      return;
    }
    const targetAcc = accountUid
      ? userAccounts.find((a) => a.uid === accountUid)
      : userAccounts.find((a) => a.role === role);

    if (targetAcc) {
      setActiveAccount(targetAcc);
      setUserRole(targetAcc.role);
      setInspectorModeClass(null);
    } else {
      setUserRole(role);
    }
  };

  const switchAccount = (accountUid: string) => {
    const acc = userAccounts.find((a) => a.uid === accountUid);
    if (acc) {
      setActiveAccount(acc);
      setUserRole(acc.role);
      setInspectorModeClass(null);
    }
  };

  const enterInspectorMode = (classItem: SchoolClass) => {
    setInspectorModeClass(classItem);
  };

  const exitInspectorMode = () => {
    setInspectorModeClass(null);
  };

  const switchWorkingClass = (classItem: SchoolClass) => {
    setClassConfig((prev) => ({
      ...prev,
      className: classItem.className.replace(/^lớp\s+/i, '').trim(),
      homeroomTeacher: classItem.teacherName,
      department: classItem.department,
      schoolYear: classItem.schoolYear,
    }));
    setInspectorModeClass(null);
  };

  const toggleLockPeriod = (periodType: 'week' | 'month', periodValue: number, reason?: string) => {
    setLockedPeriods((prev) => {
      const idx = prev.findIndex((p) => p.periodType === periodType && p.periodValue === periodValue);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          isLocked: !next[idx].isLocked,
          lockedAt: !next[idx].isLocked ? new Date().toISOString() : undefined,
          lockedBy: !next[idx].isLocked ? (activeAccount?.displayName || 'Ban Giám Hiệu') : undefined,
          reason: reason || next[idx].reason,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            periodType,
            periodValue,
            isLocked: true,
            lockedAt: new Date().toISOString(),
            lockedBy: activeAccount?.displayName || 'Ban Giám Hiệu',
            reason: reason || 'Khóa sổ thi đua định kỳ',
          },
        ];
      }
    });
  };

  const updateUserAccount = (uid: string, updates: Partial<UserAccount>) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.uid === uid ? { ...acc, ...updates } : acc))
    );
    if (activeAccount?.uid === uid) {
      setActiveAccount((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const resetUserPassword = (uid: string): { success: boolean; tempPass: string } => {
    const tempPass = 'GV' + Math.floor(100000 + Math.random() * 900000);
    return { success: true, tempPass };
  };

  const toggleUserAccountStatus = (uid: string) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.uid === uid ? { ...acc, isActive: !acc.isActive } : acc))
    );
  };

  // Helper: Kiểm tra xem một lớp học có gắn liền với bất kỳ tài khoản GVCN nào còn tồn tại hay không
  const isClassTiedToTeacher = (cls: SchoolClass, users: UserAccount[]): boolean => {
    return users.some((u) => {
      if (u.assignedClassId && u.assignedClassId === cls.id) return true;
      if (cls.teacherId && u.uid === cls.teacherId) return true;
      if (cls.teacherEmail && u.email && cls.teacherEmail.toLowerCase() === u.email.toLowerCase()) return true;
      if (u.assignedClassName && cls.className) {
        const cleanUserClass = u.assignedClassName.toLowerCase().replace(/^lớp\s+/i, '').trim();
        const cleanSchoolClass = cls.className.toLowerCase().replace(/^lớp\s+/i, '').trim();
        if (cleanUserClass === cleanSchoolClass) return true;
      }
      return false;
    });
  };

  const addSchoolClass = (cls: SchoolClass) => {
    setSchoolClasses((prev) => {
      const next = [...prev, cls];
      try {
        localStorage.setItem('so_cham_diem_school_classes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    saveClassToCloud(cls).catch(() => {});
  };

  const deleteSchoolClass = (classId: string) => {
    setSchoolClasses((prev) => {
      const next = prev.filter((c) => c.id !== classId);
      try {
        localStorage.setItem('so_cham_diem_school_classes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      deleteDoc(doc(db, 'classes', classId)).catch((e) => {
        console.warn('Delete class doc notice:', e);
      });
    } catch (e) {}
  };

  const purgeOrphanedClasses = (): number => {
    let removedCount = 0;
    setSchoolClasses((prev) => {
      const valid = prev.filter((cls) => {
        const hasTeacher = isClassTiedToTeacher(cls, userAccounts);
        if (!hasTeacher) {
          removedCount++;
          try {
            deleteDoc(doc(db, 'classes', cls.id)).catch(() => {});
          } catch (e) {}
          return false;
        }
        return true;
      });

      try {
        localStorage.setItem('so_cham_diem_school_classes', JSON.stringify(valid));
      } catch (e) {}
      return valid;
    });
    return removedCount;
  };

  const deleteUserAccount = (uid: string) => {
    const nextUsers = userAccounts.filter((acc) => acc.uid !== uid);
    setUserAccounts(nextUsers);

    try {
      localStorage.setItem('so_cham_diem_user_accounts', JSON.stringify(nextUsers));
    } catch (e) {
      console.warn('Storage save note:', e);
    }

    try {
      deleteDoc(doc(db, 'users', uid)).catch((err) => {
        console.warn('Firestore user delete notice:', err);
      });
    } catch (e) {
      console.warn('Error scheduling user delete:', e);
    }

    // Danh sách lớp phải gắn liền với GVCN: Tự động xóa mọi lớp không còn GVCN nào phụ trách
    setSchoolClasses((prevClasses) => {
      const validClasses = prevClasses.filter((cls) => {
        const stillHasTeacher = isClassTiedToTeacher(cls, nextUsers);
        if (!stillHasTeacher) {
          try {
            deleteDoc(doc(db, 'classes', cls.id)).catch(() => {});
          } catch (e) {}
          return false; // Xóa lớp mồ côi này khỏi danh sách lớp!
        }
        return true;
      });

      try {
        localStorage.setItem('so_cham_diem_school_classes', JSON.stringify(validClasses));
      } catch (e) {}
      return validClasses;
    });

    if (activeAccount?.uid === uid) {
      loginAsRole('guest');
    }
  };

  const addUserAccount = (acc: Omit<UserAccount, 'uid' | 'lastLoginAt'>): UserAccount => {
    const newAcc: UserAccount = {
      ...acc,
      uid: `user_${Date.now()}`,
      lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setUserAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  };

  // Initialize from LocalStorage or seed data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.classConfig) {
          setClassConfig({
            ...INITIAL_CLASS_CONFIG,
            ...parsed.classConfig,
            achievementBonusRules: parsed.classConfig.achievementBonusRules || DEFAULT_ACHIEVEMENT_RULES,
          });
        }
        if (parsed.students && Array.isArray(parsed.students)) setStudents(parsed.students);
        if (parsed.behaviorCategories && Array.isArray(parsed.behaviorCategories)) setBehaviorCategories(parsed.behaviorCategories);
        if (parsed.disciplineLogs && Array.isArray(parsed.disciplineLogs)) setDisciplineLogs(parsed.disciplineLogs);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          classConfig,
          students,
          behaviorCategories,
          disciplineLogs,
          lastSaved: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [classConfig, students, behaviorCategories, disciplineLogs]);

  // Handle Firebase Auth & Always Default to Cloud Firestore
  useEffect(() => {
    let isMounted = true;

    const initCloudConnection = async () => {
      try {
        setIsCloudSyncing(true);
        await testFirestoreConnection();
        await ensureFirebaseAuth();

        // 1. Sync / Load Users from Firestore
        const cloudUsers = await getAllUsersFromCloud();
        const effectiveUsers = cloudUsers && cloudUsers.length > 0 ? cloudUsers : userAccounts;
        if (cloudUsers && cloudUsers.length > 0) {
          if (isMounted) setUserAccounts(cloudUsers);
        } else {
          await Promise.all(INITIAL_USER_ACCOUNTS.map((u) => saveUserToCloud(u)));
        }

        // 2. Sync / Load Classes from Firestore (Gắn liền với danh sách GVCN trong mục tài khoản & phân quyền)
        const cloudClasses = await getAllClassesFromCloud();
        if (cloudClasses && cloudClasses.length > 0) {
          const tiedClasses = cloudClasses.filter((c) => isClassTiedToTeacher(c, effectiveUsers));
          const orphaned = cloudClasses.filter((c) => !isClassTiedToTeacher(c, effectiveUsers));
          // Tự động xóa các lớp mồ côi khỏi Firestore
          orphaned.forEach((oc) => deleteClassFromCloud(oc.id));
          if (isMounted) setSchoolClasses(tiedClasses.length > 0 ? tiedClasses : INITIAL_SCHOOL_CLASSES);
        } else {
          await Promise.all(INITIAL_SCHOOL_CLASSES.map((c) => saveClassToCloud(c)));
        }

        // 3. Sync / Load Period Locks from Firestore
        const cloudLocks = await getPeriodLocksFromCloud();
        if (cloudLocks && cloudLocks.length > 0) {
          if (isMounted) setLockedPeriods(cloudLocks);
        } else {
          await Promise.all(INITIAL_LOCKED_PERIODS.map((l) => savePeriodLockToCloud(l)));
        }

        // 4. Sync / Load active teacher's class data from Firestore
        const teacherId = activeAccount?.uid || (auth.currentUser ? auth.currentUser.uid : INITIAL_TEACHER_ID);
        const [cloudConfig, cloudStudents, cloudCats, cloudLogs] = await Promise.all([
          getClassConfigFromCloud(teacherId),
          getStudentsFromCloud(teacherId),
          getBehaviorCategoriesFromCloud(teacherId),
          getDisciplineLogsFromCloud(teacherId),
        ]);

        if (isMounted) {
          if (cloudConfig) {
            setClassConfig(cloudConfig);
          } else {
            const defConfig = { ...INITIAL_CLASS_CONFIG, teacherId };
            await saveClassConfigToCloud(defConfig);
          }

          if (cloudStudents && cloudStudents.length > 0) {
            setStudents(cloudStudents);
          } else {
            await Promise.all(INITIAL_STUDENTS.map((s) => saveStudentToCloud({ ...s, teacherId })));
          }

          if (cloudCats && cloudCats.length > 0) {
            setBehaviorCategories(cloudCats);
          } else {
            await Promise.all(INITIAL_BEHAVIOR_CATEGORIES.map((c) => saveBehaviorCategoryToCloud({ ...c, teacherId })));
          }

          if (cloudLogs && cloudLogs.length > 0) {
            setDisciplineLogs(cloudLogs);
          } else {
            await Promise.all(INITIAL_DISCIPLINE_LOGS.map((l) => saveDisciplineLogToCloud({ ...l, teacherId })));
          }
        }
      } catch (err: any) {
        console.warn('Default Firestore connection notice:', err);
      } finally {
        if (isMounted) {
          setIsCloudSyncing(false);
          setIsLocalMode(false); // ALWAYS default to Cloud Firestore!
        }
      }
    };

    initCloudConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      setIsAuthLoading(false);
      setIsLocalMode(false);
      if (user) {
        await loadUserDataFromFirestore(user.uid);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const isGoogleAuth = !!(
    currentUser &&
    !currentUser.isAnonymous &&
    currentUser.providerData?.some((p) => p.providerId === 'google.com')
  );

  const getEffectiveTeacherId = (): string => {
    return activeAccount?.uid || (currentUser ? currentUser.uid : INITIAL_TEACHER_ID);
  };

  // Load user data from Cloud Firestore
  const loadUserDataFromFirestore = async (userId: string) => {
    setIsCloudSyncing(true);
    setCloudSyncError(null);
    try {
      // Load config
      const configQuery = query(collection(db, 'classConfigs'), where('teacherId', '==', userId));
      const configSnap = await getDocs(configQuery);
      if (!configSnap.empty) {
        setClassConfig(configSnap.docs[0].data() as ClassConfig);
      } else {
        // First time cloud user: save initial config
        const newConfig = { ...INITIAL_CLASS_CONFIG, teacherId: userId };
        await setDoc(doc(db, 'classConfigs', newConfig.id), newConfig);
        setClassConfig(newConfig);
      }

      // Load students
      const studentsQuery = query(collection(db, 'students'), where('teacherId', '==', userId));
      const studentsSnap = await getDocs(studentsQuery);
      if (!studentsSnap.empty) {
        const loadedStudents = studentsSnap.docs.map((d) => d.data() as Student);
        setStudents(loadedStudents);
      } else {
        // Upload initial sample students for the teacher
        const batch = writeBatch(db);
        const mappedStudents = INITIAL_STUDENTS.map((s) => ({ ...s, teacherId: userId }));
        mappedStudents.forEach((s) => {
          batch.set(doc(db, 'students', s.id), s);
        });
        await batch.commit();
        setStudents(mappedStudents);
      }

      // Load categories
      const catQuery = query(collection(db, 'behaviorCategories'), where('teacherId', '==', userId));
      const catSnap = await getDocs(catQuery);
      if (!catSnap.empty) {
        const loadedCats = catSnap.docs.map((d) => d.data() as BehaviorCategory);
        setBehaviorCategories(loadedCats);
      } else {
        const batch = writeBatch(db);
        const mappedCats = INITIAL_BEHAVIOR_CATEGORIES.map((c) => ({ ...c, teacherId: userId }));
        mappedCats.forEach((c) => {
          batch.set(doc(db, 'behaviorCategories', c.id), c);
        });
        await batch.commit();
        setBehaviorCategories(mappedCats);
      }

      // Load logs
      const logQuery = query(collection(db, 'disciplineLogs'), where('teacherId', '==', userId));
      const logSnap = await getDocs(logQuery);
      if (!logSnap.empty) {
        const loadedLogs = logSnap.docs.map((d) => d.data() as DisciplineLog);
        setDisciplineLogs(loadedLogs);
      } else {
        const batch = writeBatch(db);
        const mappedLogs = INITIAL_DISCIPLINE_LOGS.map((l) => ({ ...l, teacherId: userId }));
        mappedLogs.forEach((l) => {
          batch.set(doc(db, 'disciplineLogs', l.id), l);
        });
        await batch.commit();
        setDisciplineLogs(mappedLogs);
      }
    } catch (err: any) {
      console.error('Failed to load data from Firestore:', err);
      setCloudSyncError(err?.message || 'Không thể đồng bộ từ Firestore');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const registerQuickOneTouch = async (params: {
    displayName?: string;
    emailOrUsername?: string;
    className?: string;
    department?: string;
    phone?: string;
  }): Promise<UserAccount> => {
    setIsCloudSyncing(true);
    try {
      await ensureFirebaseAuth();
      const teacherName = params.displayName?.trim() || 'Giáo viên';
      const className = params.className?.trim() || 'Lớp Chủ nhiệm';
      const department = params.department || 'Khoa Chuyên ngành';
      const emailInput = params.emailOrUsername?.trim() || `gv_${Date.now()}@cdnghe01bqp.edu.vn`;
      const isEmail = emailInput.includes('@');
      const username = isEmail ? emailInput.split('@')[0] : emailInput;
      const effectiveEmail = isEmail ? emailInput : `${username.toLowerCase()}@cdnghe01bqp.edu.vn`;

      const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const classId = `cls_${Date.now()}`;

      const newClass: SchoolClass = {
        id: classId,
        className,
        teacherId,
        teacherName,
        teacherEmail: effectiveEmail,
        department,
        schoolYear: '2025 - 2026',
        studentCount: 0,
        averageScore: 10.0,
        topRankCount: 0,
        violationCount: 0,
      };

      const isAdmin = effectiveEmail.toLowerCase() === 'sanginnova8@gmail.com' || effectiveEmail.toLowerCase().includes('admin');
      const newAcc: UserAccount = {
        uid: teacherId,
        email: effectiveEmail,
        username,
        displayName: teacherName,
        role: isAdmin ? 'admin' : 'teacher',
        assignedClassId: classId,
        assignedClassName: `Lớp ${className}`,
        department,
        phone: params.phone || '',
        isActive: true,
        lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      // Save user & class to Firestore Cloud
      await saveUserToCloud(newAcc);
      await saveClassToCloud(newClass);

      // Create class config
      const newConfig: ClassConfig = {
        ...INITIAL_CLASS_CONFIG,
        id: `cfg_${classId}`,
        className,
        homeroomTeacher: teacherName,
        teacherEmail: effectiveEmail,
        teacherPhone: params.phone || '',
        teacherId,
      };
      await saveClassConfigToCloud(newConfig);

      // Save default behavior categories
      const newCats = INITIAL_BEHAVIOR_CATEGORIES.map((c) => ({
        ...c,
        id: `cat_${teacherId}_${c.code}`,
        teacherId,
      }));
      await Promise.all(newCats.map((c) => saveBehaviorCategoryToCloud(c)));

      setUserAccounts((prev) => [...prev, newAcc]);
      setSchoolClasses((prev) => [...prev, newClass]);
      setClassConfig(newConfig);
      setBehaviorCategories(newCats);
      setStudents([]);
      setDisciplineLogs([]);
      setActiveAccount(newAcc);
      setUserRole(newAcc.role);
      setIsLocalMode(false);

      return newAcc;
    } catch (err: any) {
      console.error('One-touch registration error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const login = async () => {
    setIsCloudSyncing(true);
    let user: User | null = null;
    try {
      user = await loginWithGoogle();
    } catch (err: any) {
      setIsCloudSyncing(false);
      console.warn('Google login error detail:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        throw new Error(
          'Tên miền này chưa được cấp phép trong Firebase Console (auth/unauthorized-domain). Quản trị viên vui lòng thêm tên miền này vào mục Authentication > Settings > Authorized domains trên Firebase Console, hoặc thầy cô vui lòng đăng nhập bằng Tên đăng nhập & Mật khẩu.'
        );
      } else if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked')) {
        throw new Error(
          'Trình duyệt đã chặn cửa sổ đăng nhập Google (Pop-up). Thầy cô vui lòng cho phép pop-up trên trình duyệt hoặc đăng nhập bằng Tên đăng nhập & Mật khẩu.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.');
      }
      throw err;
    }

    try {
      let acc = await getUserFromCloud(user.uid);
      if (!acc) {
        acc = userAccounts.find((a) => a.email.toLowerCase() === user.email?.toLowerCase()) || null;
      }
      if (!acc) {
        const teacherId = user.uid;
        const classId = `cls_${Date.now()}`;
        const autoClassName = 'Điện CN K45';
        const newClass: SchoolClass = {
          id: classId,
          className: autoClassName,
          teacherId,
          teacherName: user.displayName || 'Giáo viên',
          teacherEmail: user.email || '',
          department: 'Khoa Chuyên ngành',
          schoolYear: '2025 - 2026',
          studentCount: 0,
          averageScore: 10.0,
          topRankCount: 0,
          violationCount: 0,
        };

        const isAdmin = user.email?.toLowerCase() === 'sanginnova8@gmail.com' || user.email?.toLowerCase().includes('admin');
        acc = {
          uid: teacherId,
          email: user.email || '',
          username: user.email ? user.email.split('@')[0] : 'user',
          displayName: user.displayName || 'Giáo viên',
          role: isAdmin ? 'admin' : 'teacher',
          authProvider: 'google',
          assignedClassId: classId,
          assignedClassName: `Lớp ${autoClassName}`,
          department: 'Khoa Chuyên ngành',
          phone: user.phoneNumber || '',
          isActive: true,
          lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          avatarUrl: user.photoURL || '',
        };

        await saveUserToCloud(acc);
        await saveClassToCloud(newClass);

        const newConfig: ClassConfig = {
          ...INITIAL_CLASS_CONFIG,
          id: `cfg_${classId}`,
          className: autoClassName,
          homeroomTeacher: user.displayName || 'Giáo viên',
          teacherEmail: user.email || '',
          teacherPhone: user.phoneNumber || '',
          teacherId,
        };
        await saveClassConfigToCloud(newConfig);

        setUserAccounts((prev) => [...prev, acc!]);
        setSchoolClasses((prev) => [...prev, newClass]);
        setClassConfig(newConfig);
      } else {
        acc = { ...acc, authProvider: 'google' };
      }

      setActiveAccount(acc);
      setUserRole(acc.role);
      setIsLocalMode(false);
      await loadUserDataFromFirestore(user.uid);
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const registerWithGoogle = async (customClassName?: string, department?: string) => {
    setIsCloudSyncing(true);
    let user: User | null = null;
    try {
      user = await loginWithGoogle();
    } catch (err: any) {
      setIsCloudSyncing(false);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        throw new Error(
          'Tên miền hiện tại chưa được cấp quyền Google OAuth trong Firebase Console (auth/unauthorized-domain). Thầy cô vui lòng sử dụng biểu mẫu Đăng ký bằng Tên đăng nhập & Mật khẩu bên dưới!'
        );
      } else if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked')) {
        throw new Error(
          'Trình duyệt đã chặn cửa sổ đăng nhập Google. Thầy cô vui lòng cho phép pop-up hoặc đăng ký bằng Mật khẩu bên dưới.'
        );
      }
      throw err;
    }

    try {
      const teacherId = user.uid;
      const classId = `cls_${Date.now()}`;
      const className = customClassName?.trim() || 'Lớp Mới K46';

      const newClass: SchoolClass = {
        id: classId,
        className,
        teacherId,
        teacherName: user.displayName || 'Giáo viên',
        teacherEmail: user.email || '',
        department: department || 'Khoa Chuyên ngành',
        schoolYear: '2025 - 2026',
        studentCount: 0,
        averageScore: 10.0,
        topRankCount: 0,
        violationCount: 0,
      };

      const isAdmin = user.email?.toLowerCase() === 'sanginnova8@gmail.com' || user.email?.toLowerCase().includes('admin');
      const newAcc: UserAccount = {
        uid: teacherId,
        email: user.email || '',
        username: user.email ? user.email.split('@')[0] : 'user',
        displayName: user.displayName || 'Giáo viên',
        role: isAdmin ? 'admin' : 'teacher',
        assignedClassId: classId,
        assignedClassName: `Lớp ${className}`,
        department: department || 'Khoa Chuyên ngành',
        phone: user.phoneNumber || '',
        isActive: true,
        lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        avatarUrl: user.photoURL || '',
      };

      await saveUserToCloud(newAcc);
      await saveClassToCloud(newClass);

      const newConfig: ClassConfig = {
        ...INITIAL_CLASS_CONFIG,
        id: `cfg_${classId}`,
        className,
        homeroomTeacher: user.displayName || 'Giáo viên',
        teacherEmail: user.email || '',
        teacherPhone: user.phoneNumber || '',
        teacherId,
      };
      await saveClassConfigToCloud(newConfig);

      setUserAccounts((prev) => [...prev, newAcc]);
      setSchoolClasses((prev) => [...prev, newClass]);
      setClassConfig(newConfig);
      setActiveAccount(newAcc);
      setUserRole(newAcc.role);
      setIsLocalMode(false);
      await loadUserDataFromFirestore(user.uid);
    } catch (err: any) {
      console.error('Google register error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const loginAsGuest = () => {
    setUserRole('guest');
    setActiveAccount(null);
    setInspectorModeClass(null);
  };

  const registerWithEmailPassword = async (params: {
    email: string;
    pass: string;
    name: string;
    className: string;
    department: string;
    phone?: string;
  }) => {
    setIsCloudSyncing(true);
    try {
      await ensureFirebaseAuth();
      const cleanInput = params.email.trim();
      const isEmail = cleanInput.includes('@');
      const username = isEmail ? cleanInput.split('@')[0] : cleanInput;
      const effectiveEmail = isEmail ? cleanInput : `${username.toLowerCase()}@cdnghe01bqp.edu.vn`;

      const existing = userAccounts.find(
        (a) =>
          a.email.toLowerCase() === effectiveEmail.toLowerCase() ||
          (a.username && a.username.toLowerCase() === username.toLowerCase())
      );
      if (existing) {
        throw new Error('Tên đăng nhập hoặc Email này đã được sử dụng. Vui lòng chọn tên khác.');
      }

      let teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        const user = await registerWithEmail(effectiveEmail, params.pass, params.name);
        teacherId = user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth email provider disabled in console, creating account directly in Firestore Cloud:', authErr);
        // Continue creating in Firestore without breaking!
      }

      const classId = `cls_${Date.now()}`;
      const newClass: SchoolClass = {
        id: classId,
        className: params.className,
        teacherId,
        teacherName: params.name,
        teacherEmail: effectiveEmail,
        department: params.department || 'Khoa Chuyên ngành',
        schoolYear: '2025 - 2026',
        studentCount: 0,
        averageScore: 10.0,
        topRankCount: 0,
        violationCount: 0,
      };
      const newAccount: UserAccount = {
        uid: teacherId,
        email: effectiveEmail,
        username,
        displayName: params.name,
        role: effectiveEmail.includes('admin') ? 'admin' : 'teacher',
        assignedClassId: classId,
        assignedClassName: `Lớp ${params.className}`,
        department: params.department,
        phone: params.phone || '',
        password: params.pass,
        isActive: true,
        lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      // Save user & class to Firestore
      await saveUserToCloud(newAccount);
      await saveClassToCloud(newClass);

      // Create fresh class config for this teacher
      const newConfig: ClassConfig = {
        ...INITIAL_CLASS_CONFIG,
        id: `cfg_${classId}`,
        className: params.className,
        homeroomTeacher: params.name,
        teacherEmail: effectiveEmail,
        teacherPhone: params.phone || '',
        teacherId,
      };
      await saveClassConfigToCloud(newConfig);

      // Save default behavior categories for this teacher
      const newCats = INITIAL_BEHAVIOR_CATEGORIES.map((c) => ({
        ...c,
        id: `cat_${teacherId}_${c.code}`,
        teacherId,
      }));
      await Promise.all(newCats.map((c) => saveBehaviorCategoryToCloud(c)));

      setUserAccounts((prev) => [...prev, newAccount]);
      setSchoolClasses((prev) => [...prev, newClass]);
      setClassConfig(newConfig);
      setBehaviorCategories(newCats);
      setStudents([]);
      setDisciplineLogs([]);
      setActiveAccount(newAccount);
      setUserRole(newAccount.role);
      setIsLocalMode(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const loginUserWithEmailPassword = async (loginIdentifier: string, pass: string) => {
    setIsCloudSyncing(true);
    const cleanId = loginIdentifier.trim().toLowerCase();

    // Check master admin credentials: Sanginnova / Baotran2010
    if ((cleanId === 'sanginnova' || cleanId === 'sanginnova8@gmail.com') && pass === 'Baotran2010') {
      const masterAdmin: UserAccount = {
        uid: 'admin_sanginnova',
        email: 'sanginnova8@gmail.com',
        username: 'Sanginnova',
        displayName: 'Thầy Trần Văn Sang',
        role: 'admin',
        assignedClassId: '10A8',
        assignedClassName: 'Lớp 10A8',
        department: 'Khoa Điện - Điện tử',
        phone: '0979.888.999',
        isActive: true,
        lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      setActiveAccount(masterAdmin);
      setUserRole('admin');
      setIsLocalMode(false);
      try {
        await saveUserToCloud(masterAdmin);
      } catch (e) {
        console.warn('Could not sync master admin to cloud:', e);
      }
      setIsCloudSyncing(false);
      return;
    }

    // 1. Check against known accounts in memory or Cloud Firestore
    let matchedAcc = userAccounts.find(
      (a) =>
        (a.username && a.username.toLowerCase() === cleanId) ||
        a.email.toLowerCase() === cleanId ||
        a.email.toLowerCase() === `${cleanId}@cdnghe01bqp.edu.vn`
    );

    if (!matchedAcc) {
      try {
        const cloudUsers = await getAllUsersFromCloud();
        matchedAcc = cloudUsers.find(
          (a) =>
            (a.username && a.username.toLowerCase() === cleanId) ||
            a.email.toLowerCase() === cleanId ||
            a.email.toLowerCase() === `${cleanId}@cdnghe01bqp.edu.vn`
        );
      } catch (e) {
        console.warn('Cloud users lookup note:', e);
      }
    }

    if (matchedAcc) {
      // Check password if stored
      if (matchedAcc.password && matchedAcc.password !== pass) {
        setIsCloudSyncing(false);
        throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      }

      setActiveAccount(matchedAcc);
      setUserRole(matchedAcc.role);
      setIsLocalMode(false);
      await loadUserDataFromFirestore(matchedAcc.uid);
      setIsCloudSyncing(false);
      return;
    }

    // 2. Try Firebase Auth
    try {
      const emailToUse = loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@cdnghe01bqp.edu.vn`;
      const user = await loginWithEmail(emailToUse, pass);
      let acc = await getUserFromCloud(user.uid);
      if (!acc) {
        acc = userAccounts.find((a) => a.email.toLowerCase() === emailToUse.toLowerCase()) || null;
      }
      if (!acc) {
        const isAdmin = emailToUse.toLowerCase().includes('admin') || emailToUse.toLowerCase().includes('sanginnova');
        acc = {
          uid: user.uid,
          email: user.email || emailToUse,
          displayName: user.displayName || (isAdmin ? 'Admin Quản Trị' : 'Giáo viên'),
          role: isAdmin ? 'admin' : 'teacher',
          assignedClassId: '10A8',
          assignedClassName: 'Lớp 10A8',
          department: 'Khoa Đào tạo nghề',
          phone: '',
          isActive: true,
          lastLoginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
        await saveUserToCloud(acc);
      }
      setActiveAccount(acc);
      setUserRole(acc.role);
      setIsLocalMode(false);
      await loadUserDataFromFirestore(user.uid);
    } catch (err: any) {
      console.warn('Direct login fallback note:', err);
      throw new Error('Tài khoản hoặc mật khẩu không chính xác. Thầy cô vui lòng kiểm tra lại.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setUserRole('guest');
      setActiveAccount(null);
      setInspectorModeClass(null);
      setIsLocalMode(true);
      try {
        localStorage.removeItem('so_cham_diem_active_uid');
        localStorage.setItem('so_cham_diem_user_role', 'guest');
      } catch (e) {}
    }
  };

  // Sync current in-memory local data up to Firestore
  const syncLocalToCloud = async () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập Google trước để đồng bộ dữ liệu lên Cloud Firestore!');
      return;
    }
    setIsCloudSyncing(true);
    setCloudSyncError(null);
    try {
      const teacherId = currentUser.uid;
      const batch = writeBatch(db);

      // Save class config
      const updatedConfig = { ...classConfig, teacherId, updatedAt: new Date().toISOString() };
      batch.set(doc(db, 'classConfigs', updatedConfig.id), updatedConfig);

      // Save students
      students.forEach((s) => {
        batch.set(doc(db, 'students', s.id), { ...s, teacherId });
      });

      // Save categories
      behaviorCategories.forEach((c) => {
        batch.set(doc(db, 'behaviorCategories', c.id), { ...c, teacherId });
      });

      // Save logs
      disciplineLogs.forEach((l) => {
        batch.set(doc(db, 'disciplineLogs', l.id), { ...l, teacherId });
      });

      await batch.commit();
      alert('Đã đồng bộ toàn bộ dữ liệu lên Cloud Firestore an toàn!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'syncLocalToCloud');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Update Class Config
  const updateClassConfig = async (updates: Partial<ClassConfig>) => {
    const updated = {
      ...classConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setClassConfig(updated);
    try {
      await saveClassConfigToCloud(updated);
    } catch (err) {
      console.warn('Auto cloud sync config notice:', err);
    }
  };

  // Add Student
  const addStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId'>): Promise<Student> => {
    const teacherId = getEffectiveTeacherId();
    const newStudent: Student = {
      ...data,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      teacherId,
      classId: classConfig.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);
    try {
      await saveStudentToCloud(newStudent);
    } catch (err) {
      console.warn('Auto cloud sync student notice:', err);
    }
    return newStudent;
  };

  // Update Student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    let updatedStudent: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        updatedStudent = {
          ...s,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedStudent;
      })
    );

    if (updatedStudent) {
      try {
        await saveStudentToCloud(updatedStudent);
      } catch (err) {
        console.warn('Auto cloud sync update student notice:', err);
      }
    }
  };

  // Delete single student
  const deleteStudent = async (id: string, deleteRelatedLogs: boolean = true) => {
    await deleteStudentsBatch([id], deleteRelatedLogs);
  };

  // Delete multiple students batch
  const deleteStudentsBatch = async (
    ids: string[],
    deleteRelatedLogs: boolean = true
  ): Promise<{ count: number }> => {
    if (!ids || ids.length === 0) return { count: 0 };
    const idSet = new Set(ids);

    // Update students state
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));

    // Optionally remove related logs
    let logsToRemove: string[] = [];
    if (deleteRelatedLogs) {
      logsToRemove = disciplineLogs.filter((l) => idSet.has(l.studentId)).map((l) => l.id);
      if (logsToRemove.length > 0) {
        const logIdSet = new Set(logsToRemove);
        setDisciplineLogs((prev) => prev.filter((l) => !logIdSet.has(l.id)));
      }
    }

    // Always delete from Firestore Cloud
    try {
      await Promise.all([
        ...ids.map((sid) => deleteStudentFromCloud(sid)),
        ...logsToRemove.map((lid) => deleteDisciplineLogFromCloud(lid)),
      ]);
    } catch (err) {
      console.warn('Auto cloud delete notice:', err);
    }

    return { count: ids.length };
  };

  // Toggle active/inactive student
  const toggleStudentStatus = async (id: string) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    await updateStudent(id, { status: newStatus });
  };

  // Batch import students
  const importStudentsBatch = async (
    newStudents: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId'>>
  ): Promise<{ imported: number; updated: number }> => {
    const teacherId = getEffectiveTeacherId();
    let imported = 0;
    let updated = 0;

    const currentMap = new Map(students.map((s) => [s.studentCode.trim().toUpperCase(), s]));
    const updatedList = [...students];

    for (const item of newStudents) {
      const codeKey = item.studentCode.trim().toUpperCase();
      if (currentMap.has(codeKey)) {
        // Update existing by studentCode
        const existing = currentMap.get(codeKey)!;
        const idx = updatedList.findIndex((s) => s.id === existing.id);
        if (idx !== -1) {
          updatedList[idx] = {
            ...updatedList[idx],
            ...item,
            updatedAt: new Date().toISOString(),
          };
          updated++;
        }
      } else {
        // Add new
        const newStud: Student = {
          ...item,
          id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          teacherId,
          classId: classConfig.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedList.push(newStud);
        imported++;
      }
    }

    setStudents(updatedList);

    if (currentUser) {
      try {
        const batch = writeBatch(db);
        updatedList.forEach((s) => {
          batch.set(doc(db, 'students', s.id), s);
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'students_batch');
      }
    }

    return { imported, updated };
  };

  // Add Category
  const addBehaviorCategory = async (
    cat: Omit<BehaviorCategory, 'id' | 'createdAt' | 'updatedAt' | 'teacherId'>
  ): Promise<BehaviorCategory> => {
    const teacherId = getEffectiveTeacherId();
    const newCat: BehaviorCategory = {
      ...cat,
      id: `cat_${cat.code.toUpperCase()}_${Date.now()}`,
      teacherId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBehaviorCategories((prev) => [...prev, newCat]);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'behaviorCategories', newCat.id), newCat);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `behaviorCategories/${newCat.id}`);
      }
    }
    return newCat;
  };

  // Update Category
  const updateBehaviorCategory = async (id: string, updates: Partial<BehaviorCategory>) => {
    setBehaviorCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (currentUser) {
      const existing = behaviorCategories.find((c) => c.id === id);
      if (existing) {
        try {
          await setDoc(doc(db, 'behaviorCategories', id), { ...existing, ...updates, updatedAt: new Date().toISOString() });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `behaviorCategories/${id}`);
        }
      }
    }
  };

  // Toggle active category
  const toggleBehaviorCategoryActive = async (id: string) => {
    const cat = behaviorCategories.find((c) => c.id === id);
    if (!cat) return;
    await updateBehaviorCategory(id, { isActive: !cat.isActive });
  };

  // Delete category: check if used in logs
  const deleteBehaviorCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const cat = behaviorCategories.find((c) => c.id === id);
    if (!cat) return { success: false, message: 'Không tìm thấy danh mục' };

    // Check if category is used in any discipline log
    const isUsed = disciplineLogs.some((l) => l.behaviorCode.toUpperCase() === cat.code.toUpperCase());
    if (isUsed) {
      return {
        success: false,
        message: `Mã danh mục "${cat.code}" đã được sử dụng trong các bản ghi nhật ký. Để bảo vệ tính toàn vẹn của lịch sử, bạn chỉ có thể [Vô hiệu hóa] danh mục này thay vì xóa.`,
      };
    }

    setBehaviorCategories((prev) => prev.filter((c) => c.id !== id));

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'behaviorCategories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `behaviorCategories/${id}`);
      }
    }
    return { success: true };
  };

  // Reset Behavior Categories to standard defaults (Thông tư Bộ GD&ĐT)
  const resetBehaviorCategoriesToDefault = async () => {
    setBehaviorCategories(INITIAL_BEHAVIOR_CATEGORIES);
    if (currentUser) {
      try {
        const batch = writeBatch(db);
        INITIAL_BEHAVIOR_CATEGORIES.forEach((c) => {
          batch.set(doc(db, 'behaviorCategories', c.id), c);
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'behaviorCategories_reset');
      }
    }
  };

  // ACHIEVEMENT BONUS RULES MUTATORS
  const updateAchievementRule = async (id: string, updates: Partial<AchievementBonusRule>) => {
    const currentRules = classConfig.achievementBonusRules || DEFAULT_ACHIEVEMENT_RULES;
    const updatedRules = currentRules.map((r) => (r.id === id ? { ...r, ...updates } : r));
    await updateClassConfig({ achievementBonusRules: updatedRules });
  };

  const addAchievementRule = async (rule: Omit<AchievementBonusRule, 'id'>): Promise<AchievementBonusRule> => {
    const currentRules = classConfig.achievementBonusRules || DEFAULT_ACHIEVEMENT_RULES;
    const newRule: AchievementBonusRule = {
      ...rule,
      id: `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };
    const updatedRules = [...currentRules, newRule];
    await updateClassConfig({ achievementBonusRules: updatedRules });
    return newRule;
  };

  const deleteAchievementRule = async (id: string) => {
    const currentRules = classConfig.achievementBonusRules || DEFAULT_ACHIEVEMENT_RULES;
    const updatedRules = currentRules.filter((r) => r.id !== id);
    await updateClassConfig({ achievementBonusRules: updatedRules });
  };

  const resetAchievementRulesToDefault = async () => {
    await updateClassConfig({ achievementBonusRules: DEFAULT_ACHIEVEMENT_RULES });
  };

  // Award Achievement Bonus (Điểm thưởng tuần / tháng khi có thành tích)
  const awardAchievementBonus = async (params: {
    studentId: string;
    rule?: AchievementBonusRule;
    weekNumber?: number;
    month?: number;
    customScore?: number;
    customNote?: string;
  }): Promise<{ log: DisciplineLog; alreadyAwarded?: boolean }> => {
    const student = students.find((s) => s.id === params.studentId);
    if (!student) throw new Error('Không tìm thấy thông tin học sinh');

    const effectiveScore = params.customScore !== undefined ? params.customScore : (params.rule?.bonusScore ?? 2.0);
    const targetWeek = params.weekNumber || 1;
    const targetMonth = params.month || (classConfig.weeks.find((w) => w.weekNumber === targetWeek)?.month || 9);
    const isWeekly = params.weekNumber !== undefined || params.rule?.period === 'weekly';
    const periodType = isWeekly ? 'weekly' : 'monthly';

    // Check if already awarded this achievement rule in this week/month (only when rule is provided)
    if (params.rule) {
      const existingLog = disciplineLogs.find(
        (l) =>
          l.studentId === params.studentId &&
          l.behaviorCode === params.rule!.code &&
          (params.rule!.period === 'weekly' ? l.weekNumber === targetWeek : l.month === targetMonth)
      );

      if (existingLog) {
        return { log: existingLog, alreadyAwarded: true };
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const ruleCode = params.rule?.code || `TT_CUSTOM_${Date.now()}`;
    const defaultTitle = isWeekly ? `Khen thưởng tuần ${targetWeek}` : `Khen thưởng tháng ${targetMonth}`;
    const displayTitle = params.rule?.title || params.customNote?.trim() || defaultTitle;

    const logRes = await addDisciplineLog({
      date: todayStr,
      month: targetMonth,
      weekNumber: targetWeek,
      studentId: student.id,
      studentCode: student.studentCode,
      studentName: student.fullName,
      behaviorCode: ruleCode,
      behaviorDescription: `[Thành tích ${periodType === 'weekly' ? 'tuần' : 'tháng'}] ${displayTitle}`,
      type: 'bonus',
      scorePerUnit: effectiveScore,
      count: 1,
      periodOrTime: periodType === 'weekly' ? `Tổng kết Tuần ${targetWeek}` : `Tổng kết Tháng ${targetMonth}`,
      reporter: classConfig.homeroomTeacher || 'GVCN',
      basisOrRegulation: params.rule?.description || 'Khen thưởng thành tích theo đề xuất của GVCN',
      note: params.customNote || (params.rule?.isAutoEligible ? 'Đạt tiêu chuẩn thi đua tự động' : 'Tuyên dương khen thưởng thành tích'),
    });

    return { log: logRes.log, alreadyAwarded: false };
  };

  // Batch Award Achievement Bonus
  const batchAwardAchievementBonus = async (params: {
    studentIds: string[];
    rule: AchievementBonusRule;
    weekNumber?: number;
    month?: number;
    customScore?: number;
    customNote?: string;
  }): Promise<{ awardedCount: number; skippedCount: number }> => {
    let awardedCount = 0;
    let skippedCount = 0;

    for (const sId of params.studentIds) {
      const res = await awardAchievementBonus({
        studentId: sId,
        rule: params.rule,
        weekNumber: params.weekNumber,
        month: params.month,
        customScore: params.customScore,
        customNote: params.customNote,
      });
      if (res.alreadyAwarded) {
        skippedCount++;
      } else {
        awardedCount++;
      }
    }

    return { awardedCount, skippedCount };
  };

  // Revoke Achievement Bonus
  const revokeAchievementBonus = async (logId: string) => {
    await deleteDisciplineLog(logId, classConfig.homeroomTeacher || 'GVCN');
  };

  // Add Discipline Log
  const addDisciplineLog = async (
    logData: Omit<DisciplineLog, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId' | 'totalScore'>
  ): Promise<{ log: DisciplineLog; duplicateWarning?: boolean }> => {
    const teacherId = getEffectiveTeacherId();

    // Check potential duplicate (same student, same date, same behaviorCode, and period if filled)
    const isDuplicate = disciplineLogs.some(
      (l) =>
        l.studentId === logData.studentId &&
        l.date === logData.date &&
        l.behaviorCode.toUpperCase() === logData.behaviorCode.toUpperCase() &&
        (logData.periodOrTime ? l.periodOrTime === logData.periodOrTime : true)
    );

    const newLog: DisciplineLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      totalScore: Math.round(logData.scorePerUnit * logData.count * 100) / 100,
      teacherId,
      classId: classConfig.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          editorName: logData.reporter || classConfig.homeroomTeacher || 'Giáo viên',
          action: 'create',
          newValue: `Tạo mới: ${logData.behaviorCode} - ${logData.behaviorDescription} (${logData.count} lần, ${logData.scorePerUnit}đ)`,
        },
      ],
    };

    setDisciplineLogs((prev) => [newLog, ...prev]);

    try {
      await saveDisciplineLogToCloud(newLog);
    } catch (err) {
      console.warn('Auto cloud sync discipline log notice:', err);
    }

    return { log: newLog, duplicateWarning: isDuplicate };
  };

  // Update Discipline Log with edit history
  const updateDisciplineLog = async (id: string, updates: Partial<DisciplineLog>, editorName: string) => {
    const target = disciplineLogs.find((l) => l.id === id);
    if (!target) return;

    const previousDesc = `${target.behaviorCode} - ${target.behaviorDescription} (${target.count} lần, ${target.scorePerUnit}đ, tổng: ${target.totalScore}đ)`;
    const newCount = updates.count ?? target.count;
    const newScorePerUnit = updates.scorePerUnit ?? target.scorePerUnit;
    const calculatedTotalScore = Math.round(newCount * newScorePerUnit * 100) / 100;

    const historyEntry: EditHistoryEntry = {
      timestamp: new Date().toISOString(),
      editorName: editorName || classConfig.homeroomTeacher || 'Giáo viên',
      action: 'update',
      previousValue: previousDesc,
      newValue: `Cập nhật: ${updates.behaviorCode ?? target.behaviorCode} - ${updates.behaviorDescription ?? target.behaviorDescription} (${newCount} lần, ${newScorePerUnit}đ, tổng: ${calculatedTotalScore}đ)`,
    };

    const updatedLog: DisciplineLog = {
      ...target,
      ...updates,
      totalScore: calculatedTotalScore,
      updatedAt: new Date().toISOString(),
      history: [...(target.history || []), historyEntry],
    };

    setDisciplineLogs((prev) => prev.map((l) => (l.id === id ? updatedLog : l)));

    try {
      await saveDisciplineLogToCloud(updatedLog);
    } catch (err) {
      console.warn('Auto cloud sync update log notice:', err);
    }
  };

  // Delete Discipline Log
  const deleteDisciplineLog = async (id: string, editorName: string) => {
    setDisciplineLogs((prev) => prev.filter((l) => l.id !== id));

    try {
      await deleteDisciplineLogFromCloud(id);
    } catch (err) {
      console.warn('Auto cloud delete log notice:', err);
    }
  };

  // Batch import discipline logs (Nhật ký lỗi / nề nếp)
  const importDisciplineLogsBatch = async (
    newLogs: Array<Omit<DisciplineLog, 'id' | 'createdAt' | 'updatedAt' | 'teacherId' | 'classId' | 'totalScore'>>
  ): Promise<{ imported: number }> => {
    if (!newLogs || newLogs.length === 0) return { imported: 0 };
    const teacherId = getEffectiveTeacherId();
    const nowIso = new Date().toISOString();

    const createdLogs: DisciplineLog[] = newLogs.map((item, idx) => ({
      ...item,
      id: `log_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      totalScore: Math.round(item.scorePerUnit * item.count * 100) / 100,
      teacherId,
      classId: classConfig.id,
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [
        {
          timestamp: nowIso,
          editorName: item.reporter || classConfig.homeroomTeacher || 'Giáo viên',
          action: 'create',
          newValue: `Tải lên từ file Excel/CSV: ${item.behaviorCode} - ${item.behaviorDescription} (${item.count} lần, ${item.scorePerUnit}đ)`,
        },
      ],
    }));

    setDisciplineLogs((prev) => [...createdLogs, ...prev]);

    if (currentUser) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < createdLogs.length; i += chunkSize) {
          const chunk = createdLogs.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach((l) => {
            batch.set(doc(db, 'disciplineLogs', l.id), l);
          });
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'disciplineLogs_batch');
      }
    }

    return { imported: createdLogs.length };
  };

  // CALCULATION LOGIC: Weekly Summary
  // Rule: Điểm tuần = clamp (0 - 10) của (10 - tổng điểm trừ + tổng điểm cộng)
  const getWeeklySummary = (weekNumber: number, month?: number): StudentWeeklySummary[] => {
    // Filter logs for this week
    const weekLogs = disciplineLogs.filter((l) => {
      if (l.weekNumber !== weekNumber) return false;
      if (month !== undefined && l.month !== month) return false;
      return true;
    });

    return students.map((s) => {
      const studentLogs = weekLogs.filter((l) => l.studentId === s.id);
      let violationCount = 0;
      let bonusCount = 0;
      let totalDeduct = 0;
      let totalBonus = 0;

      studentLogs.forEach((log) => {
        if (log.type === 'deduct') {
          violationCount += log.count;
          totalDeduct += log.totalScore;
        } else {
          bonusCount += log.count;
          totalBonus += log.totalScore;
        }
      });

      totalDeduct = Math.round(totalDeduct * 100) / 100;
      totalBonus = Math.round(totalBonus * 100) / 100;

      const achievementLogs = studentLogs.filter(
        (l) => l.type === 'bonus' && (l.behaviorCode.startsWith('TT_') || l.behaviorDescription.includes('[Thành tích'))
      );
      const achievementBonus = Math.round(achievementLogs.reduce((acc, curr) => acc + curr.totalScore, 0) * 100) / 100;
      const achievementCount = achievementLogs.length;
      const achievements = achievementLogs.map((l) => l.behaviorDescription.replace('[Thành tích tuần] ', '').replace('[Thành tích tháng] ', ''));

      const rawScore = classConfig.baseScore - totalDeduct + totalBonus;
      const finalScore = clampScore(rawScore, classConfig.minScore, classConfig.maxScore);
      const rank = calculateRank(finalScore);

      let notes = '';
      if (achievementCount > 0) {
        notes = `🏆 Nhận thưởng ${achievementCount} thành tích (+${achievementBonus}đ)`;
        if (violationCount > 0) notes += `, ${violationCount} lỗi (-${totalDeduct}đ)`;
      } else if (violationCount > 0 && totalBonus > 0) {
        notes = `${violationCount} lỗi (-${totalDeduct}đ), ${bonusCount} việc tốt (+${totalBonus}đ)`;
      } else if (violationCount > 0) {
        notes = `${violationCount} lượt vi phạm (-${totalDeduct}đ)`;
      } else if (bonusCount > 0) {
        notes = `${bonusCount} khen thưởng (+${totalBonus}đ)`;
      } else {
        notes = 'Nề nếp tốt, duy trì trọn vẹn điểm nền';
      }

      return {
        studentId: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        dateOfBirth: s.dateOfBirth,
        status: s.status,
        violationCount,
        bonusCount,
        totalDeduct,
        totalBonus,
        achievementBonus,
        achievementCount,
        achievements,
        finalScore,
        rank,
        notes,
      };
    });
  };

  // CALCULATION LOGIC: Monthly Summary
  // Rule: Điểm tháng = clamp (0 - 10) của (10 - tổng điểm trừ tháng + tổng điểm cộng tháng)
  const getMonthlySummary = (month: number): StudentMonthlySummary[] => {
    const monthLogs = disciplineLogs.filter((l) => l.month === month);

    return students.map((s) => {
      const studentLogs = monthLogs.filter((l) => l.studentId === s.id);
      const weekDeductions: Record<number, number> = {};
      let totalDeduct = 0;
      let totalBonus = 0;
      let violationCount = 0;
      let bonusCount = 0;

      studentLogs.forEach((log) => {
        if (log.type === 'deduct') {
          violationCount += log.count;
          totalDeduct += log.totalScore;
          weekDeductions[log.weekNumber] = (weekDeductions[log.weekNumber] || 0) + log.totalScore;
        } else {
          bonusCount += log.count;
          totalBonus += log.totalScore;
        }
      });

      totalDeduct = Math.round(totalDeduct * 100) / 100;
      totalBonus = Math.round(totalBonus * 100) / 100;

      const achievementLogs = studentLogs.filter(
        (l) => l.type === 'bonus' && (l.behaviorCode.startsWith('TT_') || l.behaviorDescription.includes('[Thành tích'))
      );
      const achievementBonus = Math.round(achievementLogs.reduce((acc, curr) => acc + curr.totalScore, 0) * 100) / 100;
      const achievementCount = achievementLogs.length;
      const achievements = achievementLogs.map((l) => l.behaviorDescription.replace('[Thành tích tuần] ', '').replace('[Thành tích tháng] ', ''));

      const rawScore = classConfig.baseScore - totalDeduct + totalBonus;
      const finalScore = clampScore(rawScore, classConfig.minScore, classConfig.maxScore);
      const rank = calculateRank(finalScore);

      let notes = '';
      if (achievementCount > 0) {
        notes = `🏆 Nhận thưởng ${achievementCount} thành tích tháng (+${achievementBonus}đ)`;
        if (violationCount > 0) notes += `, ${violationCount} lỗi (-${totalDeduct}đ)`;
      } else if (violationCount === 0 && totalBonus === 0) {
        notes = 'Ý thức nề nếp tháng gương mẫu';
      } else if (violationCount > 2) {
        notes = `Vi phạm lặp lại (${violationCount} lần), cần giáo viên theo dõi sát`;
      } else if (finalScore >= 9) {
        notes = 'Đạt kết quả thi đua xuất sắc';
      } else if (finalScore < 5) {
        notes = 'Cần liên hệ phụ huynh phối hợp rèn luyện';
      } else {
        notes = 'Đạt yêu cầu rèn luyện nề nếp';
      }

      return {
        studentId: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        status: s.status,
        weekDeductions,
        totalDeduct,
        totalBonus,
        achievementBonus,
        achievementCount,
        achievements,
        finalScore,
        rank,
        violationCount,
        bonusCount,
        notes,
      };
    });
  };

  // CALCULATION LOGIC: Semester Summary
  const getSemesterSummary = (semester: 1 | 2): StudentSemesterSummary[] => {
    const targetMonths = semester === 1 ? classConfig.semester1Months : classConfig.semester2Months;

    return students.map((s) => {
      const monthlyScores: Record<number, number | null> = {};
      let scoreSum = 0;
      let monthsWithScoreCount = 0;
      let totalViolations = 0;
      let totalDeduct = 0;
      let totalBonus = 0;

      targetMonths.forEach((m) => {
        const monthLogs = disciplineLogs.filter((l) => l.studentId === s.id && l.month === m);
        let mDeduct = 0;
        let mBonus = 0;
        monthLogs.forEach((l) => {
          if (l.type === 'deduct') {
            mDeduct += l.totalScore;
            totalViolations += l.count;
          } else {
            mBonus += l.totalScore;
          }
        });

        totalDeduct += mDeduct;
        totalBonus += mBonus;

        // If there are records in the system for this month
        const hasLogsInMonth = disciplineLogs.some((l) => l.month === m);
        if (hasLogsInMonth) {
          const rawMScore = classConfig.baseScore - mDeduct + mBonus;
          const clamped = clampScore(rawMScore, classConfig.minScore, classConfig.maxScore);
          monthlyScores[m] = clamped;
          scoreSum += clamped;
          monthsWithScoreCount++;
        } else {
          monthlyScores[m] = null;
        }
      });

      const averageScore = monthsWithScoreCount > 0 ? clampScore(scoreSum / monthsWithScoreCount) : classConfig.baseScore;
      const finalRank = calculateRank(averageScore);

      return {
        studentId: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        status: s.status,
        monthlyScores,
        averageScore,
        finalRank,
        totalViolations,
        totalDeduct: Math.round(totalDeduct * 100) / 100,
        totalBonus: Math.round(totalBonus * 100) / 100,
      };
    });
  };

  // Get logs for specific student
  const getStudentLogs = (studentId: string): DisciplineLog[] => {
    return disciplineLogs.filter((l) => l.studentId === studentId);
  };

  // Export full backup JSON
  const exportFullBackupJson = (): string => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classConfig,
      students,
      behaviorCategories,
      disciplineLogs,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  // Restore from JSON
  const restoreFromJson = async (
    jsonStr: string
  ): Promise<{ success: boolean; message: string; studentCount?: number; logCount?: number }> => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.students || !Array.isArray(data.students)) {
        return { success: false, message: 'Tệp JSON thiếu trường "students" hoặc không đúng định dạng.' };
      }
      if (!data.disciplineLogs || !Array.isArray(data.disciplineLogs)) {
        return { success: false, message: 'Tệp JSON thiếu trường "disciplineLogs" hoặc không đúng định dạng.' };
      }

      if (data.classConfig) setClassConfig(data.classConfig);
      if (data.behaviorCategories && Array.isArray(data.behaviorCategories)) {
        setBehaviorCategories(data.behaviorCategories);
      }
      setStudents(data.students);
      setDisciplineLogs(data.disciplineLogs);

      if (currentUser) {
        // Also sync up to Cloud Firestore
        const teacherId = currentUser.uid;
        const batch = writeBatch(db);
        if (data.classConfig) {
          batch.set(doc(db, 'classConfigs', data.classConfig.id), { ...data.classConfig, teacherId });
        }
        data.students.forEach((s: Student) => {
          batch.set(doc(db, 'students', s.id), { ...s, teacherId });
        });
        (data.behaviorCategories || []).forEach((c: BehaviorCategory) => {
          batch.set(doc(db, 'behaviorCategories', c.id), { ...c, teacherId });
        });
        data.disciplineLogs.forEach((l: DisciplineLog) => {
          batch.set(doc(db, 'disciplineLogs', l.id), { ...l, teacherId });
        });
        await batch.commit();
      }

      return {
        success: true,
        message: 'Khôi phục dữ liệu thành công!',
        studentCount: data.students.length,
        logCount: data.disciplineLogs.length,
      };
    } catch (e: any) {
      return { success: false, message: 'Lỗi đọc tệp JSON: ' + (e.message || String(e)) };
    }
  };

  // Reset to initial sample data
  const resetToSampleData = async () => {
    setClassConfig(INITIAL_CLASS_CONFIG);
    setStudents(INITIAL_STUDENTS);
    setBehaviorCategories(INITIAL_BEHAVIOR_CATEGORIES);
    setDisciplineLogs(INITIAL_DISCIPLINE_LOGS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        isLocalMode,
        setLocalMode: setIsLocalMode,
        isCloudSyncing,
        cloudSyncError,
        isGoogleAuth,
        login,
        registerWithGoogle,
        registerQuickOneTouch,
        loginAsGuest,
        registerWithEmailPassword,
        loginUserWithEmailPassword,
        logout,
        syncLocalToCloud,

        // RBAC
        userRole,
        activeAccount,
        userAccounts,
        schoolClasses,
        lockedPeriods,
        inspectorModeClass,
        isPeriodLocked,
        loginAsRole,
        switchAccount,
        enterInspectorMode,
        exitInspectorMode,
        switchWorkingClass,
        toggleLockPeriod,
        updateUserAccount,
        resetUserPassword,
        toggleUserAccountStatus,
        deleteUserAccount,
        addUserAccount,
        deleteSchoolClass,
        purgeOrphanedClasses,
        addSchoolClass,

        classConfig,
        students,
        behaviorCategories,
        disciplineLogs,

        updateClassConfig,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteStudentsBatch,
        toggleStudentStatus,
        importStudentsBatch,

        addBehaviorCategory,
        updateBehaviorCategory,
        toggleBehaviorCategoryActive,
        deleteBehaviorCategory,
        resetBehaviorCategoriesToDefault,

        updateAchievementRule,
        addAchievementRule,
        deleteAchievementRule,
        resetAchievementRulesToDefault,
        awardAchievementBonus,
        batchAwardAchievementBonus,
        revokeAchievementBonus,

        addDisciplineLog,
        updateDisciplineLog,
        deleteDisciplineLog,
        importDisciplineLogsBatch,

        getWeeklySummary,
        getMonthlySummary,
        getSemesterSummary,
        getStudentLogs,

        exportFullBackupJson,
        restoreFromJson,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
