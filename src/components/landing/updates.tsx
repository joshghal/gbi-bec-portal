'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Types ─────────────────────────────────────────────────────── */

interface Update {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;       // YYYY-MM-DD from API
  color: string;
  image?: string;
  video?: string;     // thumbnail src — renders with play overlay
}

interface ApiUpdate {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;       // YYYY-MM-DD
  color: string;
  imageUrl?: string | null;
  isVideo?: boolean;
  published: boolean;
}

function toDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapApiUpdate(u: ApiUpdate): Update {
  return {
    id: u.id,
    title: u.title,
    excerpt: u.excerpt,
    category: u.category,
    date: toDisplayDate(u.date),
    color: u.color,
    image: !u.isVideo && u.imageUrl ? u.imageUrl : undefined,
    video: u.isVideo && u.imageUrl ? u.imageUrl : undefined,
  };
}

/* ── Placeholder (shown when section is disabled) ─────────────── */

const PLACEHOLDER_UPDATES: Update[] = [
  {
    title: 'Ibadah Paskah 2026',
    excerpt: 'Perayaan Paskah bersama seluruh jemaat BEC dengan tema "Kebangkitan dan Pengharapan Baru."',
    category: 'Ibadah',
    date: '16 Mar 2026',
    color: 'oklch(0.35 0.04 175)',
    image: '/about/worship.webp',
  },
  {
    title: 'Pendaftaran KOM 100 Gelombang 2',
    excerpt: 'Pendaftaran KOM 100 gelombang kedua tahun 2026 telah dibuka. Daftar sebelum kuota penuh.',
    category: 'Pengumuman',
    date: '10 Mar 2026',
    color: 'oklch(0.30 0.04 260)',
  },
  {
    title: 'Retreat Pemuda BEC 2026',
    excerpt: 'Retreat tahunan pemuda BEC di Lembang — dua hari penuh ibadah, games, dan kebersamaan.',
    category: 'Kegiatan',
    date: '5 Mar 2026',
    color: 'oklch(0.32 0.04 55)',
    video: '/about/youth.webp',
  },
];

/* ── Arrow icon ───────────────────────────────────────────────── */

function ArrowIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden
      className="transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Section ──────────────────────────────────────────────────── */

export default function UpdatesSection() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/updates/settings').then(r => r.ok ? r.json() : { sectionEnabled: true }),
      fetch('/api/updates').then(r => r.ok ? r.json() : []),
    ]).then(([settings, data]) => {
      setSectionEnabled(settings.sectionEnabled);
      setUpdates((data as ApiUpdate[]).map(mapApiUpdate));
    }).catch(() => setSectionEnabled(true));
  }, []);

  // Wait until settings are known to avoid flash
  if (sectionEnabled === null) return null;

  const displayUpdates = sectionEnabled ? updates : PLACEHOLDER_UPDATES;

  // When enabled but no published items, hide the section entirely
  if (sectionEnabled && displayUpdates.length === 0) return null;

  return (
    <section id="update" className="py-16 lg:py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Header row + top rule */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex items-end justify-between pb-5 border-b border-border">
            <div>
              <p className="text-sm tracking-[0.2em] text-muted-foreground font-medium uppercase">
                Update
              </p>
              <h2 className="mt-2 font-serif text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
                Kabar Terbaru
              </h2>
            </div>
            <span className="hidden sm:block text-sm text-muted-foreground/35 pb-0.5 font-mono">
              {displayUpdates.length} kabar
            </span>
          </div>
        </motion.div>

        {/* Editorial list — no cards, divider-separated rows */}
        <motion.div
          variants={staggerContainer(0.10, 0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {displayUpdates.map((update, i) => {
            const featured = i === 0;
            return (
              <motion.article
                key={update.id ?? i}
                variants={fadeUpSmall}
                className="group cursor-pointer border-b border-border"
              >
                <div className={`relative flex gap-5 lg:gap-8 ${featured ? 'py-10 lg:py-12' : 'py-7'}`}>

                  {/* Left accent — vertical bar (featured) or small dot (secondary) */}
                  <div className="shrink-0 flex flex-col items-center" style={{ width: 16 }}>
                    {featured ? (
                      <div
                        className="w-[2px] rounded-full mt-1"
                        style={{ backgroundColor: update.color, minHeight: 72, flex: 1 }}
                      />
                    ) : (
                      <div
                        className="w-[7px] h-[7px] rounded-full mt-[7px] shrink-0"
                        style={{ backgroundColor: update.color }}
                      />
                    )}
                  </div>

                  {/* Metadata column — desktop only */}
                  <div className="shrink-0 w-28 lg:w-36 hidden sm:flex flex-col justify-start gap-1.5 pt-0.5">
                    <span
                      className="text-[10px] uppercase tracking-[0.22em] font-semibold leading-tight"
                      style={{ color: update.color }}
                    >
                      {update.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums">
                      {update.date}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">

                    {/* Mobile metadata */}
                    <div className="flex items-center gap-3 mb-3 sm:hidden">
                      <span
                        className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                        style={{ color: update.color }}
                      >
                        {update.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 font-mono">
                        {update.date}
                      </span>
                    </div>

                    <h3
                      className={`font-serif font-bold leading-[1.07] tracking-[-0.025em] text-foreground group-hover:opacity-60 transition-opacity duration-200 ${
                        featured ? 'text-[1.9rem] lg:text-5xl' : 'text-xl lg:text-2xl'
                      }`}
                    >
                      {update.title}
                    </h3>

                    <div
                      className={`mt-3 text-muted-foreground leading-relaxed excerpt-html ${
                        featured ? 'text-base lg:text-[17px] max-w-2xl' : 'text-sm line-clamp-3'
                      }`}
                      dangerouslySetInnerHTML={{ __html: update.excerpt }}
                    />

                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/35 group-hover:text-foreground/65 transition-colors duration-200">
                      <span>Selengkapnya</span>
                      <ArrowIcon />
                    </div>
                  </div>

                  {/* Secondary: inline thumbnail — visible on all sizes */}
                  {!featured && (update.image || update.video) && (
                    <div className="shrink-0 w-[72px] sm:w-[88px] lg:w-[104px] aspect-[4/3] overflow-hidden rounded-md relative self-start mt-1">
                      <img
                        src={(update.image ?? update.video)!}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/5 transition-colors duration-300" />
                      {update.video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center shadow-sm">
                            <svg width="10" height="11" viewBox="0 0 10 11" fill="none" aria-hidden>
                              <path d="M2.5 2l6 3.5-6 3.5V2z" fill="currentColor" className="text-foreground" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Featured: desktop-only right thumbnail */}
                  {featured && (update.image || update.video) && (
                    <div className="hidden sm:block shrink-0 w-[clamp(140px,18vw,220px)] aspect-[3/2] overflow-hidden rounded-lg relative">
                      <img
                        src={(update.image ?? update.video)!}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/5 transition-colors duration-300" />
                      {update.video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-background/80 flex items-center justify-center shadow-sm">
                            <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden>
                              <path d="M3 2.5l7 4-7 4v-8z" fill="currentColor" className="text-foreground" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Featured: decorative index number (hidden when thumbnail present) */}
                  {featured && !update.image && !update.video && (
                    <span
                      className="hidden lg:block absolute right-0 top-10 font-mono text-[10px] tracking-[0.15em] text-muted-foreground/20 select-none"
                      aria-hidden
                    >
                      01
                    </span>
                  )}
                </div>

                {/* Featured: mobile full-width media — normal block BELOW the row */}
                {featured && (update.image || update.video) && (
                  <div className="sm:hidden -mt-4 pb-6 relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={(update.image ?? update.video)!}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/[0.06]" />
                    {update.video && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center shadow-sm">
                          <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden>
                            <path d="M3 2.5l7 4-7 4v-8z" fill="currentColor" className="text-foreground" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
