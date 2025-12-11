'use client';

/**
 * Leaderboard Page
 * 
 * Public page displaying competitive rankings and user standings.
 * Shows top players across different time periods and ranking criteria.
 */

import { useEffect } from 'react';
import LeaderboardComponent from '@/components/LeaderboardComponent';

export default function LeaderboardPage() {
  useEffect(() => {
    document.title = 'Leaderboard - ClickerPro';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            🏆 Leaderboard
          </h1>
          <p className="text-slate-300 text-lg">
            Compete with players worldwide and climb to the top!
          </p>
        </div>

        {/* Leaderboard Component */}
        <LeaderboardComponent />

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-white font-semibold mb-2">Global Rankings</h3>
            <p className="text-slate-400 text-sm">
              Compete with players from around the world
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="text-white font-semibold mb-2">Weekly Resets</h3>
            <p className="text-slate-400 text-sm">
              Fresh competition every Monday
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🏅</div>
            <h3 className="text-white font-semibold mb-2">Earn Rewards</h3>
            <p className="text-slate-400 text-sm">
              Top players get exclusive bonuses
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
