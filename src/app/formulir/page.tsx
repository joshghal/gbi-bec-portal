'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Droplets, Baby, Heart, BookOpen, GraduationCap, Share2, FileEdit, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { FORM_CONFIGS } from '@/lib/form-config';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ICON_MAP: Record<string, typeof Droplets> = {
  baptism:            Droplets,
  'child-dedication': Baby,
  prayer:             Heart,
  mclass:             BookOpen,
  kom:                GraduationCap,
};

export default function FormsPage() {
  const router = useRouter();
  const [disabledForms, setDisabledForms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrFormTitle, setQrFormTitle] = useState('');
  const [qrFormUrl, setQrFormUrl] = useState('');

  useEffect(() => {
    fetch('/api/forms/settings')
      .then(r => r.json())
      .then(data => setDisabledForms(data.disabledForms || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeForms = FORM_CONFIGS.filter(
    c => !c.externalUrl && !disabledForms.includes(c.type),
  );

  const handleShare = useCallback(async (formType: string, title: string) => {
    const url = `${window.location.origin}/formulir/${formType}`;
    setQrFormTitle(title);
    setQrFormUrl(url);
    setQrOpen(true);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    setQrDataUrl(dataUrl);
  }, []);

  const handleDownloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${qrFormTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }, [qrDataUrl, qrFormTitle]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="BEC" width={28} height={28} className="w-7 h-7 object-contain" />
          <h1 className="font-semibold text-lg">Formulir</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        <p className="text-sm text-muted-foreground mb-5">
          Pilih formulir yang ingin Anda isi.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : activeForms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Belum ada formulir yang tersedia saat ini.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeForms.map(config => {
              const Icon = ICON_MAP[config.type];
              return (
                <div
                  key={config.type}
                  className="rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5"
                >
                  <div className="flex items-center gap-4">
                    {Icon && (
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{config.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleShare(config.type, config.title)}
                    >
                      <Share2 data-icon="inline-start" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/formulir/${config.type}`)}
                    >
                      <FileEdit data-icon="inline-start" />
                      Isi Formulir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{qrFormTitle}</DialogTitle>
            <DialogDescription>
              Scan QR code ini untuk membuka formulir.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {qrDataUrl ? (
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-foreground/[0.06]">
                <img src={qrDataUrl} alt="QR Code" width={280} height={280} />
              </div>
            ) : (
              <div className="flex items-center justify-center w-[280px] h-[280px]">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center break-all max-w-[280px]">
              {qrFormUrl}
            </p>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
            >
              <Download data-icon="inline-start" />
              Download
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: qrFormTitle, url: qrFormUrl });
                } else {
                  await navigator.clipboard.writeText(qrFormUrl);
                }
              }}
            >
              <Share2 data-icon="inline-start" />
              Bagikan Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
