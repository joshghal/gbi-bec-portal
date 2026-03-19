'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  fadeUp,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Activity data ────────────────────────────────────────────── */

interface Activity {
  title: string;
  subtitle: string;
  day: string;
  description: string;
  tags?: string[];
  contact?: { name: string; waLink: string };
  cta?: { label: string; href: string; external?: boolean };
  aiQuestion: string;
  gradient: string;
  bg: string;
  accent: string;
}

const ACTIVITIES: Activity[] = [
  {
    title: 'Ibadah Raya',
    subtitle: 'Kebaktian Utama',
    day: 'Minggu · 17:00 WIB',
    description:
      'Ibadah utama GBI BEC setiap Minggu sore dengan pujian penyembahan dan pemberitaan Firman Tuhan. Terbuka untuk umum.',
    contact: { name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' },
    aiQuestion: 'Kapan jadwal Ibadah Raya GBI BEC dan bagaimana cara menghadirinya?',
    gradient: 'linear-gradient(140deg, oklch(0.24 0.022 68) 0%, oklch(0.17 0.016 62) 100%)',
    bg: 'oklch(0.20 0.018 65)',
    accent: 'oklch(0.82 0.035 72)',
  },
  {
    title: 'KOM',
    subtitle: 'Kehidupan Orientasi Melayani',
    day: 'Rabu & Kamis · 18:30 WIB',
    description:
      'Program pengajaran Firman Tuhan berjenjang — 4 level, 82 sesi total. Kurikulum nasional GBI, sertifikat resmi setiap level.',
    tags: ['KOM 100 · Pencari', 'KOM 200 · Pelayan', 'KOM 300 · Prajurit', 'KOM 400 · Penilik'],
    contact: { name: 'Henny', waLink: 'https://wa.me/6285860060050' },
    cta: { label: 'Lihat Materi KOM', href: '/kom' },
    aiQuestion: 'Apa itu program KOM di GBI BEC dan bagaimana cara mendaftar?',
    gradient: 'linear-gradient(150deg, oklch(0.22 0.042 252) 0%, oklch(0.16 0.030 262) 100%)',
    bg: 'oklch(0.19 0.035 257)',
    accent: 'oklch(0.80 0.055 252)',
  },
  {
    title: 'Creative Ministry',
    subtitle: 'Seni & Pujian',
    day: 'Sabtu',
    description:
      'Enam cabang pelayanan seni — dari paduan suara hingga tarian modern. Latihan setiap Sabtu di Baranangsiang.',
    tags: ['Choir Dewasa', 'Choir Anak', 'Balet', 'Tamborine', 'Banner', 'Modern Dance'],
    contact: { name: 'Ibu Fera', waLink: 'https://wa.me/6282119749869' },
    aiQuestion: 'Bagaimana cara bergabung dengan Creative Ministry GBI BEC?',
    gradient: 'linear-gradient(135deg, oklch(0.23 0.025 55) 0%, oklch(0.17 0.018 50) 100%)',
    bg: 'oklch(0.20 0.020 52)',
    accent: 'oklch(0.83 0.045 68)',
  },
  {
    title: 'COOL',
    subtitle: 'Community of Love',
    day: 'Selasa',
    description:
      'Kelompok sel untuk saling mendukung dan bertumbuh bersama dalam komunitas kecil yang hangat.',
    contact: { name: 'Ps. Agus Sulistyono', waLink: 'https://wa.me/6281910238170' },
    aiQuestion: 'Apa itu COOL di GBI BEC dan bagaimana cara bergabung dengan kelompok sel?',
    gradient: 'linear-gradient(145deg, oklch(0.21 0.038 245) 0%, oklch(0.15 0.028 252) 100%)',
    bg: 'oklch(0.18 0.032 248)',
    accent: 'oklch(0.79 0.050 245)',
  },
  {
    title: 'M-Class',
    subtitle: 'Keanggotaan Gereja',
    day: 'Jadwal diinfokan',
    description:
      'Kelas wajib untuk mendapatkan KAJ dan menjadi anggota resmi GBI BEC.',
    tags: ['M-Class', 'Baptisan', 'KAJ', 'Anggota'],
    contact: { name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' },
    cta: { label: 'Daftar M-Class', href: '/forms/mclass' },
    aiQuestion: 'Apa itu M-Class dan bagaimana cara mendaftar menjadi anggota resmi GBI BEC?',
    gradient: 'linear-gradient(155deg, oklch(0.23 0.020 72) 0%, oklch(0.17 0.015 66) 100%)',
    bg: 'oklch(0.20 0.017 69)',
    accent: 'oklch(0.82 0.035 75)',
  },
  {
    title: 'Baptisan Air',
    subtitle: 'Sakramen',
    day: 'Dua bulan sekali',
    description:
      'Baptisan selam bagi jemaat usia 12+ tahun yang telah menyelesaikan KOM 100.',
    contact: { name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' },
    cta: { label: 'Daftar Baptisan', href: '/forms/baptism' },
    aiQuestion: 'Apa syarat Baptisan Air di GBI BEC dan bagaimana cara mendaftarnya?',
    gradient: 'linear-gradient(140deg, oklch(0.21 0.040 258) 0%, oklch(0.15 0.028 265) 100%)',
    bg: 'oklch(0.18 0.033 261)',
    accent: 'oklch(0.80 0.052 258)',
  },
  {
    title: 'Penyerahan Anak',
    subtitle: 'Sakramen',
    day: 'Jadwal diinfokan',
    description:
      'Bersama kedua orang tua di hadapan jemaat sebagai komitmen mendidik anak dalam Tuhan.',
    contact: { name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' },
    cta: { label: 'Daftar', href: '/forms/child-dedication' },
    aiQuestion: 'Apa syarat Penyerahan Anak di GBI BEC dan bagaimana cara mendaftarnya?',
    gradient: 'linear-gradient(135deg, oklch(0.22 0.022 62) 0%, oklch(0.16 0.016 57) 100%)',
    bg: 'oklch(0.19 0.018 59)',
    accent: 'oklch(0.81 0.038 70)',
  },
  {
    title: 'Pemberkatan Nikah',
    subtitle: 'Sakramen',
    day: 'Daftar min. 5 bulan sebelumnya',
    description:
      'Bagi jemaat GBI BEC yang memiliki KAJ dan telah lulus KOM 100.',
    contact: { name: 'Unit Pernikahan', waLink: 'https://wa.me/6289679299098' },
    aiQuestion: 'Apa syarat Pemberkatan Nikah di GBI BEC dan bagaimana cara mendaftarnya?',
    gradient: 'linear-gradient(145deg, oklch(0.22 0.038 248) 0%, oklch(0.16 0.027 256) 100%)',
    bg: 'oklch(0.19 0.031 252)',
    accent: 'oklch(0.80 0.050 250)',
  },
];

/* ── WhatsApp icon ────────────────────────────────────────────── */

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ── Noise texture — static PNG-encoded dots, no feTurbulence GPU cost ── */
// 4×4 pixel noise tile encoded as base64 PNG (no SVG filter, no GPU shader)
const GRAIN_PNG = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")`;

/* ── Stacking card top offsets ────────────────────────────────── */
const CARD_TOP_START = 80;  // px — first card sticks here
const CARD_TOP_STEP = 16;   // px — each subsequent card sticks a bit lower

/* ── Component ────────────────────────────────────────────────── */

export default function ActivitiesSection() {
  return (
    <section id="kegiatan" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12">
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
            Kegiatan
          </p>
          <h2 className="mt-3 font-serif text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
            Kegiatan Kami
          </h2>
          <div className="mt-4 w-[80px] h-px bg-primary/40" />
        </motion.div>

        {/* Stacking cards */}
        <div className="relative">
          {ACTIVITIES.map((activity, i) => (
            <div
              key={activity.title}
              className="mb-4 last:mb-0 lg:sticky"
              style={{
                top: `${CARD_TOP_START + i * CARD_TOP_STEP}px`,
              }}
            >
              <div
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl min-h-[420px] sm:min-h-[380px] lg:min-h-[400px] flex flex-col p-6 sm:p-8 lg:p-10"
                style={{
                  background: activity.gradient,
                  boxShadow: '0 -4px 30px -5px rgba(0,0,0,0.3)',
                }}
              >

                {/* Large decorative number */}
                <span
                  className="absolute top-4 right-6 lg:top-6 lg:right-10 font-serif font-bold select-none pointer-events-none z-[1]"
                  style={{
                    fontSize: 'clamp(5rem, 12vw, 10rem)',
                    lineHeight: 1,
                    color: activity.accent,
                    opacity: 0.10,
                  }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="relative z-[2] flex flex-col flex-1">

                  {/* Subtitle label */}
                  <p
                    className="text-xs uppercase tracking-[0.2em] font-semibold mb-auto"
                    style={{ color: activity.accent, opacity: 0.7 }}
                  >
                    {activity.subtitle}
                  </p>

                  {/* Content — sits below subtitle */}
                  <div className="mt-6">

                    {/* Title + description row */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-8">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                          style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            color: activity.accent,
                          }}
                        >
                          {activity.title}
                        </h3>
                        <p
                          className="mt-2 text-sm sm:text-base font-medium"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                        >
                          {activity.day}
                        </p>
                      </div>

                      {/* Description — right on desktop */}
                      <p
                        className="hidden lg:block lg:max-w-sm text-sm leading-relaxed lg:text-right"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        {activity.description}
                      </p>
                    </div>

                    {/* Description — mobile only */}
                    <p
                      className="lg:hidden mt-3 text-sm leading-relaxed line-clamp-2"
                      style={{ color: 'rgba(255,255,255,0.60)' }}
                    >
                      {activity.description}
                    </p>

                    {/* Tags */}
                    {activity.tags && (
                      <div className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
                        {activity.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.10)',
                              color: 'rgba(255,255,255,0.70)',
                              border: '1px solid rgba(255,255,255,0.12)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Action buttons — mt-auto pins them to bottom, space falls in middle */}
                  <div className="mt-auto pt-6 flex flex-col lg:flex-row gap-2 lg:gap-2.5">

                    {activity.contact && (
                      <a
                        href={activity.contact.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          color: 'rgba(255,255,255,0.90)',
                        }}
                      >
                        <WaIcon className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />
                        Hubungi {activity.contact.name}
                      </a>
                    )}

                    <Link
                      href={`/chat?q=${encodeURIComponent(activity.aiQuestion)}`}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        color: activity.bg,
                      }}
                    >
                      Tanya AI Kami
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    {activity.cta && (
                      activity.cta.external ? (
                        <a
                          href={activity.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
                          style={{ backgroundColor: activity.accent, color: activity.bg }}
                        >
                          {activity.cta.label}
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      ) : (
                        <Link
                          href={activity.cta.href}
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
                          style={{ backgroundColor: activity.accent, color: activity.bg }}
                        >
                          {activity.cta.label}
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
