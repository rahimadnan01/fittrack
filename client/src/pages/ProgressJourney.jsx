import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Scale, Target, Sparkles, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../api';

export default function ProgressJourney() {
  const { user, unit } = useAuth();
  const [weightLogs, setWeightLogs] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wRes, dRes] = await Promise.all([api.get('/weight'), api.get('/logs')]);
      setWeightLogs(wRes.data.weightLogs || []);
      setDailyLogs(dRes.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch progress journey data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine daily logs and weight logs for line chart
  const startingWeightKg = user?.startingWeightKg || (weightLogs[0] ? weightLogs[0].weightKg : 80);

  let runningDeficit = 0;
  const chartDataMap = {};

  // Process daily logs to get cumulative deficit fat-loss line
  dailyLogs.forEach(log => {
    runningDeficit += log.deficit || 0;
    const estLossKg = runningDeficit / 7700;
    const predictedWeightKg = Math.round((startingWeightKg - estLossKg) * 100) / 100;

    chartDataMap[log.date] = {
      date: log.date,
      predictedWeight: unit === 'lbs' ? Math.round(predictedWeightKg * 2.2 * 10) / 10 : predictedWeightKg
    };
  });

  // Merge scale weight entries
  weightLogs.forEach(w => {
    const val = unit === 'lbs' ? Math.round(w.weightKg * 2.2 * 10) / 10 : w.weightKg;
    if (!chartDataMap[w.date]) {
      chartDataMap[w.date] = { date: w.date };
    }
    chartDataMap[w.date].actualScaleWeight = val;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => (a.date > b.date ? 1 : -1));

  const latestScaleWeightKg = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : startingWeightKg;
  const netScaleChangeKg = Math.round((startingWeightKg - latestScaleWeightKg) * 100) / 100;

  const displayStartWeight = unit === 'lbs' ? (startingWeightKg * 2.2).toFixed(1) : startingWeightKg.toFixed(1);
  const displayCurrentWeight = unit === 'lbs' ? (latestScaleWeightKg * 2.2).toFixed(1) : latestScaleWeightKg.toFixed(1);
  const displayNetChange = unit === 'lbs' ? (netScaleChangeKg * 2.2).toFixed(1) : netScaleChangeKg.toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Fat-Loss Progress & Weight Trend</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Scale weight vs Calorie Math predictions</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
          {user?.goal || 'CUT'} Goal
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Starting Weight"
              value={`${displayStartWeight} ${unit}`}
              subtitle="Profile baseline"
              icon={Scale}
              color="slate"
            />
            <StatCard
              title="Current Weight"
              value={`${displayCurrentWeight} ${unit}`}
              subtitle="Latest scale entry"
              icon={Activity}
              color="indigo"
            />
            <StatCard
              title="Total Scale Loss"
              value={`${netScaleChangeKg >= 0 ? '-' : '+'}${Math.abs(displayNetChange)} ${unit}`}
              subtitle="Starting vs Current scale difference"
              icon={Target}
              color={netScaleChangeKg >= 0 ? 'emerald' : 'amber'}
            />
          </div>

          {/* Combined Trend Line Chart */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white">Weight & Fat Loss Trajectory</h3>
                <p className="text-xs text-slate-400">Comparing actual scale weight against predicted calorie deficit trajectory</p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <p className="text-sm font-semibold">No progress data logged yet</p>
                <p className="text-xs text-slate-600">Start logging daily intake and weight to generate your trend chart!</p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc'
                      }}
                      formatter={(val, name) => [`${val} ${unit}`, name === 'actualScaleWeight' ? 'Actual Scale Wt' : 'Predicted Wt (Math)']}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="actualScaleWeight"
                      name="Actual Scale Weight"
                      stroke="#818cf8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#818cf8' }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedWeight"
                      name="Calorie Math Prediction"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
