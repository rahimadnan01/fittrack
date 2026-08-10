import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, TrendingUp, Flame, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../api';

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

export default function WeeklySummary() {
  const { user, unit } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const [weekStart, setWeekStart] = useState(getMonday(todayStr));
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeekly = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/summary/weekly?weekStart=${weekStart}`);
      setWeeklyData(res.data);
    } catch (err) {
      console.error('Failed to fetch weekly summary:', err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchWeekly();
  }, [fetchWeekly]);

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const { summary, logs = [] } = weeklyData || {};
  const maintenance = user?.maintenanceCalories || 2000;

  // Prepare chart data for 7 days Mon-Sun
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = daysOfWeek.map((dayName, idx) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const foundLog = logs.find(l => l.date === dateStr);

    return {
      day: dayName,
      date: dateStr,
      calories: foundLog ? foundLog.caloriesConsumed : 0,
      deficit: foundLog ? foundLog.deficit : 0,
      logged: !!foundLog
    };
  });

  const fatLossText = unit === 'lbs' ? `${summary?.estimatedFatLossLbs || 0} lbs` : `${summary?.estimatedFatLossKg || 0} kg`;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Weekly Summary</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Automatic deficit rollup (Mon–Sun)</p>
        </div>

        {/* Date Navigator Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-between">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-extrabold text-emerald-400 px-3">
            {weekStart} to {weeklyData?.weekEnd}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next Week"
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
          {/* Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Week Deficit"
              value={`${summary?.totalWeeklyDeficit >= 0 ? '+' : ''}${summary?.totalWeeklyDeficit || 0} kcal`}
              subtitle="Cumulative intake vs maintenance"
              icon={TrendingUp}
              color={summary?.totalWeeklyDeficit >= 0 ? 'emerald' : 'amber'}
            />
            <StatCard
              title="Avg Daily Deficit"
              value={`${summary?.averageDailyDeficit >= 0 ? '+' : ''}${summary?.averageDailyDeficit || 0} kcal`}
              subtitle="Calculated over logged days"
              icon={Flame}
              color="emerald"
            />
            <StatCard
              title="Days Logged"
              value={`${summary?.daysLogged || 0} / 7`}
              subtitle={`${Math.round(((summary?.daysLogged || 0) / 7) * 100)}% weekly consistency`}
              icon={Award}
              color="indigo"
            />
            <StatCard
              title="Est. Fat Loss"
              value={fatLossText}
              subtitle="7,700 kcal = 1 kg fat loss"
              icon={TrendingUp}
              color="emerald"
            />
          </div>

          {/* Calorie Intake vs Baseline Chart */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white">Daily Intake Breakdown</h3>
                <p className="text-xs text-slate-400">Green line represents baseline maintenance threshold ({maintenance} kcal)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Intakes
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Maintenance Target
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 'dataMax + 500']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc'
                    }}
                    formatter={(val, name) => [`${val} kcal`, name === 'calories' ? 'Consumed' : name]}
                  />
                  <ReferenceLine y={maintenance} stroke="#10b981" strokeDasharray="4 4" label={{ value: `TDEE ${maintenance}`, fill: '#10b981', fontSize: 10, position: 'top' }} />
                  <Bar dataKey="calories" fill="#34d399" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
