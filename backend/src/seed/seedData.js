import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
import { Department } from '../models/Department.js';
import { Role } from '../models/Role.js';
import { Shift } from '../models/Shift.js';
import { Employee } from '../models/Employee.js';
import { Attendance } from '../models/Attendance.js';

// Fix for Windows DNS resolution with MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback silently
}

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing data
    console.log('[Seed] Clearing old collections...');
    await Promise.all([
      Department.deleteMany(),
      Role.deleteMany(),
      Shift.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
    ]);

    // 1. Seed Departments
    console.log('[Seed] Creating Departments...');
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
    departments.forEach((d) => {
      deptMap[d.code] = d._id;
    });

    // 2. Seed Shifts
    console.log('[Seed] Creating Shifts...');
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
    shifts.forEach((s) => {
      shiftMap[s.code] = s._id;
    });

    // 3. Seed Roles
    console.log('[Seed] Creating Roles...');
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
    roles.forEach((r) => {
      roleMap[r.title] = r._id;
    });

    // 4. Seed Employees
    console.log('[Seed] Creating Employees...');
    const rawEmployees = [
      {
        employeeId: 'EMP-1001',
        firstName: 'Alexander',
        lastName: 'Wright',
        email: 'alexander.wright@noruhotel.com',
        phone: '+1 (555) 234-5671',
        department: deptMap['FO'],
        role: roleMap['Front Office Manager'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1002',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@noruhotel.com',
        phone: '+1 (555) 234-5672',
        department: deptMap['FO'],
        role: roleMap['Receptionist'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1003',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@noruhotel.com',
        phone: '+1 (555) 234-5673',
        department: deptMap['FO'],
        role: roleMap['Receptionist'],
        shift: shiftMap['AFTN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1004',
        firstName: 'Sophia',
        lastName: 'Chen',
        email: 'sophia.chen@noruhotel.com',
        phone: '+1 (555) 234-5674',
        department: deptMap['FO'],
        role: roleMap['Concierge'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1005',
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@noruhotel.com',
        phone: '+1 (555) 345-6781',
        department: deptMap['HK'],
        role: roleMap['Housekeeping Supervisor'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1006',
        firstName: 'David',
        lastName: 'Kowalski',
        email: 'david.kowalski@noruhotel.com',
        phone: '+1 (555) 345-6782',
        department: deptMap['HK'],
        role: roleMap['Room Attendant'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1007',
        firstName: 'Amina',
        lastName: 'Diallo',
        email: 'amina.diallo@noruhotel.com',
        phone: '+1 (555) 345-6783',
        department: deptMap['HK'],
        role: roleMap['Room Attendant'],
        shift: shiftMap['AFTN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1008',
        firstName: 'Jean-Pierre',
        lastName: 'Dubois',
        email: 'jp.dubois@noruhotel.com',
        phone: '+1 (555) 456-7891',
        department: deptMap['KIT'],
        role: roleMap['Head Chef'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1009',
        firstName: 'Kenji',
        lastName: 'Takahashi',
        email: 'kenji.takahashi@noruhotel.com',
        phone: '+1 (555) 456-7892',
        department: deptMap['KIT'],
        role: roleMap['Line Cook'],
        shift: shiftMap['AFTN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1010',
        firstName: 'Isabella',
        lastName: 'Moretti',
        email: 'isabella.moretti@noruhotel.com',
        phone: '+1 (555) 567-8901',
        department: deptMap['FNB'],
        role: roleMap['Restaurant Captain'],
        shift: shiftMap['AFTN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1011',
        firstName: 'Lucas',
        lastName: 'Silva',
        email: 'lucas.silva@noruhotel.com',
        phone: '+1 (555) 567-8902',
        department: deptMap['FNB'],
        role: roleMap['Bartender'],
        shift: shiftMap['AFTN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1012',
        firstName: 'Viktor',
        lastName: 'Novak',
        email: 'viktor.novak@noruhotel.com',
        phone: '+1 (555) 678-9011',
        department: deptMap['SEC'],
        role: roleMap['Security Lead'],
        shift: shiftMap['NGHT'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1013',
        firstName: 'Tariq',
        lastName: 'Al-Mansoor',
        email: 'tariq.almansoor@noruhotel.com',
        phone: '+1 (555) 678-9012',
        department: deptMap['SEC'],
        role: roleMap['Security Guard'],
        shift: shiftMap['NGHT'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1014',
        firstName: 'Rachel',
        lastName: 'Adams',
        email: 'rachel.adams@noruhotel.com',
        phone: '+1 (555) 678-9013',
        department: deptMap['SEC'],
        role: roleMap['Security Guard'],
        shift: shiftMap['MORN'],
        status: 'Active',
      },
      {
        employeeId: 'EMP-1015',
        firstName: 'Liam',
        lastName: 'O\'Connor',
        email: 'liam.oconnor@noruhotel.com',
        phone: '+1 (555) 345-6784',
        department: deptMap['HK'],
        role: roleMap['Room Attendant'],
        shift: shiftMap['NGHT'],
        status: 'Active',
      },
    ];

    const employees = await Employee.create(rawEmployees);
    console.log(`[Seed] Created ${employees.length} employees.`);

    // 5. Seed Attendance for the past 14 days
    console.log('[Seed] Generating 14-day historical attendance records...');
    const attendanceRecords = [];
    const today = new Date();

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
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
          const lateMinutes = 20 + (roll * 15);
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
    console.log(`[Seed] Created ${attendanceRecords.length} attendance records.`);

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
