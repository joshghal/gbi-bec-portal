'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Church, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat-message';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Halo! Saya asisten virtual **GBI Baranangsiang Evening Church**. Saya bisa membantu Anda dengan informasi seputar jadwal ibadah, persyaratan baptisan, penyerahan anak, KOM, dan kegiatan gereja lainnya.\n\nAda yang bisa saya bantu?',
  suggestedQuestions: [
    'Kapan jadwal ibadah GBI BEC?',
    'Apa saja syarat baptisan air?',
    'Bagaimana cara mendaftar KOM?',
  ],
  timestamp: Date.now(),
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        suggestedQuestions: data.suggestedQuestions,
        sources: data.sources,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Maaf, terjadi kesalahan. Silahkan coba lagi atau hubungi Call Centre GBI BEC di [WhatsApp 0878-2342-0950](https://wa.me/6287823420950).',
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove the error message before retrying
      setMessages(prev => prev.filter(m => !m.isError));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
          <Church className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg leading-tight">GBI BEC Helper</h1>
          <p className="text-xs text-muted-foreground">
            Asisten Virtual - Baranangsiang Evening Church
          </p>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-2xl mx-auto py-4 space-y-4">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              onSuggestionClick={sendMessage}
              onRetry={message.isError ? handleRetry : undefined}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sedang mengetik...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex gap-2 items-end"
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda..."
            disabled={isLoading}
            className="flex-1 min-h-10 max-h-32 resize-none field-sizing-content"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
