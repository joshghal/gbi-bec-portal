import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { generateUniqueSlug } from '@/lib/slug';

// GET /api/updates          — public, returns published updates ordered by date DESC, limit 10
// GET /api/updates?all=1    — requires auth, returns all updates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';

  if (all) {
    const authError = await verifyAuthToken(request);
    if (authError) return authError;
  }

  try {
    const db = getAdminFirestore();
    let query = db.collection('updates').orderBy('date', 'desc');

    if (!all) {
      query = query.where('published', '==', true).limit(10) as typeof query;
    }

    const snapshot = await query.get();
    const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(updates);
  } catch (error) {
    console.error('Get updates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/updates — requires auth, creates new update
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const db = getAdminFirestore();
    const slug = await generateUniqueSlug(body.title, db);

    const pinned = body.pinned ?? false;

    // Only one pinned allowed — unpin others first
    if (pinned) {
      const pinnedDocs = await db.collection('updates').where('pinned', '==', true).get();
      const batch = db.batch();
      pinnedDocs.docs.forEach(d => batch.update(d.ref, { pinned: false }));
      await batch.commit();
    }

    const doc = {
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content ?? '',
      category: body.category,
      date: body.date,
      color: body.color,
      imageUrl: body.imageUrl ?? null,
      isVideo: body.isVideo ?? false,
      pinned,
      published: body.published ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection('updates').add(doc);
    logAdminAction(request, 'create', 'kabar', { resourceId: ref.id, resourceTitle: doc.title });
    revalidatePath('/kabar');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Create update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
