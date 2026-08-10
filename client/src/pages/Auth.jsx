import React, { useState } from 'react';
import { Activity, Flame, ShieldCheck, ArrowRight, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TDEECalculatorModal from '../components/TDEECalculatorModal';

export default function Auth() {
  const { login, register, unit } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [maintenanceCalories, setMaintenanceCalories] = useState('2200');
  const [startingWeight, setStartingWeight] = useState('80');
  const [height, setHeight] = useState('175');
  const [goal, setGoal] = useState('CUT');

  const [isTDEEOpen, setIsTDEEOpen] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        let startKg = startingWeight ? Number(startingWeight) : null;
        if (startKg && unit === 'lbs') startKg = startKg / 2.2;

        await register({
          name,
          email,
          password,
          maintenanceCalories: Number(maintenanceCalories) || 2000,
          startingWeightKg: startKg,
          heightCm: height ? Number(height) : null,
          goal
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 mb-3">
          <Activity className="w-8 h-8 text-dark-900 font-extrabold" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">FitTrack</h1>
        <p className="text-sm font-semibold text-emerald-400 mt-1">Gym Calorie Deficit & Fat-Loss Tracker</p>
      </div>

      {/* Auth Card */}
      <div className="glass-card w-full max-w-md rounded-2xl border border-slate-800 p-6 sm:p-8 z-10 shadow-2xl relative">
        {/* Auth Toggle Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              isLogin ? 'bg-emerald-500 text-dark-900 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              !isLogin ? 'bg-emerald-500 text-dark-900 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahim Khan"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="gympartner@example.com"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              {/* Baseline Maintenance Calories */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Maintenance Calories (TDEE) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTDEEOpen(true)}
                    className="text-[11px] font-semibold text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Calculator className="w-3 h-3" /> Calculate
                  </button>
                </div>
                <input
                  type="number"
                  value={maintenanceCalories}
                  onChange={e => setMaintenanceCalories(e.target.value)}
                  placeholder="2200"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Goal Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CUT', 'MAINTAIN', 'BULK'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        goal === g
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Weight & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Starting Wt ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={startingWeight}
                    onChange={e => setStartingWeight(e.target.value)}
                    placeholder={unit === 'lbs' ? '175' : '80'}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-dark-900 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <TDEECalculatorModal
        isOpen={isTDEEOpen}
        onClose={() => setIsTDEEOpen(false)}
        onSelectValue={val => setMaintenanceCalories(String(val))}
      />
    </div>
  );
}
