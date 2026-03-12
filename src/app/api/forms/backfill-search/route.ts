import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { generateSearchTerms } from '@/lib/search-utils';

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('form_submissions').get();

    let updated = 0;
    let skipped = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Skip docs that already have searchTerms
      if (data.searchTerms && Array.isArray(data.searchTerms) && data.searchTerms.length > 0) {
        skipped++;
        continue;
      }

      const searchTerms = generateSearchTerms(data.type, data.data || {});
      batch.update(doc.ref, { searchTerms });
      batchCount++;
      updated++;

      // Firestore batch limit is 500, use 450 for safety
      if (batchCount >= 450) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ updated, skipped, total: snapshot.size });
  } catch (error) {
    console.error('Backfill search terms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
