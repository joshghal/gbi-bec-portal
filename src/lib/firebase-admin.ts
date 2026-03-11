import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccountCredentials } from './service-account';
import { hasPermission, DEFAULT_ROLES, type AdminUser, type Role } from './permissions';

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

// --- Roles cache (5 min TTL) ---
let _rolesCache: Record<string, Role> | null = null;
let _rolesCacheTime = 0;
const ROLES_CACHE_TTL = 5 * 60 * 1000;

export async function getRoles(): Promise<Record<string, Role>> {
  if (_rolesCache && Date.now() - _rolesCacheTime < ROLES_CACHE_TTL) {
    return _rolesCache;
  }
  const db = getFirestore(adminApp);
  const doc = await db.collection('admins').doc('roles').get();
  _rolesCache = (doc.exists ? doc.data()?.roles : {}) as Record<string, Role>;
  _rolesCacheTime = Date.now();
  return _rolesCache!;
}

export function invalidateRolesCache() {
  _rolesCache = null;
  _rolesCacheTime = 0;
}

/** Seed roles into Firestore if they don't exist yet. Called once during migration. */
async function ensureRolesSeeded(): Promise<void> {
  const db = getFirestore(adminApp);
  const doc = await db.collection('admins').doc('roles').get();
  if (!doc.exists) {
    await db.collection('admins').doc('roles').set({ roles: DEFAULT_ROLES });
    _rolesCache = DEFAULT_ROLES;
    _rolesCacheTime = Date.now();
    console.log('[firebase-admin] Seeded admins/roles during migration');
  }
}

// --- Admin user lookup (with legacy fallback + auto-migration) ---
export async function getAdminUser(email: string): Promise<(AdminUser & { permissions: string[] }) | null> {
  const db = getFirestore(adminApp);
  const usersDoc = await db.collection('admins').doc('users').get();
  const users = (usersDoc.exists ? usersDoc.data()?.users : null) as Record<string, AdminUser> | null;

  // Found in new system
  if (users?.[email]) {
    const roles = await getRoles();
    const role = roles[users[email].role];
    return { ...users[email], permissions: role?.permissions || [] };
  }

  // Fallback: check legacy admins/allowed and auto-migrate ALL emails at once
  const allowedDoc = await db.collection('admins').doc('allowed').get();
  if (!allowedDoc.exists) return null;
  const allowedEmails: string[] = allowedDoc.data()?.emails || [];
  if (!allowedEmails.includes(email)) return null;

  // Migrate all emails: the one logging in = super_admin, rest = form_manager
  const now = new Date().toISOString();
  const migrated: Record<string, AdminUser> = { ...(users || {}) };
  for (const addr of allowedEmails) {
    if (migrated[addr]) continue; // already migrated
    migrated[addr] = {
      role: addr === email ? 'super_admin' : 'form_manager',
      name: addr.split('@')[0],
      addedAt: now,
      addedBy: 'auto-migration',
    };
  }

  // Seed both users and roles together during migration
  await ensureRolesSeeded();
  const ref = db.collection('admins').doc('users');
  await ref.set({ users: migrated });
  console.log(`[firebase-admin] Auto-migrated ${allowedEmails.length} users from admins/allowed (${email} = super_admin)`);

  const roles = await getRoles();
  const role = roles[migrated[email].role];
  return { ...migrated[email], permissions: role?.permissions || [] };
}

async function isAdminEmail(email: string): Promise<boolean> {
  const user = await getAdminUser(email);
  return user !== null;
}

/** Extract the verified email from an Authorization header. Returns null on failure. */
export async function getVerifiedEmail(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    return decoded.email || null;
  } catch {
    return null;
  }
}

export async function verifyAuthToken(
  request: NextRequest,
  requiredPermission?: string,
): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    if (!decoded.email || !(await isAdminEmail(decoded.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If a specific permission is required, check it
    if (requiredPermission) {
      const adminUser = await getAdminUser(decoded.email);
      if (!adminUser || !hasPermission(adminUser.permissions, requiredPermission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return null; // auth passed
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
