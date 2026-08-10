import express from 'express';
import { User } from '../models/User.js';
import { MaintenanceHistory } from '../models/MaintenanceHistory.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const history = await MaintenanceHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        maintenanceCalories: req.user.maintenanceCalories,
        startingWeightKg: req.user.startingWeightKg,
        heightCm: req.user.heightCm,
        goal: req.user.goal,
        createdAt: req.user.createdAt
      },
      maintenanceHistory: history
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// PATCH /api/profile
router.patch('/', authenticateToken, async (req, res) => {
  try {
    const { maintenanceCalories, goal, heightCm, startingWeightKg, name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if maintenance calories changed
    if (maintenanceCalories !== undefined && Number(maintenanceCalories) !== user.maintenanceCalories) {
      const newCalories = Number(maintenanceCalories);
      user.maintenanceCalories = newCalories;

      // Add to audit trail
      await MaintenanceHistory.create({
        userId: user._id,
        maintenanceCalories: newCalories,
        effectiveFrom: today
      });
    }

    if (name) user.name = name;
    if (goal) user.goal = goal;
    if (heightCm !== undefined) user.heightCm = heightCm ? Number(heightCm) : null;
    if (startingWeightKg !== undefined) user.startingWeightKg = startingWeightKg ? Number(startingWeightKg) : null;

    await user.save();

    const history = await MaintenanceHistory.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        maintenanceCalories: user.maintenanceCalories,
        startingWeightKg: user.startingWeightKg,
        heightCm: user.heightCm,
        goal: user.goal
      },
      maintenanceHistory: history
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
