import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint, 
  RefreshCw,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { 
  getAttendance, 
  getEmployees, 
  getDepartments, 
  logManualAttendance, 
  deleteAttendance 
} from '../api';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function AttendancePage({ onQuickPunchClick, refreshTrigger }) {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Manual Log / Edit Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [logForm, setLogForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: '',
  });

  // Delete State
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, empRes, deptRes] = await Promise.all([
        getAttendance({
          date: selectedDate || undefined,
          department: selectedDept || undefined,
          status: selectedStatus || undefined,
        }),
        getEmployees(),
        getDepartments(),
      ]);

      setAttendanceList(attRes.data.data);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedDept, selectedStatus, refreshTrigger]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await logManualAttendance(logForm);
      setAlertMsg({ type: 'success', text: 'Attendance record saved successfully.' });
      setIsLogModalOpen(false);
      setEditingRecord(null);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance' });
    } finally {
      setModalLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      await deleteAttendance(deletingRecord._id);
      setAlertMsg({ type: 'success', text: 'Attendance entry removed.' });
      setDeletingRecord(null);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete record' });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    const formatLocalTime = (d) => {
      if (!d) return '';
      const dateObj = new Date(d);
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    setLogForm({
      employeeId: rec.employee?._id || '',
      date: rec.date,
      checkIn: formatLocalTime(rec.checkIn),
      checkOut: formatLocalTime(rec.checkOut),
      status: rec.status || 'Present',
      notes: rec.notes || '',
    });
    setIsLogModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance & Punch Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track daily check-ins, punctuality, and work hours</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onQuickPunchClick}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>
          <button
            onClick={() => {
              setEditingRecord(null);
              setLogForm({
                employeeId: employees[0]?._id || '',
                date: selectedDate,
                checkIn: '08:00',
                checkOut: '16:00',
                status: 'Present',
                notes: 'Manual entry',
              });
              setIsLogModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Alert */}
      {alertMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Date & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Attendance Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Half-day">Half-day</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setSelectedDept('');
                setSelectedStatus('');
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Reset to Today
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-600">
            Attendance Records for {selectedDate}: <strong className="text-slate-900">{attendanceList.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No attendance records found for the selected date and filters.
                  </td>
                </tr>
              ) : (
                attendanceList.map((rec) => {
                  const emp = rec.employee;
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeId}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-900 font-medium block">
                          {emp?.department?.name || 'Unassigned'}
                        </span>
                        <span className="text-[11px] text-slate-500">{emp?.role?.title || ''}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {rec.shift?.name || emp?.shift?.name || '--'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium">
                        {rec.checkIn
                          ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium">
                        {rec.checkOut
                          ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : rec.status === 'Half-day'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                        {rec.notes || '--'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(rec)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual / Edit Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">
                {editingRecord ? 'Edit Attendance Record' : 'Manual Attendance Entry'}
              </h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!!editingRecord}
                  value={logForm.employeeId}
                  onChange={(e) => setLogForm({ ...logForm, employeeId: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeId} — {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Time</label>
                  <input
                    type="time"
                    value={logForm.checkIn}
                    onChange={(e) => setLogForm({ ...logForm, checkIn: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Time</label>
                  <input
                    type="time"
                    value={logForm.checkOut}
                    onChange={(e) => setLogForm({ ...logForm, checkOut: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={logForm.status}
                  onChange={(e) => setLogForm({ ...logForm, status: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Half-day">Half-day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Approved shift adjustment"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Attendance Record"
        message="Are you sure you want to remove this attendance log entry?"
      />
    </div>
  );
}
