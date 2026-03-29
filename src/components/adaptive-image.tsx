'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Reads the image's natural dimensions on load and picks the best
 * object-fit strategy:
 *  - Wide landscape (>= 1.4) → object-cover, centered
 *  - Near-square (0.9–1.4)   → object-cover, top-center (keeps headers visible)
 *  - Portrait (< 0.9)        → object-contain (shows full image, no crop)
 */
export function AdaptiveImage({
  src,
  alt = '',
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');
  const [position, setPosition] = useState('center');

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    function measure() {
      const { naturalWidth: nw, naturalHeight: nh } = img!;
      if (!nw || !nh) return;

      const ratio = nw / nh;

      if (ratio >= 1.4) {
        setFit('cover');
        setPosition('center');
      } else if (ratio >= 0.9) {
        setFit('cover');
        setPosition('top center');
      } else {
        setFit('contain');
        setPosition('center');
      }
    }

    if (img.complete && img.naturalWidth) {
      measure();
    } else {
      img.addEventListener('load', measure, { once: true });
    }
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      aria-hidden={!alt}
      className={className}
      style={{ objectFit: fit, objectPosition: position }}
    />
  );
}
