import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Sparkles, ArrowRight } from 'lucide-react';
import ActivityHero from '@/components/kegiatan/activity-hero';
import FAQAccordion from '@/components/kegiatan/faq-accordion';
import Nav from '@/components/landing/nav';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import GrainOverlay from '@/components/grain-overlay';

// Force static generation at build time.
export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export const metadata: Metadata = {
  title: 'Creative Ministry — Seni & Pujian GBI BEC',
  description:
    'Creative Ministry GBI BEC Bandung — enam cabang pelayanan seni: Choir Dewasa, Choir Anak, Balet, Tamborine, Banner, Modern Dance. Latihan setiap Sabtu, terbuka untuk jemaat segala usia.',
  keywords: [
    'Creative Ministry',
    'pelayanan seni gereja',
    'choir GBI Bandung',
    'paduan suara gereja Bandung',
    'tari gereja Bandung',
    'balet gereja',
    'tamborine',
    'banner dance',
    'modern dance gereja',
    'GBI BEC Creative Ministry',
  ],
  alternates: { canonical: '/creative-ministry' },
  openGraph: {
    title: 'Creative Ministry — GBI BEC',
    description:
      'Enam cabang pelayanan seni — Choir Dewasa, Choir Anak, Balet, Tamborine, Banner, Modern Dance. Latihan setiap Sabtu di Baranangsiang.',
    url: `${siteUrl}/creative-ministry`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/* ── Unit data ────────────────────────────────────────────────── */

const UNITS = [
  {
    slug: 'choir-dewasa',
    title: 'Choir Dewasa',
    subtitle: 'Paduan Suara Dewasa',
    age: '17–45 tahun',
    schedule: 'Sabtu · 18:30 WIB',
    description:
      'Pelayanan paduan suara untuk ibadah raya dan acara besar gereja. Latihan vokal, harmoni, dan dinamika panggung — terbuka untuk yang sudah pernah menyanyi maupun yang baru ingin mulai.',
    contact: 'Ibu Fera',
    contactWa: 'https://wa.me/6282119749869',
  },
  {
    slug: 'choir-anak',
    title: 'Choir Anak',
    subtitle: 'Paduan Suara Anak',
    age: '7–13 tahun',
    schedule: 'Sabtu · 15:30 WIB',
    description:
      'Membentuk karakter anak melalui pelayanan pujian. Fokus pada kepercayaan diri, disiplin latihan, dan kecintaan pada Firman Tuhan lewat lagu.',
    contact: 'Ibu Fera',
    contactWa: 'https://wa.me/6282119749869',
  },
  {
    slug: 'balet',
    title: 'Balet',
    subtitle: 'Tarian Balet',
    age: '10 tahun ke atas',
    schedule: 'Sabtu',
    description:
      'Mengekspresikan pujian melalui gerakan balet klasik. Mengajarkan postur, keanggunan, dan kemampuan bercerita lewat tarian — tidak perlu pengalaman sebelumnya.',
    contact: 'Ibu Lia',
    contactWa: 'https://wa.me/6285774910351',
  },
  {
    slug: 'tamborine',
    title: 'Tamborine',
    subtitle: 'Tari Tamborine',
    age: '12 tahun ke atas',
    schedule: 'Sabtu',
    description:
      'Pelayanan tari tamborine — menggabungkan ritme, formasi, dan semangat pujian. Cocok untuk yang suka ekspresi tari yang energik dan bermakna.',
    contact: 'Ibu Lia',
    contactWa: 'https://wa.me/6285774910351',
  },
  {
    slug: 'banner',
    title: 'Banner',
    subtitle: 'Tari Banner',
    age: '10 tahun ke atas',
    schedule: 'Sabtu',
    description:
      'Memuliakan Tuhan melalui tarian bendera pujian. Banner sering menjadi pembuka ibadah — membawa suasana penyembahan yang syahdu sekaligus megah.',
    contact: 'Ibu Lia',
    contactWa: 'https://wa.me/6285774910351',
  },
  {
    slug: 'modern-dance',
    title: 'Modern Dance',
    subtitle: 'Tarian Modern',
    age: '17 tahun ke atas',
    schedule: 'Sabtu',
    description:
      'Pelayanan tari kontemporer dan modern untuk ibadah. Mengeksplorasi gerakan bebas dengan koreografi yang menyatu dengan lagu-lagu pujian masa kini.',
    contact: 'Ibu Lia',
    contactWa: 'https://wa.me/6285774910351',
  },
];

const INFO_ITEMS = [
  {
    title: 'Tidak perlu pengalaman',
    desc: 'Sebagian besar anggota memulai dari nol. Pelatih setiap unit membimbing dari dasar — yang dibutuhkan hanya kemauan untuk hadir rutin dan hati yang mau melayani.',
  },
  {
    title: 'Tanpa iuran',
    desc: 'Semua pelayanan Creative Ministry tidak dipungut biaya. Gereja menyediakan kebutuhan kostum dan perlengkapan untuk ibadah.',
  },
  {
    title: 'Komitmen latihan rutin',
    desc: 'Setiap unit berlatih setiap Sabtu. Kehadiran yang konsisten penting supaya kualitas pelayanan tetap terjaga dan tim bisa saling mengandalkan.',
  },
  {
    title: 'Dua narahubung — satu per cabang',
    desc: 'Ibu Fera menangani Choir Dewasa dan Choir Anak. Ibu Lia menangani Balet, Tamborine, Banner, dan Modern Dance. Hubungi sesuai unit yang diminati.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu Creative Ministry di GBI BEC?',
    a: 'Creative Ministry adalah pelayanan seni dan kreativitas GBI BEC — terdiri dari enam cabang: Choir Dewasa, Choir Anak, Balet, Tamborine, Banner, dan Modern Dance. Pelayanan ini memberi ruang bagi jemaat untuk memuliakan Tuhan melalui suara dan gerakan.',
  },
  {
    q: 'Apa saja cabang pelayanan Creative Ministry?',
    a: 'Enam unit: (1) Choir Dewasa (17–45 tahun), (2) Choir Anak (7–13 tahun), (3) Balet (10 tahun ke atas), (4) Tamborine (12 tahun ke atas), (5) Banner (10 tahun ke atas), (6) Modern Dance (17 tahun ke atas). Semua latihan setiap Sabtu di Baranangsiang.',
  },
  {
    q: 'Kapan dan di mana latihan diadakan?',
    a: 'Latihan diadakan setiap hari Sabtu di Baranangsiang. Choir Anak latihan pukul 15:30, Choir Dewasa pukul 18:30. Unit tari lainnya (Balet, Tamborine, Banner, Modern Dance) juga berlatih setiap Sabtu — detail waktu dikonfirmasi langsung oleh pelatih setelah kamu mendaftar.',
  },
  {
    q: 'Apakah ada biaya untuk ikut Creative Ministry?',
    a: 'Tidak. Seluruh pelayanan Creative Ministry tidak dipungut biaya. Gereja juga menyediakan kebutuhan kostum dan perlengkapan untuk keperluan ibadah.',
  },
  {
    q: 'Saya tidak punya pengalaman sebelumnya, boleh ikut?',
    a: 'Boleh. Sebagian besar anggota memulai dari nol. Pelatih setiap unit membimbing dari dasar — yang dibutuhkan hanya kemauan untuk hadir rutin, komitmen terhadap latihan, dan hati yang mau melayani Tuhan.',
  },
  {
    q: 'Apakah ada audisi untuk bergabung?',
    a: 'Tidak ada audisi formal. Pelatih akan mengenalkanmu pada materi secara bertahap. Fokusnya adalah pertumbuhan, bukan seleksi — setiap anggota diberi kesempatan untuk berkembang.',
  },
  {
    q: 'Berapa usia minimal dan maksimal untuk ikut?',
    a: 'Berbeda-beda per unit. Choir Anak khusus usia 7–13 tahun. Choir Dewasa 17–45 tahun. Balet dan Banner mulai 10 tahun ke atas. Tamborine mulai 12 tahun ke atas. Modern Dance mulai 17 tahun ke atas. Pilih unit yang sesuai dengan usia.',
  },
  {
    q: 'Apa bedanya Banner dengan Tamborine?',
    a: 'Banner adalah tarian menggunakan bendera pujian — sering membuka ibadah dengan suasana penyembahan yang megah dan syahdu. Tamborine menggunakan alat musik perkusi tamborine yang digerakkan dengan ritme — lebih energik dan ritmis. Keduanya sama-sama bentuk tarian yang memuliakan Tuhan, hanya beda alat dan karakter.',
  },
  {
    q: 'Apakah saya perlu menjadi anggota GBI BEC (ber-KAJ) untuk bergabung?',
    a: 'Ideal jika sudah menjadi jemaat rutin GBI BEC. Bagi yang belum ber-KAJ tetapi beribadah secara konsisten di GBI BEC, silakan diskusikan dengan narahubung unit terkait — keputusan akhir ada pada koordinator masing-masing unit.',
  },
  {
    q: 'Bagaimana cara bergabung dengan Creative Ministry?',
    a: 'Tentukan dulu unit yang diminati, lalu hubungi narahubung sesuai cabang: Choir (Dewasa/Anak) → [Ibu Fera](https://wa.me/6282119749869). Balet, Tamborine, Banner, Modern Dance → [Ibu Lia](https://wa.me/6285774910351). Bisa juga mampir ke sesi latihan Sabtu untuk berkenalan langsung dengan tim.',
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function CreativeMinistryPage() {
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
          name: 'Creative Ministry',
          item: `${siteUrl}/creative-ministry`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Creative Ministry — Seni & Pujian GBI BEC',
      description:
        'Enam cabang pelayanan seni GBI BEC Bandung: Choir Dewasa, Choir Anak, Balet, Tamborine, Banner, Modern Dance. Latihan setiap Sabtu.',
      url: `${siteUrl}/creative-ministry`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#tentang h2', '#tentang p'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Creative Ministry GBI BEC',
      description:
        'Pelayanan seni dan kreativitas GBI Baranangsiang Evening Church — enam cabang: Choir Dewasa, Choir Anak, Balet, Tamborine, Banner, Modern Dance.',
      url: `${siteUrl}/creative-ministry`,
      parentOrganization: organizer,
      subOrganization: UNITS.map((u) => ({
        '@type': 'Organization',
        name: u.title,
        alternateName: u.subtitle,
        description: u.description,
        url: `${siteUrl}/creative-ministry#${u.slug}`,
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

      {/* Hero */}
      <ActivityHero
        title="Creative Ministry"
        image="/kegiatan/creative-ministry.webp"
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
              Creative Ministry
            </li>
          </ol>
        </nav>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1]">
          Seni sebagai bahasa pujian.
        </h2>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Cabang
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">6 unit</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Latihan
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Sabtu</dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Usia
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Mulai 7 thn</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Audisi
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">Tidak ada</dd>
            </div>
          </dl>

          <nav aria-label="Navigasi halaman">
            <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
              Di halaman ini
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
              <li>
                <a
                  href="#unit"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Enam cabang
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
                  href="#gabung"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Bergabung
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
                Creative Ministry adalah pelayanan{' '}
                <strong className="font-medium text-foreground/90">
                  seni dan kreativitas
                </strong>{' '}
                GBI BEC — wadah bagi jemaat untuk memuliakan Tuhan melalui
                suara dan gerakan. Terdiri dari enam cabang, semuanya berlatih
                rutin setiap Sabtu di Baranangsiang.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Filosofi
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Bagi kami, seni adalah{' '}
                <em className="text-foreground/60">
                  bahasa pujian yang sama kudusnya
                </em>{' '}
                seperti doa dan khotbah. Setiap suara yang bergema, setiap
                gerak yang mengalir — adalah persembahan. Karena itu fokus kami
                bukan pada seleksi, tapi pada pertumbuhan: siapa pun yang mau
                datang, dilatih, dan melayani, diberi ruang.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Untuk{' '}
                <strong className="font-medium text-foreground/90">
                  segala usia
                </strong>{' '}
                — mulai dari anak-anak 7 tahun di Choir Anak, hingga dewasa di
                Choir Dewasa dan Modern Dance. Setiap cabang punya rentang usia
                yang berbeda, jadi ada tempat untuk hampir semua anggota
                keluarga.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Tanpa audisi, tanpa biaya
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                Tidak ada audisi formal dan tidak ada biaya keanggotaan.
                Kostum dan perlengkapan untuk ibadah disediakan gereja. Yang
                diminta hanyalah{' '}
                <strong className="font-medium text-foreground/90">
                  komitmen untuk hadir rutin
                </strong>{' '}
                — karena pelayanan yang baik lahir dari latihan yang konsisten.
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
                    Cabang
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    6 unit pelayanan
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Jadwal
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Setiap Sabtu
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Usia
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Mulai 7 tahun
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Audisi
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Tidak ada
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
                    href="#unit"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Enam cabang pelayanan
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
                    href="#gabung"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Cara bergabung
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

      {/* 6 Unit */}
      <section
        id="unit"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Enam cabang pelayanan.
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10 max-w-2xl">
          Masing-masing punya karakter dan rentang usia yang berbeda — pilih
          satu (atau beberapa) yang paling sesuai dengan hati dan ritme hidupmu.
        </p>
        <ol className="relative">
          {UNITS.map((unit) => (
            <li
              id={unit.slug}
              key={unit.slug}
              className="border-t border-border/50 last:border-b scroll-mt-24"
            >
              <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-0 py-8 sm:py-10">
                {/* Meta column */}
                <div className="shrink-0 sm:w-52 sm:pt-1">
                  <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                    {unit.title}
                  </span>
                  <p className="mt-2 text-xs text-foreground/55">{unit.age}</p>
                  <p className="mt-0.5 text-xs text-foreground/55">
                    {unit.schedule}
                  </p>
                </div>

                {/* Content column */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.02em] leading-[1.2]">
                        {unit.subtitle}
                      </h4>
                    </div>
                  </div>
                  <p className="mt-3 text-base sm:text-lg text-foreground/70 leading-relaxed">
                    {unit.description}
                  </p>
                  <a
                    href={unit.contactWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors underline-offset-4 hover:underline decoration-foreground/30"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Hubungi {unit.contact}
                  </a>
                </div>
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

      {/* Siap gabung? — amber/gold banner matching creative poster theme */}
      <section
        id="gabung"
        className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24"
      >
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.24 0.045 68) 0%, oklch(0.15 0.03 60) 100%)',
          }}
        >
          <span
            className="absolute -bottom-6 -right-2 lg:-bottom-8 lg:-right-6 font-serif font-bold italic select-none pointer-events-none z-[1]"
            style={{
              fontSize: 'clamp(5rem, 13vw, 12rem)',
              lineHeight: 0.85,
              color: 'oklch(0.88 0.1 85)',
              opacity: 0.08,
            }}
            aria-hidden="true"
          >
            Creative
          </span>

          <div className="relative z-[2] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs tracking-[0.2em] font-semibold uppercase mb-4"
                style={{ color: 'oklch(0.88 0.1 85)', opacity: 0.7 }}
              >
                Bergabung
              </p>
              <h3
                className="font-serif font-bold leading-[1.05] tracking-[-0.03em]"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  color: 'oklch(0.92 0.08 85)',
                }}
              >
                Siap menjadikan seni bagian dari pelayananmu?
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Hubungi narahubung sesuai unit yang diminati — Ibu Fera untuk
                choir, Ibu Lia untuk balet, tamborine, banner, dan modern
                dance. Atau mampir langsung ke latihan Sabtu untuk berkenalan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/6282119749869"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                <ArrowRight className="w-4 h-4" />
                Hubungi Ibu Fera
              </a>
              <a
                href="https://wa.me/6285774910351"
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
                Hubungi Ibu Lia
              </a>
              <Link prefetch={false}
                href={`/helpdesk?q=${encodeURIComponent('Bagaimana cara bergabung dengan Creative Ministry GBI BEC?')}`}
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
