import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

const DATE_FIELD_MAP: Record<string, string> = {
  mclass: 'tanggalMClass',
  baptism: 'tanggalBaptis',
  'child-dedication': 'tanggalPenyerahan',
};

export async function GET(request: NextRequest) {
  const formType = request.nextUrl.searchParams.get('type');
  if (!formType) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  }

  const authError = await verifyAuthToken(request, `page:forms/${formType}`);
  if (authError) return authError;

  const dateField = DATE_FIELD_MAP[formType];

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('form_submissions')
      .where('type', '==', formType)
      .orderBy('createdAt', 'desc')
      .get();

    const submissions = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        registrationNo: formType === 'child-dedication'
          ? (d.data?.namaAnak || '')
          : (d.data?.noMClass || ''),
        namaLengkap: d.data?.namaLengkap || '',
        noTelepon: d.data?.noTelepon || '',
        dateValue: dateField ? (d.data?.[dateField] || '') : '',
        status: d.status || 'pending',
        createdAt: d.createdAt || '',
      };
    });

    // Group by date field
    const byDate: Record<string, {
      total: number;
      hadir: number;
      entries: typeof submissions;
    }> = {};

    for (const s of submissions) {
      const key = s.dateValue || 'Tanpa tanggal';
      if (!byDate[key]) byDate[key] = { total: 0, hadir: 0, entries: [] };
      byDate[key].total++;
      if (s.status === 'hadir') byDate[key].hadir++;
      byDate[key].entries.push(s);
    }

    return NextResponse.json({
      total: submissions.length,
      totalHadir: submissions.filter(s => s.status === 'hadir').length,
      byDate,
      submissions,
    });
  } catch (error) {
    console.error(`${formType} report error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
