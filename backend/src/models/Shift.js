import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Shift code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm format)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm format)'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Shift = mongoose.model('Shift', shiftSchema);
