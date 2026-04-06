'use client';

import { motion } from 'framer-motion';
import { LandingButton } from '@/components/landing/landing-button';
import {
  wordSplitContainer,
  wordSplitChild,
} from './animations';

const headingSegments = [
  { text: 'GBI', italic: false },
  { text: 'Baranangsiang', italic: false },
  { text: 'Evening', italic: true },
  { text: 'Church', italic: false },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden pt-[100px] pb-20 lg:pb-28">

      {/* BEC watermark — static, no animation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute select-none"
        style={{ right: '-5%', top: '5%', opacity: 0.06 }}
      >
        <span
          className="block font-serif font-bold text-[60vw] md:text-[40vw]"
          style={{ lineHeight: 0.85, letterSpacing: '-0.04em', color: 'oklch(0.45 0.05 55)' }}
        >
          BEC
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-5"
          >
            Selamat Datang di
          </motion.p>

          <motion.h1
            variants={wordSplitContainer}
            initial="hidden"
            animate="visible"
            aria-label="GBI Baranangsiang Evening Church"
            className="font-serif font-bold leading-[0.95] text-foreground mb-0"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}
          >
            {headingSegments.map((segment, i) => (
              <motion.span
                key={i}
                variants={wordSplitChild}
                aria-hidden="true"
                className={`inline-block mr-[0.25em] last:mr-0 ${segment.italic ? 'italic' : ''}`}
              >
                {segment.text}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.55 }}
            className="origin-left mt-8 mb-7"
          >
            <div className="h-px w-20 bg-primary" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.65 }}
            className="text-lg tracking-wider text-foreground/80 mb-2"
          >
            Setiap Minggu&ensp;&middot;&ensp;17:00 WIB
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.75 }}
            className="text-sm text-muted-foreground mb-12"
          >
            Jl. Baranang Siang No.8, Sumur Bandung, Bandung
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.85 }}
            className="flex flex-wrap items-center gap-6"
          >
            <LandingButton variant="primary" href="#jadwal">
              Jadwal &amp; Lokasi
            </LandingButton>
            <LandingButton variant="text" href="/helpdesk" arrow>
              Tanya AI Kami
            </LandingButton>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-muted-foreground/40" aria-hidden="true">
          <path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
