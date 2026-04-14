import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Sparkles, ArrowRight } from 'lucide-react';
import ActivityHero from '@/components/kegiatan/activity-hero';
import FAQAccordion from '@/components/kegiatan/faq-accordion';
import Nav from '@/components/landing/nav';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import GrainOverlay from '@/components/grain-overlay';

// Force static generation at build time — zero dynamic data.
// Matches /ibadah-raya, /kom, /mclass.
export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export const metadata: Metadata = {
  title: 'Baptisan Air — Baptisan Selam GBI BEC',
  description:
    'Baptisan selam (full immersion) di GBI BEC Bandung — untuk jemaat usia 12 tahun ke atas. Diselenggarakan setiap dua bulan sekali, gratis, sesuai praktik Alkitab.',
  keywords: [
    'baptisan air',
    'baptisan selam',
    'baptisan gereja Bandung',
    'GBI BEC baptisan',
    'full immersion baptism',
    'baptisan kristen Bandung',
    'GBI Sukawarna baptisan',
    'syarat baptisan GBI',
  ],
  alternates: { canonical: '/baptisan' },
  openGraph: {
    title: 'Baptisan Air — GBI BEC',
    description:
      'Baptisan selam bagi jemaat usia 12+ di GBI Baranangsiang Evening Church Bandung. Dua bulan sekali, gratis, terbuka untuk semua.',
    url: `${siteUrl}/baptisan`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Timeline / checklist ─────────────────────────────────────── */

const CHECKLIST = [
  {
    title: 'Mengisi formulir pendaftaran',
    desc: 'Daftar melalui formulir online — pilih tanggal baptisan yang tersedia. Pendaftaran ditutup beberapa hari sebelum pelaksanaan.',
  },
  {
    title: 'Pas foto berwarna 3×4',
    desc: 'Dua lembar, latar belakang merah atau biru. Jangan disteples — cukup dibawa lepas di dalam amplop.',
  },
  {
    title: 'Baju ganti & perlengkapan mandi',
    desc: 'Bawa handuk, pakaian ganti, serta perlengkapan mandi. Pakaian saat dibaptis bebas rapi dan sopan — jubah baptis disediakan gereja.',
  },
  {
    title: 'Hadir satu jam lebih awal',
    desc: 'Datang tepat waktu untuk registrasi ulang, pakai jubah baptis, dan briefing singkat dari pendeta atau diaken.',
  },
];

const INFO_ITEMS = [
  {
    title: 'Usia minimal 12 tahun',
    desc: 'Baptisan air di GBI BEC terbuka bagi jemaat berusia 12 tahun ke atas. Tidak ada biaya pendaftaran — sepenuhnya gratis.',
  },
  {
    title: 'Jadwal dua bulan sekali',
    desc: 'Baptisan diselenggarakan setiap dua bulan sekali. Apabila ada perubahan jadwal, akan diinformasikan kembali melalui website dan tim pelayanan.',
  },
  {
    title: 'Surat pernyataan non-Kristen',
    desc: 'Calon jemaat dari latar belakang kepercayaan non-Kristen wajib melampirkan surat pernyataan di atas meterai Rp 10.000 yang menyatakan tidak ada paksaan, beserta fotocopy KTP.',
  },
  {
    title: 'Sertifikat baptis',
    desc: 'Surat baptis dapat diambil di diaken BEC setelah mengikuti KOM 100. Surat baptis yang hilang tidak dapat diterbitkan kembali — gereja hanya memberikan surat keterangan.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu Baptisan Air di GBI BEC?',
    a: 'Baptisan Air di GBI BEC dilakukan secara selam (full immersion) — seluruh tubuh dicelupkan ke dalam air, sesuai dengan praktik baptisan dalam Alkitab. Baptisan selam berbeda dengan baptisan percik yang hanya memercikkan air ke kepala.',
  },
  {
    q: 'Berapa usia minimal untuk ikut Baptisan Air?',
    a: 'Usia minimal 12 tahun. Baptisan terbuka untuk semua jemaat yang sudah memahami komitmen iman kepada Yesus Kristus.',
  },
  {
    q: 'Kapan jadwal Baptisan Air?',
    a: 'Baptisan diselenggarakan setiap dua bulan sekali. Jadwal terbaru tersedia langsung saat pengisian formulir pendaftaran. Apabila ada perubahan jadwal, akan diinformasikan kembali.',
  },
  {
    q: 'Apakah ada biaya untuk Baptisan Air?',
    a: 'Tidak. Baptisan air di GBI BEC tidak dipungut biaya (gratis) — sama seperti seluruh kegiatan dan layanan gereja.',
  },
  {
    q: 'Apa saja yang perlu saya bawa saat hari Baptisan?',
    a: 'Pas foto berwarna 3×4 sebanyak dua lembar (latar merah atau biru, jangan disteples), baju ganti dan perlengkapan mandi, serta masker bila diperlukan. Pakaian saat dibaptis bebas rapi dan sopan. Hadir satu jam sebelum waktu pelaksanaan untuk registrasi dan pakai jubah baptis.',
  },
  {
    q: 'Saya berasal dari kepercayaan non-Kristen, apa ada syarat tambahan?',
    a: 'Ya. Bagi calon jemaat dari latar belakang kepercayaan non-Kristen, wajib mengisi surat pernyataan di atas meterai Rp 10.000 yang menyatakan bahwa baptisan dilakukan atas kemauan sendiri, bukan karena paksaan dari pihak manapun. Surat pernyataan memuat nama lengkap, tempat/tanggal lahir, alamat, dan ditandatangani di Bandung. Lampirkan juga fotocopy KTP saat pendaftaran.',
  },
  {
    q: 'Apakah saya harus sudah lulus KOM 100 untuk dibaptis?',
    a: 'Tidak. Untuk pelaksanaan baptisan itu sendiri, kelulusan KOM 100 tidak disyaratkan. Namun, surat baptis (sertifikat) baru dapat diambil setelah jemaat menyelesaikan KOM 100. KOM 100 juga menjadi syarat untuk pemberkatan nikah dan pendaftaran Kartu Anggota Jemaat (KAJ).',
  },
  {
    q: 'Saya sudah pernah dibaptis selam di gereja lain, perlu dibaptis ulang?',
    a: 'Tidak. Jemaat yang sudah dibaptis selam di gereja lain tetap diakui baptisannya oleh GBI. Kamu bisa langsung mengurus keanggotaan (KAJ) dengan melampirkan surat baptis dari gereja sebelumnya.',
  },
  {
    q: 'Bagaimana kalau surat baptis saya hilang?',
    a: 'Surat baptis yang hilang tidak dapat diterbitkan kembali. Namun, gereja dapat memberikan surat keterangan yang menyatakan bahwa jemaat tersebut pernah dibaptis di GBI BEC. Hubungi Call Centre BEC untuk proses penerbitan surat keterangan.',
  },
  {
    q: 'Bagaimana cara mendaftar Baptisan Air?',
    a: 'Pendaftaran dilakukan melalui formulir online di halaman [Daftar Baptisan](/formulir/baptis). Untuk pertanyaan lanjutan, hubungi [Call Centre BEC](https://wa.me/6287823420950) di WhatsApp 0878-2342-0950.',
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function BaptisanPage() {
  const flattenMarkdownLinks = (s: string) =>
    s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  const organizer = {
    '@type': 'Church',
    name: 'GBI Baranangsiang Evening Church',
    alternateName: 'GBI BEC',
    url: siteUrl,
    parentOrganization: {
      '@type': 'Church',
      name: 'Gereja Bethel Indonesia',
      alternateName: 'GBI',
      url: 'https://www.gbi.or.id',
    },
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Baptisan Air',
          item: `${siteUrl}/baptisan`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Baptisan Air — Baptisan Selam GBI BEC',
      description:
        'Informasi lengkap baptisan selam di GBI BEC Bandung — syarat, jadwal, dokumen, dan cara pendaftaran.',
      url: `${siteUrl}/baptisan`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#tentang h2', '#tentang p'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Baptisan Air GBI BEC',
      description:
        'Baptisan selam (full immersion) di GBI Baranangsiang Evening Church. Bagi jemaat usia 12 tahun ke atas. Diselenggarakan setiap dua bulan sekali.',
      url: `${siteUrl}/baptisan`,
      inLanguage: 'id-ID',
      eventSchedule: {
        '@type': 'Schedule',
        repeatFrequency: 'P2M',
        scheduleTimezone: 'Asia/Jakarta',
        description: 'Setiap dua bulan sekali',
      },
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'GBI Baranangsiang Evening Church',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jl. Baranang Siang No.8',
          addressLocality: 'Bandung',
          addressRegion: 'Jawa Barat',
          postalCode: '40113',
          addressCountry: 'ID',
        },
      },
      organizer,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/formulir/baptis`,
      },
      isAccessibleForFree: true,
      typicalAgeRange: '12-',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: 'GBI Baranangsiang Evening Church',
      alternateName: 'GBI BEC',
      url: siteUrl,
      telephone: '+6287823420950',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Baranang Siang No.8',
        addressLocality: 'Bandung',
        addressRegion: 'Jawa Barat',
        postalCode: '40113',
        addressCountry: 'ID',
      },
      sameAs: [
        'https://www.instagram.com/sukawarna.bec/',
        'https://www.youtube.com/@gbibaranangsiangsukawarna7008',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: 'id-ID',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: flattenMarkdownLinks(a),
          inLanguage: 'id-ID',
        },
      })),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GrainOverlay />

      <Nav hideLinks />

      {/* Hero */}
      <ActivityHero title="Baptisan" image="/kegiatan/baptisan.webp" />

      {/* Big statement — magazine-style with sticky aside */}
      <section
        id="tentang"
        className="max-w-6xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14 pb-16 lg:pb-24"
      >
        <nav aria-label="Breadcrumb" className="mb-8 lg:mb-12">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-foreground/50">
            <li>
              <Link
                href="/"
                className="hover:text-foreground/80 transition-colors underline-offset-2 hover:underline"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-foreground/30">/</li>
            <li aria-current="page" className="text-foreground/70">
              Baptisan Air
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Sebuah tanda, sebuah komitmen.
        </h2>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Jadwal
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">2 bulan sekali</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Usia
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">12+ tahun</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Metode
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Selam</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Biaya
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Sertifikat
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Setelah KOM 100
              </dd>
            </div>
          </dl>

          <nav aria-label="Navigasi halaman">
            <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
              Di halaman ini
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
              <li>
                <a
                  href="#persiapan"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Persiapan
                </a>
              </li>
              <li aria-hidden="true" className="text-foreground/25">·</li>
              <li>
                <a
                  href="#info"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Hal penting
                </a>
              </li>
              <li aria-hidden="true" className="text-foreground/25">·</li>
              <li>
                <a
                  href="#daftar"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Pendaftaran
                </a>
              </li>
              <li aria-hidden="true" className="text-foreground/25">·</li>
              <li>
                <a
                  href="#faq"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Two-column: labeled prose left, sticky aside right (desktop only) */}
        <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-16">
          <div className="space-y-10 max-w-2xl">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Apa itu
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Baptisan Air di GBI BEC dilakukan secara{' '}
                <strong className="font-medium text-foreground/90">
                  selam penuh
                </strong>{' '}
                (full immersion) — seluruh tubuh dicelupkan ke dalam air, sesuai
                praktik baptisan dalam Alkitab. Ini berbeda dari baptisan percik
                yang hanya memercikkan air ke kepala.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Makna
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Baptisan adalah{' '}
                <em className="text-foreground/60">
                  tanda lahir baru
                </em>{' '}
                — simbol mati bersama Kristus dan bangkit bersama-Nya dalam
                hidup yang baru. Langkah ini adalah pengakuan iman di hadapan
                jemaat, bukan syarat keselamatan, tapi buah dari keselamatan
                yang sudah diterima.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Terbuka untuk semua jemaat berusia{' '}
                <strong className="font-medium text-foreground/90">
                  12 tahun ke atas
                </strong>
                . Jemaat yang sudah dibaptis selam di gereja lain tidak perlu
                dibaptis ulang — baptisannya tetap diakui oleh GBI. Bagi calon
                jemaat dari latar belakang kepercayaan non-Kristen, ada satu
                syarat tambahan berupa surat pernyataan bermeterai.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Sertifikat & KOM 100
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Surat baptis diberikan setelah jemaat menyelesaikan{' '}
                <Link
                  href="/kom/100"
                  className="text-foreground/85 underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/70 transition-colors"
                >
                  KOM 100
                </Link>
                . Sertifikat ini juga menjadi syarat untuk pemberkatan nikah dan
                pendaftaran Kartu Anggota Jemaat (KAJ) — sehingga baptisan dan
                KOM 100 sering berjalan beriringan dalam perjalanan keanggotaan.
              </p>
            </div>
          </div>

          {/* Right — sticky aside (desktop only) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <div className="border-t border-border/60 pt-5">
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-5">
                Gambaran Cepat
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Metode
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Baptisan selam (full immersion)
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Jadwal
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Setiap dua bulan sekali
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Usia minimal
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">12 tahun</dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Biaya
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Sertifikat
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Diterbitkan setelah KOM 100
                  </dd>
                </div>
              </dl>
            </div>

            <nav
              aria-label="Navigasi halaman"
              className="mt-10 border-t border-border/60 pt-5"
            >
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-4">
                Di halaman ini
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="#persiapan"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Persiapan hari baptisan
                  </a>
                </li>
                <li>
                  <a
                    href="#info"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Hal penting sebelum mulai
                  </a>
                </li>
                <li>
                  <a
                    href="#daftar"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Pendaftaran
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Pertanyaan umum
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </section>

      {/* Persiapan hari baptisan */}
      <section
        id="persiapan"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Yang perlu disiapkan.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Persiapan cukup sederhana — beberapa dokumen, perlengkapan pribadi,
          dan komitmen untuk datang tepat waktu. Tidak ada biaya yang perlu
          dibayar sepanjang proses.
        </p>
        <ol className="relative">
          {CHECKLIST.map((item, i) => (
            <li
              key={item.title}
              className="flex flex-col sm:flex-row gap-2 sm:gap-8 py-6 border-t border-border/50 last:border-b"
            >
              <div className="shrink-0 sm:w-48 pt-1">
                <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.02em] leading-[1.2] mb-2">
                  {item.title}
                </h4>
                <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Hal penting sebelum mulai */}
      <section
        id="info"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-10">
          Hal penting sebelum mulai.
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          {INFO_ITEMS.map((item) => (
            <div key={item.title} className="border-t border-border/50 pt-5">
              <dt className="font-serif text-lg sm:text-xl font-bold tracking-[-0.02em] leading-[1.2]">
                {item.title}
              </dt>
              <dd className="mt-2 text-base text-foreground/70 leading-relaxed">
                {item.desc}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Siap daftar? — inverted dark indigo banner (matching baptisan poster theme) */}
      <section
        id="daftar"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.22 0.06 275) 0%, oklch(0.14 0.045 285) 100%)',
          }}
        >
          {/* Large decorative wordmark */}
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(7rem, 18vw, 16rem)',
              lineHeight: 0.85,
              color: 'oklch(0.86 0.08 255)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            Baptisan
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.86 0.08 255)', opacity: 0.7 }}
              >
                Pendaftaran
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.9 0.05 255)',
                }}
              >
                Siap mengambil langkah?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Pendaftaran gratis — cukup isi data diri, pilih tanggal
                baptisan terdekat, lalu siapkan dokumen yang diminta. Ada
                pertanyaan sebelum mendaftar? Tanya AI kami atau hubungi Call
                Centre BEC.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/formulir/baptis"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <ArrowRight className="w-4 h-4" />
                Daftar Baptisan
              </Link>
              <Link
                href={`/helpdesk?q=${encodeURIComponent('Apa syarat Baptisan Air di GBI BEC dan bagaimana cara mendaftarnya?')}`}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                <Sparkles className="w-4 h-4" />
                Tanya AI Kami
              </Link>
              <a
                href="https://wa.me/6287823420950"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                <Phone className="w-4 h-4" />
                Call Centre BEC
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-10">
          Pertanyaan yang Sering Ditanyakan
        </h3>
        <FAQAccordion items={FAQ_ITEMS} />
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
}
