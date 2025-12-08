import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get analytics data
    const [
      totalUsers,
      totalClicks,
      totalPoints,
      totalProducts,
      totalOrders,
      totalAdViews,
      topUsers,
      activeUsers,
      pointsToday,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total clicks
      prisma.user.aggregate({
        _sum: { clicks: true },
      }),

      // Total points
      prisma.user.aggregate({
        _sum: { points: true },
      }),

      // Total products
      prisma.product.count(),

      // Total orders
      prisma.order.count(),

      // Total ad views
      prisma.user.aggregate({
        _sum: { adWatchCount: true },
      }),

      // Top 5 users by points
      prisma.user.findMany({
        take: 5,
        orderBy: { points: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          points: true,
          clicks: true,
        },
      }),

      // Active users (last 24 hours)
      prisma.user.count({
        where: {
          lastActivityAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Points distributed today
      prisma.user.aggregate({
        _sum: { dailyEarnings: true },
        where: {
          lastDailyReset: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return Response.json({
      totalUsers,
      totalClicks: totalClicks._sum.clicks || 0,
      totalPoints: totalPoints._sum.points || 0,
      totalProducts,
      totalOrders,
      totalAdViews: totalAdViews._sum.adWatchCount || 0,
      topUsers,
      activeUsers,
      pointsToday: pointsToday._sum.dailyEarnings || 0,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
