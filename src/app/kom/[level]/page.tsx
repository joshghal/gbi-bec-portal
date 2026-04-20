import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Sparkles, Phone } from 'lucide-react';
import Nav from '@/components/landing/nav';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import GrainOverlay from '@/components/grain-overlay';

// Force static generation at build time — same treatment as /kom and /ibadah-raya.
export const dynamic = 'force-static';

interface KomData {
  level: number;
  title: string;
  subtitle: string;
  sessions: number;
  year: number;
  pdfFile: string | null;
  /** Short "Tentang" — positioning of this level, 1-2 sentences. */
  intro: string;
  /** "Yang akan dipelajari" — topical coverage, can be dense. */
  covers: string;
  /** "Untuk siapa" — target audience + prereq framing. */
  audience: string;
  series: { code: string; name: string; count: number; topics: string[] }[];
  jadwal?: string;
}

const KOM_DATA: Record<string, KomData> = {
  '100': {
    level: 100,
    title: 'Pencari Tuhan',
    subtitle: 'The Seeker',
    sessions: 27,
    year: 2005,
    pdfFile: '/kom/KOM-100-Pencari-Tuhan.pdf',
    jadwal: 'Online setiap hari Kamis pukul 18:30 WIB',
    intro:
      'Level fondasi dalam perjalanan KOM — dirancang untuk siapa saja yang ingin mengenal Tuhan secara utuh dan membangun dasar iman yang kokoh.',
    covers:
      'Dasar-dasar doktrin Kristen (dosa, keselamatan, baptisan air dan Roh Kudus), pertumbuhan iman yang sehat (doa, saat teduh, mendengar suara Tuhan, kehidupan dalam kelompok sel), pengenalan mendalam akan Allah Tritunggal dan karya salib Kristus, serta bagaimana kehidupan kita bisa menjadi berkat di tempat kerja dan lingkungan sekitar.',
    audience:
      'Terbuka untuk semua jemaat dan simpatisan, tanpa prasyarat. Kalau kamu baru mengenal iman Kristen atau ingin memperbarui pondasi rohanimu, level ini tempat yang tepat untuk mulai.',
    series: [
      {
        code: '110',
        name: 'Dasar-dasar Kekristenan',
        count: 7,
        topics: ['Hidup manusia', 'Kejatuhan manusia', 'Keselamatan', 'Berkat keselamatan', 'Baptisan air', 'Baptisan Roh Kudus', 'Hidup dalam Firman Allah'],
      },
      {
        code: '120',
        name: 'Kekristenan yang Bertumbuh',
        count: 7,
        topics: ['Doa, pujian, dan penyembahan', 'Saat teduh', 'Mendengar suara Tuhan', 'Tertanam dalam gereja lokal', 'Kehidupan dalam kelompok sel', 'Bertekun dalam iman', 'Kedewasaan rohani'],
      },
      {
        code: '130',
        name: 'Mengenal Allah',
        count: 7,
        topics: ['Mengenal Allah yang benar', 'Firman yang menjadi manusia', 'Kuasa salib Kristus', 'Pribadi Roh Kudus', 'Buah Roh Kudus', 'Kedatangan Kristus yang kedua', 'Menantikan pengharapan yang mulia'],
      },
      {
        code: '140',
        name: 'Kehidupan yang Memberi Dampak',
        count: 6,
        topics: ['Kehidupan yang menjadi berkat', 'Bersaksi bagi Kristus', 'Menemukan panggilan pelayanan', 'Sembilan karunia Roh Kudus', 'Memulai pelayanan', 'Komitmen untuk memberi dampak'],
      },
    ],
  },
  '200': {
    level: 200,
    title: 'Pelayan Tuhan',
    subtitle: 'The Servant',
    sessions: 23,
    year: 2005,
    pdfFile: '/kom/KOM-200-Pelayan-Tuhan.pdf',
    jadwal: 'Online setiap hari Kamis pukul 18:30 WIB',
    intro:
      'Tingkat lanjutan setelah KOM 100 — fokus pada pembentukan karakter seorang pelayan Tuhan dan pendalaman Firman yang dipakai di kehidupan sehari-hari.',
    covers:
      'Delapan ucapan bahagia dari khotbah di bukit (Matius 5:3–10), pendalaman Alkitab (Perjanjian Lama, Perjanjian Baru, studi induktif, agama-agama dunia), kehidupan Kristen yang berbuah di berbagai aspek (komunikasi pribadi, persahabatan, pengendalian emosi, pernikahan, pengasuhan anak, dunia kerja, pengelolaan keuangan), hingga pengenalan dasar-dasar pelayanan konseling dan khotbah.',
    audience:
      'Untuk jemaat yang sudah lulus KOM 100 dan ingin bertumbuh lebih jauh — baik yang sedang mempertimbangkan peran pelayanan, maupun yang ingin memperdalam praktik Kekristenan di rumah tangga dan tempat kerja.',
    series: [
      {
        code: '210',
        name: 'Karakter Pelayan Tuhan',
        count: 8,
        topics: ['Orang yang miskin hatinya', 'Orang yang berduka cita', 'Orang yang lemah lembut', 'Orang yang lapar dan haus akan kebenaran', 'Orang yang murah hati', 'Orang yang suci hatinya', 'Orang yang membawa damai', 'Orang yang dianiaya karena kebenaran'],
      },
      {
        code: '220',
        name: 'Pengetahuan Alkitab',
        count: 4,
        topics: ['Mengenal Perjanjian Lama', 'Mengenal Perjanjian Baru', 'Studi Alkitab induktif', 'Agama-agama dunia'],
      },
      {
        code: '230',
        name: 'Kehidupan Kristen',
        count: 9,
        topics: ['Komunikasi pribadi', 'Membangun dan membina persahabatan', 'Pengendalian emosi', 'Memilih pasangan hidup', 'Kehidupan nikah Kristiani', 'Mendidik anak', 'Panggilan hidup dalam dunia kerja', 'Strategi kehidupan yang berhasil', 'Mengelola keuangan Anda'],
      },
      {
        code: '240',
        name: 'Pengenalan Pelayanan',
        count: 2,
        topics: ['Pelayanan konseling', 'Pelayanan khotbah'],
      },
    ],
  },
  '300': {
    level: 300,
    title: 'Prajurit Tuhan',
    subtitle: 'The Soldier',
    sessions: 16,
    year: 2008,
    pdfFile: null,
    jadwal: 'Online setiap hari Rabu pukul 18:30 WIB',
    intro:
      'Tingkat prajurit rohani — melatih kedalaman iman, ketahanan dalam peperangan rohani, dan pola hidup seorang prajurit Tuhan yang tangguh.',
    covers:
      'Disiplin rohani dan takut akan Tuhan, pemakaian selengkap senjata Allah, pola doa-pujian-penyembahan yang dinamis (termasuk pemulihan Pondok Daud dan peran prajurit penyembah), lima karakteristik pelayanan gereja (terobosan transformasi, doa-pujian-penyembahan, perluasan Kerajaan Allah, pendewasaan jemaat, doktrin gereja), hingga cara menegakkan Kerajaan Allah di dalam gereja, dunia kerja, dan seluruh bumi.',
    audience:
      'Untuk peserta yang sudah lulus KOM 200 — dirancang bagi mereka yang ingin memperkuat ketahanan rohani, memperdalam penyembahan yang dinamis, dan terlibat aktif memperluas Kerajaan Allah.',
    series: [
      {
        code: '310',
        name: 'Karakter Prajurit',
        count: 4,
        topics: ['Kedalaman rohani melalui disiplin', 'Takut akan Tuhan', 'Selengkap senjata Allah', 'Berbaris sebagai Tentara Allah'],
      },
      {
        code: '320',
        name: 'Prajurit Doa, Pujian, dan Penyembahan',
        count: 3,
        topics: ['Peta jalan seorang prajurit', 'Pemulihan Pondok Daud', 'Prajurit Penyembah'],
      },
      {
        code: '330',
        name: 'Lima Karakteristik Pelayanan',
        count: 5,
        topics: ['Terobosan ke arah transformasi', 'Doa, pujian, dan penyembahan yang dinamis', 'Memperluas Kerajaan Allah', 'Mendewasakan jemaat', 'Meletakkan doktrin gereja'],
      },
      {
        code: '340',
        name: 'Menegakkan Kerajaan Allah',
        count: 4,
        topics: ['Hakikat Kerajaan Allah', 'Kerajaan Allah di dalam gereja', 'Kerajaan Allah di dalam dunia kerja', 'Kerajaan Allah di seluruh bumi'],
      },
    ],
  },
  '400': {
    level: 400,
    title: 'Penilik Tuhan',
    subtitle: 'The Steward',
    sessions: 16,
    year: 2015,
    pdfFile: null,
    intro:
      'Level puncak dalam program KOM — mempersiapkan pemimpin rohani yang utuh, otentik dalam karakter, dan siap membagikan kehidupannya untuk membina orang lain.',
    covers:
      'Empat seri yang membangun di atas satu sama lain — Authentic (fondasi kehidupan, memelihara kehidupan batiniah, tujuh kekuatan kehidupan), Broken Hearted (kehancuran hati yang membawa terobosan, karakter dan kondisi hati, hidup bebas dari ketersinggungan), Courageous (tujuh nilai hidup yang berkenan, tujuh unsur kepemimpinan kredibel, mencetak seorang murid, menginvestasikan hidup), dan Destiny Driven (mengenali musim kehidupan, panggilan dan tujuan hidup, timeline pelayanan, menjadi pengubah masa depan).',
    audience:
      'Untuk peserta yang sudah lulus KOM 300 dan siap masuk peran kepemimpinan — baik di dalam pelayanan gereja, kelompok sel, maupun di bidang pelayanan profesional yang sedang mereka kerjakan.',
    series: [
      {
        code: '410',
        name: 'Authentic',
        count: 4,
        topics: ['Fondasi kehidupan', 'Memelihara kehidupan batiniah', 'Kehidupan pribadi seorang pemimpin', 'Tujuh kekuatan kehidupan yang berharga'],
      },
      {
        code: '420',
        name: 'Broken Hearted',
        count: 4,
        topics: ['Terobosan melalui kehancuran hati', 'Perilaku, karakter, dan kondisi hati', 'Anak-anak dalam keluarga rohani', 'Hidup bebas dari ketersinggungan'],
      },
      {
        code: '430',
        name: 'Courageous',
        count: 4,
        topics: ['Tujuh nilai untuk hidup yang berkenan', 'Tujuh unsur kepemimpinan yang kredibel', 'Mencetak seorang murid', 'Menginvestasikan hidup'],
      },
      {
        code: '440',
        name: 'Destiny Driven',
        count: 4,
        topics: ['Mengenali musim-musim kehidupan', 'Panggilan dan tujuan hidup', 'Timeline pelayanan', 'Pembuat sejarah dan pengubah masa depan'],
      },
    ],
  },
};

export function generateStaticParams() {
  return [{ level: '100' }, { level: '200' }, { level: '300' }, { level: '400' }];
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const kom = KOM_DATA[level];
  if (!kom) return { title: 'Tidak Ditemukan' };

  const description = `Materi KOM ${level} — ${kom.title} (${kom.subtitle}). ${kom.sessions} sesi kurikulum GBI di GBI BEC Bandung. Kelas rohani berjenjang dengan sertifikat resmi GBI.`;
  return {
    title: `KOM ${level} — ${kom.title}`,
    description,
    keywords: [
      `KOM ${level}`,
      kom.title,
      kom.subtitle,
      'GBI BEC',
      'materi KOM',
      'kurikulum GBI',
      'kelas rohani Bandung',
    ],
    alternates: { canonical: `/kom/${level}` },
    openGraph: {
      title: `KOM ${level} — ${kom.title}`,
      description,
      url: `${siteUrl}/kom/${level}`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function KomLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const kom = KOM_DATA[level];

  if (!kom) notFound();

  const prereqList =
    kom.level === 100
      ? null
      : Array.from({ length: (kom.level - 100) / 100 }, (_, i) => `KOM ${(i + 1) * 100}`)
          .join(', ')
          .replace(/, ([^,]*)$/, ' dan $1');

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

  // All topics across all four series — useful for Course.teaches field so
  // Google understands the subject matter of this level.
  const allTopics = kom.series.flatMap((s) => s.topics);

  // Compose a full-prose description from the split fields — used for
  // schema.org Course.description and WebPage.description (SEO snippets).
  const fullDescription = `${kom.intro} ${kom.covers} ${kom.audience}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Materi KOM', item: `${siteUrl}/kom` },
        { '@type': 'ListItem', position: 3, name: `KOM ${kom.level} — ${kom.title}`, item: `${siteUrl}/kom/${kom.level}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `KOM ${kom.level} — ${kom.title}`,
      alternateName: kom.subtitle,
      description: fullDescription,
      url: `${siteUrl}/kom/${kom.level}`,
      courseCode: `KOM-${kom.level}`,
      inLanguage: 'id-ID',
      educationalLevel: `Level ${kom.level}`,
      numberOfCredits: kom.sessions,
      teaches: allTopics.join(', '),
      about: kom.series.map((s) => s.name),
      provider,
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT90M',
        ...(kom.jadwal ? { name: kom.jadwal } : {}),
        ...(prereqList ? { coursePrerequisites: `Lulus ${prereqList}` } : {}),
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
      },
      isPartOf: {
        '@type': 'EducationalOccupationalProgram',
        name: 'Program KOM — Kehidupan Orientasi Melayani',
        url: `${siteUrl}/kom`,
      },
      ...(kom.pdfFile
        ? {
            hasPart: {
              '@type': 'DigitalDocument',
              name: `Buku Materi KOM ${kom.level} — ${kom.title}`,
              url: `${siteUrl}${kom.pdfFile}`,
              encodingFormat: 'application/pdf',
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `KOM ${kom.level} — ${kom.title}`,
      description: fullDescription,
      url: `${siteUrl}/kom/${kom.level}`,
      inLanguage: 'id-ID',
      isPartOf: { '@type': 'WebSite', name: 'GBI BEC', url: siteUrl },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'main p:first-of-type'],
      },
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

      {/* Big statement (with breadcrumb as eyebrow) */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-16 lg:pb-24">
        <nav aria-label="Breadcrumb" className="mb-8 lg:mb-12">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-foreground/50 flex-wrap">
            <li>
              <Link prefetch={false}
                href="/"
                className="hover:text-foreground/80 transition-colors underline-offset-2 hover:underline"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-foreground/30">/</li>
            <li>
              <Link prefetch={false}
                href="/kom"
                className="hover:text-foreground/80 transition-colors underline-offset-2 hover:underline"
              >
                Materi KOM
              </Link>
            </li>
            <li aria-hidden="true" className="text-foreground/30">/</li>
            <li aria-current="page" className="text-foreground/70">
              KOM {kom.level}
            </li>
          </ol>
        </nav>

        <p className="text-xs tracking-[0.25em] text-muted-foreground font-medium uppercase mb-5">
          KOM {kom.level} · {kom.sessions} sesi · Sejak {kom.year}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-3">
          {kom.title}
        </h1>
        <p className="font-serif text-xl sm:text-2xl italic text-foreground/50 mb-8">
          {kom.subtitle}
        </p>

        {/* Compact info block — mobile + tablet only */}
        <div className="lg:hidden mt-8 border-t border-b border-border/60 py-5 space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Level
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                KOM {kom.level}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Sesi
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                {kom.sessions} sesi
              </dd>
            </div>
            <div>
              <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                Prasyarat
              </dt>
              <dd className="mt-0.5 text-foreground/85 font-medium">
                {prereqList ? `Lulus ${prereqList}` : 'Tidak ada'}
              </dd>
            </div>
            {kom.jadwal && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-foreground/45 text-[10px] uppercase tracking-wider">
                  Jadwal
                </dt>
                <dd className="mt-0.5 text-foreground/85 font-medium">
                  {kom.jadwal}
                </dd>
              </div>
            )}
          </dl>

          {kom.pdfFile && (
            <a
              href={kom.pdfFile}
              download
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors underline-offset-4 hover:underline"
            >
              <Download className="w-4 h-4" />
              Download Buku Materi (PDF)
            </a>
          )}

          <nav aria-label="Navigasi halaman">
            <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
              Di halaman ini
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
              <li>
                <a
                  href="#materi"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Daftar materi
                </a>
              </li>
              <li aria-hidden="true" className="text-foreground/25">·</li>
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
                  href="#daftar"
                  className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Pendaftaran
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop two-column: labeled prose left, sticky aside right */}
        <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-16">
          <div className="space-y-10 max-w-2xl">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Tentang
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                {kom.intro}
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Yang akan dipelajari
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                {kom.covers}
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-3">
                Untuk siapa
              </p>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
                {kom.audience}
              </p>
            </div>
          </div>

          {/* Desktop sticky aside */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <div className="border-t border-border/60 pt-5">
              <p className="text-[10px] tracking-[0.25em] text-foreground/40 font-semibold uppercase mb-5">
                Gambaran Cepat
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Level
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    KOM {kom.level} · {kom.subtitle}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Sesi
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    {kom.sessions} sesi ({kom.series.length} seri)
                  </dd>
                </div>
                {kom.jadwal && (
                  <div>
                    <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                      Jadwal
                    </dt>
                    <dd className="mt-0.5 text-foreground/85 font-medium">
                      {kom.jadwal}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Prasyarat
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    {prereqList ? `Lulus ${prereqList}` : 'Tidak ada'}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/50 text-xs uppercase tracking-wider">
                    Biaya
                  </dt>
                  <dd className="mt-0.5 text-foreground/85 font-medium">
                    Gratis
                  </dd>
                </div>
              </dl>

              {kom.pdfFile && (
                <a
                  href={kom.pdfFile}
                  download
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors underline-offset-4 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Download Buku Materi (PDF)
                </a>
              )}
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
                    href="#materi"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Daftar materi
                  </a>
                </li>
                <li>
                  <a
                    href="#prasyarat"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Prasyarat
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
              </ul>
            </nav>
          </aside>
        </div>
      </section>

      {/* Daftar Materi — hairline list */}
      <section id="materi" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Empat seri dalam level ini.
        </h2>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10">
          Materi KOM {kom.level} dibagi menjadi empat seri — setiap seri
          mencakup beberapa sesi mingguan yang saling melengkapi.
        </p>

        <ol className="relative">
          {kom.series.map((s) => (
            <li
              key={s.code}
              className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-8 border-t border-border/50 last:border-b"
            >
              <div className="shrink-0 sm:w-48 pt-1">
                <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                  KOM {s.code} · {s.count} sesi
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-[-0.02em] leading-[1.2] mb-4">
                  {s.name}
                </h3>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {s.topics.map((topic) => (
                    <li
                      key={topic}
                      className="text-sm text-foreground/65 before:content-['·'] before:mr-3 before:text-foreground/30 first:before:content-none first:before:mr-0"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Prasyarat */}
      <section id="prasyarat" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Prasyarat.
        </h2>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
          {kom.level === 100 ? (
            <>
              KOM 100 adalah level awal — terbuka untuk{' '}
              <strong className="font-medium text-foreground/85">
                semua jemaat dan umum
              </strong>
              , tidak memerlukan prasyarat apa pun. Kamu bisa langsung
              mendaftar dan mulai dari level ini.
            </>
          ) : (
            <>
              Untuk mengikuti KOM {kom.level}, peserta diharapkan sudah{' '}
              <strong className="font-medium text-foreground/85">
                lulus {prereqList}
              </strong>
              . Setiap level dirancang berjenjang agar pondasi iman
              terbangun secara bertahap.
            </>
          )}
        </p>
      </section>

      {/* CTA banner — same dark brown pattern as /kom */}
      <section id="daftar" className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24 scroll-mt-24">
        <div
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-14"
          style={{
            background:
              'linear-gradient(140deg, oklch(0.24 0.022 68) 0%, oklch(0.17 0.016 62) 100%)',
          }}
        >
          {/* Large decorative number */}
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
            {kom.level}
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
                Ikuti KOM {kom.level} — {kom.title}.
              </h3>
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Pendaftaran gratis. Ada pertanyaan sebelum mendaftar?
                Hubungi koordinator KOM untuk info lanjutan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link prefetch={false}
                href={`/helpdesk?q=${encodeURIComponent(`Bagaimana cara mendaftar KOM ${kom.level} — ${kom.title} di GBI BEC dan apa syaratnya?`)}`}
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

      <ContactSection />

      <Footer />
    </div>
  );
}
