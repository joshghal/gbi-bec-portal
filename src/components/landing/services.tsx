'use client';

import { motion } from 'framer-motion';
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Service data ──────────────────────────────────────────────── */

interface PastoralService {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SERVICES: PastoralService[] = [
  {
    title: 'Kedukaan',
    description: 'Pendampingan dan pelayanan saat kedukaan keluarga jemaat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M12 2v4" />
        <path d="M12 6c-1 4-4 6-4 10a4 4 0 0 0 8 0c0-4-3-6-4-10z" />
      </svg>
    ),
  },
  {
    title: 'Orang Sakit',
    description: 'Kunjungan dan doa untuk jemaat yang sakit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },
  {
    title: 'Konseling',
    description: 'Konseling pastoral untuk keluarga dan pribadi',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
  },
  {
    title: 'Pernikahan Bermasalah',
    description: 'Pendampingan pasangan yang mengalami krisis pernikahan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
        <path d="M12 5v14" />
      </svg>
    ),
  },
  {
    title: 'Kecanduan',
    description: 'Konseling dan dukungan untuk jemaat yang mengalami kecanduan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Kelahiran',
    description: 'Ucapan syukur dan doa untuk kelahiran anak jemaat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Pindah Rumah',
    description: 'Doa berkat untuk jemaat yang pindah tempat tinggal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Pelepasan Jenazah',
    description: 'Pelayanan pelepasan jenazah jemaat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[18px] h-[18px]">
        <path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8c0 4 6 10 6 10s6-6 6-10z" />
        <path d="M12 18v4M8 22h8" />
        <circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
];

/* ── Component ─────────────────────────────────────────────────── */

export default function ServicesSection() {
  return (
    <section id="pelayanan" className="py-16 lg:py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Header — editorial top-rule, matches updates.tsx */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex items-end justify-between pb-5 border-b border-border">
            <div>
              <p className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase">
                Pelayanan Jemaat
              </p>
              <h2 className="mt-2 font-serif text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
                Kami Ada untuk Anda
              </h2>
            </div>
            <span className="hidden sm:block text-sm text-muted-foreground/35 pb-0.5 font-mono">
              {SERVICES.length} layanan
            </span>
          </div>
        </motion.div>

        {/* 2-col editorial list — rules define structure, no card chrome */}
        <motion.div
          variants={staggerContainer(0.06, 0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {SERVICES.map((service, i) => {
            const isLeft = i % 2 === 0;
            const isLastRow = i >= SERVICES.length - 2;
            const isLastItem = i === SERVICES.length - 1;
            return (
              <motion.div
                key={service.title}
                variants={fadeUpSmall}
                className={[
                  'group border-b border-border',
                  isLeft ? 'md:border-r md:pr-10' : 'md:pl-10',
                  isLastRow ? 'md:border-b-0' : '',
                  isLastItem ? 'border-b-0' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="flex gap-4 py-7 lg:py-8">
                  {/* Hanging index */}
                  <span
                    aria-hidden
                    className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-foreground/20 pt-[3px] w-6 select-none"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Icon — small, no container */}
                  <div className="shrink-0 text-foreground/30 group-hover:text-foreground/55 transition-colors mt-px">
                    {service.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] leading-snug group-hover:opacity-60 transition-opacity duration-200">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact — editorial text strip, not a button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p className="text-sm text-muted-foreground italic">
            Untuk keperluan mendesak, hubungi
          </p>
          <a
            href="https://wa.me/6281573097720"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm shrink-0"
          >
            <span className="font-medium text-foreground">Ps. Thomas Lukiman</span>
            <span className="text-muted-foreground/35 select-none">·</span>
            <span className="font-mono text-muted-foreground tabular-nums text-[13px]">0815-7309-7720</span>
            <svg
              width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden
              className="text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
