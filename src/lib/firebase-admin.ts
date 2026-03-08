import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // When using Firebase hosting with the same project,
  // GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CONFIG auto-inits.
  // For Vercel, we use the project ID to initialize with default credentials.
  return initializeApp({
    projectId: 'baranangsiang-evening-chur',
  });
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);

export async function verifyAuthToken(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    return null; // auth passed
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
