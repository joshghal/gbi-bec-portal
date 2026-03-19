'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { useEffect, useRef } from 'react';
import { staggerContainer, fadeUp } from '@/components/landing/animations';

/* ── Noise texture — same grain as hero ──────────────────────────── */
const GRAIN_PNG = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")`;

/* ── Stats data ──────────────────────────────────────────────────── */

const STATS = [
  { target: 8, label: 'Kegiatan Aktif', ariaLabel: '8 Kegiatan Aktif' },
  { target: 6, label: 'Cabang Creative Ministry', ariaLabel: '6 Cabang Creative Ministry' },
  { target: 4, label: 'Level KOM', ariaLabel: '4 Level KOM' },
  { target: 8, label: 'Pelayanan Jemaat', ariaLabel: '8 Pelayanan Jemaat' },
];

/* ── Animated counter component ──────────────────────────────────── */

function AnimatedCounter({
  target,
  duration = 1.5,
  delay = 0,
}: {
  target: number;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        animate(motionValue, target, { duration, ease: 'easeOut' });
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, motionValue, target, duration, delay]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

/* ── Stats section ───────────────────────────────────────────────── */

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12"
      style={{ backgroundColor: 'oklch(0.18 0.012 60)' }}
    >
      {/* ── Grain texture overlay — commented out */}
      {/* <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage: GRAIN_PNG,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      /> */}

      {/* ── Decorative background text ───────────────────────────── */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif font-bold text-white"
        style={{
          fontSize: 'clamp(10rem, 25vw, 22rem)',
          lineHeight: 1,
          opacity: 0.02,
          letterSpacing: '-0.04em',
        }}
      >
        BEC
      </span>

      {/* ── Content ──────────────────────────────────────────────── */}
      <motion.div
        className="relative z-20 mx-auto max-w-5xl"
        variants={staggerContainer(0.15, 0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8 lg:gap-x-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="flex flex-col items-center text-center"
              role="group"
              aria-label={stat.ariaLabel}
            >
              {/* Decorative line */}
              <div
                className="mb-5 h-px w-10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              />

              {/* Number */}
              <p
                className="font-serif font-bold text-white"
                style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', lineHeight: 1 }}
              >
                <AnimatedCounter
                  target={stat.target}
                  duration={1.5}
                  delay={i * 0.15}
                />
              </p>

              {/* Label */}
              <p
                className="mt-3 text-sm font-sans font-medium uppercase tracking-[0.15em]"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
