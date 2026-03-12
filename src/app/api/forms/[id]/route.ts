import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { syncToSheets } from '@/lib/google-sheets';

async function authorize(request: NextRequest, docData: { editToken: string }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token && token === docData.editToken) {
    return null; // authorized via edit token
  }

  return verifyAuthToken(request); // fall back to admin auth
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection('form_submissions').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data = doc.data()!;
    const authError = await authorize(request, data as { editToken: string });
    if (authError) return authError;

    return NextResponse.json({ id: doc.id, ...data });
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection('form_submissions').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existing = doc.data()!;
    const authError = await authorize(request, existing as { editToken: string });
    if (authError) return authError;

    const { data } = await request.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await db.collection('form_submissions').doc(id).update({
      data,
      updatedAt: now,
    });

    await syncToSheets('update', existing.type, id, { data, updatedAt: now });

    return NextResponse.json({ id, updatedAt: now });
  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection('form_submissions').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const docType = doc.data()!.type;
    await db.collection('form_submissions').doc(id).delete();

    await syncToSheets('delete', docType, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
