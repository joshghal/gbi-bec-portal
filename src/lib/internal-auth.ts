import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';

/**
 * Shared-secret auth for machine callers.
 *
 * The live-capture engine runs as a Cloud Run Job with no Firebase user, so it
 * can't present an admin ID token. It authenticates to the portal with a static
 * secret in `x-internal-secret`, matched against INTERNAL_WEBHOOK_SECRET.
 *
 * Both sides read the secret from the same GCP Secret Manager entry — see
 * docs/khotbah-automation.md.
 */

const HEADER = 'x-internal-secret';

/** Length-safe, constant-time compare. Returns false when unset or mismatched. */
function secretMatches(provided: string | null): boolean {
  const expected = process.env.INTERNAL_WEBHOOK_SECRET;
  // An unset secret must never authenticate anyone — otherwise a missing env var
  // silently turns these endpoints public.
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hasInternalSecret(request: NextRequest): boolean {
  return secretMatches(request.headers.get(HEADER));
}

/**
 * Accept EITHER a valid internal secret (engine) OR a signed-in admin (portal UI).
 * Returns a NextResponse to short-circuit on failure, or null when authorized.
 */
export async function verifyInternalOrAdmin(request: NextRequest): Promise<NextResponse | null> {
  if (hasInternalSecret(request)) return null;
  return verifyAuthToken(request);
}

/** Strict: internal callers only. */
export function verifyInternalOnly(request: NextRequest): NextResponse | null {
  if (hasInternalSecret(request)) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
