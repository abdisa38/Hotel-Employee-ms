import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Role title is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    baseSalary: {
      type: Number,
      default: 0,
      min: [0, 'Base salary cannot be negative'],
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

export const Role = mongoose.model('Role', roleSchema);
