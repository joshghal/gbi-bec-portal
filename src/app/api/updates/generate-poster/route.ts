import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { generateKhotbahPoster } from '@/lib/poster/poster';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/updates/generate-poster — admin only.
// Body: { theme, serviceType, speaker, date }  ->  { imageUrl }
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { theme, serviceType, speaker, date } = await request.json();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Tanggal tidak valid.' }, { status: 400 });
    }
    const imageUrl = await generateKhotbahPoster({
      theme: theme || 'Catatan Khotbah',
      serviceType: serviceType || 'Ibadah Raya',
      speaker: speaker || '',
      date,
    });
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('generate-poster error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membuat poster.' },
      { status: 500 },
    );
  }
}
