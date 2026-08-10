import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { createKabarFromCapture } from '@/lib/sermon-kabar';
import { logAdminAction } from '@/lib/admin-logger';

// POST /api/sermon-captures/[id]/to-kabar
// Convert a sermon capture into a kabar draft (unpublished). Idempotent: if a draft
// was already created for this capture, returns it instead of creating a duplicate.
//
// Document construction lives in @/lib/sermon-kabar so the automated publish chain
// (POST .../publish-chain) produces an identical post.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const result = await createKabarFromCapture(db, id, { publish: false });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    if (!result.alreadyExisted) {
      logAdminAction(request, 'create', 'kabar', { resourceId: result.id, resourceTitle: result.title });
      revalidatePath('/kabar');
      revalidatePath('/sitemap.xml');
    }

    return NextResponse.json(result, { status: result.alreadyExisted ? 200 : 201 });
  } catch (err) {
    console.error('to-kabar error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
