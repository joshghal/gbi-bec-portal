import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Clock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KomData {
  level: number;
  title: string;
  subtitle: string;
  sessions: number;
  year: number;
  pdfFile: string | null;
  series: { code: string; name: string; count: number; topics: string[] }[];
  jadwal?: string;
}

const THEME: Record<string, { gradient: string; label: string; badge: string; accent: string; glass: string }> = {
  '100': {
    gradient: 'from-green-950 to-slate-900',
    label: 'text-green-300/80',
    badge: 'bg-green-500/20 text-green-200 border-green-400/30',
    accent: 'text-green-200/70',
    glass: '/glass-one.webp',
  },
  '200': {
    gradient: 'from-blue-950 to-slate-900',
    label: 'text-blue-300/80',
    badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    accent: 'text-blue-200/70',
    glass: '/glass-second.webp',
  },
  '300': {
    gradient: 'from-red-950 to-slate-900',
    label: 'text-red-300/80',
    badge: 'bg-red-500/20 text-red-200 border-red-400/30',
    accent: 'text-red-200/70',
    glass: '/glass-third.webp',
  },
  '400': {
    gradient: 'from-gray-900 to-gray-800',
    label: 'text-gray-400',
    badge: 'bg-gray-600/30 text-gray-300 border-gray-500/30',
    accent: 'text-gray-400',
    glass: '/glass-fourth.webp',
  },
};

const KOM_DATA: Record<string, KomData> = {
  '100': {
    level: 100,
    title: 'Pencari Tuhan',
    subtitle: 'The Seeker',
    sessions: 27,
    year: 2005,
    pdfFile: '/kom/KOM-100-Pencari-Tuhan.pdf',
    jadwal: 'Online setiap hari Kamis pukul 18:30 WIB',
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

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const kom = KOM_DATA[level];
  if (!kom) return { title: 'Tidak Ditemukan' };

  const description = `Materi KOM ${level} — ${kom.title} (${kom.subtitle}). ${kom.sessions} sesi kurikulum gereja di GBI BEC Bandung. Kelas rohani berjenjang dengan sertifikat resmi GBI.`;
  return {
    title: `KOM ${level} — ${kom.title}`,
    description,
    keywords: [`KOM ${level}`, kom.title, 'GBI BEC', 'materi KOM', 'kurikulum gereja', 'kelas rohani Bandung'],
    alternates: { canonical: `/kom/${level}` },
    openGraph: {
      title: `KOM ${level} — ${kom.title} | GBI BEC`,
      description,
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function KomLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const kom = KOM_DATA[level];
  const theme = THEME[level];

  if (!kom || !theme) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {/* Glass accent */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 md:w-96 md:h-96 opacity-25">
          <Image src={theme.glass} alt="" fill className="object-contain" />
        </div>

        {/* Back button */}
        <div className="relative z-10 px-4 pt-3">
          <Link href="/kom">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-5 pb-5 pt-2">
          <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${theme.label}`}>KOM {kom.level}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{kom.title}</h1>
          <p className={`text-sm italic ${theme.accent}`}>{kom.subtitle}</p>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className={`${theme.badge} hover:${theme.badge}`}>
              {kom.sessions} sesi
            </Badge>
            <Badge className={`${theme.badge} hover:${theme.badge}`}>
              Sejak {kom.year}
            </Badge>
            {kom.jadwal && (
              <Badge className={`${theme.badge} hover:${theme.badge}`}>
                <Clock className="w-3 h-3 mr-1" />
                {kom.jadwal}
              </Badge>
            )}
          </div>
        </div>

        {/* PDF download bar */}
        {kom.pdfFile && (
          <div className="relative z-10 px-5 pb-4">
            <a href={kom.pdfFile} download>
              <Button variant="secondary" size="sm" className="gap-1.5 bg-white/10 text-white hover:bg-white/20 border-0">
                <Download className="w-4 h-4" />
                Download Buku Materi (PDF)
              </Button>
            </a>
          </div>
        )}
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Curriculum */}
        <div className="space-y-3">
          <h2 className="font-semibold">Daftar Materi</h2>
          {kom.series.map((s) => (
            <Card key={s.code}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1.5">{s.code}</span>
                    {s.name}
                  </p>
                  <Badge variant="outline" className="text-xs shrink-0">{s.count} sesi</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prasyarat */}
        <Card className="bg-[#fdf6ec] border-[#f0e0c4]">
          <CardContent className="pt-4 pb-4 text-sm text-[#8b7355]">
            {kom.level === 100 ? (
              <p>KOM 100 dapat diikuti oleh <strong className="text-[#7a5c2e]">semua jemaat</strong> tanpa prasyarat.</p>
            ) : (
              <p>
                Prasyarat: harus lulus{' '}
                <strong className="text-[#7a5c2e]">
                  {Array.from({ length: (kom.level - 100) / 100 }, (_, i) => `KOM ${(i + 1) * 100}`)
                    .join(', ')
                    .replace(/, ([^,]*)$/, ' dan $1')}
                </strong>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
