import { GoogleAuth } from 'google-auth-library';
import { getServiceAccountCredentials } from './service-account';

// Triggers a fresh execution of the gbi-bec-youtube-live-sync Cloud Run Job,
// targeting a known videoId directly via TARGET_VIDEO_ID (see
// sunday-runner.ts@41d9d6d) instead of letting it rediscover the stream by
// polling. Item 3 of docs/HLD-sermon-capture-resilience.md.
//
// Same v1 Jobs API + containerOverrides shape deploy.sh's own Cloud Scheduler
// entries use to set SERVICE_NUMBER per Sunday.

const PROJECT_ID = 'baranangsiang-evening-chur';
const REGION = 'asia-southeast1';
const JOB_NAME = 'gbi-bec-youtube-live-sync';

let cachedAuth: GoogleAuth | null = null;

function getAuthClient(): GoogleAuth {
  if (cachedAuth) return cachedAuth;
  const creds = getServiceAccountCredentials();
  cachedAuth = creds
    ? new GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    : new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  return cachedAuth;
}

export interface RerunParams {
  serviceNumber: number;
  videoId: string;
  title: string | null;
  sermonDate: string | null;
}

export interface RerunResult {
  ok: boolean;
  executionName?: string;
  error?: string;
}

export async function triggerRerun(params: RerunParams): Promise<RerunResult> {
  try {
    const auth = getAuthClient();
    const client = await auth.getClient();

    const res = await client.request<{ metadata?: { name?: string } }>({
      url: `https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${JOB_NAME}:run`,
      method: 'POST',
      data: {
        overrides: {
          containerOverrides: [{
            env: [
              { name: 'SERVICE_NUMBER', value: String(params.serviceNumber) },
              { name: 'TARGET_VIDEO_ID', value: params.videoId },
              { name: 'TARGET_VIDEO_TITLE', value: params.title ?? '' },
              { name: 'SERMON_DATE', value: params.sermonDate ?? '' },
            ],
          }],
        },
      },
    });

    return { ok: true, executionName: res.data.metadata?.name };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
