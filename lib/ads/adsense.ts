/**
 * Google AdSense Script Management
 * Handles loading and managing AdSense scripts
 */

let adSenseLoader: Promise<void> | null = null;
const loadedScripts = new Set<string>();

function ensureClientId(clientId?: string): string {
  if (!clientId) {
    throw new Error('Missing AdSense client id (NEXT_PUBLIC_ADSENSE_CLIENT_ID)');
  }
  return clientId;
}

/**
 * Load Google AdSense script with retries
 */
export function loadAdSenseScript(clientId?: string, retries: number = 3): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const validClientId = ensureClientId(clientId);
  const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${validClientId}`;

  // Return cached promise if already loading or loaded
  if (adSenseLoader) {
    return adSenseLoader;
  }

  // Check if script already loaded
  const existing = document.querySelector('script[data-adsbygoogle-script]');
  if (existing && (window as any).adsbygoogle) {
    return Promise.resolve();
  }

  adSenseLoader = new Promise((resolve, reject) => {
    const attemptLoad = (attemptNumber: number) => {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-adsbygoogle-script', 'true');

      script.onload = () => {
        loadedScripts.add(scriptSrc);
        resolve();
      };

      script.onerror = () => {
        if (attemptNumber < retries) {
          console.warn(
            `[AdSense] Failed to load script, retrying... (${attemptNumber + 1}/${retries})`
          );
          // Exponential backoff: 500ms, 1s, 2s
          setTimeout(() => attemptLoad(attemptNumber + 1), 500 * Math.pow(2, attemptNumber));
        } else {
          console.error('[AdSense] Failed to load script after retries');
          reject(new Error('Failed to load AdSense script after retries'));
        }
      };

      document.head.appendChild(script);
    };

    attemptLoad(0);
  });

  return adSenseLoader;
}

/**
 * Push ad request to AdSense
 */
export function pushAdRequest(): void {
  if (typeof window === 'undefined') return;

  try {
    if (!window.adsbygoogle) {
      window.adsbygoogle = [];
    }
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (error) {
    console.warn('[AdSense] Push failed:', error);
  }
}

/**
 * Check if AdSense is loaded
 */
export function isAdSenseLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).adsbygoogle !== undefined;
}

/**
 * Wait for AdSense to be available
 */
export async function waitForAdSense(timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (isAdSenseLoaded()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
}

/**
 * Clear AdSense cache
 */
export function clearAdSenseCache(): void {
  if (typeof window !== 'undefined') {
    (window as any).adsbygoogle = [];
    loadedScripts.clear();
    adSenseLoader = null;
  }
}

/**
 * Get AdSense script status
 */
export function getAdSenseStatus(): {
  isLoaded: boolean;
  isLoading: boolean;
  scriptCount: number;
} {
  return {
    isLoaded: isAdSenseLoaded(),
    isLoading: adSenseLoader !== null && adSenseLoader !== Promise.resolve(),
    scriptCount: loadedScripts.size,
  };
}

