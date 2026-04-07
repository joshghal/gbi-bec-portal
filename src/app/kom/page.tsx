import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Phone, ExternalLink, ChevronRight, BookOpen, Award, GraduationCap, Globe } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Materi KOM',
  description: 'Program Kehidupan Orientasi Melayani (KOM) — pengajaran Firman Tuhan berjenjang di GBI BEC. 4 level, 82 sesi, sertifikat resmi GBI.',
  keywords: ['KOM', 'Kehidupan Orientasi Melayani', 'GBI BEC', 'materi gereja', 'kurikulum GBI', 'kelas rohani Bandung'],
  alternates: { canonical: '/kom' },
  openGraph: {
    title: 'Materi KOM',
    description: 'Program pengajaran Firman Tuhan berjenjang — 4 level, 82 sesi total. Kurikulum nasional GBI.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Level data ───────────────────────────────────────────────── */

const LEVELS = [
  {
    level: 100,
    title: 'Pencari Tuhan',
    subtitle: 'The Seeker',
    sessions: 27,
    description: 'Dasar-dasar kekristenan, pertumbuhan iman, mengenal Allah, dan kehidupan yang memberi dampak.',
    series: ['Dasar-dasar Kekristenan', 'Kekristenan yang Bertumbuh', 'Mengenal Allah', 'Kehidupan yang Memberi Dampak'],
    prerequisite: null,
    gradient: 'from-green-950 via-green-900 to-slate-900',
    accent: 'text-green-300',
    accentMuted: 'text-green-400/60',
    badge: 'bg-green-400/15 text-green-200 border-green-400/20',
    dot: 'bg-green-400',
    line: 'from-green-400/60',
    glass: '/glass-one.webp',
    number: '01',
  },
  {
    level: 200,
    title: 'Pelayan Tuhan',
    subtitle: 'The Servant',
    sessions: 23,
    description: 'Karakter pelayan Tuhan, pengetahuan Alkitab, dan prinsip kepemimpinan dalam pelayanan.',
    series: ['Karakter Pelayan Tuhan', 'Pengetahuan Alkitab', 'Kepemimpinan Pelayanan'],
    prerequisite: 'Setelah lulus KOM 100',
    gradient: 'from-blue-950 via-blue-900 to-slate-900',
    accent: 'text-blue-300',
    accentMuted: 'text-blue-400/60',
    badge: 'bg-blue-400/15 text-blue-200 border-blue-400/20',
    dot: 'bg-blue-400',
    line: 'from-blue-400/60',
    glass: '/glass-second.webp',
    number: '02',
  },
  {
    level: 300,
    title: 'Prajurit Tuhan',
    subtitle: 'The Soldier',
    sessions: 16,
    description: 'Peperangan rohani, lima karakteristik pelayanan, dan menegakkan Kerajaan Allah di bumi.',
    series: ['Peperangan Rohani', 'Lima Karakteristik Pelayanan', 'Menegakkan Kerajaan Allah'],
    prerequisite: 'Setelah lulus KOM 200',
    gradient: 'from-red-950 via-red-900 to-slate-900',
    accent: 'text-red-300',
    accentMuted: 'text-red-400/60',
    badge: 'bg-red-400/15 text-red-200 border-red-400/20',
    dot: 'bg-red-400',
    line: 'from-red-400/60',
    glass: '/glass-third.webp',
    number: '03',
  },
  {
    level: 400,
    title: 'Penilik Tuhan',
    subtitle: 'The Steward',
    sessions: 16,
    description: 'Kepemimpinan gereja, penatalayanan, panggilan hidup, dan menjadi pengubah masa depan.',
    series: ['Kepemimpinan Gereja', 'Penatalayanan', 'Destiny Driven'],
    prerequisite: 'Setelah lulus KOM 300',
    gradient: 'from-gray-900 via-gray-800 to-slate-900',
    accent: 'text-amber-200',
    accentMuted: 'text-amber-300/50',
    badge: 'bg-amber-400/40 text-amber-200 border-amber-400/15',
    dot: 'bg-amber-300',
    line: 'from-amber-300/60',
    glass: '/glass-fourth.webp',
    number: '04',
  },
];

const INFO_ITEMS = [
  { icon: BookOpen, title: 'Berjenjang', desc: 'Harus lulus level sebelumnya untuk melanjutkan' },
  { icon: Award, title: 'Sertifikat KOM 100', desc: 'Diperlukan untuk surat baptis & pemberkatan nikah' },
  { icon: GraduationCap, title: 'Kelulusan', desc: 'Kehadiran minimum, tugas, dan ujian akhir' },
  { icon: Globe, title: 'Berlaku Nasional', desc: 'Sertifikat berlaku di seluruh GBI Indonesia' },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

/* ── Page ──────────────────────────────────────────────────────── */

export default function KomPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Materi KOM', item: `${siteUrl}/kom` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Program KOM — Kehidupan Orientasi Melayani',
      description: 'Program pengajaran Firman Tuhan berjenjang di GBI BEC — 4 level, 82 sesi total. Kurikulum nasional GBI.',
      numberOfItems: 4,
      itemListElement: LEVELS.map((lvl, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Course',
          name: `KOM ${lvl.level} — ${lvl.title}`,
          description: lvl.description,
          url: `${siteUrl}/kom/${lvl.level}`,
          provider: {
            '@type': 'Church',
            name: 'GBI Baranangsiang Evening Church',
            url: siteUrl,
          },
        },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <Image src="/logo.png" alt="BEC" width={32} height={32} className="w-8 h-8 object-contain" />
          <div>
            <p className="font-semibold text-sm leading-tight">Materi KOM</p>
            <p className="text-[10px] text-muted-foreground">Kehidupan Orientasi Melayani</p>
          </div>
        </div>
        <a href="https://bit.ly/DaftarKOMBarsiBEC" target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1.5 text-xs">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daftar Sekarang</span>
            <span className="sm:hidden">Daftar</span>
          </Button>
        </a>
      </header>

      {/* Hero — warm, single tone */}
      <div className="relative bg-[#2a2118] overflow-hidden">

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-20 lg:pb-28 text-center">
          <p className="text-[10px] tracking-[0.25em] text-white/30 font-medium uppercase">
            Kurikulum Nasional GBI
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] text-white">
            Kehidupan<br />
            <span className="text-white/50">Orientasi Melayani</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-white/60 leading-relaxed max-w-md mx-auto">
            Materi KOM adalah program pengajaran Firman Tuhan berjenjang di GBI BEC — kelas rohani di Bandung
            dengan sertifikat resmi kurikulum nasional GBI.
          </p>

          {/* Stats */}
          <div className="mt-10 inline-flex items-center gap-6 sm:gap-10 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-8 py-5">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">4</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Level</p>
            </div>
            <div className="w-px h-10 bg-white/40" />
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">82</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Sesi</p>
            </div>
            <div className="w-px h-10 bg-white/40" />
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-white">Gratis</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Biaya</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Section label */}
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground font-medium uppercase">Perjalanan</p>
          <p className="mt-1 font-serif text-2xl font-bold tracking-[-0.02em]">4 Level KOM</p>
        </div>

        {/* Level cards — staggered layout */}
        <div className="space-y-6">
          {LEVELS.map((lvl, i) => (
            <Link
              key={lvl.level}
              href={`/kom/${lvl.level}`}
              className="group block"
            >
              <div className={`relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br ${lvl.gradient} border border-white/[0.06] hover:border-white/15 transition-all duration-500 hover:shadow-[0_24px_48px_rgba(0,0,0,0.25)]`}>
                {/* Glass accent */}
                <div className="absolute -bottom-8 -right-8 w-44 h-44 md:w-60 md:h-60 opacity-15 pointer-events-none">
                  <Image src={lvl.glass} alt="" fill className="object-contain" />
                </div>

                {/* Large decorative number */}
                <span
                  className="absolute top-4 right-5 lg:top-5 lg:right-8 font-serif font-bold select-none pointer-events-none"
                  style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 1, color: 'rgba(255,255,255,0.03)' }}
                  aria-hidden="true"
                >
                  {lvl.number}
                </span>

                <div className="relative z-10 p-6 sm:p-7 lg:p-8">
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${lvl.accent}`}>
                        KOM {lvl.level}
                      </p>
                      {lvl.prerequisite && (
                        <>
                          <span className="text-white/40">·</span>
                          <p className="text-[10px] text-white/25">{lvl.prerequisite}</p>
                        </>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${lvl.badge}`}>
                      {lvl.sessions} sesi
                    </span>
                  </div>

                  {/* Title + subtitle */}
                  <div className="mt-5 sm:mt-6">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white group-hover:opacity-80 transition-opacity duration-300">
                      {lvl.title}
                    </h3>
                    <p className="text-xs text-white/50 italic mt-1">{lvl.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm text-white/80 leading-relaxed max-w-lg">
                    {lvl.description}
                  </p>

                  {/* Series tags + arrow */}
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {lvl.series.map((s) => (
                        <span
                          key={s}
                          className="text-[12px] px-1.5 py-0.5 rounded text-white/40"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 shrink-0 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-16 rounded-2xl border border-[#e8dcc4] bg-[#fdf6ec] p-6 sm:p-8">
          <p className="font-serif text-lg font-bold text-[#7a5c2e] mb-6">Informasi Penting</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {INFO_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f0e4ce] flex items-center justify-center shrink-0">
                  <item.icon className="w-4.5 h-4.5 text-[#7a5c2e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#7a5c2e]">{item.title}</p>
                  <p className="text-xs text-[#8b7355] leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="font-serif text-2xl font-bold tracking-[-0.02em]">Mulai Perjalanan KOM</p>
          <p className="text-sm text-muted-foreground mt-2">Pendaftaran gratis — mulai dari KOM 100</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <a href="https://bit.ly/DaftarKOMBarsiBEC" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 px-8">
                <ExternalLink className="w-4 h-4" />
                Daftar Sekarang — Gratis
              </Button>
            </a>
            <a href="https://wa.me/6285860060050" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <Phone className="w-4 h-4" />
                Hubungi Henny
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
