import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notification-service';
import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

/**
 * Shared handler for creating test notifications
 */
async function createTestNotifications(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Ensure user exists in database first
    try {
      let user = await db.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        // Create user if doesn't exist
        user = await db.user.create({
          data: {
            walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`,
          },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Database unavailable',
          details: 'Please check your database connection',
        },
        { status: 503 }
      );
    }

    // Create sample notifications
    const notifications = await Promise.all([
      NotificationService.notifyPositionHealthWarning(walletAddress, 115.5),
      NotificationService.notifyBorrowSuccess(walletAddress, 1000, 'test-signature-123'),
      NotificationService.create({
        walletAddress,
        type: 'PROTOCOL_UPDATE',
        title: 'Protocol Update',
        message: 'New features and improvements are live!',
        link: '/',
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create test notifications', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/test?wallet=<address>
 * Create test notifications for development
 */
export async function GET(request: NextRequest) {
  return createTestNotifications(request);
}

/**
 * POST /api/notifications/test?wallet=<address>
 * Create test notifications for development
 */
export async function POST(request: NextRequest) {
  return createTestNotifications(request);
}
