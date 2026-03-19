'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Loader2, BookOpen, ClipboardList, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat-message';
import { FormInput } from '@/components/form-input';
import { useFormFlow } from '@/hooks/useFormFlow';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Shalom! Saya asisten virtual **GBI Baranangsiang Evening Church (BEC)**. Saya bisa membantu Anda dengan informasi seputar jadwal ibadah, persyaratan baptisan, penyerahan anak, KOM, dan kegiatan gereja lainnya.\n\nAda yang bisa saya bantu?',
  suggestedQuestions: [
    'Kapan jadwal ibadah dan dimana lokasi GBI BEC?',
    'Bagaimana cara menjadi jemaat tetap?',
    'Apa saja syarat baptisan air?',
    'Bagaimana cara mendaftar KOM?',
    'Apa syarat pemberkatan nikah?',
    'Apa syarat penyerahan anak?',
  ],
  timestamp: Date.now(),
};

export default function ChatClient() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScroll = useRef(true);

  const addMessage = useCallback((msg: Omit<ChatMessageType, 'id' | 'timestamp'>) => {
    shouldAutoScroll.current = true;
    setMessages(prev => [
      ...prev,
      { ...msg, id: `${msg.role}-${Date.now()}-${Math.random()}`, timestamp: Date.now() },
    ]);
  }, []);

  const form = useFormFlow(addMessage);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll tracking
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (!viewport) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    };
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!shouldAutoScroll.current) return;
    const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (!viewport) return;

    if (isLoading) {
      viewport.scrollTop = viewport.scrollHeight;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id !== 'welcome') {
      const el = viewport.querySelector(`[data-message-id="${lastMsg.id}"]`) as HTMLElement | null;
      if (el) {
        const elTop = el.offsetTop;
        viewport.scrollTo({ top: Math.max(0, elTop - 12), behavior: 'smooth' });
        return;
      }
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [messages, isLoading]);

  // --- Form intent detection ---

  const detectFormIntent = useCallback((text: string): string | null => {
    const lower = text.toLowerCase().trim();
    const komPatterns = /\b(daftar|ikut|registrasi|mendaftar)\b.*\b(kom|kelas orientasi)\b|\b(kom|kelas orientasi)\b.*\b(daftar|ikut|registrasi|mendaftar)\b/;
    const baptismPatterns = /\b(daftar|ikut|mau)\b.*\b(baptis|baptisan)\b|\b(baptis|baptisan)\b.*\b(daftar|ikut|mau)\b/;
    const childPatterns = /\b(daftar|mau)\b.*\b(penyerahan anak|serah.*anak)\b|\b(penyerahan anak|serah.*anak)\b.*\b(daftar|mau)\b/;
    const prayerPatterns = /\b(mau|ingin|kirim|titip)\b.*\b(dido.?akan|pokok doa|doa)\b|\b(pokok doa)\b/;

    if (komPatterns.test(lower)) return 'kom';
    if (baptismPatterns.test(lower)) return 'baptism';
    if (childPatterns.test(lower)) return 'child-dedication';
    if (prayerPatterns.test(lower)) return 'prayer';
    return null;
  }, []);

  // --- Chat ---

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const formType = detectFormIntent(text);
    if (formType && !form.isActive) {
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`, role: 'user', content: text.trim(), timestamp: Date.now(),
      }]);
      setInput('');
      shouldAutoScroll.current = true;
      setTimeout(() => form.selectForm(formType, true), 300);
      return;
    }

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`, role: 'user', content: text.trim(), timestamp: Date.now(),
    }]);
    setInput('');
    setIsLoading(true);
    shouldAutoScroll.current = true;

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`, role: 'assistant', content: data.response,
        suggestedQuestions: data.formTrigger ? undefined : data.suggestedQuestions,
        sources: data.sources, timestamp: Date.now(),
      }]);

      if (data.formTrigger && !form.isActive) {
        setTimeout(() => form.selectForm(data.formTrigger, true), 500);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`, role: 'assistant', timestamp: Date.now(), isError: true,
        content: 'Maaf, terjadi kesalahan. Silahkan coba lagi atau hubungi Call Centre GBI BEC di [WhatsApp 0878-2342-0950](https://wa.me/6287823420950).',
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, detectFormIntent, form]);

  // Auto-send ?q= param from landing page AI buttons
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    const q = searchParams.get('q');
    if (!q) return;
    autoSentRef.current = true;
    setTimeout(() => sendMessage(q), 400);
  }, [searchParams, sendMessage]);

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => !m.isError));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const handleFormSummaryUpdate = useCallback((field: string, value: string) => {
    form.updateAnswer(field, value);
    setMessages(prev => prev.map(msg =>
      msg.formSummary
        ? { ...msg, formSummary: msg.formSummary.map(row => row.field === field ? { ...row, value } : row) }
        : msg
    ));
  }, [form]);

  // --- Submit handler (chat or form) ---

  const isCancelIntent = (text: string) =>
    /^(batal|batalkan|cancel|stop|keluar|ga jadi|gak jadi|tidak jadi)$/i.test(text.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((form.isActive || form.isSummary) && isCancelIntent(input)) {
      addMessage({ role: 'user', content: input.trim() });
      setInput('');
      form.cancelForm();
      return;
    }
    if (form.isSummary) { form.submitForm(); return; }
    if (form.isActive && form.currentStep?.type !== 'select') {
      form.advanceStep(input);
      setInput('');
      return;
    }
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden fixed inset-0 overscroll-none">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <Image src="/logo.png" alt="BEC" width={40} height={40} className="w-10 h-10 object-contain" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg leading-tight">Helpdesk</h1>
          <p className="text-xs text-muted-foreground">Baranangsiang Evening Church (BEC)</p>
        </div>
        <Button
          variant="outline" size="sm" className="gap-1.5"
          onClick={form.showFormCards}
          disabled={form.isActive || form.isSummary}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="hidden sm:inline">Formulir</span>
        </Button>
        <Link href="/kom">
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Materi KOM</span>
          </Button>
        </Link>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollRef}>
        <div className="max-w-2xl mx-auto py-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} data-message-id={message.id}>
            <ChatMessage
              message={message}
              formSummaryEditable={form.isSummary && !!message.formSummary}
              onSuggestionClick={sendMessage}
              onRetry={message.isError ? handleRetry : undefined}
              onFormCardClick={form.selectForm}
              onFormOptionClick={form.isActive ? form.advanceStep : undefined}
              onFormSummaryUpdate={handleFormSummaryUpdate}
            />
            </div>
          ))}
          {(isLoading || form.isSubmitting) && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{form.isSubmitting ? 'Mengirim formulir...' : 'Sedang mengetik...'}</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
        {(form.isActive || form.isSummary) && form.totalSteps > 0 && (
          <div className="max-w-2xl mx-auto mb-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
              <span>
                {form.isSummary
                  ? 'Konfirmasi jawaban'
                  : `Langkah ${form.stepIndex + 1} dari ${form.totalSteps}`}
              </span>
              <span>{Math.min(Math.round(((form.isSummary ? form.totalSteps : form.stepIndex) / form.totalSteps) * 100), 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((form.isSummary ? form.totalSteps : form.stepIndex) / form.totalSteps) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-secondary rounded-2xl px-3 py-2 flex gap-2 items-center">
          {form.isSummary && (
            <>
              <Button variant="outline" onClick={form.cancelForm} disabled={form.isSubmitting} className="shrink-0 gap-1.5">
                <X className="w-4 h-4" />
                Batal
              </Button>
              <Button onClick={form.submitForm} className="flex-1 gap-2" disabled={form.isSubmitting}>
                <Send className="w-4 h-4" />
                Kirim Formulir
              </Button>
            </>
          )}

          {form.isActive && form.currentStep && !form.isSummary && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={form.cancelForm}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title="Batalkan formulir"
              >
                <X className="w-4 h-4" />
              </Button>
              <FormInput
                step={form.currentStep}
                value={input}
                error={form.formError}
                onChange={v => { setInput(v); form.setFormError(''); }}
                onSubmit={() => { form.advanceStep(input); setInput(''); }}
                onSkip={() => { form.skipStep(); setInput(''); }}
              />
            </>
          )}

          {!form.isActive && !form.isSummary && (
            <>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda..."
                disabled={isLoading}
                className="flex-1 min-h-10 max-h-32 resize-none field-sizing-content border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="shrink-0 rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
