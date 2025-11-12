import { NextRequest, NextResponse } from 'next/server';
import { DialectService } from '@/lib/dialect/dialect-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/test-dialect?wallet=<address>
 * Test endpoint to verify Dialect integration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Send test notification via Dialect
    const success = await DialectService.sendNotification(
      {
        title: '🎉 V1ta Dialect Test',
        body: 'Multi-channel notifications are working! You can now receive alerts via push, email, and Telegram even when your tab is closed.',
        actions: [
          {
            type: 'link',
            label: 'View Positions',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/positions`,
          },
        ],
      },
      {
        walletAddress,
        channels: ['PUSH', 'EMAIL', 'IN_APP'],
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      }
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully via Dialect',
        wallet: walletAddress,
        channels: ['PUSH', 'EMAIL', 'IN_APP'],
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send notification via Dialect',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing Dialect:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
