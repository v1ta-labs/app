import { NextResponse } from 'next/server';

/**
 * Sanctum Gateway API Proxy - Solves CORS issues
 * Proxies transaction optimization requests to Sanctum Gateway
 */

const SANCTUM_GATEWAY_BASE = 'https://gateway.sanctum.so';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${SANCTUM_GATEWAY_BASE}/api/v1/tx/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sanctum Gateway error:', errorText);
      return NextResponse.json(
        { error: `Gateway API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sanctum Gateway proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process Gateway request', details: String(error) },
      { status: 500 }
    );
  }
}
