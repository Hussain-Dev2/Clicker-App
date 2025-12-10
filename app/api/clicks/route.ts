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

/**
 * Game balance constants
 */
const POINTS_PER_CLICK = 10; // Base points awarded per click
const MILESTONE_INTERVAL = 100; // Milestone notification every N clicks

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