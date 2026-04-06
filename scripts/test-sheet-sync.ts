/**
 * Test script: verifies that baptism form data goes to the correct Google Sheets tab,
 * and moves when tanggalBaptis is changed via edit.
 *
 * Usage: npx tsx scripts/test-sheet-sync.ts
 */
import 'dotenv/config';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const BASE_URL = 'http://localhost:3000';

// --- Firebase Admin ---
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
const serviceAccount = JSON.parse(readFileSync(resolve(credPath), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// --- Google Sheets ---
async function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function getSpreadsheetId(): Promise<string> {
  const doc = await db.collection('sheet_registry').doc('baptism').get();
  if (!doc.exists) throw new Error('No spreadsheet registered for baptism');
  return doc.data()!.spreadsheetId;
}

async function getTabRows(spreadsheetId: string, tabName: string): Promise<string[][]> {
  const sheets = await getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tabName}'!A:C`,
    });
    return (res.data.values || []) as string[][];
  } catch {
    return [];
  }
}

async function getAllTabs(spreadsheetId: string): Promise<string[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return (res.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);
}

async function findRowInSheets(spreadsheetId: string, docId: string): Promise<{ tab: string; row: string[] } | null> {
  const tabs = await getAllTabs(spreadsheetId);
  const sheets = await getSheetsClient();
  for (const tab of tabs) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${tab}'!A:A`,
      });
      const rows = res.data.values || [];
      const idx = rows.findIndex(r => r[0] === docId);
      if (idx >= 0) {
        // Get full row
        const rowRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${tab}'!A${idx + 1}:Z${idx + 1}`,
        });
        return { tab, row: rowRes.data.values?.[0] || [] };
      }
    } catch { /* skip */ }
  }
  return null;
}

function log(msg: string) {
  console.log(`\n${'─'.repeat(60)}\n${msg}`);
}
function pass(msg: string) { console.log(`  ✅ ${msg}`); }
function fail(msg: string) { console.log(`  ❌ ${msg}`); }
function info(msg: string) { console.log(`  ℹ️  ${msg}`); }

// --- Test data ---
const DATE_A_LABEL = 'Sabtu, 14 Maret 2026';
const DATE_B_LABEL = 'Sabtu, 9 Mei 2026';

const SAMPLE_DATA = {
  namaLengkap: 'TEST Budi Santoso',
  nomorKTP: '3273010101900001',
  tempatLahir: 'Bandung',
  tanggalLahir: '1990-01-01',
  jenisKelamin: 'Pria',
  alamat: 'Jl. Test No. 1',
  rtRw: '01/01',
  provinsi: 'Jawa Barat',
  kota: 'Kota Bandung',
  kecamatan: 'Sukajadi',
  kelurahan: 'Pasteur',
  kodePos: '40161',
  noTelepon: '081234567890',
  email: 'test@test.com',
  namaAyah: 'Pak Test',
  namaIbu: 'Bu Test',
  tanggalBaptis: DATE_A_LABEL,
  sudahKOM100: 'Sudah',
  sudahKAJ: 'Sudah',
  alasanBaptis: 'TEST ENTRY - please delete',
};

async function main() {
  console.log('🔬 Testing Baptism Sheet Sync Fix\n');
  const spreadsheetId = await getSpreadsheetId();
  info(`Spreadsheet ID: ${spreadsheetId}`);

  // --- STEP 1: Submit form ---
  log('STEP 1: Submit baptism form with date = "Sabtu, 14 Maret 2026"');
  const submitRes = await fetch(`${BASE_URL}/api/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'baptism', data: SAMPLE_DATA }),
  });
  const submitJson = await submitRes.json();
  if (!submitRes.ok) {
    fail(`Submit failed: ${JSON.stringify(submitJson)}`);
    process.exit(1);
  }
  const { id, editToken } = submitJson;
  pass(`Submitted. ID=${id}  editToken=${editToken}`);

  // Wait for Sheets sync
  info('Waiting 4s for Sheets sync...');
  await new Promise(r => setTimeout(r, 4000));

  // --- STEP 2: Verify initial tab placement ---
  log('STEP 2: Verify row is in "Sabtu, 14 Maret 2026" tab');
  const initialLocation = await findRowInSheets(spreadsheetId, id);
  if (!initialLocation) {
    fail('Row NOT found in any sheet tab');
  } else if (initialLocation.tab === DATE_A_LABEL) {
    pass(`Row found in correct tab: "${initialLocation.tab}"`);
    info(`Row data (cols A-C): ${initialLocation.row.slice(0, 3).join(' | ')}`);
  } else {
    fail(`Row found in WRONG tab: "${initialLocation.tab}" (expected "${DATE_A_LABEL}")`);
  }

  // --- STEP 3: Modify entry — change tanggalBaptis to DATE_B ---
  log('STEP 3: Edit entry — change tanggalBaptis to "Sabtu, 9 Mei 2026"');
  const updatedData = { ...SAMPLE_DATA, tanggalBaptis: DATE_B_LABEL };
  const editRes = await fetch(`${BASE_URL}/api/forms/${id}?token=${editToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: updatedData }),
  });
  const editJson = await editRes.json();
  if (!editRes.ok) {
    fail(`Edit failed: ${JSON.stringify(editJson)}`);
  } else {
    pass(`Edit saved. updatedAt=${editJson.updatedAt}`);
  }

  // Wait for Sheets sync
  info('Waiting 4s for Sheets sync...');
  await new Promise(r => setTimeout(r, 4000));

  // --- STEP 4: Verify row moved to new tab ---
  log('STEP 4: Verify row MOVED to "Sabtu, 9 Mei 2026" tab');
  const newLocation = await findRowInSheets(spreadsheetId, id);
  if (!newLocation) {
    fail('Row NOT found in any sheet tab after edit');
  } else if (newLocation.tab === DATE_B_LABEL) {
    pass(`Row correctly moved to: "${newLocation.tab}"`);
    info(`Row data (cols A-C): ${newLocation.row.slice(0, 3).join(' | ')}`);
  } else {
    fail(`Row is in WRONG tab: "${newLocation.tab}" (expected "${DATE_B_LABEL}")`);
    info(`This means the updateRow tab-move fix is not working.`);
  }

  // Also confirm old tab no longer has the row
  const oldTabRows = await getTabRows(spreadsheetId, DATE_A_LABEL);
  const stillInOldTab = oldTabRows.some(r => r[0] === id);
  if (stillInOldTab) {
    fail(`Row STILL EXISTS in old tab "${DATE_A_LABEL}" — row was not removed`);
  } else {
    pass(`Row correctly removed from old tab "${DATE_A_LABEL}"`);
  }

  // --- STEP 5: List all tabs and their row counts ---
  log('STEP 5: All tabs in spreadsheet');
  const tabs = await getAllTabs(spreadsheetId);
  for (const tab of tabs) {
    const rows = await getTabRows(spreadsheetId, tab);
    const dataRows = rows.filter(r => r[0] && r[0] !== 'ID');
    info(`  Tab "${tab}": ${dataRows.length} data row(s)`);
  }

  // --- Cleanup reminder ---
  log('CLEANUP');
  info(`Test entry created with ID: ${id}`);
  info(`Delete it from admin: http://localhost:3000/admin/forms/baptism`);
  info(`Or via API (needs admin auth): DELETE /api/forms/${id}`);

  console.log('\n✅ Test complete.\n');
}

main().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
