/**
 * Full-page film grain overlay.
 *
 * Asset + styling match the Edify reference site exactly:
 * 256×256 noise PNG rendered at 192px repeat with 9% opacity.
 * Uses `position: fixed` so it covers the viewport consistently
 * regardless of page length or scroll container setup.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage: "url('/grain.webp')",
        backgroundSize: '192px',
        backgroundRepeat: 'repeat',
        opacity: 0.05,
        // Promote to its own GPU layer so Lenis-driven scroll transforms
        // don't force the grain to repaint every frame. Without these hints
        // the tiled background gets rasterized into the main paint layer.
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    />
  );
}
