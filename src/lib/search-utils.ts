import type { FormType } from './form-types';

/**
 * Generate lowercase search tokens from form submission data.
 * Stored on the Firestore doc as `searchTerms: string[]` for `array-contains` queries.
 */
export function generateSearchTerms(type: FormType, data: Record<string, string>): string[] {
  const terms = new Set<string>();

  // Name tokens
  const nameField = type === 'child-dedication' ? 'namaAnak' : 'namaLengkap';
  const name = data[nameField]?.trim().toLowerCase();
  if (name) {
    terms.add(name);
    for (const word of name.split(/\s+/)) {
      if (word.length >= 2) terms.add(word);
    }
  }

  // Phone tokens (both 08xx and 628xx variants)
  const phone = data.noTelepon?.replace(/[\s\-+()]/g, '');
  if (phone) {
    terms.add(phone);
    if (phone.startsWith('62')) {
      terms.add('0' + phone.slice(2));
    } else if (phone.startsWith('0')) {
      terms.add('62' + phone.slice(1));
    }
  }

  // Email token
  const email = data.email?.trim().toLowerCase();
  if (email) {
    terms.add(email);
  }

  return Array.from(terms);
}

/**
 * Normalize an Indonesian phone number to international format for wa.me links.
 * 08xx → 628xx, +628xx → 628xx, already 628xx → 628xx
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[\s\-+()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return digits;
}
