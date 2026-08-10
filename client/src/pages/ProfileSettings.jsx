import React, { useState, useEffect } from 'react';
import { Settings, Calculator, History, Save, Scale, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TDEECalculatorModal from '../components/TDEECalculatorModal';
import api from '../api';

export default function ProfileSettings() {
  const { user, updateProfile, unit } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [maintenance, setMaintenance] = useState(user?.maintenanceCalories || 2000);
  const [goal, setGoal] = useState(user?.goal || 'CUT');
  const [startingWeight, setStartingWeight] = useState(
    user?.startingWeightKg ? (unit === 'lbs' ? (user.startingWeightKg * 2.2).toFixed(1) : user.startingWeightKg) : ''
  );
  const [height, setHeight] = useState(user?.heightCm || '');

  const [history, setHistory] = useState([]);
  const [isTDEEOpen, setIsTDEEOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/profile');
        setHistory(res.data.maintenanceHistory || []);
      } catch (err) {
        console.error('Failed to fetch profile history:', err);
      }
    }
    fetchHistory();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let startKg = startingWeight ? Number(startingWeight) : null;
      if (startKg && unit === 'lbs') startKg = startKg / 2.2;

      const res = await updateProfile({
        name,
        maintenanceCalories: Number(maintenance),
        goal,
        startingWeightKg: startKg,
        heightCm: height ? Number(height) : null
      });

      setMessage('Baseline profile updated successfully!');
      if (res.maintenanceHistory) setHistory(res.maintenanceHistory);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-extrabold text-white">Baseline Profile & Settings</h2>
            <p className="text-xs text-slate-400">Manage TDEE maintenance calories & personal fitness parameters</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
        <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">Personal Baseline</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Maintenance Calories (TDEE)
              </label>
              <button
                type="button"
                onClick={() => setIsTDEEOpen(true)}
                className="text-[11px] font-semibold text-teal-400 hover:underline flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" /> Re-calculate TDEE
              </button>
            </div>
            <input
              type="number"
              value={maintenance}
              onChange={e => setMaintenance(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Primary Goal Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Primary Goal</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'CUT', label: 'Fat Cut', desc: 'Calorie Deficit' },
              { id: 'MAINTAIN', label: 'Maintain', desc: 'Equal Intake' },
              { id: 'BULK', label: 'Clean Bulk', desc: 'Calorie Surplus' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGoal(item.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  goal === item.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-slate-100 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <p className="text-xs font-extrabold text-white">{item.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Weight & Height Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Starting Weight ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              value={startingWeight}
              onChange={e => setStartingWeight(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-dark-900 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save Baseline Changes</span>
        </button>
      </form>

      {/* Maintenance History Audit Log */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <History className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-extrabold text-white">Maintenance Baseline Audit History</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No historical changes logged yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item._id || item.effectiveFrom}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs"
              >
                <span className="font-semibold text-slate-300">Effective Date: {item.effectiveFrom}</span>
                <span className="font-extrabold text-emerald-400">{item.maintenanceCalories} kcal/day</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <TDEECalculatorModal
        isOpen={isTDEEOpen}
        onClose={() => setIsTDEEOpen(false)}
        onSelectValue={val => setMaintenance(val)}
      />
    </div>
  );
}
