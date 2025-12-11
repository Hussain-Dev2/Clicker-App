'use client';

/**
 * Adsterra Native Bar Ad Component
 * 
 * Displays a native bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 */

import { useEffect, useRef } from 'react';

export default function AdsterraNativeBar() {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only run on client side and load script once
    if (typeof window === 'undefined' || scriptLoadedRef.current) return;

    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl28232367.effectivegatecpm.com/233a167aa950834c2307f2f53e2c8726/invoke.js';
    
    document.body.appendChild(script);
    scriptLoadedRef.current = true;

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <div 
        id="container-233a167aa950834c2307f2f53e2c8726"
        className="w-full min-h-[90px] flex items-center justify-center"
      />
    </div>
  );
}
