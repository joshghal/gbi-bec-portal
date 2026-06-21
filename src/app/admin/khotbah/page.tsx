'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, FileAudio, ExternalLink, FileText, ArrowRight, Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Sparkles, ScrollText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { toastApiError } from '@/lib/api-toast';
import { formatDate } from '@/lib/format-date';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SermonCapture {
  id: string;
  videoId: string;
  serviceNumber: number | null;
  sermonDate: string | null;
  title: string | null;
  url: string;
  transcriptChars: number;
  latestSummary: string;
  snapshotCount: number;
  status: string;
  endReason?: string;
  actualDurationMs?: number;
  capturedAt: string;
  kabarId: string | null;
  kabarSlug: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  capturing: 'bg-red-100 text-red-700 animate-pulse',
  captured: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

const END_REASON_BADGE: Record<string, string> = {
  'stream-ended': 'bg-blue-50 text-blue-700',
  'max-duration': 'bg-amber-50 text-amber-700',
  'sigint': 'bg-gray-100 text-gray-700',
};

export default function KhotbahPage() {
  const { user } = useAuth();
  const [captures, setCaptures] = useState<SermonCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [actioning, setActioning] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Per-capture loaded transcript text (lazy via ?includeTranscript=1)
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [loadingTranscript, setLoadingTranscript] = useState<Set<string>>(new Set());
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const fetchCaptures = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/sermon-captures', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal memuat data');
      setCaptures(await res.json());
    } catch (err) {
      toastApiError(err, 'Gagal memuat catatan khotbah.');
      setError('Gagal memuat catatan khotbah.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCaptures(); }, [fetchCaptures]);

  // Auto-refresh the list every 20s when at least one capture is in progress.
  // Stops polling once all captures are 'captured' or 'failed' to avoid noise.
  const hasLiveCapture = captures.some((c) => c.status === 'capturing');
  useEffect(() => {
    if (!hasLiveCapture) return;
    const interval = setInterval(fetchCaptures, 20000);
    return () => clearInterval(interval);
  }, [hasLiveCapture, fetchCaptures]);

  // Auto-refresh expanded transcripts every 20s when their capture is still live.
  useEffect(() => {
    if (!user) return;
    if (!hasLiveCapture) return;
    const liveExpanded = captures
      .filter((c) => c.status === 'capturing' && expanded.has(c.id))
      .map((c) => c.id);
    if (liveExpanded.length === 0) return;
    const interval = setInterval(async () => {
      const token = await user.getIdToken();
      for (const id of liveExpanded) {
        try {
          const res = await fetch(`/api/sermon-captures/${id}?includeTranscript=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) continue;
          const data = await res.json();
          setTranscripts((prev) => ({ ...prev, [id]: data.transcript ?? '' }));
        } catch { /* silent */ }
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [user, hasLiveCapture, captures, expanded]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleToKabar(cap: SermonCapture) {
    if (!user) return;
    setActioning(cap.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/to-kabar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      toast.success(
        result.alreadyExisted
          ? 'Draft kabar untuk khotbah ini sudah ada.'
          : `Draft kabar dibuat: ${result.title}`,
      );
      await fetchCaptures();
    } catch (err) {
      toastApiError(err, 'Gagal membuat draft kabar.');
    } finally {
      setActioning(null);
    }
  }

  async function loadTranscript(cap: SermonCapture) {
    if (!user || transcripts[cap.id]) return;
    setLoadingTranscript((prev) => new Set(prev).add(cap.id));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}?includeTranscript=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTranscripts((prev) => ({ ...prev, [cap.id]: data.transcript ?? '' }));
    } catch (err) {
      toastApiError(err, 'Gagal memuat transcript.');
    } finally {
      setLoadingTranscript((prev) => { const n = new Set(prev); n.delete(cap.id); return n; });
    }
  }

  async function handleRegenerate(cap: SermonCapture) {
    if (!user) return;
    setRegenerating(cap.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/regenerate-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      toast.success(`Ringkasan baru dibuat dengan ${result.model ?? 'Gemini 2.5 Pro'} (${(result.summary as string).length} chars).`);
      // Update locally without a full refetch
      setCaptures((prev) => prev.map((c) => c.id === cap.id ? { ...c, latestSummary: result.summary, snapshotCount: 1 } : c));
    } catch (err) {
      toastApiError(err, 'Gagal regenerate ringkasan.');
    } finally {
      setRegenerating(null);
    }
  }

  async function handleDelete() {
    if (!deleteId || !user) return;
    setDeleting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteId(null);
      await fetchCaptures();
    } catch (err) {
      toastApiError(err, 'Gagal menghapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <RequirePermission permission="page:khotbah">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Catatan Khotbah (Live Capture)</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {captures.length}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchCaptures} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Otomatis terisi setiap Minggu — capture dari 5 ibadah live via Gemini 3.1 Live + Gemini 2.5 Pro.
            Klik tombol <em>→ Buat Draft Kabar</em> untuk membuat draft di halaman Kabar.
          </p>
          {hasLiveCapture && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              Ada capture sedang LIVE. Halaman ini auto-refresh tiap 20 detik. Expand baris untuk melihat transcript pool tumbuh real-time.
            </div>
          )}
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat catatan…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-destructive text-sm">{error}</div>
          ) : captures.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Belum ada catatan khotbah. Capture pertama akan muncul setelah ibadah berikutnya selesai live.
            </div>
          ) : (
            <div className="space-y-2">
              {captures.map((cap) => {
                const isOpen = expanded.has(cap.id);
                return (
                  <div key={cap.id} className="rounded-lg border bg-card overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30">
                      <button
                        onClick={() => toggleExpand(cap.id)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                        <FileAudio className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">
                              {cap.serviceNumber ? `Ibadah Raya ${cap.serviceNumber}` : 'Khotbah'} ·{' '}
                              {cap.sermonDate ? formatDate(cap.sermonDate) : '?'}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_BADGE[cap.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {cap.status}
                            </span>
                            {cap.endReason && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${END_REASON_BADGE[cap.endReason] ?? 'bg-gray-100 text-gray-600'}`}>
                                {cap.endReason}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {cap.title ?? cap.videoId} · {cap.transcriptChars.toLocaleString()} chars · {cap.snapshotCount} ringkasan
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={cap.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          title="Buka video di YouTube"
                        >
                          <ExternalLink className="w-3 h-3" />
                          YouTube
                        </a>
                        {cap.kabarId && cap.kabarSlug ? (
                          <a
                            href={`/kabar/${cap.kabarSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Draft kabar dibuat
                          </a>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleToKabar(cap)}
                            disabled={actioning === cap.id}
                          >
                            {actioning === cap.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Buat Draft Kabar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(cap.id)}
                          title="Hapus capture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="border-t bg-muted/20 px-4 py-3 text-sm space-y-3">
                        <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                          <span>captured: <code className="font-mono">{new Date(cap.capturedAt).toLocaleString('id-ID')}</code></span>
                          {cap.actualDurationMs && (
                            <span>durasi: <code className="font-mono">{Math.round(cap.actualDurationMs / 60000)} menit</code></span>
                          )}
                          <span>videoId: <code className="font-mono">{cap.videoId}</code></span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <FileText className="w-3 h-3" /> Ringkasan terakhir
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegenerate(cap)}
                              disabled={regenerating === cap.id || cap.transcriptChars < 200}
                              title="Generate ringkasan baru pakai Gemini 2.5 Pro dari transcript yang tersimpan"
                            >
                              {regenerating === cap.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Generate Summary (Gemini 2.5 Pro)
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap text-sm bg-card rounded border p-3">
                            {cap.latestSummary || <em className="text-muted-foreground">— tidak ada ringkasan. Klik "Generate Summary" untuk membuat. —</em>}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <ScrollText className="w-3 h-3" /> Transcript ({cap.transcriptChars.toLocaleString()} chars)
                            </div>
                            {!transcripts[cap.id] && !loadingTranscript.has(cap.id) && cap.transcriptChars > 0 && (
                              <Button size="sm" variant="ghost" onClick={() => loadTranscript(cap)} className="h-7 px-2 text-xs">
                                Muat transcript
                              </Button>
                            )}
                            {loadingTranscript.has(cap.id) && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin" /> memuat…
                              </span>
                            )}
                          </div>
                          {transcripts[cap.id] && (
                            <div className="whitespace-pre-wrap text-xs bg-card rounded border p-3 max-h-96 overflow-y-auto font-mono leading-relaxed">
                              {transcripts[cap.id]}
                            </div>
                          )}
                        </div>
                        {cap.endReason === 'max-duration' && (
                          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Capture berakhir karena batas waktu (90 min), bukan karena live stream berakhir. Khotbah mungkin terpotong.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Capture</DialogTitle>
            <DialogDescription>
              Capture ini akan dihapus dari daftar. Draft kabar yang sudah dibuat (jika ada) TIDAK akan ikut terhapus.
              File transcript di Cloud Storage juga tetap ada.
            </DialogDescription>
          </DialogHeader>
          <DialogBody />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RequirePermission>
  );
}
