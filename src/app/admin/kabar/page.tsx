'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Pin, RefreshCw, Sparkles, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { generateSlug, stripHtml } from '@/lib/slug';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
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

interface Update {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  category: string;
  date: string;
  color: string;
  imageUrl?: string;
  isVideo?: boolean;
  pinned?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['Ibadah', 'Pengumuman', 'Kegiatan', 'Pelayanan', 'M-Class', 'Penyerahan Anak', 'Lainnya'] as const;

const COLOR_SWATCHES = [
  { label: 'Hijau', value: 'oklch(0.35 0.04 175)' },
  { label: 'Biru', value: 'oklch(0.30 0.04 260)' },
  { label: 'Coklat', value: 'oklch(0.32 0.04 55)' },
  { label: 'Merah', value: 'oklch(0.35 0.05 15)' },
  { label: 'Ungu', value: 'oklch(0.30 0.05 300)' },
  { label: 'Teal', value: 'oklch(0.32 0.05 200)' },
] as const;

const EMPTY_FORM: Omit<Update, 'createdAt' | 'updatedAt'> = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Ibadah',
  date: new Date().toISOString().slice(0, 10),
  color: COLOR_SWATCHES[0].value,
  imageUrl: '',
  isVideo: false,
  pinned: false,
  published: false,
};


export default function KabarPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Section toggle
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [togglingSection, setTogglingSection] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Instagram sync
  const [syncing, setSyncing] = useState(false);

  // AI: catatan khotbah -> kabar + poster
  const [aiOpen, setAiOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStage, setAiStage] = useState<'' | 'content' | 'poster' | 'done'>('');
  const [aiError, setAiError] = useState('');
  const [aiPosterFailed, setAiPosterFailed] = useState(false);

  // Progress steps shown in the "Dari Khotbah" dialog
  const AI_STEPS = [
    { key: 'content', label: 'Merapikan konten khotbah', note: 'Menyusun judul, ringkasan & konten.' },
    { key: 'poster', label: 'Membuat poster', note: 'Gemini membuat gambar — bisa ~20 detik.' },
    { key: 'done', label: 'Menyiapkan pratinjau', note: 'Membuka editor untuk ditinjau.' },
  ] as const;

  function aiStepStatus(key: string): 'done' | 'active' | 'pending' | 'warn' {
    const order = ['content', 'poster', 'done'];
    const cur = order.indexOf(aiStage);
    const idx = order.indexOf(key);
    if (key === 'poster' && aiPosterFailed && cur > idx) return 'warn';
    if (cur > idx) return 'done';
    if (cur === idx) return 'active';
    return 'pending';
  }

  async function handleGenerateFromNotes() {
    if (aiNotes.trim().length < 20) {
      setAiError('Tempelkan catatan khotbah terlebih dahulu.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiPosterFailed(false);
    setAiStage('content');
    try {
      const token = await user?.getIdToken();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      // 1) Generate kabar content (title, ringkasan, konten, kategori, tanggal)
      const cRes = await fetch('/api/updates/generate-content', {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: aiNotes.trim() }),
      });
      if (!cRes.ok) throw new Error('content');
      const draft = await cRes.json();

      setEditingId(null);
      setForm({
        title: draft.title ?? '',
        excerpt: draft.excerpt ?? '',
        content: draft.content ?? '',
        category: draft.category ?? 'Ibadah',
        date: draft.date ?? EMPTY_FORM.date,
        color: draft.color ?? COLOR_SWATCHES[0].value,
        imageUrl: '',
        isVideo: false,
        pinned: false,
        published: false,
      });

      // 2) Generate the Style-A poster (slower — Gemini + compose)
      setAiStage('poster');
      try {
        const pRes = await fetch('/api/updates/generate-poster', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            theme: draft.theme,
            serviceType: draft.serviceType,
            speaker: draft.speaker,
            date: draft.date,
          }),
        });
        if (pRes.ok) {
          const { imageUrl } = await pRes.json();
          if (imageUrl) setForm(prev => ({ ...prev, imageUrl }));
        } else {
          setAiPosterFailed(true);
          toast.warning('Konten dibuat, tetapi poster gagal. Anda bisa upload gambar manual.');
        }
      } catch {
        setAiPosterFailed(true);
        toast.warning('Konten dibuat, tetapi poster gagal. Anda bisa upload gambar manual.');
      }

      // 3) Mark complete, let the user see the finished steps, then hand off
      setAiStage('done');
      await new Promise(resolve => setTimeout(resolve, 800));
      setAiOpen(false);
      setAiNotes('');
      setFormError('');
      setDialogOpen(true);
    } catch {
      setAiError('Gagal membuat kabar dari catatan. Coba lagi.');
    } finally {
      setAiLoading(false);
      setAiStage('');
    }
  }

  async function handleInstagramSync() {
    setSyncing(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memicu sync');
      toast.success('Sync Instagram dimulai. Kabar baru akan muncul dalam ~2 menit.');
      setTimeout(() => fetchUpdates(), 90000);
    } catch (err) {
      toastApiError(err, 'Gagal memicu sync Instagram.');
    } finally {
      setSyncing(false);
    }
  }

  const fetchUpdates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const [updatesRes, settingsRes] = await Promise.all([
        fetch('/api/updates?all=1', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/updates/settings'),
      ]);
      if (!updatesRes.ok) throw new Error('Gagal memuat data');
      const [data, settings] = await Promise.all([updatesRes.json(), settingsRes.json()]);
      setUpdates(data);
      setSectionEnabled(settings.sectionEnabled ?? true);
    } catch (err) {
      toastApiError(err, 'Gagal memuat kabar terbaru.');
      setError('Gagal memuat kabar terbaru.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  async function handleToggleSection(enabled: boolean) {
    setTogglingSection(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/updates/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sectionEnabled: enabled }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setSectionEnabled(enabled);
    } catch (err) {
      toastApiError(err, 'Gagal mengubah pengaturan.');
    } finally {
      setTogglingSection(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(update: Update) {
    setEditingId(update.id ?? null);
    setForm({
      title: update.title,
      excerpt: update.excerpt,
      content: update.content ?? '',
      category: update.category,
      date: update.date,
      color: update.color,
      imageUrl: update.imageUrl ?? '',
      isVideo: update.isVideo ?? false,
      pinned: update.pinned ?? false,
      published: update.published,
    });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.date) {
      setFormError('Judul, ringkasan, dan tanggal wajib diisi.');
      return;
    }
    if (stripHtml(form.excerpt).length > 150) {
      setFormError('Ringkasan terlalu panjang. Maksimal 150 karakter.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const token = await user?.getIdToken();
      const body = {
        ...form,
        imageUrl: form.imageUrl?.trim() || null,
        content: form.content ?? '',
      };

      const url = editingId ? `/api/updates/${editingId}` : '/api/updates';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Gagal menyimpan');
      setDialogOpen(false);
      await fetchUpdates();
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan kabar.');
      setFormError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(update: Update) {
    if (!update.id) return;
    const newPinned = !update.pinned;
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/updates/${update.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: newPinned }),
      });
      if (!res.ok) throw new Error('Gagal mengubah pin.');
      // Server unpins others — update local state to match, then sort pinned first
      setUpdates(prev => {
        const next = prev.map(u => u.id === update.id
          ? { ...u, pinned: newPinned }
          : newPinned ? { ...u, pinned: false } : u
        );
        return [...next].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return 0;
        });
      });
    } catch (err) {
      toastApiError(err, 'Gagal mengubah pin.');
    }
  }

  async function handleTogglePublished(update: Update) {
    if (!update.id) return;
    try {
      const token = await user?.getIdToken();
      await fetch(`/api/updates/${update.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !update.published }),
      });
      setUpdates(prev =>
        prev.map(u => u.id === update.id ? { ...u, published: !u.published } : u)
      );
    } catch (err) {
      toastApiError(err, 'Gagal mengubah status publikasi.');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/updates/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setDeleteId(null);
      await fetchUpdates();
    } catch (err) {
      toastApiError(err, 'Gagal menghapus kabar.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <RequirePermission permission="page:kabar">
      <div className="min-h-0 flex-1">
        {/* Header */}
        <header className="border-b bg-card px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Kabar Terbaru</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {updates.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Section visibility toggle */}
              <div className="flex items-center gap-2.5 mr-auto sm:mr-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                  Tampilkan di halaman utama
                </span>
                <Switch
                  checked={sectionEnabled}
                  onCheckedChange={handleToggleSection}
                  disabled={togglingSection || loading}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleInstagramSync} disabled={syncing} title="Sync Instagram">
                <RefreshCw className={`w-4 h-4 sm:mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Memicu...' : 'Sync Instagram'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setAiNotes(''); setAiError(''); setAiStage(''); setAiPosterFailed(false); setAiOpen(true); }} title="Buat dari Catatan Khotbah">
                <Sparkles className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Dari Khotbah</span>
              </Button>
              <Button onClick={openAdd} size="sm" title="Tambah Kabar">
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Tambah</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat kabar terbaru...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-destructive text-sm">
              {error}
            </div>
          ) : updates.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Belum ada kabar terbaru. Klik &ldquo;Tambah&rdquo; untuk membuat yang pertama.
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Judul</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Kategori</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tanggal</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update, i) => (
                    <tr
                      key={update.id}
                      className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-muted/10'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: update.color }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {update.pinned && (
                                <Pin className="w-3 h-3 text-primary shrink-0 -rotate-45" />
                              )}
                              <span className="truncate block max-w-[140px] sm:max-w-[200px] font-medium" title={update.title}>
                                {update.title}
                              </span>
                            </div>
                            {update.slug && (
                              <a
                                href={`/kabar/${update.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground font-mono hover:text-primary flex items-center gap-0.5 mt-0.5"
                                onClick={e => e.stopPropagation()}
                              >
                                /kabar/{update.slug}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {update.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                        {formatDate(update.date)}
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={update.published}
                          onCheckedChange={() => handleTogglePublished(update)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${update.pinned ? 'text-primary bg-primary/10' : ''}`}
                            onClick={() => handleTogglePin(update)}
                            title={update.pinned ? 'Lepas pin' : 'Sematkan'}
                          >
                            <Pin className="w-3.5 h-3.5 -rotate-45" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(update)}
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(update.id ?? null)}
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kabar' : 'Tambah Kabar Terbaru'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi kabar terbaru.'
                : 'Isi detail untuk kabar terbaru yang baru.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="kabar-title">Judul <span className="text-destructive">*</span></Label>
              <Input
                id="kabar-title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ibadah Paskah 2026"
              />
              {form.title.trim() && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  /kabar/{generateSlug(form.title)}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Ringkasan <span className="text-destructive">*</span></Label>
                <span className={`text-xs font-mono tabular-nums ${stripHtml(form.excerpt).length > 150 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {stripHtml(form.excerpt).length}/150
                </span>
              </div>
              <RichTextEditor
                value={form.excerpt}
                onChange={val => setForm(prev => ({ ...prev, excerpt: val }))}
                placeholder="Deskripsi singkat kabar ini..."
              />
              {stripHtml(form.excerpt).length > 150 && (
                <p className="text-xs text-destructive">Ringkasan terlalu panjang. Maksimal 150 karakter.</p>
              )}
            </div>

            {/* Content (full body) */}
            <div className="space-y-1.5">
              <Label>Konten Lengkap <span className="text-muted-foreground text-xs font-normal">(opsional — untuk halaman detail)</span></Label>
              <RichTextEditor
                value={form.content ?? ''}
                onChange={val => setForm(prev => ({ ...prev, content: val }))}
                placeholder="Tulis konten lengkap artikel..."
              />
            </div>

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kabar-category">Kategori <span className="text-destructive">*</span></Label>
                <SearchableSelect
                  options={[...CATEGORIES]}
                  value={form.category}
                  onChange={val => setForm(prev => ({ ...prev, category: val || 'Ibadah' }))}
                  placeholder="Pilih kategori..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kabar-date">Tanggal <span className="text-destructive">*</span></Label>
                <DateInput
                  id="kabar-date"
                  value={form.date}
                  onChange={val => setForm(prev => ({ ...prev, date: val }))}
                />
              </div>
            </div>



            {/* Image */}
            <div className="space-y-1.5">
              <Label>Gambar <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
              <ImageUpload
                value={form.imageUrl ?? ''}
                onChange={url => setForm(prev => ({ ...prev, imageUrl: url }))}
              />
            </div>

            {/* Is Video + Published */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Tampilkan sebagai video</p>
                  <p className="text-xs text-muted-foreground">Menampilkan overlay tombol putar pada gambar</p>
                </div>
                <Switch
                  checked={form.isVideo ?? false}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, isVideo: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Sematkan (Pin)</p>
                  <p className="text-xs text-muted-foreground">Selalu tampil di urutan pertama</p>
                </div>
                <Switch
                  checked={form.pinned ?? false}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, pinned: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Publikasikan</p>
                  <p className="text-xs text-muted-foreground">Tampilkan di halaman utama</p>
                </div>
                <Switch
                  checked={form.published}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, published: checked }))}
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {editingId ? 'Simpan Perubahan' : 'Tambah Kabar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI: Generate from sermon notes */}
      <Dialog open={aiOpen} onOpenChange={open => { if (!aiLoading) setAiOpen(open); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Buat dari Catatan Khotbah
            </DialogTitle>
            <DialogDescription>
              Tempelkan catatan khotbah mentah. AI akan merapikannya menjadi kabar dan membuatkan poster.
              Anda dapat meninjau dan menyunting sebelum dipublikasikan.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-3">
            {aiLoading ? (
              <div className="rounded-lg border bg-muted/30 px-4 py-5 space-y-4">
                {AI_STEPS.map((s, i) => {
                  const st = aiStepStatus(s.key);
                  return (
                    <div key={s.key} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {st === 'done' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        {st === 'active' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        {st === 'warn' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                        {st === 'pending' && <Circle className="w-5 h-5 text-muted-foreground/30" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${
                          st === 'pending' ? 'text-muted-foreground/50'
                            : st === 'warn' ? 'text-amber-600'
                            : 'text-foreground'
                        }`}>
                          {i + 1}. {s.label}
                        </p>
                        {st === 'active' && <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>}
                        {st === 'warn' && <p className="text-xs text-amber-600/80 mt-0.5">Poster gagal — Anda bisa upload gambar manual.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <Textarea
                  value={aiNotes}
                  onChange={e => setAiNotes(e.target.value)}
                  rows={12}
                  className="min-h-[260px] font-mono text-xs leading-relaxed"
                  placeholder={'Kotbah BEC, 7 Juni 2026\n\n*Ps. Franky Kuncoro*\n\n*Menyembah dalam Roh*\n\n* Tidak cuma menyanyi\n* ...'}
                />
                {aiError && <p className="text-sm text-destructive">{aiError}</p>}
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)} disabled={aiLoading}>
              Batal
            </Button>
            <Button onClick={handleGenerateFromNotes} disabled={aiLoading || aiNotes.trim().length < 20}>
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              {aiLoading ? 'Memproses...' : 'Buat Kabar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Kabar</DialogTitle>
            <DialogDescription>
              Kabar ini akan dihapus secara permanen dan tidak bisa dikembalikan.
            </DialogDescription>
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
    </RequirePermission>
  );
}
