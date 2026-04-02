import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// GET /api/activities          — public, returns enabled activities ordered by `order`
// GET /api/activities?all=1    — requires auth, returns all activities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';

  if (all) {
    const authError = await verifyAuthToken(request);
    if (authError) return authError;
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('activities').orderBy('order', 'asc').get();
    let activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (!all) {
      activities = activities.filter((a: any) => a.enabled !== false);
    }
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/activities — requires auth, creates new activity
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const db = getAdminFirestore();

    // Get next order value
    const last = await db.collection('activities').orderBy('order', 'desc').limit(1).get();
    const nextOrder = last.empty ? 0 : ((last.docs[0].data().order ?? 0) + 1);

    const doc = {
      title: body.title,
      subtitle: body.subtitle ?? '',
      day: body.day ?? '',
      description: body.description ?? '',
      longDescription: body.longDescription ?? '',
      tags: body.tags ?? [],
      contacts: body.contacts ?? [],
      ctaLabel: body.ctaLabel ?? '',
      ctaHref: body.ctaHref ?? '',
      ctaExternal: body.ctaExternal ?? false,
      aiQuestion: body.aiQuestion ?? '',
      enabled: body.enabled ?? true,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection('activities').add(doc);
    logAdminAction(request, 'create', 'kegiatan', { resourceId: ref.id, resourceTitle: doc.title });
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
