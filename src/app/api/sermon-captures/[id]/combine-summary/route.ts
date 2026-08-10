import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { runCombineForCapture } from '@/lib/sermon-combine-runner';
import { logAdminAction } from '@/lib/admin-logger';

// POST /api/sermon-captures/[id]/combine-summary
// Merges manualNotes (from notetaker) + AI summary (finalSummary || latestSummary)
// into ONE polished catatan. The merge prompt and the Firestore/GCS persistence
// live in @/lib/sermon-combine-runner so the automated publish chain runs the
// identical combine.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const result = await runCombineForCapture(db, id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    logAdminAction(request, 'update', 'sermon-capture', {
      resourceId: id,
      resourceTitle: `combine-summary: ${result.videoTitle}`,
    });
    return NextResponse.json({
      summary: result.summary,
      model: result.model,
      manualNotesLength: result.manualNotesLength,
      aiSummaryLength: result.aiSummaryLength,
      combinedLength: result.summary.length,
    });
  } catch (err) {
    console.error('Combine summary error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
