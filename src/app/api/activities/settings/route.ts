import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

const SETTINGS_DOC = 'settings/kegiatan';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.doc(SETTINGS_DOC).get();
    const sectionEnabled = doc.exists ? (doc.data()?.sectionEnabled ?? true) : true;
    return NextResponse.json({ sectionEnabled });
  } catch {
    return NextResponse.json({ sectionEnabled: true });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { sectionEnabled } = await request.json();
    const db = getAdminFirestore();
    await db.doc(SETTINGS_DOC).set({ sectionEnabled }, { merge: true });
    logAdminAction(request, 'update', 'kegiatan-settings', { resourceTitle: sectionEnabled ? 'Aktifkan seksi' : 'Nonaktifkan seksi' });
    return NextResponse.json({ sectionEnabled });
  } catch (error) {
    console.error('Update kegiatan settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
