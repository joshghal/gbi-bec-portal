// Lightweight word-level diff (LCS) for comparing two prose blocks — no deps.
// Used by the Catatan Khotbah compare view to highlight what one version
// dropped or added relative to another.

export type DiffOp = { type: 'same' | 'added' | 'removed'; value: string };

// Split on whitespace while KEEPING the whitespace tokens, so newlines/bullets
// survive into the rendered output (container uses whitespace-pre-wrap).
const SPLIT = /(\s+)/;

// Guard: an LCS table is O(n*m). Past this cell count the word diff is skipped
// and the caller falls back to plain side-by-side (mirrors how real diff tools
// bail on very long lines to stay responsive). ~2000×2000 tokens.
const MAX_CELLS = 4_000_000;

/**
 * Word-level diff of `a` (base) vs `b` (target). Returns an ordered op list, or
 * `null` when the inputs are too large to diff cheaply (caller should degrade).
 * - `removed` = present in base, absent in target
 * - `added`   = present in target, absent in base
 * - `same`    = shared
 */
export function wordDiff(a: string, b: string): DiffOp[] | null {
  const A = a.split(SPLIT).filter((t) => t.length > 0);
  const B = b.split(SPLIT).filter((t) => t.length > 0);
  const n = A.length;
  const m = B.length;
  if ((n + 1) * (m + 1) > MAX_CELLS) return null;

  // LCS length table, filled bottom-up. Int16 is safe: lengths ≤ min(n,m) < 2000.
  const w = m + 1;
  const L = new Int16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i * w + j] =
        A[i] === B[j]
          ? L[(i + 1) * w + (j + 1)] + 1
          : Math.max(L[(i + 1) * w + j], L[i * w + (j + 1)]);
    }
  }

  const ops: DiffOp[] = [];
  const push = (type: DiffOp['type'], value: string) => {
    const last = ops[ops.length - 1];
    if (last && last.type === type) last.value += value;
    else ops.push({ type, value });
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      push('same', A[i]);
      i++;
      j++;
    } else if (L[(i + 1) * w + j] >= L[i * w + (j + 1)]) {
      push('removed', A[i]);
      i++;
    } else {
      push('added', B[j]);
      j++;
    }
  }
  while (i < n) push('removed', A[i++]);
  while (j < m) push('added', B[j++]);
  return ops;
}
