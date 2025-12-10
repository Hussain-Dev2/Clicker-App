'use client';

/**
 * Adsterra Native Bar Ad Component
 * 
 * Displays a native bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 * 
 * Ad ID: 28131868
 */

import { useEffect, useRef } from 'react';

export default function AdsterraNativeBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only run on client side and load script once
    if (typeof window === 'undefined' || scriptLoadedRef.current) return;

    // Configure Adsterra options
    (window as unknown as Record<string, unknown>).atOptions = {
      key: '28131868',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {},
    };

    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/28131868/invoke.js';
    script.async = true;

    // Append script to container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoadedRef.current = true;
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4">
      <div 
        ref={containerRef} 
        className="max-w-[728px] w-full min-h-[90px] flex items-center justify-center"
      />
    </div>
  );
}
