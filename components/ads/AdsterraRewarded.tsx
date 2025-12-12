"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/client';
import adManager from '@/lib/ads/ad-manager';

interface RewardResponse {
  success: boolean;
  reward: number;
  cooldownSeconds: number;
  user: {
    id: string;
    points: number;
    lifetimePoints: number;
    clicks: number;
    adWatchCount: number;
  };
}

interface AdsterraRewardedProps {
  onReward?: (payload: RewardResponse['user'], reward: number) => void;
  onError?: (message: string) => void;
}

const WATCH_SECONDS = 30;
const LOCAL_KEY = 'adsterra_rewarded_last_watch';
const COOLDOWN_SECONDS = 300; // 5 minutes cooldown
const AD_CONTAINER_ID = 'adsterra-rewarded-container';
const MAX_DAILY_WATCHES = 10;
const DAILY_LIMIT_KEY = 'adsterra_daily_watches';

const ADSTERRA_KEY = process.env.NEXT_PUBLIC_ADSTERRA_REWARDED_KEY;
const ADSTERRA_CUSTOM_URL = process.env.NEXT_PUBLIC_ADSTERRA_REWARDED_SCRIPT_URL;

export default function AdsterraRewarded({ onReward, onError }: AdsterraRewardedProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [dailyWatches, setDailyWatches] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasConfig = useMemo(() => Boolean(ADSTERRA_KEY || ADSTERRA_CUSTOM_URL), []);
  const canWatch = dailyWatches < MAX_DAILY_WATCHES && cooldownLeft === 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize cooldown from localStorage
    const lastWatch = localStorage.getItem(LOCAL_KEY);
    if (lastWatch) {
      const elapsed = Math.floor((Date.now() - Number(lastWatch)) / 1000);
      const remaining = COOLDOWN_SECONDS - elapsed;
      if (remaining > 0) setCooldownLeft(remaining);
    }

    // Initialize daily watches counter
    const today = new Date().toDateString();
    const savedData = localStorage.getItem(DAILY_LIMIT_KEY);
    if (savedData) {
      const [savedDate, count] = savedData.split(':');
      if (savedDate === today) {
        setDailyWatches(parseInt(count, 10));
      } else {
        localStorage.setItem(DAILY_LIMIT_KEY, `${today}:0`);
        setDailyWatches(0);
      }
    } else {
      localStorage.setItem(DAILY_LIMIT_KEY, `${today}:0`);
    }
  }, []);

  // Countdown timers
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const cooldownTimer = setInterval(() => {
      setCooldownLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [cooldownLeft]);

  useEffect(() => {
    if (!isWatching) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isWatching]);

  const teardownTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => teardownTimers(), [teardownTimers]);

  const injectAdsterra = useCallback(async () => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    setAdLoaded(false);

    if (!hasConfig) {
      setStatus('Adsterra key not configured');
      return;
    }

    if (typeof window === 'undefined') return;

    const loadTimeout = setTimeout(() => {
      if (!adLoaded) {
        setStatus('Ad loading took too long. Please try again.');
        setIsWatching(false);
      }
    }, 15000);

    try {
      if (ADSTERRA_KEY) {
        (window as unknown as Record<string, unknown>).atOptions = {
          key: ADSTERRA_KEY,
          format: 'iframe',
          height: 250,
          width: 300,
          params: {},
        };

        const script = document.createElement('script');
        script.src = `https://www.highperformanceformat.com/${ADSTERRA_KEY}/invoke.js`;
        script.async = true;
        
        script.onload = () => {
          setAdLoaded(true);
          clearTimeout(loadTimeout);
          adManager.trackEvent({
            type: 'impression',
            network: 'adsterra',
            timestamp: Date.now(),
          });
        };
        
        script.onerror = () => {
          clearTimeout(loadTimeout);
          setStatus('Failed to load ad. Please try again.');
          setIsWatching(false);
          adManager.trackEvent({
            type: 'error',
            network: 'adsterra',
            timestamp: Date.now(),
          });
        };

        containerRef.current?.appendChild(script);
      } else if (ADSTERRA_CUSTOM_URL) {
        const script = document.createElement('script');
        script.src = ADSTERRA_CUSTOM_URL;
        script.async = true;
        script.onload = () => {
          setAdLoaded(true);
          clearTimeout(loadTimeout);
        };
        script.onerror = () => {
          clearTimeout(loadTimeout);
          setStatus('Failed to load ad. Please try again.');
          setIsWatching(false);
        };
        containerRef.current?.appendChild(script);
      }
    } catch (error) {
      clearTimeout(loadTimeout);
      setStatus('Error loading ad: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsWatching(false);
    }
  }, [hasConfig]);

  const claimReward = useCallback(async () => {
    setIsClaiming(true);
    setStatus('Claiming reward...');
    try {
      const data = await apiFetch<RewardResponse>('/ads/rewarded', {
        method: 'POST',
        body: JSON.stringify({ completed: true }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_KEY, `${Date.now()}`);
        
        // Update daily watch counter
        const today = new Date().toDateString();
        const newCount = dailyWatches + 1;
        localStorage.setItem(DAILY_LIMIT_KEY, `${today}:${newCount}`);
        setDailyWatches(newCount);

        setCooldownLeft(data.cooldownSeconds);
      }

      setStatus(`✓ +${data.reward} points awarded`);
      adManager.trackEvent({
        type: 'revenue',
        network: 'adsterra',
        value: data.reward,
        timestamp: Date.now(),
      });
      
      onReward?.(data.user, data.reward);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to grant reward';
      setStatus(`✗ ${message}`);
      adManager.trackEvent({
        type: 'error',
        network: 'adsterra',
        timestamp: Date.now(),
      });
      onError?.(message);
    } finally {
      setIsClaiming(false);
      setIsWatching(false);
      setAdLoaded(false);
      setSecondsLeft(WATCH_SECONDS);
    }
  }, [onReward, onError, dailyWatches]);

  const startWatching = useCallback(() => {
    if (!hasConfig) {
      const message = 'Adsterra not configured. Set NEXT_PUBLIC_ADSTERRA_REWARDED_KEY';
      setStatus(message);
      onError?.(message);
      return;
    }

    if (!canWatch) {
      if (cooldownLeft > 0) {
        const message = `Please wait ${cooldownLeft}s before the next ad`;
        setStatus(message);
        onError?.(message);
      } else if (dailyWatches >= MAX_DAILY_WATCHES) {
        const message = `Daily limit reached (${MAX_DAILY_WATCHES} ads/day)`;
        setStatus(message);
        onError?.(message);
      }
      return;
    }

    setIsWatching(true);
    setSecondsLeft(WATCH_SECONDS);
    setStatus('Loading ad...');
    setAdLoaded(false);
    injectAdsterra();

    timerRef.current = setTimeout(() => {
      if (adLoaded) {
        setStatus('Ad finished! Claiming reward...');
        claimReward();
      } else {
        setStatus('Ad did not load properly');
        setIsWatching(false);
      }
    }, WATCH_SECONDS * 1000);
  }, [canWatch, cooldownLeft, dailyWatches, hasConfig, injectAdsterra, claimReward, onError, adLoaded]);

  const statusColor = status?.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 
                      status?.startsWith('✗') ? 'text-red-600 dark:text-red-400' : 
                      'text-slate-600 dark:text-slate-300';

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-amber-950/50 dark:to-slate-900 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-300 font-semibold">
              Rewarded Video Ad
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Watch and earn points ({dailyWatches}/{MAX_DAILY_WATCHES} today)
            </p>
          </div>
        </div>
        <div className="text-xs bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-full px-3 py-1 text-amber-700 dark:text-amber-200 font-semibold">
          +25 pts
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-amber-200 dark:border-amber-700/50 bg-white/80 dark:bg-slate-900/70 p-4 mb-4">
        <div 
          ref={containerRef} 
          id={AD_CONTAINER_ID} 
          className="min-h-[260px] flex items-center justify-center text-amber-700 dark:text-amber-100 text-sm font-medium"
        >
          {!isWatching ? 'Ad will load here' : isWatching && !adLoaded ? 'Loading ad...' : 'Ad playing'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className={`text-sm font-medium ${statusColor}`}>
          {isWatching && adLoaded ? (
            `⏱️ ${secondsLeft}s remaining`
          ) : cooldownLeft > 0 ? (
            `⏳ Wait ${cooldownLeft}s`
          ) : dailyWatches >= MAX_DAILY_WATCHES ? (
            '📊 Daily limit reached'
          ) : (
            status || 'Ready to earn points'
          )}
        </div>
        <button
          type="button"
          onClick={startWatching}
          disabled={isWatching || isClaiming || !canWatch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isWatching ? '⏸️ Playing' : isClaiming ? '⏳ Claiming' : !canWatch && cooldownLeft > 0 ? '⏳ Cooldown' : !canWatch && dailyWatches >= MAX_DAILY_WATCHES ? '🔒 Limited' : '▶️ Play'}
        </button>
      </div>
    </div>
  );
}
