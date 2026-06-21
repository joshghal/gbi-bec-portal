import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// POST /api/sermon-captures/[id]/manual-notes
// Save or update notetaker's manual notes for a sermon capture.
// Setting any non-empty value marks combinedSummary as stale (if one exists)
// so the UI can prompt the user to re-combine. Clearing (empty string) wipes both.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    const db = getAdminFirestore();
    const ref = db.collection('sermon_captures').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cap = snap.data()!;

    const now = new Date().toISOString();
    if (!notes) {
      // Empty body = clear both manualNotes AND any stale combined output
      await ref.update({
        manualNotes: null,
        manualNotesUpdatedAt: null,
        combinedSummary: null,
        combinedSummaryModel: null,
        combinedAt: null,
        combinedStale: false,
      });
      logAdminAction(request, 'update', 'sermon-capture', { resourceId: id, resourceTitle: `clear-manual-notes: ${cap.title ?? id}` });
      return NextResponse.json({ success: true, manualNotesLength: 0 });
    }

    // Update notes. If a combinedSummary already existed, mark it stale —
    // user should re-combine to pick up the new manual content.
    const updates: Record<string, unknown> = {
      manualNotes: notes,
      manualNotesUpdatedAt: now,
    };
    if (cap.combinedSummary) updates.combinedStale = true;

    await ref.update(updates);
    logAdminAction(request, 'update', 'sermon-capture', { resourceId: id, resourceTitle: `manual-notes: ${cap.title ?? id}` });
    return NextResponse.json({ success: true, manualNotesLength: notes.length, combinedStale: !!cap.combinedSummary });
  } catch (err) {
    console.error('Manual-notes save error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
