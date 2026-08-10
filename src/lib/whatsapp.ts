import { normalizePhoneForWhatsApp } from './search-utils';

/**
 * WhatsApp Cloud API sender (Meta Graph API).
 *
 * Everything here is business-initiated (the recipient never messaged us first),
 * so WhatsApp REQUIRES a pre-approved MESSAGE TEMPLATE — free-form text is
 * rejected outside a 24h service window.
 *
 * Setup: see docs/whatsapp-setup.md (welcome) and docs/khotbah-automation.md
 * (notetaker links). Configured entirely via env vars, so every sender here is a
 * no-op (returns { skipped: true }) until credentials exist — callers never break
 * when WhatsApp isn't configured yet or the API is down.
 *
 * Env:
 *   WHATSAPP_TOKEN                  — permanent system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID        — the Cloud API phone number ID (NOT the phone number)
 *   WHATSAPP_TEMPLATE_NAME          — welcome template (default: welcome_new_member)
 *   WHATSAPP_TEMPLATE_LANG          — template language code (default: id)
 *   WHATSAPP_API_VERSION            — Graph API version (default: v21.0)
 *   WHATSAPP_NOTE_TEMPLATE_NAME     — notetaker link template (default: catatan_khotbah_link)
 *   WHATSAPP_STATUS_TEMPLATE_NAME   — admin status alert template (default: catatan_khotbah_status)
 */

export type WhatsAppSendResult =
  | { ok: true; messageId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped?: false; error: string };

const GRAPH_BASE = 'https://graph.facebook.com';

interface TemplateComponent {
  type: string;
  sub_type?: string;
  index?: string;
  parameters: Array<{ type: 'text'; text: string }>;
}

function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    lang: process.env.WHATSAPP_TEMPLATE_LANG || 'id',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  };
}

/** True when the Cloud API credentials are present. Callers use this to decide
 *  whether to surface a manual wa.me fallback in the UI. */
export function isWhatsAppConfigured(): boolean {
  const { token, phoneNumberId } = config();
  return Boolean(token && phoneNumberId);
}

/**
 * Low-level template send. Never throws.
 * Shared by every sender below so auth, error shaping and logging live in one place.
 */
async function sendTemplate(
  phone: string | undefined,
  templateName: string,
  components: TemplateComponent[],
  langOverride?: string,
): Promise<WhatsAppSendResult> {
  const { token, phoneNumberId, lang: configLang, apiVersion } = config();
  const lang = langOverride ?? configLang;

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
      components,
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
      const errMsg = json?.error?.message || `HTTP ${res.status}`;
      console.error('[whatsapp] send failed:', templateName, errMsg, JSON.stringify(json?.error ?? {}));
      return { ok: false, error: errMsg };
    }

    const messageId = json?.messages?.[0]?.id ?? 'unknown';
    return { ok: true, messageId };
  } catch (err) {
    console.error('[whatsapp] send threw:', templateName, err);
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

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
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'welcome_new_member';
  return sendTemplate(phone, templateName, [
    {
      type: 'body',
      parameters: [{ type: 'text', text: (name || 'Jemaat').trim() }],
    },
  ]);
}

/**
 * Send the one-time notes link to a notulen.
 *
 * The template has a dynamic URL button whose BASE is baked into the approved
 * template (https://www.gbibec.id/catatan/) — we only supply the token as the
 * suffix. That is why the token is plain hex: no escaping ambiguity in the button.
 *
 * @param phone    Notulen's phone, raw
 * @param name     Notulen's name        → body {{1}}
 * @param service  e.g. "Ibadah Raya 5 · 10 Agustus 2026" → body {{2}}
 * @param token    32-char hex token     → URL button suffix
 */
export async function sendNotetakerLink(
  phone: string | undefined,
  name: string,
  service: string,
  token: string,
): Promise<WhatsAppSendResult> {
  const templateName = process.env.WHATSAPP_NOTE_TEMPLATE_NAME || 'catatan_khotbah_link';
  return sendTemplate(phone, templateName, [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: name.trim() || 'Notulen' },
        { type: 'text', text: service },
      ],
    },
    {
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: token }],
    },
  ]);
}

/**
 * Send a notulen their PERMANENT bookmark link over WhatsApp.
 *
 * Mirrors the wa.me message the admin UI pre-fills, but delivered by the API so
 * it needs no manual tap. The URL cannot sit in the body — Meta requires dynamic
 * URLs to live in a button — so the approved template carries the base
 * `https://www.gbibec.id/notulen/` and we supply the slug as the suffix.
 *
 * Sent once per notulen, not weekly: the link never changes.
 *
 * @param phone Notulen's phone, raw
 * @param name  Notulen's name → body {{1}}
 * @param slug  Their permanent slug → URL button suffix
 */
export async function sendNotulenLink(
  phone: string | undefined,
  name: string,
  slug: string,
): Promise<WhatsAppSendResult> {
  const templateName = process.env.WHATSAPP_LINK_TEMPLATE_NAME || 'link_notulen';
  return sendTemplate(phone, templateName, [
    {
      type: 'body',
      parameters: [{ type: 'text', text: name.trim() || 'Notulen' }],
    },
    {
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: slug }],
    },
  ]);
}

/**
 * Tell the admin what the automation did (or couldn't do).
 *
 * Optional by design: if this template never gets approved the main pipeline is
 * unaffected, you just lose the notification. The URL button suffix is a path
 * relative to the approved base (https://www.gbibec.id/) — e.g. "kabar/<slug>"
 * or "admin/khotbah".
 */
export async function sendKhotbahStatus(
  phone: string | undefined,
  service: string,
  statusText: string,
  urlSuffix: string,
): Promise<WhatsAppSendResult> {
  const templateName = process.env.WHATSAPP_STATUS_TEMPLATE_NAME || 'catatan_khotbah_status';
  return sendTemplate(phone, templateName, [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: service },
        { type: 'text', text: statusText },
      ],
    },
    {
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: urlSuffix }],
    },
  ]);
}

/**
 * Diagnostic send using Meta's built-in `hello_world` template.
 *
 * Exists because the three things that actually break — the token, the phone
 * number ID, and whether a number is on the test number's allowed-recipient list
 * — can all be validated with this ONE call, without waiting for Sunday and
 * without needing our own templates approved first.
 *
 * `hello_world` is only published in en_US, so the language is pinned rather than
 * taken from WHATSAPP_TEMPLATE_LANG.
 */
export async function sendHelloWorld(phone: string | undefined): Promise<WhatsAppSendResult> {
  return sendTemplate(phone, 'hello_world', [], 'en_US');
}

/**
 * A template name that must never exist. Used to probe recipient eligibility.
 */
const PROBE_TEMPLATE = '__bec_allowlist_probe__';

export type RecipientCheck =
  | { status: 'registered' }
  | { status: 'not-registered' }
  | { status: 'unknown'; detail: string }
  | { status: 'unconfigured' };

/**
 * Determine whether a number is on the test number's allowed-recipient list
 * WITHOUT delivering anything.
 *
 * Meta validates the recipient before it resolves the template, so sending a
 * deliberately nonexistent template separates the two cases cleanly:
 *   131030 -> recipient not in the allowed list
 *   132001 / 132000 -> recipient IS allowed; only the template was missing
 * Neither outcome delivers a message, which is what makes this safe to run
 * against real congregants' numbers.
 *
 * Verified empirically: one request to three numbers returned 131030 for the
 * unregistered one and 132001 for the two registered ones.
 */
export async function checkRecipientAllowed(phone: string | undefined): Promise<RecipientCheck> {
  if (!isWhatsAppConfigured()) return { status: 'unconfigured' };

  const res = await sendTemplate(phone, PROBE_TEMPLATE, [], 'en_US');

  // A successful send would mean the probe template somehow exists — treat the
  // recipient as allowed, since that is what the result proves.
  if (res.ok) return { status: 'registered' };
  if ('skipped' in res && res.skipped) return { status: 'unknown', detail: res.reason };

  const detail = res.error;
  if (detail.includes('131030')) return { status: 'not-registered' };
  if (detail.includes('132001') || detail.includes('132000') || /template/i.test(detail)) {
    return { status: 'registered' };
  }
  return { status: 'unknown', detail };
}

/**
 * Click-to-chat fallback. Used by the admin UI when the Cloud API isn't
 * configured or a send failed, so a Sunday is never lost to plumbing — you tap
 * once and it goes from your own WhatsApp.
 */
export function waMeLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}
