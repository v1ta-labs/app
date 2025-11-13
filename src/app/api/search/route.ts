import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { SEARCH_SYSTEM_PROMPT } from '@/lib/ai/v1ta-knowledge-base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Generate AI response using Vercel AI SDK with Groq
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'), // Ultra-fast 8B model - 840 TPS, perfect for search
      system: SEARCH_SYSTEM_PROMPT,
      prompt: query,
      temperature: 0.7,
    });

    // Extract suggested pages from the answer
    const suggestedPages = extractSuggestedPages(text);

    return NextResponse.json({
      answer: text,
      suggestedPages,
      model: 'llama-3.1-8b',
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Extract page suggestions from AI response
function extractSuggestedPages(answer: string): Array<{ label: string; href: string }> {
  const pages = [];
  const pagePatterns = [
    { pattern: /\/positions/gi, label: 'Positions', href: '/positions' },
    { pattern: /\/stability/gi, label: 'Stability Pool', href: '/stability' },
    { pattern: /\/redeem/gi, label: 'Redeem', href: '/redeem' },
    { pattern: /\/liquidations/gi, label: 'Liquidations', href: '/liquidations' },
    { pattern: /\/portfolio/gi, label: 'Portfolio', href: '/portfolio' },
    { pattern: /\/analytics/gi, label: 'Analytics', href: '/analytics' },
    { pattern: /\/history/gi, label: 'History', href: '/history' },
    { pattern: /borrow|home page/gi, label: 'Borrow', href: '/' },
    { pattern: /docs\.v1ta\.xyz/gi, label: 'Documentation', href: 'https://docs.v1ta.xyz' },
    { pattern: /alpha\.v1ta\.xyz/gi, label: 'Alpha Version', href: 'https://alpha.v1ta.xyz' },
  ];

  const seen = new Set<string>();
  for (const { pattern, label, href } of pagePatterns) {
    if (pattern.test(answer) && !seen.has(href)) {
      pages.push({ label, href });
      seen.add(href);
    }
  }

  return pages;
}
