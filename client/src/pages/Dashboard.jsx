import React, { useState, useEffect, useCallback } from 'react';
import { Flame, PlusCircle, TrendingUp, Scale, AlertCircle, CheckCircle2, Trash2, Calendar, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../api';

export default function Dashboard({ onOpenLogModal, setStreak }) {
  const { user, unit } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/summary/dashboard');
      setDashboardData(res.data);
      if (setStreak) setStreak(res.data.currentStreak);

      const logsRes = await api.get('/logs');
      setRecentLogs(logsRes.data.logs.slice(-7).reverse()); // Last 7 days
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [setStreak]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDeleteLog = async id => {
    if (!window.confirm('Are you sure you want to remove this daily log entry?')) return;
    try {
      await api.delete(`/logs/${id}`);
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete log entry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { todayLogged, todayLog, currentStreak, weeklySummary, cumulativeFatLoss, currentWeight } = dashboardData || {};

  const displayWeight = currentWeight
    ? unit === 'lbs'
      ? (currentWeight * 2.2).toFixed(1)
      : Number(currentWeight).toFixed(1)
    : '—';

  const fatLossValue = unit === 'lbs' ? `${cumulativeFatLoss?.lbs || 0} lbs` : `${cumulativeFatLoss?.kg || 0} kg`;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Today's Status */}
      <div
        className={`p-6 rounded-2xl border transition-all glass-card ${
          todayLogged
            ? 'bg-gradient-to-r from-emerald-950/40 via-dark-800 to-dark-900 border-emerald-500/30'
            : 'bg-gradient-to-r from-amber-950/30 via-dark-800 to-dark-900 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                todayLogged
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {todayLogged ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6 animate-bounce" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  {todayLogged ? "Today's Intake Logged" : "You haven't logged today"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                  {user?.goal || 'CUT'} MODE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayLogged
                  ? `Consumed: ${todayLog?.caloriesConsumed} kcal • Deficit: ${todayLog?.deficit >= 0 ? '+' : ''}${todayLog?.deficit} kcal`
                  : `Target Baseline: ${user?.maintenanceCalories || 2000} kcal/day`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogModal}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
              todayLogged
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-900 shadow-emerald-500/30'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{todayLogged ? 'Edit Today Entry' : 'Log Today Calories'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Streak Counter"
          value={`${currentStreak} Days`}
          subtitle="Consecutive logging streak"
          icon={Flame}
          color={currentStreak > 0 ? 'amber' : 'slate'}
        />
        <StatCard
          title="This Week Deficit"
          value={`${weeklySummary?.totalWeeklyDeficit >= 0 ? '+' : ''}${weeklySummary?.totalWeeklyDeficit || 0} kcal`}
          subtitle={`${weeklySummary?.daysLogged || 0} / 7 days logged`}
          icon={TrendingUp}
          color={weeklySummary?.totalWeeklyDeficit >= 0 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Cumulative Fat Loss"
          value={fatLossValue}
          subtitle="Calculated from total deficit"
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Latest Weight"
          value={`${displayWeight} ${unit}`}
          subtitle={`Goal: ${user?.goal || 'CUT'}`}
          icon={Scale}
          color="indigo"
        />
      </div>

      {/* Recent Entries Section */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">Recent Daily Logs</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <p className="text-sm font-semibold">No calorie entries logged yet</p>
            <p className="text-xs text-slate-600">Tap "Log Today Calories" above to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Calories Eaten</th>
                  <th className="py-3 px-4">Baseline</th>
                  <th className="py-3 px-4">Net Deficit</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                {recentLogs.map(log => {
                  const isDeficit = log.deficit >= 0;
                  return (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{log.date}</td>
                      <td className="py-3 px-4">{log.caloriesConsumed} kcal</td>
                      <td className="py-3 px-4 text-slate-400">{log.maintenanceCaloriesSnapshot} kcal</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold ${
                            isDeficit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isDeficit ? `+${log.deficit}` : log.deficit} kcal
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic max-w-[150px] truncate">{log.note || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteLog(log._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
