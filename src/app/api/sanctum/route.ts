import { NextResponse } from 'next/server';

/**
 * Sanctum API Proxy - Solves CORS issues
 * Proxies requests to Sanctum API from the backend
 */

const SANCTUM_API_BASE = 'https://api.sanctum.so';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/v1/lsts';

  try {
    const response = await fetch(`${SANCTUM_API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Sanctum API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Sanctum API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Sanctum API' },
      { status: 500 }
    );
  }
}
