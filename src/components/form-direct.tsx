'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Check, ExternalLink, ArrowLeft, Copy, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import type { FormConfig, FormStep, FormSection } from '@/lib/form-types';

/* ─── Helpers ─── */

function formatPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('+62')) return digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

function getLabel(step: FormStep): string {
  return step.label || step.question.replace(/\?$/, '').replace(/\.$/, '').replace(/\s*\(opsional\)$/i, '');
}

function validate(step: FormStep, value: string): string | null {
  if (!value.trim() && !step.optional) return 'Wajib diisi';
  if (!value.trim() && step.optional) return null;
  if (step.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Format email tidak valid';
  if (step.type === 'tel' && !/^[\d\s\-+()]{7,}$/.test(value))
    return 'Nomor telepon tidak valid';
  return null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-background ring-1 ring-foreground/[0.06] hover:bg-muted transition-colors"
    >
      {copied ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

const PILL_THRESHOLD = 5;

const GLASS_MAP: Record<string, string> = {
  kom: '/glass-one.webp',
  baptism: '/glass-second.webp',
  'child-dedication': '/glass-third.webp',
  prayer: '/glass-fourth.webp',
  mclass: '/glass-one.webp',
};

/* ─── Main Component ─── */

export function FormDirect({ formConfig }: { formConfig: FormConfig }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    id: string;
    editToken: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState('');

  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});

  const visibleSteps = useMemo(
    () => formConfig.steps.filter(s => !s.hidden),
    [formConfig.steps]
  );

  useEffect(() => {
    formConfig.steps.forEach(step => {
      if (step.dynamicOptionsUrl) {
        setLoadingOptions(prev => ({ ...prev, [step.field]: true }));
        fetch(step.dynamicOptionsUrl)
          .then(r => r.json())
          .then(data => {
            const labels = (data.dates || []).map((d: { label: string }) => d.label);
            setDynamicOptions(prev => ({ ...prev, [step.field]: labels }));
          })
          .catch(() => setDynamicOptions(prev => ({ ...prev, [step.field]: [] })))
          .finally(() => setLoadingOptions(prev => ({ ...prev, [step.field]: false })));
      }
    });
  }, [formConfig.steps]);

  const filledCount = useMemo(
    () => visibleSteps.filter(s => (values[s.field] || '').trim()).length,
    [visibleSteps, values]
  );
  const totalFields = visibleSteps.length;

  const sections: (FormSection & { steps: FormStep[] })[] = useMemo(() => {
    if (formConfig.sections && formConfig.sections.length > 0) {
      return formConfig.sections.map(sec => ({
        ...sec,
        steps: sec.fields
          .map(f => visibleSteps.find(s => s.field === f))
          .filter((s): s is FormStep => !!s),
      }));
    }
    return [{ title: '', fields: visibleSteps.map(s => s.field), steps: visibleSteps }];
  }, [formConfig]);

  const setValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleBlur = (step: FormStep) => {
    setTouched(prev => ({ ...prev, [step.field]: true }));
    const val = values[step.field] || '';
    if (val.trim()) {
      const err = validate(step, val);
      if (err) setErrors(prev => ({ ...prev, [step.field]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors: Record<string, string> = {};
    for (const step of visibleSteps) {
      const err = validate(step, values[step.field] || '');
      if (err) newErrors[step.field] = err;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(visibleSteps.map(s => [s.field, true])));
      const firstErrorField = visibleSteps.find(s => newErrors[s.field])?.field;
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: formConfig.type, data: values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim formulir');
      setSubmissionResult({ id: data.id, editToken: data.editToken });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editLink = submissionResult
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/edit/${submissionResult.id}?token=${submissionResult.editToken}`
    : '';

  const whatsappSummary = visibleSteps
    .map(s => `${getLabel(s)}: ${values[s.field] || '(kosong)'}`)
    .join('\n');

  const churchPhone = '6287823420950';
  const userPhone = values.noTelepon ? formatPhone(values.noTelepon) : '';
  const userName = values.namaLengkap || values.namaAnak || '';
  const glassImage = GLASS_MAP[formConfig.type] || '/glass-one.webp';

  /* ─── Success ─── */
  if (submissionResult) {
    return (
      <div className="min-h-dvh bg-background flex items-start justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold">Formulir Terkirim</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {userName ? `Terima kasih, ${userName}!` : 'Terima kasih!'} Formulir Anda sedang ditinjau.
              <br />Kami akan menghubungi Anda melalui WhatsApp.
            </p>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Simpan link ini untuk mengedit formulir Anda:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2.5 ring-1 ring-foreground/[0.06] truncate select-all">
                {editLink}
              </code>
              <CopyButton text={editLink} />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href={`https://wa.me/${churchPhone}?text=${encodeURIComponent(
                `Formulir ${formConfig.title}:\n\n${whatsappSummary}\n\nEdit: ${editLink}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] text-white px-4 py-3 text-sm font-medium hover:bg-[#20bd5a] transition-colors w-full justify-center"
            >
              <ExternalLink className="w-4 h-4" />
              Kirim Pesan ke WhatsApp Gereja
            </a>
            {userPhone && (
              <a
                href={`https://wa.me/${userPhone}?text=${encodeURIComponent(
                  `Link formulir ${formConfig.title}: ${editLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#25D366] text-[#25D366] px-4 py-3 text-sm font-medium hover:bg-[#25D366]/10 transition-colors w-full justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                Simpan ke WhatsApp Saya
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Form ─── */
  return (
    <div className="min-h-dvh bg-muted/50">
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground">
        <Image
          src={glassImage}
          alt=""
          width={160}
          height={160}
          className="absolute -top-4 -right-4 w-28 h-28 opacity-15 rotate-12 pointer-events-none"
        />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="pt-3 pb-1">
            <Link
              href="/forms"
              className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Link>
          </div>
          <div className="pb-4">
            <h1 className="text-lg font-bold leading-tight">{formConfig.title}</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">{formConfig.description}</p>
          </div>
          {/* Progress */}
          {totalFields > 4 && (
            <div className="pb-3">
              <div className="h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground/60 rounded-full transition-all duration-300"
                  style={{ width: `${(filledCount / totalFields) * 100}%` }}
                />
              </div>
              <p className="text-xs text-primary-foreground/50 mt-1.5">{filledCount}/{totalFields} terisi</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-4">
        {sections.map((section, sIdx) => (
          <div
            key={sIdx}
            className="rounded-xl bg-card ring-1 ring-foreground/[0.06] shadow-sm overflow-hidden"
          >
            {section.title && (
              <div className="px-4 pt-4 pb-2 sm:px-5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>
            )}
            <div className={cn(
              'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 px-4 pb-5 sm:px-5',
              !section.title && 'pt-5'
            )}>
              {section.steps.map(step => {
                const isFullWidth = !step.half || step.type === 'textarea';
                return (
                  <div
                    key={step.field}
                    id={`field-${step.field}`}
                    className={cn('space-y-1.5', isFullWidth && 'sm:col-span-2')}
                  >
                    <Label htmlFor={step.field} className="text-xs text-muted-foreground font-medium leading-none flex items-center gap-0">
                      <span>{getLabel(step)}</span>{!step.optional && (
                        <span className="text-destructive text-[10px] leading-none">*</span>
                      )}{step.optional && (
                        <span className="font-normal ml-1 opacity-60">(opsional)</span>
                      )}
                    </Label>

                    {step.type === 'select' ? (
                      <FieldSelect
                        step={step}
                        value={values[step.field] || ''}
                        onChange={v => setValue(step.field, v)}
                        dynamicOpts={dynamicOptions[step.field]}
                        loading={loadingOptions[step.field]}
                        hasError={!!errors[step.field] && !!touched[step.field]}
                      />
                    ) : step.type === 'textarea' ? (
                      <Textarea
                        id={step.field}
                        value={values[step.field] || ''}
                        onChange={e => setValue(step.field, e.target.value)}
                        onBlur={() => handleBlur(step)}
                        placeholder={step.placeholder}
                        className={cn(
                          'min-h-24 bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-input',
                          errors[step.field] && touched[step.field] && 'border-destructive bg-destructive/5'
                        )}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={step.field}
                        type={step.type}
                        value={values[step.field] || ''}
                        onChange={e => setValue(step.field, e.target.value)}
                        onBlur={() => handleBlur(step)}
                        placeholder={step.placeholder}
                        className={cn(
                          'h-10 bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-input',
                          errors[step.field] && touched[step.field] && 'border-destructive bg-destructive/5'
                        )}
                      />
                    )}

                    {errors[step.field] && touched[step.field] && (
                      <p className="text-xs text-destructive">{errors[step.field]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {submitError && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">
            {submitError}
          </div>
        )}

        {/* Sticky submit */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="max-w-2xl mx-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-muted/80 via-muted/60 to-transparent backdrop-blur-sm">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-semibold gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Kirim Formulir'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Field Select ─── */

function FieldSelect({
  step,
  value,
  onChange,
  dynamicOpts,
  loading,
  hasError,
}: {
  step: FormStep;
  value: string;
  onChange: (v: string) => void;
  dynamicOpts?: string[];
  loading?: boolean;
  hasError: boolean;
}) {
  const options = step.dynamicOptionsUrl ? dynamicOpts : step.options;
  const usePills = options && options.length > 0 && options.length <= PILL_THRESHOLD;

  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat pilihan...
      </div>
    );
  }

  if (step.dynamicOptionsUrl && options && options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Belum ada jadwal tersedia. Silakan hubungi gereja.
      </p>
    );
  }

  if (!options || options.length === 0) return null;

  if (usePills) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'h-10 px-4 rounded-lg border text-sm font-medium transition-all cursor-pointer',
              value === opt
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-transparent bg-muted/60 text-foreground hover:bg-muted',
              hasError && !value && 'ring-1 ring-destructive/40'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={v => { if (v) onChange(v); }}>
      <SelectTrigger className={cn(
        'w-full h-10 bg-muted/40 border-transparent',
        hasError && 'border-destructive bg-destructive/5'
      )}>
        <SelectValue placeholder="Pilih..." />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
