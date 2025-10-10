import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/positions - Get all positions for a wallet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const positions = await db.position.findMany({
      where: {
        owner: wallet,
        closedAt: null, // Only active positions
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ positions });
  } catch (error) {
    console.error('Get positions error:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}

// POST /api/positions - Create a new position
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pubkey, owner, positionId, collateralType, collateralAmount, debt, status, bump } = body;

    if (!pubkey || !owner || positionId === undefined || !collateralType || !collateralAmount || debt === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const position = await db.position.create({
      data: {
        pubkey,
        owner,
        positionId: BigInt(positionId),
        collateralType,
        collateralAmount: parseFloat(collateralAmount),
        debt: parseFloat(debt),
        status: status ?? 0,
        bump: bump ?? undefined,
      },
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    console.error('Create position error:', error);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
  }
}

// PATCH /api/positions - Update a position
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { pubkey, collateralAmount, debt } = body;

    if (!pubkey) {
      return NextResponse.json({ error: 'Position pubkey required' }, { status: 400 });
    }

    const position = await db.position.update({
      where: { pubkey },
      data: {
        ...(collateralAmount !== undefined && {
          collateralAmount: parseFloat(collateralAmount),
        }),
        ...(debt !== undefined && { debt: parseFloat(debt) }),
      },
    });

    return NextResponse.json({ position });
  } catch (error) {
    console.error('Update position error:', error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}

// DELETE /api/positions - Close a position
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pubkey = searchParams.get('pubkey');

    if (!pubkey) {
      return NextResponse.json({ error: 'Position pubkey required' }, { status: 400 });
    }

    const position = await db.position.update({
      where: { pubkey },
      data: {
        closedAt: new Date(),
      },
    });

    return NextResponse.json({ position });
  } catch (error) {
    console.error('Close position error:', error);
    return NextResponse.json({ error: 'Failed to close position' }, { status: 500 });
  }
}
