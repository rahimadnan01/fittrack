import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema(
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
    weightKg: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: one weight entry per user per date
weightLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WeightLog = mongoose.models.WeightLog || mongoose.model('WeightLog', weightLogSchema);
