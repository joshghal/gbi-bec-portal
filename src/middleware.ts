import { NextRequest, NextResponse } from 'next/server';

// In-memory sliding window rate limiter
// Key = IP, Value = array of timestamps
const requests = new Map<string, number[]>();

// Rate limits per route prefix: [max requests, window in seconds]
const RATE_LIMITS: Record<string, [number, number]> = {
  '/api/chat': [15, 60],        // 15 req/min — AI calls are expensive
  '/api/forms': [2, 60],        // 2 req/min
  '/api/documents': [2, 5],     // 2 req/5s
  '/api/analytics': [2, 5],     // 2 req/5s
  '/api/monitor': [2, 5],       // 2 req/5s
};
const DEFAULT_LIMIT: [number, number] = [60, 60]; // 60 req/min fallback

// Clean up stale entries every 5 minutes
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, timestamps] of requests) {
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 120_000) {
      requests.delete(key);
    }
  }
}

function getLimit(pathname: string): [number, number] {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return DEFAULT_LIMIT;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const now = Date.now();
  cleanup(now);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`; // group by /api/{resource}

  const [maxRequests, windowSec] = getLimit(pathname);
  const windowMs = windowSec * 1000;

  const timestamps = requests.get(key) || [];
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldestInWindow = validTimestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);

    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((oldestInWindow + windowMs) / 1000)),
        },
      }
    );
  }

  validTimestamps.push(now);
  requests.set(key, validTimestamps);

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(maxRequests - validTimestamps.length));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
