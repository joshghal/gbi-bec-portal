'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

import { WaIcon } from '@/components/landing/icons';

gsap.registerPlugin(ScrollTrigger);

interface Announcement {
  enabled: boolean;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export default function VideoParallaxSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [data, setData] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch('/api/announcement')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const content = contentRef.current;
    if (!section || !video) return;

    const ctx = gsap.context(() => {
      // Play video on loop
      video.play().catch(() => {});

      // Clip-path reveal — inset rounded card expands to full bleed
      gsap.fromTo(section,
        { clipPath: 'inset(6% 4% 6% 4% round 24px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 25%',
            scrub: 0.5,
          },
        }
      );

      // Parallax on video
      gsap.to(video, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Per-element reveals — each has its own character
      const st = { trigger: section, scrub: 0.4 };

      // Label — slides in from left
      if (labelRef.current) {
        gsap.fromTo(labelRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, scrollTrigger: { ...st, start: 'top 55%', end: 'top 30%' } }
        );
      }

      // Title — clips up from bottom (mask reveal)
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 80, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, scrollTrigger: { ...st, start: 'top 50%', end: 'top 20%' } }
        );
      }

      // Divider — scales from left
      if (dividerRef.current) {
        gsap.fromTo(dividerRef.current,
          { scaleX: 0 },
          { scaleX: 1, scrollTrigger: { ...st, start: 'top 40%', end: 'top 18%' } }
        );
      }

      // Description — blurs in from below
      if (descRef.current) {
        gsap.fromTo(descRef.current,
          { opacity: 0, y: 25, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', scrollTrigger: { ...st, start: 'top 38%', end: 'top 12%' } }
        );
      }

      // CTA — slides in from right
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, scrollTrigger: { ...st, start: 'top 35%', end: 'top 12%' } }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [data]);

  const isWa = data?.ctaLink?.includes('wa.me');
  const hasAnnouncement = data?.enabled && data.title;

  if (data !== null && !hasAnnouncement) return null;
  if (data === null) return null;

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] sm:h-[75vh] lg:h-[85vh] overflow-hidden"
      style={{ backgroundColor: '#0a0a12' }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/announcement-video-bg.webm"
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-[125%] -top-[12%] object-cover"
      />

      {/* Overlay — darker at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, oklch(0.08 0.03 260 / 0.25) 0%, oklch(0.06 0.04 260 / 0.75) 100%)',
        }}
      />

      {/* Announcement — brutalist layout */}
      {hasAnnouncement && (
        <div
          ref={contentRef}
          className="absolute inset-0 z-[2] flex flex-col justify-end px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12 lg:pb-16"
        >
          <div className="max-w-6xl mx-auto w-full">
            {/* PENGUMUMAN — massive, raw */}
            <p
              ref={labelRef}
              className="uppercase font-bold tracking-[0.4em]"
              style={{
                fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)',
                color: 'rgba(255,255,255,0.70)',
              }}
            >
              Pengumuman
            </p>

            {/* Title — oversized brutalist */}
            <h3
              ref={titleRef}
              className="mt-2 font-serif font-black leading-[0.9] tracking-[-0.03em] will-change-transform"
              style={{
                fontSize: 'clamp(3rem, 10vw, 7.5rem)',
                color: '#fff',
              }}
            >
              {data!.title}
            </h3>

            {/* Divider */}
            <div ref={dividerRef} className="mt-4 mb-4 w-full h-px origin-left" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* Description + CTA — inline row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {data!.description && (
                <p
                  ref={descRef}
                  className="text-base sm:text-lg leading-relaxed max-w-lg"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {data!.description}
                </p>
              )}

              {data!.ctaLabel && data!.ctaLink && (
                <a
                  ref={ctaRef}
                  href={data!.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-2.5 rounded-full bg-white text-black px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 w-full sm:w-auto"
                >
                  {isWa && <WaIcon className="w-4 h-4 shrink-0" />}
                  {data!.ctaLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
