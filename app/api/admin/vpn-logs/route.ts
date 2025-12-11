/**
 * VPN Detection Log API
 * 
 * Admin endpoint to view VPN/Proxy detection logs and statistics
 * 
 * @route GET /api/admin/vpn-logs
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // In a production app, you'd store VPN detections in database
    // For now, return info about VPN detection configuration
    
    const info = {
      enabled: true,
      blockMode: false, // Currently in warning mode
      rewardReduction: true, // 50% reduction for VPN users
      detectionMethods: [
        'IP range checking (VPN providers)',
        'Header analysis (proxy detection)',
        'Datacenter IP detection',
        'Tor exit node detection',
        'Risk scoring (0-100)',
      ],
      knownProviders: [
        'NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost', 'ProtonVPN',
        'AWS', 'Google Cloud', 'Azure', 'Cloudflare'
      ],
      recommendations: [
        'Monitor server logs for VPN detections (console.warn)',
        'Consider storing VPN detections in database for analytics',
        'Set BLOCK_VPN=true to enforce strict mode',
        'Use Redis for production caching',
        'Consider using commercial VPN detection API (IPHub, ProxyCheck.io)',
      ],
      stats: {
        cacheDuration: '24 hours',
        riskLevels: {
          safe: '0-24',
          low: '25-49',
          medium: '50-74',
          high: '75-100'
        }
      }
    };

    return NextResponse.json(info);
  } catch (error) {
    console.error('VPN logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VPN logs' },
      { status: 500 }
    );
  }
}
