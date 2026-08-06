/**
 * Test the WhatsApp welcome message end-to-end.
 *
 * Usage:
 *   npx tsx scripts/test-whatsapp.ts <phone> [name]
 *   npm run test:whatsapp -- 081234567890 "Budi"
 *
 * Reads WHATSAPP_* vars from .env.local. Requires the `welcome_new_member`
 * template to be APPROVED in Meta and (before Business Verification) the target
 * number to be added as a test recipient in WhatsApp API Setup.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendWelcomeMessage } from '../src/lib/whatsapp';

async function main() {
  const phone = process.argv[2];
  const name = process.argv[3] || 'Test Jemaat';

  if (!phone) {
    console.error('Usage: npx tsx scripts/test-whatsapp.ts <phone> [name]');
    process.exit(1);
  }

  console.log(`\nSending "${process.env.WHATSAPP_TEMPLATE_NAME || 'welcome_new_member'}" template`);
  console.log(`  to:   ${phone}`);
  console.log(`  name: ${name}\n`);

  const result = await sendWelcomeMessage(phone, name);
  console.log('Result:', JSON.stringify(result, null, 2), '\n');

  if ('skipped' in result && result.skipped) {
    console.warn('⚠  Skipped — WhatsApp not configured.');
    console.warn('   Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local');
    console.warn('   See docs/whatsapp-setup.md');
    process.exit(2);
  } else if (result.ok) {
    console.log('✅ Sent. messageId:', result.messageId);
    console.log('   Check the recipient phone — the welcome should arrive within seconds.');
  } else {
    console.error('❌ Failed:', result.error);
    console.error('   See the Troubleshooting section in docs/whatsapp-setup.md');
    process.exit(1);
  }
}

main();
