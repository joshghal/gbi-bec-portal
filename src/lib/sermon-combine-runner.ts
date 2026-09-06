import type { Firestore } from 'firebase-admin/firestore';
import { combineSermonNotes } from '@/lib/ai/combine-sermon';
import { getStorageClient } from '@/lib/service-account';

/**
 * Load a capture, run the manual+AI combine, and persist the result.
 *
 * Shared by the interactive route (/api/sermon-captures/[id]/combine-summary) and
 * the unattended publish chain, so a Sunday auto-publish is byte-for-byte the same
 * operation as clicking the button.
 */

export type CombineRunResult =
  | {
      ok: true;
      summary: string;
      model: string;
      videoTitle: string;
      manualNotesLength: number;
      aiSummaryLength: number;
    }
  | { ok: false; error: string; status: number };

export async function runCombineForCapture(
  db: Firestore,
  captureId: string,
): Promise<CombineRunResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: 'GEMINI_API_KEY env var is not configured on the portal. Set it on Vercel.',
    };
  }

  const ref = db.collection('sermon_captures').doc(captureId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: 'Not found', status: 404 };
  const cap = snap.data()!;

  const manualNotes: string = (cap.manualNotes ?? '').trim();
  const aiSummary: string = (cap.finalSummary ?? cap.latestSummary ?? '').trim();

  if (!manualNotes) {
    return {
      ok: false,
      status: 400,
      error: 'Belum ada catatan manual. Tambahkan dulu lewat tombol Edit di section Catatan Manual.',
    };
  }
  if (!aiSummary) {
    return {
      ok: false,
      status: 400,
      error: 'Belum ada ringkasan AI. Klik "Generate Summary" dulu untuk membuat ringkasan dari transkrip.',
    };
  }

  const videoTitle: string = cap.title ?? '';
  const combined = await combineSermonNotes({ manualNotes, aiSummary, videoTitle, apiKey });
  if (!combined.ok) {
    return { ok: false, error: combined.error, status: 502 };
  }

  await ref.update({
    combinedSummary: combined.summary,
    combinedSummaryModel: combined.model,
    combinedAt: new Date().toISOString(),
    combinedStale: false,
  });

  // Best-effort: also write combined_summary.md alongside transcript in GCS
  try {
    const transcriptUri: string | undefined = cap.gcsPaths?.transcript;
    if (transcriptUri) {
      const match = transcriptUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
      if (match) {
        const [, bucket, path] = match;
        const combinedPath = path.replace(/transcript\.txt$/, 'combined_summary.md');
        await getStorageClient().bucket(bucket).file(combinedPath).save(combined.summary, {
          contentType: 'text/markdown; charset=utf-8',
        });
      }
    }
  } catch (e) {
    console.warn('GCS combined_summary.md write failed:', e);
  }

  return {
    ok: true,
    summary: combined.summary,
    model: combined.model,
    videoTitle,
    manualNotesLength: manualNotes.length,
    aiSummaryLength: aiSummary.length,
  };
}
