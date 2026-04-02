import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

const DOC_PATH = 'settings/announcement';

// GET /api/announcement — public, returns current announcement
export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.doc(DOC_PATH).get();
    if (!doc.exists) {
      return NextResponse.json({ enabled: false });
    }
    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Get announcement error:', error);
    return NextResponse.json({ enabled: false });
  }
}

// PUT /api/announcement — requires auth, update announcement
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const db = getAdminFirestore();

    const data = {
      enabled: body.enabled ?? false,
      title: body.title ?? '',
      description: body.description ?? '',
      ctaLabel: body.ctaLabel ?? '',
      ctaLink: body.ctaLink ?? '',
      updatedAt: new Date().toISOString(),
    };

    await db.doc(DOC_PATH).set(data, { merge: true });
    logAdminAction(request, 'update', 'pengumuman', { resourceTitle: data.title || '(empty)' });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
