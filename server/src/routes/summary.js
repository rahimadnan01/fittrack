import express from 'express';
import { DailyLog } from '../models/DailyLog.js';
import { WeightLog } from '../models/WeightLog.js';
import {
  calculateWeeklySummary,
  calculateMonthlySummary,
  calculateStreak,
  calculateEstimatedFatLoss
} from '../utils/calculator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to get Monday of a given date week
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

// GET /api/summary/weekly?weekStart=YYYY-MM-DD
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = req.query.weekStart || getMonday(today);

    // Calculate week end date (Sunday, 6 days after Monday)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const weekEnd = endDate.toISOString().split('T')[0];

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: weekStart, $lte: weekEnd }
    }).sort({ date: 1 });

    const summary = calculateWeeklySummary(logs);

    res.json({
      weekStart,
      weekEnd,
      summary,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate weekly summary', error: error.message });
  }
});

// GET /api/summary/monthly?month=YYYY-MM
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const month = req.query.month || today.slice(0, 7); // e.g. "2026-08"

    const from = `${month}-01`;
    // Find last day of month
    const [year, m] = month.split('-').map(Number);
    const lastDayNum = new Date(year, m, 0).getDate();
    const to = `${month}-${String(lastDayNum).padStart(2, '0')}`;

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: from, $lte: to }
    }).sort({ date: 1 });

    const summary = calculateMonthlySummary(logs);

    // Fetch weight logs for the month to compare estimated vs actual fat loss
    const weightLogs = await WeightLog.find({
      userId: req.user._id,
      date: { $gte: from, $lte: to }
    }).sort({ date: 1 });

    let actualWeightChangeKg = null;
    let actualWeightChangeLbs = null;

    if (weightLogs.length >= 2) {
      const firstWeight = weightLogs[0].weightKg;
      const lastWeight = weightLogs[weightLogs.length - 1].weightKg;
      const diffKg = Math.round((firstWeight - lastWeight) * 100) / 100;
      actualWeightChangeKg = diffKg;
      actualWeightChangeLbs = Math.round(diffKg * 2.2 * 100) / 100;
    }

    res.json({
      month,
      from,
      to,
      summary,
      actualWeightChangeKg,
      actualWeightChangeLbs,
      logs,
      weightLogs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate monthly summary', error: error.message });
  }
});

// GET /api/summary/dashboard - Dashboard overview stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monday = getMonday(today);

    // Fetch all user daily log dates for streak calculation
    const allLogs = await DailyLog.find({ userId: req.user._id }, 'date deficit caloriesConsumed').sort({ date: -1 });
    const logDates = allLogs.map(l => l.date);

    const currentStreak = calculateStreak(logDates, today);

    // Today's entry
    const todayLog = await DailyLog.findOne({ userId: req.user._id, date: today });

    // Current week logs
    const currentWeekLogs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: monday, $lte: today }
    });

    const weeklySummary = calculateWeeklySummary(currentWeekLogs);

    // Cumulative total deficit for progress charting
    const totalDeficitAllTime = allLogs.reduce((acc, curr) => acc + (curr.deficit || 0), 0);
    const cumulativeFatLoss = calculateEstimatedFatLoss(totalDeficitAllTime);

    // Weight progress
    const latestWeightLog = await WeightLog.findOne({ userId: req.user._id }).sort({ date: -1 });
    const firstWeightLog = await WeightLog.findOne({ userId: req.user._id }).sort({ date: 1 });

    const startingWeight = req.user.startingWeightKg || (firstWeightLog ? firstWeightLog.weightKg : null);
    const currentWeight = latestWeightLog ? latestWeightLog.weightKg : startingWeight;

    res.json({
      todayLogged: !!todayLog,
      todayLog,
      currentStreak,
      weeklySummary,
      cumulativeFatLoss,
      startingWeight,
      currentWeight,
      maintenanceCalories: req.user.maintenanceCalories,
      goal: req.user.goal
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: error.message });
  }
});

export default router;
