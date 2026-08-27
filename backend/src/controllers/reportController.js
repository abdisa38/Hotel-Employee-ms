import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { Employee } from '../models/Employee.js';
import { Department } from '../models/Department.js';
import { Shift } from '../models/Shift.js';

/**
 * Non-Trivial Report 1: Employee Punctuality & Compliance Scorecard
 * Multi-stage aggregation pipeline calculating punctuality index, attendance rate,
 * work hours, and performance rating for every employee.
 */
export const getPunctualityScorecard = async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeDoc',
        },
      },
      { $unwind: '$employeeDoc' },
      ...(departmentId
        ? [{ $match: { 'employeeDoc.department': new mongoose.Types.ObjectId(departmentId) } }]
        : []),
      {
        $lookup: {
          from: 'departments',
          localField: 'employeeDoc.department',
          foreignField: '_id',
          as: 'deptDoc',
        },
      },
      { $unwind: { path: '$deptDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'roles',
          localField: 'employeeDoc.role',
          foreignField: '_id',
          as: 'roleDoc',
        },
      },
      { $unwind: { path: '$roleDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'shifts',
          localField: 'employeeDoc.shift',
          foreignField: '_id',
          as: 'shiftDoc',
        },
      },
      { $unwind: { path: '$shiftDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$employeeDoc._id',
          employeeId: { $first: '$employeeDoc.employeeId' },
          name: {
            $first: { $concat: ['$employeeDoc.firstName', ' ', '$employeeDoc.lastName'] },
          },
          email: { $first: '$employeeDoc.email' },
          department: { $first: '$deptDoc.name' },
          role: { $first: '$roleDoc.title' },
          shift: { $first: '$shiftDoc.name' },
          totalShifts: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Half-day'] }, 1, 0] },
          },
          totalHours: { $sum: '$workHours' },
          avgHours: { $avg: '$workHours' },
        },
      },
      {
        $project: {
          employeeId: 1,
          name: 1,
          email: 1,
          department: 1,
          role: 1,
          shift: 1,
          totalShifts: 1,
          presentDays: 1,
          lateDays: 1,
          absentDays: 1,
          halfDays: 1,
          totalHours: { $round: ['$totalHours', 1] },
          avgHours: { $round: ['$avgHours', 1] },
          attendedDays: { $add: ['$presentDays', '$lateDays', '$halfDays'] },
          attendanceRate: {
            $cond: [
              { $gt: ['$totalShifts', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $add: ['$presentDays', '$lateDays', '$halfDays'] },
                          '$totalShifts',
                        ],
                      },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
          punctualityScore: {
            $cond: [
              { $gt: [{ $add: ['$presentDays', '$lateDays', '$halfDays'] }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          '$presentDays',
                          { $add: ['$presentDays', '$lateDays', '$halfDays'] },
                        ],
                      },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          ratingTier: {
            $switch: {
              branches: [
                { case: { $gte: ['$punctualityScore', 95] }, then: 'Excellent' },
                { case: { $gte: ['$punctualityScore', 85] }, then: 'Good' },
                { case: { $gte: ['$punctualityScore', 70] }, then: 'Satisfactory' },
              ],
              default: 'Needs Review',
            },
          },
        },
      },
      { $sort: { punctualityScore: -1, attendanceRate: -1 } },
    ];

    const scorecard = await Attendance.aggregate(pipeline);

    res.json({
      success: true,
      count: scorecard.length,
      data: scorecard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Non-Trivial Report 2: Department Attendance & Performance Analytics
 */
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeDoc',
        },
      },
      { $unwind: '$employeeDoc' },
      {
        $lookup: {
          from: 'departments',
          localField: 'employeeDoc.department',
          foreignField: '_id',
          as: 'deptDoc',
        },
      },
      { $unwind: '$deptDoc' },
      {
        $group: {
          _id: '$deptDoc._id',
          departmentName: { $first: '$deptDoc.name' },
          departmentCode: { $first: '$deptDoc.code' },
          totalLogs: { $sum: 1 },
          presentLogs: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          lateLogs: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          absentLogs: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          totalWorkHours: { $sum: '$workHours' },
          uniqueEmployees: { $addToSet: '$employeeDoc._id' },
        },
      },
      {
        $project: {
          departmentName: 1,
          departmentCode: 1,
          totalLogs: 1,
          presentLogs: 1,
          lateLogs: 1,
          absentLogs: 1,
          employeeCount: { $size: '$uniqueEmployees' },
          totalWorkHours: { $round: ['$totalWorkHours', 1] },
          avgHoursPerLog: {
            $cond: [
              { $gt: ['$totalLogs', 0] },
              { $round: [{ $divide: ['$totalWorkHours', '$totalLogs'] }, 1] },
              0,
            ],
          },
          attendanceRate: {
            $cond: [
              { $gt: ['$totalLogs', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $subtract: ['$totalLogs', '$absentLogs'] }, '$totalLogs'] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
          punctualityRate: {
            $cond: [
              { $gt: [{ $subtract: ['$totalLogs', '$absentLogs'] }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          '$presentLogs',
                          { $subtract: ['$totalLogs', '$absentLogs'] },
                        ],
                      },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { attendanceRate: -1 } },
    ];

    const departmentStats = await Attendance.aggregate(pipeline);

    res.json({
      success: true,
      data: departmentStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Non-Trivial Report 3: Real-Time Shift Coverage & Staffing Distribution
 */
export const getShiftCoverage = async (req, res, next) => {
  try {
    const shifts = await Shift.find();
    const departments = await Department.find();

    const pipeline = [
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: { shift: '$shift', department: '$department' },
          count: { $sum: 1 },
        },
      },
    ];

    const distribution = await Employee.aggregate(pipeline);

    // Build cross-tabulated matrix: Shift -> Departments
    const shiftReports = shifts.map((shift) => {
      const deptBreakdown = departments.map((dept) => {
        const found = distribution.find(
          (d) =>
            d._id.shift &&
            d._id.shift.toString() === shift._id.toString() &&
            d._id.department &&
            d._id.department.toString() === dept._id.toString()
        );
        return {
          departmentId: dept._id,
          departmentName: dept.name,
          departmentCode: dept.code,
          assignedStaff: found ? found.count : 0,
        };
      });

      const totalShiftStaff = deptBreakdown.reduce((sum, item) => sum + item.assignedStaff, 0);

      return {
        shiftId: shift._id,
        shiftName: shift.name,
        shiftCode: shift.code,
        startTime: shift.startTime,
        endTime: shift.endTime,
        totalAssignedStaff: totalShiftStaff,
        departmentBreakdown: deptBreakdown,
      };
    });

    res.json({
      success: true,
      data: shiftReports,
    });
  } catch (error) {
    next(error);
  }
};
