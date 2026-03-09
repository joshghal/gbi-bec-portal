'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Check, AlertCircle, Clock, Eye, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import type { FormSubmission } from '@/lib/form-types';
import { getFormConfig } from '@/lib/form-config';

function formatPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('+62')) return digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

interface FormTraditionalProps {
  submissionId: string;
  editToken: string;
}

export default function FormTraditional({ submissionId, editToken }: FormTraditionalProps) {
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/forms/${submissionId}?token=${editToken}`);
        if (res.status === 404) {
          setError('Formulir tidak ditemukan.');
          return;
        }
        if (res.status === 401) {
          setError('Token akses tidak valid atau sudah kedaluwarsa.');
          return;
        }
        if (!res.ok) {
          setError('Gagal memuat formulir.');
          return;
        }
        const data: FormSubmission = await res.json();
        setSubmission(data);
        setFormState(data.data);
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
    return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}`;
  }

  function handleChange(field: string, value: string) {
    setFormState(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${submissionId}?token=${editToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formState }),
      });
      if (!res.ok) {
        setError('Gagal menyimpan perubahan.');
        return;
      }
      const updated: FormSubmission = await res.json();
      setSubmission(updated);
      setSaved(true);
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config || !submission) return null;

  const STATUS_STEPS = [
    { key: 'pending', label: 'Menunggu', icon: Clock, description: 'Formulir diterima' },
    { key: 'reviewed', label: 'Ditinjau', icon: Eye, description: 'Sedang ditinjau admin' },
    { key: 'completed', label: 'Selesai', icon: CheckCircle2, description: 'Proses selesai' },
  ] as const;

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === submission.status);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Status Tracker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{config.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Diajukan: {formatTimestamp(submission.createdAt)} &bull; Diperbarui: {formatTimestamp(submission.updatedAt)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === currentStatusIndex;
              const isDone = i < currentStatusIndex;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isDone
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center hidden sm:block">
                      {step.description}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mt-[-1.5rem] ${
                      i < currentStatusIndex ? 'bg-green-500' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Formulir</CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-md px-3 py-2">
            <Check className="w-4 h-4" />
            Perubahan berhasil disimpan!
          </div>
        )}
        {error && submission && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {config.steps.map(step => {
          const label = step.question.replace(/\?$/, '').replace(/\s*\(opsional\)$/, '');
          const value = formState[step.field] || '';

          return (
            <div key={step.field} className="space-y-2">
              <Label htmlFor={step.field}>
                {label}
                {step.optional && <span className="text-muted-foreground ml-1">(opsional)</span>}
              </Label>

              {step.type === 'textarea' ? (
                <Textarea
                  id={step.field}
                  rows={3}
                  value={value}
                  onChange={e => handleChange(step.field, e.target.value)}
                />
              ) : step.type === 'select' ? (
                <Select
                  value={value}
                  onValueChange={v => handleChange(step.field, v ?? '')}
                >
                  <SelectTrigger id={step.field}>
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    {step.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={step.field}
                  type={step.type}
                  value={value}
                  onChange={e => handleChange(step.field, e.target.value)}
                />
              )}
            </div>
          );
        })}

        <div className="pt-4 space-y-2">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Simpan Perubahan
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {formState.noTelepon && (
              <a
                href={`https://wa.me/${formatPhone(formState.noTelepon)}?text=${encodeURIComponent(
                  `Link formulir ${config.title}: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#25D366] text-[#25D366] px-3 py-2.5 text-xs font-medium hover:bg-[#25D366]/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Simpan link ke WhatsApp Saya
              </a>
            )}
            <button
              onClick={async () => {
                const { generateFormPDF } = await import('@/lib/form-pdf');
                await generateFormPDF(
                  window.location.href,
                  config.title,
                  formState.namaLengkap || formState.namaAnak || '',
                );
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 text-primary px-3 py-2.5 text-xs font-medium hover:bg-primary/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Simpan link ke PDF
            </button>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
