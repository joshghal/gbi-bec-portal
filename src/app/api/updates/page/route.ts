import { NextRequest, NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';

// GET /api/updates/page — public, cursor-paginated published updates
//
// Query params:
//   limit       — number of items to return (default 12, max 24)
//   cursorDate  — `date` field of the last item from the previous page (YYYY-MM-DD)
//   cursorId    — document id of the last item from the previous page
//
// Response: { items: Update[], nextCursor: { date, id } | null }
//
// Ordering: date DESC, __name__ DESC (matches the composite index in
// firestore.indexes.json: [published ASC, date DESC, __name__ DESC]).
//
// Pinned items are NOT filtered server-side — the /kabar SSR fetches the pinned
// doc separately and the client filters it from this feed via `excludeIds`.

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;
    const cursorDate = searchParams.get('cursorDate');
    const cursorId = searchParams.get('cursorId');

    const db = getAdminFirestore();
    let query = db
      .collection('updates')
      .where('published', '==', true)
      .orderBy('date', 'desc')
      .orderBy(FieldPath.documentId(), 'desc');

    if (cursorDate && cursorId) {
      query = query.startAfter(cursorDate, cursorId);
    }

    // Fetch limit+1 to detect whether more pages exist without a second query.
    const snap = await query.limit(limit + 1).get();
    const docs = snap.docs;
    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const items = pageDocs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const last = pageDocs[pageDocs.length - 1];
    const nextCursor =
      hasMore && last
        ? { date: (last.data().date as string) ?? '', id: last.id }
        : null;

    return NextResponse.json({ items, nextCursor });
  } catch (err) {
    console.error('GET /api/updates/page error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
