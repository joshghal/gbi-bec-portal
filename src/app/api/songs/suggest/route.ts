import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { callGemini, parseGeminiJson, isGeminiConfigured } from '@/lib/ai/gemini';

// POST /api/songs/suggest — auth
// AI "search": return a LIST of candidate songs matching a title or lyric
// fragment (no lyrics yet). The admin picks one, then /api/songs/find fetches
// the full lyrics for that specific song.
interface Candidate {
  title: string;
  artist?: string;
}
interface SuggestResult {
  candidates?: Candidate[];
}

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  if (!isGeminiConfigured()) {
    return NextResponse.json({ configured: false, candidates: [] });
  }

  try {
    const { query } = await request.json();
    const q = (query || '').toString().trim();
    if (!q) return NextResponse.json({ configured: true, candidates: [] });

    const system =
      'You help an Indonesian church A/V team find worship songs. ' +
      'Use Google Search to identify REAL songs that match a title or a fragment of lyrics.';
    const prompt =
      `The user is searching for a worship song by title OR by a fragment of its lyrics: "${q}".\n\n` +
      `Return ONLY JSON: {"candidates":[{"title":"...","artist":"..."}]}\n` +
      `- Up to 6 REAL songs that best match, most likely first.\n` +
      `- Assume Indonesian worship songs unless clearly otherwise.\n` +
      `- Do NOT include lyrics here.\n` +
      `- If nothing plausible matches, return {"candidates":[]}.`;

    const result = await callGemini({ prompt, system, grounding: true, temperature: 0.3 });
    if (!result.success) {
      return NextResponse.json({ configured: true, candidates: [], error: result.error }, { status: 502 });
    }

    const parsed = parseGeminiJson<SuggestResult>(result.text || '');
    const candidates = Array.isArray(parsed?.candidates)
      ? parsed!.candidates
          .filter((c): c is Candidate => !!c && typeof c.title === 'string' && c.title.trim().length > 0)
          .map((c) => ({ title: c.title.trim(), artist: (c.artist || '').toString().trim() }))
          .slice(0, 6)
      : [];

    return NextResponse.json({ configured: true, candidates });
  } catch (error) {
    console.error('Suggest songs error:', error);
    return NextResponse.json({ configured: true, candidates: [], error: 'Pencarian gagal' }, { status: 500 });
  }
}
