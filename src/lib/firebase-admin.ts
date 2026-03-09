import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NextRequest, NextResponse } from 'next/server';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Vercel: base64-encoded service account
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString());
      console.log('[firebase-admin] Initializing with base64 credentials, project:', serviceAccount.project_id);
      return initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      console.error('[firebase-admin] Failed to parse GOOGLE_SERVICE_ACCOUNT_BASE64:', e);
    }
  } else {
    console.log('[firebase-admin] GOOGLE_SERVICE_ACCOUNT_BASE64 not found');
  }

  // Local: file-based service account
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const fullPath = resolve(credPath);
    const serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'));
    console.log('[firebase-admin] Initializing with file credentials');
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback: GCP hosted environments with default credentials
  console.log('[firebase-admin] Falling back to default credentials');
  return initializeApp({ projectId: 'baranangsiang-evening-chur' });
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);

export function getAdminFirestore() {
  return getFirestore(adminApp);
}

async function isAdminEmail(email: string): Promise<boolean> {
  const db = getFirestore(adminApp);
  const doc = await db.collection('admins').doc('allowed').get();
  if (!doc.exists) return false;
  const emails: string[] = doc.data()?.emails || [];
  return emails.includes(email);
}

export async function verifyAuthToken(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (!decoded.email || !(await isAdminEmail(decoded.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null; // auth passed
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
