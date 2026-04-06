/**
 * Fix baptism Google Sheets:
 * 1. Recover rows from wrong "Kota Bandung" tab (caused by stale header)
 * 2. Fix the stale header row to match current form config
 * 3. Redistribute all rows to correct tabs using tanggalBaptis column (index 17 in data)
 *
 * Usage: npx tsx --env-file=.env.local scripts/fix-baptism-tabs.ts
 */
import 'dotenv/config';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Current form config step order for baptism — determines column positions in data rows
// Row layout: [docId(0), ...steps(1..20)..., Status(21), Dibuat(22), Diupdate(23)]
const BAPTISM_STEPS = [
  'namaLengkap', 'nomorKTP', 'tempatLahir', 'tanggalLahir', 'jenisKelamin',
  'alamat', 'rtRw', 'provinsi', 'kota', 'kecamatan', 'kelurahan', 'kodePos',
  'noTelepon', 'email', 'namaAyah', 'namaIbu', 'tanggalBaptis',
  'sudahKOM100', 'sudahKAJ', 'alasanBaptis',
];
const CORRECT_HEADERS = ['ID', ...BAPTISM_STEPS, 'Status', 'Dibuat', 'Diupdate'];

// Index of tanggalBaptis in a data row (1 + its index in BAPTISM_STEPS)
const TANGGAL_BAPTIS_IDX = 1 + BAPTISM_STEPS.indexOf('tanggalBaptis'); // = 17

async function main() {
  console.log(`tanggalBaptis column in data rows: index ${TANGGAL_BAPTIS_IDX} (col ${columnLetter(TANGGAL_BAPTIS_IDX + 1)})\n`);

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

  const registry = await db.collection('sheet_registry').doc('baptism').get();
  if (!registry.exists) throw new Error('No spreadsheet registered for baptism');
  const spreadsheetId: string = registry.data()!.spreadsheetId;
  console.log(`Spreadsheet: ${spreadsheetId}\n`);

  // --- STEP 1: Read all data from all tabs (skip header row) ---
  const ssInfo = await sheets.spreadsheets.get({ spreadsheetId });
  const allTabs = ssInfo.data.sheets || [];
  console.log(`Tabs: ${allTabs.map(t => `"${t.properties?.title}"`).join(', ')}\n`);

  // Collect all data rows across all tabs (excluding header rows)
  const allDataRows: string[][] = [];
  for (const tab of allTabs) {
    const title = tab.properties?.title;
    if (!title) continue;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${title}'!A:Z`,
    });
    const rows = (res.data.values || []) as string[][];
    const dataRows = rows.filter(r => r[0] && r[0] !== 'ID'); // skip header and empty
    if (dataRows.length > 0) {
      console.log(`Collected ${dataRows.length} row(s) from "${title}"`);
      allDataRows.push(...dataRows);
    }
  }
  console.log(`\nTotal data rows collected: ${allDataRows.length}\n`);

  if (allDataRows.length === 0) {
    console.log('No data to process.');
    return;
  }

  // --- STEP 2: Show what tanggalBaptis values each row has ---
  console.log('Row analysis (using column index', TANGGAL_BAPTIS_IDX, 'for tanggalBaptis):');
  for (const row of allDataRows) {
    const name = row[1] || '?';
    const tanggalBaptis = row[TANGGAL_BAPTIS_IDX] || '(empty)';
    console.log(`  "${name}" → tanggalBaptis: "${tanggalBaptis}"`);
  }
  console.log();

  // --- STEP 3: Wipe ALL tabs (clear data rows, keep headers correct) ---
  // Get fresh tab list
  const ss2 = await sheets.spreadsheets.get({ spreadsheetId });
  const currentTabs = ss2.data.sheets || [];

  // Delete ALL data rows from every tab (delete sheets except keep at least one)
  // Strategy: clear each tab completely, then rewrite correct header
  const validDateTabs = currentTabs.filter(t => {
    const title = t.properties?.title || '';
    // Keep date-named tabs; delete wrong ones like "Kota Bandung"
    return title !== 'Kota Bandung';
  });
  const wrongTabs = currentTabs.filter(t => t.properties?.title === 'Kota Bandung');

  // Clear all valid tabs
  for (const tab of validDateTabs) {
    const title = tab.properties?.title;
    if (!title) continue;
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `'${title}'!A:Z` });
    // Write correct headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${title}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [CORRECT_HEADERS] },
    });
    console.log(`Cleared and reset header for tab "${title}"`);
  }

  // Delete the wrongly-created "Kota Bandung" tab
  for (const tab of wrongTabs) {
    const sheetId = tab.properties?.sheetId;
    if (sheetId === undefined || sheetId === null) continue;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ deleteSheet: { sheetId } }] },
    });
    console.log(`Deleted wrong tab "Kota Bandung"`);
  }

  // --- STEP 4: Group rows by their tanggalBaptis value and append to correct tabs ---
  const byTab = new Map<string, string[][]>();
  for (const row of allDataRows) {
    const tanggalBaptis = (row[TANGGAL_BAPTIS_IDX] || '').trim();
    if (!tanggalBaptis || tanggalBaptis === 'undefined') {
      console.log(`  WARNING: row "${row[1]}" has no tanggalBaptis — skipping`);
      continue;
    }
    if (!byTab.has(tanggalBaptis)) byTab.set(tanggalBaptis, []);
    byTab.get(tanggalBaptis)!.push(row);
  }

  console.log(`\nRedistributing to ${byTab.size} date tab(s):`);
  for (const [tab, rows] of byTab) {
    console.log(`  "${tab}": ${rows.length} row(s)`);
  }
  console.log();

  // Get updated tab list
  const ss3 = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTabs = new Set(ss3.data.sheets?.map(t => t.properties?.title).filter(Boolean));

  for (const [targetTab, rows] of byTab) {
    // Create tab if it doesn't exist
    if (!existingTabs.has(targetTab)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: targetTab } } }] },
      });
      // Write header
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${targetTab}'!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [CORRECT_HEADERS] },
      });
      existingTabs.add(targetTab);
      console.log(`Created new tab "${targetTab}" with correct headers`);
    }

    // Append rows
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${targetTab}'!A:A`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows },
    });
    console.log(`Appended ${rows.length} row(s) to "${targetTab}"`);
  }

  // --- STEP 5: Final verification ---
  console.log('\n📊 Final state:');
  const finalSs = await sheets.spreadsheets.get({ spreadsheetId });
  for (const tab of finalSs.data.sheets || []) {
    const title = tab.properties?.title;
    if (!title) continue;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${title}'!A:B` });
    const dataCount = Math.max(0, (res.data.values?.length || 1) - 1);
    const names = (res.data.values || []).slice(1).map(r => r[1]).join(', ');
    console.log(`  Tab "${title}": ${dataCount} row(s)${names ? ` — ${names}` : ''}`);
  }

  console.log('\n✅ Fix complete.');
}

function columnLetter(n: number): string {
  return String.fromCharCode(64 + n);
}

main().catch(e => { console.error('Failed:', e.message, e.stack); process.exit(1); });
