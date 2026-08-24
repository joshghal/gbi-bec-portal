import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';
import { checkStreamStillLive } from '@/lib/youtube-live-status';
import { triggerRerun } from '@/lib/cloud-run-trigger';

// POST /api/sermon-captures/[id]/rerun
//
// Item 3 of docs/HLD-sermon-capture-resilience.md (gbi-bec-youtube-live-sync
// repo): manually restart the capture for a service whose broadcast is still
// live, targeting the same known videoId directly instead of waiting for
// discovery. Only useful while the broadcast hasn't ended yet — see the HLD's
// §6 for why a post-hoc re-run can't recover more than a fresh attempt could.
//
// Two-layer gate, cheap check first:
//   1. Time window (here, server-side) — refuse outright if capturedAt is
//      older than MAX_SERVICE_WINDOW_MS. The admin UI applies the same check
//      to decide whether to render the button active at all; this route
//      re-enforces it so a stale UI or a direct API call can't bypass it.
//   2. YouTube-authoritative (checkStreamStillLive) — the real guard. Refuses
//      with 409 if the broadcast has actually ended, even if layer 1 passed.
//      Fails OPEN (proceeds) on an inconclusive check (null) — a transient
//      API hiccup shouldn't block a deliberate admin action.
const MAX_SERVICE_WINDOW_MS = 3 * 60 * 60 * 1000; // 3h — generous past the normal ~90min service

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

    if (cap.status === 'capturing') {
      return NextResponse.json({ error: 'Capture ini sedang berjalan — tidak perlu re-run.' }, { status: 409 });
    }
    if (!cap.videoId || cap.serviceNumber == null) {
      return NextResponse.json({ error: 'Capture ini tidak punya videoId/serviceNumber lengkap.' }, { status: 400 });
    }

    // Layer 1 — time window
    const startedAt = (cap.capturedAt ?? cap.createdAt) as string | undefined;
    const startedMs = startedAt ? Date.parse(startedAt) : NaN;
    if (!Number.isFinite(startedMs) || Date.now() - startedMs > MAX_SERVICE_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Layanan ini kemungkinan sudah selesai — re-run tidak akan mendapat lebih banyak konten.' },
        { status: 409 },
      );
    }

    // Layer 2 — YouTube-authoritative
    const stillLive = await checkStreamStillLive(cap.videoId as string);
    if (stillLive === false) {
      return NextResponse.json(
        { error: 'YouTube melaporkan siaran ini sudah berakhir — re-run tidak akan mendapat lebih banyak konten.' },
        { status: 409 },
      );
    }

    const result = await triggerRerun({
      serviceNumber: cap.serviceNumber as number,
      videoId: cap.videoId as string,
      title: (cap.title as string | null) ?? null,
      sermonDate: (cap.sermonDate as string | null) ?? null,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'Gagal memicu re-run' }, { status: 502 });
    }

    logAdminAction(request, 'update', 'sermon-captures-rerun', {
      resourceTitle: `service ${cap.serviceNumber} — ${cap.videoId}`,
    });

    return NextResponse.json({ ok: true, executionName: result.executionName, poller: stillLive });
  } catch (err) {
    console.error('sermon-captures/rerun error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
