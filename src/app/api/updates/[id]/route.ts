import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { generateUniqueSlug } from '@/lib/slug';

// PUT /api/updates/[id] — requires auth, update fields
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
    const ref = db.collection('updates').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const update = { ...body, updatedAt: new Date().toISOString() };
    // Remove id if accidentally included in body
    delete update.id;

    // Only one pinned allowed — unpin others first
    if (body.pinned === true) {
      const pinnedDocs = await db.collection('updates').where('pinned', '==', true).get();
      const batch = db.batch();
      pinnedDocs.docs.forEach(d => {
        if (d.id !== id) batch.update(d.ref, { pinned: false });
      });
      await batch.commit();
    }

    // Regenerate slug if title changed
    if (body.title && body.title !== existing.data()?.title) {
      update.slug = await generateUniqueSlug(body.title, db, id);
    }

    await ref.update(update);
    logAdminAction(request, 'update', 'kabar', { resourceId: id, resourceTitle: existing.data()?.title });
    revalidatePath('/kabar');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/updates/[id] — requires auth, remove document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const db = getAdminFirestore();
    const ref = db.collection('updates').doc(id);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const title = existing.data()?.title;
    await ref.delete();
    logAdminAction(request, 'delete', 'kabar', { resourceId: id, resourceTitle: title });
    revalidatePath('/kabar');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
