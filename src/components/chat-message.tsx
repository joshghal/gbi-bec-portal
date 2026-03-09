'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, BookOpen, RotateCcw, GraduationCap, Droplets, Baby, Heart, ExternalLink, Download } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormSummary } from '@/components/form-summary';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

const formIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Droplets,
  Baby,
  HandHeart: Heart,
};

interface ChatMessageProps {
  message: ChatMessageType;
  formSummaryEditable?: boolean;
  onSuggestionClick?: (text: string) => void;
  onRetry?: () => void;
  onFormCardClick?: (type: string) => void;
  onFormOptionClick?: (option: string) => void;
  onFormSummaryUpdate?: (field: string, value: string) => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ChatMessage({ message, formSummaryEditable, onSuggestionClick, onRetry, onFormCardClick, onFormOptionClick, onFormSummaryUpdate }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }
        >
          {isUser ? <User className="w-4 h-4" /> : <Image src="/logo.png" alt="BEC" width={16} height={16} className="w-4 h-4 object-contain" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : message.isError
                ? 'bg-destructive/10 text-destructive rounded-tl-sm border border-destructive/20'
                : 'bg-muted rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : message.formSummary ? (
            <FormSummary
              rows={message.formSummary}
              editable={formSummaryEditable}
              onUpdate={(field, value) => onFormSummaryUpdate?.(field, value)}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2 [&_li]:my-0.5 [&_p]:my-1.5 [&_a]:text-primary [&_a]:underline dark:[&_a]:text-blue-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-muted-foreground ${isUser ? 'text-right' : ''}`} suppressHydrationWarning>
          {formatTime(message.timestamp)}
        </span>

        {/* Error retry button */}
        {message.isError && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Coba lagi
          </Button>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5"
              >
                <BookOpen className="w-2.5 h-2.5" />
                {source}
              </span>
            ))}
          </div>
        )}

        {/* Suggested questions */}
        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                className="cursor-pointer rounded-full border border-primary/30 bg-secondary text-sm py-1.5 px-3.5 text-foreground hover:bg-primary/15 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => onSuggestionClick?.(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Form type cards */}
        {message.formCards && message.formCards.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {message.formCards.map(card => {
              const Icon = formIconMap[card.icon];
              return (
                <button
                  key={card.type}
                  onClick={() => onFormCardClick?.(card.type)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer text-left"
                >
                  {Icon && <Icon className="w-6 h-6 text-primary" />}
                  <span className="text-sm font-medium">{card.title}</span>
                  <span className="text-xs text-muted-foreground">{card.description}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Form select options (pill buttons) */}
        {message.formOptions && message.formOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.formOptions.map(option => (
              <button
                key={option}
                onClick={() => onFormOptionClick?.(option)}
                className="cursor-pointer rounded-full border border-primary/30 bg-secondary text-sm py-1.5 px-3.5 text-foreground hover:bg-primary/15 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* WhatsApp + PDF buttons */}
        {message.formWhatsApp && (
          <div className="flex flex-col gap-2 mt-1">
            <a
              href={message.formWhatsApp.churchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#20bd5a] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Kirim ke WhatsApp Gereja
            </a>
            {message.formWhatsApp.selfUrl && (
              <a
                href={message.formWhatsApp.selfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#25D366] text-[#25D366] px-4 py-2.5 text-sm font-medium hover:bg-[#25D366]/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Simpan ke WhatsApp Saya
              </a>
            )}
            <button
              onClick={async () => {
                const { generateFormPDF } = await import('@/lib/form-pdf');
                await generateFormPDF(
                  message.formWhatsApp!.editUrl,
                  message.formWhatsApp!.formTitle,
                  message.formWhatsApp!.name,
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 text-primary px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              Simpan ke Device Saya (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
