/**
 * Backfill slugs for existing updates that don't have one.
 *
 * Usage: npx tsx scripts/backfill-slugs.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_BASE64 env var.
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getServiceAccountCredentials } from '../src/lib/service-account';

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'dan')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `post-${Date.now()}`;
}

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

  const snapshot = await db.collection('updates').get();
  const usedSlugs = new Set<string>();

  // Collect existing slugs
  for (const doc of snapshot.docs) {
    const slug = doc.data().slug;
    if (slug) usedSlugs.add(slug);
  }

  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.slug) continue;

    let slug = generateSlug(data.title || 'untitled');
    let counter = 1;
    const baseSlug = slug;
    while (usedSlugs.has(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    usedSlugs.add(slug);
    await doc.ref.update({ slug });
    console.log(`  ${doc.id}: "${data.title}" → /kabar/${slug}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} of ${snapshot.size} documents.`);
}

main().catch(console.error);
