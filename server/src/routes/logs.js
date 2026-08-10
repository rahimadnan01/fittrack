import express from 'express';
import { DailyLog } from '../models/DailyLog.js';
import { WeightLog } from '../models/WeightLog.js';
import { calculateDailyDeficit } from '../utils/calculator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/logs - Upsert a daily calorie log (and optional weight log)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, caloriesConsumed, weightKg, note } = req.body;

    if (!date || caloriesConsumed === undefined) {
      return res.status(400).json({ message: 'Date and caloriesConsumed are required' });
    }

    const logDate = String(date).split('T')[0];
    const consumed = Number(caloriesConsumed);

    // Snapshot user's current baseline maintenance calories
    const maintenanceSnapshot = req.user.maintenanceCalories;
    const deficit = calculateDailyDeficit(maintenanceSnapshot, consumed);

    // Upsert DailyLog
    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId: req.user._id, date: logDate },
      {
        userId: req.user._id,
        date: logDate,
        caloriesConsumed: consumed,
        maintenanceCaloriesSnapshot: maintenanceSnapshot,
        deficit,
        note: note || ''
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Optionally handle weight log if weightKg is provided
    let weightLog = null;
    if (weightKg !== undefined && weightKg !== null && weightKg !== '') {
      weightLog = await WeightLog.findOneAndUpdate(
        { userId: req.user._id, date: logDate },
        {
          userId: req.user._id,
          date: logDate,
          weightKg: Number(weightKg)
        },
        { new: true, upsert: true, runValidators: true }
      );
    }

    res.status(200).json({
      message: 'Log saved successfully',
      dailyLog,
      weightLog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save log', error: error.message });
  }
});

// GET /api/logs - Fetch daily logs for date range
// Query params: range=week|month|custom & from=YYYY-MM-DD & to=YYYY-MM-DD
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { userId: req.user._id };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = String(from);
      if (to) query.date.$lte = String(to);
    }

    const logs = await DailyLog.find(query).sort({ date: 1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
});

// DELETE /api/logs/:id - Delete a daily log entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const log = await DailyLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found or unauthorized' });
    }
    res.json({ message: 'Log entry deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete log', error: error.message });
  }
});

export default router;
