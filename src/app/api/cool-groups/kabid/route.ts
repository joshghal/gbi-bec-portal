import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

const DOC_PATH = 'settings/cool';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.doc(DOC_PATH).get();
    return NextResponse.json(doc.exists ? doc.data() : { kabid: null });
  } catch {
    return NextResponse.json({ kabid: null });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { kabid } = await request.json();
    const db = getAdminFirestore();
    await db.doc(DOC_PATH).set({ kabid }, { merge: true });
    logAdminAction(request, 'update', 'cool-kabid', { resourceTitle: kabid?.name || '' });
    return NextResponse.json({ kabid });
  } catch (error) {
    console.error('Update kabid error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
