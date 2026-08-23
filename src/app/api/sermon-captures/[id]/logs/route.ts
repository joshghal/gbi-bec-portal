import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { fetchExecutionLogs } from '@/lib/cloud-logging';

// GET /api/sermon-captures/[id]/logs
//
// On-demand snapshot of the Cloud Run Job execution that produced this
// capture — the last ~30 minutes of its Cloud Logging entries, read once per
// request. Not a live tail (see docs/HLD-sermon-capture-resilience.md, Item 4
// in gbi-bec-youtube-live-sync). Admin-only: raw execution logs are an
// operational surface, not something to expose publicly.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('sermon_captures').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const executionName = snap.data()?.cloudRunExecutionName as string | null | undefined;
    if (!executionName) {
      return NextResponse.json(
        { error: 'Capture ini tidak punya cloudRunExecutionName (dibuat sebelum fitur ini ada).' },
        { status: 404 },
      );
    }

    const result = await fetchExecutionLogs(executionName);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'Log fetch failed' }, { status: 502 });
    }
    return NextResponse.json({ executionName, lines: result.lines });
  } catch (err) {
    console.error('sermon-captures/logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
