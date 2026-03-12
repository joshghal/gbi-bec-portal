import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { syncToSheets, getSheetUrl } from '@/lib/google-sheets';
import { generateSearchTerms } from '@/lib/search-utils';
import type { FormType } from '@/lib/form-types';

/**
 * Generate sequential registration number for a form type + date.
 * Format: {prefix}-{seq} where seq resets per date.
 */
async function generateRegNo(
  db: FirebaseFirestore.Firestore,
  formType: string,
  dateField: string,
  dateValue: string,
  prefix: string,
): Promise<string> {
  const snap = await db
    .collection('form_submissions')
    .where('type', '==', formType)
    .get();

  const count = snap.docs.filter(doc => doc.data().data?.[dateField] === dateValue).length;
  const seq = count + 1;
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

const VALID_TYPES: FormType[] = ['kom', 'baptism', 'child-dedication', 'prayer', 'mclass'];

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
    }
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const db = getAdminFirestore();

    // --- Duplicate / similar entry prevention ---
    const nameField = type === 'child-dedication' ? 'namaAnak' : 'namaLengkap';
    const nameValue = data[nameField]?.trim().toLowerCase();
    const phoneValue = data.noTelepon?.replace(/[\s\-+()]/g, '');

    if (nameValue || phoneValue) {
      const existingSnap = await db
        .collection('form_submissions')
        .where('type', '==', type)
        .where('status', 'in', ['pending', 'reviewed'])
        .get();

      const duplicate = existingSnap.docs.find(doc => {
        const d = doc.data();
        const existingName = d.data?.[nameField]?.trim().toLowerCase();
        const existingPhone = d.data?.noTelepon?.replace(/[\s\-+()]/g, '');
        // Match by name OR phone
        if (nameValue && existingName === nameValue) return true;
        if (phoneValue && existingPhone && existingPhone === phoneValue) return true;
        return false;
      });

      if (duplicate) {
        const editLink = `/forms/edit/${duplicate.id}?token=${duplicate.data().editToken}`;
        return NextResponse.json(
          {
            error: 'Formulir serupa sudah pernah diajukan dan masih dalam proses.',
            existingId: duplicate.id,
            editLink,
          },
          { status: 409 }
        );
      }
    }

    // Validate date fields against allowed dates in Firestore
    const DATE_VALIDATION: Record<string, { field: string; settingsDoc: string }> = {
      mclass: { field: 'tanggalMClass', settingsDoc: 'mclass-dates' },
      baptism: { field: 'tanggalBaptis', settingsDoc: 'baptism-dates' },
    };

    const dateRule = DATE_VALIDATION[type];
    if (dateRule && data[dateRule.field]) {
      const settingsDoc = await db.collection('settings').doc(dateRule.settingsDoc).get();
      const allowedDates: string[] = settingsDoc.exists
        ? (settingsDoc.data()!.dates || []).map((d: { label: string }) => d.label)
        : [];
      if (!allowedDates.includes(data[dateRule.field])) {
        return NextResponse.json(
          { error: `Tanggal yang dipilih tidak valid atau sudah tidak tersedia.` },
          { status: 400 }
        );
      }
    }

    // Auto-generate registration numbers
    if (type === 'mclass' && data.tanggalMClass) {
      data.noMClass = await generateRegNo(db, 'mclass', 'tanggalMClass', data.tanggalMClass, 'MC-BS5');
    }

    const editToken = crypto.randomUUID();
    const now = new Date().toISOString();
    const searchTerms = generateSearchTerms(type, data);

    const docRef = await db.collection('form_submissions').add({
      type,
      editToken,
      status: 'pending',
      data,
      searchTerms,
      createdAt: now,
      updatedAt: now,
    });

    // Sync to Google Sheets (awaited so Vercel doesn't kill the request)
    await syncToSheets('create', type, docRef.id, { data, status: 'pending', createdAt: now });

    return NextResponse.json({ id: docRef.id, editToken });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const cursor = searchParams.get('cursor');
    const limit = 50;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = db.collection('form_submissions').orderBy('createdAt', 'desc');

    if (type) {
      query = query.where('type', '==', type);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (search) {
      query = query.where('searchTerms', 'array-contains', search);
    }
    if (cursor) {
      const cursorDoc = await db.collection('form_submissions').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(limit + 1).get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const submissions = pageDocs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const nextCursor = hasMore ? pageDocs[pageDocs.length - 1].id : null;

    // Get or create sheet URL
    let sheetUrl: string | null = null;
    if (type) {
      sheetUrl = await getSheetUrl(type as FormType);
    }

    return NextResponse.json({ submissions, sheetUrl, nextCursor });
  } catch (error) {
    console.error('List submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
