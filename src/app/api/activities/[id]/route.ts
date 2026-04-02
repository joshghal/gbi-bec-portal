import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// PUT /api/activities/[id] — requires auth, update fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const db = getAdminFirestore();
    const ref = db.collection('activities').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const update = { ...body, updatedAt: new Date().toISOString() };
    delete update.id;

    await ref.update(update);
    logAdminAction(request, 'update', 'kegiatan', { resourceId: id, resourceTitle: existing.data()?.title });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/activities/[id] — requires auth, remove document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const db = getAdminFirestore();
    const ref = db.collection('activities').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const title = existing.data()?.title;
    await ref.delete();
    logAdminAction(request, 'delete', 'kegiatan', { resourceId: id, resourceTitle: title });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
