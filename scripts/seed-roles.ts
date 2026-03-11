/**
 * Seed Firestore with admin roles and migrate existing admins.
 *
 * Usage: npx tsx scripts/seed-roles.ts [super-admin-email]
 *
 * - If admins/allowed exists, the first email becomes super_admin, rest become form_manager
 * - If no admins/allowed, pass an email arg: npx tsx scripts/seed-roles.ts user@example.com
 * - Requires GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_BASE64 env var.
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getServiceAccountCredentials } from '../src/lib/service-account';
import { DEFAULT_ROLES } from '../src/lib/permissions';

function init() {
  if (getApps().length > 0) return;
  const creds = getServiceAccountCredentials();
  if (creds) {
    initializeApp({ credential: cert(creds as ServiceAccount) });
  } else {
    initializeApp({ projectId: 'baranangsiang-evening-chur' });
  }
}

async function main() {
  init();
  const db = getFirestore();

  // 1. Seed roles
  console.log('Seeding admins/roles...');
  await db.collection('admins').doc('roles').set({ roles: DEFAULT_ROLES });
  console.log('  -> Created', Object.keys(DEFAULT_ROLES).length, 'roles');

  // 2. Read existing admins/allowed for migration
  const allowedDoc = await db.collection('admins').doc('allowed').get();
  const existingEmails: string[] = allowedDoc.exists ? (allowedDoc.data()?.emails || []) : [];
  console.log('  -> Found', existingEmails.length, 'existing emails in admins/allowed');

  // 3. Determine super admin: first existing email, or CLI arg
  const superAdminEmail = existingEmails[0] || process.argv[2];
  if (!superAdminEmail) {
    console.error('Error: No emails in admins/allowed and no email argument provided.');
    console.error('Usage: npx tsx scripts/seed-roles.ts your-email@gmail.com');
    process.exit(1);
  }

  // 4. Build users map
  const users: Record<string, {
    role: string;
    name: string;
    addedAt: string;
    addedBy: string;
  }> = {};

  // First email = super admin
  users[superAdminEmail] = {
    role: 'super_admin',
    name: superAdminEmail.split('@')[0],
    addedAt: new Date().toISOString(),
    addedBy: 'system',
  };

  // Remaining existing emails = form_manager
  for (const email of existingEmails) {
    if (email === superAdminEmail) continue;
    users[email] = {
      role: 'form_manager',
      name: email.split('@')[0],
      addedAt: new Date().toISOString(),
      addedBy: 'migration',
    };
  }

  // 5. Seed users
  console.log('Seeding admins/users...');
  await db.collection('admins').doc('users').set({ users });
  console.log('  -> Super admin:', superAdminEmail);
  console.log('  -> Created', Object.keys(users).length, 'admin users');

  console.log('\nDone! admins/allowed preserved for rollback.');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
