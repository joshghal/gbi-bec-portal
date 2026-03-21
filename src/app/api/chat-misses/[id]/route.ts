import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const db = getAdminFirestore();
    await db.collection('chat_misses').doc(id).delete();
    logAdminAction(request, 'delete', 'chat-misses', { resourceId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('chat-misses [id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
