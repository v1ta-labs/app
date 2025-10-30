import { NextResponse } from 'next/server';

/**
 * Sanctum Gateway API Proxy
 * Proxies transaction optimization requests to Sanctum Gateway
 * API Key is kept secure on the server
 * Docs: https://gateway.sanctum.so/docs
 */

const SANCTUM_GATEWAY_BASE = 'https://tpg.sanctum.so/v1';
const SANCTUM_API_KEY = process.env.SANCTUM_API_KEY;

export async function POST(request: Request) {
  try {
    if (!SANCTUM_API_KEY) {
      console.error('SANCTUM_API_KEY not configured');
      return NextResponse.json(
        { error: 'Gateway API key not configured' },
        { status: 500 }
      );
    }

    const { transaction, cluster = 'devnet' } = await request.json();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Missing transaction parameter (base64 encoded)' },
        { status: 400 }
      );
    }

    console.log('Sending transaction to Sanctum Gateway:', { cluster });

    const response = await fetch(
      `${SANCTUM_GATEWAY_BASE}/${cluster}?apiKey=${SANCTUM_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'buildGatewayTransaction',
          params: [transaction], // Base64 encoded transaction
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sanctum Gateway error:', errorText);
      return NextResponse.json(
        { error: `Gateway API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Gateway response received successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sanctum Gateway proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process Gateway request', details: String(error) },
      { status: 500 }
    );
  }
}
