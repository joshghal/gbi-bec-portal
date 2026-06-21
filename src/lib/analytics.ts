'use client';

import {
  initializeAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';
import app from './firebase';

let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

// Events emitted before Firebase Analytics finishes bootstrapping are buffered
// here and flushed on init, so nothing fired during the async `isSupported()`
// gap is lost. Page views are buffered upstream in AnalyticsProvider (which
// avoids importing this module — and therefore the heavy firebase/analytics
// chunk — until we're off the LCP critical path); this queue is the safety net
// for any direct trackEvent/trackChatMessage callers.
type QueuedEvent = { name: string; params?: Record<string, unknown> };
const queue: QueuedEvent[] = [];
const MAX_QUEUE = 50;

function flushQueue() {
  if (!analytics) return;
  while (queue.length) {
    const ev = queue.shift()!;
    logEvent(analytics, ev.name, ev.params);
  }
}

/**
 * Initialize Firebase Analytics exactly once. Idempotent: concurrent or repeat
 * calls return the same in-flight promise.
 *
 * `send_page_view: false` disables gtag's automatic initial page_view so that
 * AnalyticsProvider can be the single source of truth for page_view events —
 * firing one for the initial load AND for every client-side route change.
 */
export function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (!(await isSupported())) return null;
      analytics = initializeAnalytics(app, {
        config: { send_page_view: false },
      });
      flushQueue();
      return analytics;
    } catch {
      // Analytics is best-effort; never let it throw into the app.
      return null;
    }
  })();

  return initPromise;
}

function emit(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (analytics) {
    logEvent(analytics, name, params);
    return;
  }
  // Not ready yet — buffer until init flushes the queue.
  queue.push({ name, params });
  if (queue.length > MAX_QUEUE) queue.shift();
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>,
) {
  emit(eventName, params);
}

export function trackChatMessage(question: string) {
  emit('chat_message', { question: question.slice(0, 100) });
}

/**
 * Fire a GA4 page_view. Reads the live URL/title at call time so buffered hits
 * carry their own correct location rather than wherever the user ended up by
 * the time analytics bootstrapped. `path` is the route pathname for context.
 */
export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;
  emit('page_view', {
    page_location: window.location.href,
    page_path: path ?? window.location.pathname,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}
