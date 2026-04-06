import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('suggestions')
      .orderBy('createdAt', 'desc')
      .get();

    const suggestions = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat saran.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = getAdminFirestore();
    await db.collection('suggestions').doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 });
  }
}
