import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import type { ServiceItem, ServiceSet } from '@/lib/service-slides/types';

// GET /api/service-sets/[id] — auth, one set
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('service_sets').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() } as ServiceSet);
  } catch (error) {
    console.error('Get service set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/service-sets/[id] — auth, save title/date/items (also handles reorder)
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
    const ref = db.collection('service_sets').doc(id);

    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (typeof body.title === 'string') update.title = body.title.trim();
    if (typeof body.serviceDate === 'string') update.serviceDate = body.serviceDate;
    if (Array.isArray(body.items)) update.items = body.items as ServiceItem[];

    await ref.update(update);
    logAdminAction(request, 'update', 'ibadah-set', {
      resourceId: id,
      resourceTitle: (update.title as string) ?? existing.data()?.title,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update service set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/service-sets/[id] — auth
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const ref = db.collection('service_sets').doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const title = existing.data()?.title;
    await ref.delete();
    logAdminAction(request, 'delete', 'ibadah-set', { resourceId: id, resourceTitle: title });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete service set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
