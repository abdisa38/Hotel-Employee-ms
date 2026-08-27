import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    date: {
      type: String, // Normalized 'YYYY-MM-DD'
      required: [true, 'Attendance date (YYYY-MM-DD) is required'],
      index: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    workHours: {
      type: Number,
      default: 0,
      min: [0, 'Work hours cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Half-day'],
      default: 'Present',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
