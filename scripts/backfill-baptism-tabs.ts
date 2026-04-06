/**
 * Backfill: move baptism Google Sheets rows to the correct tab
 * based on each row's tanggalBaptis column value.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-baptism-tabs.ts
 */
import 'dotenv/config';
import { google, sheets_v4 } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  const sa = JSON.parse(readFileSync(resolve(credPath), 'utf8'));
  if (!getApps().length) initializeApp({ credential: cert(sa) });
  const db = getFirestore();

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Get spreadsheet ID
  const registry = await db.collection('sheet_registry').doc('baptism').get();
  if (!registry.exists) throw new Error('No spreadsheet registered for baptism');
  const spreadsheetId: string = registry.data()!.spreadsheetId;
  console.log(`Spreadsheet: ${spreadsheetId}\n`);

  // Get all tabs
  const ssInfo = await sheets.spreadsheets.get({ spreadsheetId });
  const allTabs = ssInfo.data.sheets || [];
  const tabTitles = allTabs.map(s => s.properties?.title).filter(Boolean) as string[];
  console.log(`Tabs found: ${tabTitles.join(', ')}\n`);

  // Find the tanggalBaptis column index from header row
  // Headers: ID(0), namaLengkap(1), nomorKTP(2), ..., tanggalBaptis(17), ...
  // We'll read the header from the first data tab to confirm
  let tanggalBaptisColIdx = -1;

  // Read all rows from all tabs, collect misplaced rows
  interface MisplacedRow {
    sourceTab: string;
    sourceSheetId: number;
    rowIndex: number; // 1-indexed (1 = header)
    rowData: string[];
    correctTab: string;
  }

  const misplaced: MisplacedRow[] = [];

  for (const tab of allTabs) {
    const title = tab.properties?.title;
    const sheetId = tab.properties?.sheetId;
    if (!title || sheetId === undefined || sheetId === null) continue;

    // Read all data from this tab
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${title}'!A:Z`,
    });
    const rows = res.data.values || [];
    if (rows.length === 0) {
      console.log(`Tab "${title}": empty`);
      continue;
    }

    // First row = headers
    const headerRow = rows[0];
    if (tanggalBaptisColIdx < 0) {
      tanggalBaptisColIdx = headerRow.indexOf('tanggalBaptis');
      console.log(`tanggalBaptis column index: ${tanggalBaptisColIdx} (col ${String.fromCharCode(65 + tanggalBaptisColIdx)})\n`);
    }

    if (tanggalBaptisColIdx < 0) {
      console.log(`Tab "${title}": tanggalBaptis column not found in header, skipping`);
      continue;
    }

    const dataRows = rows.slice(1); // skip header
    console.log(`Tab "${title}": ${dataRows.length} data row(s)`);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const correctTab = row[tanggalBaptisColIdx] || '';

      if (!correctTab || correctTab === 'undefined') {
        console.log(`  Row ${i + 2}: tanggalBaptis is empty/undefined — skipping`);
        continue;
      }

      if (correctTab !== title) {
        console.log(`  Row ${i + 2}: "${row[1] || '?'}" → should be in "${correctTab}" (currently in "${title}")`);
        misplaced.push({
          sourceTab: title,
          sourceSheetId: sheetId,
          rowIndex: i + 2, // 1-indexed, +1 for header, +1 for 0-based
          rowData: row,
          correctTab,
        });
      } else {
        console.log(`  Row ${i + 2}: "${row[1] || '?'}" ✅ already in correct tab`);
      }
    }
  }

  if (misplaced.length === 0) {
    console.log('\n✅ All rows are already in the correct tabs. Nothing to do.');
    return;
  }

  console.log(`\n🔄 Moving ${misplaced.length} misplaced row(s)...\n`);

  // Group misplaced rows by source tab and sort by rowIndex descending
  // so that deleting doesn't shift subsequent rows
  const bySourceTab = new Map<string, MisplacedRow[]>();
  for (const row of misplaced) {
    if (!bySourceTab.has(row.sourceTab)) bySourceTab.set(row.sourceTab, []);
    bySourceTab.get(row.sourceTab)!.push(row);
  }

  // First: append all misplaced rows to their correct tabs
  // (do this before deleting so data isn't lost if something fails)
  const correctTabsNeeded = [...new Set(misplaced.map(r => r.correctTab))];
  for (const targetTabName of correctTabsNeeded) {
    // Ensure target tab exists with headers
    const exists = allTabs.some(t => t.properties?.title === targetTabName);
    if (!exists) {
      console.log(`Creating tab "${targetTabName}"...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: targetTabName } } }] },
      });
      // Write header row (copy from a known tab)
      const existingDataTab = allTabs.find(t => t.properties?.title !== targetTabName);
      if (existingDataTab) {
        const hdrRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${existingDataTab.properties?.title}'!A1:Z1`,
        });
        const headerRow = hdrRes.data.values?.[0] || [];
        if (headerRow.length) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${targetTabName}'!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: [headerRow] },
          });
        }
      }
    }
  }

  // Append rows to their correct tabs
  for (const row of misplaced) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${row.correctTab}'!A:A`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row.rowData] },
    });
    console.log(`  Appended "${row.rowData[1] || '?'}" → "${row.correctTab}"`);
  }

  // Now delete original rows (in reverse order per source tab to preserve indices)
  for (const [sourceTab, rows] of bySourceTab) {
    const sourceSheetObj = allTabs.find(t => t.properties?.title === sourceTab);
    const sourceSheetId = sourceSheetObj?.properties?.sheetId;
    if (sourceSheetId === undefined || sourceSheetId === null) continue;

    // Sort descending by rowIndex so deletion doesn't shift remaining rows
    const sortedDesc = [...rows].sort((a, b) => b.rowIndex - a.rowIndex);

    for (const row of sortedDesc) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sourceSheetId,
                dimension: 'ROWS',
                startIndex: row.rowIndex - 1, // 0-indexed
                endIndex: row.rowIndex,
              },
            },
          }],
        },
      });
      console.log(`  Deleted row ${row.rowIndex} from "${sourceTab}" (was: "${row.rowData[1] || '?'}")`);
    }
  }

  // Final verification
  console.log('\n📊 Final tab state:');
  const finalSs = await sheets.spreadsheets.get({ spreadsheetId });
  for (const tab of finalSs.data.sheets || []) {
    const title = tab.properties?.title;
    if (!title) continue;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${title}'!A:A` });
    const dataCount = Math.max(0, (res.data.values?.length || 1) - 1); // subtract header
    console.log(`  Tab "${title}": ${dataCount} data row(s)`);
  }

  console.log('\n✅ Backfill complete.');
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
