'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ready = useRef(false); // analytics module loaded + initialized
  const pending = useRef<string[]>([]); // page paths awaiting flush
  const lastPath = useRef<string | null>(null);

  // One-time bootstrap. Loads firebase/analytics OFF the LCP critical path,
  // but WITHOUT requiring a user interaction — so fast, non-interacting visits
  // (a large share of mobile traffic) are still counted. Whichever fires first
  // wins: a user interaction, browser idle, or a hard timeout fallback.
  useEffect(() => {
    let done = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const events: (keyof WindowEventMap)[] = [
      'scroll',
      'pointerdown',
      'keydown',
      'touchstart',
    ];
    const opts: AddEventListenerOptions = { once: true, passive: true };

    const cleanup = () => {
      for (const e of events) window.removeEventListener(e, bootstrap, opts);
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };

    const bootstrap = () => {
      if (done) return;
      done = true;
      cleanup();
      import('@/lib/analytics').then(({ initAnalytics, trackPageView }) =>
        initAnalytics().then(() => {
          ready.current = true;
          // Flush page views buffered before the chunk finished loading.
          const paths = pending.current;
          pending.current = [];
          for (const p of paths) trackPageView(p);
        }),
      );
    };

    for (const e of events) window.addEventListener(e, bootstrap, opts);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(bootstrap, { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(bootstrap, 2500);
    }

    return cleanup;
  }, []);

  // Track a page_view on the initial load AND every client-side route change.
  // gtag's implicit page_view is disabled in initAnalytics, so this is the
  // single source of truth — SPA navigations are no longer invisible to GA4.
  // Before bootstrap completes, paths are buffered (no firebase import here, so
  // the heavy chunk stays off the critical path) and flushed on bootstrap.
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;

    if (ready.current) {
      import('@/lib/analytics').then(({ trackPageView }) =>
        trackPageView(pathname),
      );
    } else {
      pending.current.push(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
