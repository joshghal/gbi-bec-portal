import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import {
  DEFAULT_LINK_TTL_HOURS,
  NOTETAKER_SETTINGS_DOC,
  getNotetakerSettings,
  sanitizeRecipients,
} from '@/lib/notetaker';
import { isWhatsAppConfigured } from '@/lib/whatsapp';
import { logAdminAction } from '@/lib/admin-logger';

// Admin-only both ways — these are phone numbers of church volunteers.
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const db = getAdminFirestore();
    const settings = await getNotetakerSettings(db);
    return NextResponse.json({
      ...settings,
      // Drives the "WhatsApp belum dikonfigurasi" warning in the UI.
      whatsappConfigured: isWhatsAppConfigured(),
    });
  } catch (error) {
    console.error('Get notetaker settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const recipients = sanitizeRecipients(body?.recipients);
    const adminRecipients = sanitizeRecipients(body?.adminRecipients);
    const ttl = Number(body?.linkTtlHours);

    // Turning it on with nobody to notify would silently do nothing every Sunday.
    if (body?.enabled === true && recipients.length === 0) {
      return NextResponse.json(
        { error: 'Tambahkan minimal satu nomor notulen sebelum mengaktifkan.' },
        { status: 400 },
      );
    }

    const payload = {
      enabled: body?.enabled === true,
      recipients,
      adminRecipients,
      linkTtlHours: Number.isFinite(ttl) && ttl > 0 && ttl <= 72 ? ttl : DEFAULT_LINK_TTL_HOURS,
    };

    const db = getAdminFirestore();
    await db.collection('settings').doc(NOTETAKER_SETTINGS_DOC).set(payload, { merge: true });
    logAdminAction(request, 'update', 'notetaker-settings', {
      resourceTitle: `${payload.enabled ? 'aktif' : 'nonaktif'} · ${recipients.length} notulen`,
    });
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error('Update notetaker settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
