'use client';

import { useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function DateInput({
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  disabled,
  hasError,
  id,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Styled trigger — matches SearchableSelect */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) inputRef.current?.showPicker?.();
        }}
        className={cn(
          'flex items-center w-full h-10 px-3 rounded-lg text-sm text-left transition-colors',
          'bg-muted/40 border border-transparent',
          disabled && 'opacity-50 cursor-not-allowed',
          hasError && 'border-destructive bg-destructive/5',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="flex-1 truncate">{value ? formatDisplay(value) : placeholder}</span>
        {value && !disabled ? (
          <X
            className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground shrink-0"
            onClick={e => {
              e.stopPropagation();
              onChange('');
            }}
          />
        ) : (
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Hidden native date input — triggered by showPicker() */}
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}
