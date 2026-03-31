/**
 * Backfill existing child-dedication submissions to Google Sheets.
 * Run: npx tsx scripts/backfill-sheet-child-dedication.ts
 */

import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import sa from '../service-account.json';
import { syncToSheets } from '../src/lib/google-sheets';

if (!admin.apps.length) {
  admin.initializeApp({ credential: cert(sa as admin.ServiceAccount) });
}

async function main() {
  const db = admin.firestore();
  const snap = await db
    .collection('form_submissions')
    .where('type', '==', 'child-dedication')
    .get();

  console.log(`Found ${snap.size} child-dedication submissions`);

  let synced = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    try {
      await syncToSheets('create', 'child-dedication', doc.id, {
        data: d.data,
        status: d.status,
        createdAt: d.createdAt,
      });
      synced++;
      console.log(`  [${synced}/${snap.size}] Synced: ${d.data?.namaAnak || doc.id}`);
    } catch (err) {
      console.error(`  Failed: ${doc.id}`, err);
    }
  }

  console.log(`\nDone. ${synced}/${snap.size} synced to Google Sheets.`);
  process.exit(0);
}

main();
