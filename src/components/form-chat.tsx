'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FormConfig, FormStep } from '@/lib/form-types';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('+62')) return digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

function validate(step: FormStep, value: string): string | null {
  if (!value.trim() && !step.optional) return 'Mohon isi field ini.';
  if (!value.trim() && step.optional) return null;
  if (step.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Format email tidak valid.';
  if (step.type === 'tel' && !/^[\d\s\-+()]{7,}$/.test(value))
    return 'Nomor telepon tidak valid.';
  return null;
}

export function FormChat({ formConfig }: { formConfig: FormConfig }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    id: string;
    editToken: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [dynamicOptions, setDynamicOptions] = useState<string[] | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const visibleSteps = formConfig.steps.filter(s => !s.hidden);
  const totalSteps = visibleSteps.length;
  const isSummary = currentStep === totalSteps;
  const isSubmitted = currentStep === totalSteps + 1;

  const addMessage = useCallback((role: 'bot' | 'user', content: string) => {
    setMessages(prev => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, content },
    ]);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    addMessage(
      'bot',
      `Halo! Mari isi formulir ${formConfig.title}. Saya akan memandu Anda langkah demi langkah.`
    );
    const visible = formConfig.steps.filter(s => !s.hidden);
    const timer = setTimeout(() => {
      setCurrentStep(0);
      addMessage('bot', visible[0]?.question || '');
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch dynamic options when step has dynamicOptionsUrl
  useEffect(() => {
    if (currentStep < 0 || currentStep >= totalSteps) {
      setDynamicOptions(null);
      return;
    }
    const step = visibleSteps[currentStep];
    if (!step.dynamicOptionsUrl) {
      setDynamicOptions(null);
      return;
    }
    setLoadingOptions(true);
    setDynamicOptions(null);
    fetch(step.dynamicOptionsUrl)
      .then(r => r.json())
      .then(data => {
        const labels = (data.dates || []).map((d: { label: string }) => d.label);
        setDynamicOptions(labels);
      })
      .catch(() => setDynamicOptions([]))
      .finally(() => setLoadingOptions(false));
  }, [currentStep, totalSteps, visibleSteps]);

  // Focus input when step changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < totalSteps) {
      const step = visibleSteps[currentStep];
      if (step.type !== 'select') {
        setTimeout(() => {
          if (step.type === 'textarea') {
            textareaRef.current?.focus();
          } else {
            inputRef.current?.focus();
          }
        }, 350);
      }
    }
  }, [currentStep, totalSteps, visibleSteps]);

  const advanceStep = useCallback(
    (value: string) => {
      const step = visibleSteps[currentStep];
      const err = validate(step, value);
      if (err) {
        setError(err);
        return;
      }
      setError('');

      const displayValue =
        value.trim() || (step.optional ? '(dilewati)' : '');
      addMessage('user', displayValue || '(dilewati)');

      setAnswers(prev => ({ ...prev, [step.field]: value.trim() }));
      setInputValue('');

      const nextStep = currentStep + 1;
      setTimeout(() => {
        if (nextStep < totalSteps) {
          setCurrentStep(nextStep);
          addMessage('bot', visibleSteps[nextStep].question);
        } else {
          setCurrentStep(nextStep);
          // Build summary
          const lines = visibleSteps
            .map(s => {
              const key = s.field;
              const ans =
                key === visibleSteps[currentStep].field
                  ? value.trim()
                  : answers[key];
              return `${s.question.replace(/\?$/, '')}: ${ans || '(kosong)'}`;
            })
            .join('\n');
          addMessage(
            'bot',
            `Berikut ringkasan jawaban Anda:\n\n${lines}\n\nJika sudah benar, tekan tombol "Kirim" di bawah.`
          );
        }
      }, 300);
    },
    [currentStep, totalSteps, visibleSteps, addMessage, answers]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (currentStep < 0 || currentStep >= totalSteps) return;

      const step = visibleSteps[currentStep];
      if (step.type === 'select') return; // select uses pills

      const value = inputValue.trim();
      if (!value && !step.optional) {
        setError('Mohon isi field ini.');
        return;
      }
      advanceStep(value);
    },
    [currentStep, totalSteps, visibleSteps, inputValue, advanceStep]
  );

  const handleSelectOption = useCallback(
    (option: string) => {
      advanceStep(option);
    },
    [advanceStep]
  );

  const handleSkip = useCallback(() => {
    advanceStep('');
  }, [advanceStep]);

  const handleFormSubmit = useCallback(async () => {
    setIsSubmitting(true);
    // Merge the last step answer if needed
    const finalAnswers = { ...answers };
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: formConfig.type, data: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim formulir');

      setSubmissionResult({ id: data.id, editToken: data.editToken });
      setCurrentStep(totalSteps + 1);
      addMessage(
        'bot',
        'Formulir berhasil dikirim! Anda dapat mengedit formulir ini kapan saja melalui link di bawah.'
      );
    } catch {
      addMessage('bot', 'Maaf, terjadi kesalahan saat mengirim formulir. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, formConfig.type, totalSteps, addMessage]);

  const editLink = submissionResult
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/formulir/edit/${submissionResult.id}?token=${submissionResult.editToken}`
    : '';

  const currentStepConfig =
    currentStep >= 0 && currentStep < totalSteps
      ? visibleSteps[currentStep]
      : null;

  const whatsappSummary = visibleSteps
    .map(s => `${s.question.replace(/\?$/, '')}: ${answers[s.field] || '(kosong)'}`)
    .join('\n');

  const churchPhone = '6287823420950';
  const userPhone = answers.noTelepon ? formatPhone(answers.noTelepon) : '';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  msg.role === 'bot'
                    ? 'bg-muted text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap'
                    : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap'
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Select pill buttons */}
          {currentStepConfig?.type === 'select' && (() => {
            const options = currentStepConfig.dynamicOptionsUrl ? dynamicOptions : currentStepConfig.options;
            if (currentStepConfig.dynamicOptionsUrl && loadingOptions) {
              return (
                <div className="text-sm text-muted-foreground pl-1">
                  Memuat pilihan...
                </div>
              );
            }
            if (options && options.length === 0) {
              return (
                <div className="text-sm text-muted-foreground pl-1">
                  Belum ada jadwal baptisan tersedia. Silakan hubungi gereja.
                </div>
              );
            }
            if (options && options.length > 0) {
              return (
                <div className="flex flex-wrap gap-2 pl-1">
                  {options.map(option => (
                    <Button
                      key={option}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectOption(option)}
                      className="rounded-full border-primary/30 bg-secondary hover:bg-primary/10"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {/* Summary submit button */}
          {isSummary && !isSubmitting && (
            <div className="flex justify-center pt-2">
              <Button onClick={handleFormSubmit} className="gap-2">
                <Check className="w-4 h-4" />
                Kirim
              </Button>
            </div>
          )}

          {isSubmitting && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm pl-1">
              <MessageSquare className="w-4 h-4 animate-pulse" />
              Mengirim formulir...
            </div>
          )}

          {/* WhatsApp buttons after submission */}
          {isSubmitted && submissionResult && (
            <div className="space-y-2">
              <a
                href={`https://wa.me/${churchPhone}?text=${encodeURIComponent(
                  `Formulir ${formConfig.title}:\n\n${whatsappSummary}\n\nEdit: ${editLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#20bd5a] transition-colors w-full justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                Kirim Pesan ke WhatsApp Gereja
              </a>
              {userPhone && (
                <a
                  href={`https://wa.me/${userPhone}?text=${encodeURIComponent(
                    `Link edit formulir ${formConfig.title}: ${editLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#25D366] text-[#25D366] px-4 py-2.5 text-sm font-medium hover:bg-[#25D366]/10 transition-colors w-full justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Simpan ke WhatsApp Saya
                </a>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area - only show during active steps */}
      {currentStepConfig && currentStepConfig.type !== 'select' && (
        <div className="border-t bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto flex gap-2 items-end"
          >
            <div className="flex-1">
              {currentStepConfig.type === 'textarea' ? (
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    setError('');
                  }}
                  placeholder={
                    currentStepConfig.placeholder || 'Ketik jawaban...'
                  }
                  className="min-h-10 max-h-32 resize-none border-input bg-background"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              ) : (
                <Input
                  ref={inputRef}
                  type={currentStepConfig.type}
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    setError('');
                  }}
                  placeholder={
                    currentStepConfig.placeholder || 'Ketik jawaban...'
                  }
                  className="bg-background"
                />
              )}
              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>
            <div className="flex gap-1">
              {currentStepConfig.optional && !inputValue.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                >
                  Lewati
                </Button>
              )}
              <Button type="submit" size="icon" disabled={!inputValue.trim() && !currentStepConfig.optional}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
