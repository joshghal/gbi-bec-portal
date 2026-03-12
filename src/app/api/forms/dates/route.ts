import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { syncScheduleToKB } from '@/lib/kb-sync';

interface FormDate {
  date: string;
  label: string;
  slots: number;
}

const ALLOWED_TYPES = ['baptism', 'mclass'];

function getDocId(formType: string) {
  return `${formType}-dates`;
}

// Public — no auth required
export async function GET(request: NextRequest) {
  const formType = request.nextUrl.searchParams.get('type');
  const showAll = request.nextUrl.searchParams.get('all') === '1';
  if (!formType || !ALLOWED_TYPES.includes(formType)) {
    return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc(getDocId(formType)).get();
    const data = doc.exists ? doc.data()! : { dates: [] };
    const allDates: FormDate[] = data.dates || [];

    const today = new Date().toISOString().split('T')[0];
    const months = parseInt(request.nextUrl.searchParams.get('months') || '0', 10);

    let dates: FormDate[];
    if (showAll) {
      dates = allDates.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      const futureDates = allDates
        .filter(d => d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (months > 0) {
        // Show dates within current month + N next calendar months
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() + months + 1, 0); // last day of the Nth next month
        const cutoffStr = cutoff.toISOString().split('T')[0];
        dates = futureDates.filter(d => d.date <= cutoffStr);
      } else {
        dates = futureDates;
      }
    }

    return NextResponse.json({ dates });
  } catch (error) {
    console.error(`Get ${formType} dates error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin auth required
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const formType: string = body.type;
    const dates: FormDate[] = body.dates || [];

    if (!formType || !ALLOWED_TYPES.includes(formType)) {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
    }

    const db = getAdminFirestore();
    await db.collection('settings').doc(getDocId(formType)).set({ dates });

    // Update knowledge base with new schedule
    try {
      await syncScheduleToKB(formType, dates);
    } catch (error) {
      console.error(`Failed to sync ${formType} schedule to KB:`, error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update form dates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
