import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { syncAllSchedulesToKB } from '@/lib/kb-sync';

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const synced = await syncAllSchedulesToKB();
    return NextResponse.json({ success: true, synced });
  } catch (error) {
    console.error('Sync dates to KB error:', error);
    return NextResponse.json({ error: 'Failed to sync dates' }, { status: 500 });
  }
}
