import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../api';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', isActive: true });

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ title: '', department: '', baseSalary: '', description: '' });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'dept'|'role', item }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, roleRes] = await Promise.all([getDepartments(), getRoles()]);
      setDepartments(deptRes.data.data);
      setRoles(roleRes.data.data);
    } catch (err) {
      console.error('Failed to load department/role data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept._id, deptForm);
        setAlertMsg({ type: 'success', text: 'Department updated successfully.' });
      } else {
        await createDepartment(deptForm);
        setAlertMsg({ type: 'success', text: 'New department created.' });
      }
      setIsDeptModalOpen(false);
      setEditingDept(null);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save department' });
    } finally {
      setModalLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingRole) {
        await updateRole(editingRole._id, roleForm);
        setAlertMsg({ type: 'success', text: 'Role updated successfully.' });
      } else {
        await createRole(roleForm);
        setAlertMsg({ type: 'success', text: 'New role created.' });
      }
      setIsRoleModalOpen(false);
      setEditingRole(null);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save role' });
    } finally {
      setModalLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'dept') {
        await deleteDepartment(deleteTarget.item._id);
        setAlertMsg({ type: 'success', text: `Department '${deleteTarget.item.name}' deleted.` });
      } else {
        await deleteRole(deleteTarget.item._id);
        setAlertMsg({ type: 'success', text: `Role '${deleteTarget.item.title}' deleted.` });
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Delete operation failed' });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments & Roles</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure hotel organizational structure and job positions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingDept(null);
              setDeptForm({ name: '', code: '', description: '', isActive: true });
              setIsDeptModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => {
              setEditingRole(null);
              setRoleForm({
                title: '',
                department: departments[0]?._id || '',
                baseSalary: '',
                description: '',
              });
              setIsRoleModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Role</span>
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

      {/* Departments Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Hotel Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Code: {dept.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingDept(dept);
                      setDeptForm({
                        name: dept.name,
                        code: dept.code,
                        description: dept.description || '',
                        isActive: dept.isActive,
                      });
                      setIsDeptModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'dept', item: dept })}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                {dept.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>{dept.employeeCount || 0} Staff</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dept.roleCount || 0} Roles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles & Positions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Job Roles & Compensation</h2>
            <p className="text-xs text-slate-400">Standard roles defined across hotel departments</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Roles: <strong className="text-slate-900">{roles.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Base Salary</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {roles.map((role) => (
                <tr key={role._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{role.title}</td>
                  <td className="py-3.5 px-4 font-medium">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                      {role.department?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    ${role.baseSalary ? role.baseSalary.toLocaleString() : '0'}/mo
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="w-3 h-3 text-slate-400" />
                      {role.employeeCount || 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {role.description || '--'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setRoleForm({
                            title: role.title,
                            department: role.department?._id || role.department || '',
                            baseSalary: role.baseSalary || '',
                            description: role.description || '',
                          });
                          setIsRoleModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                        title="Edit Role"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'role', item: role })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Housekeeping"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HK"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of department duties..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
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
                  <span>{editingDept ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concierge"
                  value={roleForm.title}
                  onChange={(e) => setRoleForm({ ...roleForm, title: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={roleForm.department}
                  onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Salary ($/month)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2800"
                  value={roleForm.baseSalary}
                  onChange={(e) => setRoleForm({ ...roleForm, baseSalary: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
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
                  <span>{editingRole ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title={deleteTarget?.type === 'dept' ? 'Delete Department' : 'Delete Role'}
        message={
          deleteTarget?.type === 'dept'
            ? `Delete department '${deleteTarget.item?.name}'? Note: Departments with active employees cannot be deleted.`
            : `Delete role '${deleteTarget.item?.title}'? Note: Roles assigned to active employees cannot be deleted.`
        }
      />
    </div>
  );
}
