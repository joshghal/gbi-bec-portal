'use client';

import dynamic from 'next/dynamic';

// Loaded only on the client after hydration, so the sonner bundle never
// counts toward SSR HTML or blocks the main thread during LCP.
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  return <Toaster position="top-right" richColors closeButton />;
}
