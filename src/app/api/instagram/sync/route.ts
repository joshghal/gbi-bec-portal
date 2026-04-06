import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { GoogleAuth } from 'google-auth-library';
import { getServiceAccountCredentials } from '@/lib/service-account';

const PROJECT_ID = 'baranangsiang-evening-chur';
const REGION     = 'asia-southeast1';
const JOB_NAME   = 'gbi-bec-instagram-sync';

// POST /api/instagram/sync — triggers Cloud Run Job, requires admin auth
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const creds = getServiceAccountCredentials();
    const auth  = creds
      ? new GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
      : new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

    const client      = await auth.getClient();
    const tokenResult = await client.getAccessToken();
    const token       = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
    if (!token) throw new Error('Failed to get GCP access token');

    const url = `https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${JOB_NAME}:run`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Cloud Run API error ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, execution: data?.metadata?.name ?? null });
  } catch (error) {
    console.error('Instagram sync trigger error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
