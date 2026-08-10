import type { Firestore } from 'firebase-admin/firestore';
import { logAutomation } from '@/lib/automation-log';

/**
 * Saving a notulen's notes onto a capture.
 *
 * Shared by the two delivery paths so they behave identically:
 *   • /api/notetaker/[token] — one-time link pushed over WhatsApp
 *   • /api/notulen/[slug]    — permanent bookmark, no WhatsApp needed
 *
 * Submitting is the "khotbah selesai" signal: it writes manualNotes and trips
 * stopRequested, which the live engine polls every 15s before finalizing.
 */

export const MAX_NOTES_LENGTH = 20000;

export type SubmitResult =
  | {
      ok: true;
      notesLength: number;
      /** The engine was still running, so the capture is now stopping. */
      captureStopping: boolean;
      /** No engine was alive — the caller should run the publish chain itself. */
      needsChain: boolean;
    }
  | { ok: false; error: string; status: number };

export function validateNotes(raw: unknown): { ok: true; notes: string } | { ok: false; error: string } {
  const notes = typeof raw === 'string' ? raw.trim() : '';
  if (!notes) return { ok: false, error: 'Catatan masih kosong.' };
  if (notes.length > MAX_NOTES_LENGTH) {
    return {
      ok: false,
      error: `Catatan terlalu panjang (maks ${MAX_NOTES_LENGTH.toLocaleString('id-ID')} karakter).`,
    };
  }
  return { ok: true, notes };
}

/**
 * Write the notes and trip the stop signal.
 *
 * `source` records which delivery path was used, purely for the admin UI.
 * Refuses to overwrite notes already submitted for the same capture — with a
 * permanent link there is no single-use token to burn, so this check is the
 * thing preventing a second person clobbering the first one's work.
 */
export async function saveNotesToCapture(
  db: Firestore,
  captureId: string,
  notes: string,
  source: 'notetaker-link' | 'notulen-slug',
): Promise<SubmitResult> {
  const captureRef = db.collection('sermon_captures').doc(captureId);
  const snap = await captureRef.get();
  if (!snap.exists) return { ok: false, error: 'Data ibadah tidak ditemukan.', status: 404 };

  const cap = snap.data()!;
  if ((cap.manualNotes ?? '').trim()) {
    return {
      ok: false,
      error: 'Catatan untuk ibadah ini sudah dikirim. Hubungi admin kalau perlu diperbaiki.',
      status: 409,
    };
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    manualNotes: notes,
    manualNotesUpdatedAt: now,
    manualNotesSource: source,
  };
  if (cap.combinedSummary) updates.combinedStale = true;

  // The stop signal — only meaningful while the engine is still running.
  const stillCapturing = cap.status === 'capturing';
  if (stillCapturing && cap.stopRequested !== true) {
    updates.stopRequested = true;
    updates.stopRequestedAt = now;
  }

  await captureRef.update(updates);

  await logAutomation(db, {
    captureId,
    step: 'notes-submitted',
    ok: true,
    detail: `${notes.length} chars${stillCapturing ? ' — stopRequested dikirim' : ' — capture sudah selesai'}`,
    source,
  });

  return {
    ok: true,
    notesLength: notes.length,
    captureStopping: stillCapturing,
    // If the stream already ended, no engine is alive to call the publish chain.
    needsChain: !stillCapturing && cap.status === 'captured',
  };
}
