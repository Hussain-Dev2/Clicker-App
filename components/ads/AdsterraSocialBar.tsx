'use client';

/**
 * Adsterra Social Bar Ad Component
 * 
 * Displays a social bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 * Features: Lazy loading, error handling, analytics integration
 */

import { useEffect, useRef, useState } from 'react';
import adManager from '@/lib/ads/ad-manager';

let scriptLoaded = false;

const ADSTERRA_SOCIAL_BAR_KEY = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY || 'c4060cbdd4dfbfe5344b0066a43948ca';

export default function AdsterraSocialBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded || !containerRef.current || !isVisible) return;

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src*="${ADSTERRA_SOCIAL_BAR_KEY}"]`
    );
    
    if (existingScript) {
      scriptLoaded = true;
      return;
    }

    try {
      // Create and inject the Adsterra script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://pl28232294.effectivegatecpm.com/${ADSTERRA_SOCIAL_BAR_KEY.replace(/(.{2})(?=.)/g, '$1/')}.js`;
      script.crossOrigin = 'anonymous';

      script.onerror = () => {
        console.warn('Adsterra Social Bar ad failed to load');
        setError('Ad failed to load');
        scriptLoaded = false;
        adManager.trackEvent({
          type: 'error',
          network: 'adsterra',
          timestamp: Date.now(),
        });
      };
      
      script.onload = () => {
        scriptLoaded = true;
        adManager.trackEvent({
          type: 'impression',
          network: 'adsterra',
          timestamp: Date.now(),
        });
      };

      // Append script to body
      document.body.appendChild(script);

      return () => {
        // Don't remove the script since it's global and may be used elsewhere
      };
    } catch (err) {
      console.error('Error loading Adsterra Social Bar:', err);
      setError('Failed to load ad');
      adManager.trackEvent({
        type: 'error',
        network: 'adsterra',
        timestamp: Date.now(),
      });
    }
  }, [isVisible]);

  if (error) {
    return null; // Don't show error, just silently fail
  }

  return (
    <div className={`w-full flex justify-center items-center py-4 transition-opacity ${!isVisible ? 'opacity-50' : ''}`}>
      <div 
        ref={containerRef} 
        className="w-full min-h-[90px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
      >
        {/* Fallback content while ad loads */}
        <span className="text-xs text-gray-400 dark:text-gray-600">Advertisement</span>
      </div>
    </div>
  );
}
