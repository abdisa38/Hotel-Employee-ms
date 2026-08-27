import React, { useState, useEffect } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ShiftsPage from './pages/ShiftsPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import QuickPunchModal from './components/dashboard/QuickPunchModal';
import { getEmployees } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickPunchOpen, setIsQuickPunchOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [punchRefreshKey, setPunchRefreshKey] = useState(0);

  const loadStaffList = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  const handlePunchSuccess = () => {
    loadStaffList();
    // Trigger immediate reload across Dashboard and Attendance tables
    setPunchRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onQuickPunchClick={() => setIsQuickPunchOpen(true)}
          onAddEmployeeClick={() => {
            setActiveTab('employees');
            setIsAddEmployeeOpen(true);
          }}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              refreshTrigger={punchRefreshKey}
              onQuickPunchClick={() => setIsQuickPunchOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesPage
              isAddModalOpen={isAddEmployeeOpen}
              setIsAddModalOpen={setIsAddEmployeeOpen}
            />
          )}

          {activeTab === 'departments' && <DepartmentsPage />}

          {activeTab === 'shifts' && <ShiftsPage />}

          {activeTab === 'attendance' && (
            <AttendancePage
              refreshTrigger={punchRefreshKey}
              onQuickPunchClick={() => setIsQuickPunchOpen(true)}
            />
          )}

          {activeTab === 'reports' && <ReportsPage />}
        </main>
      </div>

      {/* Global Quick Punch Modal */}
      <QuickPunchModal
        isOpen={isQuickPunchOpen}
        onClose={() => setIsQuickPunchOpen(false)}
        employees={employees}
        onPunchSuccess={handlePunchSuccess}
      />
    </div>
  );
}
