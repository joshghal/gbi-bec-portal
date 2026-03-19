'use client';

import { motion } from 'framer-motion';
import { Clock, LayoutGrid } from 'lucide-react';
import {
  fadeUp,
  fadeUpSmall,
  wordSplitContainer,
  wordSplitChild,
  staggerContainer,
  useParallax,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Data ──────────────────────────────────────────────────────────── */

const headingWords = 'Rumah Bagi Semua'.split(' ');

const bodyText =
  'GBI Baranangsiang Evening Church (BEC) adalah gereja yang terbuka bagi semua orang. Berlokasi di Jl. Baranang Siang No.8, Sumur Bandung, Kota Bandung, kami hadir setiap Minggu pukul 17:00 WIB untuk beribadah bersama. Sebagai bagian dari Gereja Bethel Indonesia, kami percaya bahwa setiap orang layak menemukan rumah rohani yang penuh kasih.';

interface InfoSnippet {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const INFO_SNIPPETS: InfoSnippet[] = [
  {
    label: 'Ibadah Minggu',
    value: 'Setiap Minggu \u00b7 17:00 WIB',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    label: 'Program Aktif',
    value: '8 Kegiatan Rutin',
    icon: <LayoutGrid className="w-4 h-4" />,
  },
];

/* ── Variants ──────────────────────────────────────────────────────── */

const decorTextVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeOut' as const },
  },
};

const snippetCardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ── Component ─────────────────────────────────────────────────────── */

export default function AboutSection() {
  const { ref, y } = useParallax([40, -40]);

  return (
    <section id="tentang" className="py-16 lg:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* ── Left column — text (7 cols) ──────────────────────── */}
          <div className="lg:col-span-7 relative">
            {/* Decorative oversized italic text */}
            <motion.span
              variants={decorTextVariant}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              aria-hidden="true"
              className="block font-serif italic text-[4.5rem] lg:text-[6rem] leading-none text-foreground/[0.06] select-none pointer-events-none -mb-8 lg:-mb-12"
            >
              About
            </motion.span>

            {/* Eyebrow */}
            <motion.p
              variants={fadeUpSmall}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase"
            >
              TENTANG KAMI
            </motion.p>

            {/* Heading — word split */}
            <motion.h2
              variants={wordSplitContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-4 font-serif text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]"
            >
              {headingWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordSplitChild}
                  style={{
                    display: 'inline-block',
                    marginRight: i < headingWords.length - 1 ? '0.3em' : 0,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>

            {/* Body */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-6 text-lg text-muted-foreground"
              style={{ lineHeight: 1.8 }}
            >
              {bodyText}
            </motion.p>

            {/* Divider + pull-quote */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-8"
            >
              <div className="w-[120px] h-px bg-foreground/15" />
              <p className="mt-5 font-serif italic text-base text-muted-foreground/80">
                Sebagai bagian dari Gereja Bethel Indonesia
              </p>
            </motion.div>
          </div>

          {/* ── Right column — stacked info cards (5 cols) ────── */}
          <div className="lg:col-span-5 lg:-mt-10">
            <motion.div
              ref={ref}
              style={{ y }}
              className="relative flex flex-col gap-4 lg:pl-8"
            >
              <motion.div
                variants={staggerContainer(0.12, 0.2)}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="flex flex-col gap-4"
              >
                {INFO_SNIPPETS.map((snippet, i) => (
                  <motion.div
                    key={snippet.label}
                    variants={snippetCardVariant}
                    style={{
                      // Staggered horizontal offset for asymmetry
                      marginLeft: i === 0 ? 0 : i === 1 ? '24px' : '12px',
                    }}
                    className="bg-card rounded-xl border border-border p-5 shadow-sm max-w-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/[0.08] text-primary">
                        {snippet.icon}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {snippet.label}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {snippet.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Decorative background element behind cards */}
              <div
                aria-hidden="true"
                className="absolute -z-10 top-6 -left-4 w-full h-[calc(100%-24px)] rounded-2xl opacity-[0.04]"
                style={{
                  background:
                    'linear-gradient(135deg, oklch(0.370 0.060 250) 0%, oklch(0.500 0.040 75) 100%)',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
