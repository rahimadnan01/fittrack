/**
 * FitTrack Business Calculation Engine
 * Pure, unit-testable calculation functions independent of Express/DB layer.
 * Per Section 8 of FitTrack SSD.
 */

/**
 * Calculates daily deficit
 * @param {number} maintenanceSnapshot - Baseline TDEE at time of log
 * @param {number} caloriesConsumed - Daily intake
 * @returns {number} Deficit (positive = fat loss direction, negative = surplus)
 */
export function calculateDailyDeficit(maintenanceSnapshot, caloriesConsumed) {
  const maintenance = Number(maintenanceSnapshot) || 0;
  const consumed = Number(caloriesConsumed) || 0;
  return maintenance - consumed;
}

/**
 * Calculates estimated fat loss in kilograms and pounds
 * SSD Section 8.4: ~7,700 kcal deficit = 1 kg fat loss (or ~3,500 kcal = 1 lb)
 * @param {number} totalDeficitKcal
 * @returns {{ kg: number, lbs: number }}
 */
export function calculateEstimatedFatLoss(totalDeficitKcal) {
  const deficit = Number(totalDeficitKcal) || 0;
  const kg = deficit / 7700;
  const lbs = deficit / 3500;
  return {
    kg: Math.round(kg * 100) / 100,
    lbs: Math.round(lbs * 100) / 100
  };
}

/**
 * Computes weekly deficit metrics
 * SSD Section 8.2:
 * - totalWeeklyDeficit = sum of deficit across all logged days in the week
 * - averageDailyDeficit = totalWeeklyDeficit / number of days logged (not divided by 7)
 * - daysLogged = count of days logged out of 7
 * @param {Array<{ date: string, deficit: number, caloriesConsumed: number, maintenanceCaloriesSnapshot: number }>} logs
 * @returns {{ totalWeeklyDeficit: number, averageDailyDeficit: number, daysLogged: number, estimatedFatLossKg: number, estimatedFatLossLbs: number }}
 */
export function calculateWeeklySummary(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      totalWeeklyDeficit: 0,
      averageDailyDeficit: 0,
      daysLogged: 0,
      estimatedFatLossKg: 0,
      estimatedFatLossLbs: 0
    };
  }

  const daysLogged = logs.length;
  const totalWeeklyDeficit = logs.reduce((sum, log) => sum + (Number(log.deficit) || 0), 0);
  const averageDailyDeficit = daysLogged > 0 ? Math.round(totalWeeklyDeficit / daysLogged) : 0;
  const fatLoss = calculateEstimatedFatLoss(totalWeeklyDeficit);

  return {
    totalWeeklyDeficit: Math.round(totalWeeklyDeficit),
    averageDailyDeficit,
    daysLogged,
    estimatedFatLossKg: fatLoss.kg,
    estimatedFatLossLbs: fatLoss.lbs
  };
}

/**
 * Computes monthly deficit metrics
 * SSD Section 8.3
 * @param {Array<{ date: string, deficit: number }>} logs - Daily logs for the month
 * @returns {{ totalMonthlyDeficit: number, averageDailyDeficit: number, daysLogged: number, estimatedFatLossKg: number, estimatedFatLossLbs: number }}
 */
export function calculateMonthlySummary(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      totalMonthlyDeficit: 0,
      averageDailyDeficit: 0,
      daysLogged: 0,
      estimatedFatLossKg: 0,
      estimatedFatLossLbs: 0
    };
  }

  const daysLogged = logs.length;
  const totalMonthlyDeficit = logs.reduce((sum, log) => sum + (Number(log.deficit) || 0), 0);
  const averageDailyDeficit = daysLogged > 0 ? Math.round(totalMonthlyDeficit / daysLogged) : 0;
  const fatLoss = calculateEstimatedFatLoss(totalMonthlyDeficit);

  return {
    totalMonthlyDeficit: Math.round(totalMonthlyDeficit),
    averageDailyDeficit,
    daysLogged,
    estimatedFatLossKg: fatLoss.kg,
    estimatedFatLossLbs: fatLoss.lbs
  };
}

/**
 * Computes current consecutive logging streak up to today or yesterday
 * SSD Section 8.5
 * @param {Array<string>} logDates - Array of ISO date strings (YYYY-MM-DD) sorted descending or ascending
 * @param {string} referenceDateStr - ISO date string (YYYY-MM-DD) representing "today"
 * @returns {number} current streak count
 */
export function calculateStreak(logDates = [], referenceDateStr = new Date().toISOString().split('T')[0]) {
  if (!Array.isArray(logDates) || logDates.length === 0) {
    return 0;
  }

  // Format and deduplicate dates set
  const dateSet = new Set(logDates.map(d => String(d).split('T')[0]));

  const refDate = new Date(referenceDateStr);
  
  // Check if today is logged
  const todayStr = refDate.toISOString().split('T')[0];
  
  // Yesterday's date
  const yesterdayDate = new Date(refDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let streak = 0;
  let currDate = new Date(refDate);

  // If today is NOT logged, check if yesterday was logged to maintain ongoing streak
  if (!dateSet.has(todayStr)) {
    if (!dateSet.has(yesterdayStr)) {
      return 0; // Streak broken if neither today nor yesterday was logged
    }
    // Start counting back from yesterday
    currDate = yesterdayDate;
  }

  // Count backwards day by day
  while (true) {
    const currStr = currDate.toISOString().split('T')[0];
    if (dateSet.has(currStr)) {
      streak++;
      currDate.setDate(currDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Mifflin-St Jeor TDEE Calculator Helper
 * BMR = (10 * weightInKg) + (6.25 * heightInCm) - (5 * ageInYears) + s (s = +5 for male, -161 for female)
 * TDEE = BMR * activityMultiplier
 * @param {Object} params
 * @param {number} params.weightKg
 * @param {number} params.heightCm
 * @param {number} params.age
 * @param {'male'|'female'} params.gender
 * @param {number} [params.activityLevel=1.375]
 * @returns {number} Estimated maintenance calories
 */
export function calculateTDEE({ weightKg, heightCm, age = 25, gender = 'male', activityLevel = 1.375 }) {
  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 25;
  const act = Number(activityLevel) || 1.375;

  const genderOffset = gender === 'female' ? -161 : 5;
  const bmr = (10 * w) + (6.25 * h) - (5 * a) + genderOffset;
  return Math.round(bmr * act);
}
