import { Attendance } from '../models/Attendance.js';
import { Employee } from '../models/Employee.js';
import { Shift } from '../models/Shift.js';

// Helper: Format Date to YYYY-MM-DD in local time
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Parse time string ("HH:mm") or ISO string with a date
const parseDateTime = (dateStr, timeStr) => {
  if (!timeStr) return null;
  if (timeStr.includes('T')) {
    const parsed = new Date(timeStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day, h, m, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

export const getAttendance = async (req, res, next) => {
  try {
    const { date, employee, department, status, startDate, endDate } = req.query;

    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (employee) query.employee = employee;
    if (status) query.status = status;

    let attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId email status department role shift',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'role', select: 'title' },
          { path: 'shift', select: 'name code startTime endTime' },
        ],
      })
      .populate('shift', 'name code startTime endTime')
      .sort({ date: -1, createdAt: -1 });

    if (department) {
      attendanceRecords = attendanceRecords.filter(
        (record) =>
          record.employee &&
          record.employee.department &&
          record.employee.department._id.toString() === department
      );
    }

    res.json({ success: true, count: attendanceRecords.length, data: attendanceRecords });
  } catch (error) {
    next(error);
  }
};

export const getTodaySummary = async (req, res, next) => {
  try {
    const today = req.query.date || getTodayDateString();

    const [totalEmployees, activeEmployees, todayRecords] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Attendance.find({ date: today }),
    ]);

    const presentCount = todayRecords.filter((r) => r.status === 'Present').length;
    const lateCount = todayRecords.filter((r) => r.status === 'Late').length;
    const absentCount = todayRecords.filter((r) => r.status === 'Absent').length;
    const halfDayCount = todayRecords.filter((r) => r.status === 'Half-day').length;
    const clockedInCount = presentCount + lateCount + halfDayCount;
    const unrecordedCount = Math.max(0, activeEmployees - clockedInCount - absentCount);

    res.json({
      success: true,
      data: {
        date: today,
        totalEmployees,
        activeEmployees,
        presentCount,
        lateCount,
        absentCount,
        halfDayCount,
        clockedInCount,
        unrecordedCount,
        attendanceRate:
          activeEmployees > 0
            ? Number(((clockedInCount / activeEmployees) * 100).toFixed(1))
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clockIn = async (req, res, next) => {
  try {
    const { employeeId, notes } = req.body;
    const today = getTodayDateString();

    const employee = await Employee.findById(employeeId).populate('shift');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: `Employee ${employee.firstName} has already clocked in today at ${new Date(
          attendance.checkIn
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    }

    const now = new Date();
    let status = 'Present';

    // Automatic Late calculation based on Shift Start Time
    if (employee.shift && employee.shift.startTime) {
      const [shiftHour, shiftMinute] = employee.shift.startTime.split(':').map(Number);
      const shiftStartTimeToday = new Date();
      shiftStartTimeToday.setHours(shiftHour, shiftMinute, 0, 0);

      // Grace period: 15 minutes
      const gracePeriodLimit = new Date(shiftStartTimeToday.getTime() + 15 * 60 * 1000);

      if (now > gracePeriodLimit) {
        status = 'Late';
      }
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        shift: employee.shift ? employee.shift._id : null,
        checkIn: now,
        status,
        notes: notes || '',
      });
    } else {
      attendance.checkIn = now;
      attendance.status = status;
      if (notes) attendance.notes = notes;
    }

    await attendance.save();
    const populated = await attendance.populate([
      { path: 'employee', select: 'firstName lastName employeeId department role' },
      { path: 'shift', select: 'name startTime endTime' },
    ]);

    res.status(200).json({
      success: true,
      message: `Clock-in recorded for ${employee.firstName} ${employee.lastName}. Status: ${status}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const { employeeId, notes } = req.body;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No clock-in record found for today. Please clock in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: `Employee has already clocked out today at ${new Date(
          attendance.checkOut
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    }

    const now = new Date();
    const checkInTime = new Date(attendance.checkIn);
    const diffMs = now.getTime() - checkInTime.getTime();
    const hours = Math.max(0, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));

    attendance.checkOut = now;
    attendance.workHours = hours;
    if (notes) attendance.notes = (attendance.notes ? attendance.notes + ' | ' : '') + notes;

    await attendance.save();
    const populated = await attendance.populate([
      { path: 'employee', select: 'firstName lastName employeeId department role' },
      { path: 'shift', select: 'name startTime endTime' },
    ]);

    res.status(200).json({
      success: true,
      message: `Clock-out recorded. Total hours: ${hours} hrs`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const manualRecord = async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes, shiftId } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ success: false, message: 'Employee and date are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const checkInDate = parseDateTime(date, checkIn);
    const checkOutDate = parseDateTime(date, checkOut);

    let workHours = 0;
    if (checkInDate && checkOutDate) {
      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      workHours = Math.max(0, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
    } else if (status === 'Present' || status === 'Late') {
      workHours = 8.0;
    } else if (status === 'Half-day') {
      workHours = 4.0;
    }

    const assignedShift = shiftId && shiftId.trim() !== '' ? shiftId : employee.shift;

    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date },
      {
        employee: employeeId,
        date,
        shift: assignedShift,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        workHours,
        status: status || 'Present',
        notes: notes || '',
      },
      { new: true, upsert: true, runValidators: true }
    ).populate([
      {
        path: 'employee',
        select: 'firstName lastName employeeId department role',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'role', select: 'title' },
        ],
      },
      { path: 'shift', select: 'name code startTime endTime' },
    ]);

    res.json({ success: true, message: 'Attendance record saved successfully.', data: record });
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
