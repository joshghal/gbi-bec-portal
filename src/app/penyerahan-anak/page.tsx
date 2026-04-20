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
export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export const metadata: Metadata = {
  title: 'Penyerahan Anak — GBI BEC',
  description:
    'Penyerahan anak di GBI BEC Bandung — komitmen orang tua mendidik anak dalam Tuhan, dilakukan bersama kedua orang tua di hadapan jemaat. Gratis, dokumen lengkap diserahkan ke diaken BEC.',
  keywords: [
    'penyerahan anak',
    'penyerahan anak GBI',
    'dedikasi anak gereja Bandung',
    'child dedication Bandung',
    'GBI BEC penyerahan anak',
    'syarat penyerahan anak GBI',
    'GBI Sukawarna',
  ],
  alternates: { canonical: '/penyerahan-anak' },
  openGraph: {
    title: 'Penyerahan Anak — GBI BEC',
    description:
      'Penyerahan anak bersama kedua orang tua di GBI Baranangsiang Evening Church sebagai komitmen mendidik anak dalam Tuhan.',
    url: `${siteUrl}/penyerahan-anak`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Dokumen checklist ────────────────────────────────────────── */

const CHECKLIST = [
  {
    title: 'Pas foto anak 3×4',
    desc: 'Dua lembar, berwarna. Cukup dibawa lepas di dalam amplop — tidak perlu disteples ke berkas lain.',
  },
  {
    title: 'Fotocopy KTP ayah & ibu',
    desc: 'Satu lembar masing-masing. Pastikan KTP masih berlaku dan terbaca dengan jelas.',
  },
  {
    title: 'Fotocopy akta nikah',
    desc: 'Akta nikah atau surat pemberkatan nikah orang tua. Sebagai dasar hukum penyerahan oleh kedua orang tua.',
  },
  {
    title: 'Fotocopy akta lahir anak',
    desc: 'Akta kelahiran resmi — menjadi referensi nama lengkap dan tanggal lahir yang dicatat di surat penyerahan.',
  },
  {
    title: 'Fotocopy KAJ ayah & ibu',
    desc: 'Kartu Anggota Jemaat kedua orang tua. Penyerahan anak biasanya dilakukan oleh orang tua yang sudah menjadi anggota resmi GBI BEC.',
  },
];

const INFO_ITEMS = [
  {
    title: 'Bukan sakramen baptisan',
    desc: 'Di GBI, penyerahan anak berbeda dari baptisan. Anak tidak dibaptis — ini adalah penyerahan oleh orang tua, baptisan adalah pilihan pribadi anak kelak setelah usia 12 tahun ke atas.',
  },
  {
    title: 'Bersama kedua orang tua',
    desc: 'Penyerahan dilakukan bersama ayah dan ibu di hadapan jemaat. Jika salah satu orang tua berhalangan atau tidak memungkinkan hadir, hubungi Call Centre BEC untuk diskusi lebih lanjut.',
  },
  {
    title: 'Jadwal menyesuaikan gembala',
    desc: 'Penyerahan anak tidak diadakan rutin setiap bulan — jadwal menyesuaikan ketersediaan Gembala GBI BEC. Hubungi Call Centre setelah mengisi formulir pendaftaran untuk konfirmasi jadwal.',
  },
  {
    title: 'Pakaian rapi & sopan',
    desc: 'Tidak ada dress code khusus untuk orang tua maupun anak. Cukup berpakaian rapi dan sopan sesuai kenyamanan keluarga.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu Penyerahan Anak di GBI BEC?',
    a: 'Penyerahan anak adalah komitmen orang tua di hadapan Tuhan dan jemaat untuk mendidik anak dalam pengenalan akan Yesus Kristus. Dilakukan bersama kedua orang tua, ini bukan sakramen baptisan — anak tidak dibaptis dalam upacara ini.',
  },
  {
    q: 'Apa bedanya penyerahan anak dengan baptisan bayi?',
    a: 'Yang dilakukan adalah penyerahan — komitmen orang tua untuk mendidik anak dalam iman Kristen. Kelak, saat anak berusia 12 tahun ke atas dan sudah mengambil keputusan iman sendiri, ia dapat mengikuti Baptisan Air.',
  },
  {
    q: 'Siapa yang dapat mengikuti Penyerahan Anak?',
    a: 'Penyerahan anak dilakukan bersama kedua orang tua di hadapan jemaat. Orang tua biasanya sudah menjadi anggota resmi GBI BEC (memiliki KAJ) — fotocopy KAJ ayah dan ibu termasuk salah satu dokumen yang diminta.',
  },
  {
    q: 'Kapan jadwal Penyerahan Anak?',
    a: 'Penyerahan anak tidak diadakan rutin setiap bulan. Jadwal pelaksanaan menyesuaikan ketersediaan Gembala GBI BEC. Setelah mengisi formulir pendaftaran online, hubungi Call Centre BEC untuk konfirmasi jadwal pelaksanaan.',
  },
  {
    q: 'Apakah ada biaya untuk Penyerahan Anak?',
    a: 'Tidak. Penyerahan anak di GBI BEC tidak dipungut biaya (gratis) — sama seperti seluruh kegiatan dan layanan gereja.',
  },
  {
    q: 'Apa saja dokumen yang perlu disiapkan?',
    a: 'Pas foto anak 3×4 berwarna (2 lembar), fotocopy KTP ayah, fotocopy KTP ibu, fotocopy akta nikah/pemberkatan nikah orang tua, fotocopy akta lahir anak, serta fotocopy KAJ ayah dan ibu. Semua dokumen fisik diserahkan langsung ke diaken BEC setelah pendaftaran online.',
  },
  {
    q: 'Bagaimana cara mendaftar Penyerahan Anak?',
    a: 'Langkah pertama, isi formulir pendaftaran online di halaman [Daftar Penyerahan Anak](/formulir/penyerahan-anak). Setelah itu, siapkan dokumen fisik yang diperlukan dan serahkan langsung ke diaken BEC. Hubungi [Call Centre BEC](https://wa.me/6287823420950) untuk konfirmasi jadwal.',
  },
  {
    q: 'Apakah dress code tertentu pada saat hari pelaksanaan?',
    a: 'Tidak ada dress code khusus. Cukup berpakaian rapi dan sopan — baik untuk kedua orang tua maupun anak yang akan diserahkan.',
  },
  {
    q: 'Bagaimana kalau surat penyerahan anak hilang?',
    a: 'Surat penyerahan anak yang hilang tidak dapat diterbitkan kembali. Gereja hanya dapat memberikan surat keterangan yang menyatakan bahwa anak tersebut pernah diserahkan di GBI BEC. Disarankan untuk menyimpan surat asli dengan baik, misalnya bersama dokumen penting lainnya.',
  },
  {
    q: 'Anak kami sudah pernah diserahkan di gereja lain, perlu diserahkan ulang?',
    a: 'Tidak wajib diserahkan ulang. Penyerahan anak yang sudah dilakukan di gereja lain tetap memiliki makna yang sama. Untuk diskusi lebih lanjut terkait keanggotaan keluarga di GBI BEC, hubungi Call Centre BEC.',
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function PenyerahanAnakPage() {
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
          name: 'Penyerahan Anak',
          item: `${siteUrl}/penyerahan-anak`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Penyerahan Anak — GBI BEC',
      description:
        'Informasi lengkap penyerahan anak di GBI BEC Bandung — makna, dokumen yang dibutuhkan, jadwal, dan cara pendaftaran.',
      url: `${siteUrl}/penyerahan-anak`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#tentang h2', '#tentang p'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Penyerahan Anak GBI BEC',
      serviceType: 'Child Dedication',
      description:
        'Penyerahan anak bersama kedua orang tua di hadapan jemaat, sebagai komitmen mendidik anak dalam Tuhan. Bukan sakramen baptisan. Jadwal pelaksanaan menyesuaikan ketersediaan Gembala GBI BEC.',
      url: `${siteUrl}/penyerahan-anak`,
      provider: organizer,
      areaServed: {
        '@type': 'City',
        name: 'Bandung',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/formulir/penyerahan-anak`,
      },
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
      <ActivityHero
        title="Penyerahan Anak"
        image="/kegiatan/penyerahan-anak.webp"
      />

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
              Penyerahan Anak
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Sebuah komitmen, bersama seluruh jemaat.
        </h2>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Pelaksanaan
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Bersama kedua orang tua
              </dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Jadwal
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Menyesuaikan gembala
              </dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Dokumen
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Fisik ke diaken
              </dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Biaya
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Catatan
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Bukan baptisan
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
                  href="#dokumen"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Dokumen
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
                Penyerahan anak adalah{' '}
                <strong className="font-medium text-foreground/90">
                  komitmen orang tua
                </strong>{' '}
                di hadapan Tuhan dan jemaat untuk mendidik anak dalam
                pengenalan akan Yesus Kristus. Dilakukan bersama ayah dan ibu
                di tengah ibadah, sebagai doa berkat bagi anak dan tanggung
                jawab rohani yang diambil secara sadar oleh orang tua.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Bukan baptisan
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Di GBI, anak{' '}
                <strong className="font-medium text-foreground/90">
                  tidak dibaptis pada usia bayi
                </strong>
                . Penyerahan bukanlah sakramen baptisan — tidak ada pencelupan
                atau percikan air. Keputusan untuk dibaptis adalah pilihan
                pribadi anak kelak, saat berusia 12 tahun ke atas dan sudah
                siap mengambil keputusan iman sendiri melalui{' '}
                <Link
                  href="/baptisan"
                  className="text-foreground/85 underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/70 transition-colors"
                >
                  Baptisan Air
                </Link>
                .
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Untuk keluarga yang sudah menjadi bagian dari GBI BEC — dokumen
                yang diminta mencakup{' '}
                <em className="text-foreground/60">KAJ ayah dan ibu</em>,
                sehingga penyerahan dilakukan oleh orang tua yang sudah menjadi
                anggota resmi jemaat. Bila ada pertimbangan khusus (misal salah
                satu orang tua belum memiliki KAJ), hubungi Call Centre BEC
                untuk diskusi lebih lanjut.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Alur pendaftaran
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Dua tahap — isi formulir pendaftaran online lebih dulu untuk
                mencatat data keluarga, lalu siapkan{' '}
                <strong className="font-medium text-foreground/90">
                  dokumen fisik
                </strong>{' '}
                (pas foto anak, fotocopy KTP, akta nikah, akta lahir, KAJ) dan
                serahkan langsung ke diaken BEC. Jadwal pelaksanaan menyesuaikan
                ketersediaan Gembala BEC — Call Centre akan mengkonfirmasi
                setelah dokumen lengkap.
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
                    Pelaksanaan
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Bersama kedua orang tua
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Jadwal
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Menyesuaikan ketersediaan Gembala BEC
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Dokumen
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Fisik · diserahkan ke diaken BEC
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Biaya
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Catatan
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Bukan sakramen baptisan
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
                    href="#dokumen"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Dokumen yang dibutuhkan
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

      {/* Dokumen yang dibutuhkan */}
      <section
        id="dokumen"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Dokumen yang dibutuhkan.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Dokumen berikut diserahkan dalam bentuk fisik ke diaken BEC setelah
          mengisi formulir pendaftaran online. Semua fotocopy berlaku —
          aslinya tetap disimpan keluarga.
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

      {/* Siap daftar? — inverted dark plum banner (matching penyerahan-anak poster theme) */}
      <section
        id="daftar"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.22 0.055 310) 0%, oklch(0.14 0.04 320) 100%)',
          }}
        >
          {/* Large decorative wordmark */}
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(5.5rem, 14vw, 13rem)',
              lineHeight: 0.85,
              color: 'oklch(0.86 0.08 305)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            Penyerahan
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.86 0.08 305)', opacity: 0.7 }}
              >
                Pendaftaran
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.9 0.05 305)',
                }}
              >
                Siap menyerahkan anak kepada Tuhan?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Mulai dengan pendaftaran online — isi data keluarga, lalu
                siapkan dokumen fisik untuk diserahkan ke diaken BEC. Call
                Centre akan menghubungi untuk konfirmasi jadwal pelaksanaan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/formulir/penyerahan-anak"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <ArrowRight className="w-4 h-4" />
                Daftar Penyerahan Anak
              </Link>
              <Link
                href={`/helpdesk?q=${encodeURIComponent('Apa syarat Penyerahan Anak di GBI BEC dan bagaimana cara mendaftarnya?')}`}
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
