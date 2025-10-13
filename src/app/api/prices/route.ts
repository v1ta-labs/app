import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/prices - Get price history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latest = searchParams.get('latest');
    const limit = searchParams.get('limit');

    if (latest === 'true') {
      // Get the most recent prices
      const price = await db.priceHistory.findFirst({
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!price) {
        return NextResponse.json({
          price: {
            solPrice: 0,
            jitoSOLPrice: null,
            mSOLPrice: null,
            bSOLPrice: null,
            timestamp: new Date(),
          },
        });
      }

      return NextResponse.json({ price });
    }

    // Get historical prices
    const prices = await db.priceHistory.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: limit ? parseInt(limit) : 100,
    });

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Get prices error:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}

// POST /api/prices - Create price snapshot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { solPrice, jitoSOLPrice, mSOLPrice } = body;

    if (!solPrice) {
      return NextResponse.json({ error: 'SOL price is required' }, { status: 400 });
    }

    const price = await db.priceHistory.create({
      data: {
        solPrice: parseFloat(solPrice),
        jitoSOLPrice: jitoSOLPrice ? parseFloat(jitoSOLPrice) : null,
        mSOLPrice: mSOLPrice ? parseFloat(mSOLPrice) : null,
      },
    });

    return NextResponse.json({ price }, { status: 201 });
  } catch (error) {
    console.error('Create price error:', error);
    return NextResponse.json({ error: 'Failed to create price' }, { status: 500 });
  }
}
