import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// GET /api/cool-groups — public returns all, ?all=1 requires auth
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';

  if (all) {
    const authError = await verifyAuthToken(request);
    if (authError) return authError;
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('cool_groups').orderBy('order', 'asc').get();
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Get cool groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cool-groups — requires auth
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const db = getAdminFirestore();

    const last = await db.collection('cool_groups').orderBy('order', 'desc').limit(1).get();
    const nextOrder = last.empty ? 0 : ((last.docs[0].data().order ?? 0) + 1);

    const doc = {
      name: body.name ?? '',
      area: body.area ?? '',
      ketua: body.ketua ?? { name: '', phone: '', email: '' },
      wakil: body.wakil ?? { name: '', phone: '', email: '' },
      sekretaris: body.sekretaris ?? { name: '', phone: '', email: '' },
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection('cool_groups').add(doc);
    logAdminAction(request, 'create', 'cool-group', { resourceId: ref.id, resourceTitle: doc.name });
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error('Create cool group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
