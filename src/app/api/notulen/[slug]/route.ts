import { NextRequest, NextResponse, after } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { findActiveCaptureForNotes, findRecipientBySlug, serviceLabel } from '@/lib/notetaker';
import { saveNotesToCapture, validateNotes } from '@/lib/notetaker-submit';
import { runPublishChain } from '@/lib/sermon-publish-chain';

// The fallback chain (below) runs Gemini on a full transcript.
export const maxDuration = 300;

/**
 * PUBLIC, slug-gated notetaker endpoint — the delivery path that needs no
 * WhatsApp, no phone number and no Meta account.
 *
 * Each notulen has ONE permanent slug they bookmark. The link carries no capture
 * ID: the server resolves whichever service is live (or recently finished without
 * notes) each time it is opened. See findActiveCaptureForNotes().
 *
 * GET  /api/notulen/[slug] — which service, if any, is accepting notes now
 * POST /api/notulen/[slug] — submit notes; THIS ENDS THE CAPTURE
 *
 * Unlike the one-time token, a slug is not burned by use — it has to keep working
 * next Sunday. Double-submit protection therefore lives on the capture instead:
 * saveNotesToCapture() refuses a capture that already has notes.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const db = getAdminFirestore();
    const recipient = await findRecipientBySlug(db, slug);
    if (!recipient) return NextResponse.json({ status: 'not-found' }, { status: 404 });

    const capture = await findActiveCaptureForNotes(db);
    if (!capture) {
      return NextResponse.json({ status: 'idle', name: recipient.name });
    }

    return NextResponse.json({
      status: 'ok',
      name: recipient.name,
      captureId: capture.id,
      service: serviceLabel(capture.serviceNumber, capture.sermonDate),
      live: capture.live,
    });
  } catch (err) {
    console.error('notulen GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const db = getAdminFirestore();
    const recipient = await findRecipientBySlug(db, slug);
    if (!recipient) return NextResponse.json({ error: 'Link tidak valid.' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const validated = validateNotes(body?.notes);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    // Resolve the target server-side rather than trusting a captureId from the
    // client — a stale tab must not be able to write notes onto an old service.
    const capture = await findActiveCaptureForNotes(db);
    if (!capture) {
      return NextResponse.json(
        { error: 'Belum ada ibadah yang sedang berlangsung. Coba lagi saat ibadah dimulai.' },
        { status: 409 },
      );
    }

    const result = await saveNotesToCapture(db, capture.id, validated.notes, 'notulen-slug');
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    // `after()` so the notulen isn't held while Gemini merges a 90-minute sermon.
    if (result.needsChain) {
      const captureId = capture.id;
      after(async () => {
        try {
          const chain = await runPublishChain(getAdminFirestore(), captureId);
          console.log(`[notulen] publish chain for ${captureId}:`, JSON.stringify(chain));
        } catch (e) {
          console.error(`[notulen] publish chain for ${captureId} threw:`, e);
        }
      });
    }

    return NextResponse.json({
      success: true,
      notesLength: result.notesLength,
      captureStopping: result.captureStopping,
    });
  } catch (err) {
    console.error('notulen POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
