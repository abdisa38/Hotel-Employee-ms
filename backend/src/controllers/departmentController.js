import { Department } from '../models/Department.js';
import { Employee } from '../models/Employee.js';
import { Role } from '../models/Role.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Enrich with employee count and role count per department
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ department: dept._id, status: 'Active' });
        const roleCount = await Role.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount,
          roleCount,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const roles = await Role.find({ department: department._id });
    const employees = await Employee.find({ department: department._id }).populate('role shift');
    
    res.json({
      success: true,
      data: {
        ...department.toObject(),
        roles,
        employees,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, isActive } = req.body;
    const department = await Department.create({ name, code, description, isActive });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, isActive } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, isActive },
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${employeeCount} employee(s) are currently assigned to it. Reassign employees first.`,
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Also delete associated roles
    await Role.deleteMany({ department: req.params.id });

    res.json({ success: true, message: 'Department and associated roles deleted successfully' });
  } catch (error) {
    next(error);
  }
};
