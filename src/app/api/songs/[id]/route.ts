import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { segmentLyrics, buildSongSearchText } from '@/lib/service-slides/segment';

// PUT /api/songs/[id] — auth, update a song (re-derive slides/searchText on lyric change)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const db = getAdminFirestore();
    const ref = db.collection('songs').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const prev = existing.data() || {};

    const title = (body.title ?? prev.title ?? '').trim();
    const artist = (body.artist ?? prev.artist ?? '').trim();
    const rawLyrics = (body.rawLyrics ?? prev.rawLyrics ?? '').toString();

    const update = {
      title,
      artist,
      rawLyrics,
      slides: segmentLyrics(rawLyrics),
      searchText: buildSongSearchText(title, artist, rawLyrics),
      tags: Array.isArray(body.tags) ? body.tags : (prev.tags ?? []),
      updatedAt: new Date().toISOString(),
    };

    await ref.update(update);
    logAdminAction(request, 'update', 'lagu', { resourceId: id, resourceTitle: title });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/songs/[id] — auth, remove a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const db = getAdminFirestore();
    const ref = db.collection('songs').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const title = existing.data()?.title;
    await ref.delete();
    logAdminAction(request, 'delete', 'lagu', { resourceId: id, resourceTitle: title });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
