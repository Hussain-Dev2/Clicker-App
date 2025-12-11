'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Toast from '@/components/Toast';

// Separate component for search params logic
function ReferralHandler({ setReferralCode }: { setReferralCode: (code: string | null) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get referral code from URL
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      // Store in session storage for after OAuth redirect
      sessionStorage.setItem('referralCode', ref);
    }
  }, [searchParams, setReferralCode]);

  return null;
}

function RegisterContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralApplied, setReferralApplied] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !referralApplied) {
      // Check if there's a referral code to apply
      const storedRef = sessionStorage.getItem('referralCode');
      if (storedRef) {
        applyReferralCode(storedRef);
      } else {
        router.push('/');
      }
    }
  }, [status, router, referralApplied]);

  const applyReferralCode = async (code: string) => {
    try {
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code }),
      });

      const data = await response.json();
      
      if (data.success) {
        setToast({
          message: `🎉 Welcome! You received ${data.bonusAwarded} bonus points!`,
          type: 'success',
        });
        sessionStorage.removeItem('referralCode');
        setTimeout(() => router.push('/'), 2000);
      } else {
        // Even if referral fails, still redirect (user already registered)
        sessionStorage.removeItem('referralCode');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to apply referral:', error);
      sessionStorage.removeItem('referralCode');
      router.push('/');
    } finally {
      setReferralApplied(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Registration is now done through Google OAuth
    setToast({
      message: 'Please use Google Sign-In to register',
      type: 'error',
    });
  };

  return (
    <>
      <Suspense fallback={null}>
        <ReferralHandler setReferralCode={setReferralCode} />
      </Suspense>
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-warm-50 to-secondary-50 dark:from-gray-900 dark:via-secondary-900/50 dark:to-primary-900/50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-pastel-2 rounded-full mix-blend-normal filter blur-3xl opacity-40 dark:opacity-25 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-pastel-4 rounded-full mix-blend-normal filter blur-3xl opacity-40 dark:opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-smooth-3 rounded-full mix-blend-normal filter blur-3xl opacity-35 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
        {/* Modern glass card */}
        <div className="glass backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border-2 border-secondary-200/60 dark:border-secondary-700/60 rounded-3xl shadow-2xl p-10 hover:shadow-glow-purple transition-all duration-500 card-lift">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-smooth-4 rounded-3xl mb-6 shadow-glow-coral animate-pulse-soft">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-smooth-4 bg-clip-text text-transparent mb-3 animate-gradient">
              Join ClickerPro
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base">Start your rewarding journey today! 🚀✨</p>
          </div>

          {/* Info section */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="glass bg-white/50 dark:bg-gray-800/50 border-2 border-primary-200/50 dark:border-primary-700/50 rounded-2xl p-4 text-center hover-scale transition-all duration-300">
              <p className="text-3xl mb-2 animate-float">⚡</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Fast</p>
            </div>
            <div className="glass bg-white/50 dark:bg-gray-800/50 border-2 border-secondary-200/50 dark:border-secondary-700/50 rounded-2xl p-4 text-center hover-scale transition-all duration-300">
              <p className="text-3xl mb-2 animate-float animation-delay-2000">✨</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Beautiful</p>
            </div>
            <div className="glass bg-white/50 dark:bg-gray-800/50 border-2 border-warm-200/50 dark:border-warm-700/50 rounded-2xl p-4 text-center hover-scale transition-all duration-300">
              <p className="text-3xl mb-2 animate-float animation-delay-4000">🏆</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rewarding</p>
            </div>
          </div>

          {/* Referral Code Banner */}
          {referralCode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎁</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Referral Code Applied!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Referred by: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={() => {
              // Ensure referral code is in sessionStorage before OAuth
              if (referralCode) {
                sessionStorage.setItem('referralCode', referralCode);
              }
              signIn('google', { redirect: true, callbackUrl: '/register' });
            }}
            className="w-full py-4 px-6 bg-gradient-smooth-4 hover:shadow-glow-coral rounded-2xl font-bold text-base text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group hover-scale active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>🚀 Create Account</span>
          </button>

          {/* Features list */}
          <div className="mt-10 space-y-4 text-base">
            <div className="flex items-center gap-4 glass bg-white/40 dark:bg-gray-800/40 rounded-2xl p-4 hover-scale transition-all duration-300">
              <span className="text-2xl">✅</span>
              <p className="text-gray-700 dark:text-gray-300 font-medium">One-click signup with Google</p>
            </div>
            <div className="flex items-center gap-4 glass bg-white/40 dark:bg-gray-800/40 rounded-2xl p-4 hover-scale transition-all duration-300">
              <span className="text-2xl">🎁</span>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Instant rewards & bonuses</p>
            </div>
            <div className="flex items-center gap-4 glass bg-white/40 dark:bg-gray-800/40 rounded-2xl p-4 hover-scale transition-all duration-300">
              <span className="text-2xl">👥</span>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Join thousands of players</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-base mt-10">
            Already have an account?{' '}
            <Link href="/login" className="font-bold bg-gradient-smooth-1 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Sign In →
            </Link>
          </p>
        </div>
      </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}