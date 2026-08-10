import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarRange, TrendingUp, Users, Settings, PlusCircle } from 'lucide-react';

export default function BottomNav({ onOpenLogModal }) {
  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/weekly', label: 'Weekly', icon: CalendarDays },
    { to: '/monthly', label: 'Monthly', icon: CalendarRange },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/group', label: 'Group', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Floating Log Button */}
      <div className="fixed bottom-16 right-4 z-40 lg:hidden">
        <button
          onClick={onOpenLogModal}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-dark-900 flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all"
          title="Log Today's Calories"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden glass-panel border-t border-slate-800 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-400 font-medium hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
