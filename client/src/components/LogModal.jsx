import React, { useState, useEffect } from 'react';
import { X, Flame, Scale, FileText, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LogModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { user, unit } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || todayStr);
      setCalories(initialData.caloriesConsumed || '');
      setWeight(initialData.weightKg ? (unit === 'lbs' ? (initialData.weightKg * 2.2).toFixed(1) : initialData.weightKg) : '');
      setNote(initialData.note || '');
    } else {
      setDate(todayStr);
      setCalories('');
      setWeight('');
      setNote('');
    }
    setError('');
  }, [initialData, isOpen, todayStr, unit]);

  if (!isOpen) return null;

  const maintenance = user?.maintenanceCalories || 2000;
  const eatenNum = Number(calories) || 0;
  const projectedDeficit = eatenNum > 0 ? maintenance - eatenNum : null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!calories || Number(calories) <= 0) {
      setError('Please enter a valid calorie amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert weight to kg if input was in lbs
      let weightInKg = weight ? Number(weight) : null;
      if (weightInKg && unit === 'lbs') {
        weightInKg = weightInKg / 2.2;
      }

      await api.post('/logs', {
        date,
        caloriesConsumed: Number(calories),
        weightKg: weightInKg,
        note
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save log entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Log Daily Intake</h2>
              <p className="text-xs text-slate-400">Record calories & optional body weight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Entry Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          {/* Calories Consumed */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Calories Consumed (kcal) *
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Baseline: {maintenance} kcal</span>
            </label>
            <input
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="e.g. 1850"
              min="1"
              max="10000"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Dynamic Deficit Live Calculator Preview */}
          {projectedDeficit !== null && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                projectedDeficit >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    projectedDeficit >= 0 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className="text-xs font-semibold">
                  {projectedDeficit >= 0 ? 'Projected Daily Deficit' : 'Projected Daily Surplus'}
                </span>
              </div>
              <span className="text-sm font-extrabold">
                {projectedDeficit >= 0 ? `+${projectedDeficit}` : projectedDeficit} kcal
              </span>
            </div>
          )}

          {/* Weight Log (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                Body Weight ({unit}) <span className="text-slate-500 font-normal">(Optional)</span>
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder={`e.g. ${unit === 'lbs' ? '175.5' : '79.8'}`}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Notes / Tag <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Heavy leg day, cheat meal, fasting"
              maxLength="100"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-dark-900 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving Entry...' : 'Save Log Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
