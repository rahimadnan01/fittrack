import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    maintenanceCalories: {
      type: Number,
      required: true,
      default: 2000
    },
    heightCm: {
      type: Number,
      default: null
    },
    startingWeightKg: {
      type: Number,
      default: null
    },
    goal: {
      type: String,
      enum: ['CUT', 'MAINTAIN', 'BULK'],
      default: 'CUT'
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
