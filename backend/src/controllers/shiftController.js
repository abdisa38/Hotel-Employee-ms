import { Shift } from '../models/Shift.js';
import { Employee } from '../models/Employee.js';

export const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find().sort({ startTime: 1 });

    const enriched = await Promise.all(
      shifts.map(async (shift) => {
        const employeeCount = await Employee.countDocuments({ shift: shift._id, status: 'Active' });
        const employees = await Employee.find({ shift: shift._id, status: 'Active' })
          .select('firstName lastName employeeId department role')
          .populate('department', 'name code')
          .populate('role', 'title');

        return {
          ...shift.toObject(),
          employeeCount,
          employees,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getShiftById = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    const employees = await Employee.find({ shift: shift._id }).populate('department role');
    res.json({ success: true, data: { ...shift.toObject(), employees } });
  } catch (error) {
    next(error);
  }
};

export const createShift = async (req, res, next) => {
  try {
    const { name, code, startTime, endTime, description } = req.body;
    const shift = await Shift.create({ name, code, startTime, endTime, description });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    const { name, code, startTime, endTime, description } = req.body;
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { name, code, startTime, endTime, description },
      { new: true, runValidators: true }
    );
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments({ shift: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete shift: ${employeeCount} employee(s) are assigned to it. Reassign them first.`,
      });
    }

    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.json({ success: true, message: 'Shift deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const assignShift = async (req, res, next) => {
  try {
    const { employeeId, shiftId } = req.body;
    if (!employeeId || !shiftId) {
      return res.status(400).json({ success: false, message: 'employeeId and shiftId are required' });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { shift: shiftId },
      { new: true }
    ).populate('department role shift');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: `Shift '${shift.name}' assigned to ${employee.firstName} ${employee.lastName}`,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};
