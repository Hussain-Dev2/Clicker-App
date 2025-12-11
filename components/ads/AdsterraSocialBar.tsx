'use client';

/**
 * Adsterra Social Bar Ad Component
 * 
 * Displays a social bar ad from Adsterra network.
 * This is a non-intrusive ad format that appears as a bar.
 */

import { useEffect, useRef } from 'react';

export default function AdsterraSocialBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only run on client side and load script once
    if (typeof window === 'undefined' || scriptLoadedRef.current) return;

    // Create and inject the Adsterra script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pl28232294.effectivegatecpm.com/c4/06/0c/c4060cbdd4dfbfe5344b0066a43948ca.js';

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
        className="w-full min-h-[90px] flex items-center justify-center"
      />
    </div>
  );
}
