'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, Clock, Eye, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import type { FormSubmission } from '@/lib/form-types';
import { getFormConfig } from '@/lib/form-config';

function formatPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('+62')) return digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

const GLASS_MAP: Record<string, string> = {
  kom: '/glass-one.webp',
  baptism: '/glass-second.webp',
  'child-dedication': '/glass-third.webp',
  prayer: '/glass-fourth.webp',
};

interface FormTraditionalProps {
  submissionId: string;
  editToken: string;
}

export default function FormTraditional({ submissionId, editToken }: FormTraditionalProps) {
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSaved, setPdfSaved] = useState(false);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/forms/${submissionId}?token=${editToken}`);
        if (res.status === 404) { setError('Formulir tidak ditemukan.'); return; }
        if (res.status === 401) { setError('Token akses tidak valid atau sudah kedaluwarsa.'); return; }
        if (!res.ok) { setError('Gagal memuat formulir.'); return; }
        const data: FormSubmission = await res.json();
        setSubmission(data);
      } catch {
        setError('Gagal terhubung ke server.');
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [submissionId, editToken]);

  const config = submission ? getFormConfig(submission.type) : null;

  function formatTimestamp(dateStr: string) {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat formulir...</p>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="max-w-md mx-auto mt-8 rounded-xl bg-card ring-1 ring-foreground/10 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!config || !submission) return null;

  const STATUS_STEPS = [
    { key: 'pending', label: 'Diterima', icon: Clock, description: 'Formulir diterima' },
    { key: 'reviewed', label: 'Ditinjau', icon: Eye, description: 'Sedang ditinjau' },
    { key: 'completed', label: 'Selesai', icon: CheckCircle2, description: 'Proses selesai' },
  ] as const;

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === submission.status);
  const glassImage = GLASS_MAP[submission.type] || '/glass-one.webp';
  const name = submission.data.namaLengkap || submission.data.namaAnak || '';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Hero header card */}
      <div className="relative overflow-hidden rounded-xl bg-primary text-primary-foreground">
        <Image
          src={glassImage}
          alt=""
          width={144}
          height={144}
          className="absolute -top-8 -right-8 w-36 h-36 opacity-15 rotate-12 pointer-events-none"
        />
        <div className="relative z-10 px-4 py-4">
          <p className="text-xs font-medium opacity-75 uppercase tracking-wider">{config.title}</p>
          <h2 className="text-xl font-bold mt-1">{name || 'Formulir'}</h2>
          <div className="flex gap-4 mt-3 text-xs opacity-70">
            <span>Diajukan: {formatTimestamp(submission.createdAt)}</span>
            <span>Diperbarui: {formatTimestamp(submission.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Status Tracker */}
      <Card>
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Status</p>
          <div className="relative">
            {/* Connector lines */}
            <div className="absolute top-5 left-0 right-0 flex px-[16.67%]">
              {[0, 1].map(i => (
                <div key={i} className={`h-0.5 flex-1 rounded-full ${
                  i < currentStatusIndex ? 'bg-primary' : 'bg-muted'
                }`} />
              ))}
            </div>
            {/* Steps */}
            <div className="relative grid grid-cols-3">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === currentStatusIndex;
                const isDone = i < currentStatusIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isDone
                          ? 'bg-primary-light text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold ${isActive || isDone ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {step.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form details — read only */}
      <Card>
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Detail Formulir</p>
          <div className="divide-y divide-border">
            {config.steps.map(step => {
              const label = step.label || step.question.replace(/\?$/, '').replace(/\.$/, '').replace(/\s*\(opsional\)$/, '');
              const value = submission.data[step.field];
              if (!value && step.optional) return null;
              return (
                <div key={step.field} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-sm text-foreground">{value || <span className="text-muted-foreground italic">—</span>}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {submission.data.noTelepon && (
          <a
            href={`https://wa.me/${formatPhone(submission.data.noTelepon)}?text=${encodeURIComponent(
              `Link formulir ${config.title}: ${typeof window !== 'undefined' ? window.location.href : ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Simpan link ke WhatsApp Saya
            </Button>
          </a>
        )}
        <Button
          variant={pdfSaved ? 'secondary' : 'outline'}
          disabled={pdfSaved}
          className={`gap-2 ${pdfSaved ? 'text-primary' : ''}`}
          onClick={async () => {
            const { generateFormPDF } = await import('@/lib/form-pdf');
            await generateFormPDF(
              window.location.href,
              config.title,
              name,
            );
            setPdfSaved(true);
            setTimeout(() => setPdfSaved(false), 3000);
          }}
        >
          {pdfSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {pdfSaved ? 'PDF Tersimpan!' : 'Simpan link ke PDF'}
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        Halaman ini hanya untuk melihat status. Hubungi admin untuk perubahan data.
      </p>
    </div>
  );
}
