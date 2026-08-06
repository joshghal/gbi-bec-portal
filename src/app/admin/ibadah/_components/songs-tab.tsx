'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Sparkles, Wand2, ExternalLink, Music } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toastApiError } from '@/lib/api-toast';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { segmentLyrics } from '@/lib/service-slides/segment';
import type { Song } from '@/lib/service-slides/types';

interface Source {
  title: string;
  url: string;
}

export function SongsTab() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [saving, setSaving] = useState(false);
  const [finding, setFinding] = useState(false);
  const [tidying, setTidying] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const preview = useMemo(() => segmentLyrics(lyrics), [lyrics]);

  const fetchSongs = useCallback(
    async (q: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const t = await user.getIdToken();
        const url = q ? `/api/songs?q=${encodeURIComponent(q)}` : '/api/songs';
        const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) throw new Error('Gagal memuat lagu');
        setSongs(await res.json());
      } catch (e) {
        toastApiError(e, 'Gagal memuat lagu.');
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    const id = setTimeout(() => fetchSongs(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query, fetchSongs]);

  function openAdd() {
    setEditingId(null);
    setTitle('');
    setArtist('');
    setLyrics('');
    setSources([]);
    setOpen(true);
  }

  function openEdit(s: Song) {
    setEditingId(s.id ?? null);
    setTitle(s.title);
    setArtist(s.artist ?? '');
    setLyrics(s.rawLyrics ?? '');
    setSources([]);
    setOpen(true);
  }

  async function handleFind() {
    if (!title.trim()) {
      toast.error('Isi judul lagu dulu', { description: 'Ketik judul (atau sepenggal lirik) untuk dicari.' });
      return;
    }
    setFinding(true);
    setSources([]);
    try {
      const t = await user!.getIdToken();
      const res = await fetch('/api/songs/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ query: title.trim() }),
      });
      const data = await res.json();
      if (data.configured === false) {
        toast.error('Fitur AI belum aktif', { description: 'GEMINI_API_KEY belum diatur di server.' });
        return;
      }
      if (!data.found) {
        toast.error('Lirik tidak ditemukan', { description: 'Coba judul lain, atau tempel liriknya manual.' });
        setSources(data.sources ?? []);
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.artist) setArtist(data.artist);
      setLyrics(data.rawLyrics ?? '');
      setSources(data.sources ?? []);
      toast.success('Lirik ditemukan', { description: 'Mohon periksa kebenarannya sebelum menyimpan.' });
    } catch (e) {
      toastApiError(e, 'Pencarian gagal.');
    } finally {
      setFinding(false);
    }
  }

  async function handleTidy() {
    if (!lyrics.trim()) return;
    setTidying(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch('/api/songs/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ rawLyrics: lyrics }),
      });
      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length) {
        setLyrics(data.slides.join('\n\n'));
        toast.success(data.configured === false ? 'Dirapikan (pembagian otomatis).' : 'Lirik dirapikan AI.');
      }
    } catch (e) {
      toastApiError(e, 'Gagal merapikan.');
    } finally {
      setTidying(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Judul wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const t = await user!.getIdToken();
      const url = editingId ? `/api/songs/${editingId}` : '/api/songs';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ title: title.trim(), artist: artist.trim(), rawLyrics: lyrics }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setOpen(false);
      toast.success(editingId ? 'Lagu diperbarui.' : 'Lagu ditambahkan.');
      await fetchSongs(query.trim());
    } catch (e) {
      toastApiError(e, 'Gagal menyimpan lagu.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch(`/api/songs/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setDeleteId(null);
      toast.success('Lagu dihapus.');
      await fetchSongs(query.trim());
    } catch (e) {
      toastApiError(e, 'Gagal menghapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex items-center flex-1 max-w-sm">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul atau sepenggal lirik..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md border bg-muted/40 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Lagu
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Memuat lagu...
        </div>
      ) : songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-1">
          <Music className="w-6 h-6 mb-1 opacity-40" />
          {query ? 'Tidak ada lagu yang cocok.' : 'Belum ada lagu di perpustakaan.'}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden divide-y">
          {songs.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <Music className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate block">{s.title}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {s.artist ? `${s.artist} · ` : ''}
                  {(s.slides?.length ?? 0)} slide
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(s.id ?? null)}
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Lagu' : 'Tambah Lagu'}</DialogTitle>
            <DialogDescription>
              Tempel lirik manual, atau cari otomatis dengan AI — lalu periksa sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>
                  Judul <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="S'perti Rusa Rindu" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFind}
                    disabled={finding}
                    className="shrink-0"
                    title="Cari lirik online dengan AI"
                  >
                    {finding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span className="ml-1.5 hidden sm:inline">Cari (AI)</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Artis / Pencipta</Label>
                <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="(opsional)" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Lirik</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleTidy}
                  disabled={tidying || !lyrics.trim()}
                >
                  {tidying ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
                  Rapikan &amp; bagi slide
                </Button>
              </div>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={'Tempel lirik di sini.\n\nBaris kosong = pindah slide.'}
                rows={10}
                className="font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">
                Satu <strong>baris kosong</strong> memisahkan slide. {preview.length} slide.
              </p>
            </div>

            {sources.length > 0 && (
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Sumber (periksa kebenaran lirik):</p>
                <div className="flex flex-wrap gap-2">
                  {sources.slice(0, 5).map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-[220px] truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{s.title || s.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Slide preview */}
            {preview.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pratinjau slide</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {preview.map((slide, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-md bg-[#1a1714] text-white p-2.5 flex items-center justify-center text-center overflow-hidden"
                    >
                      <span className="text-[10px] leading-snug whitespace-pre-line line-clamp-5">{slide}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {editingId ? 'Simpan Perubahan' : 'Tambah Lagu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Lagu</DialogTitle>
            <DialogDescription>Lagu ini akan dihapus permanen dari perpustakaan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
