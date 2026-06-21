'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UpdateCard, type Update } from './cards';

interface Cursor {
  date: string;
  id: string;
}

interface Props {
  initialItems: Update[];
  initialNextCursor: Cursor | null;
  /**
   * IDs already rendered outside this grid (e.g. the featured card). Items
   * returned from /api/updates/page that match any of these are filtered out
   * to avoid duplicate rendering at page boundaries.
   */
  excludeIds?: string[];
  pageSize?: number;
}

export function KabarGrid({
  initialItems,
  initialNextCursor,
  excludeIds = [],
  pageSize = 12,
}: Props) {
  const [items, setItems] = useState<Update[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<Cursor | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inflightRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(
    new Set<string>([...initialItems.map((i) => i.id), ...excludeIds]),
  );

  const loadMore = useCallback(async () => {
    if (inflightRef.current || !nextCursor) return;
    inflightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        cursorDate: nextCursor.date,
        cursorId: nextCursor.id,
      });
      const res = await fetch(`/api/updates/page?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        items: Update[];
        nextCursor: Cursor | null;
      };
      const fresh = data.items.filter((i) => !seenIdsRef.current.has(i.id));
      fresh.forEach((i) => seenIdsRef.current.add(i.id));
      setItems((prev) => [...prev, ...fresh]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      console.error('Load more kabar failed:', e);
      setError('Gagal memuat lebih banyak. Klik untuk coba lagi.');
    } finally {
      inflightRef.current = false;
      setLoading(false);
    }
  }, [nextCursor, pageSize]);

  // IntersectionObserver — auto-fetch when sentinel is near viewport
  useEffect(() => {
    if (!nextCursor) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '600px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, nextCursor]);

  return (
    <>
      {items.map((u) => (
        <UpdateCard key={u.id} update={u} />
      ))}

      {/* Sentinel + status row — always col-span-full so layout stays clean */}
      {nextCursor && (
        <div
          ref={sentinelRef}
          className="col-span-full flex items-center justify-center py-8 min-h-[80px]"
        >
          {error ? (
            <button
              type="button"
              onClick={loadMore}
              className="text-xs font-medium text-destructive hover:underline"
            >
              {error}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="inline-block w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin"
                aria-hidden
              />
              {loading ? 'Memuat…' : 'Gulir untuk memuat lebih'}
            </div>
          )}
        </div>
      )}

      {!nextCursor && items.length >= pageSize && (
        <div className="col-span-full text-center py-6 text-[11px] tracking-[0.2em] uppercase text-muted-foreground/40">
          — Akhir daftar —
        </div>
      )}
    </>
  );
}
