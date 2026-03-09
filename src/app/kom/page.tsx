import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, Lock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KOM_LEVELS = [
  {
    level: 100,
    title: 'Pencari Tuhan',
    subtitle: 'The Seeker',
    sessions: 27,
    description: 'Dasar-dasar kekristenan, pertumbuhan iman, mengenal Allah, dan kehidupan yang memberi dampak.',
    hasPdf: true,
    color: 'bg-blue-500',
  },
  {
    level: 200,
    title: 'Pelayan Tuhan',
    subtitle: 'The Servant',
    sessions: 23,
    description: 'Karakter pelayan, pengetahuan Alkitab, kehidupan Kristen, dan pengenalan pelayanan.',
    hasPdf: true,
    color: 'bg-green-500',
  },
  {
    level: 300,
    title: 'Prajurit Tuhan',
    subtitle: 'The Soldier',
    sessions: 16,
    description: 'Karakter prajurit, doa & penyembahan, karakteristik pelayanan, dan Kerajaan Allah.',
    hasPdf: false,
    color: 'bg-orange-500',
  },
  {
    level: 400,
    title: 'Penilik Tuhan',
    subtitle: 'The Steward',
    sessions: 16,
    description: 'Authentic, Broken Hearted, Courageous, Destiny Driven — refleksi mendalam pemuridan.',
    hasPdf: false,
    color: 'bg-purple-500',
  },
];

export default function KomPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <Image src="/logo.png" alt="BEC" width={40} height={40} className="w-10 h-10 object-contain" />
        <div>
          <h1 className="font-semibold text-lg leading-tight">Materi KOM</h1>
          <p className="text-xs text-muted-foreground">Kehidupan Orientasi Melayani</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Program pengajaran Firman Tuhan berjenjang di GBI — 4 level, 82 sesi total.
            Kurikulum nasional ditetapkan oleh GBI pusat Jakarta.
          </p>
        </div>

        <div className="grid gap-4">
          {KOM_LEVELS.map((kom) => (
            <Link key={kom.level} href={`/kom/${kom.level}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${kom.color} text-white flex items-center justify-center font-bold text-lg`}>
                        {kom.level}
                      </div>
                      <div>
                        <CardTitle className="text-base">{kom.title}</CardTitle>
                        <CardDescription className="text-xs italic">{kom.subtitle}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{kom.sessions} sesi</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{kom.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {kom.hasPdf ? (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Buku materi tersedia</span>
                        <Download className="w-3.5 h-3.5 ml-auto" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Daftar materi & silabus</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3 text-sm">
            <p className="font-medium">Informasi Penting</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>KOM bersifat <strong>berjenjang</strong> — harus lulus level sebelumnya untuk lanjut.</li>
              <li>Sertifikat KOM 100 diperlukan untuk <strong>surat baptis</strong> dan <strong>pendaftaran pernikahan</strong>.</li>
              <li>Kelulusan: kehadiran minimum, tugas/worksheet, dan ujian akhir.</li>
              <li>Sertifikat berlaku <strong>nasional</strong> di seluruh GBI Indonesia.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
