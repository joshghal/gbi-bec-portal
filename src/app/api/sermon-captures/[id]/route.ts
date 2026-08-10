import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { getAutomationLog } from '@/lib/automation-log';

// GET /api/sermon-captures/[id] — full doc + transcript fetched from GCS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('sermon_captures').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const data = doc.data()!;

    // Lazy-load full transcript from GCS if URL was requested
    const wantTranscript = request.nextUrl.searchParams.get('includeTranscript') === '1';
    let transcript: string | null = null;
    if (wantTranscript && data.gcsPaths?.transcript) {
      try {
        const { Storage } = await import('@google-cloud/storage');
        const storage = new Storage();
        const gcsUri: string = data.gcsPaths.transcript;
        const match = gcsUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
        if (match) {
          const [, bucket, path] = match;
          const [buf] = await storage.bucket(bucket).file(path).download();
          transcript = buf.toString('utf-8');
        }
      } catch (err) {
        console.warn('GCS transcript fetch failed:', err);
      }
    }

    // Durable audit trail — what the automation did, so a failed Sunday can be
    // reconstructed later without digging through expired platform logs.
    const automationLog = await getAutomationLog(db, id).catch(() => []);

    return NextResponse.json({ id: doc.id, ...data, transcript, automationLog });
  } catch (err) {
    console.error('Get sermon_capture error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/sermon-captures/[id] — remove the capture entry (does NOT touch the linked kabar draft)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    await db.collection('sermon_captures').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete sermon_capture error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
