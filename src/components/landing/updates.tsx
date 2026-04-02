'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingButton } from '@/components/landing/landing-button';
import { useLandingData } from '@/components/landing/landing-loader';
import { stripHtml } from '@/lib/slug';
import { formatDate } from '@/lib/format-date';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AdaptiveImage } from '@/components/adaptive-image';
import {
  fadeUp,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Types ─────────────────────────────────────────────────────── */

interface Update {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  rawDate: string;  // YYYY-MM-DD for sorting
  date: string;     // display format
  color: string;
  image?: string;
  video?: string;
  pinned?: boolean;
}

interface ApiUpdate {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  color: string;
  imageUrl?: string | null;
  isVideo?: boolean;
  pinned?: boolean;
  published: boolean;
}


function mapApiUpdate(u: ApiUpdate): Update {
  return {
    id: u.id,
    slug: u.slug,
    title: u.title,
    excerpt: u.excerpt,
    category: u.category,
    rawDate: u.date,
    date: formatDate(u.date),
    color: u.color,
    image: !u.isVideo && u.imageUrl ? u.imageUrl : undefined,
    video: u.isVideo && u.imageUrl ? u.imageUrl : undefined,
    pinned: u.pinned,
  };
}

/* ── Placeholder ─────────────────────────────────────────────── */

const PLACEHOLDER_UPDATES: Update[] = [
  {
    title: 'Ibadah Paskah 2026',
    excerpt: 'Perayaan Paskah bersama seluruh jemaat BEC dengan tema "Kebangkitan dan Pengharapan Baru."',
    category: 'Ibadah',
    rawDate: '2026-03-16',
    date: '16 Mar 2026',
    color: 'oklch(0.35 0.04 175)',
    image: '/about/worship.webp',
  },
  {
    title: 'Pendaftaran KOM 100 Gelombang 2',
    excerpt: 'Pendaftaran KOM 100 gelombang kedua tahun 2026 telah dibuka. Daftar sebelum kuota penuh.',
    category: 'Pengumuman',
    rawDate: '2026-03-10',
    date: '10 Mar 2026',
    color: 'oklch(0.30 0.04 260)',
  },
  {
    title: 'Retreat Pemuda BEC 2026',
    excerpt: 'Retreat tahunan pemuda BEC di Lembang — dua hari penuh ibadah, games, dan kebersamaan.',
    category: 'Kegiatan',
    rawDate: '2026-03-05',
    date: '5 Mar 2026',
    color: 'oklch(0.32 0.04 55)',
    video: '/about/youth.webp',
  },
];

/* ── Category → form mapping ─────────────────────────────────── */

const CATEGORY_FORM_MAP: Record<string, { type: string; href: string; label: string }> = {
  'Penyerahan Anak': { type: 'child-dedication', href: '/forms/child-dedication', label: 'Daftar Penyerahan Anak' },
  'M-Class': { type: 'mclass', href: '/forms/mclass', label: 'Daftar M-Class' },
};

/* ── Stacking card offsets (same as kegiatan) ────────────────── */

const CARD_TOP_START = 80;
const CARD_TOP_STEP = 16;

/* ── Section ──────────────────────────────────────────────────── */

export default function UpdatesSection() {
  const landingData = useLandingData();

  const sectionEnabled = landingData?.updateSettings.sectionEnabled ?? true;
  const updates = (landingData?.updates as ApiUpdate[] ?? []).map(mapApiUpdate);
  const disabledForms = landingData?.formSettings.disabledForms ?? [];

  useEffect(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [landingData]);

  const displayUpdates = (!sectionEnabled ? PLACEHOLDER_UPDATES : (updates.length > 0 ? updates : PLACEHOLDER_UPDATES))
    .sort((a, b) => {
      // Pinned items always first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.rawDate.localeCompare(a.rawDate);
    })
    .slice(0, 3);
  if (sectionEnabled && displayUpdates.length === 0) return null;

  return (
    <section id="update" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-8 lg:mb-12 max-w-2xl px-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <p className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase">
            Update
          </p>
          <h2 className="mt-3 font-serif text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
            Kabar Terbaru
          </h2>
          <div className="mt-4 w-[80px] h-px bg-primary/40" />
        </motion.div>

        {/* Stacking cards */}
        <div className="relative">
          {displayUpdates.map((update, i) => {
            const href = update.slug ? `/kabar/${update.slug}` : undefined;
            const hasMedia = !!(update.image || update.video);
            const formLink = CATEGORY_FORM_MAP[update.category];
            const dateStillValid = update.rawDate >= new Date().toISOString().slice(0, 10);
            const formEnabled = formLink && !disabledForms.includes(formLink.type) && dateStillValid;
            const mediaSrc = (update.image ?? update.video)!;

            const card = (
              <div
                className="group relative overflow-hidden rounded-2xl lg:rounded-3xl min-h-[320px] sm:min-h-[300px] lg:min-h-[340px] flex flex-col sm:flex-row bg-card border border-border/60"
                style={{
                  boxShadow: '0 -4px 30px -5px rgba(0,0,0,0.08)',
                }}
              >
                {/* Image side — gradient + blur fade */}
                {hasMedia ? (
                  <div className="relative sm:w-[45%] lg:w-[50%] shrink-0 overflow-hidden">
                    <AdaptiveImage
                      src={mediaSrc}
                      className="w-full h-full grayscale transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    {/* Mobile: bottom-to-top fade */}
                    <div className="absolute inset-0 sm:hidden bg-gradient-to-t from-card from-5% via-card/60 via-40% to-transparent" />
                    {/* Desktop: right-to-left fade */}
                    <div className="absolute inset-0 hidden sm:block bg-gradient-to-l from-card from-5% via-card/60 via-40% to-transparent" />
                    {update.video && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
                          <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden>
                            <path d="M3 2.5l7 4-7 4v-8z" fill="currentColor" className="text-foreground" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:block w-2 shrink-0 rounded-l-2xl lg:rounded-l-3xl" style={{ backgroundColor: update.color }} />
                )}


                {/* Content */}
                <div className="relative z-[2] flex-1 p-6 sm:p-8 lg:p-10 flex flex-col">
                  {/* Category label */}
                  <div className="flex items-center gap-3 mb-auto">
                    <span
                      className="text-xs uppercase tracking-[0.2em] font-semibold"
                      style={{ color: update.color }}
                    >
                      {update.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums">
                      {update.date}
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="mt-6">
                    <h3
                      className="font-serif font-bold leading-[1.05] tracking-[-0.03em] text-foreground group-hover:opacity-65 transition-opacity duration-300"
                      style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
                    >
                      {update.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 max-w-xl">
                      {stripHtml(update.excerpt)}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-6 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all group-hover:text-foreground group-hover:border-border">
                      Selengkapnya
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {formEnabled && (
                      <LandingButton
                        variant="primary-sm"
                        href={formLink.href}
                        arrow
                        onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = formLink.href; }}
                      >
                        {formLink.label}
                      </LandingButton>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={update.id ?? i}
                className="sticky mb-4 last:mb-0"
                style={{ top: `${CARD_TOP_START + i * CARD_TOP_STEP}px` }}
              >
                {href ? (
                  <Link href={href} className="block">{card}</Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>

        {/* Lihat Semua */}
        <div className="mt-6 flex justify-center">
          <LandingButton variant="outline" href="/kabar" arrow>
            Lihat Semua Kabar
          </LandingButton>
        </div>

      </div>
    </section>
  );
}
