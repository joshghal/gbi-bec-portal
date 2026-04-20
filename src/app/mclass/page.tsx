import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Sparkles, ArrowRight } from 'lucide-react';
import ActivityHero from '@/components/kegiatan/activity-hero';
import FAQAccordion from '@/components/kegiatan/faq-accordion';
import Nav from '@/components/landing/nav';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import GrainOverlay from '@/components/grain-overlay';

// Force static generation at build time — the page has zero dynamic data.
// Matches /ibadah-raya and /kom. Guards against accidental regressions later.
export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export const metadata: Metadata = {
  title: 'M-Class — Kelas Membership GBI BEC',
  description:
    'M-Class (Membership Class) di GBI BEC Bandung — kelas satu hari untuk mengenal visi gereja, kehidupan bergereja, dan mendapatkan Kartu Anggota Jemaat (KAJ). Gratis, jadwal setiap bulan.',
  keywords: [
    'M-Class',
    'Membership Class',
    'Kelas Membership GBI',
    'KAJ GBI BEC',
    'Kartu Anggota Jemaat',
    'anggota GBI Bandung',
    'keanggotaan gereja Bandung',
    'GBI Sukawarna',
    'GBI BEC Bandung',
  ],
  alternates: { canonical: '/mclass' },
  openGraph: {
    title: 'M-Class — Kelas Membership GBI BEC',
    description:
      'Kelas wajib untuk menjadi anggota resmi GBI BEC dan memperoleh Kartu Anggota Jemaat (KAJ). Gratis, jadwal setiap bulan di Bandung.',
    url: `${siteUrl}/mclass`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Step data ────────────────────────────────────────────────── */

const PATHWAY = [
  {
    step: 1,
    title: 'Ikuti M-Class',
    desc: 'Daftar dan hadiri kelas satu hari — mengenal visi-misi, kehidupan bergereja, dan pelayanan di GBI BEC.',
  },
  {
    step: 2,
    title: 'Baptisan Selam',
    desc: 'Menjalani baptisan selam di GBI BEC, atau menyerahkan bukti baptis selam dari gereja sebelumnya.',
  },
  {
    step: 3,
    title: 'Ajukan KAJ',
    desc: 'Lengkapi form pendataan jemaat dan lampirkan dokumen yang diminta — surat baptis, KTP/KK, foto diri.',
  },
  {
    step: 4,
    title: 'Anggota Resmi GBI BEC',
    desc: 'KAJ diterbitkan — kamu resmi terdaftar sebagai anggota jemaat GBI BEC dan bagian dari sinode GBI nasional.',
  },
];

const INFO_ITEMS = [
  {
    title: 'Durasi singkat',
    desc: 'Hanya satu hari. Materi mencakup visi-misi gereja, dasar-dasar pelayanan, pengenalan pengurus, dan lingkungan GBI BEC.',
  },
  {
    title: 'Jadwal setiap bulan',
    desc: 'M-Class diselenggarakan setiap hari Senin setelah hari Minggu pertama di bulan tersebut — jadwal terbaru tersedia saat pendaftaran.',
  },
  {
    title: 'Syarat mengikuti',
    desc: 'Usia di atas 15 tahun dan sudah pernah beribadah di GBI BEC atau mengikuti ibadah online di kanal YouTube GBI Sukawarna.',
  },
  {
    title: 'Jalan menuju KAJ',
    desc: 'M-Class adalah syarat wajib untuk penerbitan Kartu Anggota Jemaat (KAJ). Setelah lulus, kamu dapat mengajukan KAJ sebagai anggota resmi.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu M-Class di GBI BEC?',
    a: 'M-Class (Membership Class) adalah kelas khusus untuk mengenal dan memahami kehidupan bergereja di GBI BEC secara lebih dalam. Durasinya satu hari — bertujuan memperkenalkan visi-misi gereja, dasar-dasar pelayanan, pengenalan pengurus, serta lingkungan GBI BEC supaya jemaat dapat berpartisipasi aktif.',
  },
  {
    q: 'Siapa yang bisa mengikuti M-Class?',
    a: 'M-Class terbuka bagi siapa saja yang berusia di atas 15 tahun dan sudah pernah beribadah di GBI BEC, baik secara langsung maupun mengikuti ibadah online melalui kanal YouTube GBI Sukawarna.',
  },
  {
    q: 'Kapan jadwal M-Class?',
    a: 'M-Class diselenggarakan setiap bulan, biasanya pada hari Senin setelah hari Minggu pertama di bulan tersebut. Tanggal persis dapat dilihat dan dipilih langsung saat pengisian formulir pendaftaran online.',
  },
  {
    q: 'Apakah ada biaya untuk mengikuti M-Class?',
    a: 'Tidak. M-Class tidak dipungut biaya (gratis) — sama seperti seluruh kegiatan dan layanan di GBI BEC.',
  },
  {
    q: 'Apa itu KAJ dan bagaimana hubungannya dengan M-Class?',
    a: 'KAJ (Kartu Anggota Jemaat) adalah tanda keanggotaan resmi sebagai jemaat GBI BEC. Lulus M-Class merupakan salah satu syarat wajib untuk pengajuan KAJ, selain baptisan selam, usia di atas 15 tahun, dan telah beribadah di GBI BEC.',
  },
  {
    q: 'Apakah saya perlu menjadi anggota GBI terlebih dahulu?',
    a: 'Tidak. M-Class justru merupakan langkah untuk menjadi anggota resmi. Kamu belum perlu memiliki KAJ untuk ikut M-Class.',
  },
  {
    q: 'Apa saja yang diajarkan di M-Class?',
    a: 'Materi M-Class mencakup: kehidupan bergereja, dasar-dasar pelayanan, visi-misi GBI BEC, serta pengenalan lingkungan dan pengurus gereja. Kelas ini dirancang agar jemaat siap terlibat aktif dalam pelayanan.',
  },
  {
    q: 'Apakah saya perlu sudah dibaptis selam sebelum ikut M-Class?',
    a: 'Tidak. Baptisan selam adalah syarat terpisah untuk KAJ, bukan syarat untuk mengikuti M-Class. Namun, untuk dapat memperoleh KAJ kelak, kamu tetap perlu telah dibaptis selam — baik di GBI BEC maupun di gereja lain yang baptisannya diakui.',
  },
  {
    q: 'Saya pernah punya KAJ tapi kartunya hilang, apakah perlu ikut M-Class lagi?',
    a: 'Tidak selalu. Langkah pertama adalah pengecekan data ke admin pusat GBI. Jika data kamu masih ditemukan, kamu cukup mengisi form pengkinian data dan tidak perlu mengikuti M-Class lagi. Jika data tidak ditemukan, barulah perlu ikut M-Class kembali. Untuk memulai pengecekan, hubungi Call Centre BEC.',
  },
  {
    q: 'Bagaimana cara mendaftar M-Class?',
    a: 'Pendaftaran dilakukan melalui formulir online di halaman [Daftar M-Class](/formulir/mclass) — kamu hanya perlu mengisi nama lengkap, nomor WhatsApp, dan memilih tanggal M-Class yang tersedia. Untuk pertanyaan lanjutan, hubungi [Call Centre BEC](https://wa.me/6287823420950).',
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function MClassPage() {
  // Flatten `[label](url)` markdown links into `label (url)` so JSON-LD
  // carries plain text that still surfaces the URL to Google's indexer.
  const flattenMarkdownLinks = (s: string) =>
    s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  const provider = {
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
        { '@type': 'ListItem', position: 2, name: 'M-Class', item: `${siteUrl}/mclass` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'M-Class — Kelas Membership GBI BEC',
      description:
        'M-Class (Membership Class) di GBI BEC Bandung — kelas satu hari untuk mengenal kehidupan bergereja dan memperoleh Kartu Anggota Jemaat (KAJ). Gratis, jadwal setiap bulan.',
      url: `${siteUrl}/mclass`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#tentang h2', '#tentang p'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'M-Class — Kelas Membership GBI BEC',
      alternateName: 'Membership Class',
      description:
        'Kelas satu hari bagi jemaat yang ingin menjadi anggota resmi GBI BEC dan memperoleh Kartu Anggota Jemaat (KAJ). Materi: kehidupan bergereja, pelayanan, visi-misi GBI BEC, dan pengenalan lingkungan gereja.',
      url: `${siteUrl}/mclass`,
      inLanguage: 'id-ID',
      educationalLevel: 'Membership',
      teaches:
        'Kehidupan bergereja, dasar-dasar pelayanan, visi-misi GBI BEC, pengenalan pengurus dan lingkungan gereja',
      provider,
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'onsite',
        courseWorkload: 'PT1D',
        courseSchedule: {
          '@type': 'Schedule',
          repeatFrequency: 'P1M',
          scheduleTimezone: 'Asia/Jakarta',
          description: 'Setiap hari Senin setelah hari Minggu pertama setiap bulan',
        },
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/formulir/mclass`,
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

      {/* Hero — matches /kom pattern */}
      <ActivityHero title="M-Class" image="/kegiatan/mclass.webp" />

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
              M-Class
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Satu hari untuk menjadi bagian.
        </h2>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Durasi
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">1 hari</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Jadwal
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Bulanan</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Usia
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">15+ tahun</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Biaya
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Gratis</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Syarat
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                KAJ anggota resmi
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
                  href="#jalur"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Jalur keanggotaan
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
          {/* Left — labeled mini-sections */}
          <div className="space-y-10 max-w-2xl">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Apa itu
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                M-Class{' '}
                <em className="text-foreground/60">(Membership Class)</em>{' '}
                adalah kelas khusus di{' '}
                <strong className="font-medium text-foreground/90">
                  GBI BEC
                </strong>{' '}
                untuk mengenal kehidupan bergereja secara lebih dalam. Kelas
                berlangsung dalam satu hari — padat namun hangat, dirancang
                supaya jemaat baru bisa memahami identitas gereja dan siap
                ikut berpartisipasi aktif.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Untuk kamu yang{' '}
                <strong className="font-medium text-foreground/90">
                  sudah pernah beribadah di GBI BEC
                </strong>{' '}
                — baik yang pernah datang langsung atau mengikuti ibadah online di kanal
                YouTube — dan ingin melangkah lebih jauh menjadi anggota
                resmi. Usia minimal 15 tahun.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Yang akan dipelajari
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Materi dirangkum dalam tiga fokus —{' '}
                <em className="text-foreground/60">
                  to build, to know, to equip
                </em>
                . Kehidupan bergereja dan dasar-dasar pelayanan, visi-misi
                GBI BEC sebagai bagian dari sinode Gereja Bethel Indonesia,
                serta pengenalan pengurus dan lingkungan gereja supaya kamu
                tahu siapa yang bisa dihubungi untuk kebutuhan apa.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Biaya & KAJ
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                M-Class{' '}
                <strong className="font-medium text-foreground/90">
                  tidak dipungut biaya
                </strong>
                . Setelah lulus, kamu dapat mengajukan{' '}
                <strong className="font-medium text-foreground/90">
                  Kartu Anggota Jemaat (KAJ)
                </strong>{' '}
                — tanda keanggotaan resmi sebagai jemaat GBI BEC, yang juga
                menjadi syarat untuk pelayanan dan sakramen tertentu di
                gereja.
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
                    Durasi
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">1 hari</dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Jadwal
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Setiap bulan · Senin setelah Minggu pertama
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Syarat
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Usia 15+ · sudah pernah beribadah di BEC
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
                    Menuju
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Kartu Anggota Jemaat (KAJ)
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
                    href="#jalur"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Jalur keanggotaan
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

      {/* Jalur keanggotaan — 4-step pathway */}
      <section
        id="jalur"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Jalur menjadi anggota resmi.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Ada empat langkah dari pertama kali ikut ibadah hingga diterima
          sebagai anggota resmi GBI BEC. M-Class adalah gerbangnya —
          selebihnya mengikuti secara bertahap.
        </p>
        <ol className="relative">
          {PATHWAY.map((step) => (
            <li
              key={step.step}
              className="flex flex-col sm:flex-row gap-2 sm:gap-8 py-6 border-t border-border/50 last:border-b"
            >
              <div className="shrink-0 sm:w-48 pt-1">
                <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                  Langkah {String(step.step).padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.02em] leading-[1.2] mb-2">
                  {step.title}
                </h4>
                <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                  {step.desc}
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

      {/* Siap daftar? — inverted dark navy banner (matching M-Class poster theme) */}
      <section
        id="daftar"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.22 0.042 252) 0%, oklch(0.14 0.028 260) 100%)',
          }}
        >
          {/* Large decorative wordmark */}
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(7rem, 18vw, 16rem)',
              lineHeight: 0.85,
              color: 'oklch(0.92 0.08 85)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            M-Class
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.92 0.08 85)', opacity: 0.7 }}
              >
                Pendaftaran
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.95 0.06 85)',
                }}
              >
                Siap menjadi bagian dari BEC?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Daftar cukup dengan nama, nomor WhatsApp, dan memilih tanggal
                M-Class terdekat. Ada pertanyaan sebelum mendaftar? Tanya AI
                kami atau hubungi Call Centre BEC.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link prefetch={false}
                href="/formulir/mclass"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <ArrowRight className="w-4 h-4" />
                Daftar M-Class
              </Link>
              <Link prefetch={false}
                href={`/helpdesk?q=${encodeURIComponent('Apa itu M-Class di GBI BEC dan bagaimana cara mendaftarnya?')}`}
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
