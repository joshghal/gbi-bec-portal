import type { Firestore } from 'firebase-admin/firestore';

/**
 * Durable audit trail for the Sunday automation.
 *
 * Console logs live in Vercel and Cloud Run, expire, and are split across two
 * platforms — useless for answering "why did last Sunday fail?" a week later.
 * This writes every step to Firestore instead, so the whole run can be replayed
 * from one place.
 *
 * Append-only. Never throws: logging must never be the reason a Sunday breaks.
 */

export const AUTOMATION_LOG_COLLECTION = 'sermon_automation_log';

export type LogStep =
  | 'notify-notetaker'
  | 'notes-submitted'
  | 'publish-chain'
  | 'combine'
  | 'kabar-published'
  | 'error';

export interface LogEntry {
  captureId: string;
  step: LogStep;
  ok: boolean;
  /** Short human-readable outcome, e.g. "sent 1/3" or Meta's error text. */
  detail: string;
  at: string;
  /** Which delivery path or caller produced this, when relevant. */
  source?: string;
  /** Anything structured worth keeping — per-recipient results, model used, etc. */
  data?: Record<string, unknown>;
}

/**
 * Record one step. Fire-and-forget by design: callers should NOT await this in a
 * path where latency matters, and must never let it fail their own work.
 */
export async function logAutomation(
  db: Firestore,
  entry: Omit<LogEntry, 'at'>,
): Promise<void> {
  try {
    await db.collection(AUTOMATION_LOG_COLLECTION).add({
      ...entry,
      // Strip undefined — Firestore rejects it.
      data: entry.data ? JSON.parse(JSON.stringify(entry.data)) : null,
      source: entry.source ?? null,
      at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[automation-log] write failed:', e instanceof Error ? e.message : e);
  }
}

/**
 * Read the trail for one capture, oldest first — the order you want when
 * reconstructing what happened.
 *
 * Ordered in memory rather than with orderBy so no composite index is needed for
 * a collection this small.
 */
export async function getAutomationLog(db: Firestore, captureId: string): Promise<LogEntry[]> {
  const snap = await db
    .collection(AUTOMATION_LOG_COLLECTION)
    .where('captureId', '==', captureId)
    .limit(200)
    .get();

  return snap.docs
    .map((d) => d.data() as LogEntry)
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
}
