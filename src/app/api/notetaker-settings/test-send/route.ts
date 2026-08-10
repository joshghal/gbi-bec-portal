import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { isWhatsAppConfigured, sendHelloWorld } from '@/lib/whatsapp';

/**
 * POST /api/notetaker-settings/test-send  { phone }
 *
 * Diagnostic. Sends Meta's built-in `hello_world` to one number so the WhatsApp
 * configuration can be proven from the admin UI instead of discovered on a
 * Sunday.
 *
 * Deliberately uses `hello_world` rather than our own template: it validates the
 * token, the phone number ID and the recipient allow-list — the three things that
 * actually break — while working before `catatan_khotbah_link` is approved, and
 * without sending anyone a real (confusing) notes link.
 *
 * Meta's raw error text is passed straight through; it names the exact fault far
 * better than anything paraphrased here would.
 */
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        {
          error:
            'WhatsApp belum dikonfigurasi. Set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID di Vercel, lalu redeploy.',
        },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    if (!phone) {
      return NextResponse.json({ error: 'Nomor HP belum diisi.' }, { status: 400 });
    }

    const result = await sendHelloWorld(phone);

    if (result.ok) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    }

    // 'skipped' shouldn't reach here (isWhatsAppConfigured guarded it) but is
    // handled so the response shape is never ambiguous.
    const detail = 'reason' in result ? result.reason : result.error;
    return NextResponse.json({ error: detail, hint: hintFor(detail) }, { status: 502 });
  } catch (err) {
    console.error('test-send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Map Meta's error codes to the fix, since the raw messages assume you know the
 * platform. Only the failures that actually happen in this setup are covered.
 */
function hintFor(detail: string): string | undefined {
  if (detail.includes('131030')) {
    return 'Nomor ini belum ada di daftar penerima test number. Tambahkan di Meta → WhatsApp → API Setup → Manage phone number list (maksimal 5, dan tidak bisa dihapus).';
  }
  if (/OAuth|access token|session/i.test(detail)) {
    return 'Token kedaluwarsa atau salah. Token dari layar API Setup hanya berlaku 24 jam — pakai token System User dengan expiration "Never".';
  }
  if (detail.includes('132000') || /template/i.test(detail)) {
    return 'Template hello_world tidak ditemukan di WABA ini. Biasanya berarti WHATSAPP_PHONE_NUMBER_ID menunjuk ke nomor/WABA yang berbeda.';
  }
  if (detail.includes('phone_number_id') || detail.includes('(#100)')) {
    return 'WHATSAPP_PHONE_NUMBER_ID kemungkinan berisi nomor teleponnya, bukan Phone number ID-nya.';
  }
  return undefined;
}
