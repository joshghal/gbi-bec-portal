import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { verifyInternalOrAdmin } from '@/lib/internal-auth';
import { runPublishChain } from '@/lib/sermon-publish-chain';

// The combine can take a while on a 90-minute transcript.
export const maxDuration = 300;

/**
 * POST /api/sermon-captures/[id]/publish-chain
 *
 * HOOK 2 of the Sunday automation: combine → kabar → publish, unattended.
 * Called by the live-capture engine right after it flips the capture to
 * 'captured'. The engine AWAITS this, so the response must not return before the
 * work is done.
 *
 * Also callable by a signed-in admin to re-run the chain by hand — it is
 * idempotent, so a retry after a transient Gemini failure is safe.
 *
 * All logic lives in @/lib/sermon-publish-chain because the notes-submit handler
 * needs the same routine via `after()`.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyInternalOrAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const result = await runPublishChain(getAdminFirestore(), id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('publish-chain error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
