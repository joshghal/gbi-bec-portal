import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

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

    await ref.update(update);
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

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
