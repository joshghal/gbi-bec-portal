'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  /** Optional map of value → display label. If not provided, the value itself is shown. */
  labels?: Record<string, string>;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled,
  hasError,
  labels,
}: SearchableSelectProps) {
  const getLabel = (v: string) => labels?.[v] ?? v;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number; dropUp: boolean } | null>(null);

  const filtered = search
    ? options.filter(o => getLabel(o).toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Also check if click is inside the portal dropdown
        const portal = document.getElementById('searchable-select-portal');
        if (portal && portal.contains(e.target as Node)) return;
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Calculate dropdown position using fixed positioning (avoids overflow clipping)
  useEffect(() => {
    if (!open || !containerRef.current) {
      setDropdownPos(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 280;
    const dropUp = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    setDropdownPos({
      top: dropUp ? rect.top : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      dropUp,
    });
  }, [open]);

  // Reset highlight and clear search when opening
  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlightIdx(0);
    }
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

  const showSearch = true;

  const dropdown = open && !disabled && dropdownPos && (
    <div
      id="searchable-select-portal"
      style={{
        position: 'fixed',
        top: dropdownPos.dropUp ? undefined : dropdownPos.top,
        bottom: dropdownPos.dropUp ? window.innerHeight - dropdownPos.top + 4 : undefined,
        left: dropdownPos.left,
        width: Math.max(dropdownPos.width, 220),
        zIndex: 9999,
      }}
      className="bg-popover rounded-lg shadow-lg ring-1 ring-foreground/10 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}
      <div ref={listRef} className="max-h-52 overflow-y-auto p-1">
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
              {getLabel(opt)}
            </button>
          ))
        )}
      </div>
    </div>
  );

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
        <span className="flex-1 truncate">{value ? getLabel(value) : placeholder}</span>
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

      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
