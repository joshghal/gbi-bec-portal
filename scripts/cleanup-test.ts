import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';

const TEST_ID = 'a98EWMGsTK51DAevlXsL';

async function main() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  const sa = JSON.parse(readFileSync(resolve(credPath), 'utf8'));
  if (!getApps().length) initializeApp({ credential: cert(sa) });
  const db = getFirestore();

  await db.collection('form_submissions').doc(TEST_ID).delete();
  console.log('Deleted from Firestore');

  const registry = await db.collection('sheet_registry').doc('baptism').get();
  const spreadsheetId = registry.data()?.spreadsheetId;
  if (!spreadsheetId) { console.log('No spreadsheet registered'); return; }

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const ss = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = ss.data.sheets || [];

  for (const sheet of sheetList) {
    const tab = sheet.properties?.title;
    if (!tab) continue;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${tab}'!A:A` });
    const rows = res.data.values || [];
    const idx = rows.findIndex(r => r[0] === TEST_ID);
    if (idx >= 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheet.properties?.sheetId,
                dimension: 'ROWS',
                startIndex: idx,
                endIndex: idx + 1,
              },
            },
          }],
        },
      });
      console.log(`Deleted row from Sheets tab: "${tab}"`);
    }
  }
  console.log('Cleanup done.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
