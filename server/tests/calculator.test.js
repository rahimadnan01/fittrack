import { describe, it, expect } from 'vitest';
import {
  calculateDailyDeficit,
  calculateEstimatedFatLoss,
  calculateWeeklySummary,
  calculateMonthlySummary,
  calculateStreak,
  calculateTDEE
} from '../src/utils/calculator.js';

describe('FitTrack Business Logic Calculator', () => {
  it('calculates daily deficit correctly', () => {
    // Maintenance = 2500, eaten = 2000 => deficit = +500
    expect(calculateDailyDeficit(2500, 2000)).toBe(500);

    // Surplus case: Maintenance = 2200, eaten = 2700 => deficit = -500
    expect(calculateDailyDeficit(2200, 2700)).toBe(-500);
  });

  it('calculates estimated fat loss correctly', () => {
    // 7700 kcal deficit = 1 kg fat loss
    const res = calculateEstimatedFatLoss(7700);
    expect(res.kg).toBe(1);
    expect(res.lbs).toBe(2.2);

    const resHalf = calculateEstimatedFatLoss(3850);
    expect(resHalf.kg).toBe(0.5);
  });

  it('calculates weekly summary correctly', () => {
    const logs = [
      { date: '2026-08-01', deficit: 500, caloriesConsumed: 2000, maintenanceCaloriesSnapshot: 2500 },
      { date: '2026-08-02', deficit: 600, caloriesConsumed: 1900, maintenanceCaloriesSnapshot: 2500 },
      { date: '2026-08-03', deficit: 400, caloriesConsumed: 2100, maintenanceCaloriesSnapshot: 2500 },
      { date: '2026-08-04', deficit: 500, caloriesConsumed: 2000, maintenanceCaloriesSnapshot: 2500 },
      { date: '2026-08-05', deficit: 300, caloriesConsumed: 2200, maintenanceCaloriesSnapshot: 2500 },
    ];

    const summary = calculateWeeklySummary(logs);
    expect(summary.daysLogged).toBe(5);
    expect(summary.totalWeeklyDeficit).toBe(2300);
    expect(summary.averageDailyDeficit).toBe(460); // 2300 / 5 = 460
    expect(summary.estimatedFatLossKg).toBe(0.3); // 2300 / 7700 ~ 0.30
  });

  it('calculates streaks accurately', () => {
    const today = '2026-08-11';
    const dates = ['2026-08-11', '2026-08-10', '2026-08-09', '2026-08-08'];
    expect(calculateStreak(dates, today)).toBe(4);

    // If today is NOT logged yet, but yesterday was logged, streak should be 3
    const datesWithoutToday = ['2026-08-10', '2026-08-09', '2026-08-08'];
    expect(calculateStreak(datesWithoutToday, today)).toBe(3);

    // Broken streak (missing yesterday)
    const brokenDates = ['2026-08-09', '2026-08-08'];
    expect(calculateStreak(brokenDates, today)).toBe(0);
  });

  it('calculates TDEE using Mifflin-St Jeor equation', () => {
    // Male: 80kg, 180cm, 30yo, moderate activity (1.55)
    // BMR = (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
    // TDEE = 1780 * 1.55 = 2759
    const tdee = calculateTDEE({ weightKg: 80, heightCm: 180, age: 30, gender: 'male', activityLevel: 1.55 });
    expect(tdee).toBe(2759);
  });
});
