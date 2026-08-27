import { Role } from '../models/Role.js';
import { Employee } from '../models/Employee.js';

export const getRoles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }

    const roles = await Role.find(filter).populate('department', 'name code').sort({ title: 1 });

    const enriched = await Promise.all(
      roles.map(async (role) => {
        const employeeCount = await Employee.countDocuments({ role: role._id, status: 'Active' });
        return {
          ...role.toObject(),
          employeeCount,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).populate('department', 'name code');
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    const employees = await Employee.find({ role: role._id }).populate('department shift');
    res.json({ success: true, data: { ...role.toObject(), employees } });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { title, department, baseSalary, description } = req.body;
    const role = await Role.create({ title, department, baseSalary, description });
    const populated = await role.populate('department', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { title, department, baseSalary, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { title, department, baseSalary, description },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments({ role: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role: ${employeeCount} employee(s) are assigned to it. Reassign them first.`,
      });
    }

    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};
