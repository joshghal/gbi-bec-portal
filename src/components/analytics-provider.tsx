'use client';

import { useEffect } from 'react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer Firebase Analytics bootstrap until the user has scrolled, clicked,
    // moved the pointer, or touched — whichever comes first. Falls back to a
    // hard timeout so analytics still fires on bots/keyboard-only sessions.
    // Keeping gtag off the LCP path lifts mobile Lighthouse scores materially.
    let bootstrapped = false;
    const bootstrap = () => {
      if (bootstrapped) return;
      bootstrapped = true;
      import('@/lib/analytics').then(({ initAnalytics }) => initAnalytics());
    };

    const events: (keyof WindowEventMap)[] = [
      'scroll',
      'pointerdown',
      'keydown',
      'touchstart',
    ];
    const opts: AddEventListenerOptions = { once: true, passive: true };
    for (const e of events) window.addEventListener(e, bootstrap, opts);

    const fallback = window.setTimeout(bootstrap, 6000);

    return () => {
      for (const e of events) window.removeEventListener(e, bootstrap, opts);
      window.clearTimeout(fallback);
    };
  }, []);

  return <>{children}</>;
}
