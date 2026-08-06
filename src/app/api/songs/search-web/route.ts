import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';

// GET /api/songs/search-web?q=... — auth
// Google "search": real web results via the Custom Search JSON API.
// Requires env GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX (a Programmable Search Engine id).
// Free tier 100/day. When unconfigured, returns { configured: false } so the UI
// falls back to an "open in Google + paste" flow (no setup needed).
export interface WebLyricResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) {
    return NextResponse.json({ configured: false, results: [] as WebLyricResult[] });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ configured: true, results: [] as WebLyricResult[] });

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', cx);
    url.searchParams.set('q', `${q} lirik lagu`);
    url.searchParams.set('num', '8');

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { configured: true, error: `Google CSE ${res.status}: ${text.slice(0, 200)}`, results: [] },
        { status: 502 },
      );
    }

    const data = await res.json();
    const results: WebLyricResult[] = (data.items || []).map(
      (item: { title?: string; link?: string; snippet?: string; displayLink?: string }) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
        displayLink: item.displayLink || '',
      }),
    );
    return NextResponse.json({ configured: true, results });
  } catch (error) {
    console.error('Web lyric search error:', error);
    return NextResponse.json({ configured: true, error: 'Pencarian gagal', results: [] }, { status: 500 });
  }
}
