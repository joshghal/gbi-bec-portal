import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// PUT /api/activities/reorder — requires auth, updates order of all activities
// Body: { ids: string[] } — ordered list of activity IDs
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const batch = db.batch();

    ids.forEach((id: string, index: number) => {
      batch.update(db.collection('activities').doc(id), { order: index, updatedAt: new Date().toISOString() });
    });

    await batch.commit();
    logAdminAction(request, 'update', 'kegiatan-reorder', { resourceTitle: `Reorder ${ids.length} items` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
