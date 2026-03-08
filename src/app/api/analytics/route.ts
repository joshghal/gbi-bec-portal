import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { verifyAuthToken } from '@/lib/firebase-admin';

const GA_PROPERTY_ID = '527564078';

function getAuth() {
  const keyBase64 = process.env.GCP_MONITOR_KEY;
  if (!keyBase64) throw new Error('GCP_MONITOR_KEY not set');
  const credentials = JSON.parse(Buffer.from(keyBase64, 'base64').toString());
  return new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
}

async function runReport(
  auth: GoogleAuth,
  body: Record<string, unknown>
) {
  const client = await auth.getClient();
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`;
  const res = await client.request({
    url,
    method: 'POST',
    data: body,
  });
  return res.data;
}

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const auth = getAuth();

    const [overviewData, locationData, pagesData, deviceData, dailyData] =
      await Promise.allSettled([
        // Overview: active users, sessions, events
        runReport(auth, {
          dateRanges: [
            { startDate: '7daysAgo', endDate: 'today' },
            { startDate: '30daysAgo', endDate: 'today' },
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'eventCount' },
            { name: 'averageSessionDuration' },
          ],
        }),

        // User location (city)
        runReport(auth, {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [
            { name: 'country' },
            { name: 'city' },
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
          ],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 20,
        }),

        // Top pages
        runReport(auth, {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
          ],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),

        // Devices
        runReport(auth, {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        }),

        // Daily active users (last 30 days)
        runReport(auth, {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        }),
      ]);

    // Parse overview
    const overview = { week: {} as Record<string, number>, month: {} as Record<string, number> };
    if (overviewData.status === 'fulfilled') {
      const data = overviewData.value as any;
      const metricNames = ['activeUsers', 'sessions', 'pageViews', 'events', 'avgSessionDuration'];
      for (const row of data.rows || []) {
        const values = row.metricValues || [];
        const dateRange = row.metricValues ? 0 : 0; // rows come per date range
        metricNames.forEach((name, i) => {
          if (values[i]) {
            overview.week[name] = parseInt(values[i].value || '0', 10);
          }
        });
      }
      // If multiple date ranges, rows alternate
      const rows = data.rows || [];
      if (rows.length >= 2) {
        const weekMetrics = rows[0]?.metricValues || [];
        const monthMetrics = rows[1]?.metricValues || [];
        metricNames.forEach((name, i) => {
          overview.week[name] = parseFloat(weekMetrics[i]?.value || '0');
          overview.month[name] = parseFloat(monthMetrics[i]?.value || '0');
        });
      } else if (rows.length === 1) {
        const metrics = rows[0]?.metricValues || [];
        metricNames.forEach((name, i) => {
          overview.week[name] = parseFloat(metrics[i]?.value || '0');
          overview.month[name] = overview.week[name];
        });
      }
    }

    // Parse locations
    const locations: { country: string; city: string; users: number; sessions: number }[] = [];
    if (locationData.status === 'fulfilled') {
      for (const row of (locationData.value as any).rows || []) {
        locations.push({
          country: row.dimensionValues?.[0]?.value || '',
          city: row.dimensionValues?.[1]?.value || '',
          users: parseInt(row.metricValues?.[0]?.value || '0', 10),
          sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
        });
      }
    }

    // Parse top pages
    const pages: { path: string; views: number; users: number }[] = [];
    if (pagesData.status === 'fulfilled') {
      for (const row of (pagesData.value as any).rows || []) {
        pages.push({
          path: row.dimensionValues?.[0]?.value || '',
          views: parseInt(row.metricValues?.[0]?.value || '0', 10),
          users: parseInt(row.metricValues?.[1]?.value || '0', 10),
        });
      }
    }

    // Parse devices
    const devices: { category: string; users: number }[] = [];
    if (deviceData.status === 'fulfilled') {
      for (const row of (deviceData.value as any).rows || []) {
        devices.push({
          category: row.dimensionValues?.[0]?.value || '',
          users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        });
      }
    }

    // Parse daily
    const daily: { date: string; users: number; sessions: number }[] = [];
    if (dailyData.status === 'fulfilled') {
      for (const row of (dailyData.value as any).rows || []) {
        const raw = row.dimensionValues?.[0]?.value || '';
        const date = raw.length === 8
          ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
          : raw;
        daily.push({
          date,
          users: parseInt(row.metricValues?.[0]?.value || '0', 10),
          sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
        });
      }
    }

    return NextResponse.json({ overview, locations, pages, devices, daily });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
