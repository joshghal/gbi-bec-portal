import type { Metadata } from 'next';
import Nav from '@/components/landing/nav';
import ActivityHero from '@/components/kegiatan/activity-hero';
import ContactSection from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import GrainOverlay from '@/components/grain-overlay';
import FAQAccordion from '@/components/kegiatan/faq-accordion';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

// Force static generation at build time — the page has zero dynamic data,
// so Next.js can emit pure HTML + hydrate the client islands (Nav, hero,
// accordion) on the client. Explicit flag guards against accidental
// regressions if someone later adds a cookie/header read.
export const dynamic = 'force-static';

const TIMELINE = [
  {
    duration: '15–20 menit sebelum',
    title: 'Tiba di gereja',
    desc: 'Datang lebih awal supaya bisa parkir dengan tenang dan memilih tempat duduk. Tim usher akan menyambut di pintu masuk — jangan ragu bertanya kalau butuh arah atau informasi.',
  },
  {
    duration: '~30 menit',
    title: 'Pujian & Penyembahan',
    desc: 'Ibadah dibuka dengan pujian & penyembahan yang dibawakan oleh pemimpin pujian dan tim musik.'
  },
  {
    duration: '~10 menit',
    title: 'Pengumuman, Persembahan, & Doa Syafaat',
    desc: 'Update singkat mengenai kegiatan gereja, sambutan bagi tamu baru, persembahan dan doa syafaat sebelum masuk ke firman Tuhan.',
  },
  {
    duration: '~45 menit',
    title: 'Firman Tuhan',
    desc: 'Khotbah disampaikan oleh gembala atau pendeta tamu. Ayat yang dibahas ditampilkan di layar.',
  },
  {
    duration: '~15 menit',
    title: 'Perjamuan Kudus (Tentatif) & Doa Berkat',
    desc: 'Ibadah dilanjutkan dengan perjamuan kudus pada minggu kedua setiap bulannya dan ditutup dengan doa berkat.',
  },
  {
    duration: 'sekitar 18.30',
    title: 'Ramah-tamah',
    desc: 'Lobby tetap terbuka untuk bercakap-cakap atau berkenalan. Kalau kamu baru pertama kali datang, cari tim welcoming — mereka senang berkenalan dan bisa menjawab pertanyaan lanjutan.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apakah perlu mendaftar dulu sebelum hadir?',
    a: 'Tidak perlu. Ibadah Raya adalah ibadah umum dan tidak memerlukan registrasi. Kamu bisa langsung datang sesuai jadwal — setiap Minggu pukul 17:00 WIB.',
  },
  {
    q: 'Apakah perlu membawa Alkitab sendiri?',
    a: 'Tidak wajib. Ayat-ayat yang dibahas akan ditampilkan di layar selama khotbah. Kamu juga bisa mengikuti dari aplikasi Alkitab di HP. Kalau ingin membawa Alkitab sendiri, tentu dipersilakan.',
  },
  {
    q: 'Aliran atau denominasi apa GBI BEC?',
    a: 'GBI BEC berada di bawah sinode Gereja Bethel Indonesia (GBI), yaitu denominasi Pentakosta-Karismatik. Kami mengakui Alkitab sebagai firman Tuhan, percaya kepada Allah Tritunggal, keselamatan hanya melalui Yesus Kristus, dan karya Roh Kudus dalam kehidupan orang percaya.',
  },
  {
    q: 'Berapa lama durasi ibadah?',
    a: 'Sekitar 90 hingga 120 menit — dimulai pukul 17:00 WIB dan selesai sekitar pukul 19:00 WIB. Durasi bisa sedikit bervariasi tergantung rangkaian acara di minggu tersebut.',
  },
  {
    q: 'Apakah ibadah disiarkan secara online?',
    a: 'Ya. Ibadah Raya disiarkan langsung melalui kanal [YouTube GBI Baranangsiang Evening Church](https://www.youtube.com/@gbibaranangsiangsukawarna7008). Kamu bisa mengikuti dari mana saja kalau tidak memungkinkan datang langsung, atau menonton ulang dari arsip video.',
  },
  {
    q: 'Apakah anak-anak aman di Sekolah Minggu?',
    a: 'Ya. Sekolah Minggu ditangani oleh guru dan kakak sekolah minggu. Anak-anak usia 4–13 tahun berada di ruangan terpisah selama ibadah berlangsung, dan orang tua bisa menjemput kembali setelah ibadah selesai.',
  },
  {
    q: 'Apakah ada dress code tertentu?',
    a: 'Tidak ada aturan khusus. Cukup kenakan pakaian yang sopan dan rapi — tidak perlu formal, tidak perlu mahal. Kenyamananmu yang paling penting.',
  },
  {
    q: 'Di mana alamat GBI BEC dan bagaimana cara ke sana?',
    a: 'GBI BEC berlokasi di Jl. Baranang Siang No. 8, Kecamatan Sumur Bandung, Kota Bandung 40112 — tidak jauh dari Jl. Asia Afrika dan kawasan Braga, jadi cukup mudah dijangkau dari pusat kota. Bagi yang menggunakan transportasi umum, Stasiun Cikudapateuh berjarak sekitar 700 meter (jalan kaki ~10 menit), sementara Stasiun Bandung sekitar 4 km atau 15 menit naik ojek online. Kalau memesan ojek atau taksi online, cukup ketik tujuan "GBI Baranangsiang" dan driver akan mengantar langsung ke depan gereja.',
  },
  {
    q: 'Apakah tersedia tempat parkir?',
    a: 'Ya. Tersedia area parkir motor di sekitar gedung, dan parkir mobil di basement dengan kapasitas sekitar 50 kendaraan. Untuk keamanan, harap ikuti arahan petugas parkir.',
  },
  {
    q: 'Apakah ada kegiatan gereja selain hari Minggu?',
    a: 'Ya. Selain Ibadah Raya di hari Minggu, GBI BEC juga mengadakan kelompok sel COOL (Selasa), program pengajaran KOM (Rabu & Kamis), dan latihan Creative Ministry (Sabtu). Detail lengkap bisa dilihat di bagian Kegiatan halaman beranda.',
  },
];

export const metadata: Metadata = {
  title: 'Ibadah Raya — Kebaktian Minggu Sore',
  description:
    'Ibadah Minggu sore di pusat Bandung, pukul 17:00 WIB. Terbuka untuk semua. Sekolah Minggu anak 4–13, parkir basement, dekat Stasiun Cikudapateuh.',
  keywords: [
    'ibadah minggu bandung',
    'gereja bandung minggu sore',
    'GBI BEC ibadah',
    'kebaktian minggu GBI Baranangsiang',
    'ibadah raya GBI Bandung',
    'gereja Bethel Indonesia Bandung',
  ],
  alternates: { canonical: '/ibadah-raya' },
  openGraph: {
    title: 'Ibadah Raya — GBI BEC',
    description:
      'Setiap Minggu pukul 17:00 WIB. Bergabunglah bersama komunitas BEC di Bandung.',
    url: `${siteUrl}/ibadah-raya`,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function IbadahRayaPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Ibadah Raya',
        item: `${siteUrl}/ibadah-raya`,
      },
    ],
  };

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Ibadah Raya GBI BEC',
    description:
      'Kebaktian utama GBI Baranangsiang Evening Church setiap Minggu sore, pukul 17:00 WIB.',
    image: [`${siteUrl}/kegiatan/ibadah-raya.webp`],
    url: `${siteUrl}/ibadah-raya`,
    inLanguage: 'id-ID',
    startDate: 'T17:00:00+07:00',
    endDate: 'T19:00:00+07:00',
    eventSchedule: {
      '@type': 'Schedule',
      repeatFrequency: 'P1W',
      byDay: 'https://schema.org/Sunday',
      startTime: '17:00',
      endTime: '19:00',
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
    organizer: {
      '@type': 'Church',
      name: 'GBI Baranangsiang Evening Church',
      alternateName: 'GBI BEC',
      url: siteUrl,
    },
    performer: {
      '@type': 'Person',
      name: 'Pdm. Lie Yansen Wiyono',
      jobTitle: 'Gembala Sidang',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/ibadah-raya`,
      validFrom: '2020-01-01',
    },
    isAccessibleForFree: true,
  };

  const churchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: 'GBI Baranangsiang Evening Church',
    alternateName: 'GBI BEC',
    description:
      'Gereja Bethel Indonesia Baranangsiang Evening Church (BEC) di Sumur Bandung — ibadah Minggu sore pukul 17:00 WIB, terbuka untuk umum.',
    url: siteUrl,
    telephone: '+6287823420950',
    image: [`${siteUrl}/kegiatan/ibadah-raya.webp`],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Baranang Siang No.8',
      addressLocality: 'Bandung',
      addressRegion: 'Jawa Barat',
      postalCode: '40113',
      addressCountry: 'ID',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '17:00',
      closes: '19:00',
    },
    sameAs: [
      'https://www.instagram.com/sukawarna.bec/',
      'https://www.youtube.com/@gbibaranangsiangsukawarna7008',
    ],
  };

  // Flatten `[label](url)` markdown links into `label (url)` so JSON-LD
  // carries plain text that still surfaces the URL to Google's indexer.
  const flattenMarkdownLinks = (s: string) =>
    s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  const faqJsonLd = {
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
  };

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, eventJsonLd, churchJsonLd, faqJsonLd]),
        }}
      />

      <GrainOverlay />

      <Nav hideLinks />

      {/* Hero */}
      <ActivityHero
        title="Ibadah Raya"
        image="/kegiatan/ibadah-raya.webp"
      />

      {/* Big statement (with breadcrumb as eyebrow) */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14 pb-16 lg:pb-24">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 lg:mb-12"
        >
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-foreground/50">
            <li>
              <a
                href="/"
                className="hover:text-foreground/80 transition-colors underline-offset-2 hover:underline"
              >
                Beranda
              </a>
            </li>
            <li aria-hidden="true" className="text-foreground/30">/</li>
            <li aria-current="page" className="text-foreground/70">
              Ibadah Raya
            </li>
          </ol>
        </nav>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Setiap Minggu sore, terbuka untuk semua.
        </h2>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
          Ibadah Raya adalah kebaktian utama GBI Baranangsiang Evening Church — pukul
          17:00 WIB, durasi sekitar 90 - 120 menit. Dipimpin oleh Gembala Pdm. Lie Yansen Wiyono.
        </p>
        <p className="mt-5 text-base sm:text-lg text-foreground/70 leading-relaxed">
          Ibadah juga bisa diikuti secara online melalui kanal{' '}
          <a
            href="https://www.youtube.com/@gbibaranangsiangsukawarna7008"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            YouTube GBI Baranangsiang
          </a>
          .
        </p>
      </section>

      {/* Pertama kali datang? */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">
          Pertama kali datang?
        </h3>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-10">
          Berikut alur umum yang bisa kamu harapkan di Ibadah Raya. Urutan bisa sedikit bervariasi setiap minggunya, tapi gambaran besarnya seperti ini.
        </p>
        <ol className="relative">
          {TIMELINE.map((step, i) => (
            <li
              key={i}
              className="flex flex-col sm:flex-row gap-2 sm:gap-8 py-6 border-t border-border/50 last:border-b"
            >
              <div className="shrink-0 sm:w-48 pt-1">
                <span className="inline-block text-xs uppercase tracking-[0.15em] font-semibold text-foreground/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-1 text-sm sm:text-base font-medium text-foreground/60">
                  {step.duration}
                </p>
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

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
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
