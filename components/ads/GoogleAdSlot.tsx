"use client";

import { CSSProperties, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { loadAdSenseScript, pushAdRequest } from '@/lib/ads/adsense';
import adManager from '@/lib/ads/ad-manager';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

export type GoogleAdVariant = 'banner' | 'rectangle' | 'fluid';

interface GoogleAdSlotProps {
  slotId?: string;
  variant?: GoogleAdVariant;
  className?: string;
  style?: CSSProperties;
  label?: string;
  refreshInterval?: number; // seconds
}

export default function GoogleAdSlot({
  slotId,
  variant = 'banner',
  className,
  style,
  label = 'Sponsored',
  refreshInterval = 0, // 0 = no refresh
}: GoogleAdSlotProps) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const uniqueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const resolvedSlot = useMemo(() => slotId || DEFAULT_SLOT || '', [slotId]);
  const configError = !resolvedSlot ? 'Ad slot not configured. Add NEXT_PUBLIC_ADSENSE_SLOT_ID.' : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const refreshAd = useCallback(() => {
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adManager.trackEvent({
          type: 'load',
          network: 'adsense',
          slotId: resolvedSlot,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Ad refresh failed:', err);
      }
    }
  }, [resolvedSlot]);

  useEffect(() => {
    let canceled = false;
    let refreshTimer: NodeJS.Timeout | null = null;

    if (!resolvedSlot || !isVisible) {
      return () => {
        canceled = true;
        if (refreshTimer) clearTimeout(refreshTimer);
      };
    }

    const initializeAd = async () => {
      try {
        await loadAdSenseScript(ADSENSE_CLIENT);
        if (canceled) return;
        
        pushAdRequest();
        setReady(true);

        adManager.trackEvent({
          type: 'impression',
          network: 'adsense',
          slotId: resolvedSlot,
          timestamp: Date.now(),
        });

        // Setup refresh interval if specified
        if (refreshInterval > 0) {
          adManager.setupAdRefresh(`ad-${uniqueId}`, refreshAd, refreshInterval);
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Failed to load ads');
          adManager.trackEvent({
            type: 'error',
            network: 'adsense',
            slotId: resolvedSlot,
            timestamp: Date.now(),
          });
        }
      }
    };

    initializeAd();

    return () => {
      canceled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      adManager.clearAdRefresh(`ad-${uniqueId}`);
    };
  }, [resolvedSlot, isVisible, refreshInterval, uniqueId, refreshAd]);

  const variantStyles: Record<GoogleAdVariant, CSSProperties> = {
    banner: { display: 'block', width: '100%', minHeight: '90px' },
    rectangle: { display: 'block', width: '100%', minHeight: '250px' },
    fluid: { display: 'block' },
  };

  if (configError || error) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-4 text-sm text-slate-500 ${className || ''}`}>
        <div className="font-semibold mb-1 text-slate-700 dark:text-slate-200">{label}</div>
        <p>{configError || error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-sm transition-opacity ${!isVisible ? 'opacity-50' : ''} ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {!ready && (
          <span className="text-[10px] text-slate-400 animate-pulse">Loading…</span>
        )}
      </div>
      <ins
        ref={adRef}
        key={uniqueId}
        className="adsbygoogle block"
        style={{ ...variantStyles[variant], ...style }}
        data-ad-client={ADSENSE_CLIENT || ''}
        data-ad-slot={resolvedSlot}
        data-ad-format={variant === 'fluid' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
