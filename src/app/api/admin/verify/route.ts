import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;
  return NextResponse.json({ admin: true });
}
