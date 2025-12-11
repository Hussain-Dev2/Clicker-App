/**
 * VPN Check API Endpoint
 * 
 * Detects if the requesting client is using a VPN, proxy, or datacenter IP.
 * Returns detection results to the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectVPN } from '@/lib/vpn-detection';

export const runtime = 'edge'; // Use Edge runtime for faster response

export async function GET(request: NextRequest) {
  try {
    // Check if cache bypass is requested
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.has('bypass');
    
    // Detect VPN usage
    const detection = await detectVPN(request, !bypassCache);

    // Return detection results
    return NextResponse.json({
      isVPN: detection.isVPN,
      isTor: detection.isTor,
      isProxy: detection.isProxy,
      isDatacenter: detection.isDatacenter,
      riskScore: detection.riskScore,
      provider: detection.provider,
      // Don't expose IP to client for privacy
    });
  } catch (error) {
    console.error('VPN detection failed:', error);
    
    // On error, return safe defaults (don't block users)
    return NextResponse.json({
      isVPN: false,
      isTor: false,
      isProxy: false,
      isDatacenter: false,
      riskScore: 0,
    });
  }
}
