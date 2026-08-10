import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarRange, TrendingUp, Users, Settings, PlusCircle } from 'lucide-react';

export default function Sidebar({ onOpenLogModal }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/weekly', label: 'Weekly Summary', icon: CalendarDays },
    { to: '/monthly', label: 'Monthly Rollup', icon: CalendarRange },
    { to: '/progress', label: 'Fat-Loss Progress', icon: TrendingUp },
    { to: '/group', label: 'Gym Partners', icon: Users },
    { to: '/settings', label: 'Baseline & Profile', icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-800 p-4 sticky top-16 h-[calc(100vh-4rem)]">
      {/* Primary Log Action Button */}
      <button
        onClick={onOpenLogModal}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-dark-900 font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
      >
        <PlusCircle className="w-5 h-5" />
        Log Today's Intake
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* App Version Info */}
      <div className="pt-4 border-t border-slate-800 text-center">
        <p className="text-xs font-semibold text-slate-500">FitTrack v1.0 • PWA Ready</p>
        <p className="text-[10px] text-emerald-500/70 mt-0.5">3 Gym Partners Shared Tracker</p>
      </div>
    </aside>
  );
}
