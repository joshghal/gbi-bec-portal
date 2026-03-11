import Link from 'next/link';
import { ArrowLeft, Phone, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        {/* Registration + Contact */}
        <Card className="relative border-0 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_4px_rgba(0,0,0,0.03)]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }}>
          <CardContent className="flex flex-col items-center text-center gap-4 py-6">
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-primary">Pendaftaran KOM</p>
              <p className="text-sm text-muted-foreground">Mulai perjalanan pertumbuhan imanmu sekarang</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <a href="https://bit.ly/DaftarKOMBarsiBEC" target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Daftar Sekarang
                </Button>
              </a>
              <a href="https://wa.me/6285860060050" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Hubungi Henny
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Program pengajaran Firman Tuhan berjenjang di GBI — 4 level, 82 sesi total.
            Kurikulum nasional ditetapkan oleh GBI pusat Jakarta.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-[1fr_1fr_auto] gap-3">
          {/* KOM 100 — Hero card */}
          <Link href="/kom/100" className="col-span-2 md:row-span-2">
            <Card className="relative overflow-hidden h-full min-h-[260px] md:min-h-[340px] bg-gradient-to-br from-green-950 to-slate-900 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer border-0">
              {/* Glass accent — bottom right decorative */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 md:w-64 md:h-64 opacity-30">
                <Image
                  src="/glass-one.webp"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-green-300/80 uppercase tracking-widest">KOM 100</p>
                  <Badge className="bg-green-500/20 text-green-200 border-green-400/30 hover:bg-green-500/20">
                    27 sesi
                  </Badge>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Pencari Tuhan</h2>
                  <p className="text-sm text-green-200/70 italic mb-3">The Seeker</p>
                  <p className="text-sm text-green-100/60 leading-relaxed max-w-sm">
                    Dasar-dasar kekristenan, pertumbuhan iman, mengenal Allah, dan kehidupan yang memberi dampak.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* KOM 200 — Right top (desktop), left col (mobile) */}
          <Link href="/kom/200">
            <Card className="relative overflow-hidden h-full min-h-[160px] md:min-h-0 bg-gradient-to-br from-blue-950 to-slate-900 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer border-0">
              <div className="absolute -bottom-4 -right-4 w-28 h-28 opacity-25">
                <Image
                  src="/glass-second.webp"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-blue-300/80 uppercase tracking-widest">KOM 200</p>
                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20 text-[10px]">
                    23 sesi
                  </Badge>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Pelayan Tuhan</h2>
                  <p className="text-xs text-blue-200/70 italic">The Servant</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* KOM 300 — Right bottom (desktop), right col (mobile) */}
          <Link href="/kom/300">
            <Card className="relative overflow-hidden h-full min-h-[160px] md:min-h-0 bg-gradient-to-br from-red-950 to-slate-900 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer border-0">
              <div className="absolute -bottom-4 -right-4 w-28 h-28 opacity-25">
                <Image
                  src="/glass-third.webp"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-red-300/80 uppercase tracking-widest">KOM 300</p>
                  <Badge className="bg-red-500/20 text-red-200 border-red-400/30 hover:bg-red-500/20 text-[10px]">
                    16 sesi
                  </Badge>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Prajurit Tuhan</h2>
                  <p className="text-xs text-red-200/70 italic">The Soldier</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* KOM 400 — Full width compact strip */}
          <Link href="/kom/400" className="col-span-2 md:col-span-3">
            <Card className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 hover:shadow-lg hover:scale-[1.005] transition-all cursor-pointer border-0">
              <div className="absolute -right-3 -top-3 w-28 h-28 opacity-20">
                <Image
                  src="/glass-fourth.webp"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">KOM 400</p>
                  <div>
                    <h2 className="text-base font-bold text-white">Penilik Tuhan</h2>
                    <p className="text-xs text-gray-400 italic">The Steward</p>
                  </div>
                </div>
                <Badge className="bg-gray-600/30 text-gray-300 border-gray-500/30 hover:bg-gray-600/30">
                  16 sesi
                </Badge>
              </div>
            </Card>
          </Link>
        </div>

        <Card className="bg-[#fdf6ec] border-[#f0e0c4]">
          <CardContent className="text-sm">
            <p className="font-semibold text-[#7a5c2e] mb-4">Informasi Penting</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#f7eddc] rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-[#7a5c2e] mb-0.5">Berjenjang</p>
                <p className="text-xs text-[#8b7355]">Harus lulus level sebelumnya untuk lanjut</p>
              </div>
              <div className="bg-[#f7eddc] rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-[#7a5c2e] mb-0.5">Sertifikat KOM 100</p>
                <p className="text-xs text-[#8b7355]">Diperlukan untuk surat baptis & pendaftaran pernikahan</p>
              </div>
              <div className="bg-[#f7eddc] rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-[#7a5c2e] mb-0.5">Kelulusan</p>
                <p className="text-xs text-[#8b7355]">Kehadiran minimum, tugas/worksheet, dan ujian akhir</p>
              </div>
              <div className="bg-[#f7eddc] rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-[#7a5c2e] mb-0.5">Berlaku Nasional</p>
                <p className="text-xs text-[#8b7355]">Sertifikat berlaku di seluruh GBI Indonesia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
