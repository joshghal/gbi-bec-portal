import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { processSermonNotes } from '@/lib/ai/sermon-to-kabar';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/updates/generate-content — admin only.
// Body: { notes: string }  ->  SermonKabarDraft (title, excerpt, content, category, color, date, speaker, theme, serviceType)
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { notes } = await request.json();
    if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
      return NextResponse.json({ error: 'Catatan khotbah terlalu pendek.' }, { status: 400 });
    }
    const fallbackDate = new Date().toISOString().slice(0, 10);
    const draft = await processSermonNotes(notes.trim(), fallbackDate);
    return NextResponse.json(draft);
  } catch (error) {
    console.error('generate-content error:', error);
    return NextResponse.json({ error: 'Gagal membuat konten dari catatan.' }, { status: 500 });
  }
}
