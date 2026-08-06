// Resolves the analytics service-account key, shared by pull-ga4.mjs + pull-gsc.mjs.
// Resolution order:
//   1. $GSC_SA_KEY            — path to a JSON key file
//   2. analytics/analytics-sa.json
//   3. GCP_MONITOR_KEY        — base64 JSON, from env or ../.env.local
//
// (3) reuses the SAME service account the app already uses to read GA4
// (cloudrun-monitor@bec-embedding-service.iam.gserviceaccount.com), so there's
// no second key file to manage. That email must ALSO be granted in Search
// Console → Settings → Users and permissions for the GSC pull to work.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

function fromMonitorKey() {
  let b64 = process.env.GCP_MONITOR_KEY;
  if (!b64) {
    const envPath = join(ROOT, '.env.local');
    if (existsSync(envPath)) {
      const m = readFileSync(envPath, 'utf8').match(/^GCP_MONITOR_KEY\s*=\s*(.+)$/m);
      if (m) b64 = m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  if (!b64) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

let key = null;
if (process.env.GSC_SA_KEY && existsSync(process.env.GSC_SA_KEY)) {
  key = JSON.parse(readFileSync(process.env.GSC_SA_KEY, 'utf8'));
} else if (existsSync(join(HERE, 'analytics-sa.json'))) {
  key = JSON.parse(readFileSync(join(HERE, 'analytics-sa.json'), 'utf8'));
} else {
  key = fromMonitorKey();
}

if (!key?.client_email || !key?.private_key) {
  throw new Error(
    'No analytics SA key found. Provide one of: GSC_SA_KEY=<path>, ' +
      'analytics/analytics-sa.json, or GCP_MONITOR_KEY (base64) in .env.local.',
  );
}

export const SA_KEY = key;
