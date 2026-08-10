import { NextRequest, NextResponse, after } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { NOTE_LINKS_COLLECTION, resolveNoteLink, serviceLabel } from '@/lib/notetaker';
import { saveNotesToCapture, validateNotes } from '@/lib/notetaker-submit';
import { runPublishChain } from '@/lib/sermon-publish-chain';

// The fallback chain (below) runs Gemini on a full transcript.
export const maxDuration = 300;

/**
 * PUBLIC, token-gated notetaker endpoint. No Firebase auth — possession of the
 * 32-hex token (128 bits, delivered only over WhatsApp) is the credential.
 *
 * GET  /api/notetaker/[token] — link state for the form page
 * POST /api/notetaker/[token] — submit notes; THIS ENDS THE CAPTURE
 *
 * Submitting is the "khotbah selesai" signal: it writes manualNotes and trips
 * stopRequested, which the live engine polls every 15s
 * (gbi-bec-youtube-live-sync/src/live-summary.ts) before finalizing and calling
 * the publish chain. One-time by design — usedAt locks the link.
 */


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const db = getAdminFirestore();
    const state = await resolveNoteLink(db, token);

    if (state.status === 'not-found') {
      return NextResponse.json({ status: 'not-found' }, { status: 404 });
    }

    return NextResponse.json({
      status: state.status,
      service: serviceLabel(state.link.serviceNumber, state.link.sermonDate),
      title: state.link.title,
      expiresAt: state.link.expiresAt,
      usedAt: state.link.usedAt,
      submittedNotes: state.link.submittedNotes,
    });
  } catch (err) {
    console.error('notetaker GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const validated = validateNotes(body?.notes);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { notes } = validated;

    const db = getAdminFirestore();
    const state = await resolveNoteLink(db, token);

    if (state.status === 'not-found') {
      return NextResponse.json({ error: 'Link tidak valid.' }, { status: 404 });
    }
    if (state.status === 'used') {
      return NextResponse.json(
        { error: 'Catatan untuk ibadah ini sudah dikirim. Link ini hanya bisa dipakai satu kali.' },
        { status: 409 },
      );
    }
    if (state.status === 'expired') {
      return NextResponse.json(
        { error: 'Link sudah kedaluwarsa. Hubungi admin untuk link baru.' },
        { status: 410 },
      );
    }

    const { link } = state;
    const now = new Date().toISOString();

    // Burn the link FIRST. A double-submit (impatient tap, retried request) must
    // not be able to write notes twice or fire two publish chains.
    const linkRef = db.collection(NOTE_LINKS_COLLECTION).doc(token);
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(linkRef);
      if (!fresh.exists || fresh.data()?.usedAt) return false;
      tx.update(linkRef, { usedAt: now, submittedNotes: notes });
      return true;
    });
    if (!claimed) {
      return NextResponse.json(
        { error: 'Catatan untuk ibadah ini sudah dikirim. Link ini hanya bisa dipakai satu kali.' },
        { status: 409 },
      );
    }

    // Shared with the permanent-slug path so both behave identically.
    const result = await saveNotesToCapture(db, link.captureId, notes, 'notetaker-link');
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    // If the stream had ALREADY ended before the notulen submitted, no engine is
    // alive to call the publish chain — so run it here instead.
    //
    // `after()` (not a bare floating promise): the work must outlive the response,
    // and on Vercel the function is frozen the moment the response is sent, which
    // would kill an unawaited fetch mid-flight. The notulen must never sit
    // watching a spinner while Gemini merges a 90-minute sermon.
    if (result.needsChain) {
      const captureId = link.captureId;
      after(async () => {
        try {
          const chain = await runPublishChain(getAdminFirestore(), captureId);
          console.log(`[notetaker] publish chain for ${captureId}:`, JSON.stringify(chain));
        } catch (e) {
          console.error(`[notetaker] publish chain for ${captureId} threw:`, e);
        }
      });
    }

    return NextResponse.json({
      success: true,
      notesLength: result.notesLength,
      // Tells the UI which confirmation copy to show.
      captureStopping: result.captureStopping,
      chainTriggered: result.needsChain,
    });
  } catch (err) {
    console.error('notetaker POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
