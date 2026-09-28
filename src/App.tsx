import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DailyLogView } from './components/DailyLogView';
import { WeeklySummaryView } from './components/WeeklySummaryView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { SemesterView } from './components/SemesterView';
import { StudentsView } from './components/StudentsView';
import { BehaviorCatalogView } from './components/BehaviorCatalogView';
import { ParentReportView } from './components/ParentReportView';
import { ZaloMessageComposerView } from './components/ZaloMessageComposerView';
import { SettingsBackupView } from './components/SettingsBackupView';
import { EditClassTeacherModal } from './components/EditClassTeacherModal';
import { PublicPortalView } from './components/PublicPortalView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { InspectorBanner } from './components/InspectorBanner';
import { LoginModal } from './components/LoginModal';

function MainApp() {
  const { classConfig, userRole, inspectorModeClass } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return userRole === 'guest' ? 'portal' : 'dashboard';
  });
  const [isNewLogModalOpen, setIsNewLogModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [reportStudentId, setReportStudentId] = useState<string | null>(null);

  // Sync tab with role transitions
  useEffect(() => {
    if (userRole === 'guest') {
      setActiveTab('portal');
    } else if (activeTab === 'portal') {
      setActiveTab('dashboard');
    }
  }, [userRole]);

  // Prevent teacher from accessing admin panel
  useEffect(() => {
    if (userRole === 'teacher' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  }, [userRole, activeTab]);

  const handleSelectStudentForReport = (studentId: string) => {
    setReportStudentId(studentId);
    setActiveTab('parent-report');
  };

  const handleSelectStudentForZalo = (studentId: string) => {
    setReportStudentId(studentId);
    setActiveTab('zalo-composer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Inspector Banner for Administrator */}
      <InspectorBanner onNavigateTab={setActiveTab} />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLogModal={() => setIsNewLogModalOpen(true)}
        onOpenEditClassTeacherModal={() => setIsEditClassModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Level 1: Public Guest Portal */}
        {(userRole === 'guest' || activeTab === 'portal') && (
          <PublicPortalView onOpenLoginModal={() => setIsLoginModalOpen(true)} />
        )}

        {/* Level 2 & 3: Professional Views */}
        {userRole !== 'guest' && activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onSelectStudentForReport={handleSelectStudentForReport}
            onOpenNewLogModal={() => setIsNewLogModalOpen(true)}
            onOpenEditClassTeacherModal={() => setIsEditClassModalOpen(true)}
          />
        )}

        {userRole !== 'guest' && activeTab === 'daily-log' && (
          <DailyLogView
            isModalOpen={isNewLogModalOpen}
            onCloseModal={() => setIsNewLogModalOpen(false)}
            onOpenModal={() => setIsNewLogModalOpen(true)}
          />
        )}

        {userRole !== 'guest' && activeTab === 'weekly' && (
          <WeeklySummaryView
            onNavigateTab={setActiveTab}
            onSelectStudentForReport={handleSelectStudentForReport}
          />
        )}

        {userRole !== 'guest' && activeTab === 'monthly' && (
          <MonthlySummaryView
            onNavigateTab={setActiveTab}
            onSelectStudentForReport={handleSelectStudentForReport}
          />
        )}

        {userRole !== 'guest' && activeTab === 'semester' && (
          <SemesterView
            onNavigateTab={setActiveTab}
            onSelectStudentForReport={handleSelectStudentForReport}
          />
        )}

        {userRole !== 'guest' && activeTab === 'students' && (
          <StudentsView
            onNavigateTab={setActiveTab}
            onSelectStudentForReport={handleSelectStudentForReport}
          />
        )}

        {userRole !== 'guest' && activeTab === 'categories' && <BehaviorCatalogView />}

        {userRole !== 'guest' && activeTab === 'parent-report' && (
          <ParentReportView initialSelectedStudentId={reportStudentId} />
        )}

        {userRole !== 'guest' && activeTab === 'zalo-composer' && (
          <ZaloMessageComposerView
            initialStudentId={reportStudentId}
            onNavigateTab={setActiveTab}
          />
        )}

        {userRole !== 'guest' && activeTab === 'settings' && <SettingsBackupView />}

        {/* Level 3: Admin Dashboard View */}
        {userRole === 'admin' && activeTab === 'admin' && (
          <AdminDashboardView onNavigateTab={setActiveTab} />
        )}

        {/* Global modal support for DailyLogView if opened from other tabs */}
        {userRole !== 'guest' && activeTab !== 'daily-log' && isNewLogModalOpen && (
          <DailyLogView
            isModalOpen={isNewLogModalOpen}
            onCloseModal={() => setIsNewLogModalOpen(false)}
            onOpenModal={() => setIsNewLogModalOpen(true)}
          />
        )}

        {/* Global Modal for Teacher and Class Settings */}
        <EditClassTeacherModal
          isOpen={isEditClassModalOpen}
          onClose={() => setIsEditClassModalOpen(false)}
        />

        {/* Global RBAC Login & Role Switcher Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sổ Chấm Điểm Hàng Ngày • Lớp {classConfig.className} • {classConfig.schoolName ? `${classConfig.schoolName} • ` : ''}Niên khóa {classConfig.schoolYear} • GVCN: {classConfig.homeroomTeacher}
          </span>
          <span className="text-slate-400">
            Hệ thống hỗ trợ nề nếp & thi đua chuẩn hóa dành cho trường học
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
