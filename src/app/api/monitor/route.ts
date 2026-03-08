import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { verifyAuthToken } from '@/lib/firebase-admin';

const GCP_PROJECT = 'bec-embedding-service';
const SERVICE_NAME = 'bec-embedding-service';
const REGION = 'asia-southeast1';

function getAuth() {
  const keyBase64 = process.env.GCP_MONITOR_KEY;
  if (!keyBase64) throw new Error('GCP_MONITOR_KEY not set');
  const credentials = JSON.parse(Buffer.from(keyBase64, 'base64').toString());
  return new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/monitoring.read'],
  });
}

async function queryMetric(auth: GoogleAuth, metricType: string, hours: number = 24) {
  const client = await auth.getClient();
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const filter = `metric.type="${metricType}" AND resource.type="cloud_run_revision" AND resource.labels.service_name="${SERVICE_NAME}" AND resource.labels.location="${REGION}"`;

  const url = `https://monitoring.googleapis.com/v3/projects/${GCP_PROJECT}/timeSeries?filter=${encodeURIComponent(filter)}&interval.startTime=${start.toISOString()}&interval.endTime=${now.toISOString()}&aggregation.alignmentPeriod=3600s&aggregation.perSeriesAligner=ALIGN_SUM`;

  const res = await client.request({ url });
  return res.data;
}

// Cloud Run pricing (as of 2025)
const PRICING = {
  vcpuSecond: 0.00002400, // per vCPU-second
  memGiBSecond: 0.00000250, // per GiB-second
  requestPer1M: 0.40, // per million requests
  freeVcpuSeconds: 180000,
  freeMemGiBSeconds: 360000,
  freeRequests: 2000000,
};

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const auth = getAuth();

    // Fetch metrics in parallel
    const [requestData, latencyData, instanceData] = await Promise.allSettled([
      queryMetric(auth, 'run.googleapis.com/request_count', 168), // 7 days
      queryMetric(auth, 'run.googleapis.com/request_latencies', 168),
      queryMetric(auth, 'run.googleapis.com/container/billable_instance_time', 168),
    ]);

    // Parse request count
    let totalRequests = 0;
    const requestsByHour: { time: string; count: number }[] = [];
    if (requestData.status === 'fulfilled') {
      const timeSeries = (requestData.value as any).timeSeries || [];
      for (const series of timeSeries) {
        for (const point of series.points || []) {
          const count = parseInt(point.value?.int64Value || '0', 10);
          totalRequests += count;
          requestsByHour.push({
            time: point.interval?.startTime || '',
            count,
          });
        }
      }
    }

    // Parse latency (p50, p95, p99)
    let avgLatencyMs = 0;
    if (latencyData.status === 'fulfilled') {
      const timeSeries = (latencyData.value as any).timeSeries || [];
      let totalLatency = 0;
      let latencyPoints = 0;
      for (const series of timeSeries) {
        for (const point of series.points || []) {
          const dist = point.value?.distributionValue;
          if (dist?.mean) {
            totalLatency += dist.mean;
            latencyPoints++;
          }
        }
      }
      avgLatencyMs = latencyPoints > 0 ? Math.round(totalLatency / latencyPoints) : 0;
    }

    // Parse billable instance time
    let billableInstanceSeconds = 0;
    if (instanceData.status === 'fulfilled') {
      const timeSeries = (instanceData.value as any).timeSeries || [];
      for (const series of timeSeries) {
        for (const point of series.points || []) {
          billableInstanceSeconds += parseFloat(point.value?.doubleValue || '0');
        }
      }
    }

    // Estimate cost (simplified)
    const billableRequests = Math.max(0, totalRequests - PRICING.freeRequests);
    const billableVcpu = Math.max(0, billableInstanceSeconds - PRICING.freeVcpuSeconds);
    const billableMem = Math.max(0, billableInstanceSeconds * 2 - PRICING.freeMemGiBSeconds); // 2 GiB memory

    const estimatedCost =
      billableRequests / 1_000_000 * PRICING.requestPer1M +
      billableVcpu * PRICING.vcpuSecond +
      billableMem * PRICING.memGiBSecond;

    // Health check
    let healthStatus = 'unknown';
    let healthLatency = 0;
    try {
      const healthStart = Date.now();
      const healthRes = await fetch(
        'https://bec-embedding-service-724237372266.asia-southeast1.run.app/health',
        { signal: AbortSignal.timeout(10000) }
      );
      healthLatency = Date.now() - healthStart;
      healthStatus = healthRes.ok ? 'healthy' : 'unhealthy';
    } catch {
      healthStatus = 'unreachable';
    }

    return NextResponse.json({
      health: { status: healthStatus, latencyMs: healthLatency },
      metrics: {
        totalRequests,
        avgLatencyMs,
        billableInstanceSeconds: Math.round(billableInstanceSeconds),
        requestsByHour: requestsByHour.sort((a, b) => a.time.localeCompare(b.time)).slice(-168),
      },
      cost: {
        estimatedUSD: Math.round(estimatedCost * 10000) / 10000,
        estimatedIDR: Math.round(estimatedCost * 16000),
        period: '7 days',
        breakdown: {
          requests: `${totalRequests} (free: ${PRICING.freeRequests.toLocaleString()})`,
          vcpuSeconds: `${Math.round(billableInstanceSeconds)}s`,
          memoryGiBSeconds: `${Math.round(billableInstanceSeconds * 2)}s`,
        },
      },
    });
  } catch (error) {
    console.error('Monitor error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
