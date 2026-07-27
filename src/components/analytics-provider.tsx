'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// The site owner's own admin browsing pollutes GA4. Skip page_views for /admin
// routes while signed in as this account. (Self-traffic exclusion.)
const OWNER_EMAIL = 'joshuag.profesional@gmail.com';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ready = useRef(false); // analytics module loaded + initialized
  const pending = useRef<string[]>([]); // page paths awaiting flush
  const lastPath = useRef<string | null>(null);
  const ownerEmail = useRef<string | null>(null); // set once Firebase auth resolves

  // Whether a given path should be excluded from analytics (owner on /admin).
  const isExcluded = (path: string) =>
    ownerEmail.current === OWNER_EMAIL && path.startsWith('/admin');

  // Track the signed-in email so we can suppress the owner's own admin traffic.
  // Read-only subscription — no admin verification side effects here.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      ownerEmail.current = u?.email ?? null;
    });
  }, []);

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
          // Re-check exclusion at flush time: auth may have resolved after a
          // path was buffered, so an owner's /admin hit is dropped here too.
          const paths = pending.current;
          pending.current = [];
          for (const p of paths) if (!isExcluded(p)) trackPageView(p);
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

    // Owner's own /admin browsing is self-traffic — don't count it.
    if (isExcluded(pathname)) return;

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
