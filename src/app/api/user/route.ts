import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/user?wallet=<address>
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Handle database connection errors gracefully
    try {
      const user = await db.user.findUnique({
        where: { walletAddress },
        select: {
          id: true,
          walletAddress: true,
          username: true,
          email: true,
          emailVerified: true,
          avatar: true,
          bio: true,
          twitter: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ exists: false, user: null });
      }

      return NextResponse.json({ exists: true, user });
    } catch (dbError) {
      // Database unavailable - return no user found
      console.warn('Database unavailable, returning no user:', dbError);
      return NextResponse.json({ exists: false, user: null });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// POST /api/user - Create new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, username, email, avatar, bio, twitter, emailVerified } = body;

    if (!walletAddress || !username) {
      return NextResponse.json(
        { error: 'Wallet address and username are required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { walletAddress },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Check username availability
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        walletAddress,
        username,
        email: email || null,
        emailVerified: emailVerified || false,
        avatar: avatar || null,
        bio: bio || null,
        twitter: twitter || null,
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        twitter: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, email, avatar, bio, twitter } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { walletAddress },
      data: {
        email: email !== undefined ? email : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        bio: bio !== undefined ? bio : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        bio: true,
        twitter: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/user - Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user and all related data (cascade will handle positions and transactions)
    await db.user.delete({
      where: { walletAddress },
    });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
