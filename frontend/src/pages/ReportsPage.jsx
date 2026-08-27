import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Building2, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { 
  getPunctualityScorecard, 
  getDepartmentAnalytics, 
  getShiftCoverage, 
  getDepartments 
} from '../api';

export default function ReportsPage() {
  const [activeReportTab, setActiveReportTab] = useState('punctuality'); // 'punctuality' | 'department' | 'coverage'
  const [scorecard, setScorecard] = useState([]);
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [shiftCoverage, setShiftCoverage] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Punctuality Scorecard
  const [selectedDept, setSelectedDept] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [scoreRes, deptRes, coverRes, deptsListRes] = await Promise.all([
        getPunctualityScorecard({
          departmentId: selectedDept || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getDepartmentAnalytics(),
        getShiftCoverage(),
        getDepartments(),
      ]);

      setScorecard(scoreRes.data.data);
      setDepartmentAnalytics(deptRes.data.data);
      setShiftCoverage(coverRes.data.data);
      setDepartments(deptsListRes.data.data);
    } catch (err) {
      console.error('Failed to load report analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, startDate, endDate]);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Satisfactory':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hotel Business Intelligence & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-trivial multi-stage MongoDB aggregations for punctuality, attendance, and shift balance
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveReportTab('punctuality')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeReportTab === 'punctuality'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Staff Punctuality Scorecard</span>
        </button>

        <button
          onClick={() => setActiveReportTab('department')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeReportTab === 'department'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Attendance & Hours</span>
        </button>

        <button
          onClick={() => setActiveReportTab('coverage')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeReportTab === 'coverage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Shift Coverage Matrix</span>
        </button>
      </div>

      {/* REPORT 1: STAFF PUNCTUALITY SCORECARD */}
      {activeReportTab === 'punctuality' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Filter Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex items-end">
              <button
                onClick={() => {
                  setSelectedDept('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Query Intelligence Breakdown</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              This report performs a multi-stage MongoDB aggregation pipeline across Attendance, Employee,
              Department, Role, and Shift collections. It computes total scheduled shifts, on-time arrivals,
              grace-period violations (tardiness), and calculates a normalized 0-100% Punctuality Index.
            </p>
          </div>

          {/* Scorecard Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-600">
                Evaluated Staff Members: <strong className="text-slate-900">{scorecard.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4 text-center">Total Shifts</th>
                    <th className="py-3 px-4 text-center text-emerald-600">Present (On-Time)</th>
                    <th className="py-3 px-4 text-center text-amber-600">Late Arrivals</th>
                    <th className="py-3 px-4 text-center text-rose-600">Absences</th>
                    <th className="py-3 px-4 text-center">Total Hours</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                    <th className="py-3 px-4 text-center">Punctuality Score</th>
                    <th className="py-3 px-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scorecard.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        No scorecard records generated.
                      </td>
                    </tr>
                  ) : (
                    scorecard.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{row.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.employeeId}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{row.department}</div>
                          <div className="text-[11px] text-slate-400">{row.role}</div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-600">{row.shift}</td>

                        <td className="py-3 px-4 text-center font-bold">{row.totalShifts}</td>

                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {row.presentDays}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-amber-600">
                          {row.lateDays}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          {row.absentDays}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-medium">
                          {row.totalHours} hrs
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-slate-900">
                          {row.attendanceRate}%
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  row.punctualityScore >= 90
                                    ? 'bg-emerald-500'
                                    : row.punctualityScore >= 75
                                    ? 'bg-blue-500'
                                    : row.punctualityScore >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(row.punctualityScore, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900">{row.punctualityScore}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadge(
                              row.ratingTier
                            )}`}
                          >
                            {row.ratingTier}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: DEPARTMENT ATTENDANCE & PRODUCTIVITY */}
      {activeReportTab === 'department' && (
        <div className="space-y-6">
          {/* Department Analytics Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Department Attendance vs Punctuality Rates
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Comparison of overall attendance rate (%) and on-time punctuality rate (%) per department
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentAnalytics}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="attendanceRate" name="Attendance Rate %" fill="#026fc3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="punctualityRate" name="Punctuality Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Department Performance Metrics
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Active Staff</th>
                    <th className="py-3 px-4 text-center">Total Shifts Logged</th>
                    <th className="py-3 px-4 text-center text-emerald-600">On-Time</th>
                    <th className="py-3 px-4 text-center text-amber-600">Late</th>
                    <th className="py-3 px-4 text-center text-rose-600">Absent</th>
                    <th className="py-3 px-4 text-center">Total Work Hours</th>
                    <th className="py-3 px-4 text-center">Avg Hours / Shift</th>
                    <th className="py-3 px-4 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {departmentAnalytics.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {dept.departmentName} ({dept.departmentCode})
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{dept.employeeCount}</td>
                      <td className="py-3.5 px-4 text-center">{dept.totalLogs}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{dept.presentLogs}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-600">{dept.lateLogs}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">{dept.absentLogs}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">{dept.totalWorkHours} hrs</td>
                      <td className="py-3.5 px-4 text-center font-mono">{dept.avgHoursPerLog} hrs</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-blue-600">{dept.attendanceRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: SHIFT COVERAGE MATRIX */}
      {activeReportTab === 'coverage' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Shift Staffing Distribution & Coverage</span>
            </div>
            <p className="text-slate-600">
              Cross-tabulated headcount analysis showing staffing levels for each shift across all hotel departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shiftCoverage.map((shift) => (
              <div key={shift.shiftId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{shift.shiftName}</h3>
                    <span className="text-xs text-slate-500 font-mono">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-blue-600">{shift.totalAssignedStaff}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Staff</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Department Staffing Breakdown
                  </span>
                  {shift.departmentBreakdown.map((dept) => (
                    <div
                      key={dept.departmentId}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="font-medium text-slate-700">{dept.departmentName}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          dept.assignedStaff > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {dept.assignedStaff} Staff
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
