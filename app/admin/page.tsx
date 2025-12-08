'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminProductManager from '@/components/AdminProductManager';
import AdminUserManager from '@/components/AdminUserManager';
import AdminCodesManager from '@/components/AdminCodesManager';

type TabType = 'products' | 'codes' | 'users' | 'analytics';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      // Check if user is admin
      const checkAdmin = async () => {
        try {
          const response = await fetch('/api/admin/check', {
            method: 'GET',
          });
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            router.push('/');
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
          router.push('/');
        } finally {
          setLoading(false);
        }
      };
      checkAdmin();
    }
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-slate-400 text-sm sm:text-base">Manage your store and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-slate-700 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 Products
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
              activeTab === 'codes'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎫 Codes
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'products' && <AdminProductManager />}
          {activeTab === 'codes' && <AdminCodesManager />}
          {activeTab === 'users' && <AdminUserManager />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Clicks"
          value={stats?.totalClicks?.toLocaleString() || 0}
          icon="🖱️"
          color="purple"
        />
        <StatCard
          title="Total Points"
          value={stats?.totalPoints?.toLocaleString() || 0}
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="green"
        />
      </div>

      {/* Vercel Analytics Notice */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📊</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Vercel Analytics Active</h3>
            <p className="text-slate-300 mb-3">
              Your app is tracking page views, user interactions, and performance metrics with Vercel Analytics.
            </p>
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-all"
            >
              View Vercel Dashboard →
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">📈 App Statistics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-slate-300">Active Users (Last 24h)</span>
            <span className="text-white font-bold">{stats?.activeUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-slate-300">Total Orders</span>
            <span className="text-white font-bold">{stats?.totalOrders || 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-slate-300">Points Distributed Today</span>
            <span className="text-white font-bold">{stats?.pointsToday?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
            <span className="text-slate-300">Ad Views</span>
            <span className="text-white font-bold">{stats?.totalAdViews || 0}</span>
          </div>
        </div>
      </div>

      {/* Top Users */}
      {stats?.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Top Users by Points</h3>
          <div className="space-y-3">
            {stats.topUsers.map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</span>
                  <div>
                    <p className="text-white font-semibold">{user.name || 'Anonymous'}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{user.points?.toLocaleString()} pts</p>
                  <p className="text-slate-400 text-sm">{user.clicks?.toLocaleString()} clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-800',
    purple: 'from-purple-600 to-purple-800',
    yellow: 'from-yellow-600 to-orange-800',
    green: 'from-green-600 to-emerald-800',
  }[color];

  return (
    <div className={`bg-gradient-to-br ${colorClasses} rounded-2xl p-6 border border-white/10`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  );
}
