import mongoose from 'mongoose';

const maintenanceHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    maintenanceCalories: {
      type: Number,
      required: true
    },
    effectiveFrom: {
      type: String, // YYYY-MM-DD format
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const MaintenanceHistory =
  mongoose.models.MaintenanceHistory || mongoose.model('MaintenanceHistory', maintenanceHistorySchema);
