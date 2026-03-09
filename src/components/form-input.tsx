'use client';

import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FormStep } from '@/lib/form-types';

interface FormInputProps {
  step: FormStep;
  value: string;
  error: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function FormInput({ step, value, error, onChange, onSubmit, onSkip }: FormInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step.type !== 'select') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  if (step.type === 'select') {
    return <p className="flex-1 text-sm text-muted-foreground py-2">Pilih salah satu opsi di atas</p>;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <>
      <div className="flex-1">
        {step.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder || 'Ketik jawaban...'}
            className="min-h-10 max-h-32 resize-none field-sizing-content"
          />
        ) : (
          <Input
            ref={inputRef}
            type={step.type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder || 'Ketik jawaban...'}
          />
        )}
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
      <div className="flex gap-1">
        {step.optional && !value.trim() && (
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Lewati
          </Button>
        )}
        <Button type="submit" size="icon" disabled={!value.trim() && !step.optional}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
