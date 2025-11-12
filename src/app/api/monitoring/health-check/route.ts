import { NextRequest, NextResponse } from 'next/server';
import { getMonitorInstance } from '@/lib/monitoring/position-health-monitor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/monitoring/health-check
 * Manual trigger for position health monitoring
 * Can also be used by cron job for continuous monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify authorization for production
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const monitor = getMonitorInstance();

    // Get current health summary
    const summary = await monitor.getHealthSummary();

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json(
      {
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/health-check
 * Start/trigger position health monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify authorization for production
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const monitor = getMonitorInstance();

    // Trigger immediate check
    // Note: In production, you'd want to use a proper background job system
    // This is a simplified version for testing
    const summary = await monitor.getHealthSummary();

    return NextResponse.json({
      success: true,
      message: 'Health check triggered',
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error triggering health check:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger health check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
