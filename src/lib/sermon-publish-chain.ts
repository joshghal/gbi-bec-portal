import { revalidatePath } from 'next/cache';
import type { DocumentReference, Firestore } from 'firebase-admin/firestore';
import { runCombineForCapture } from '@/lib/sermon-combine-runner';
import { createKabarFromCapture } from '@/lib/sermon-kabar';
import { getNotetakerSettings, serviceLabel } from '@/lib/notetaker';
import { sendKhotbahStatus } from '@/lib/whatsapp';

/**
 * The unattended tail of the Sunday pipeline: combine → kabar → publish.
 *
 * Lives in a lib rather than the route handler because two callers need it:
 *   • POST /api/sermon-captures/[id]/publish-chain — the engine's HOOK 2
 *   • POST /api/notetaker/[token] — via `after()`, for the case where the stream
 *     had already ended before the notulen submitted, so no engine is alive to
 *     call back
 *
 * PUBLISHING POLICY — deliberate, and the one place a human is traded away:
 *   • notulen notes present → combine, publish LIVE. A human who was in the room
 *     has cross-checked the speaker's name and the Bible references, which is
 *     exactly what transcript ASR gets wrong.
 *   • no notulen notes → create the kabar as an UNPUBLISHED DRAFT and alert the
 *     admin. Unreviewed AI-only output does not go on the public site.
 *
 * Idempotent and safe to retry: re-running after a successful publish returns the
 * existing post untouched.
 */

export type ChainOutcome =
  | 'published'
  | 'draft-no-notes'
  | 'draft-no-summary'
  | 'already-published';

export type ChainResult =
  | {
      ok: true;
      outcome: ChainOutcome;
      published: boolean;
      kabarId?: string;
      slug?: string;
      title?: string;
      combineError?: string | null;
    }
  | { ok: false; error: string; status: number };

export async function runPublishChain(db: Firestore, captureId: string): Promise<ChainResult> {
  const ref = db.collection('sermon_captures').doc(captureId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: 'Not found', status: 404 };
  const cap = snap.data()!;

  // The chain needs the engine's final Gemini summary, which only exists once the
  // capture has finalized. Calling early is a caller bug, not a failure.
  if (cap.status !== 'captured') {
    return {
      ok: false,
      status: 409,
      error: `Capture belum selesai (status: ${cap.status}). Chain hanya jalan setelah status 'captured'.`,
    };
  }

  const label = serviceLabel(cap.serviceNumber ?? null, cap.sermonDate ?? null);
  const manualNotes: string = (cap.manualNotes ?? '').trim();
  const aiSummary: string = (cap.finalSummary ?? cap.latestSummary ?? '').trim();

  // ── Case 1: nothing to publish at all ──────────────────────────────
  if (!manualNotes && !aiSummary) {
    await recordOutcome(ref, 'draft-no-summary', null);
    await alertAdmin(db, label, 'Transkrip kosong — tidak ada catatan yang bisa dibuat. Cek engine log.', 'admin/khotbah');
    return { ok: true, outcome: 'draft-no-summary', published: false };
  }

  // ── Combine, when there are notes to combine with ──────────────────
  let combineError: string | null = null;
  if (manualNotes && aiSummary && (!cap.combinedSummary || cap.combinedStale === true)) {
    const combined = await runCombineForCapture(db, captureId);
    if (!combined.ok) {
      combineError = combined.error;
      console.error(`[publish-chain] ${captureId}: combine failed —`, combined.error);
    }
  }

  // Re-read: runCombineForCapture wrote the combinedSummary we now branch on.
  const fresh = (await ref.get()).data()!;
  const hasCombined = Boolean((fresh.combinedSummary ?? '').trim());

  // ── Case 2: combined note exists → publish live ────────────────────
  if (hasCombined) {
    const wasPublished = await isAlreadyPublished(db, fresh.kabarId);
    const result = await createKabarFromCapture(db, captureId, { publish: true });
    if ('error' in result) return { ok: false, error: result.error, status: 500 };

    revalidatePath('/kabar');
    revalidatePath(`/kabar/${result.slug}`);
    revalidatePath('/sitemap.xml');

    const outcome: ChainOutcome = wasPublished ? 'already-published' : 'published';
    await recordOutcome(ref, outcome, result.slug);

    if (!wasPublished) {
      await alertAdmin(db, label, 'Catatan khotbah sudah TERBIT otomatis.', `kabar/${result.slug}`);
    }
    return {
      ok: true,
      outcome,
      published: true,
      kabarId: result.id,
      slug: result.slug,
      title: result.title,
    };
  }

  // ── Case 3: AI-only (notes never arrived, or combine failed) → draft ──
  const result = await createKabarFromCapture(db, captureId, { publish: false });
  if ('error' in result) return { ok: false, error: result.error, status: 500 };

  revalidatePath('/kabar');
  revalidatePath('/sitemap.xml');

  await recordOutcome(ref, 'draft-no-notes', result.slug);
  await alertAdmin(
    db,
    label,
    combineError
      ? 'Gabung catatan GAGAL — draft dibuat tapi belum terbit. Perlu ditinjau.'
      : 'Catatan notulen tidak masuk — draft AI dibuat tapi belum terbit. Perlu ditinjau.',
    'admin/khotbah',
  );

  return {
    ok: true,
    outcome: 'draft-no-notes',
    published: false,
    kabarId: result.id,
    slug: result.slug,
    title: result.title,
    combineError,
  };
}

// ─── helpers ────────────────────────────────────────────────────────

async function isAlreadyPublished(db: Firestore, kabarId: string | null | undefined): Promise<boolean> {
  if (!kabarId) return false;
  const doc = await db.collection('updates').doc(kabarId).get();
  return doc.exists && doc.data()?.published === true;
}

async function recordOutcome(
  ref: DocumentReference,
  outcome: ChainOutcome,
  slug: string | null,
): Promise<void> {
  await ref.update({
    publishChainOutcome: outcome,
    publishChainAt: new Date().toISOString(),
    ...(slug ? { kabarSlug: slug } : {}),
  });
}

/** Best-effort admin notification — never blocks or fails the chain. */
async function alertAdmin(
  db: Firestore,
  label: string,
  statusText: string,
  urlSuffix: string,
): Promise<void> {
  try {
    const settings = await getNotetakerSettings(db);
    const targets = settings.adminRecipients.length > 0 ? settings.adminRecipients : settings.recipients;
    await Promise.all(targets.map((r) => sendKhotbahStatus(r.phone, label, statusText, urlSuffix)));
  } catch (e) {
    console.warn('[publish-chain] admin alert failed:', e);
  }
}
