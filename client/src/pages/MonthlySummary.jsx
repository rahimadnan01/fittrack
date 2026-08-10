import React, { useState, useEffect, useCallback } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, TrendingUp, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../api';

export default function MonthlySummary() {
  const { unit } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // "YYYY-MM"

  const [month, setMonth] = useState(currentMonthStr);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthly = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/summary/monthly?month=${month}`);
      setMonthlyData(res.data);
    } catch (err) {
      console.error('Failed to fetch monthly summary:', err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchMonthly();
  }, [fetchMonthly]);

  const handlePrevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    const prevStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setMonth(prevStr);
  };

  const handleNextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setMonth(nextStr);
  };

  const { summary, actualWeightChangeKg, actualWeightChangeLbs, logs = [] } = monthlyData || {};

  const estimatedFatLossText = unit === 'lbs' ? `${summary?.estimatedFatLossLbs || 0} lbs` : `${summary?.estimatedFatLossKg || 0} kg`;

  const actualWeightText = actualWeightChangeKg !== null
    ? (unit === 'lbs' ? `${actualWeightChangeLbs} lbs` : `${actualWeightChangeKg} kg`)
    : 'No scale entries';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Monthly Rollup</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Month-over-month deficit & fat-loss comparison</p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-extrabold text-emerald-400 px-4 uppercase tracking-wider">
            {month}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Month Deficit"
              value={`${summary?.totalMonthlyDeficit >= 0 ? '+' : ''}${summary?.totalMonthlyDeficit || 0} kcal`}
              subtitle="Aggregated across month"
              icon={TrendingUp}
              color={summary?.totalMonthlyDeficit >= 0 ? 'emerald' : 'amber'}
            />
            <StatCard
              title="Avg Daily Deficit"
              value={`${summary?.averageDailyDeficit >= 0 ? '+' : ''}${summary?.averageDailyDeficit || 0} kcal`}
              subtitle="Average over active days"
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Est. Fat Loss (Math)"
              value={estimatedFatLossText}
              subtitle="7,700 kcal / kg formula"
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Actual Scale Weight"
              value={actualWeightText}
              subtitle="Difference in logged scale weight"
              icon={Scale}
              color="indigo"
            />
          </div>

          {/* Reality Check Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Calorie Math vs Scale Reality Check</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your estimated fat loss based on calorie deficit is <strong className="text-emerald-400">{estimatedFatLossText}</strong>.
                  {actualWeightChangeKg !== null ? (
                    <span> Your actual logged scale weight change over this period is <strong className="text-indigo-400">{actualWeightText}</strong>.</span>
                  ) : (
                    <span> Log your body weight regularly to compare real scale progress against predicted fat loss!</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
