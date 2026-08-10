import express from 'express';
import { User } from '../models/User.js';
import { DailyLog } from '../models/DailyLog.js';
import { calculateStreak, calculateWeeklySummary } from '../utils/calculator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

// GET /api/group/leaderboard - Streaks and opt-in weekly deficit for friends/gym group
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monday = getMonday(today);

    // Fetch all users to display leaderboard among friends
    const users = await User.find({}).select('name email startingWeightKg goal maintenanceCalories');

    const leaderboard = await Promise.all(
      users.map(async u => {
        // Fetch all logs for streak calculation
        const userLogs = await DailyLog.find({ userId: u._id }, 'date deficit').sort({ date: -1 });
        const dates = userLogs.map(l => l.date);
        const streak = calculateStreak(dates, today);

        // Fetch current week's logs
        const weekLogs = userLogs.filter(l => l.date >= monday && l.date <= today);
        const weekSummary = calculateWeeklySummary(weekLogs);

        const isCurrentUser = String(u._id) === String(req.user._id);

        return {
          userId: u._id,
          name: u.name,
          isCurrentUser,
          streak,
          daysLoggedThisWeek: weekSummary.daysLogged,
          // Share weekly deficit for current user or default opt-in
          weeklyDeficit: isCurrentUser || req.query.showAll === 'true' ? weekSummary.totalWeeklyDeficit : null,
          estimatedFatLossKg: isCurrentUser || req.query.showAll === 'true' ? weekSummary.estimatedFatLossKg : null,
          goal: u.goal
        };
      })
    );

    // Sort by streak descending, then daysLoggedThisWeek
    leaderboard.sort((a, b) => b.streak - a.streak || b.daysLoggedThisWeek - a.daysLoggedThisWeek);

    res.json({
      leaderboard,
      currentWeekMonday: monday
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

export default router;
