# Noru Hotel — Employee Management System (MERN Stack)

A clean, modular, and professional **Hotel Employee Management System** built with **MongoDB, Express.js, React (Vite), and Node.js**.

Designed specifically for hotel operational workflows: managing departments, roles, shift schedules, daily staff attendance (with automated late-arrival calculations), and non-trivial business intelligence aggregation reports.

---

## 1. System Architecture

The application is structured as a decoupled monorepo:

```
Hotel-Employee-ms/
├── backend/                  # Node.js + Express + Mongoose REST API
│   ├── src/
│   │   ├── config/           # MongoDB connection & DNS resolver
│   │   ├── controllers/      # Route controllers (CRUD & Analytics)
│   │   ├── middleware/       # Error handling & validation
│   │   ├── models/           # Mongoose schemas (relational references & indexes)
│   │   ├── routes/           # REST API endpoints
│   │   ├── seed/             # Database seeder (15+ employees, 14-day history)
│   │   └── server.js         # Express app entry point
│   └── package.json
│
├── frontend/                 # React + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── api/              # Axios API services
│   │   ├── components/       # Layout, Modals, Forms, Tables
│   │   ├── pages/            # Dashboard, Employees, Departments, Shifts, Attendance, Reports
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── package.json              # Monorepo root scripts
└── README.md                 # System documentation
```

---

## 2. Database Design & Relational Integrity

The data model preserves relational integrity across all hotel entities using **Mongoose references (`ObjectId`)** and **compound indexes**:

```
+---------------+        1:N        +---------------+
|  Department   | ----------------> |     Role      |
+---------------+                   +---------------+
        |                                   |
        | 1:N                               | 1:N
        v                                   v
+---------------------------------------------------+
|                     Employee                      |
+---------------------------------------------------+
        |                                   ^
        | 1:N                               | 1:N
        v                                   |
+---------------+                   +---------------+
|  Attendance   |                   |     Shift     |
+---------------+                   +---------------+
```

### Key Entities & Schemas:
1. **Department**: `name` (unique), `code` (unique, uppercase e.g., `FO`, `HK`, `KIT`, `FNB`, `SEC`), `description`, `isActive`.
2. **Role**: `title` (unique), `department` (ref: `Department`), `baseSalary`, `description`.
3. **Shift**: `name`, `code` (unique e.g., `MORN`, `AFTN`, `NGHT`), `startTime`, `endTime`, `description`.
4. **Employee**: `employeeId` (unique e.g., `EMP-1001`), `firstName`, `lastName`, `email` (unique), `phone`, `department` (ref: `Department`), `role` (ref: `Role`), `shift` (ref: `Shift`), `hireDate`, `status` (`Active`, `On Leave`, `Inactive`).
5. **Attendance**: `employee` (ref: `Employee`), `date` (`YYYY-MM-DD`), `shift` (ref: `Shift`), `checkIn`, `checkOut`, `workHours`, `status` (`Present`, `Late`, `Absent`, `Half-day`), `notes`.
   - **Compound Index**: `{ employee: 1, date: 1 }` (unique) ensures each employee has exactly one record per day.

---

## 3. Non-Trivial Aggregation Queries (Requirement #2)

To satisfy the requirement of non-trivial analytical queries, the backend implements **multi-stage MongoDB Aggregation Pipelines**:

### A. Staff Punctuality & Compliance Scorecard (`GET /api/reports/punctuality-scorecard`)
Performs a multi-collection `$lookup` across `Attendance`, `Employee`, `Department`, `Role`, and `Shift`:
- Groups records by employee to count `presentDays`, `lateDays`, `absentDays`, and total work hours.
- Dynamically computes:
  - **Attendance Rate (%)**: `((Present + Late + HalfDay) / TotalShifts) * 100`
  - **Punctuality Score (%)**: `(Present / (Present + Late + HalfDay)) * 100`
  - **Performance Tier**: Evaluated conditionally (`Excellent` $\ge 95\%$, `Good` $\ge 85\%$, `Satisfactory` $\ge 70\%$, `Needs Review`).

### B. Department Performance Analytics (`GET /api/reports/department-analytics`)
- Aggregates presence/absence rates and total work hours grouped by department.

### C. Shift Staffing Matrix (`GET /api/reports/shift-coverage`)
- Cross-tabulates headcount across shifts and departments to detect understaffed operations.

---

## 4. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | List employees with search, department, role, and shift filters |
| `POST` | `/api/employees` | Register new employee |
| `PUT` | `/api/employees/:id` | Update employee profile |
| `DELETE` | `/api/employees/:id` | Remove employee and associated attendance history |
| `GET` | `/api/departments` | List departments with active employee and role counts |
| `POST` | `/api/departments` | Create new department |
| `GET` | `/api/roles` | List roles (optionally filtered by department) |
| `POST` | `/api/roles` | Create new role |
| `GET` | `/api/shifts` | List shifts with assigned staff roster |
| `POST` | `/api/shifts/assign` | Reassign employee to a different shift |
| `GET` | `/api/attendance` | Get attendance logs filtered by date or department |
| `GET` | `/api/attendance/today-summary`| Get KPI stats (Present, Late, Absent, Attendance %) |
| `POST` | `/api/attendance/clock-in` | Clock in with automated shift late-detection |
| `POST` | `/api/attendance/clock-out` | Clock out and calculate work hours |
| `POST` | `/api/attendance` | Manual attendance logging / adjustment |
| `GET` | `/api/reports/punctuality-scorecard` | Non-trivial punctuality analytics |
| `GET` | `/api/reports/department-analytics` | Department productivity metrics |
| `GET` | `/api/reports/shift-coverage` | Shift staffing balance matrix |

---

## 5. Getting Started & How to Run

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed the Database

The project comes with a comprehensive seed script that populates 5 hotel departments, 11 roles, 3 shifts, 15 realistic employees, and 14 days of attendance data:

```bash
cd backend
npm run seed
```

### Step 3: Run the Application

In terminal 1 (Backend API):
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`.*

In terminal 2 (Frontend Dashboard):
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 6. Key Design Decisions

1. **Relational Modeling over Embedded Documents**:
   Employees, shifts, and departments are modeled as standalone collections with relational references (`ObjectId`). This ensures employee reassignments update globally without stale embedded copies.
2. **Automated Status Calculation**:
   When an employee clocks in, the backend compares the server timestamp with the employee's assigned shift `startTime`. If the check-in exceeds the start time by 15 minutes, the record is automatically flagged as `Late`.
3. **Professional UX with Zero Emojis**:
   The entire interface uses crisp SVG icons (`lucide-react`) and corporate typography (`Inter` and `Plus Jakarta Sans`) to maintain an enterprise hotel management aesthetic.
