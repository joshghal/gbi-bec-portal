import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// POST /api/sermon-captures/[id]/stop-and-summarize
// Signals the running engine (Cloud Run Job) to gracefully terminate the live
// capture and run the Gemini 2.5 Pro final summary on whatever transcript has
// been collected so far. Mechanism: sets `stopRequested=true` on the Firestore
// doc. The engine polls this field every 15s and self-terminates via its
// existing finalize path (kills ffmpeg, closes Gemini Live, calls Gemini 2.5
// Pro, writes transcript.txt + final_summary.md + meta.json to GCS, updates
// Firestore status='captured' with endReason='manual-stop').
//
// This endpoint returns immediately — the actual finalize happens in the
// engine container within ~15-30 seconds. The portal UI should poll the
// capture's status until it flips to 'captured'.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const ref = db.collection('sermon_captures').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cap = snap.data()!;

    if (cap.status !== 'capturing') {
      return NextResponse.json(
        { error: `Capture is not in 'capturing' state (current: ${cap.status}). Use Generate Summary for finalized captures.` },
        { status: 400 },
      );
    }
    if (cap.stopRequested === true) {
      return NextResponse.json(
        { success: true, alreadyRequested: true, message: 'Stop signal already sent; engine should finalize within ~15s.' },
      );
    }

    await ref.update({
      stopRequested: true,
      stopRequestedAt: new Date().toISOString(),
    });

    logAdminAction(request, 'update', 'sermon-capture', { resourceId: id, resourceTitle: `stop-and-summarize: ${cap.title ?? id}` });
    return NextResponse.json({
      success: true,
      message: 'Stop signal sent. Engine will finalize within ~15 seconds. Refresh the page to see the captured summary.',
    });
  } catch (err) {
    console.error('Stop-and-summarize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
