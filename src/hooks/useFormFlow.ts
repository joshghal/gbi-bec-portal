import { useState, useCallback } from 'react';
import { FORM_CONFIGS } from '@/lib/form-config';
import type { ChatMessage } from '@/lib/types';
import type { FormConfig, FormStep } from '@/lib/form-types';

function formatPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('+62')) return digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

function validateField(step: FormStep, value: string): string | null {
  if (!value.trim() && !step.optional) return 'Mohon isi field ini.';
  if (!value.trim() && step.optional) return null;
  if (step.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Format email tidak valid.';
  if (step.type === 'tel' && !/^[\d\s\-+()]{7,}$/.test(value))
    return 'Nomor telepon tidak valid.';
  return null;
}

type AddMessageFn = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;

export function useFormFlow(addMessage: AddMessageFn) {
  const [activeForm, setActiveForm] = useState<FormConfig | null>(null);
  const [formStep, setFormStep] = useState(-1);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = activeForm !== null && formStep >= 0;
  const currentStep = isActive && formStep < activeForm!.steps.length
    ? activeForm!.steps[formStep]
    : null;
  const isSummary = activeForm !== null && formStep === activeForm.steps.length;

  const showFormCards = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: 'Silakan pilih formulir yang ingin Anda isi:',
      formCards: FORM_CONFIGS.map(c => ({
        type: c.type,
        title: c.title,
        description: c.description,
        icon: c.icon,
      })),
    });
  }, [addMessage]);

  const selectForm = useCallback((type: string, skipUserMessage = false) => {
    const config = FORM_CONFIGS.find(c => c.type === type);
    if (!config) return;

    if (!skipUserMessage) {
      addMessage({ role: 'user', content: config.title });
    }

    setActiveForm(config);
    setFormAnswers({});
    setFormStep(0);
    setFormError('');

    setTimeout(() => {
      const first = config.steps[0];
      addMessage({
        role: 'assistant',
        content: `Baik, mari isi formulir **${config.title}**. Saya akan memandu Anda langkah demi langkah.\n\n${first.question}`,
        formOptions: first.type === 'select' ? first.options : undefined,
      });
    }, 300);
  }, [addMessage]);

  const advanceStep = useCallback((value: string) => {
    if (!activeForm) return;

    const step = activeForm.steps[formStep];
    const err = validateField(step, value);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');

    addMessage({ role: 'user', content: value.trim() || '(dilewati)' });

    const newAnswers = { ...formAnswers, [step.field]: value.trim() };
    setFormAnswers(newAnswers);

    const next = formStep + 1;

    setTimeout(() => {
      if (next < activeForm.steps.length) {
        setFormStep(next);
        const nextStep = activeForm.steps[next];
        addMessage({
          role: 'assistant',
          content: nextStep.question,
          formOptions: nextStep.type === 'select' ? nextStep.options : undefined,
        });
      } else {
        setFormStep(next);
        const summaryRows = activeForm.steps.map(s => ({
          label: s.question.replace(/\?$/, '').replace(/\s*\(opsional\)$/i, ''),
          field: s.field,
          value: s.field === step.field ? value.trim() : (newAnswers[s.field] || ''),
          type: s.type,
          options: s.options,
        }));
        addMessage({
          role: 'assistant',
          content: '',
          formSummary: summaryRows,
        });
      }
    }, 300);
  }, [activeForm, formStep, formAnswers, addMessage]);

  const submitForm = useCallback(async () => {
    if (!activeForm) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeForm.type, data: formAnswers }),
      });
      const data = await res.json();

      // Handle duplicate submission — show same buttons as success
      if (res.status === 409) {
        const existingLink = `${window.location.origin}${data.editLink}`;
        const churchPhone = '6287823420950';
        const userPhone = formAnswers.noTelepon ? formatPhone(formAnswers.noTelepon) : '';
        const displayName = formAnswers.namaLengkap || formAnswers.namaAnak || '';

        const churchUrl = `https://wa.me/${churchPhone}?text=${encodeURIComponent(
          `Saya ingin menanyakan status formulir ${activeForm.title} atas nama ${displayName}.\n\nLink: ${existingLink}`
        )}`;
        const selfUrl = userPhone
          ? `https://wa.me/${userPhone}?text=${encodeURIComponent(
              `Link formulir ${activeForm.title}: ${existingLink}`
            )}`
          : undefined;

        addMessage({
          role: 'assistant',
          content: 'Formulir serupa sudah pernah diajukan dan masih dalam proses.',
          formWhatsApp: { churchUrl, selfUrl, editUrl: existingLink, formTitle: activeForm.title, name: displayName },
        });
        setActiveForm(null);
        setFormStep(-1);
        setFormAnswers({});
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Gagal mengirim');

      const editLink = `${window.location.origin}/forms/edit/${data.id}?token=${data.editToken}`;
      const churchPhone = '6287823420950';
      const userPhone = formAnswers.noTelepon ? formatPhone(formAnswers.noTelepon) : '';

      const summary = activeForm.steps
        .map(s => `${s.question.replace(/\?$/, '')}: ${formAnswers[s.field] || '(kosong)'}`)
        .join('\n');

      const churchUrl = `https://wa.me/${churchPhone}?text=${encodeURIComponent(
        `Formulir ${activeForm.title}:\n\n${summary}\n\nEdit: ${editLink}`
      )}`;
      const selfUrl = userPhone
        ? `https://wa.me/${userPhone}?text=${encodeURIComponent(
            `Link edit formulir ${activeForm.title}: ${editLink}`
          )}`
        : undefined;

      const displayName = formAnswers.namaLengkap || formAnswers.namaAnak || '';

      addMessage({
        role: 'assistant',
        content: 'Formulir berhasil dikirim! Anda dapat memantau status dan mengedit formulir kapan saja.',
        formWhatsApp: { churchUrl, selfUrl, editUrl: editLink, formTitle: activeForm.title, name: displayName },
      });

      setActiveForm(null);
      setFormStep(-1);
      setFormAnswers({});
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat mengirim formulir. Silakan coba lagi.',
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [activeForm, formAnswers, addMessage]);

  const cancelForm = useCallback(() => {
    setActiveForm(null);
    setFormStep(-1);
    setFormAnswers({});
    setFormError('');
    addMessage({
      role: 'assistant',
      content: 'Formulir dibatalkan. Ada yang bisa saya bantu lainnya?',
    });
  }, [addMessage]);

  const skipStep = useCallback(() => {
    advanceStep('');
  }, [advanceStep]);

  const updateAnswer = useCallback((field: string, value: string) => {
    setFormAnswers(prev => ({ ...prev, [field]: value }));
  }, []);

  const stepIndex = formStep;
  const totalSteps = activeForm?.steps.length ?? 0;

  return {
    isActive,
    currentStep,
    isSummary,
    isSubmitting,
    formError,
    setFormError,
    stepIndex,
    totalSteps,
    showFormCards,
    selectForm,
    advanceStep,
    submitForm,
    skipStep,
    cancelForm,
    updateAnswer,
  };
}
