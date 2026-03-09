import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KomData {
  level: number;
  title: string;
  subtitle: string;
  sessions: number;
  year: number;
  color: string;
  pdfFile: string | null;
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
    color: 'bg-blue-500',
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
    color: 'bg-green-500',
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
    color: 'bg-orange-500',
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
    color: 'bg-purple-500',
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

export default async function KomLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const kom = KOM_DATA[level];

  if (!kom) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/kom">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className={`w-10 h-10 rounded-lg ${kom.color} text-white flex items-center justify-center font-bold text-sm`}>
          {kom.level}
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg leading-tight">KOM {kom.level}</h1>
          <p className="text-xs text-muted-foreground">{kom.title} — {kom.subtitle}</p>
        </div>
        {kom.pdfFile && (
          <a href={kom.pdfFile} download>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </a>
        )}
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>{kom.sessions} sesi</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span>Diluncurkan {kom.year}</span>
          </div>
          {kom.jadwal && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{kom.jadwal}</span>
            </div>
          )}
        </div>

        {/* PDF Viewer */}
        {kom.pdfFile && (
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <iframe
                src={kom.pdfFile}
                className="w-full h-[70vh] border-0"
                title={`KOM ${kom.level} - ${kom.title}`}
              />
            </CardContent>
          </Card>
        )}

        {/* Curriculum */}
        <div className="space-y-3">
          <h2 className="font-semibold">Daftar Materi</h2>
          {kom.series.map((s) => (
            <Card key={s.code}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1.5">{s.code}</span>
                    {s.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{s.count} sesi</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1">
                  {s.topics.map((topic, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-xs text-muted-foreground/60 w-5 shrink-0 text-right">{i + 1}.</span>
                      {topic}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prasyarat */}
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {kom.level === 100 ? (
              <p>KOM 100 dapat diikuti oleh <strong>semua jemaat</strong> tanpa prasyarat.</p>
            ) : (
              <p>
                Prasyarat: harus lulus{' '}
                {Array.from({ length: (kom.level - 100) / 100 }, (_, i) => `KOM ${(i + 1) * 100}`)
                  .join(', ')
                  .replace(/, ([^,]*)$/, ' dan $1')}
                .
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
