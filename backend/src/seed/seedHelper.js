import { Department } from '../models/Department.js';
import { Role } from '../models/Role.js';
import { Shift } from '../models/Shift.js';
import { Employee } from '../models/Employee.js';
import { Attendance } from '../models/Attendance.js';

export const autoSeed = async () => {
  const employeeCount = await Employee.countDocuments();
  if (employeeCount > 0) {
    console.log(`[Seed Helper] Database already contains ${employeeCount} employees. Skipping seed.`);
    return;
  }

  console.log('[Seed Helper] Database is empty. Seeding initial hotel dataset with Ethiopian staff profiles...');

  // 1. Departments
  const departments = await Department.create([
    {
      name: 'Front Office',
      code: 'FO',
      description: 'Guest relations, check-in, check-out, and concierge services',
      isActive: true,
    },
    {
      name: 'Housekeeping',
      code: 'HK',
      description: 'Room cleanliness, laundry, linen, and public area maintenance',
      isActive: true,
    },
    {
      name: 'Food & Beverage',
      code: 'FNB',
      description: 'Dining room service, banqueting, room service, and beverage bar',
      isActive: true,
    },
    {
      name: 'Kitchen & Culinary',
      code: 'KIT',
      description: 'Food preparation, menu creation, and kitchen sanitation',
      isActive: true,
    },
    {
      name: 'Security & Safety',
      code: 'SEC',
      description: 'Property surveillance, asset protection, and emergency response',
      isActive: true,
    },
  ]);

  const deptMap = {};
  departments.forEach((d) => (deptMap[d.code] = d._id));

  // 2. Shifts
  const shifts = await Shift.create([
    {
      name: 'Morning Shift',
      code: 'MORN',
      startTime: '06:00',
      endTime: '14:00',
      description: 'Breakfast, morning check-outs, and standard morning operations',
    },
    {
      name: 'Afternoon Shift',
      code: 'AFTN',
      startTime: '14:00',
      endTime: '22:00',
      description: 'Afternoon check-ins, dinner dining service, and evening turnover',
    },
    {
      name: 'Night Shift',
      code: 'NGHT',
      startTime: '22:00',
      endTime: '06:00',
      description: 'Night audit, overnight security, and early morning preparations',
    },
  ]);

  const shiftMap = {};
  shifts.forEach((s) => (shiftMap[s.code] = s._id));

  // 3. Roles
  const roles = await Role.create([
    {
      title: 'Front Office Manager',
      department: deptMap['FO'],
      baseSalary: 4500,
      description: 'Oversees reception desk and guest relations',
    },
    {
      title: 'Receptionist',
      department: deptMap['FO'],
      baseSalary: 2800,
      description: 'Handles guest registration and room allocations',
    },
    {
      title: 'Concierge',
      department: deptMap['FO'],
      baseSalary: 2600,
      description: 'Assists guests with bookings, tours, and inquiries',
    },
    {
      title: 'Housekeeping Supervisor',
      department: deptMap['HK'],
      baseSalary: 3400,
      description: 'Supervises room inspection and linen distribution',
    },
    {
      title: 'Room Attendant',
      department: deptMap['HK'],
      baseSalary: 2400,
      description: 'Cleans guest rooms and restocks amenities',
    },
    {
      title: 'Head Chef',
      department: deptMap['KIT'],
      baseSalary: 5200,
      description: 'Leads culinary team and manages inventory',
    },
    {
      title: 'Line Cook',
      department: deptMap['KIT'],
      baseSalary: 2900,
      description: 'Prepares ingredients and cooks stations',
    },
    {
      title: 'Restaurant Captain',
      department: deptMap['FNB'],
      baseSalary: 3100,
      description: 'Manages dining floor and wait staff',
    },
    {
      title: 'Bartender',
      department: deptMap['FNB'],
      baseSalary: 2700,
      description: 'Serves drinks and operates beverage stations',
    },
    {
      title: 'Security Lead',
      department: deptMap['SEC'],
      baseSalary: 3300,
      description: 'Coordinates surveillance and safety patrols',
    },
    {
      title: 'Security Guard',
      department: deptMap['SEC'],
      baseSalary: 2500,
      description: 'Monitors entrances and enforces security protocols',
    },
  ]);

  const roleMap = {};
  roles.forEach((r) => (roleMap[r.title] = r._id));

  // 4. Employees with Ethiopian Names
  const employees = await Employee.create([
    {
      employeeId: 'EMP-1001',
      firstName: 'Abdisa',
      lastName: 'Awel',
      email: 'abdisa.awel@noruhotel.com',
      phone: '+251 91 123 4567',
      department: deptMap['FO'],
      role: roleMap['Front Office Manager'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1002',
      firstName: 'Selamawit',
      lastName: 'Alemu',
      email: 'selamawit.alemu@noruhotel.com',
      phone: '+251 91 234 5678',
      department: deptMap['FO'],
      role: roleMap['Receptionist'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1003',
      firstName: 'Bekele',
      lastName: 'Tadesse',
      email: 'bekele.tadesse@noruhotel.com',
      phone: '+251 91 345 6789',
      department: deptMap['FO'],
      role: roleMap['Receptionist'],
      shift: shiftMap['AFTN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1004',
      firstName: 'Tigist',
      lastName: 'Mengistu',
      email: 'tigist.mengistu@noruhotel.com',
      phone: '+251 91 456 7890',
      department: deptMap['FO'],
      role: roleMap['Concierge'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1005',
      firstName: 'Meron',
      lastName: 'Tesfaye',
      email: 'meron.tesfaye@noruhotel.com',
      phone: '+251 92 123 4567',
      department: deptMap['HK'],
      role: roleMap['Housekeeping Supervisor'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1006',
      firstName: 'Dawit',
      lastName: 'Haile',
      email: 'dawit.haile@noruhotel.com',
      phone: '+251 92 234 5678',
      department: deptMap['HK'],
      role: roleMap['Room Attendant'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1007',
      firstName: 'Helen',
      lastName: 'Worku',
      email: 'helen.worku@noruhotel.com',
      phone: '+251 92 345 6789',
      department: deptMap['HK'],
      role: roleMap['Room Attendant'],
      shift: shiftMap['AFTN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1008',
      firstName: 'Yohannes',
      lastName: 'Gebre',
      email: 'yohannes.gebre@noruhotel.com',
      phone: '+251 93 123 4567',
      department: deptMap['KIT'],
      role: roleMap['Head Chef'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1009',
      firstName: 'Natnael',
      lastName: 'Kebede',
      email: 'natnael.kebede@noruhotel.com',
      phone: '+251 93 234 5678',
      department: deptMap['KIT'],
      role: roleMap['Line Cook'],
      shift: shiftMap['AFTN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1010',
      firstName: 'Mahlet',
      lastName: 'Girma',
      email: 'mahlet.girma@noruhotel.com',
      phone: '+251 94 123 4567',
      department: deptMap['FNB'],
      role: roleMap['Restaurant Captain'],
      shift: shiftMap['AFTN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1011',
      firstName: 'Biruk',
      lastName: 'Solomon',
      email: 'biruk.solomon@noruhotel.com',
      phone: '+251 94 234 5678',
      department: deptMap['FNB'],
      role: roleMap['Bartender'],
      shift: shiftMap['AFTN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1012',
      firstName: 'Tewodros',
      lastName: 'Kassahun',
      email: 'tewodros.kassahun@noruhotel.com',
      phone: '+251 95 123 4567',
      department: deptMap['SEC'],
      role: roleMap['Security Lead'],
      shift: shiftMap['NGHT'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1013',
      firstName: 'Henok',
      lastName: 'Fikru',
      email: 'henok.fikru@noruhotel.com',
      phone: '+251 95 234 5678',
      department: deptMap['SEC'],
      role: roleMap['Security Guard'],
      shift: shiftMap['NGHT'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1014',
      firstName: 'Senait',
      lastName: 'Desta',
      email: 'senait.desta@noruhotel.com',
      phone: '+251 95 345 6789',
      department: deptMap['SEC'],
      role: roleMap['Security Guard'],
      shift: shiftMap['MORN'],
      status: 'Active',
    },
    {
      employeeId: 'EMP-1015',
      firstName: 'Betelhem',
      lastName: 'Assefa',
      email: 'betelhem.assefa@noruhotel.com',
      phone: '+251 92 456 7890',
      department: deptMap['HK'],
      role: roleMap['Room Attendant'],
      shift: shiftMap['NGHT'],
      status: 'Active',
    },
  ]);

  // 5. 14-day Historical Attendance (dayOffset 1 to 14, leaving today unclocked for live demonstration)
  const attendanceRecords = [];
  const today = new Date();

  for (let dayOffset = 14; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    for (const emp of employees) {
      const shiftObj = shifts.find((s) => s._id.toString() === emp.shift.toString());
      const [startH, startM] = (shiftObj ? shiftObj.startTime : '08:00').split(':').map(Number);
      const [endH, endM] = (shiftObj ? shiftObj.endTime : '16:00').split(':').map(Number);

      const hash = (emp.employeeId.charCodeAt(6) || 0) + dayOffset;
      const roll = hash % 20;

      let status = 'Present';
      let checkIn = null;
      let checkOut = null;
      let workHours = 8;
      let notes = '';

      if (roll === 0) {
        status = 'Absent';
        workHours = 0;
        notes = 'Unplanned absence';
      } else if (roll === 1 || roll === 2) {
        status = 'Late';
        const lateMinutes = 20 + roll * 15;
        checkIn = new Date(targetDate);
        checkIn.setHours(startH, startM + lateMinutes, 0, 0);
        checkOut = new Date(targetDate);
        checkOut.setHours(endH, endM, 0, 0);
        workHours = Math.max(0, Number(((8 * 60 - lateMinutes) / 60).toFixed(1)));
        notes = `Arrived ${lateMinutes} minutes late`;
      } else if (roll === 3) {
        status = 'Half-day';
        checkIn = new Date(targetDate);
        checkIn.setHours(startH, startM, 0, 0);
        checkOut = new Date(targetDate);
        checkOut.setHours(startH + 4, startM, 0, 0);
        workHours = 4;
        notes = 'Authorized early leave';
      } else {
        status = 'Present';
        const earlyMinutes = (hash % 10) - 5;
        checkIn = new Date(targetDate);
        checkIn.setHours(startH, startM + Math.min(earlyMinutes, 10), 0, 0);
        checkOut = new Date(targetDate);
        checkOut.setHours(endH, endM + (hash % 10), 0, 0);
        workHours = 8.0;
      }

      attendanceRecords.push({
        employee: emp._id,
        date: dateStr,
        shift: emp.shift,
        checkIn,
        checkOut,
        workHours,
        status,
        notes,
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);
  console.log(`[Seed Helper] Successfully populated 5 departments, 11 roles, 3 shifts, ${employees.length} Ethiopian employees, and ${attendanceRecords.length} historical attendance records.`);
};
