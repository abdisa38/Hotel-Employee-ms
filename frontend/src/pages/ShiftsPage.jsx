import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  UserCheck, 
  ArrowRightLeft, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Sunset, 
  Moon,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { getShifts, getEmployees, assignShift, createShift } from '../api';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shift Reassignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [targetShiftId, setTargetShiftId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // New Shift Modal State
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    code: '',
    startTime: '08:00',
    endTime: '16:00',
    description: '',
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [alertMsg, setAlertMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftRes, empRes] = await Promise.all([getShifts(), getEmployees()]);
      setShifts(shiftRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId || !targetShiftId) return;

    setAssignLoading(true);
    try {
      const res = await assignShift({ employeeId: selectedEmpId, shiftId: targetShiftId });
      setAlertMsg({ type: 'success', text: res.data.message });
      setIsAssignModalOpen(false);
      setSelectedEmpId('');
      setTargetShiftId('');
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reassign shift' });
    } finally {
      setAssignLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await createShift(shiftForm);
      setAlertMsg({ type: 'success', text: 'New shift template created.' });
      setIsAddShiftOpen(false);
      setShiftForm({ name: '', code: '', startTime: '08:00', endTime: '16:00', description: '' });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create shift' });
    } finally {
      setModalLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const getShiftIcon = (code) => {
    if (code?.includes('MORN')) return Sun;
    if (code?.includes('AFTN') || code?.includes('EVE')) return Sunset;
    return Moon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shift Scheduling & Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage work hours, shift templates, and employee assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Reassign Employee Shift</span>
          </button>
          <button
            onClick={() => setIsAddShiftOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>New Shift</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
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

      {/* Shift Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shifts.map((shift) => {
          const ShiftIcon = getShiftIcon(shift.code);
          return (
            <div key={shift._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShiftIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{shift.name}</h3>
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      {shift.startTime} — {shift.endTime} (8 hrs)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                  {shift.code}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">
                {shift.description || 'Standard hotel operational shift.'}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Assigned Roster</span>
                  <span className="text-xs font-bold text-blue-600">{shift.employeeCount || 0} Staff</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(!shift.employees || shift.employees.length === 0) ? (
                    <p className="text-[11px] text-slate-400 italic py-2">No staff currently assigned</p>
                  ) : (
                    shift.employees.map((emp) => (
                      <div
                        key={emp._id}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <span className="font-medium text-slate-800 block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {emp.role?.title || 'Staff'} • {emp.department?.code || ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Shift Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">Reassign Employee Shift</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeId} — {emp.firstName} {emp.lastName} (Current: {emp.shift?.name || 'None'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Assigned Shift <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={targetShiftId}
                  onChange={(e) => setTargetShiftId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose target shift --</option>
                  {shifts.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedEmpId || !targetShiftId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {assignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {isAddShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">Create New Shift Schedule</h3>
              <button onClick={() => setIsAddShiftOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shift Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Special Shift"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shift Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WKND"
                  value={shiftForm.code}
                  onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational details..."
                  value={shiftForm.description}
                  onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddShiftOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Create Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
