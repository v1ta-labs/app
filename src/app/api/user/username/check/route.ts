import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          available: false,
          error:
            'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens',
        },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
