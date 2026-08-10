import React, { useState, useEffect } from 'react';
import { Users, Flame, Trophy, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function GroupLeaderboard() {
  const { user, unit } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAllDeficits, setShowAllDeficits] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await api.get(`/group/leaderboard?showAll=${showAllDeficits}`);
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        console.error('Failed to fetch group leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [showAllDeficits]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Gym Partners Leaderboard</h2>
            <p className="text-xs text-slate-400">Shared motivation, logging streaks & weekly consistency</p>
          </div>
        </div>

        {/* Opt-In Toggle Switch */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showAllDeficits}
            onChange={e => setShowAllDeficits(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <span>Share & view weekly deficits</span>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((member, index) => {
            const isTop3 = index < 3;
            const rankBadge = index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `#${index + 1}`;

            return (
              <div
                key={member.userId}
                className={`glass-card p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  member.isCurrentUser
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-extrabold shadow-md ${
                      index === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 glow-amber'
                        : index === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                        : index === 2
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rankBadge}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{member.name}</h3>
                      {member.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Goal: <strong className="text-slate-300">{member.goal || 'CUT'}</strong> • {member.daysLoggedThisWeek} / 7 days logged this week
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                  {/* Streak Flame */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs">
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span>{member.streak} Day Streak</span>
                  </div>

                  {/* Opt-in Deficit Display */}
                  {member.weeklyDeficit !== null && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Week Deficit
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          member.weeklyDeficit >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {member.weeklyDeficit >= 0 ? `+${member.weeklyDeficit}` : member.weeklyDeficit} kcal
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
