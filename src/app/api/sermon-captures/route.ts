import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

// GET /api/sermon-captures — list all captures, newest first
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('sermon_captures')
      .orderBy('capturedAt', 'desc')
      .limit(100)
      .get();
    const captures = snap.docs.map((d) => {
      const data = d.data();
      // Trim heavy fields for list view — full data via detail endpoint
      return {
        id: d.id,
        videoId: data.videoId,
        serviceNumber: data.serviceNumber,
        sermonDate: data.sermonDate,
        title: data.title,
        url: data.url,
        transcriptChars: data.transcriptChars,
        latestSummary: data.latestSummary,
        snapshotCount: Array.isArray(data.summarySnapshots) ? data.summarySnapshots.length : 0,
        status: data.status,
        endReason: data.endReason,
        actualDurationMs: data.actualDurationMs,
        capturedAt: data.capturedAt,
        kabarId: data.kabarId ?? null,
        kabarSlug: data.kabarSlug ?? null,
      };
    });
    return NextResponse.json(captures);
  } catch (err) {
    console.error('List sermon_captures error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
