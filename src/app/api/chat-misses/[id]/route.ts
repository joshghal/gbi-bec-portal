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
    const doc = await db.collection('chat_misses').doc(id).get();
    const question: string = doc.data()?.question ?? '';
    await db.collection('chat_misses').doc(id).delete();
    logAdminAction(request, 'delete', 'chat-misses', {
      resourceTitle: question.length > 80 ? question.slice(0, 77) + '…' : question || id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('chat-misses [id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
