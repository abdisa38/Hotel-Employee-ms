import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { createEmployee, updateEmployee } from '../../api';

export default function EmployeeModal({
  isOpen,
  onClose,
  employee,
  departments,
  roles,
  shifts,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    shift: '',
    salary: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department?._id || employee.department || '',
        role: employee.role?._id || employee.role || '',
        shift: employee.shift?._id || employee.shift || '',
        salary: employee.salary || employee.role?.baseSalary || '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active',
      });
    } else {
      const defaultRole = roles[0];
      setFormData({
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: departments[0]?._id || '',
        role: defaultRole?._id || '',
        shift: shifts[0]?._id || '',
        salary: defaultRole?.baseSalary || '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
    setError(null);
  }, [employee, isOpen, departments, roles, shifts]);

  if (!isOpen) return null;

  // Filter roles based on selected department
  const filteredRoles = formData.department
    ? roles.filter(
        (r) => (r.department?._id || r.department || '').toString() === formData.department.toString()
      )
    : roles;

  const handleRoleChange = (roleId) => {
    const foundRole = roles.find((r) => r._id === roleId);
    setFormData({
      ...formData,
      role: roleId,
      salary: foundRole?.baseSalary !== undefined ? foundRole.baseSalary : formData.salary,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (employee?._id) {
        await updateEmployee(employee._id, formData);
      } else {
        await createEmployee(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              {employee ? 'Edit Employee Details' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500">Fill in staff member profile and compensation</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Abdisa"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Awel"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="abdisa.awel@noruhotel.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+251 91 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => {
                  const newDept = e.target.value;
                  const matchingRoles = roles.filter(
                    (r) => (r.department?._id || r.department || '').toString() === newDept.toString()
                  );
                  const newRole = matchingRoles[0];
                  setFormData({
                    ...formData,
                    department: newDept,
                    role: newRole?._id || '',
                    salary: newRole?.baseSalary || formData.salary,
                  });
                }}
                className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {(filteredRoles.length > 0 ? filteredRoles : roles).map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {shifts.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.startTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hire Date</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Salary ($/month)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 2800"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{employee ? 'Save Changes' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
