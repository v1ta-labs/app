import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/mark-all-read?wallet=<address>
 * Mark all notifications as read for a user
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const result = await NotificationService.markAllAsRead(walletAddress);

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
