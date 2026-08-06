import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { callGemini, parseGeminiJson, isGeminiConfigured } from '@/lib/ai/gemini';
import { segmentLyrics } from '@/lib/service-slides/segment';

// POST /api/songs/find — auth
// Grounded lyric search: name/fragment -> real lyrics (with source links to verify).
interface FoundLyrics {
  found?: boolean;
  title?: string;
  artist?: string;
  lyrics?: string;
}

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  if (!isGeminiConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const { query } = await request.json();
    const q = (query || '').toString().trim();
    if (!q) {
      return NextResponse.json({ configured: true, found: false, error: 'Query kosong' }, { status: 400 });
    }

    const system =
      'You help an Indonesian church A/V team prepare worship-song lyric slides. ' +
      'Use Google Search to find the ACTUAL, correct lyrics of the requested song. ' +
      'Preserve the original language (usually Indonesian) and exact wording. Do not translate. ' +
      'Never invent lyrics — if you cannot find them reliably, say so.';

    const prompt =
      `Find the worship song for this query: "${q}".\n\n` +
      `Return ONLY a JSON object (no prose) shaped:\n` +
      `{"found": true, "title": "...", "artist": "...", "lyrics": "..."}\n\n` +
      `Rules for "lyrics":\n` +
      `- Plain text of the full lyrics.\n` +
      `- Separate each projection stanza with ONE BLANK LINE (each stanza = one slide, ~2-4 lines).\n` +
      `- No chords, no section labels like [Verse]/[Chorus], no ads, no numbering.\n` +
      `- Keep the original words and language exactly.\n` +
      `If you cannot find the real lyrics, return {"found": false}.`;

    const result = await callGemini({ prompt, system, grounding: true, temperature: 0.15 });
    if (!result.success) {
      return NextResponse.json({ configured: true, found: false, error: result.error }, { status: 502 });
    }

    const parsed = parseGeminiJson<FoundLyrics>(result.text || '');
    if (!parsed || parsed.found === false || !parsed.lyrics) {
      return NextResponse.json({ configured: true, found: false, sources: result.sources || [] });
    }

    const rawLyrics = parsed.lyrics.trim();
    return NextResponse.json({
      configured: true,
      found: true,
      title: (parsed.title || '').trim(),
      artist: (parsed.artist || '').trim(),
      rawLyrics,
      slides: segmentLyrics(rawLyrics),
      sources: result.sources || [],
    });
  } catch (error) {
    console.error('Find lyrics error:', error);
    return NextResponse.json({ configured: true, found: false, error: 'Pencarian gagal' }, { status: 500 });
  }
}
