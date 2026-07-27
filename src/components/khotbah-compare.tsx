'use client';

import { useMemo, useRef, useState } from 'react';
import { PenLine, Sparkles, Combine } from 'lucide-react';
import { wordDiff } from '@/lib/word-diff';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Version = 'manual' | 'ai' | 'combined';

const META: Record<Version, { label: string; Icon: typeof PenLine }> = {
  manual: { label: 'Catatan Manual', Icon: PenLine },
  ai: { label: 'Ringkasan AI', Icon: Sparkles },
  combined: { label: 'Catatan Gabungan', Icon: Combine },
};

const ORDER: Version[] = ['manual', 'ai', 'combined'];

/**
 * Pairwise comparison of the three sermon-note versions. Pick a base + target;
 * optional word-level diff dims what the target dropped and highlights (in the
 * brand accent) what it added relative to the base. Panes scroll in sync.
 */
export function KhotbahCompare({
  manual,
  ai,
  combined,
}: {
  manual: string | null;
  ai: string | null;
  combined: string | null;
}) {
  const texts: Record<Version, string | null> = { manual, ai, combined };

  // Default to the highest-value comparison available: AI vs Gabungan.
  const [base, setBase] = useState<Version>(ai ? 'ai' : manual ? 'manual' : 'combined');
  const [target, setTarget] = useState<Version>(
    combined ? 'combined' : ai ? 'ai' : 'manual',
  );
  const [diffOn, setDiffOn] = useState(true);

  const baseText = texts[base] ?? '';
  const targetText = texts[target] ?? '';
  const same = base === target;

  const ops = useMemo(() => {
    if (!diffOn || same || !baseText || !targetText) return null;
    return wordDiff(baseText, targetText);
  }, [diffOn, same, baseText, targetText]);

  const tooBig = diffOn && !same && !!baseText && !!targetText && ops === null;

  // Synced scroll between the two panes (proportional, re-entrancy guarded).
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const sync = (fromLeft: boolean) => () => {
    if (lock.current) return;
    const src = fromLeft ? leftRef.current : rightRef.current;
    const dst = fromLeft ? rightRef.current : leftRef.current;
    if (!src || !dst) return;
    lock.current = true;
    const ratio = src.scrollTop / Math.max(1, src.scrollHeight - src.clientHeight);
    dst.scrollTop = ratio * Math.max(0, dst.scrollHeight - dst.clientHeight);
    requestAnimationFrame(() => {
      lock.current = false;
    });
  };

  function VersionSelect({
    value,
    onChange,
  }: {
    value: Version;
    onChange: (v: Version) => void;
  }) {
    return (
      <Select value={value} onValueChange={(v) => v && onChange(v as Version)}>
        <SelectTrigger size="sm" className="min-w-[9.5rem] font-medium">
          <SelectValue>
            {(v: Version | null) =>
              v ? `${META[v].label}${texts[v] ? '' : ' (kosong)'}` : ''
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ORDER.map((v) => (
            <SelectItem key={v} value={v}>
              {META[v].label}
              {texts[v] ? '' : ' (kosong)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  function Pane({ role }: { role: 'base' | 'target' }) {
    const v = role === 'base' ? base : target;
    const text = role === 'base' ? baseText : targetText;
    const { label, Icon } = META[v];

    let body: React.ReactNode;
    if (!text) {
      body = (
        <em className="text-muted-foreground">— versi ini belum ada isinya. —</em>
      );
    } else if (ops) {
      const visible = ops.filter((o) =>
        role === 'base' ? o.type !== 'added' : o.type !== 'removed',
      );
      body = visible.map((o, i) => {
        if (o.type === 'same') return <span key={i}>{o.value}</span>;
        const cls =
          o.type === 'removed'
            ? 'bg-foreground/[0.04] text-muted-foreground line-through decoration-muted-foreground/40 rounded-[2px]'
            : 'bg-primary/10 text-primary rounded-[2px]';
        return (
          <span key={i} className={cls}>
            {o.value}
          </span>
        );
      });
    } else {
      body = text;
    }

    return (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="w-3 h-3 shrink-0" />
          <span className="truncate">{label}</span>
          <span className="text-[9px] uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full shrink-0">
            {role}
          </span>
        </div>
        <div
          ref={role === 'base' ? leftRef : rightRef}
          onScroll={sync(role === 'base')}
          className="whitespace-pre-wrap text-sm bg-card rounded border p-3 h-96 overflow-y-auto leading-relaxed"
        >
          {body}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <VersionSelect value={base} onChange={setBase} />
        <span className="text-muted-foreground font-medium">vs</span>
        <VersionSelect value={target} onChange={setTarget} />
        <div className="ml-auto flex items-center gap-2">
          {same && (
            <span className="text-amber-600">pilih dua versi berbeda</span>
          )}
          <button
            onClick={() => setDiffOn((d) => !d)}
            disabled={same}
            className={`rounded-md border px-2.5 py-1 font-medium transition-colors disabled:opacity-40 ${
              diffOn
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
            title="Sorot kata yang berbeda antara kedua versi"
          >
            Diff kata
          </button>
        </div>
      </div>

      {diffOn && ops && (
        <div className="flex items-center gap-3 mb-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-foreground/[0.06] border border-border" />
            hanya di <strong className="font-medium">base</strong> (dihilangkan)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/15 border border-primary/30" />
            hanya di <strong className="font-medium">target</strong> (ditambahkan)
          </span>
        </div>
      )}
      {tooBig && (
        <div className="mb-2 text-[10px] text-amber-600">
          Teks terlalu panjang untuk diff kata — ditampilkan berdampingan tanpa sorotan.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Pane role="base" />
        <Pane role="target" />
      </div>
    </div>
  );
}
