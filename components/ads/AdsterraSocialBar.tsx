'use client';

/**
 * Adsterra Social Bar Ad Component
 * 
 * Displays a social bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 */

import { useEffect, useRef } from 'react';

// Global flag to prevent duplicate script loading
let scriptLoaded = false;

const ADSTERRA_SOCIAL_BAR_KEY = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY || 'c4060cbdd4dfbfe5344b0066a43948ca';

export default function AdsterraSocialBar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side and load script once globally
    if (typeof window === 'undefined' || scriptLoaded || !containerRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src*="${ADSTERRA_SOCIAL_BAR_KEY}"]`
    );
    
    if (existingScript) {
      scriptLoaded = true;
      return;
    }

    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://pl28232294.effectivegatecpm.com/${ADSTERRA_SOCIAL_BAR_KEY.replace(/(.{2})(?=.)/g, '$1/')}.js`;

    script.onerror = () => {
      console.warn('Adsterra Social Bar ad failed to load');
      scriptLoaded = false;
    };
    
    script.onload = () => {
      scriptLoaded = true;
    };

    // Append script to body (not container)
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <div 
        ref={containerRef} 
        className="w-full min-h-[90px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        {/* Fallback content while ad loads */}
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    </div>
  );
}
