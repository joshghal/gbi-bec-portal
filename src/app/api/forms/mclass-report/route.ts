import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:forms/mclass');
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('form_submissions')
      .where('type', '==', 'mclass')
      .orderBy('createdAt', 'desc')
      .get();

    const submissions = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        noMClass: d.data?.noMClass || '',
        namaLengkap: d.data?.namaLengkap || '',
        noTelepon: d.data?.noTelepon || '',
        tanggalMClass: d.data?.tanggalMClass || '',
        status: d.status || 'pending',
        createdAt: d.createdAt || '',
      };
    });

    // Group by tanggalMClass
    const byDate: Record<string, {
      total: number;
      completed: number;
      entries: typeof submissions;
    }> = {};

    for (const s of submissions) {
      const key = s.tanggalMClass || 'Tanpa tanggal';
      if (!byDate[key]) byDate[key] = { total: 0, completed: 0, entries: [] };
      byDate[key].total++;
      if (s.status === 'hadir') byDate[key].completed++;
      byDate[key].entries.push(s);
    }

    // Monthly aggregation
    const byMonth: Record<string, { total: number; completed: number }> = {};
    for (const s of submissions) {
      const month = s.createdAt ? s.createdAt.slice(0, 7) : 'unknown'; // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { total: 0, completed: 0 };
      byMonth[month].total++;
      if (s.status === 'hadir') byMonth[month].completed++;
    }

    return NextResponse.json({
      total: submissions.length,
      totalCompleted: submissions.filter(s => s.status === 'hadir').length,
      byDate,
      byMonth,
      submissions,
    });
  } catch (error) {
    console.error('MClass report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
