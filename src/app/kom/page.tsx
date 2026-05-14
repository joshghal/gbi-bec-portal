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
// Matches /ibadah-raya. Guards against accidental regressions later.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Materi KOM — Kehidupan Orientasi Melayani',
  description:
    'Program Kehidupan Orientasi Melayani (KOM) di GBI BEC Bandung — pengajaran Firman Tuhan berjenjang. 4 level, 82 sesi, sertifikat resmi kurikulum nasional GBI.',
  keywords: [
    'KOM',
    'Kehidupan Orientasi Melayani',
    'KOM GBI',
    'kelas rohani Bandung',
    'materi KOM',
    'kurikulum nasional GBI',
    'pengajaran Firman Tuhan Bandung',
    'sertifikat GBI',
    'GBI BEC Bandung',
  ],
  alternates: { canonical: '/kom' },
  openGraph: {
    title: 'Materi KOM — GBI BEC',
    description:
      'Program KOM di GBI BEC Bandung — berjenjang, bersertifikat resmi kurikulum nasional GBI.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id'}/kom`,
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
    cover: '/posters/kom100.webp',
    description:
      'Level fondasi untuk semua jemaat — mengenal dasar-dasar iman Kristen, keselamatan melalui Yesus, karya Roh Kudus, serta bagaimana hidup yang bertumbuh dan memberi dampak bagi sekitar. Tidak ada prasyarat.',
    series: [
      'Dasar-dasar Kekristenan',
      'Kekristenan yang Bertumbuh',
      'Mengenal Allah',
      'Kehidupan yang Memberi Dampak',
    ],
    prerequisite: null,
  },
  {
    level: 200,
    title: 'Pelayan Tuhan',
    subtitle: 'The Servant',
    sessions: 23,
    cover: '/posters/kom200.webp',
    description:
      'Membentuk karakter seorang pelayan melalui delapan ucapan bahagia, memperdalam pengetahuan Alkitab (PL, PB, studi induktif), kehidupan Kristen yang berbuah di rumah dan tempat kerja, serta pengenalan dasar pelayanan jemaat.',
    series: [
      'Karakter Pelayan Tuhan',
      'Pengetahuan Alkitab',
      'Kehidupan Kristen',
      'Pengenalan Pelayanan',
    ],
    prerequisite: 'Setelah lulus KOM 100',
  },
  {
    level: 300,
    title: 'Prajurit Tuhan',
    subtitle: 'The Soldier',
    sessions: 16,
    cover: '/posters/kom300.webp',
    description:
      'Melatih ketahanan rohani — disiplin, takut akan Tuhan, senjata rohani, pola doa-pujian-penyembahan yang dinamis, lima karakteristik pelayanan, serta menegakkan Kerajaan Allah di gereja, dunia kerja, dan seluruh bumi.',
    series: [
      'Karakter Prajurit',
      'Prajurit Doa, Pujian & Penyembahan',
      'Lima Karakteristik Pelayanan',
      'Menegakkan Kerajaan Allah',
    ],
    prerequisite: 'Setelah lulus KOM 200',
  },
  {
    level: 400,
    title: 'Penilik Tuhan',
    subtitle: 'The Steward',
    sessions: 16,
    cover: '/posters/kom400.webp',
    description:
      'Level puncak — mempersiapkan pemimpin yang otentik, yang hatinya hancur di hadapan Tuhan, berani mengambil tanggung jawab rohani, dan digerakkan oleh panggilan hidup yang jelas. Untuk yang siap masuk peran kepemimpinan.',
    series: ['Authentic', 'Broken Hearted', 'Courageous', 'Destiny Driven'],
    prerequisite: 'Setelah lulus KOM 300',
  },
];

const INFO_ITEMS = [
  {
    title: 'Berjenjang',
    desc: 'Program disusun bertingkat — kamu perlu lulus level sebelumnya untuk melanjutkan ke level berikutnya, supaya pondasi iman terbangun secara bertahap.',
  },
  {
    title: 'Sertifikat KOM 100',
    desc: 'Sertifikat kelulusan KOM 100 menjadi syarat mengikuti Baptisan Air dan Pemberkatan Nikah di GBI BEC, serta untuk mendapatkan Kartu Anggota Jemaat (KAJ).',
  },
  {
    title: 'Syarat kelulusan',
    desc: 'Kelulusan setiap level memerlukan kehadiran minimum, penyelesaian tugas-tugas, serta ujian akhir — sesuai standar kurikulum nasional.',
  },
  {
    title: 'Berlaku nasional',
    desc: 'Sertifikat KOM GBI BEC diakui di seluruh gereja Gereja Bethel Indonesia — sertifikat yang kamu dapat di sini berlaku untuk ibadah di mana pun di Indonesia.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu program KOM di GBI BEC?',
    a: 'KOM (Kehidupan Orientasi Melayani) adalah program pengajaran Firman Tuhan berjenjang yang menggunakan kurikulum nasional Gereja Bethel Indonesia. Program ini dibagi menjadi 4 level dengan total 82 sesi, membantu jemaat bertumbuh dari dasar-dasar iman hingga kepemimpinan pelayanan.',
  },
  {
    q: 'Siapa yang bisa mengikuti KOM?',
    a: 'KOM terbuka untuk umum — siapa saja yang ingin mendalami Firman Tuhan, baik jemaat GBI BEC maupun simpatisan. Tidak perlu menjadi anggota resmi gereja terlebih dahulu untuk mengikuti KOM 100.',
  },
  {
    q: 'Kapan jadwal kelas KOM?',
    a: 'Kelas KOM di GBI BEC diadakan setiap hari Rabu dan Kamis pukul 18:30 WIB. Jadwal spesifik untuk setiap level akan diinfokan saat pendaftaran.',
  },
  {
    q: 'Apakah ada biaya untuk mengikuti KOM?',
    a: 'Tidak. Seluruh program KOM di GBI BEC tidak dipungut biaya — baik materi, sertifikat, maupun proses pendaftaran.',
  },
  {
    q: 'Apakah KOM 100 wajib untuk Baptisan Air dan Pemberkatan Nikah?',
    a: 'Ya. Sertifikat kelulusan KOM 100 merupakan salah satu syarat untuk mengikuti Baptisan Air dan Pemberkatan Nikah di GBI BEC. KOM 100 juga syarat awal untuk mendapatkan Kartu Anggota Jemaat (KAJ).',
  },
  {
    q: 'Berapa lama total durasi program KOM dari level 100 hingga 400?',
    a: 'Total ada 82 sesi — KOM 100 (27 sesi), KOM 200 (23 sesi), KOM 300 (16 sesi), dan KOM 400 (16 sesi). Durasi penyelesaian setiap level tergantung kehadiran dan jadwal batch yang diikuti, umumnya beberapa bulan per level.',
  },
  {
    q: 'Apakah sertifikat KOM berlaku di gereja GBI lain?',
    a: 'Ya. KOM menggunakan kurikulum nasional GBI sehingga sertifikat kelulusannya berlaku dan diakui di seluruh gereja GBI di Indonesia.',
  },
  {
    q: 'Apa syarat kelulusan setiap level KOM?',
    a: 'Kelulusan setiap level memerlukan pemenuhan kehadiran minimum, penyelesaian tugas-tugas yang diberikan, serta ujian akhir pada akhir rangkaian sesi.',
  },
  {
    q: 'Bagaimana cara mendaftar kelas KOM?',
    a: 'Pendaftaran dilakukan melalui formulir online, untuk pendaftaran dan pertanyaan lanjutan, silahkan hubungi koordinator KOM: [Henny](https://wa.me/6285860060050).',
  },
  {
    q: 'Di mana lokasi kelas KOM?',
    a: 'Kelas KOM diadakan ONLINE melalui aplikasi ZOOM. Link Zoom akan diinformasikan setelah pendaftaran dilakukan.',
  },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

/* ── Page ──────────────────────────────────────────────────────── */

export default function KomPage() {
  // Flatten `[label](url)` markdown links into `label (url)` so JSON-LD
  // carries plain text that still surfaces the URL to Google's indexer.
  const flattenMarkdownLinks = (s: string) =>
    s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Provider stub used on every Course — points to GBI BEC with parent org GBI Indonesia nasional
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
        { '@type': 'ListItem', position: 2, name: 'Materi KOM', item: `${siteUrl}/kom` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Materi KOM — Kehidupan Orientasi Melayani',
      description:
        'Program Kehidupan Orientasi Melayani (KOM) di GBI BEC Bandung — pengajaran Firman Tuhan berjenjang. 4 level, 82 sesi, sertifikat resmi kurikulum nasional GBI.',
      url: `${siteUrl}/kom`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      // Voice-search hint — Google Assistant may read these to users asking
      // "what is KOM" / "apa itu KOM di GBI BEC".
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#tentang h2', '#tentang p'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalProgram',
      name: 'Program KOM — Kehidupan Orientasi Melayani',
      alternateName: 'Kehidupan Orientasi Melayani',
      description:
        'Program pengajaran Firman Tuhan berjenjang di GBI BEC Bandung — 4 level progresif dengan total 82 sesi, sertifikat resmi kurikulum nasional Gereja Bethel Indonesia. Diluncurkan tahun 2005 oleh Divisi Pengajaran GBI Jalan Gatot Subroto Jakarta.',
      url: `${siteUrl}/kom`,
      programType: 'Ministry Training',
      educationalProgramMode: 'online',
      inLanguage: 'id-ID',
      timeRequired: 'P82W', // ISO 8601: 82 weekly sessions
      occupationalCategory: 'Church Ministry',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
      },
      provider,
      hasCourse: LEVELS.map((lvl) => ({
        '@type': 'Course',
        name: `KOM ${lvl.level} — ${lvl.title}`,
        alternateName: lvl.subtitle,
        courseCode: `KOM-${lvl.level}`,
        description: lvl.description,
        url: `${siteUrl}/kom/${lvl.level}`,
        inLanguage: 'id-ID',
        educationalLevel: `Level ${lvl.level}`,
        numberOfCredits: lvl.sessions,
        teaches: lvl.series.join(', '),
        provider,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: `PT90M`, // ~1.5h per session — placeholder
          ...(lvl.prerequisite ? { coursePrerequisites: lvl.prerequisite } : {}),
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
        },
      })),
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

      {/* Hero — matches /ibadah-raya pattern: big italic serif over parallax image card */}
      <ActivityHero title="KOM" image="/kegiatan/kom.webp" />

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
              Materi KOM
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Kehidupan Orientasi Melayani.
        </h2>

        {/* Compact info block — mobile + tablet only (desktop uses sticky aside instead) */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Sejak
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">2005</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Level
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">4 level</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Durasi
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">82 sesi</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Sertifikat
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                Kurikulum nasional GBI
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
                  href="#level"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Empat tingkatan
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
                KOM adalah program pengajaran Firman Tuhan berjenjang yang
                disusun oleh sinode{' '}
                <strong className="font-medium text-foreground/90">
                  Gereja Bethel Indonesia
                </strong>{' '}
                — empat level progresif dengan total 82 sesi, membawa jemaat
                dari dasar-dasar iman hingga kepemimpinan pelayanan.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Sejarah
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Program ini diluncurkan tahun 2005 oleh Divisi Pengajaran GBI
                Jalan Gatot Subroto Jakarta, menggantikan program pendahulunya
                Sekolah Orientasi Melayani (SOM) yang berjalan selama 17 tahun.
                Kurikulumnya kini dipakai secara nasional di seluruh gereja
                GBI Indonesia — termasuk GBI BEC.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Filosofi
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Yang membedakan KOM:{' '}
                <strong className="font-medium text-foreground/90">
                  tidak berhenti di teori doktrin
                </strong>{' '}
                — program ini mengajarkan bagaimana mengaplikasikan Firman
                Tuhan dalam kehidupan sehari-hari. Mulai dari pengasuhan anak,
                pengelolaan keuangan, komunikasi, kehidupan pernikahan, hingga
                memulai pelayanan di komunitas terdekat. Visinya sederhana:{' '}
                <em>mempersiapkan umat yang layak</em> — jemaat yang bertumbuh
                dalam iman dan aktif memberi dampak di tempat kerja dan
                lingkungan sekitarnya.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Biaya & Sertifikat
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Seluruh kelas{' '}
                <strong className="font-medium text-foreground/90">
                  tidak dipungut biaya
                </strong>
                . Setiap level yang diselesaikan mendapat sertifikat resmi
                kurikulum nasional Gereja Bethel Indonesia, yang berlaku di
                seluruh GBI di Indonesia.
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
                    Sejak
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">2005</dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Level
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    4 · The Seeker → The Steward
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Durasi
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    82 sesi total
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Sertifikat
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Kurikulum nasional GBI
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
                    href="#level"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Empat tingkatan
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

      {/* 4 Level KOM */}
      <section id="level" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Empat tingkatan untuk bertumbuh.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10">
          KOM dirancang berjenjang — setiap level dibangun di atas yang
          sebelumnya. Perjalanannya mengikuti empat peran rohani: dari{' '}
          <strong className="font-medium text-foreground/85">Pencari</strong> yang
          mengenal Tuhan, menjadi <strong className="font-medium text-foreground/85">Pelayan</strong> yang
          dibentuk karakter dan pelayanannya, dilatih menjadi{' '}
          <strong className="font-medium text-foreground/85">Prajurit</strong> yang
          tangguh dalam peperangan iman, hingga dipersiapkan sebagai{' '}
          <strong className="font-medium text-foreground/85">Penilik</strong> — penatalayan
          yang mengambil tanggung jawab kepemimpinan. Klik level untuk melihat
          rincian seri dan materinya.
        </p>

        <ol className="relative">
          {LEVELS.map((lvl) => (
            <li key={lvl.level} className="border-t border-border/50 last:border-b">
              <Link prefetch={false}
                href={`/kom/${lvl.level}`}
                className="relative flex flex-col sm:flex-row gap-4 sm:gap-0 py-10 sm:py-14 group"
              >
                {/* Meta column */}
                <div className="shrink-0 sm:w-44 sm:pt-1 z-[2]">
                  <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                    KOM {lvl.level} · {lvl.sessions} sesi
                  </span>
                  {lvl.prerequisite && (
                    <p className="mt-2 text-xs text-foreground/50">
                      {lvl.prerequisite}
                    </p>
                  )}
                </div>

                {/* Mobile cover — inline, no rotation */}
                <div className="sm:hidden w-24 shrink-0 aspect-[5/6] overflow-hidden rounded-md ring-1 ring-foreground/10 bg-foreground/[0.04]">
                  <img
                    src={lvl.cover}
                    alt={`Sampul buku KOM ${lvl.level} — ${lvl.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Desktop cover — floating, tilted, overflows row vertically */}
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute left-44 top-1/2 w-44 aspect-[5/6] -translate-y-1/2 rotate-[10deg] z-[1] pointer-events-none transition-transform duration-500 ease-out group-hover:rotate-[4deg] group-hover:scale-[1.05]"
                >
                  <img
                    src={lvl.cover}
                    alt=""
                    className="w-full h-full object-cover rounded-md ring-1 ring-foreground/15"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 sm:pl-56 z-[2]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.02em] leading-[1.2] group-hover:opacity-70 transition-opacity">
                        {lvl.title}
                      </h4>
                      <p className="text-xs text-foreground/45 italic mt-1 mb-3">
                        {lvl.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-foreground/25 shrink-0 mt-1 group-hover:text-foreground/60 group-hover:translate-x-1 transition-[color,transform] duration-300" />
                  </div>
                  <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                    {lvl.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                    {lvl.series.map((s) => (
                      <span
                        key={s}
                        className="text-xs text-foreground/50 before:content-['·'] before:mr-3 before:text-foreground/30 first:before:content-none first:before:mr-0"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Hal penting sebelum mulai */}
      <section id="info" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
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

      {/* Siap mulai? — inverted dark banner */}
      <section id="daftar" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.24 0.022 68) 0%, oklch(0.17 0.016 62) 100%)',
          }}
        >
          {/* Large decorative wordmark */}
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(7rem, 18vw, 16rem)',
              lineHeight: 0.85,
              color: 'oklch(0.82 0.035 72)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            KOM
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.82 0.035 72)', opacity: 0.7 }}
              >
                Pendaftaran
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.82 0.035 72)',
                }}
              >
                Siap mulai perjalanan KOM?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Mulai dari KOM 100. Ada pertanyaan sebelum mendaftar?
                Hubungi koordinator kami.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link prefetch={false}
                href={`/helpdesk?q=${encodeURIComponent('Bagaimana cara mendaftar program KOM di GBI BEC dan apa syarat-syaratnya?')}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <Sparkles className="w-4 h-4" />
                Tanya AI Kami
              </Link>
              <a
                href="https://wa.me/6285860060050"
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
                Hubungi Henny
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
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
