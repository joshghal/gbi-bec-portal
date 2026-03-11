import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccountCredentials } from './service-account';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const creds = getServiceAccountCredentials();
  if (creds) {
    console.log('[firebase-admin] Initializing with service account, project:', creds.project_id);
    return initializeApp({ credential: cert(creds as ServiceAccount) });
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
