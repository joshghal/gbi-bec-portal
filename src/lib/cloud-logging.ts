import { GoogleAuth } from 'google-auth-library';
import { getServiceAccountCredentials } from './service-account';

// On-demand snapshot of a Cloud Run Job execution's logs — NOT a live tail.
// One request, one point-in-time read, capped at the last 30 minutes of the
// execution's activity. Built for Item 4 of docs/HLD-sermon-capture-resilience.md
// in gbi-bec-youtube-live-sync: diagnosing a sermon-capture incident currently
// requires `gcloud logging read` from a terminal with gcloud auth — this lets
// an admin do the same thing from the portal.
//
// Requires the portal's service account to have roles/logging.viewer (or a
// custom role scoped to logging.logEntries.list) on the project — it does not
// have this by default; the Firestore-scoped Firebase Admin credentials this
// reuses are not automatically granted Logging access.

const PROJECT_ID = 'baranangsiang-evening-chur';
const JOB_NAME = 'gbi-bec-youtube-live-sync';
const WINDOW_MS = 30 * 60 * 1000;
const CLOCK_SKEW_BUFFER_MS = 2 * 60 * 1000;

let cachedAuth: GoogleAuth | null = null;

function getAuthClient(): GoogleAuth {
  if (cachedAuth) return cachedAuth;
  const creds = getServiceAccountCredentials();
  cachedAuth = creds
    ? new GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/logging.read'] })
    : new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/logging.read'] });
  return cachedAuth;
}

export interface LogLine {
  timestamp: string;
  text: string;
}

export interface LogFetchResult {
  ok: boolean;
  lines: LogLine[];
  error?: string;
}

// Same redaction patterns already used in the job's own console output
// (sunday-runner.ts / live-summary.ts) — applied again here rather than
// trusted, since not every historical line was necessarily written with that
// discipline, and this is a second, independent boundary before admin display.
function redact(text: string): string {
  return text
    .replace(/http:\/\/[^@\s]+@/g, 'http://<creds>@')
    .replace(/[A-Za-z0-9_/.-]+yt-cookies\.txt/g, '<cookies>');
}

/**
 * Fetch ~30 minutes of Cloud Logging entries for one Cloud Run Job execution,
 * starting from when THAT EXECUTION began — not from "now". `executionName` is
 * the value recorded on the capture doc as `cloudRunExecutionName` (e.g.
 * "gbi-bec-youtube-live-sync-pmglh"); `executionStartedAt` is the capture doc's
 * own `capturedAt` (set at job registration, i.e. execution start).
 *
 * Anchoring to "now" instead of the execution's own start was the original
 * (wrong) design — it only ever returned results for an incident viewed within
 * 30 minutes of it happening, which is the uncommon case; incident review
 * normally happens well after the fact. Caught via direct testing against a
 * day-old execution: the same query with no timestamp filter returns entries
 * fine, with the "last 30 min of now" filter it silently returns zero even
 * though the logs exist.
 */
export async function fetchExecutionLogs(executionName: string, executionStartedAt: string): Promise<LogFetchResult> {
  if (!executionName) {
    return { ok: false, lines: [], error: 'No cloudRunExecutionName on this capture (older captures predate this field).' };
  }

  try {
    const auth = getAuthClient();
    const client = await auth.getClient();

    const anchorMs = Date.parse(executionStartedAt);
    const windowStart = new Date((Number.isFinite(anchorMs) ? anchorMs : Date.now()) - CLOCK_SKEW_BUFFER_MS).toISOString();
    const windowEnd = new Date((Number.isFinite(anchorMs) ? anchorMs : Date.now()) + WINDOW_MS).toISOString();

    const filter = [
      `resource.type="cloud_run_job"`,
      `resource.labels.job_name="${JOB_NAME}"`,
      `labels."run.googleapis.com/execution_name"="${executionName}"`,
      `timestamp>="${windowStart}"`,
      `timestamp<="${windowEnd}"`,
    ].join(' AND ');

    const res = await client.request<{
      entries?: Array<{ timestamp?: string; textPayload?: string; jsonPayload?: unknown }>;
      nextPageToken?: string;
    }>({
      url: 'https://logging.googleapis.com/v2/entries:list',
      method: 'POST',
      data: {
        resourceNames: [`projects/${PROJECT_ID}`],
        filter,
        orderBy: 'timestamp asc',
        pageSize: 1000,
      },
    });

    const entries = res.data.entries ?? [];
    const lines: LogLine[] = entries.map((e) => ({
      timestamp: e.timestamp ?? '',
      text: redact(e.textPayload ?? JSON.stringify(e.jsonPayload ?? '')),
    }));

    return { ok: true, lines };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, lines: [], error: message };
  }
}
