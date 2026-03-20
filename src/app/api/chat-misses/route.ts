import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('chat_misses')
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    const misses = snapshot.docs.map(doc => ({
      id: doc.id,
      question: doc.data().question || '',
      response: doc.data().response || '',
      sources: doc.data().sources || [],
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ misses });
  } catch (error) {
    console.error('chat-misses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('chat_misses').get();
    if (snapshot.empty) return NextResponse.json({ ok: true, deleted: 0 });

    // Firestore batch limit is 500
    const batches = [];
    let batch = db.batch();
    let count = 0;
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      if (count % 500 === 0) {
        batches.push(batch.commit());
        batch = db.batch();
      }
    }
    batches.push(batch.commit());
    await Promise.all(batches);

    return NextResponse.json({ ok: true, deleted: count });
  } catch (error) {
    console.error('chat-misses DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
