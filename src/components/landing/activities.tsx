'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LandingButton } from '@/components/landing/landing-button';
import { useLandingData } from '@/components/landing/landing-loader';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  fadeUp,
  viewportOnce,
} from '@/components/landing/animations';

/* ── Types ────────────────────────────────────────────────────── */

interface Contact {
  name: string;
  waLink: string;
}

interface Activity {
  title: string;
  subtitle: string;
  day: string;
  description: string;
  longDescription?: string;
  tags?: string[];
  contacts?: Contact[];
  cta?: { label: string; href: string; external?: boolean };
  aiQuestion: string;
}

interface ApiActivity {
  id?: string;
  title: string;
  subtitle: string;
  day: string;
  description: string;
  longDescription?: string;
  tags?: string[];
  contacts?: Contact[];
  // legacy single-contact fields
  contactName?: string;
  contactWaLink?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  aiQuestion: string;
  enabled: boolean;
  order: number;
}

function mapApiActivity(a: ApiActivity): Activity {
  // Support both new `contacts` array and legacy single-contact fields
  let contacts: Contact[] | undefined = a.contacts?.filter(c => c.name && c.waLink);
  if ((!contacts || contacts.length === 0) && a.contactName && a.contactWaLink) {
    contacts = [{ name: a.contactName, waLink: a.contactWaLink }];
  }

  return {
    title: a.title,
    subtitle: a.subtitle,
    day: a.day,
    description: a.description,
    longDescription: a.longDescription || undefined,
    tags: a.tags,
    contacts: contacts && contacts.length > 0 ? contacts : undefined,
    cta: a.ctaLabel && a.ctaHref ? { label: a.ctaLabel, href: a.ctaHref, external: a.ctaExternal } : undefined,
    aiQuestion: a.aiQuestion,
  };
}

const FALLBACK_ACTIVITIES: Activity[] = [
  {
    title: 'Ibadah Raya',
    subtitle: 'Kebaktian Utama',
    day: 'Minggu · 17:00 WIB',
    description: 'Ibadah utama GBI BEC setiap Minggu sore dengan pujian penyembahan dan pemberitaan Firman Tuhan. Terbuka untuk umum.',
    contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    aiQuestion: 'Kapan jadwal Ibadah Raya GBI BEC dan bagaimana cara menghadirinya?',
  },
  {
    title: 'KOM',
    subtitle: 'Kehidupan Orientasi Melayani',
    day: 'Rabu & Kamis · 18:30 WIB',
    description: 'Program pengajaran Firman Tuhan berjenjang — 4 level, 82 sesi total. Kurikulum nasional GBI, sertifikat resmi setiap level.',
    tags: ['KOM 100 · Pencari', 'KOM 200 · Pelayan', 'KOM 300 · Prajurit', 'KOM 400 · Penilik'],
    contacts: [{ name: 'Henny', waLink: 'https://wa.me/6285860060050' }],
    cta: { label: 'Lihat Materi KOM', href: '/kom' },
    aiQuestion: 'Apa itu program KOM di GBI BEC dan bagaimana cara mendaftar?',
  },
  {
    title: 'Creative Ministry',
    subtitle: 'Seni & Pujian',
    day: 'Sabtu',
    description: 'Enam cabang pelayanan seni — dari paduan suara hingga tarian modern. Latihan setiap Sabtu di Baranangsiang.',
    tags: ['Choir Dewasa', 'Choir Anak', 'Balet', 'Tamborine', 'Banner', 'Modern Dance'],
    contacts: [{ name: 'Ibu Fera', waLink: 'https://wa.me/6282119749869' }],
    aiQuestion: 'Bagaimana cara bergabung dengan Creative Ministry GBI BEC?',
  },
  {
    title: 'COOL',
    subtitle: 'Community of Love',
    day: 'Selasa',
    description: 'Kelompok sel untuk saling mendukung dan bertumbuh bersama dalam komunitas kecil yang hangat.',
    contacts: [{ name: 'Ps. Agus Sulistyono', waLink: 'https://wa.me/6281910238170' }],
    aiQuestion: 'Apa itu COOL di GBI BEC dan bagaimana cara bergabung dengan kelompok sel?',
  },
  {
    title: 'M-Class',
    subtitle: 'Keanggotaan Gereja',
    day: 'Jadwal diinfokan',
    description: 'Kelas wajib untuk mendapatkan KAJ dan menjadi anggota resmi GBI BEC.',
    tags: ['M-Class', 'Baptisan', 'KAJ', 'Anggota'],
    contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    cta: { label: 'Daftar M-Class', href: '/forms/mclass' },
    aiQuestion: 'Apa itu M-Class dan bagaimana cara mendaftar menjadi anggota resmi GBI BEC?',
  },
  {
    title: 'Baptisan Air',
    subtitle: 'Sakramen',
    day: 'Dua bulan sekali',
    description: 'Baptisan selam bagi jemaat usia 12+ tahun yang telah menyelesaikan KOM 100.',
    contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    cta: { label: 'Daftar Baptisan', href: '/forms/baptism' },
    aiQuestion: 'Apa syarat Baptisan Air di GBI BEC dan bagaimana cara mendaftarnya?',
  },
  {
    title: 'Penyerahan Anak',
    subtitle: 'Sakramen',
    day: 'Jadwal diinfokan',
    description: 'Bersama kedua orang tua di hadapan jemaat sebagai komitmen mendidik anak dalam Tuhan.',
    contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    cta: { label: 'Daftar', href: '/forms/child-dedication' },
    aiQuestion: 'Apa syarat Penyerahan Anak di GBI BEC dan bagaimana cara mendaftarnya?',
  },
  {
    title: 'Pemberkatan Nikah',
    subtitle: 'Sakramen',
    day: 'Daftar min. 5 bulan sebelumnya',
    description: 'Bagi jemaat GBI BEC yang memiliki KAJ dan telah lulus KOM 100.',
    contacts: [{ name: 'Unit Pernikahan', waLink: 'https://wa.me/6289679299098' }],
    aiQuestion: 'Apa syarat Pemberkatan Nikah di GBI BEC dan bagaimana cara mendaftarnya?',
  },
];

/* ── Card color themes — alternate brown / navy by position ─── */

const CARD_THEMES = [
  { gradient: 'linear-gradient(140deg, oklch(0.24 0.022 68) 0%, oklch(0.17 0.016 62) 100%)', bg: 'oklch(0.20 0.018 65)', accent: 'oklch(0.82 0.035 72)' },
  { gradient: 'linear-gradient(150deg, oklch(0.22 0.042 252) 0%, oklch(0.16 0.030 262) 100%)', bg: 'oklch(0.19 0.035 257)', accent: 'oklch(0.80 0.055 252)' },
] as const;

/* ── COOL group cards for modal ──────────────────────────────── */

function CoolGroupCards({ groups, kabid }: { groups: any[]; kabid: any }) {
  // Group by area
  const areaMap: Record<string, any[]> = {};
  for (const g of groups) {
    const area = g.area || 'Lainnya';
    if (!areaMap[area]) areaMap[area] = [];
    areaMap[area].push(g);
  }

  return (
    <div className="space-y-4">
      {/* Intro */}
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
        Kelompok sel untuk saling mendukung dan bertumbuh bersama. Saat ini ada <strong className="text-white/95">{groups.length} kelompok</strong> COOL aktif di berbagai daerah.
      </p>

      {/* Kabid */}
      {kabid?.name && (
        <div
          className="flex items-center gap-3 rounded-lg px-3.5 py-2.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>Kabid COOL</p>
            <p className="text-sm font-semibold text-white/90">{kabid.name}</p>
          </div>
          {kabid.phone && (
            <a
              href={`https://wa.me/${kabid.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
            >
              Hubungi
            </a>
          )}
        </div>
      )}

      {/* Groups by area */}
      {Object.entries(areaMap).map(([area, areaGroups]) => (
        <div key={area}>
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {area}
          </p>
          <div className="space-y-1.5">
            {areaGroups.map((g: any) => (
              <div
                key={g.name}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{g.name}</p>
                  {g.ketua?.name && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                      Ketua: {g.ketua.name}
                    </p>
                  )}
                </div>
                {g.ketua?.phone && (
                  <a
                    href={`https://wa.me/${g.ketua.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}
                  >
                    Hubungi
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Untuk bergabung, hubungi ketua COOL di daerah terdekat.
      </p>
    </div>
  );
}

/* ── Stacking card top offsets ────────────────────────────────── */
const CARD_TOP_START = 80;  // px — first card sticks here
const CARD_TOP_STEP = 16;   // px — each subsequent card sticks a bit lower

/* ── Detail modal ────────────────────────────────────────────── */

/* Detail modal is rendered inline using Dialog component — see bottom of ActivitiesSection */

/* ── Component ────────────────────────────────────────────────── */

export default function ActivitiesSection() {
  const landingData = useLandingData();
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  const sectionEnabled = landingData?.activitySettings.sectionEnabled ?? true;
  const mapped = (landingData?.activities as ApiActivity[] ?? []).map(mapApiActivity);

  const displayActivities = !sectionEnabled ? FALLBACK_ACTIVITIES : (mapped.length > 0 ? mapped : FALLBACK_ACTIVITIES);
  if (displayActivities.length === 0) return null;

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
          {displayActivities.map((activity, i) => {
            const theme = CARD_THEMES[i % 2];
            return (
            <div
              key={activity.title}
              className="sticky mb-4 last:mb-0"
              style={{
                top: `${CARD_TOP_START + i * CARD_TOP_STEP}px`,
              }}
            >
              <div
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl min-h-[420px] sm:min-h-[380px] lg:min-h-[400px] flex flex-col p-6 sm:p-8 lg:p-10"
                style={{
                  background: theme.gradient,
                  boxShadow: '0 -4px 30px -5px rgba(0,0,0,0.3)',
                }}
              >

                {/* Large decorative number */}
                <span
                  className="absolute top-4 right-6 lg:top-6 lg:right-10 font-serif font-bold select-none pointer-events-none z-[1]"
                  style={{
                    fontSize: 'clamp(5rem, 12vw, 10rem)',
                    lineHeight: 1,
                    color: theme.accent,
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
                    style={{ color: theme.accent, opacity: 0.7 }}
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
                            color: theme.accent,
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
                      {activity.longDescription ? (
                        <button
                          type="button"
                          onClick={() => setDetailIndex(i)}
                          className="hidden lg:block lg:max-w-sm lg:text-right cursor-pointer"
                        >
                          <p className="text-sm leading-relaxed " style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {activity.description}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-opacity group-hover/desc:opacity-80" style={{ color: theme.accent }}>
                            Selengkapnya
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        <p className="hidden lg:block lg:max-w-sm text-sm leading-relaxed lg:text-right" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {activity.description}
                        </p>
                      )}
                    </div>

                    {/* Description — mobile only */}
                    {activity.longDescription ? (
                      <button
                        type="button"
                        onClick={() => setDetailIndex(i)}
                        className="lg:hidden mt-3 text-left cursor-pointer"
                      >
                        <p className="text-sm leading-relaxed " style={{ color: 'rgba(255,255,255,0.60)' }}>
                          {activity.description}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-opacity group-hover/desc:opacity-80" style={{ color: theme.accent }}>
                          Selengkapnya
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                    ) : (
                      <p className="lg:hidden mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        {activity.description}
                      </p>
                    )}

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
                    {activity.contacts?.map((contact) => (
                      <LandingButton key={contact.waLink} variant="glass" href={contact.waLink} external whatsapp className="w-full lg:w-auto">
                        Hubungi {contact.name}
                      </LandingButton>
                    ))}

                    <LandingButton variant="glass-light" href={`/chat?q=${encodeURIComponent(activity.aiQuestion)}`} arrow darkTextColor={theme.bg} className="w-full lg:w-auto">
                      Tanya AI Kami
                    </LandingButton>

                    {activity.cta && (
                      <LandingButton
                        variant="glass-light"
                        href={activity.cta.href}
                        external={activity.cta.external}
                        arrow
                        className="w-full lg:w-auto"
                        darkTextColor={theme.bg}
                      >
                        {activity.cta.label}
                      </LandingButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={detailIndex !== null} onOpenChange={open => { if (!open) setDetailIndex(null); }}>
        {detailIndex !== null && displayActivities[detailIndex] && (() => {
          const activity = displayActivities[detailIndex];
          const theme = CARD_THEMES[detailIndex % 2];
          return (
            <DialogContent
              className="sm:max-w-lg ring-0 text-white [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:bg-white/10"
              style={{ background: theme.gradient }}
            >
              <DialogHeader className="p-4 pb-2">
                <DialogDescription className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: theme.accent, opacity: 0.7 }}>
                  {activity.subtitle}
                </DialogDescription>
                <DialogTitle className="font-serif text-2xl font-bold leading-[1.1] tracking-[-0.02em]" style={{ color: theme.accent }}>
                  {activity.title}
                </DialogTitle>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{activity.day}</p>
              </DialogHeader>

              <DialogBody className="space-y-4">
                {/* COOL groups — render as cards if this is the COOL activity */}
                {activity.title === 'COOL' && landingData?.coolGroups && landingData.coolGroups.length > 0 ? (
                  <CoolGroupCards groups={landingData.coolGroups} kabid={landingData.coolKabid} />
                ) : activity.longDescription ? (
                  <div
                    className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-white/95"
                    style={{ color: 'rgba(255,255,255,0.80)' }}
                    dangerouslySetInnerHTML={{ __html: activity.longDescription }}
                  />
                ) : null}

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.14)',
                          color: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(255,255,255,0.18)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </DialogBody>

              <DialogFooter className="flex-col gap-2 sm:flex-col !bg-transparent !border-t-white/10">
                {activity.contacts?.map((contact) => (
                  <LandingButton key={contact.waLink} variant="glass" href={contact.waLink} external whatsapp className="w-full">
                    Hubungi {contact.name}
                  </LandingButton>
                ))}

                <LandingButton variant="glass-light" href={`/chat?q=${encodeURIComponent(activity.aiQuestion)}`} arrow darkTextColor={theme.bg} className="w-full">
                  Tanya AI Kami
                </LandingButton>

                {activity.cta && (
                  <LandingButton variant="glass-light" href={activity.cta.href} external={activity.cta.external} arrow darkTextColor={theme.bg} className="w-full">
                    {activity.cta.label}
                  </LandingButton>
                )}
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>
    </section>
  );
}
