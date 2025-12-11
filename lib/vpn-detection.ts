/**
 * VPN & Proxy Detection System
 * 
 * Detects VPN, proxy, and datacenter IPs to prevent abuse.
 * Uses multiple detection methods for accuracy.
 */

import { NextRequest } from 'next/server';

/**
 * VPN Detection Result
 */
export interface VPNDetectionResult {
  isVPN: boolean;
  isTor: boolean;
  isProxy: boolean;
  isDatacenter: boolean;
  ipAddress: string;
  riskScore: number; // 0-100 (higher = more suspicious)
  provider?: string;
  countryCode?: string;
}

/**
 * Known VPN/Datacenter IP ranges (CIDR notation)
 * Common VPN providers and cloud datacenters
 */
const KNOWN_VPN_RANGES = [
  // Major VPN Providers
  '104.200.128.0/17',  // NordVPN
  '185.201.8.0/22',    // CyberGhost
  '104.254.0.0/16',    // ExpressVPN
  '178.236.205.0/24',  // ProtonVPN
  '195.202.0.0/16',    // Surfshark
  
  // Tor Exit Nodes (sample ranges)
  '185.220.100.0/22',
  '185.220.101.0/24',
  
  // Cloud Datacenters (often used for bots)
  '13.0.0.0/8',        // AWS
  '34.0.0.0/8',        // Google Cloud
  '20.0.0.0/11',       // Azure
  '104.16.0.0/12',     // Cloudflare
];

/**
 * Known VPN provider domains/IPs
 */
const VPN_PROVIDERS = [
  'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn',
  'privatevpn', 'ipvanish', 'purevpn', 'windscribe', 'tunnelbear',
  'hidemyass', 'vyprvpn', 'hotspotshield', 'mullvad', 'privatetunnel'
];

/**
 * In-memory cache for VPN detection results (24 hour TTL)
 * In production, use Redis
 */
const detectionCache = new Map<string, { result: VPNDetectionResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Extract client IP from Next.js request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfIP) return cfIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  
  // Fallback (shouldn't happen with proper proxy setup)
  return '0.0.0.0';
}

/**
 * Check if IP is in CIDR range
 */
function isIPInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  
  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  const rangeNum = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  
  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Check if IP matches known VPN ranges
 */
function checkKnownVPNRanges(ip: string): boolean {
  try {
    return KNOWN_VPN_RANGES.some(range => isIPInRange(ip, range));
  } catch {
    return false;
  }
}

/**
 * Analyze request headers for proxy/VPN indicators
 */
function analyzeHeaders(request: NextRequest): { isProxy: boolean; riskScore: number } {
  let riskScore = 0;
  let isProxy = false;
  
  // Check for proxy headers
  const proxyHeaders = [
    'via',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'forwarded',
    'x-real-ip',
    'x-proxy-id',
    'proxy-connection'
  ];
  
  for (const header of proxyHeaders) {
    if (request.headers.get(header)) {
      riskScore += 10;
      if (header === 'via' || header === 'proxy-connection') {
        isProxy = true;
        riskScore += 20;
      }
    }
  }
  
  // Check for missing User-Agent (common in bots)
  if (!request.headers.get('user-agent')) {
    riskScore += 15;
  }
  
  // Check for suspicious User-Agent strings
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousUA = ['bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'java'];
  if (suspiciousUA.some(ua => userAgent.toLowerCase().includes(ua))) {
    riskScore += 25;
  }
  
  return { isProxy, riskScore };
}

/**
 * Reverse DNS lookup to detect hosting providers
 * (Simplified - checks against known patterns)
 */
function checkHostingProvider(ip: string): { isDatacenter: boolean; provider?: string } {
  // In production, you'd do actual reverse DNS lookup
  // For now, we'll check IP patterns
  
  const datacenterPatterns = [
    { pattern: /^13\./, provider: 'AWS' },
    { pattern: /^34\./, provider: 'Google Cloud' },
    { pattern: /^20\./, provider: 'Azure' },
    { pattern: /^104\.16\./, provider: 'Cloudflare' },
    { pattern: /^104\.200\./, provider: 'NordVPN' },
    { pattern: /^185\.201\./, provider: 'CyberGhost' },
  ];
  
  for (const { pattern, provider } of datacenterPatterns) {
    if (pattern.test(ip)) {
      return { isDatacenter: true, provider };
    }
  }
  
  return { isDatacenter: false };
}

/**
 * Main VPN Detection Function
 * 
 * @param request - Next.js request object
 * @param useCache - Whether to use cached results (default: true)
 * @returns VPN detection result
 */
export async function detectVPN(
  request: NextRequest,
  useCache: boolean = true
): Promise<VPNDetectionResult> {
  const ip = getClientIP(request);
  
  // Check cache
  if (useCache) {
    const cached = detectionCache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }
  }
  
  // Initialize result
  const result: VPNDetectionResult = {
    isVPN: false,
    isTor: false,
    isProxy: false,
    isDatacenter: false,
    ipAddress: ip,
    riskScore: 0,
  };
  
  // Skip checks for localhost/private IPs
  if (ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    detectionCache.set(ip, { result, timestamp: Date.now() });
    return result;
  }
  
  // Check 1: Known VPN IP ranges
  if (checkKnownVPNRanges(ip)) {
    result.isVPN = true;
    result.riskScore += 50;
  }
  
  // Check 2: Analyze headers
  const headerAnalysis = analyzeHeaders(request);
  result.isProxy = headerAnalysis.isProxy;
  result.riskScore += headerAnalysis.riskScore;
  
  // Check 3: Hosting/Datacenter detection
  const hostingCheck = checkHostingProvider(ip);
  result.isDatacenter = hostingCheck.isDatacenter;
  result.provider = hostingCheck.provider;
  if (hostingCheck.isDatacenter) {
    result.riskScore += 30;
  }
  
  // Check 4: Tor detection (simplified - check known Tor ranges)
  const torRanges = ['185.220.100.', '185.220.101.'];
  if (torRanges.some(range => ip.startsWith(range))) {
    result.isTor = true;
    result.riskScore += 60;
  }
  
  // Final verdict: Consider VPN if risk score is high
  if (result.riskScore >= 50) {
    result.isVPN = true;
  }
  
  // Cache result
  detectionCache.set(ip, { result, timestamp: Date.now() });
  
  return result;
}

/**
 * Simple check if request is from VPN/Proxy
 * Returns true if VPN/Proxy detected
 */
export async function isVPN(request: NextRequest): Promise<boolean> {
  const result = await detectVPN(request);
  return result.isVPN || result.isProxy || result.isTor || result.riskScore >= 50;
}

/**
 * Get risk level description
 */
export function getRiskLevel(riskScore: number): string {
  if (riskScore >= 75) return 'HIGH';
  if (riskScore >= 50) return 'MEDIUM';
  if (riskScore >= 25) return 'LOW';
  return 'SAFE';
}

/**
 * Clear detection cache (for testing)
 */
export function clearDetectionCache(): void {
  detectionCache.clear();
}
