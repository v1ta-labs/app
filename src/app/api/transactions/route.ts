import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/transactions - Get transactions for a wallet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const transactions = await db.transaction.findMany({
      where: {
        owner: wallet,
        ...(type && { type: type as any }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit ? parseInt(limit) : 50,
      include: {
        position: {
          select: {
            pubkey: true,
            collateralType: true,
          },
        },
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      signature,
      type,
      owner,
      positionId,
      collateralType,
      collateralAmount,
      collateralAdded,
      borrowAmount,
      debtRepaid,
      fee,
      liquidator,
    } = body;

    if (!signature || !type || !owner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await db.transaction.create({
      data: {
        signature,
        type,
        owner,
        ...(positionId && { positionId }),
        ...(collateralType && { collateralType }),
        ...(collateralAmount !== undefined && {
          collateralAmount: parseFloat(collateralAmount),
        }),
        ...(collateralAdded !== undefined && { collateralAdded: parseFloat(collateralAdded) }),
        ...(borrowAmount !== undefined && { borrowAmount: parseFloat(borrowAmount) }),
        ...(debtRepaid !== undefined && { debtRepaid: parseFloat(debtRepaid) }),
        ...(fee !== undefined && { fee: parseFloat(fee) }),
        ...(liquidator && { liquidator }),
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
