import { NextResponse } from 'next/server';

/**
 * Sanctum API Proxy - Solves CORS issues
 * Proxies requests to Sanctum API from the backend
 * Base URL: https://sanctum-api.ironforge.network
 * Docs: https://learn.sanctum.so/docs/for-developers/sanctum-api
 */

const SANCTUM_API_BASE = 'https://sanctum-api.ironforge.network';
const SANCTUM_API_KEY = process.env.SANCTUM_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/lsts';

  try {
    // Build URL with API key
    const url = new URL(`${SANCTUM_API_BASE}${endpoint}`);
    if (SANCTUM_API_KEY) {
      url.searchParams.set('apiKey', SANCTUM_API_KEY);
    }

    console.log('Fetching from Sanctum API:', url.toString().replace(SANCTUM_API_KEY || '', '***'));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sanctum API error:', errorText);
      return NextResponse.json(
        { error: `Sanctum API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Sanctum API response received successfully');

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Sanctum API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Sanctum API', details: String(error) },
      { status: 500 }
    );
  }
}
