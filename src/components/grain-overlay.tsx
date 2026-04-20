'use client';

import { useEffect, useState } from 'react';

/**
 * Full-page film grain overlay.
 *
 * 256×256 noise PNG rendered at 192px repeat with ~5% opacity.
 * Hydrates only after the browser is idle so the 26 KB grain asset never
 * competes with the hero LCP image for bandwidth.
 */
export default function GrainOverlay() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const schedule =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
        .requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 100));
    schedule(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage: "url('/grain.webp')",
        backgroundSize: '192px',
        backgroundRepeat: 'repeat',
        opacity: 0.05,
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    />
  );
}
