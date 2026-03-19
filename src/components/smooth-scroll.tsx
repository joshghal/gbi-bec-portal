'use client';

// Lenis smooth scroll removed — it ran on the main JS thread and added latency
// between user input and visual output, causing perceived lag.
// Native scroll is handled by the OS compositor (off the main thread), which is
// faster and more responsive. GSAP ScrollTrigger and Framer Motion useScroll
// both work correctly with native scroll out of the box.

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
