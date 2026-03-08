'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Church, User, BookOpen, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick?: (text: string) => void;
  onRetry?: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ChatMessage({ message, onSuggestionClick, onRetry }: ChatMessageProps) {
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
          {isUser ? <User className="w-4 h-4" /> : <Church className="w-4 h-4" />}
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
      </div>
    </div>
  );
}
