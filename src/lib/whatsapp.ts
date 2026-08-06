import { normalizePhoneForWhatsApp } from './search-utils';

/**
 * WhatsApp Cloud API sender (Meta Graph API).
 *
 * Sends the "new member" welcome as a pre-approved MESSAGE TEMPLATE. Because the
 * message is business-initiated (the member never messaged us first), WhatsApp
 * REQUIRES an approved template — free-form text is rejected outside a 24h window.
 *
 * Setup: see docs/whatsapp-setup.md. Configured entirely via env vars so this is a
 * no-op (returns { skipped: true }) until credentials exist — form submission never
 * breaks if WhatsApp isn't configured yet or the API is down.
 *
 * Env:
 *   WHATSAPP_TOKEN            — permanent system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  — the Cloud API phone number ID (NOT the phone number)
 *   WHATSAPP_TEMPLATE_NAME    — approved template name (default: welcome_new_member)
 *   WHATSAPP_TEMPLATE_LANG    — template language code (default: id)
 *   WHATSAPP_API_VERSION      — Graph API version (default: v21.0)
 */

export type WhatsAppSendResult =
  | { ok: true; messageId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped?: false; error: string };

const GRAPH_BASE = 'https://graph.facebook.com';

/**
 * Send the welcome template to a new member.
 * Never throws — callers can await it inline without wrapping in try/catch.
 *
 * @param phone Raw Indonesian phone as entered (08xx / 62xx / +62xx)
 * @param name  Member's name, injected into the template's {{1}} body variable
 */
export async function sendWelcomeMessage(
  phone: string | undefined,
  name: string | undefined,
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'welcome_new_member';
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'id';
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!token || !phoneNumberId) {
    return { ok: false, skipped: true, reason: 'WhatsApp not configured' };
  }
  if (!phone) {
    return { ok: false, skipped: true, reason: 'No phone number provided' };
  }

  const to = normalizePhoneForWhatsApp(phone); // 62xxxxxxxxxx, digits only

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: (name || 'Jemaat').trim() }],
        },
      ],
    },
  };

  try {
    const res = await fetch(`${GRAPH_BASE}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        json?.error?.message || `HTTP ${res.status}`;
      console.error('[whatsapp] send failed:', errMsg, JSON.stringify(json?.error ?? {}));
      return { ok: false, error: errMsg };
    }

    const messageId = json?.messages?.[0]?.id ?? 'unknown';
    return { ok: true, messageId };
  } catch (err) {
    console.error('[whatsapp] send threw:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
