import { randomBytes } from 'crypto';
import type { Firestore } from 'firebase-admin/firestore';

/**
 * Notetaker (notulen) one-time link plumbing.
 *
 * Flow: the live-capture engine reports "audio is flowing" → the portal mints a
 * single-use token, stores it in `note_links/{token}`, and WhatsApps
 * https://www.gbibec.id/catatan/{token} to the configured notulen. When they
 * submit, the notes land on the capture doc AND `stopRequested` is tripped, which
 * the engine polls every 15s (see gbi-bec-youtube-live-sync/src/live-summary.ts).
 *
 * Submitting the form IS the "sermon has ended" signal — there is no separate
 * stop button for the notulen.
 */

export const NOTE_LINKS_COLLECTION = 'note_links';
export const NOTETAKER_SETTINGS_DOC = 'notetakers';

/** How long a link stays valid. Covers the evening service plus a wide margin. */
export const DEFAULT_LINK_TTL_HOURS = 12;

export interface NotetakerRecipient {
  name: string;
  /**
   * Raw as entered (08xx / 62xx / +62xx) — normalized at send time.
   * OPTIONAL: only needed for the WhatsApp push. A notulen who uses their
   * permanent link doesn't need a number on file at all.
   */
  phone?: string;
  /**
   * Permanent private path for this person, e.g. `budi-a3f9c2e14b7d9051`.
   * They bookmark `/notulen/<slug>` once; it always resolves to whichever
   * service is live. Generated on save, never regenerated (that would break
   * their bookmark).
   */
  slug?: string;
}

export interface NotetakerSettings {
  /** Master switch. When false, no links are minted and nothing is sent. */
  enabled: boolean;
  recipients: NotetakerRecipient[];
  linkTtlHours: number;
  /**
   * Numbers that get the "chain finished / needs attention" alerts. Usually just
   * the admin. Falls back to `recipients` when empty.
   */
  adminRecipients: NotetakerRecipient[];
}

export interface NoteLink {
  token: string;
  captureId: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  submittedNotes: string | null;
  sentTo: NotetakerRecipient[];
  /** Denormalized so the public page renders without touching the capture doc. */
  sermonDate: string | null;
  serviceNumber: number | null;
  title: string | null;
}

const DEFAULT_SETTINGS: NotetakerSettings = {
  enabled: false,
  recipients: [],
  linkTtlHours: DEFAULT_LINK_TTL_HOURS,
  adminRecipients: [],
};

/** Read `settings/notetakers`, filling in defaults for anything unset. */
export async function getNotetakerSettings(db: Firestore): Promise<NotetakerSettings> {
  const snap = await db.collection('settings').doc(NOTETAKER_SETTINGS_DOC).get();
  if (!snap.exists) return { ...DEFAULT_SETTINGS };
  const data = snap.data() ?? {};
  return {
    enabled: data.enabled === true,
    recipients: sanitizeRecipients(data.recipients),
    linkTtlHours: typeof data.linkTtlHours === 'number' && data.linkTtlHours > 0
      ? data.linkTtlHours
      : DEFAULT_LINK_TTL_HOURS,
    adminRecipients: sanitizeRecipients(data.adminRecipients),
  };
}

/**
 * Drop anything malformed rather than letting a bad settings write break the
 * Sunday send.
 *
 * Only the NAME is required. The phone is optional because the permanent-link
 * delivery path needs no number — WhatsApp is an optional layer on top. A phone
 * that IS supplied must look like a real number, or it is dropped (silently
 * keeping a typo'd number would fail every Sunday).
 *
 * Slugs are preserved when already present and minted when not, so saving the
 * settings page never invalidates a notulen's existing bookmark.
 */
export function sanitizeRecipients(input: unknown): NotetakerRecipient[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((r) => {
      const name = typeof r?.name === 'string' ? r.name.trim() : '';
      const rawPhone = typeof r?.phone === 'string' ? r.phone.trim() : '';
      const phone = /\d{8,}/.test(rawPhone.replace(/\D/g, '')) ? rawPhone : '';
      const existingSlug = typeof r?.slug === 'string' && isValidSlug(r.slug) ? r.slug : '';
      return {
        name,
        phone,
        slug: existingSlug || (name ? generateNotetakerSlug(name) : ''),
      };
    })
    .filter((r) => r.name.length > 0);
}

/**
 * `<name>-<16 hex>` — readable enough to tell two links apart at a glance, with
 * 64 bits of secret doing the actual gatekeeping.
 */
export function generateNotetakerSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20) || 'notulen';
  return `${base}-${randomBytes(8).toString('hex')}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,21}-[a-f0-9]{16}$/.test(slug);
}

/** Constant-ish lookup of a recipient by their permanent slug. */
export async function findRecipientBySlug(
  db: Firestore,
  slug: string,
): Promise<NotetakerRecipient | null> {
  if (!isValidSlug(slug)) return null;
  const settings = await getNotetakerSettings(db);
  const all = [...settings.recipients, ...settings.adminRecipients];
  return all.find((r) => r.slug === slug) ?? null;
}

/** 32 hex chars = 128 bits. Hex (not base64url) so the token is safe as a
 *  WhatsApp template URL-button suffix without any escaping questions. */
export function generateNoteToken(): string {
  return randomBytes(16).toString('hex');
}

export interface CreateNoteLinkInput {
  captureId: string;
  ttlHours: number;
  sentTo: NotetakerRecipient[];
  sermonDate?: string | null;
  serviceNumber?: number | null;
  title?: string | null;
}

/** Mint and persist a fresh single-use link. Returns the token. */
export async function createNoteLink(db: Firestore, input: CreateNoteLinkInput): Promise<string> {
  const token = generateNoteToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.ttlHours * 60 * 60 * 1000);

  const doc: Omit<NoteLink, 'token'> = {
    captureId: input.captureId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    usedAt: null,
    submittedNotes: null,
    sentTo: input.sentTo,
    sermonDate: input.sermonDate ?? null,
    serviceNumber: input.serviceNumber ?? null,
    title: input.title ?? null,
  };

  await db.collection(NOTE_LINKS_COLLECTION).doc(token).set(doc);
  return token;
}

export type NoteLinkState =
  | { status: 'ok'; link: NoteLink }
  | { status: 'not-found' }
  | { status: 'expired'; link: NoteLink }
  | { status: 'used'; link: NoteLink };

/**
 * Look up a token by document ID (O(1), no index needed) and classify it.
 * `used` and `expired` still carry the link so the page can show a useful state
 * instead of a bare error.
 */
export async function resolveNoteLink(db: Firestore, token: string): Promise<NoteLinkState> {
  if (!/^[a-f0-9]{32}$/.test(token)) return { status: 'not-found' };

  const snap = await db.collection(NOTE_LINKS_COLLECTION).doc(token).get();
  if (!snap.exists) return { status: 'not-found' };

  const link = { token, ...(snap.data() as Omit<NoteLink, 'token'>) };
  if (link.usedAt) return { status: 'used', link };
  if (new Date(link.expiresAt).getTime() < Date.now()) return { status: 'expired', link };
  return { status: 'ok', link };
}

/**
 * How far back a finished capture still accepts notes. Covers the notulen who
 * only sits down to write them up after getting home.
 */
export const NOTES_GRACE_HOURS = 18;

export interface ActiveCapture {
  id: string;
  status: string;
  sermonDate: string | null;
  serviceNumber: number | null;
  title: string | null;
  /** True while the engine is still transcribing — submitting will stop it. */
  live: boolean;
}

/**
 * Resolve "the service a notulen would be writing notes for right now".
 *
 * This is what makes a permanent bookmark work: the link carries no capture ID,
 * so the server decides which service it points at each time it is opened.
 *
 * Preference order:
 *   1. a capture still capturing (the common case — they submit as the sermon ends)
 *   2. the most recent finished capture within NOTES_GRACE_HOURS that has no notes yet
 *
 * Captures that already have notes are skipped, so a link never lets someone
 * overwrite a submission.
 *
 * Reads the newest 10 and filters in memory rather than composing a where+orderBy
 * query, which would need a new composite index for a collection this small.
 */
export async function findActiveCaptureForNotes(db: Firestore): Promise<ActiveCapture | null> {
  const snap = await db
    .collection('sermon_captures')
    .orderBy('capturedAt', 'desc')
    .limit(10)
    .get();

  const rows = snap.docs.map((d) => ({ id: d.id, data: d.data() }));

  const live = rows.find((r) => r.data.status === 'capturing');
  if (live) return toActiveCapture(live.id, live.data, true);

  const cutoff = Date.now() - NOTES_GRACE_HOURS * 60 * 60 * 1000;
  const recent = rows.find((r) => {
    if (r.data.status !== 'captured') return false;
    if ((r.data.manualNotes ?? '').trim()) return false;
    const at = Date.parse(r.data.finalizedAt ?? r.data.capturedAt ?? '');
    return Number.isFinite(at) && at >= cutoff;
  });
  return recent ? toActiveCapture(recent.id, recent.data, false) : null;
}

function toActiveCapture(
  id: string,
  data: FirebaseFirestore.DocumentData,
  live: boolean,
): ActiveCapture {
  return {
    id,
    status: data.status,
    sermonDate: data.sermonDate ?? null,
    serviceNumber: data.serviceNumber ?? null,
    title: data.title ?? null,
    live,
  };
}

/** Human label for a service, e.g. "Ibadah Raya 5 · 10 Agustus 2026". */
const INDO_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function formatIndoDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const monthIndex = parseInt(m, 10) - 1;
  if (!y || Number.isNaN(monthIndex) || !INDO_MONTHS[monthIndex]) return iso;
  return `${parseInt(d, 10)} ${INDO_MONTHS[monthIndex]} ${y}`;
}

export function serviceLabel(serviceNumber: number | null, sermonDate: string | null): string {
  const service = serviceNumber ? `Ibadah Raya ${serviceNumber}` : 'Ibadah Raya';
  return sermonDate ? `${service} · ${formatIndoDate(sermonDate)}` : service;
}
