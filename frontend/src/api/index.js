import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const getEmployees = (params) => api.get('/employees', { params });
export const getEmployeeById = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Department APIs
export const getDepartments = () => api.get('/departments');
export const getDepartmentById = (id) => api.get(`/departments/${id}`);
export const createDepartment = (data) => api.post('/departments', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Role APIs
export const getRoles = (params) => api.get('/roles', { params });
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

// Shift APIs
export const getShifts = () => api.get('/shifts');
export const createShift = (data) => api.post('/shifts', data);
export const updateShift = (id, data) => api.put(`/shifts/${id}`, data);
export const deleteShift = (id) => api.delete(`/shifts/${id}`);
export const assignShift = (data) => api.post('/shifts/assign', data);

// Attendance APIs
export const getAttendance = (params) => api.get('/attendance', { params });
export const getTodaySummary = (date) => api.get('/attendance/today-summary', { params: { date } });
export const clockIn = (data) => api.post('/attendance/clock-in', data);
export const clockOut = (data) => api.post('/attendance/clock-out', data);
export const logManualAttendance = (data) => api.post('/attendance', data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Reports & Non-Trivial Aggregation APIs
export const getPunctualityScorecard = (params) => api.get('/reports/punctuality-scorecard', { params });
export const getDepartmentAnalytics = () => api.get('/reports/department-analytics');
export const getShiftCoverage = () => api.get('/reports/shift-coverage');

export default api;
