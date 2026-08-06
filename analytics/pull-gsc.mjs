// GBI BEC — Search Console pipeline: Search Analytics + per-URL index status.
// Mirrors the Tooly / CentralData analytics pipeline (same zero-dep JWT auth).
//
//   node analytics/pull-gsc.mjs
//   DAYS=90 node analytics/pull-gsc.mjs
//   GSC_SITE="https://www.gbibec.id/" node analytics/pull-gsc.mjs   # URL-prefix property
//
// Auth: the analytics service account must be added in GSC → Settings → Users
// and permissions (email: cloudrun-monitor@bec-embedding-service.iam.gserviceaccount.com).
// Key resolution: see analytics/_sa-key.mjs.
//
// Outputs (gitignored) to analytics/out/:
//   gsc-search-<date>.json  top queries + top pages (28d)
//   gsc-index-<date>.json   index status for every LIVE sitemap URL
// Prints a summary incl. the NOT-indexed list — replaces manual site: checks.
import crypto from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SA_KEY as key } from './_sa-key.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// Domain property covers both apex + www; override with GSC_SITE if the GSC
// property is URL-prefix type (GSC → Settings → Property type).
const SITE = process.env.GSC_SITE || 'sc-domain:gbibec.id';
const SITEMAP_URL = process.env.SITEMAP_URL || 'https://www.gbibec.id/sitemap.xml';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
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
const H = () => ({ Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' });

function permHint(errStr) {
  if (/403|permission|insufficient|forbidden/i.test(errStr)) {
    return `\n  → The service account lacks GSC access. Add this email in\n    Search Console → Settings → Users and permissions (Full or Restricted):\n    ${key.client_email}\n  → Also confirm the property type: domain (sc-domain:gbibec.id) vs URL-prefix\n    (set GSC_SITE="https://www.gbibec.id/").`;
  }
  return '';
}

async function searchAnalytics(dimensions) {
  const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST', headers: H(),
    body: JSON.stringify({ startDate: daysAgo(DAYS), endDate: today, dimensions, rowLimit: 250 }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`searchAnalytics (${SITE}): ${JSON.stringify(j.error).slice(0, 200)}${permHint(JSON.stringify(j.error))}`);
  return (j.rows || []).map((row) => ({ keys: row.keys, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }));
}

async function inspect(url) {
  const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST', headers: H(), body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  const j = await r.json();
  const s = j.inspectionResult?.indexStatusResult;
  if (!s) return { url, ok: false, error: (j.error?.message || 'no result').slice(0, 120) };
  return { url, ok: true, verdict: s.verdict, coverage: s.coverageState, indexed: s.verdict === 'PASS', lastCrawl: s.lastCrawlTime || null, canonicalGoogle: s.googleCanonical || null, robots: s.robotsTxtState, fetch: s.pageFetchState };
}

async function sitemapUrls() {
  const r = await fetch(SITEMAP_URL, { headers: { 'user-agent': 'gbibec-analytics' } });
  if (!r.ok) throw new Error(`sitemap fetch failed: HTTP ${r.status}`);
  const xml = await r.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!urls.length) throw new Error('no <loc> URLs in live sitemap');
  return urls;
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

// ── run ──
TOKEN = await token();
mkdirSync(join(HERE, 'out'), { recursive: true });

console.log(`Pulling Search Analytics (${DAYS}d) for ${SITE}…`);
const queries = await searchAnalytics(['query']);
const pages = await searchAnalytics(['page']);
writeFileSync(join(HERE, 'out', `gsc-search-${today}.json`), JSON.stringify({ site: SITE, range: [daysAgo(DAYS), today], queries, pages }, null, 2));

console.log('Inspecting index status for every live-sitemap URL…');
const urls = await sitemapUrls();
const statuses = await pool(urls, 4, async (u) => { const r = await inspect(u); process.stdout.write('.'); return r; });
writeFileSync(join(HERE, 'out', `gsc-index-${today}.json`), JSON.stringify({ site: SITE, date: today, statuses }, null, 2));

// ── summary ──
const notIndexed = statuses.filter((s) => s.ok && !s.indexed);
const indexed = statuses.filter((s) => s.ok && s.indexed);
const errs = statuses.filter((s) => !s.ok);
console.log(`\n\n=== SEARCH (${DAYS}d) ===`);
console.log(`queries: ${queries.length} | pages: ${pages.length}`);
console.log('top queries by impressions:');
queries.sort((a, b) => b.impressions - a.impressions).slice(0, 12).forEach((q) => console.log(`  ${String(q.impressions).padStart(4)} impr  ${q.clicks} clk  pos ${q.position.toFixed(1)}  "${q.keys[0]}"`));
console.log(`\n=== INDEX STATUS (${urls.length} URLs) ===`);
console.log(`✓ indexed: ${indexed.length}   ✗ not indexed: ${notIndexed.length}   ⚠ errors: ${errs.length}`);
if (notIndexed.length) {
  console.log('\nNOT INDEXED (coverage reason):');
  const byReason = {};
  notIndexed.forEach((s) => { (byReason[s.coverage] ||= []).push(s.url); });
  Object.entries(byReason).forEach(([reason, list]) => {
    console.log(`  [${reason}] × ${list.length}`);
    list.forEach((u) => console.log(`      ${u}`));
  });
}
if (errs.length) { console.log('\nERRORS:'); errs.forEach((s) => console.log(`  ${s.url} — ${s.error}`)); }
console.log(`\nwrote analytics/out/gsc-search-${today}.json + gsc-index-${today}.json`);
