import React, { useState } from 'react';
import { X, Calculator, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TDEECalculatorModal({ isOpen, onClose, onSelectValue }) {
  const { unit } = useAuth();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.375'); // Lightly active

  if (!isOpen) return null;

  const activityOptions = [
    { value: '1.2', label: 'Sedentary', desc: 'Little to no exercise' },
    { value: '1.375', label: 'Lightly Active', desc: '1-3 days/week exercise' },
    { value: '1.55', label: 'Moderately Active', desc: '3-5 days/week exercise' },
    { value: '1.725', label: 'Very Active', desc: '6-7 days/week heavy exercise' },
    { value: '1.9', label: 'Extremely Active', desc: 'Physical job or 2x training' }
  ];

  // Calculate Mifflin-St Jeor
  let calculatedTDEE = null;
  if (weight && height && age) {
    let wKg = Number(weight);
    if (unit === 'lbs') wKg = wKg / 2.2;
    const hCm = Number(height);
    const aYears = Number(age);
    const actMult = Number(activity);

    const s = gender === 'female' ? -161 : 5;
    const bmr = 10 * wKg + 6.25 * hCm - 5 * aYears + s;
    calculatedTDEE = Math.round(bmr * actMult);
  }

  const handleUseCalculated = () => {
    if (calculatedTDEE) {
      onSelectValue(calculatedTDEE);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">TDEE Calculator</h2>
              <p className="text-xs text-slate-400">Mifflin-St Jeor Formula Baseline Estimator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold capitalize transition-all ${
                    gender === g
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Weight ({unit})
              </label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={unit === 'lbs' ? '175' : '80'}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Activity Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Daily Activity Level
            </label>
            <div className="space-y-2">
              {activityOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setActivity(opt.value)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    activity === opt.value
                      ? 'bg-teal-500/15 border-teal-500/50 text-slate-100'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">{opt.label}</p>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                  {activity === opt.value && <Check className="w-4 h-4 text-teal-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Result Banner */}
          {calculatedTDEE && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 text-center space-y-1">
              <p className="text-xs font-semibold text-teal-300">Estimated Daily Maintenance TDEE</p>
              <p className="text-3xl font-extrabold text-white">{calculatedTDEE} kcal/day</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUseCalculated}
            disabled={!calculatedTDEE}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-dark-900 font-extrabold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            Apply This Baseline
          </button>
        </div>
      </div>
    </div>
  );
}
