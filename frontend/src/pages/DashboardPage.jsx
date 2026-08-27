import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Percent, 
  Building2, 
  ArrowRight,
  Fingerprint,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { getTodaySummary, getAttendance, getDepartmentAnalytics, getShifts } from '../api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardPage({ onQuickPunchClick, onNavigateTab }) {
  const [summary, setSummary] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [sumRes, attRes, deptRes, shiftRes] = await Promise.all([
        getTodaySummary(todayStr),
        getAttendance({ date: todayStr }),
        getDepartmentAnalytics(),
        getShifts(),
      ]);

      setSummary(sumRes.data.data);
      setTodayAttendance(attRes.data.data);
      setDepartmentStats(deptRes.data.data);
      setShifts(shiftRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentChartData = departmentStats.map((d) => ({
    name: d.departmentCode || d.departmentName,
    fullName: d.departmentName,
    employees: d.employeeCount,
    attendanceRate: d.attendanceRate,
  }));

  const shiftChartData = shifts.map((s) => ({
    name: s.name.replace(' Shift', ''),
    staff: s.employeeCount || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hotel Operations Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time employee presence and shift analytics</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary?.activeEmployees ?? '--'}</div>
          <span className="text-[11px] text-slate-400">Active roster count</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{summary?.presentCount ?? '--'}</div>
          <span className="text-[11px] text-emerald-600 font-medium">On-time arrivals</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Late Arrivals</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{summary?.lateCount ?? '--'}</div>
          <span className="text-[11px] text-amber-600 font-medium">Clocked after grace</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Absent / Off</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{summary?.absentCount ?? '--'}</div>
          <span className="text-[11px] text-slate-400">Unrecorded: {summary?.unrecordedCount ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rate</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{summary?.attendanceRate ?? '--'}%</div>
          <span className="text-[11px] text-slate-400">Daily completion</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Staff Distribution by Department</h2>
              <p className="text-xs text-slate-400">Headcount across hotel functional areas</p>
            </div>
            <button
              onClick={() => onNavigateTab('departments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val, name, item) => [`${val} staff members`, item.payload.fullName]}
                />
                <Bar dataKey="employees" fill="#026fc3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Roster Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800">Shift Coverage</h2>
              <button
                onClick={() => onNavigateTab('shifts')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span>Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Assigned employees per daily shift</p>

            <div className="space-y-3">
              {shifts.map((shift, idx) => (
                <div key={shift._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">{shift.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{shift.employeeCount || 0}</span>
                    <span className="text-[10px] text-slate-400 block">staff</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onQuickPunchClick}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Record Shift Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Live Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Today's Attendance Roster</h2>
            <p className="text-xs text-slate-400">Live check-in and punch records for today</p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>View Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No attendance logs recorded for today yet. Use "Clock In / Out" to start logging.
                  </td>
                </tr>
              ) : (
                todayAttendance.slice(0, 8).map((record) => {
                  const emp = record.employee;
                  return (
                    <tr key={record._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp?.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">{emp?.department?.name || '--'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {record.shift?.name || emp?.shift?.name || '--'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="py-3 px-4 font-semibold">{record.workHours > 0 ? `${record.workHours} hrs` : '--'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            record.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : record.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : record.status === 'Half-day'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
