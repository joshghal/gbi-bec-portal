import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { getNotetakerSettings } from '@/lib/notetaker';
import { checkRecipientAllowed, isWhatsAppConfigured } from '@/lib/whatsapp';

/**
 * POST /api/notetaker-settings/check-recipients
 *
 * Reports, per registered number, whether Meta's test number is allowed to
 * message it — the 5-slot allow-list that lives on the developer platform and has
 * no read API of its own.
 *
 * Sends nothing. See checkRecipientAllowed() for why a nonexistent template name
 * is a safe probe. That matters: these are real congregants' numbers, so a check
 * that delivered "Hello World" every time the admin page opened would be
 * unacceptable.
 */
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    if (!isWhatsAppConfigured()) {
      return NextResponse.json({ configured: false, results: [] });
    }

    const db = getAdminFirestore();
    const settings = await getNotetakerSettings(db);

    // Same number can appear as both notulen and admin — probe each once.
    const phones = Array.from(
      new Set(
        [...settings.recipients, ...settings.adminRecipients]
          .map((r) => (r.phone ?? '').trim())
          .filter(Boolean),
      ),
    );

    const results = await Promise.all(
      phones.map(async (phone) => {
        const check = await checkRecipientAllowed(phone);
        return {
          phone,
          status: check.status,
          detail: 'detail' in check ? check.detail : undefined,
        };
      }),
    );

    return NextResponse.json({ configured: true, results });
  } catch (err) {
    console.error('check-recipients error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
