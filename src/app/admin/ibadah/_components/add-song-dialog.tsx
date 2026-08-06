'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Sparkles,
  Loader2,
  Music,
  ExternalLink,
  Plus,
  ArrowLeft,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toastApiError } from '@/lib/api-toast';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { segmentLyrics } from '@/lib/service-slides/segment';
import type { Song } from '@/lib/service-slides/types';

export interface AddedSong {
  songId?: string;
  title: string;
  artist?: string;
  slides: string[];
}

type Mode = 'library' | 'ai' | 'google';
interface Candidate {
  title: string;
  artist?: string;
}
interface Source {
  title: string;
  url: string;
}
interface WebResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}
interface AiFound {
  title: string;
  artist: string;
  slides: string[];
  sources: Source[];
}

export function AddSongDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (song: AddedSong) => void;
}) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('library');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [adding, setAdding] = useState(false);

  // Library
  const [libQuery, setLibQuery] = useState('');
  const [libResults, setLibResults] = useState<Song[]>([]);
  const [libLoading, setLibLoading] = useState(false);

  // AI
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCandidates, setAiCandidates] = useState<Candidate[]>([]);
  const [aiSearched, setAiSearched] = useState(false);
  const [aiPicking, setAiPicking] = useState<string | null>(null);
  const [aiFound, setAiFound] = useState<AiFound | null>(null);

  // Google
  const [gQuery, setGQuery] = useState('');
  const [gLoading, setGLoading] = useState(false);
  const [gResults, setGResults] = useState<WebResult[]>([]);
  const [gConfigured, setGConfigured] = useState(true);
  const [gSearched, setGSearched] = useState(false);
  const [gFetching, setGFetching] = useState<string | null>(null);
  // shared editable draft (Google fill / manual paste)
  const [draftTitle, setDraftTitle] = useState('');
  const [draftLyrics, setDraftLyrics] = useState('');
  const [draftSource, setDraftSource] = useState('');

  const token = useCallback(async () => user!.getIdToken(), [user]);

  // Reset when closing.
  useEffect(() => {
    if (!open) {
      setAiCandidates([]); setAiFound(null); setAiSearched(false); setAiQuery('');
      setGResults([]); setGSearched(false); setGQuery('');
      setDraftTitle(''); setDraftLyrics(''); setDraftSource('');
      setLibQuery('');
    }
  }, [open]);

  /* ── Library ─────────────────────────────── */
  const searchLibrary = useCallback(
    async (q: string) => {
      if (!user) return;
      setLibLoading(true);
      try {
        const t = await user.getIdToken();
        const url = q ? `/api/songs?q=${encodeURIComponent(q)}` : '/api/songs';
        const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) throw new Error('Gagal memuat');
        setLibResults(await res.json());
      } catch (e) {
        toastApiError(e, 'Gagal mencari lagu.');
      } finally {
        setLibLoading(false);
      }
    },
    [user],
  );
  useEffect(() => {
    if (!open || mode !== 'library') return;
    const id = setTimeout(() => searchLibrary(libQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [open, mode, libQuery, searchLibrary]);

  function addFromLibrary(s: Song) {
    onAdd({ songId: s.id, title: s.title, artist: s.artist, slides: s.slides ?? [] });
    onOpenChange(false);
  }

  /* ── AI: list candidates → pick → lyrics ─── */
  async function aiSearch() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiFound(null);
    setAiCandidates([]);
    setAiSearched(true);
    try {
      const res = await fetch('/api/songs/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ query: aiQuery.trim() }),
      });
      const data = await res.json();
      if (data.configured === false) {
        toast.error('Fitur AI belum aktif', { description: 'GEMINI_API_KEY belum diatur di server.' });
        return;
      }
      setAiCandidates(Array.isArray(data.candidates) ? data.candidates : []);
    } catch (e) {
      toastApiError(e, 'Pencarian gagal.');
    } finally {
      setAiLoading(false);
    }
  }

  async function pickAi(c: Candidate) {
    const key = `${c.title}|${c.artist ?? ''}`;
    setAiPicking(key);
    try {
      const res = await fetch('/api/songs/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ query: `${c.title} ${c.artist ?? ''}`.trim() }),
      });
      const data = await res.json();
      if (!data.found) {
        toast.error('Lirik tidak ditemukan', { description: 'Coba kandidat lain.' });
        return;
      }
      setAiFound({
        title: data.title || c.title,
        artist: data.artist || c.artist || '',
        slides: data.slides ?? [],
        sources: data.sources ?? [],
      });
    } catch (e) {
      toastApiError(e, 'Gagal mengambil lirik.');
    } finally {
      setAiPicking(null);
    }
  }

  async function addAiFound() {
    if (!aiFound) return;
    setAdding(true);
    try {
      let songId: string | undefined;
      if (saveToLibrary) {
        const res = await fetch('/api/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
          body: JSON.stringify({ title: aiFound.title, artist: aiFound.artist, rawLyrics: aiFound.slides.join('\n\n') }),
        });
        if (res.ok) songId = (await res.json()).id;
      }
      onAdd({ songId, title: aiFound.title, artist: aiFound.artist, slides: aiFound.slides });
      onOpenChange(false);
    } catch (e) {
      toastApiError(e, 'Gagal menambahkan.');
    } finally {
      setAdding(false);
    }
  }

  /* ── Google: web results → fill draft → add ─ */
  async function gSearch() {
    if (!gQuery.trim()) return;
    setGLoading(true);
    setGResults([]);
    setGSearched(true);
    try {
      const res = await fetch(`/api/songs/search-web?q=${encodeURIComponent(gQuery.trim())}`, {
        headers: { Authorization: `Bearer ${await token()}` },
      });
      const data = await res.json();
      setGConfigured(data.configured !== false);
      setGResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      toastApiError(e, 'Pencarian gagal.');
    } finally {
      setGLoading(false);
    }
  }

  async function fillFromWeb(r: WebResult) {
    setGFetching(r.link);
    try {
      const res = await fetch(`/api/songs/fetch-lyrics?url=${encodeURIComponent(r.link)}`, {
        headers: { Authorization: `Bearer ${await token()}` },
      });
      const data = await res.json();
      if (data.text) {
        setDraftTitle(r.title.replace(/\s*[-|–].*$/, '').trim());
        setDraftLyrics(data.text);
        setDraftSource(r.link);
        toast.success('Lirik diambil — mohon rapikan & periksa sebelum tambah.');
      } else {
        toast.error('Gagal mengambil teks', { description: 'Buka halaman & salin manual.' });
      }
    } catch (e) {
      toastApiError(e, 'Gagal mengambil lirik.');
    } finally {
      setGFetching(null);
    }
  }

  async function addDraft() {
    const slides = segmentLyrics(draftLyrics);
    if (!draftTitle.trim() || slides.length === 0) {
      toast.error('Isi judul dan lirik dulu.');
      return;
    }
    setAdding(true);
    try {
      let songId: string | undefined;
      if (saveToLibrary) {
        const res = await fetch('/api/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
          body: JSON.stringify({ title: draftTitle.trim(), rawLyrics: draftLyrics }),
        });
        if (res.ok) songId = (await res.json()).id;
      }
      onAdd({ songId, title: draftTitle.trim(), slides });
      onOpenChange(false);
    } catch (e) {
      toastApiError(e, 'Gagal menambahkan.');
    } finally {
      setAdding(false);
    }
  }

  const MODES: { id: Mode; label: string; icon: typeof Music }[] = [
    { id: 'library', label: 'Perpustakaan', icon: Music },
    { id: 'ai', label: 'Cari AI', icon: Sparkles },
    { id: 'google', label: 'Cari Google', icon: Globe },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Lagu ke Set</DialogTitle>
          <DialogDescription>Cari, pilih dari daftar, lalu tambahkan.</DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5 ${
                mode === id ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <DialogBody className="min-h-[19rem]">
          {/* ── Library ─────────────────────────── */}
          {mode === 'library' && (
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  autoFocus
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                  placeholder="Cari judul atau sepenggal lirik..."
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {libLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Mencari...
                </div>
              ) : libResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  {libQuery ? 'Tidak ada yang cocok. Coba "Cari AI" atau "Cari Google".' : 'Ketik untuk mencari lagu.'}
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-lg border divide-y">
                  {libResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addFromLibrary(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors"
                    >
                      <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{s.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.artist ? `${s.artist} · ` : ''}
                          {s.slides?.length ?? 0} slide
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── AI: candidate list → preview ────── */}
          {mode === 'ai' && (
            <div className="space-y-3">
              {!aiFound && (
                <>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && aiSearch()}
                      placeholder="Judul lagu atau sepenggal lirik..."
                      className="flex-1 px-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button onClick={aiSearch} disabled={aiLoading || !aiQuery.trim()}>
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span className="ml-1.5">Cari</span>
                    </Button>
                  </div>

                  {aiLoading ? (
                    <div className="flex items-center justify-center py-10 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Mencari lagu...
                    </div>
                  ) : aiCandidates.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
                      {aiCandidates.map((c, i) => {
                        const key = `${c.title}|${c.artist ?? ''}`;
                        const loading = aiPicking === key;
                        return (
                          <button
                            key={i}
                            onClick={() => pickAi(c)}
                            disabled={aiPicking !== null}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors disabled:opacity-60"
                          >
                            <Sparkles className="w-4 h-4 text-[#9a7230] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{c.title}</span>
                              {c.artist && <span className="text-xs text-muted-foreground">{c.artist}</span>}
                            </div>
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : aiSearched ? (
                    <p className="text-sm text-muted-foreground text-center py-10">
                      Tidak ada kandidat. Coba kata kunci lain.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      AI akan menampilkan daftar lagu yang cocok — pilih satu untuk melihat liriknya.
                    </p>
                  )}
                </>
              )}

              {aiFound && (
                <div className="space-y-3">
                  <button
                    onClick={() => setAiFound(null)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke daftar
                  </button>
                  <div className="rounded-lg border bg-card p-3 space-y-3">
                    <div>
                      <p className="font-medium text-sm">{aiFound.title}</p>
                      {aiFound.artist && <p className="text-xs text-muted-foreground">{aiFound.artist}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                      {aiFound.slides.map((slide, i) => (
                        <div
                          key={i}
                          className="aspect-video rounded bg-[#1a1714] text-white p-1.5 flex items-center justify-center text-center overflow-hidden"
                        >
                          <span className="text-[9px] leading-tight whitespace-pre-line line-clamp-4">{slide}</span>
                        </div>
                      ))}
                    </div>
                    {aiFound.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t">
                        <span className="text-[11px] text-muted-foreground w-full">Periksa dari sumber:</span>
                        {aiFound.sources.slice(0, 4).map((s, i) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline max-w-[180px] truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{s.title || s.url}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={saveToLibrary} onChange={(e) => setSaveToLibrary(e.target.checked)} className="rounded" />
                        Simpan ke perpustakaan
                      </label>
                      <Button size="sm" onClick={addAiFound} disabled={adding}>
                        {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                        Tambah ke Set
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">⚠ AI bisa keliru — periksa lirik sebelum ditayangkan.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Google: web results → fill → add ── */}
          {mode === 'google' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={gQuery}
                  onChange={(e) => setGQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && gSearch()}
                  placeholder="Judul lagu atau sepenggal lirik..."
                  className="flex-1 px-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button onClick={gSearch} disabled={gLoading || !gQuery.trim()}>
                  {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span className="ml-1.5">Cari</span>
                </Button>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent('lirik ' + gQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 rounded-md border text-xs text-muted-foreground hover:text-foreground"
                  title="Buka pencarian Google di tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {gConfigured && gResults.length > 0 && (
                <div className="max-h-44 overflow-y-auto rounded-lg border divide-y">
                  {gResults.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline line-clamp-1">
                          {r.title}
                        </a>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{r.displayLink}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => fillFromWeb(r)} disabled={gFetching !== null}>
                        {gFetching === r.link ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ambil lirik'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {gSearched && !gConfigured && (
                <p className="text-[11px] text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
                  Hasil dalam-aplikasi butuh Google Custom Search (env <code>GOOGLE_CSE_API_KEY</code> + <code>GOOGLE_CSE_CX</code>).
                  Sementara: klik ikon ↗ untuk buka Google, salin lirik, lalu tempel di bawah.
                </p>
              )}

              {/* Editable draft (filled from a result, or paste manually) */}
              <div className="space-y-2 rounded-lg border bg-card p-3">
                <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Judul lagu" className="h-8 text-sm" />
                <Textarea
                  value={draftLyrics}
                  onChange={(e) => setDraftLyrics(e.target.value)}
                  placeholder="Tempel lirik di sini (baris kosong = pindah slide)..."
                  rows={5}
                  className="font-mono text-xs leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={saveToLibrary} onChange={(e) => setSaveToLibrary(e.target.checked)} className="rounded" />
                    Simpan · {segmentLyrics(draftLyrics).length} slide
                  </label>
                  <Button size="sm" onClick={addDraft} disabled={adding || !draftLyrics.trim()}>
                    {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                    Tambah ke Set
                  </Button>
                </div>
                {draftSource && (
                  <a href={draftSource} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> sumber
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
