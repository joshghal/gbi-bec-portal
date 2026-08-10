import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { verifyInternalOrAdmin } from '@/lib/internal-auth';
import {
  createNoteLink,
  getNotetakerSettings,
  resolveNoteLink,
  serviceLabel,
} from '@/lib/notetaker';
import { isWhatsAppConfigured, sendNotetakerLink } from '@/lib/whatsapp';
import { logAutomation } from '@/lib/automation-log';
import { SITE_URL } from '@/lib/seo';

/**
 * POST /api/sermon-captures/[id]/notify-notetaker
 *
 * HOOK 1 of the Sunday automation. Called by the live-capture engine the moment
 * audio actually starts flowing (not when the job launches — a scheduled job that
 * finds no live stream must not spam the notulen).
 *
 * Mints a single-use token and WhatsApps https://www.gbibec.id/catatan/{token}
 * to every configured notulen. Submitting that form is what ends the capture.
 *
 * Idempotent: a capture that already has a live, unused link returns it rather
 * than minting a second one — so an engine retry never sends two links. Pass
 * `?force=1` (admin only) to deliberately issue a fresh link, e.g. after the
 * first one expired or went to the wrong person.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyInternalOrAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const force = request.nextUrl.searchParams.get('force') === '1';

  try {
    const db = getAdminFirestore();
    const ref = db.collection('sermon_captures').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cap = snap.data()!;

    const settings = await getNotetakerSettings(db);
    if (!settings.enabled) {
      return NextResponse.json({
        skipped: true,
        reason: 'Notifikasi notulen dimatikan di pengaturan.',
      });
    }
    if (settings.recipients.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: 'Belum ada nomor notulen yang terdaftar di pengaturan.',
      });
    }

    // Idempotency — reuse a still-valid link unless explicitly forced.
    if (!force && typeof cap.noteLinkToken === 'string') {
      const existing = await resolveNoteLink(db, cap.noteLinkToken);
      if (existing.status === 'ok') {
        return NextResponse.json({
          alreadySent: true,
          token: cap.noteLinkToken,
          url: `${SITE_URL}/catatan/${cap.noteLinkToken}`,
          sentAt: cap.noteLinkSentAt ?? null,
        });
      }
      if (existing.status === 'used') {
        return NextResponse.json({
          skipped: true,
          reason: 'Notulen sudah mengirim catatan untuk ibadah ini.',
        });
      }
      // expired / not-found → fall through and mint a new one
    }

    const label = serviceLabel(cap.serviceNumber ?? null, cap.sermonDate ?? null);
    const token = await createNoteLink(db, {
      captureId: id,
      ttlHours: settings.linkTtlHours,
      sentTo: settings.recipients,
      sermonDate: cap.sermonDate ?? null,
      serviceNumber: cap.serviceNumber ?? null,
      title: cap.title ?? null,
    });
    const url = `${SITE_URL}/catatan/${token}`;

    // Send to everyone. One bad number must not stop the others, so results are
    // collected rather than thrown.
    const results = await Promise.all(
      settings.recipients.map(async (r) => {
        const res = await sendNotetakerLink(r.phone, r.name, label, token);
        return {
          name: r.name,
          phone: r.phone,
          ok: res.ok,
          detail: res.ok ? res.messageId : ('reason' in res ? res.reason : res.error),
        };
      }),
    );

    const sentCount = results.filter((r) => r.ok).length;
    await ref.update({
      noteLinkToken: token,
      noteLinkSentAt: new Date().toISOString(),
      noteLinkResults: results,
    });

    if (sentCount === 0) {
      console.warn(`[notify-notetaker] ${id}: no message delivered`, results);
    }

    await logAutomation(db, {
      captureId: id,
      step: 'notify-notetaker',
      ok: sentCount > 0,
      detail: `terkirim ${sentCount}/${results.length}`,
      source: force ? 'manual-force' : 'engine-hook',
      data: { token, results },
    });

    return NextResponse.json({
      token,
      url,
      sentCount,
      total: results.length,
      results,
      // Lets the admin UI decide whether to surface the wa.me manual fallback.
      whatsappConfigured: isWhatsAppConfigured(),
    });
  } catch (err) {
    console.error('notify-notetaker error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
