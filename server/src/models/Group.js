import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shareDeficit: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true
    },
    members: [memberSchema]
  },
  {
    timestamps: true
  }
);

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
