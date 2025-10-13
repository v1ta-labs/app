import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stats - Get protocol statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latest = searchParams.get('latest');

    if (latest === 'true') {
      // Get the most recent stats
      const stats = await db.protocolStats.findFirst({
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!stats) {
        // Return default stats if none exist
        return NextResponse.json({
          stats: {
            totalCollateralSOL: 0,
            totalCollateralJitoSOL: 0,
            totalCollateralMSOL: 0,
            totalCollateralBSOL: 0,
            totalDebt: 0,
            vUSDSupply: 0,
            activePositions: 0,
            baseRate: 0.5,
            timestamp: new Date(),
          },
        });
      }

      return NextResponse.json({ stats });
    }

    // Get historical stats
    const limit = searchParams.get('limit');
    const stats = await db.protocolStats.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: limit ? parseInt(limit) : 100,
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

// POST /api/stats - Create protocol stats snapshot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      totalCollateralSOL,
      totalCollateralJitoSOL,
      totalCollateralMSOL,
      totalDebt,
      vUSDSupply,
      activePositions,
      baseRate,
    } = body;

    const stats = await db.protocolStats.create({
      data: {
        totalCollateralSOL: parseFloat(totalCollateralSOL || '0'),
        totalCollateralJitoSOL: parseFloat(totalCollateralJitoSOL || '0'),
        totalCollateralMSOL: parseFloat(totalCollateralMSOL || '0'),
        totalDebt: parseFloat(totalDebt || '0'),
        vUSDSupply: parseFloat(vUSDSupply || '0'),
        activePositions: parseInt(activePositions || '0'),
        baseRate: parseFloat(baseRate || '0.5'),
      },
    });

    return NextResponse.json({ stats }, { status: 201 });
  } catch (error) {
    console.error('Create stats error:', error);
    return NextResponse.json({ error: 'Failed to create stats' }, { status: 500 });
  }
}
