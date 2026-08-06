import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { getFixedConfig, saveFixedConfig } from '@/lib/service-slides/server';
import { DEFAULT_SONG_BACKGROUND, type FixedSlide } from '@/lib/service-slides/types';

// GET /api/service-slides/fixed — auth. Returns { slides, songBackgroundUrl }.
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const cfg = await getFixedConfig();
    return NextResponse.json(cfg);
  } catch (error) {
    console.error('Get fixed config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/service-slides/fixed — auth. Body: { slides: FixedSlide[], songBackgroundUrl?: string }
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!Array.isArray(body.slides)) {
      return NextResponse.json({ error: 'slides harus berupa array' }, { status: 400 });
    }

    const slides: FixedSlide[] = body.slides.map((s: Partial<FixedSlide>, i: number) => ({
      id: s.id || `slide-${i}`,
      label: (s.label || '').toString(),
      imageUrl: (s.imageUrl || '').toString(),
      order: typeof s.order === 'number' ? s.order : i,
    }));
    const songBackgroundUrl = (body.songBackgroundUrl || DEFAULT_SONG_BACKGROUND).toString();

    await saveFixedConfig(slides, songBackgroundUrl);
    logAdminAction(request, 'update', 'ibadah-slide-tetap', { resourceTitle: `${slides.length} slide` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save fixed config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
