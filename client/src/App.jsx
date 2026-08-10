import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import LogModal from './components/LogModal';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WeeklySummary from './pages/WeeklySummary';
import MonthlySummary from './pages/MonthlySummary';
import ProgressJourney from './pages/ProgressJourney';
import ProfileSettings from './pages/ProfileSettings';
import GroupLeaderboard from './pages/GroupLeaderboard';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading FitTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col">
      {/* Top Header Navbar */}
      <Navbar streak={streak} onOpenLogModal={() => setIsLogModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Navigation Sidebar */}
        <Sidebar onOpenLogModal={() => setIsLogModalOpen(true)} />

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard onOpenLogModal={() => setIsLogModalOpen(true)} setStreak={setStreak} />} />
            <Route path="/weekly" element={<WeeklySummary />} />
            <Route path="/monthly" element={<MonthlySummary />} />
            <Route path="/progress" element={<ProgressJourney />} />
            <Route path="/group" element={<GroupLeaderboard />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <BottomNav onOpenLogModal={() => setIsLogModalOpen(true)} />

      {/* Global Log Today Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh event or state update
          window.location.reload();
        }}
      />
    </div>
  );
}
