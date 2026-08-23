'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, FileAudio, ExternalLink, ArrowRight, Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Sparkles, ScrollText, PenLine, Combine, Square, Clipboard, Check, Columns2, Link2, Send } from 'lucide-react';
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
import { KhotbahCompare } from '@/components/khotbah-compare';
import { NotetakerSettings } from '@/components/notetaker-settings';

interface SermonCapture {
  id: string;
  videoId: string;
  serviceNumber: number | null;
  sermonDate: string | null;
  title: string | null;
  url: string;
  transcriptChars: number;
  latestSummary: string;
  finalSummary?: string | null;
  summaryModel?: string | null;
  manualNotes?: string | null;
  manualNotesUpdatedAt?: string | null;
  combinedSummary?: string | null;
  combinedSummaryModel?: string | null;
  combinedAt?: string | null;
  combinedStale?: boolean;
  stopRequested?: boolean;
  stopRequestedAt?: string | null;
  snapshotCount: number;
  status: string;
  endReason?: string;
  actualDurationMs?: number;
  capturedAt: string;
  kabarId: string | null;
  kabarSlug: string | null;
  // Notetaker automation
  noteLinkToken?: string | null;
  noteLinkSentAt?: string | null;
  manualNotesSource?: string | null;
  publishChainOutcome?: string | null;
  publishChainAt?: string | null;
  cloudRunExecutionName?: string | null;
}

/**
 * How long a stop may legitimately take before we call the engine unresponsive.
 *
 * The engine polls stopRequested every 15s, then runs a Gemini 2.5 Pro summary
 * over the whole transcript and uploads to GCS before flipping to 'captured' —
 * on a 90-minute sermon that is comfortably over a minute. 3 min avoids crying
 * wolf while still not spinning forever if the engine died.
 */
const STOP_UNRESPONSIVE_MS = 3 * 60 * 1000;

const STATUS_BADGE: Record<string, string> = {
  capturing: 'bg-red-100 text-red-700 animate-pulse',
  captured: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

type SubTab = 'manual' | 'ai' | 'combined' | 'logs';

interface LogLine { timestamp: string; text: string; }
interface LogsState { lines: LogLine[]; loading: boolean; error?: string; }

const END_REASON_BADGE: Record<string, string> = {
  'stream-ended': 'bg-blue-50 text-blue-700',
  'max-duration': 'bg-amber-50 text-amber-700',
  'audio-silent': 'bg-orange-50 text-orange-700',
  'manual-stop': 'bg-violet-50 text-violet-700',
  'sigint': 'bg-gray-100 text-gray-700',
};

/**
 * A stop signal that the engine has not acted on for too long. Almost always means
 * the Cloud Run Job died: nothing is polling stopRequested, so the capture would
 * sit at 'capturing' with a spinner forever.
 */
function isStopStale(cap: SermonCapture): boolean {
  if (!cap.stopRequested || cap.status !== 'capturing') return false;
  const at = Date.parse(cap.stopRequestedAt ?? '');
  if (!Number.isFinite(at)) return true; // flag set with no timestamp — treat as stale
  return Date.now() - at > STOP_UNRESPONSIVE_MS;
}

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
  // Manual notes editor — per capture
  const [editingNotesFor, setEditingNotesFor] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [combining, setCombining] = useState<string | null>(null);
  // Stop & Summarize confirmation
  const [stopConfirmFor, setStopConfirmFor] = useState<SermonCapture | null>(null);
  const [stopping, setStopping] = useState(false);
  // Manual (re)send of the notetaker link
  const [notifying, setNotifying] = useState<string | null>(null);
  // Active sub-tab per capture (catatan detail segmented control)
  const [activeTab, setActiveTab] = useState<Record<string, SubTab>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<Record<string, boolean>>({});
  // On-demand Cloud Run execution log snapshot per capture (Item 4 —
  // fetched once when the "Log Engine" tab is opened, not live-tailed).
  const [logsData, setLogsData] = useState<Record<string, LogsState>>({});

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

  async function handleFetchLogs(cap: SermonCapture, force = false) {
    if (!user) return;
    if (!force && logsData[cap.id] && !logsData[cap.id].error) return; // already loaded — this is a snapshot, not a live tail
    setLogsData((prev) => ({ ...prev, [cap.id]: { lines: prev[cap.id]?.lines ?? [], loading: true } }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      setLogsData((prev) => ({ ...prev, [cap.id]: { lines: result.lines, loading: false } }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat log';
      setLogsData((prev) => ({ ...prev, [cap.id]: { lines: [], loading: false, error: message } }));
    }
  }

  async function handleSaveNotes(cap: SermonCapture) {
    if (!user) return;
    setSavingNotes(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/manual-notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesDraft }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      const cleared = notesDraft.trim().length === 0;
      toast.success(cleared ? 'Catatan manual dihapus.' : `Catatan manual disimpan (${result.manualNotesLength} chars).`);
      setCaptures((prev) => prev.map((c) => c.id === cap.id ? {
        ...c,
        manualNotes: cleared ? null : notesDraft,
        manualNotesUpdatedAt: cleared ? null : new Date().toISOString(),
        combinedSummary: cleared ? null : c.combinedSummary,
        combinedStale: cleared ? false : (c.combinedSummary ? true : c.combinedStale),
      } : c));
      setEditingNotesFor(null);
      setNotesDraft('');
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan catatan manual.');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleCombine(cap: SermonCapture) {
    if (!user) return;
    setCombining(cap.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/combine-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      toast.success(`Catatan gabungan dibuat (${result.combinedLength} chars).`);
      setCaptures((prev) => prev.map((c) => c.id === cap.id ? {
        ...c,
        combinedSummary: result.summary,
        combinedSummaryModel: result.model,
        combinedAt: new Date().toISOString(),
        combinedStale: false,
      } : c));
    } catch (err) {
      toastApiError(err, 'Gagal menggabungkan ringkasan.');
    } finally {
      setCombining(null);
    }
  }

  async function handleCopyCombined(cap: SermonCapture) {
    if (!cap.combinedSummary) return;
    try {
      await navigator.clipboard.writeText(cap.combinedSummary);
      setCopiedId(cap.id);
      toast.success('Catatan gabungan disalin ke clipboard.');
      setTimeout(() => setCopiedId((c) => (c === cap.id ? null : c)), 1500);
    } catch {
      toast.error('Gagal menyalin ke clipboard.');
    }
  }

  // Manual escape hatch: the engine normally fires this itself when audio starts.
  // Used when the automation was off at capture time, the link expired, or it
  // needs to go to a different notulen. `force=1` always mints a fresh link.
  async function handleNotifyNotetaker(cap: SermonCapture) {
    if (!user) return;
    setNotifying(cap.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${cap.id}/notify-notetaker?force=1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);

      if (result.skipped) {
        toast.warning(result.reason ?? 'Link tidak dikirim.');
      } else if (result.sentCount === 0) {
        toast.error(
          `Link dibuat tapi tidak ada pesan yang terkirim (0/${result.total}). Cek konfigurasi WhatsApp.`,
        );
      } else {
        toast.success(`Link notulen terkirim ke ${result.sentCount}/${result.total} nomor.`);
      }
      await fetchCaptures();
    } catch (err) {
      toastApiError(err, 'Gagal mengirim link notulen.');
    } finally {
      setNotifying(null);
    }
  }

  async function handleStopAndSummarize() {
    if (!user || !stopConfirmFor) return;
    setStopping(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/sermon-captures/${stopConfirmFor.id}/stop-and-summarize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      toast.success(result.message ?? 'Sinyal stop dikirim. Engine akan finalize dalam ~15 detik.');
      // Mark as stopRequested locally; auto-refresh will pick up the captured status
      setCaptures((prev) => prev.map((c) => c.id === stopConfirmFor.id ? { ...c, stopRequested: true } : c));
      setStopConfirmFor(null);
    } catch (err) {
      toastApiError(err, 'Gagal mengirim sinyal stop.');
    } finally {
      setStopping(false);
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
            Otomatis terisi setiap Minggu — capture dari ibadah live via Gemini 3.1 Live + Gemini 2.5 Pro.
            Kalau otomasi notulen aktif, link formulir dikirim sendiri lewat WhatsApp dan catatan terbit otomatis.
            Tombol <em>→ Buat Draft Kabar</em> tetap tersedia untuk alur manual.
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
          <NotetakerSettings />
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
                        <NoteLinkStrip
                          cap={cap}
                          busy={notifying === cap.id}
                          onSend={() => handleNotifyNotetaker(cap)}
                        />
                        {/* Catatan detail — segmented control (Manual · AI · Gabungan) */}
                        {(() => {
                        const activeSub: SubTab = activeTab[cap.id] ?? (cap.combinedSummary ? 'combined' : 'ai');
                        const combinedReady = !!(cap.manualNotes && (cap.finalSummary || cap.latestSummary));
                        const compareOn = !!compareMode[cap.id];
                        return (
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            {compareOn ? (
                              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Columns2 className="w-3.5 h-3.5" /> Mode banding
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                                {([
                                  { key: 'manual' as const, label: 'Catatan Manual', Icon: PenLine, dot: !!cap.manualNotes },
                                  { key: 'ai' as const, label: 'Ringkasan AI', Icon: Sparkles, dot: !!(cap.finalSummary || cap.latestSummary) },
                                  { key: 'combined' as const, label: 'Catatan Gabungan', Icon: Combine, dot: !!cap.combinedSummary },
                                  { key: 'logs' as const, label: 'Log Engine', Icon: ScrollText, dot: false },
                                ]).map(({ key, label, Icon, dot }) => {
                                  const on = activeSub === key;
                                  return (
                                    <button
                                      key={key}
                                      onClick={() => {
                                        setActiveTab((prev) => ({ ...prev, [cap.id]: key }));
                                        if (key === 'logs') void handleFetchLogs(cap);
                                      }}
                                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                      {label}
                                      {key === 'combined' && cap.combinedStale ? (
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="perlu re-combine" />
                                      ) : dot ? (
                                        <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <button
                              onClick={() => setCompareMode((prev) => ({ ...prev, [cap.id]: !prev[cap.id] }))}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${compareOn ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                              title="Bandingkan Manual / AI / Gabungan berdampingan"
                            >
                              <Columns2 className="w-3.5 h-3.5" />
                              Bandingkan
                            </button>
                          </div>

                          {compareOn ? (
                            <KhotbahCompare
                              manual={cap.manualNotes ?? null}
                              ai={cap.finalSummary || cap.latestSummary || null}
                              combined={cap.combinedSummary ?? null}
                            />
                          ) : (
                          <>
                          {/* Manual notes (from notetaker) */}
                          {activeSub === 'manual' && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <PenLine className="w-3 h-3" /> Catatan Manual (Notetaker)
                                {cap.manualNotes && (
                                  <span className="text-[10px] text-muted-foreground">
                                    · {cap.manualNotes.length.toLocaleString()} chars
                                    {cap.manualNotesUpdatedAt && ` · ${new Date(cap.manualNotesUpdatedAt).toLocaleString('id-ID')}`}
                                  </span>
                                )}
                              </div>
                              {editingNotesFor !== cap.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setEditingNotesFor(cap.id); setNotesDraft(cap.manualNotes ?? ''); }}
                                >
                                  <PenLine className="w-3.5 h-3.5 mr-1.5" />
                                  {cap.manualNotes ? 'Edit Catatan' : 'Tambah Catatan'}
                                </Button>
                              )}
                            </div>
                            {editingNotesFor === cap.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={notesDraft}
                                  onChange={(e) => setNotesDraft(e.target.value)}
                                  placeholder="Paste catatan dari notetaker di sini — bisa freeform/bullet, gaya bebas. Sistem akan menggabungkan dengan ringkasan AI saat tombol &quot;Gabungkan&quot; ditekan."
                                  rows={10}
                                  className="w-full text-sm bg-card rounded border p-3 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => { setEditingNotesFor(null); setNotesDraft(''); }} disabled={savingNotes}>
                                    Batal
                                  </Button>
                                  <Button size="sm" onClick={() => handleSaveNotes(cap)} disabled={savingNotes}>
                                    {savingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                                    Simpan
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              cap.manualNotes ? (
                                <div className="whitespace-pre-wrap text-sm bg-card rounded border p-3 max-h-64 overflow-y-auto">
                                  {cap.manualNotes}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic bg-card rounded border p-3">
                                  — belum ada catatan manual. Klik &quot;Tambah Catatan&quot; untuk paste dari notetaker. —
                                </div>
                              )
                            )}
                          </div>
                          )}

                          {/* AI summary (Gemini 2.5 Pro) */}
                          {activeSub === 'ai' && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" /> Ringkasan AI (Gemini 2.5 Pro)
                                {cap.summaryModel && (
                                  <span className="text-[10px] text-muted-foreground">· model: {cap.summaryModel}</span>
                                )}
                              </div>
                              {cap.status === 'capturing' ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setStopConfirmFor(cap)}
                                  disabled={cap.stopRequested && !isStopStale(cap)}
                                  title={
                                    isStopStale(cap)
                                      ? 'Engine belum merespons sinyal stop. Kemungkinan job sudah mati — coba kirim ulang, atau pakai Generate Summary setelah status berubah.'
                                      : 'Stop live capture sekarang lalu generate summary dari transcript yang sudah masuk'
                                  }
                                >
                                  {cap.stopRequested && !isStopStale(cap) ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  {cap.stopRequested
                                    ? (isStopStale(cap) ? 'Coba stop lagi' : 'Stopping…')
                                    : 'Stop & Summarize'}
                                </Button>
                              ) : (
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
                                  Generate Summary
                                </Button>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap text-sm bg-card rounded border p-3 max-h-80 overflow-y-auto">
                              {(cap.finalSummary || cap.latestSummary) || (
                                <em className="text-muted-foreground">
                                  {cap.status === 'capturing'
                                    ? '— ringkasan akan dibuat otomatis saat capture selesai, atau klik "Stop & Summarize" untuk mengakhiri lebih awal. —'
                                    : '— tidak ada ringkasan. Klik "Generate Summary" untuk membuat. —'}
                                </em>
                              )}
                            </div>
                          </div>
                          )}

                          {/* Combined section */}
                          {activeSub === 'combined' && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5 gap-2">
                              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 min-w-0">
                                <Combine className="w-3 h-3 shrink-0" /> <span className="truncate">Catatan Gabungan (AI + Notetaker)</span> <span className="text-primary">✨</span>
                                {cap.combinedAt && (
                                  <span className="text-[10px] text-muted-foreground shrink-0">· {new Date(cap.combinedAt).toLocaleString('id-ID')}</span>
                                )}
                                {cap.combinedStale && (
                                  <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">
                                    sumber berubah — perlu re-combine
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {cap.combinedSummary && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopyCombined(cap)}
                                    title="Salin catatan gabungan ke clipboard"
                                  >
                                    {copiedId === cap.id ? (
                                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                    ) : (
                                      <Clipboard className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    {copiedId === cap.id ? 'Tersalin' : 'Salin'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant={cap.combinedSummary ? 'outline' : 'default'}
                                  onClick={() => handleCombine(cap)}
                                  disabled={combining === cap.id || !combinedReady}
                                  title="Gabungkan catatan manual + ringkasan AI lewat Gemini 2.5 Pro"
                                >
                                  {combining === cap.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <Combine className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  {cap.combinedSummary ? 'Re-combine' : 'Gabungkan AI + Manual'}
                                </Button>
                              </div>
                            </div>
                            {cap.combinedSummary ? (
                              <div className="whitespace-pre-wrap text-sm bg-primary/5 border border-primary/30 rounded p-3 max-h-96 overflow-y-auto">
                                {cap.combinedSummary}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground italic bg-card rounded border p-3">
                                {combinedReady
                                  ? '— kedua sumber sudah ada. Klik "Gabungkan AI + Manual" untuk produksi catatan terpadu (sumber yang akan dipakai untuk Draft Kabar). —'
                                  : '— butuh Catatan Manual + Ringkasan AI sebelum bisa digabung. Lengkapi kedua tab tersebut dulu. —'}
                              </div>
                            )}
                          </div>
                          )}

                          {/* Cloud Run execution log — on-demand snapshot, not a live tail.
                              Item 4: last ~30 min of the job execution that produced this
                              capture, so an incident is diagnosable from the admin panel
                              without gcloud CLI access. */}
                          {activeSub === 'logs' && (() => {
                            const logs = logsData[cap.id];
                            return (
                            <div>
                              <div className="flex items-center justify-between mb-1.5 gap-2">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                  <ScrollText className="w-3 h-3" /> Log Cloud Run (30 menit terakhir eksekusi ini)
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFetchLogs(cap, true)}
                                  disabled={logs?.loading}
                                  title="Snapshot sekali ambil — bukan live tail. Klik untuk ambil ulang."
                                >
                                  {logs?.loading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <ScrollText className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  Ambil Ulang
                                </Button>
                              </div>
                              {logs?.error ? (
                                <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded p-3">
                                  {logs.error}
                                </div>
                              ) : logs?.loading && logs.lines.length === 0 ? (
                                <div className="text-xs text-muted-foreground italic bg-card rounded border p-3">
                                  — mengambil log... —
                                </div>
                              ) : logs && logs.lines.length > 0 ? (
                                <div className="text-xs font-mono bg-card rounded border p-3 max-h-96 overflow-y-auto space-y-0.5">
                                  {logs.lines.map((l, i) => (
                                    <div key={i} className="whitespace-pre-wrap break-all">
                                      <span className="text-muted-foreground/60">
                                        {l.timestamp ? new Date(l.timestamp).toLocaleTimeString('id-ID') : ''}
                                      </span>{' '}
                                      {l.text}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic bg-card rounded border p-3">
                                  — tidak ada baris log untuk eksekusi ini di rentang 30 menit. —
                                </div>
                              )}
                            </div>
                            );
                          })()}
                          </>
                          )}
                        </div>
                        );
                        })()}
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

      <Dialog open={stopConfirmFor !== null} onOpenChange={(open) => { if (!open) setStopConfirmFor(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stop Live Capture & Generate Summary?</DialogTitle>
            <DialogDescription>
              Engine akan menghentikan capture <strong>{stopConfirmFor?.title}</strong> sekarang dan langsung menjalankan
              ringkasan final pakai Gemini 2.5 Pro pada {stopConfirmFor?.transcriptChars.toLocaleString()} karakter transcript
              yang sudah masuk. Audio yang belum tertangkap tidak akan dipulihkan setelah ini.
              <br /><br />
              Aksi ini biasanya dipakai kalau pastor sudah selesai khotbah meskipun stream belum mati di YouTube.
              Estimasi penyelesaian: ~15-30 detik setelah konfirmasi.
            </DialogDescription>
          </DialogHeader>
          <DialogBody />
          <DialogFooter>
            <Button variant="outline" onClick={() => setStopConfirmFor(null)} disabled={stopping}>Batal</Button>
            <Button variant="destructive" onClick={handleStopAndSummarize} disabled={stopping}>
              {stopping && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              <Square className="w-4 h-4 mr-1.5" />
              Stop & Summarize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

const CHAIN_OUTCOME_COPY: Record<string, { text: string; tone: string }> = {
  published: { text: 'Catatan terbit otomatis', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'already-published': { text: 'Sudah terbit', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'draft-no-notes': { text: 'Draft dibuat — catatan notulen tidak masuk, perlu ditinjau', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  'draft-no-summary': { text: 'Transkrip kosong — tidak ada catatan yang bisa dibuat', tone: 'bg-red-50 text-red-700 border-red-200' },
};

/**
 * Status of the notetaker link for one capture, plus the manual (re)send button.
 * The engine sends the first link on its own; this exists for the cases it can't
 * cover (automation was off, link expired, wrong recipient).
 */
function NoteLinkStrip({
  cap,
  busy,
  onSend,
}: {
  cap: SermonCapture;
  busy: boolean;
  onSend: () => void;
}) {
  const submitted = cap.manualNotesSource === 'notetaker-link' && !!cap.manualNotes;
  const chain = cap.publishChainOutcome ? CHAIN_OUTCOME_COPY[cap.publishChainOutcome] : null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <Link2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <span className="text-xs font-medium">Link notulen</span>

      {submitted ? (
        <span className="text-xs rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
          catatan sudah masuk
        </span>
      ) : cap.noteLinkSentAt ? (
        <span className="text-xs text-muted-foreground">
          terkirim {new Date(cap.noteLinkSentAt).toLocaleString('id-ID')}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic">belum dikirim</span>
      )}

      {chain && (
        <span className={`text-xs rounded-full border px-2 py-0.5 ${chain.tone}`}>{chain.text}</span>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={onSend}
        disabled={busy || submitted}
        className="ml-auto h-7 px-2 text-xs"
        title={
          submitted
            ? 'Catatan sudah dikirim notulen — link tidak perlu dikirim ulang'
            : 'Buat link baru dan kirim ulang ke notulen via WhatsApp'
        }
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
        {cap.noteLinkSentAt ? 'Kirim ulang' : 'Kirim link'}
      </Button>
    </div>
  );
}
