import { google, sheets_v4 } from 'googleapis';
import { getServiceAccountCredentials } from './service-account';
import { getAdminFirestore } from './firebase-admin';
import { FORM_CONFIGS, FORM_TYPE_LABELS } from './form-config';
import type { FormType } from './form-types';

// --- Auth ---

function getSheetsClient(): sheets_v4.Sheets | null {
  const creds = getServiceAccountCredentials();
  if (!creds) {
    console.warn('[google-sheets] No service account credentials available');
    return null;
  }

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });

  return google.sheets({ version: 'v4', auth });
}

// --- Headers per form type ---

function getHeaders(formType: FormType): string[] {
  const config = FORM_CONFIGS.find(c => c.type === formType);
  if (!config) return ['ID', 'Status', 'Dibuat', 'Diupdate'];

  const fieldHeaders = config.steps.map(s => s.field);
  return ['ID', ...fieldHeaders, 'Status', 'Dibuat', 'Diupdate'];
}

// --- Tab name helpers ---

function getMonthlyTabName(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getTabName(formType: FormType, data: Record<string, unknown>, createdAt: string): string {
  if (formType === 'baptism') {
    return String(data.tanggalBaptis);
  }
  if (formType === 'mclass') {
    return String(data.tanggalMClass);
  }
  return getMonthlyTabName(new Date(createdAt));
}

// --- Get spreadsheet from registry ---

async function getSpreadsheetId(formType: FormType): Promise<string | null> {
  const db = getAdminFirestore();
  const registryDoc = await db.collection('sheet_registry').doc(formType).get();

  if (!registryDoc.exists) {
    console.warn(`[google-sheets] No spreadsheet registered for ${formType}. Run: npx tsx scripts/setup-sheets.ts`);
    return null;
  }

  return registryDoc.data()!.spreadsheetId;
}

// --- Get or create monthly tab ---

async function getOrCreateTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  formType: FormType,
  tabName: string,
): Promise<string> {

  // Check if tab exists
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTab = spreadsheet.data.sheets?.find(
    s => s.properties?.title === tabName,
  );

  if (existingTab) return tabName;

  // Create tab
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });

  // Write headers
  const headers = getHeaders(formType);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });

  // Bold + freeze header row
  const newSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const newTab = newSpreadsheet.data.sheets?.find(s => s.properties?.title === tabName);
  if (newTab?.properties?.sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newTab.properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: { textFormat: { bold: true } },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: newTab.properties.sheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });
  }

  console.log(`[google-sheets] Created tab "${tabName}" in ${formType}`);
  return tabName;
}

// --- Build row values ---

function buildRowValues(
  formType: FormType,
  docId: string,
  data: Record<string, unknown>,
  status: string,
  createdAt: string,
  updatedAt: string,
): string[] {
  const config = FORM_CONFIGS.find(c => c.type === formType);
  if (!config) return [docId, status, createdAt, updatedAt];

  const fieldValues = config.steps.map(s => String(data[s.field] ?? ''));
  return [docId, ...fieldValues, status, createdAt, updatedAt];
}

// --- Find row by doc ID ---

async function findRowByDocId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tabName: string,
  docId: string,
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:A`,
  });

  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === docId) return i + 1; // 1-indexed
  }
  return null;
}

// --- Find row across all tabs ---

async function findRowAcrossTabs(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  docId: string,
): Promise<{ tabName: string; rowIndex: number } | null> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const tabNames = spreadsheet.data.sheets
    ?.map(s => s.properties?.title)
    .filter((t): t is string => !!t) || [];

  for (const tabName of tabNames) {
    const rowIndex = await findRowByDocId(sheets, spreadsheetId, tabName, docId);
    if (rowIndex !== null) return { tabName, rowIndex };
  }
  return null;
}

// --- CRUD Operations ---

async function appendRow(
  formType: FormType,
  docId: string,
  data: Record<string, unknown>,
  status: string,
  createdAt: string,
): Promise<void> {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const spreadsheetId = await getSpreadsheetId(formType);
  if (!spreadsheetId) return;

  const tabName = await getOrCreateTab(sheets, spreadsheetId, formType, getTabName(formType, data, createdAt));

  const row = buildRowValues(formType, docId, data, status, createdAt, createdAt);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

async function updateRow(
  formType: FormType,
  docId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const spreadsheetId = await getSpreadsheetId(formType);
  if (!spreadsheetId) return;

  const found = await findRowAcrossTabs(sheets, spreadsheetId, docId);
  if (!found) {
    console.warn(`[google-sheets] Row not found for doc ${docId}, skipping update`);
    return;
  }

  const { tabName, rowIndex } = found;

  // Read the current row to merge with updates
  const headers = getHeaders(formType);
  const currentRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A${rowIndex}:${columnLetter(headers.length)}${rowIndex}`,
  });
  const currentRow = currentRes.data.values?.[0] || [];

  // Apply updates to the correct columns
  const newRow = [...currentRow];
  while (newRow.length < headers.length) newRow.push('');

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'status') {
      const statusIdx = headers.indexOf('Status');
      if (statusIdx >= 0) newRow[statusIdx] = String(value ?? '');
    } else if (key === 'updatedAt') {
      const updIdx = headers.indexOf('Diupdate');
      if (updIdx >= 0) newRow[updIdx] = String(value ?? '');
    } else if (key === 'data' && typeof value === 'object' && value !== null) {
      // Update individual field columns from nested data
      const config = FORM_CONFIGS.find(c => c.type === formType);
      if (config) {
        for (const step of config.steps) {
          const colIdx = headers.indexOf(step.field);
          if (colIdx >= 0 && step.field in (value as Record<string, unknown>)) {
            newRow[colIdx] = String((value as Record<string, unknown>)[step.field] ?? '');
          }
        }
      }
    }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A${rowIndex}:${columnLetter(headers.length)}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newRow] },
  });
}

async function deleteRow(
  formType: FormType,
  docId: string,
): Promise<void> {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const spreadsheetId = await getSpreadsheetId(formType);
  if (!spreadsheetId) return;

  const found = await findRowAcrossTabs(sheets, spreadsheetId, docId);
  if (!found) {
    console.warn(`[google-sheets] Row not found for doc ${docId}, skipping delete`);
    return;
  }

  const { tabName, rowIndex } = found;

  // Get sheet ID for the tab
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = spreadsheet.data.sheets?.find(s => s.properties?.title === tabName);
  if (!tab?.properties?.sheetId && tab?.properties?.sheetId !== 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tab.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed for batchUpdate
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

// --- Column letter helper ---

function columnLetter(colNum: number): string {
  let letter = '';
  let n = colNum;
  while (n > 0) {
    n--;
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26);
  }
  return letter;
}

// --- Get sheet URL (creates spreadsheet if needed) ---

export async function getSheetUrl(formType: FormType): Promise<string | null> {
  try {
    const db = getAdminFirestore();
    const registry = await db.collection('sheet_registry').doc(formType).get();
    return registry.exists ? (registry.data()?.spreadsheetUrl ?? null) : null;
  } catch (error) {
    console.error(`[google-sheets] getSheetUrl failed for ${formType}:`, error);
    return null;
  }
}

// --- Public entry point ---

type SyncOperation = 'create' | 'update' | 'delete';

export async function syncToSheets(
  operation: SyncOperation,
  formType: FormType,
  docId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    switch (operation) {
      case 'create':
        if (!data) return;
        await appendRow(
          formType,
          docId,
          data.data as Record<string, unknown> ?? data,
          String(data.status ?? 'pending'),
          String(data.createdAt ?? new Date().toISOString()),
        );
        break;

      case 'update':
        if (!data) return;
        await updateRow(formType, docId, data);
        break;

      case 'delete':
        await deleteRow(formType, docId);
        break;
    }

    console.log(`[google-sheets] ${operation} synced for ${formType}/${docId}`);
  } catch (error) {
    // Fire-and-forget: log but never throw
    console.error(`[google-sheets] ${operation} failed for ${formType}/${docId}:`, error);
  }
}
