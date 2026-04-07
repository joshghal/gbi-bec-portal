import { useState, useCallback, useEffect, useRef } from 'react';
import { FORM_CONFIGS } from '@/lib/form-config';
import type { ChatMessage } from '@/lib/types';
import type { FormConfig, FormStep } from '@/lib/form-types';

// === Wilayah (Indonesian administrative hierarchy) ===
interface WilayahEntry { id: string; name: string }
interface WilayahRegency extends WilayahEntry { province_id: string }
interface WilayahDistrict extends WilayahEntry { regency_id: string }
interface WilayahVillage extends WilayahEntry { district_id: string }
interface WilayahData {
  provinces: WilayahEntry[];
  regencies: WilayahRegency[];
  districts: WilayahDistrict[];
  villages: WilayahVillage[];
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatDateDisplay(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

let wilayahCache: WilayahData | null = null;
let wilayahPromise: Promise<WilayahData> | null = null;

function loadWilayah(): Promise<WilayahData> {
  if (wilayahCache) return Promise.resolve(wilayahCache);
  if (wilayahPromise) return wilayahPromise;
  wilayahPromise = Promise.all([
    fetch('/data/wilayah/provinces.json').then(r => r.json()),
    fetch('/data/wilayah/regencies.json').then(r => r.json()),
    fetch('/data/wilayah/districts.json').then(r => r.json()),
    fetch('/data/wilayah/villages.json').then(r => r.json()),
  ]).then(([provinces, regencies, districts, villages]) => {
    wilayahCache = { provinces, regencies, districts, villages };
    return wilayahCache;
  });
  return wilayahPromise;
}

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
  const [disabledForms, setDisabledForms] = useState<string[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch('/api/forms/settings')
      .then(r => r.json())
      .then(data => setDisabledForms(data.disabledForms || []))
      .catch(() => {});
  }, []);

  const [activeForm, setActiveForm] = useState<FormConfig | null>(null);
  const [formStep, setFormStep] = useState(-1);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicOptionsCache, setDynamicOptionsCache] = useState<Record<string, string[]>>({});

  // Wilayah state — loaded lazily when a chainType form is activated
  const [wilayah, setWilayah] = useState<WilayahData | null>(wilayahCache);
  const [wilayahLoading, setWilayahLoading] = useState(false);

  // Filter out hidden steps for the chat flow
  const visibleSteps = activeForm?.steps.filter(s => !s.hidden) ?? [];
  const isActive = activeForm !== null && formStep >= 0;
  const currentStep = isActive && formStep < visibleSteps.length
    ? visibleSteps[formStep]
    : null;
  const isSummary = activeForm !== null && formStep === visibleSteps.length;

  // Load wilayah data when the active form has chain fields
  useEffect(() => {
    const hasChainFields = activeForm?.steps.some(s => s.chainType) ?? false;
    if (!hasChainFields || wilayah) return;
    setWilayahLoading(true);
    loadWilayah().then(data => {
      setWilayah(data);
      setWilayahLoading(false);
    });
  }, [activeForm, wilayah]);

  const getChainOptions = useCallback((step: FormStep): string[] => {
    if (!wilayah || !step.chainType) return [];
    switch (step.chainType) {
      case 'province':
        return wilayah.provinces.map(p => toTitleCase(p.name));
      case 'regency': {
        const provName = formAnswers[step.chainParent!];
        if (!provName) return [];
        const prov = wilayah.provinces.find(p => toTitleCase(p.name) === provName);
        if (!prov) return [];
        return wilayah.regencies.filter(r => r.province_id === prov.id).map(r => toTitleCase(r.name));
      }
      case 'district': {
        const regName = formAnswers[step.chainParent!];
        if (!regName) return [];
        const reg = wilayah.regencies.find(r => toTitleCase(r.name) === regName);
        if (!reg) return [];
        return wilayah.districts.filter(d => d.regency_id === reg.id).map(d => toTitleCase(d.name));
      }
      case 'village': {
        const distName = formAnswers[step.chainParent!];
        if (!distName) return [];
        const dist = wilayah.districts.find(d => toTitleCase(d.name) === distName);
        if (!dist) return [];
        return wilayah.villages.filter(v => v.district_id === dist.id).map(v => toTitleCase(v.name));
      }
      default: return [];
    }
  }, [wilayah, formAnswers]);

  const fetchDynamicOptions = useCallback(async (url: string): Promise<string[]> => {
    if (dynamicOptionsCache[url]) return dynamicOptionsCache[url];
    try {
      const res = await fetch(url);
      const data = await res.json();
      const labels = (data.dates || []).map((d: { label: string }) => d.label);
      setDynamicOptionsCache(prev => ({ ...prev, [url]: labels }));
      return labels;
    } catch {
      return [];
    }
  }, [dynamicOptionsCache]);

  const showFormCards = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: 'Silakan pilih formulir yang ingin Anda isi:',
      formCards: FORM_CONFIGS.filter(c => !c.externalUrl && !disabledForms.includes(c.type)).map(c => ({
        type: c.type,
        title: c.title,
        description: c.description,
        icon: c.icon,
      })),
    });
  }, [addMessage, disabledForms]);

  const selectForm = useCallback((type: string, skipUserMessage = false) => {
    const config = FORM_CONFIGS.find(c => c.type === type);
    if (!config) return;

    // External form — always show link regardless of disabled status
    if (config.externalUrl) {
      addMessage({
        role: 'assistant',
        content: `Pendaftaran ${config.title} menggunakan formulir terpisah.\n\n**[Daftar Sekarang](${config.externalUrl})**\n\nNarahubung: [Henny — 0858-6006-0050](https://wa.me/6285860060050)`,
      });
      return;
    }

    // Disabled built-in form
    if (disabledForms.includes(config.type)) {
      addMessage({
        role: 'assistant',
        content: `Maaf, formulir ${config.title} sedang tidak tersedia saat ini.`,
      });
      return;
    }

    if (!skipUserMessage) {
      addMessage({ role: 'user', content: config.title });
    }

    setActiveForm(config);
    // Pre-populate fields that have default values (e.g., hidden provinsi → Jawa Barat)
    const defaults: Record<string, string> = {};
    for (const step of config.steps) {
      if (step.defaultValue) defaults[step.field] = step.defaultValue;
    }
    setFormAnswers(defaults);
    setFormStep(0);
    setFormError('');

    setTimeout(async () => {
      const visible = config.steps.filter(s => !s.hidden);
      const first = visible[0];
      if (!first) return;
      let options = (first.type === 'select' && !first.chainType) ? first.options : undefined;
      if (first.dynamicOptionsUrl) {
        options = await fetchDynamicOptions(first.dynamicOptionsUrl);
      }
      addMessage({
        role: 'assistant',
        content: `Baik, mari isi formulir **${config.title}**. Saya akan memandu Anda langkah demi langkah.\n\n${first.question}`,
        formOptions: options,
      });
    }, 300);
  }, [addMessage, disabledForms, fetchDynamicOptions]);

  const advanceStep = useCallback((value: string) => {
    if (!activeForm) return;

    const step = visibleSteps[formStep];
    if (!step) return;
    const err = validateField(step, value);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');

    const displayValue = step.type === 'date' && value.trim() ? formatDateDisplay(value.trim()) : value.trim();
    addMessage({ role: 'user', content: displayValue || '(dilewati)' });

    const newAnswers = { ...formAnswers, [step.field]: value.trim() };
    setFormAnswers(newAnswers);

    const next = formStep + 1;

    setTimeout(async () => {
      if (next < visibleSteps.length) {
        setFormStep(next);
        const nextStep = visibleSteps[next];
        let options = (nextStep.type === 'select' && !nextStep.chainType) ? nextStep.options : undefined;
        if (nextStep.dynamicOptionsUrl) {
          options = await fetchDynamicOptions(nextStep.dynamicOptionsUrl);
        }
        addMessage({
          role: 'assistant',
          content: nextStep.question,
          formOptions: options,
        });
      } else {
        setFormStep(next);
        const summaryRows = visibleSteps.map(s => ({
          label: s.label || s.question.replace(/\?$/, '').replace(/\.$/, '').replace(/\s*\(opsional\)$/i, ''),
          field: s.field,
          value: s.field === step.field ? value.trim() : (newAnswers[s.field] || ''),
          // chainType fields have no static options — treat as text in summary edit
          type: s.chainType ? 'text' : s.type,
          options: s.chainType ? undefined : s.options,
        }));
        addMessage({
          role: 'assistant',
          content: '',
          formSummary: summaryRows,
        });
      }
    }, 300);
  }, [activeForm, visibleSteps, formStep, formAnswers, addMessage, fetchDynamicOptions]);

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

      const editLink = `${window.location.origin}/formulir/edit/${data.id}?token=${data.editToken}`;
      const churchPhone = '6287823420950';
      const userPhone = formAnswers.noTelepon ? formatPhone(formAnswers.noTelepon) : '';

      const summary = visibleSteps
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
  const totalSteps = visibleSteps.length;

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
    getChainOptions,
    wilayahLoading,
  };
}
