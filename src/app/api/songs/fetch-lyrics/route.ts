import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';

// GET /api/songs/fetch-lyrics?url=... — auth
// Best-effort: fetch a lyric page the admin picked from Google results and
// return plain text to pre-fill the editor. The admin ALWAYS verifies/edits
// before saving — extraction is imperfect and site-dependent.
const BLOCK_TAGS = /<\/(p|div|br|li|h[1-6]|section|article)>/gi;
const SELF_BR = /<br\s*\/?>/gi;

function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<(nav|header|footer|form|aside)[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(SELF_BR, '\n');
  s = s.replace(BLOCK_TAGS, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url') || '';

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Hanya http/https yang didukung' }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GBIBEC-LyricFetch/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Gagal memuat halaman (${res.status})` }, { status: 502 });
    }
    const html = await res.text();
    return NextResponse.json({ text: htmlToText(html) });
  } catch (error) {
    console.error('Fetch lyrics error:', error);
    return NextResponse.json({ error: 'Gagal mengambil lirik dari halaman' }, { status: 500 });
  }
}
