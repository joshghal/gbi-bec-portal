// GBI BEC — GA4 traffic snapshot via the Analytics Data API (zero-dep JWT auth).
// Mirrors the Tooly / CentralData analytics pipeline.
//
//   node analytics/pull-ga4.mjs           # property 527564078, last 28d
//   DAYS=90 node analytics/pull-ga4.mjs   # custom window
//
// GA4_PROPERTY = the NUMERIC property id (GA Admin → Property settings), NOT the
// G-XXXX measurement id. The service account email must be a Viewer in
// GA Admin → Property access management (already true — the app reads GA with it).
// Key resolution: see analytics/_sa-key.mjs.
//
// Output (gitignored) → analytics/out/ga4-<date>.json
import crypto from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SA_KEY as key } from './_sa-key.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROP = process.env.GA4_PROPERTY || '527564078';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const today = new Date().toISOString().slice(0, 10);
const DAYS = Number(process.env.DAYS || 28);

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const jwt = `${b64u({ alg: 'RS256', typ: 'JWT' })}.${b64u({ iss: key.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(jwt), key.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${jwt}.${sig}` }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('token exchange failed: ' + JSON.stringify(j));
  return j.access_token;
}

let TOKEN;
async function report(body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (j.error) throw new Error('GA4: ' + JSON.stringify(j.error).slice(0, 200));
  const dims = (j.dimensionHeaders || []).map((d) => d.name);
  const mets = (j.metricHeaders || []).map((m) => m.name);
  const rows = (j.rows || []).map((row) => ({ ...Object.fromEntries(row.dimensionValues.map((v, i) => [dims[i], v.value])), ...Object.fromEntries(row.metricValues.map((v, i) => [mets[i], Number(v.value)])) }));
  const totals = (j.totals?.[0]?.metricValues || []).map((v, i) => [mets[i], Number(v.value)]);
  return { rows, totals: Object.fromEntries(totals) };
}
const R = (dimensions, metrics, extra = {}) => report({ dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: 'today' }], dimensions: dimensions.map((name) => ({ name })), metrics: metrics.map((name) => ({ name })), metricAggregations: ['TOTAL'], limit: 25, ...extra });

TOKEN = await token();
mkdirSync(join(HERE, 'out'), { recursive: true });
const byCity = await R(['country', 'city'], ['sessions', 'activeUsers'], { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] });
const byPage = await R(['pagePath'], ['screenPageViews', 'sessions'], { orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] });
const byChannel = await R(['sessionDefaultChannelGroup'], ['sessions', 'activeUsers'], { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] });
const byEvent = await R(['eventName'], ['eventCount'], { orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] });

const out = { property: PROP, date: today, range: [`${DAYS}daysAgo`, 'today'], byCity, byPage, byChannel, byEvent };
writeFileSync(join(HERE, 'out', `ga4-${today}.json`), JSON.stringify(out, null, 2));

console.log(`GA4 property ${PROP} — ${DAYS}d: sessions=${byCity.totals.sessions ?? 0} users=${byCity.totals.activeUsers ?? 0}`);
console.log('channels:', byChannel.rows.map((r) => `${r.sessionDefaultChannelGroup}=${r.sessions}`).join(' · ') || '(none yet)');
console.log('top cities:', byCity.rows.slice(0, 8).map((r) => `${r.city || '?'}=${r.sessions}`).join(' · ') || '(none yet)');
console.log('top pages:'); byPage.rows.slice(0, 8).forEach((r) => console.log(`  ${String(r.screenPageViews).padStart(4)} views  ${r.pagePath}`));
console.log('top events:', byEvent.rows.slice(0, 8).map((r) => `${r.eventName}=${r.eventCount}`).join(' · ') || '(none yet)');
console.log(`wrote analytics/out/ga4-${today}.json`);
