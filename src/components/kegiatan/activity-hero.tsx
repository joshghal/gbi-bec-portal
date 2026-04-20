'use client';

import { useEffect, useRef } from 'react';

interface ActivityHeroProps {
  title: string;
  image: string;
}

/**
 * Hero with vertical image parallax + staggered title entrance. Pure CSS
 * animations for entrance; a single rAF-throttled scroll handler drives the
 * parallax transform. No framer-motion → saves ~60 KB gzipped from the
 * critical chunk.
 */
export default function ActivityHero({ title, image }: ActivityHeroProps) {
  const words = title.split(' ');
  const sectionRef = useRef<HTMLElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgWrapRef.current;
    const title = titleRef.current;
    if (!section || !img || !title) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = rect.height + window.innerHeight;
        const progress = Math.min(
          1,
          Math.max(0, (window.innerHeight - rect.top) / total),
        );
        img.style.transform = `translate3d(0, ${progress * 15}%, 0)`;
        title.style.transform = `translate3d(${progress * -8}%, 0, 0)`;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center min-h-svh overflow-hidden"
    >
      {/* Image card — static at first paint so next/image priority can LCP
          instantly. Parallax applied via the inner wrapper after hydration. */}
      <div className="absolute z-[1] w-[220px] h-[340px] sm:w-[280px] sm:h-[440px] lg:w-[350px] lg:h-[550px] rounded-[24px] sm:rounded-[30px] overflow-hidden">
        <div
          ref={imgWrapRef}
          className="absolute inset-x-0 brightness-105"
          style={{ top: '-15%', height: '130%', willChange: 'transform' }}
        >
          <img
            src={image}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Title — CSS-only staggered fade/blur on mount. */}
      <h1
        ref={titleRef}
        className="relative z-[2] font-serif font-normal italic text-foreground text-center leading-[0.85] tracking-[-0.04em]"
        style={{ fontSize: 'clamp(110px, 14vw, 16rem)', willChange: 'transform' }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="block animate-[heroWordIn_0.7s_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{ animationDelay: `${100 + i * 60}ms` }}
          >
            {word}
          </span>
        ))}
      </h1>
    </section>
  );
}
