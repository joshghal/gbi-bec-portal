import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { callGemini, parseGeminiJson, isGeminiConfigured } from '@/lib/ai/gemini';
import { segmentLyrics } from '@/lib/service-slides/segment';

// POST /api/songs/segment — auth
// Tidy + split one song's raw lyrics into projection slides.
// Falls back to deterministic blank-line splitting when Gemini isn't configured.
interface SegmentResult {
  slides?: string[];
}

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { rawLyrics } = await request.json();
    const raw = (rawLyrics || '').toString();
    if (!raw.trim()) return NextResponse.json({ configured: isGeminiConfigured(), slides: [] });

    if (!isGeminiConfigured()) {
      return NextResponse.json({ configured: false, slides: segmentLyrics(raw) });
    }

    const system =
      'You tidy and paginate worship-song lyrics for projection slides. ' +
      'Never change, translate, or invent words — only clean formatting and choose slide breaks.';
    const prompt =
      `Clean up and split these lyrics into projection slides.\n\n` +
      `Rules:\n` +
      `- Remove chords, section labels ([Verse]/[Chorus]/numbers), ads, and duplicate blank lines.\n` +
      `- Keep the EXACT original words and language.\n` +
      `- Each slide = ~2-4 short lines that read well on a screen.\n` +
      `- Keep a chorus together; never split mid-sentence.\n\n` +
      `Return ONLY JSON: {"slides": ["line1\\nline2", "next slide", ...]}\n\n` +
      `LYRICS:\n${raw}`;

    const result = await callGemini({ prompt, system, temperature: 0.1 });
    if (!result.success) {
      // Graceful fallback to local splitting.
      return NextResponse.json({ configured: true, slides: segmentLyrics(raw), aiError: result.error });
    }

    const parsed = parseGeminiJson<SegmentResult>(result.text || '');
    const aiSlides = parsed?.slides;
    const slides =
      Array.isArray(aiSlides) && aiSlides.length
        ? aiSlides.map((s) => (s || '').toString().trim()).filter(Boolean)
        : segmentLyrics(raw);

    return NextResponse.json({ configured: true, slides });
  } catch (error) {
    console.error('Segment lyrics error:', error);
    return NextResponse.json({ error: 'Gagal memproses lirik' }, { status: 500 });
  }
}
