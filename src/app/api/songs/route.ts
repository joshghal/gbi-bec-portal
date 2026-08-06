import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { segmentLyrics, buildSongSearchText, normalizeForSearch } from '@/lib/service-slides/segment';
import type { Song } from '@/lib/service-slides/types';

// GET /api/songs           — auth, all songs (ordered by title)
// GET /api/songs?q=rusa    — auth, songs matching name OR lyric fragment (ranked)
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const q = normalizeForSearch(searchParams.get('q') || '');

    const db = getAdminFirestore();
    const snapshot = await db.collection('songs').orderBy('title', 'asc').get();
    const songs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Song);

    if (!q) return NextResponse.json(songs);

    // Rank: title match (2) > artist match (1) > lyric match (0). Drop non-matches.
    const ranked = songs
      .map((song) => {
        const title = normalizeForSearch(song.title);
        const artist = normalizeForSearch(song.artist || '');
        const inTitle = title.includes(q);
        const inArtist = artist.includes(q);
        const inBody = (song.searchText || '').includes(q);
        if (!inTitle && !inArtist && !inBody) return null;
        const score = inTitle ? 2 : inArtist ? 1 : 0;
        return { song, score };
      })
      .filter((r): r is { song: Song; score: number } => r !== null)
      .sort((a, b) => b.score - a.score || a.song.title.localeCompare(b.song.title))
      .map((r) => r.song);

    return NextResponse.json(ranked);
  } catch (error) {
    console.error('Get songs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/songs — auth, create a song (slides derived from rawLyrics)
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Judul lagu wajib diisi' }, { status: 400 });
    }

    const artist = (body.artist || '').trim();
    const rawLyrics = (body.rawLyrics || '').toString();
    const now = new Date().toISOString();

    const doc = {
      title,
      artist,
      rawLyrics,
      slides: segmentLyrics(rawLyrics),
      searchText: buildSongSearchText(title, artist, rawLyrics),
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: now,
      updatedAt: now,
    };

    const db = getAdminFirestore();
    const ref = await db.collection('songs').add(doc);
    logAdminAction(request, 'create', 'lagu', { resourceId: ref.id, resourceTitle: title });
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Create song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
