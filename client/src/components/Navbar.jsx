import React from 'react';
import { Flame, Scale, LogOut, User, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ streak = 0, onOpenLogModal }) {
  const { user, logout, unit, toggleUnit } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-dark-900 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FitTrack
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase hidden sm:block">
              Calorie Deficit & Fat Loss
            </p>
          </div>
        </div>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Daily Streak Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              streak > 0
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
            }`}
            title="Current Logging Streak"
          >
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{streak} Day Streak</span>
          </div>

          {/* Unit Toggle Button */}
          <button
            onClick={toggleUnit}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-colors"
            title="Toggle Weight Display Unit"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase">{unit}</span>
          </button>

          {/* Quick Log Action Button */}
          <button
            onClick={onOpenLogModal}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-dark-900 font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            + Log Today
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
