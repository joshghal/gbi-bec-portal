import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// Public — no auth required (form availability is public info)
export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('forms').get();
    const data = doc.exists ? doc.data()! : {};
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get form settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const db = getAdminFirestore();
    await db.collection('settings').doc('forms').set(body, { merge: true });
    logAdminAction(request, 'update', 'form-settings', { resourceTitle: JSON.stringify(body.disabledForms ?? body) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update form settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
