import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications?wallet=<address>&limit=50&offset=0&unreadOnly=false
 * Get notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    try {
      const notifications = await NotificationService.getForUser(walletAddress, {
        limit,
        offset,
        unreadOnly,
      });

      const unreadCount = await NotificationService.getUnreadCount(walletAddress);

      return NextResponse.json({
        notifications,
        unreadCount,
        total: notifications.length,
      });
    } catch (dbError) {
      // Return empty array if user doesn't exist or DB unavailable
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { notifications: [], unreadCount: 0, total: 0 },
      { status: 200 } // Return 200 with empty array instead of error
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (for testing/admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, type, title, message, link, metadata } = body;

    if (!walletAddress || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await NotificationService.create({
      walletAddress,
      type,
      title,
      message,
      link,
      metadata,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
