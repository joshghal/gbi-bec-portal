import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NextRequest, NextResponse } from 'next/server';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const fullPath = resolve(credPath);
    const serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'));
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback: Vercel / GCP hosted environments with default credentials
  return initializeApp({ projectId: 'baranangsiang-evening-chur' });
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);

export function getAdminFirestore() {
  return getFirestore(adminApp);
}

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
