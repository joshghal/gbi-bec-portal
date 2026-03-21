import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

// GET /api/logs — requires auth, returns recent admin activity
// ?limit=50 ?action=create|update|delete ?resource=kabar|document|...
// ?before=ISO_TIMESTAMP for cursor pagination
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:log');
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
  const action = searchParams.get('action');
  const resource = searchParams.get('resource');
  const before = searchParams.get('before');

  try {
    const db = getAdminFirestore();
    let query = db.collection('admin_logs').orderBy('timestamp', 'desc') as FirebaseFirestore.Query;

    if (action) query = query.where('action', '==', action);
    if (resource) query = query.where('resource', '==', resource);
    if (before) query = query.where('timestamp', '<', before);

    query = query.limit(limit);

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const nextCursor = logs.length === limit ? logs[logs.length - 1] : null;

    return NextResponse.json({
      logs,
      nextCursor: nextCursor ? (nextCursor as { timestamp?: string }).timestamp ?? null : null,
    });
  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
