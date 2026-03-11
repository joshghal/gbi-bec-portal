/**
 * One-time setup: registers manually-created Google Sheets in Firestore.
 *
 * Step 1: Go to https://script.google.com and create a new project
 * Step 2: Paste the Apps Script code printed below, run it
 * Step 3: Copy the output JSON and paste it when prompted
 *
 * Usage: npx tsx scripts/setup-sheets.ts
 */

import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';

// --- Firebase Admin ---

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS not set');
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(resolve(credPath), 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// --- Config ---

const FORM_TYPES = ['kom', 'baptism', 'child-dedication', 'prayer'] as const;

// --- Main ---

async function main() {
  // Check which ones are already registered
  const missing: string[] = [];
  for (const formType of FORM_TYPES) {
    const doc = await db.collection('sheet_registry').doc(formType).get();
    if (doc.exists) {
      console.log(`[${formType}] Already registered: ${doc.data()?.spreadsheetUrl}`);
    } else {
      missing.push(formType);
    }
  }

  if (missing.length === 0) {
    console.log('\nAll form types already have spreadsheets registered!');
    process.exit(0);
  }

  console.log(`\nNeed to create spreadsheets for: ${missing.join(', ')}`);
  console.log(`\n${'='.repeat(60)}`);
  console.log('Go to https://script.google.com → New Project');
  console.log('Paste this code and click Run:');
  console.log('='.repeat(60));
  console.log(`
function createFormSheets() {
  var SA_EMAIL = "${serviceAccount.client_email}";
  var sheets = {
${missing.map(t => `    "${t}": "${t === 'kom' ? 'Formulir KOM' : t === 'baptism' ? 'Formulir Baptisan' : t === 'child-dedication' ? 'Formulir Penyerahan Anak' : 'Formulir Pokok Doa'}"`).join(',\n')}
  };
  var result = {};
  for (var key in sheets) {
    var ss = SpreadsheetApp.create(sheets[key]);
    ss.getSheets()[0].setName("Setup");
    // Share with service account as editor
    DriveApp.getFileById(ss.getId()).addEditor(SA_EMAIL);
    // Make viewable by anyone with link
    DriveApp.getFileById(ss.getId()).setSharing(
      DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW
    );
    result[key] = { id: ss.getId(), url: ss.getUrl() };
  }
  Logger.log(JSON.stringify(result));
}
`);
  console.log('='.repeat(60));
  console.log('\nAfter running, go to View → Logs, copy the JSON output.');
  console.log('Paste it below:\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const input = await new Promise<string>(resolve => rl.question('Paste JSON: ', resolve));
  rl.close();

  let data: Record<string, { id: string; url: string }>;
  try {
    data = JSON.parse(input.trim());
  } catch {
    console.error('Invalid JSON. Please try again.');
    process.exit(1);
  }

  for (const formType of missing) {
    if (!data[formType]) {
      console.error(`Missing data for ${formType}`);
      continue;
    }

    await db.collection('sheet_registry').doc(formType).set({
      spreadsheetId: data[formType].id,
      spreadsheetUrl: data[formType].url,
      createdAt: new Date().toISOString(),
    });

    console.log(`[${formType}] Registered: ${data[formType].url}`);
  }

  console.log('\nDone! Restart your dev server to see the Sheets buttons.');
  process.exit(0);
}

main().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
