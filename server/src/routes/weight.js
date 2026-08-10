import express from 'express';
import { WeightLog } from '../models/WeightLog.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/weight - Log a weight entry independent of daily calorie log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, weightKg } = req.body;

    if (!date || weightKg === undefined) {
      return res.status(400).json({ message: 'Date and weightKg are required' });
    }

    const logDate = String(date).split('T')[0];

    const weightLog = await WeightLog.findOneAndUpdate(
      { userId: req.user._id, date: logDate },
      {
        userId: req.user._id,
        date: logDate,
        weightKg: Number(weightKg)
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Weight logged successfully', weightLog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log weight', error: error.message });
  }
});

// GET /api/weight - Fetch weight history for charting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { userId: req.user._id };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = String(from);
      if (to) query.date.$lte = String(to);
    }

    const weightLogs = await WeightLog.find(query).sort({ date: 1 });
    res.json({ weightLogs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weight logs', error: error.message });
  }
});

export default router;
