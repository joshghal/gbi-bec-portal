'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Pin } from 'lucide-react';
import { generateSlug, stripHtml } from '@/lib/slug';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
      await fetch(`/api/updates/${update.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: newPinned }),
      });
      // Server unpins others — update local state to match
      setUpdates(prev =>
        prev.map(u => u.id === update.id
          ? { ...u, pinned: newPinned }
          : newPinned ? { ...u, pinned: false } : u
        )
      );
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
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Kabar Terbaru</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {updates.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Section visibility toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                  Tampilkan di halaman utama
                </span>
                <Switch
                  checked={sectionEnabled}
                  onCheckedChange={handleToggleSection}
                  disabled={togglingSection || loading}
                />
              </div>
              <Button onClick={openAdd} size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Tambah
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
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
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-sm">
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
                              <span className="truncate block max-w-[200px] font-medium" title={update.title}>
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
