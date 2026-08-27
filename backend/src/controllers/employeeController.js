import { Employee } from '../models/Employee.js';
import { Department } from '../models/Department.js';
import { Role } from '../models/Role.js';
import { Shift } from '../models/Shift.js';
import { Attendance } from '../models/Attendance.js';

export const getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      role,
      shift,
      status,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Text search on name, email, employeeId
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (role) query.role = role;
    if (shift) query.shift = shift;
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name code')
        .populate('role', 'title baseSalary')
        .populate('shift', 'name code startTime endTime')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name code description')
      .populate('role', 'title baseSalary description')
      .populate('shift', 'name code startTime endTime description');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Fetch recent 30-day attendance history
    const recentAttendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(30);

    res.json({
      success: true,
      data: {
        ...employee.toObject(),
        recentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      role,
      shift,
      hireDate,
      status,
      avatarUrl,
    } = req.body;

    // Validate related entity existence
    const [deptExists, roleExists, shiftExists] = await Promise.all([
      Department.findById(department),
      Role.findById(role),
      Shift.findById(shift),
    ]);

    if (!deptExists) return res.status(400).json({ success: false, message: 'Invalid Department' });
    if (!roleExists) return res.status(400).json({ success: false, message: 'Invalid Role' });
    if (!shiftExists) return res.status(400).json({ success: false, message: 'Invalid Shift' });

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      role,
      shift,
      hireDate: hireDate || new Date(),
      status: status || 'Active',
      avatarUrl,
    });

    const populated = await employee.populate([
      { path: 'department', select: 'name code' },
      { path: 'role', select: 'title baseSalary' },
      { path: 'shift', select: 'name code startTime endTime' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      role,
      shift,
      hireDate,
      status,
      avatarUrl,
    } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        department,
        role,
        shift,
        hireDate,
        status,
        avatarUrl,
      },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('role', 'title baseSalary')
      .populate('shift', 'name code startTime endTime');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Clean up attendance records for this employee
    await Attendance.deleteMany({ employee: req.params.id });

    res.json({ success: true, message: 'Employee and associated records deleted successfully' });
  } catch (error) {
    next(error);
  }
};
