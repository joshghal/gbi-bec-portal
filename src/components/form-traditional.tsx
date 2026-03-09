'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
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
      <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground">
        <img
          src={glassImage}
          alt=""
          className="absolute top-[-30px] right-[-30px] w-36 h-36 opacity-15 rotate-12 pointer-events-none"
        />
        <CardContent className="relative z-10 py-4 pb-2">
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-75 uppercase tracking-wider">{config.title}</p>
            <h2 className="text-xl font-bold">{name || 'Formulir'}</h2>
          </div>
          <div className="flex gap-4 mt-3 text-[11px] opacity-70">
            <span>Diajukan: {formatTimestamp(submission.createdAt)}</span>
            <span>Diperbarui: {formatTimestamp(submission.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status Tracker */}
      <Card>
        <CardContent>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2">Status</p>
          <div className="relative">
            {/* Connector lines — positioned behind circles */}
            <div className="absolute top-5 left-0 right-0 flex px-[16.67%]">
              {[0, 1].map(i => (
                <div key={i} className={`h-0.5 flex-1 rounded-full ${
                  i < currentStatusIndex ? 'bg-primary/30' : 'bg-muted'
                }`} />
              ))}
            </div>
            {/* Steps — equal 3-col grid */}
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
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-primary' : isDone ? 'text-primary/70' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
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
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Detail Formulir</p>
          <div className="divide-y divide-border">
            {config.steps.map(step => {
              const label = step.question.replace(/\?$/, '').replace(/\.$/, '').replace(/\s*\(opsional\)$/, '');
              const value = submission.data[step.field];
              if (!value && step.optional) return null;
              return (
                <div key={step.field} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground border border-border px-3.5 py-2.5 text-xs font-medium hover:bg-accent active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Simpan link ke WhatsApp Saya
          </a>
        )}
        <button
          disabled={pdfSaved}
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
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium active:scale-[0.98] transition-all ${
            pdfSaved
              ? 'bg-primary/10 text-primary border border-primary/25'
              : 'bg-secondary text-secondary-foreground border border-border hover:bg-accent'
          }`}
        >
          {pdfSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {pdfSaved ? 'PDF Tersimpan!' : 'Simpan link ke PDF'}
        </button>
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-muted-foreground pb-4">
        Halaman ini hanya untuk melihat status. Hubungi admin untuk perubahan data.
      </p>
    </div>
  );
}
