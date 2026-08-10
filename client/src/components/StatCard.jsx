import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 glow-emerald',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30 glow-amber',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 glow-indigo',
    slate: 'text-slate-400 bg-slate-800 border-slate-700'
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.emerald}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-1 text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-amber-400'}>{trend.text}</span>
        </div>
      )}
    </div>
  );
}
