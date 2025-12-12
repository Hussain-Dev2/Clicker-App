'use client';

/**
 * Interstitial Ad Component
 * Full-screen ads that appear at strategic moments
 * Improved with better error handling and user experience
 */

import { useEffect, useRef, useState } from 'react';
import adManager from '@/lib/ads/ad-manager';

interface InterstitialAdProps {
  onClose?: () => void;
  autoCloseSeconds?: number;
}

const ADSTERRA_INTERSTITIAL_KEY = process.env.NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_KEY || '28139013';

export default function InterstitialAd({ onClose, autoCloseSeconds = 8 }: InterstitialAdProps) {
  const hasLoaded = useRef(false);
  const [canSkip, setCanSkip] = useState(false);
  const [countdown, setCountdown] = useState(autoCloseSeconds);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    if (typeof window === 'undefined') return;

    try {
      // Adsterra Popunder/Interstitial Ad
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : '${ADSTERRA_INTERSTITIAL_KEY}',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;
      document.body.appendChild(script);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.topcreativeformat.com/${ADSTERRA_INTERSTITIAL_KEY}/invoke.js`;
      invokeScript.async = true;

      invokeScript.onload = () => {
        adManager.trackEvent({
          type: 'impression',
          network: 'adsterra',
          timestamp: Date.now(),
        });
      };

      invokeScript.onerror = () => {
        adManager.trackEvent({
          type: 'error',
          network: 'adsterra',
          timestamp: Date.now(),
        });
        // Auto-close on error after 2 seconds
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      };

      document.body.appendChild(invokeScript);

      // Allow skipping after 3 seconds
      const skipTimer = setTimeout(() => {
        setCanSkip(true);
      }, 3000);

      // Auto close countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto close after specified seconds
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, autoCloseSeconds * 1000);

      return () => {
        clearTimeout(skipTimer);
        clearTimeout(closeTimer);
        clearInterval(countdownInterval);
        if (script.parentNode) document.body.removeChild(script);
        if (invokeScript.parentNode) document.body.removeChild(invokeScript);
      };
    } catch (error) {
      console.error('Interstitial ad error:', error);
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    }
  }, [onClose, autoCloseSeconds]);

  const handleClose = () => {
    adManager.trackEvent({
      type: 'click',
      network: 'adsterra',
      timestamp: Date.now(),
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={!canSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl font-bold z-10 transition disabled:opacity-50"
          title={canSkip ? 'Close ad' : `Close in ${countdown}s`}
        >
          ✕
        </button>

        {/* Ad container */}
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div id="interstitial-ad-container" className="w-full flex justify-center">
            {/* Adsterra ad will load here */}
          </div>
          
          {/* Loading indicator */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading advertisement...
            </p>
          </div>
        </div>

        {/* Skip button and counter */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {canSkip ? (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Skip Ad
            </button>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ad closes in {countdown}s
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            This ad supports our free service
          </p>
        </div>
      </div>
    </div>
  );
}
