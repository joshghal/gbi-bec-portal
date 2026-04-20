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
  title: 'Pemberkatan Nikah — GBI BEC',
  description:
    'Pemberkatan pernikahan di GBI BEC Bandung — syarat, dokumen, dan tahapan konseling pranikah. Pendaftaran minimal 5 bulan sebelum tanggal pernikahan. Gratis untuk jemaat ber-KAJ.',
  keywords: [
    'pemberkatan nikah',
    'pemberkatan pernikahan GBI',
    'nikah gereja Bandung',
    'wedding blessing Bandung',
    'GBI BEC pemberkatan',
    'syarat nikah GBI',
    'konseling pranikah GBI',
    'BPN GBI',
  ],
  alternates: { canonical: '/pemberkatan-nikah' },
  openGraph: {
    title: 'Pemberkatan Nikah — GBI BEC',
    description:
      'Pemberkatan pernikahan di GBI Baranangsiang Evening Church — daftar minimal 5 bulan sebelumnya, konseling pranikah, dokumen lengkap.',
    url: `${siteUrl}/pemberkatan-nikah`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Prasyarat utama ──────────────────────────────────────────── */

const PRASYARAT = [
  {
    title: 'Jemaat GBI dengan KAJ',
    desc: 'Kedua calon mempelai adalah jemaat resmi GBI Sukawarna dan memiliki Kartu Anggota Jemaat (KAJ). Bagi yang belum, urus KAJ terlebih dahulu melalui M-Class.',
  },
  {
    title: 'Lulus KOM 100',
    desc: 'Kedua calon mempelai telah menyelesaikan KOM 100 — dibuktikan dengan sertifikat kelulusan. KOM 100 menjadi fondasi pemahaman iman sebelum membangun keluarga baru.',
  },
  {
    title: 'Sudah dibaptis selam',
    desc: 'Kedua calon mempelai sudah dibaptis selam — baik di GBI BEC maupun di gereja lain. Surat baptis wajib dilampirkan saat pendaftaran.',
  },
  {
    title: 'Daftar minimal 5 bulan sebelumnya',
    desc: 'Pendaftaran dan kelengkapan dokumen wajib diserahkan paling lambat 5 bulan sebelum tanggal pernikahan — untuk memberi ruang konseling pranikah dan persiapan teknis.',
  },
];

/* ── Dokumen checklist ────────────────────────────────────────── */

const DOKUMEN = [
  {
    section: 'Identitas & status',
    items: [
      'Fotocopy KTP kedua calon mempelai',
      'Fotocopy Kartu Keluarga (KK) kedua calon mempelai',
      'Fotocopy akta lahir kedua calon mempelai',
      'Fotocopy surat ganti nama (bila ada)',
    ],
  },
  {
    section: 'Rohani & keanggotaan',
    items: [
      'Fotocopy surat baptis selam kedua calon (boleh dari gereja manapun)',
      'Fotocopy KAJ GBI Sukawarna kedua calon',
      'Fotocopy sertifikat KOM 100 kedua calon',
    ],
  },
  {
    section: 'Orang tua & restu',
    items: [
      'Surat persetujuan orang tua kedua belah pihak — di atas meterai Rp 10.000 (asli)',
      'Fotocopy KTP orang tua kedua belah pihak',
      'Fotocopy akte kematian & surat wali (bila salah satu orang tua sudah tidak ada)',
    ],
  },
  {
    section: 'Pas foto',
    items: [
      'Pas foto berdampingan mempelai pria dan wanita ukuran 4×6',
      '3 (tiga) lembar — atasan kemeja putih polos rapi, latar biru',
    ],
  },
];

const INFO_ITEMS = [
  {
    title: 'Timeline 5 bulan bukan opsional',
    desc: 'Deadline 5 bulan adalah batas minimum — termasuk waktu untuk konseling, kelas BPN, dan persiapan teknis gereja. Daftar lebih awal kalau memungkinkan.',
  },
  {
    title: 'Konseling pranikah & BPN',
    desc: 'Setelah dokumen lengkap diterima, kedua calon mempelai mengikuti konseling pernikahan dan kelas Bimbingan Pranikah (BPN) — wajib, bukan formalitas.',
  },
  {
    title: 'Belum punya KAJ atau KOM 100?',
    desc: 'Urus keanggotaan (via M-Class → KAJ) dan kelas KOM 100 terlebih dahulu. Idealnya sudah rampung beberapa bulan sebelum pendaftaran pernikahan.',
  },
  {
    title: 'Gratis, tanpa biaya pendaftaran',
    desc: 'Pelayanan pemberkatan pernikahan di GBI BEC tidak dipungut biaya. Yang perlu diurus hanya kelengkapan dokumen dan komitmen mengikuti konseling.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa saja syarat utama untuk Pemberkatan Nikah di GBI BEC?',
    a: 'Empat syarat utama: (1) kedua calon mempelai adalah jemaat GBI Sukawarna dan memiliki KAJ, (2) kedua calon sudah lulus KOM 100, (3) kedua calon sudah dibaptis selam (boleh dari gereja lain), dan (4) pendaftaran dilakukan minimal 5 bulan sebelum tanggal pernikahan.',
  },
  {
    q: 'Kenapa harus daftar minimal 5 bulan sebelumnya?',
    a: 'Lima bulan adalah batas minimum untuk memberi waktu yang cukup bagi proses konseling pernikahan, kelas Bimbingan Pranikah (BPN), koordinasi jadwal dengan gembala, serta persiapan teknis lain. Bila memungkinkan, daftar lebih awal agar semua berjalan tanpa terburu-buru.',
  },
  {
    q: 'Saya atau pasangan belum punya KAJ / belum ikut KOM 100, gimana?',
    a: 'Selesaikan persyaratan tersebut terlebih dahulu sebelum mendaftar pemberkatan. Untuk KAJ, mulai dari M-Class (kelas Membership) — kelas satu hari yang diselenggarakan setiap bulan. Untuk KOM 100, daftar ke kelas KOM 100 yang diselenggarakan secara online setiap minggu. Idealnya selesaikan keduanya beberapa bulan sebelum mendaftar pemberkatan.',
  },
  {
    q: 'Kami sudah dibaptis selam di gereja lain, perlu dibaptis ulang?',
    a: 'Tidak perlu. Baptisan selam yang sudah dilakukan di gereja manapun tetap diakui oleh GBI. Cukup lampirkan fotocopy surat baptis dari gereja sebelumnya sebagai salah satu dokumen pendaftaran.',
  },
  {
    q: 'Apa saja dokumen yang perlu disiapkan?',
    a: 'Dokumen terbagi dalam empat kategori: (1) identitas — fotocopy KTP, KK, akta lahir, surat ganti nama bila ada; (2) rohani — fotocopy surat baptis, KAJ, sertifikat KOM 100; (3) orang tua — surat persetujuan orang tua bermeterai Rp 10.000 asli, fotocopy KTP orang tua, akte kematian & surat wali bila salah satu orang tua sudah tiada; (4) pas foto — 3 lembar pas foto berdampingan 4×6, kemeja putih polos, latar biru. Semua disiapkan untuk kedua calon mempelai.',
  },
  {
    q: 'Apakah ada biaya untuk Pemberkatan Nikah?',
    a: 'Tidak. Pelayanan pemberkatan pernikahan di GBI BEC tidak dipungut biaya (gratis). Yang perlu diurus hanya kelengkapan dokumen, mengikuti konseling pranikah, dan koordinasi teknis dengan unit pernikahan.',
  },
  {
    q: 'Bagaimana alur pendaftaran dan tahapan prosesnya?',
    a: 'Langkah awal: hubungi Unit Pernikahan BEC di WhatsApp 0896-7929-9098. Unit Pernikahan akan memandu dari pengisian formulir, konfirmasi tanggal dan tempat, verifikasi dokumen, hingga penjadwalan konseling pranikah dan kelas BPN. Seluruh proses dikelola langsung oleh tim unit pernikahan setelah kamu menghubungi mereka.',
  },
  {
    q: 'Apa itu konseling pranikah dan kelas BPN?',
    a: 'Konseling pernikahan dan Bimbingan Pranikah (BPN) adalah tahap wajib setelah dokumen pendaftaran diterima lengkap. Tujuannya: mempersiapkan kedua calon secara rohani dan relasional sebelum memasuki pernikahan, mencakup topik seperti komunikasi, keuangan keluarga, dan fondasi iman dalam rumah tangga.',
  },
  {
    q: 'Saya mau menanyakan jadwal gereja yang tersedia, ke mana saya hubungi?',
    a: 'Semua pertanyaan mengenai ketersediaan tanggal, waktu, dan tempat ditangani langsung oleh Unit Pernikahan BEC di WhatsApp 0896-7929-9098. Pastikan tanggal dan tempat terlebih dahulu dengan pihak gereja sebelum mengirim undangan atau mengatur vendor eksternal.',
  },
  {
    q: 'Bagaimana cara menghubungi Unit Pernikahan GBI BEC?',
    a: 'Unit Pernikahan GBI BEC dapat dihubungi langsung melalui WhatsApp di nomor [0896-7929-9098](https://wa.me/6289679299098). Semua pertanyaan mengenai jadwal, persyaratan, konseling pranikah, dan kelengkapan dokumen ditangani langsung oleh unit ini.',
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function PemberkatanNikahPage() {
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
          name: 'Pemberkatan Nikah',
          item: `${siteUrl}/pemberkatan-nikah`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Pemberkatan Nikah — GBI BEC',
      description:
        'Informasi lengkap pemberkatan pernikahan di GBI BEC Bandung — syarat, dokumen, alur pendaftaran, dan konseling pranikah.',
      url: `${siteUrl}/pemberkatan-nikah`,
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
      name: 'Pemberkatan Nikah GBI BEC',
      serviceType: 'Wedding Blessing',
      description:
        'Pelayanan pemberkatan pernikahan bagi jemaat GBI Sukawarna yang memiliki KAJ dan telah menyelesaikan KOM 100. Pendaftaran minimal 5 bulan sebelum tanggal pernikahan, termasuk konseling pranikah dan kelas Bimbingan Pranikah (BPN).',
      url: `${siteUrl}/pemberkatan-nikah`,
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
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: 'GBI Baranangsiang Evening Church',
      alternateName: 'GBI BEC',
      url: siteUrl,
      telephone: '+6289679299098',
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
        title="Pemberkatan Nikah"
        image="/kegiatan/pemberkatan-nikah.webp"
      />

      {/* Big statement — magazine-style with sticky aside */}
      <section
        id="tentang"
        className="max-w-6xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14 pb-16 lg:pb-24"
      >
        <nav aria-label="Breadcrumb" className="mb-8 lg:mb-12">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-foreground/50">
            <li>
              <Link prefetch={false}
                href="/"
                className="hover:text-foreground/80 transition-colors underline-offset-2 hover:underline"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-foreground/30">/</li>
            <li aria-current="page" className="text-foreground/70">
              Pemberkatan Nikah
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Satu perjanjian, di hadapan Tuhan.
        </h2>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Daftar min.
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">5 bulan</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Syarat
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">KAJ · KOM 100</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Konseling
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Wajib</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Biaya
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Kontak
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Unit Pernikahan BEC
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
                  href="#prasyarat"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Prasyarat
                </a>
              </li>
              <li aria-hidden="true" className="text-foreground/25">·</li>
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
                Pemberkatan pernikahan di GBI BEC adalah{' '}
                <strong className="font-medium text-foreground/90">
                  perjanjian pernikahan
                </strong>{' '}
                antara dua calon mempelai yang dikukuhkan di hadapan Tuhan dan
                jemaat. Pelayanan ini bukan sekadar seremoni — ini adalah
                pondasi rohani untuk membangun rumah tangga Kristen.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Mengapa 5 bulan
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Gereja meminta pendaftaran{' '}
                <strong className="font-medium text-foreground/90">
                  minimal 5 bulan sebelum tanggal pernikahan
                </strong>
                . Bukan untuk menyulitkan — rentang waktu ini memberi ruang
                untuk konseling pranikah, kelas{' '}
                <em className="text-foreground/60">
                  Bimbingan Pranikah (BPN)
                </em>
                , verifikasi dokumen, dan koordinasi jadwal dengan gembala.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Untuk pasangan yang kedua-duanya sudah menjadi{' '}
                <strong className="font-medium text-foreground/90">
                  jemaat resmi GBI Sukawarna
                </strong>{' '}
                (memiliki KAJ) dan telah lulus{' '}
                <Link prefetch={false}
                  href="/kom/100"
                  className="text-foreground/85 underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground/70 transition-colors"
                >
                  KOM 100
                </Link>
                . Bila salah satu masih dalam proses, selesaikan terlebih
                dahulu sebelum mendaftar pemberkatan.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Alur pendaftaran
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Seluruh proses — dari pertanyaan awal, konfirmasi jadwal, sampai
                verifikasi dokumen — dikelola langsung oleh{' '}
                <strong className="font-medium text-foreground/90">
                  Unit Pernikahan BEC
                </strong>
                . Langkah pertama: hubungi Unit Pernikahan via WhatsApp. Mereka
                akan memandu setiap tahapan secara berurutan.
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
                    Pendaftaran
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Min. 5 bulan sebelum pernikahan
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Prasyarat rohani
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    KAJ · KOM 100 · baptis selam
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Konseling
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Pranikah + kelas BPN
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
                    Kontak utama
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Unit Pernikahan BEC
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
                    href="#prasyarat"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Empat prasyarat utama
                  </a>
                </li>
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

      {/* Prasyarat utama */}
      <section
        id="prasyarat"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Empat prasyarat utama.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Semua harus terpenuhi{' '}
          <strong className="font-medium text-foreground/85">
            oleh kedua calon mempelai
          </strong>{' '}
          sebelum dokumen pendaftaran dapat diproses. Bila salah satu belum
          terpenuhi, selesaikan terlebih dahulu — urutan ini dirancang untuk
          membangun fondasi rohani sebelum membangun rumah tangga.
        </p>
        <ol className="relative">
          {PRASYARAT.map((item, i) => (
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

      {/* Dokumen yang dibutuhkan */}
      <section
        id="dokumen"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Dokumen yang dibutuhkan.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Kelengkapan dokumen untuk{' '}
          <strong className="font-medium text-foreground/85">
            kedua calon mempelai
          </strong>
          , dikelompokkan dalam empat bagian supaya lebih mudah disiapkan
          bertahap.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          {DOKUMEN.map((group) => (
            <div key={group.section} className="border-t border-border/50 pt-5">
              <h4 className="font-serif text-lg sm:text-xl font-bold tracking-[-0.02em] leading-[1.2] mb-4">
                {group.section}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base text-foreground/70 leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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

      {/* Siap daftar? — rose/burgundy banner matching pernikahan poster theme */}
      <section
        id="daftar"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.22 0.055 15) 0%, oklch(0.14 0.04 10) 100%)',
          }}
        >
          {/* Large decorative wordmark */}
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(5rem, 13vw, 12rem)',
              lineHeight: 0.85,
              color: 'oklch(0.86 0.08 15)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            Pemberkatan
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.86 0.08 15)', opacity: 0.7 }}
              >
                Pendaftaran
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.9 0.05 15)',
                }}
              >
                Siap memulai perjalanan bersama?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Mulai dengan menghubungi Unit Pernikahan BEC — tim akan memandu
                dari dokumen, konseling, sampai penjadwalan. Jangan lupa: daftar
                minimal 5 bulan sebelum tanggal pernikahan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/6289679299098"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <ArrowRight className="w-4 h-4" />
                Hubungi Unit Pernikahan
              </a>
              <Link prefetch={false}
                href={`/helpdesk?q=${encodeURIComponent('Apa syarat Pemberkatan Nikah di GBI BEC dan bagaimana cara mendaftarnya?')}`}
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
