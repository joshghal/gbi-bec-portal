'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled,
  hasError,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [dropUp, setDropUp] = useState(false);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Measure space and decide drop direction
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 240; // max-h-48 (192) + search bar (~48)
    setDropUp(spaceBelow < dropdownHeight && rect.top > spaceBelow);
  }, [open]);

  // Reset highlight when filtered changes
  useEffect(() => { setHighlightIdx(0); }, [filtered.length]);

  const select = useCallback((opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
      listRef.current?.children[Math.min(highlightIdx + 1, filtered.length - 1)]
        ?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
      listRef.current?.children[Math.max(highlightIdx - 1, 0)]
        ?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIdx]) select(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  const showSearch = options.length > 3;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            if (!open) setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        className={cn(
          'flex items-center w-full h-10 px-3 rounded-lg text-sm text-left transition-colors',
          'bg-muted/40 border border-transparent',
          disabled && 'opacity-50 cursor-not-allowed',
          hasError && 'border-destructive bg-destructive/5',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="flex-1 truncate">{value || placeholder}</span>
        {value && !disabled ? (
          <X
            className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground shrink-0"
            onClick={e => {
              e.stopPropagation();
              onChange('');
              setOpen(false);
            }}
          />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && !disabled && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute left-0 right-0 z-50 bg-popover rounded-lg shadow-lg ring-1 ring-foreground/10 overflow-hidden',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
          onKeyDown={handleKeyDown}
        >
          {showSearch && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div ref={listRef} className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">Tidak ditemukan</p>
            ) : (
              filtered.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                    opt === value
                      ? 'bg-primary text-primary-foreground'
                      : idx === highlightIdx
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
