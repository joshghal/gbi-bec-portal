import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { callGemini, parseGeminiJson, isGeminiConfigured } from '@/lib/ai/gemini';
import type { ServiceItem } from '@/lib/service-slides/types';

// POST /api/service-sets/polish — auth
// "Rapikan" — tidy the text of EVERY slide in a set (fixed + songs) in one pass.
// Returns cleaned items; the admin reviews before saving. Structure (key/type/
// songId/fixedId) is always preserved — only text fields are merged back.
interface PolishedItem {
  key: string;
  title?: string;
  slides?: string[];
}
interface PolishResponse {
  items?: PolishedItem[];
}

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  if (!isGeminiConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items harus berupa array' }, { status: 400 });
    }
    const original = items as ServiceItem[];
    if (original.length === 0) return NextResponse.json({ configured: true, items: [] });

    // Only SONG items have editable text; fixed slides are images and pass through.
    const songs = original.filter((it) => it.type === 'song');
    if (songs.length === 0) return NextResponse.json({ configured: true, items: original });

    const compact = songs.map((it) => ({
      key: it.key,
      title: it.type === 'song' ? it.title : '',
      slides: it.type === 'song' ? it.slides : [],
    }));

    const system =
      'You tidy the lyrics on church worship-presentation slides. ' +
      'Never translate or invent words. Only fix spacing, capitalization, stray characters, ' +
      'leftover chords, section labels, and obvious formatting issues. Keep meaning and language identical.';
    const prompt =
      `Tidy the lyrics of every song below. Keep each item's "key" unchanged and do NOT reorder.\n` +
      `- Clean each string in "slides" (fix line breaks, remove chords/labels); keep the same slide count where possible.\n` +
      `- Do NOT change wording or language.\n\n` +
      `Return ONLY JSON: {"items":[{"key","title","slides"}...]}\n\n` +
      `SONGS:\n${JSON.stringify(compact)}`;

    const result = await callGemini({ prompt, system, temperature: 0.1 });
    if (!result.success) {
      return NextResponse.json({ configured: true, error: result.error }, { status: 502 });
    }

    const parsed = parseGeminiJson<PolishResponse>(result.text || '');
    const cleanedByKey = new Map<string, PolishedItem>();
    (parsed?.items || []).forEach((p) => {
      if (p?.key) cleanedByKey.set(p.key, p);
    });

    // Merge cleaned lyrics onto song items; fixed (image) slides pass through.
    const merged: ServiceItem[] = original.map((it) => {
      if (it.type !== 'song') return it;
      const c = cleanedByKey.get(it.key);
      if (!c) return it;
      const cleanedSlides =
        Array.isArray(c.slides) && c.slides.length
          ? c.slides.map((s) => (s || '').toString()).filter(Boolean)
          : it.slides;
      return {
        ...it,
        title: typeof c.title === 'string' && c.title.trim() ? c.title : it.title,
        slides: cleanedSlides,
      };
    });

    return NextResponse.json({ configured: true, items: merged });
  } catch (error) {
    console.error('Polish set error:', error);
    return NextResponse.json({ error: 'Gagal merapikan konten' }, { status: 500 });
  }
}
