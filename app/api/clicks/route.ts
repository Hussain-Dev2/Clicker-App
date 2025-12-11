/**
 * Click API Route
 * 
 * Handles the basic click action for earning points.
 * This endpoint increments user's click count and awards points.
 * 
 * NOTE: For the enhanced smart points system with level bonuses and achievements,
 * use /api/points/click instead. This endpoint is kept for backward compatibility.
 * 
 * Features:
 * - Increments click counter
 * - Awards fixed points per click (10 points)
 * - Detects milestone achievements (every 100 clicks)
 * - Protected by NextAuth session
 * 
 * @route POST /api/clicks
 * @access Protected (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { detectVPN, getRiskLevel } from '@/lib/vpn-detection';

/**
 * Game balance constants
 */
const POINTS_PER_CLICK = 10; // Base points awarded per click
const MILESTONE_INTERVAL = 100; // Milestone notification every N clicks

/**
 * Anti-cheat constants
 */
const MIN_CLICK_INTERVAL_MS = 50; // Minimum 50ms between clicks (humanly impossible to click faster)
const MAX_CLICKS_PER_MINUTE = 600; // Maximum 600 clicks per minute (10 per second)
const SUSPICIOUS_THRESHOLD = 15; // Flag as suspicious after 15 ultra-fast clicks
const BLOCK_VPN = false; // Set to true to block VPN users (warning mode by default)

/**
 * Rate limiting storage (in-memory)
 * In production, use Redis or similar
 */
const clickTracking = new Map<string, { lastClick: number; recentClicks: number[]; suspiciousCount: number }>();

/**
 * Force dynamic rendering to ensure fresh data on each request
 * Prevents Next.js from caching this route
 */
export const dynamic = 'force-dynamic';

/**
 * POST handler for click actions
 * 
 * Process flow:
 * 1. Authenticate user via NextAuth session
 * 2. Verify user exists in database
 * 3. Atomically increment clicks and points
 * 4. Check for milestone achievement
 * 5. Return updated user data
 * 
 * @param request - NextRequest object (unused but required by Next.js)
 * @returns JSON response with updated user data and milestone status
 * 
 * @example Response
 * ```json
 * {
 *   "user": { "id": "123", "points": 100, "clicks": 10 },
 *   "milestoneMet": false,
 *   "message": null
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in to continue' },
        { status: 401 }
      );
    }

    // Step 2: Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true, clicks: true }, // Only fetch needed fields for performance
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Step 2.5: ANTI-CHEAT - VPN Detection
    const vpnResult = await detectVPN(request);
    
    if (vpnResult.riskScore >= 50) {
      console.warn(`🚨 VPN/Proxy detected for user ${user.id}:`, {
        ip: vpnResult.ipAddress,
        isVPN: vpnResult.isVPN,
        isProxy: vpnResult.isProxy,
        isTor: vpnResult.isTor,
        isDatacenter: vpnResult.isDatacenter,
        provider: vpnResult.provider,
        riskScore: vpnResult.riskScore,
        riskLevel: getRiskLevel(vpnResult.riskScore)
      });
      
      // Block VPN if enabled
      if (BLOCK_VPN) {
        return NextResponse.json(
          { message: '🚫 VPN/Proxy detected. Please disable your VPN to continue.' },
          { status: 403 }
        );
      }
      
      // Warning mode: Log but allow (can be used for analytics)
      // In production, you might want to reduce rewards or flag the account
    }
    
    // Step 2.6: ANTI-CHEAT - Rate limiting & bot detection
    const now = Date.now();
    const userId = user.id;
    
    // Get or create user tracking data
    const tracking = clickTracking.get(userId) || { 
      lastClick: 0, 
      recentClicks: [], 
      suspiciousCount: 0 
    };
    
    // Check minimum interval between clicks (prevent auto-clickers)
    const timeSinceLastClick = now - tracking.lastClick;
    if (timeSinceLastClick < MIN_CLICK_INTERVAL_MS) {
      tracking.suspiciousCount++;
      clickTracking.set(userId, tracking);
      
      // Block if too many suspicious clicks
      if (tracking.suspiciousCount > SUSPICIOUS_THRESHOLD) {
        return NextResponse.json(
          { message: '⚠️ Suspicious activity detected. Please click normally.' },
          { status: 429 }
        );
      }
    }
    
    // Track recent clicks for rate limiting
    tracking.recentClicks.push(now);
    tracking.recentClicks = tracking.recentClicks.filter(t => now - t < 60000); // Keep last minute
    
    // Check rate limit (max clicks per minute)
    if (tracking.recentClicks.length > MAX_CLICKS_PER_MINUTE) {
      return NextResponse.json(
        { message: '⏱️ Slow down! You\'re clicking too fast.' },
        { status: 429 }
      );
    }
    
    // Update tracking
    tracking.lastClick = now;
    clickTracking.set(userId, tracking);
    
    // Reset suspicious count if clicking normally
    if (timeSinceLastClick > 200) {
      tracking.suspiciousCount = Math.max(0, tracking.suspiciousCount - 1);
    }

    // Step 3: Update user stats atomically
    // Using increment ensures thread-safe updates even with concurrent clicks
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        clicks: { increment: 1 }, // Add 1 to click count
        points: { increment: POINTS_PER_CLICK }, // Add points
      },
      select: { id: true, points: true, clicks: true }, // Only return needed fields
    });

    // Step 4: Check if user reached a milestone
    const milestoneMet = updatedUser.clicks % MILESTONE_INTERVAL === 0;

    // Step 5: Return success response
    return NextResponse.json({
      user: { 
        id: updatedUser.id, 
        points: updatedUser.points, 
        clicks: updatedUser.clicks 
      },
      milestoneMet,
      message: milestoneMet 
        ? `🎉 Reached ${updatedUser.clicks} clicks! Ad time!` 
        : null,
    });
  } catch (error) {
    // Log error for debugging
    console.error('Click API error:', error);
    
    // Return generic error to client (don't expose internal details)
    return NextResponse.json(
      { message: 'Internal server error - Please try again' },
      { status: 500 }
    );
  }
}