import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true
    },
    caloriesConsumed: {
      type: Number,
      required: true
    },
    maintenanceCaloriesSnapshot: {
      type: Number,
      required: true
    },
    deficit: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: one daily log entry per user per date
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);
