import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';

interface BaptismDate {
  date: string;
  label: string;
  slots: number;
}

// Public — no auth required
export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('baptism-dates').get();
    const data = doc.exists ? doc.data()! : { dates: [] };
    const allDates: BaptismDate[] = data.dates || [];

    // Filter out past dates
    const today = new Date().toISOString().split('T')[0];
    const futureDates = allDates
      .filter(d => d.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ dates: futureDates });
  } catch (error) {
    console.error('Get baptism dates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin auth required
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const dates: BaptismDate[] = body.dates || [];

    const db = getAdminFirestore();
    await db.collection('settings').doc('baptism-dates').set({ dates });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update baptism dates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
