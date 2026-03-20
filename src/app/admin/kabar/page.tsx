'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Update {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  color: string;
  imageUrl?: string;
  isVideo?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['Ibadah', 'Pengumuman', 'Kegiatan', 'Pelayanan', 'Lainnya'] as const;

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
  category: 'Ibadah',
  date: new Date().toISOString().slice(0, 10),
  color: COLOR_SWATCHES[0].value,
  imageUrl: '',
  isVideo: false,
  published: false,
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function KabarPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const res = await fetch('/api/updates?all=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat data');
      const data: Update[] = await res.json();
      setUpdates(data);
    } catch (err) {
      console.error('Failed to fetch updates:', err);
      setError('Gagal memuat kabar terbaru.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

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
      category: update.category,
      date: update.date,
      color: update.color,
      imageUrl: update.imageUrl ?? '',
      isVideo: update.isVideo ?? false,
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
    setSaving(true);
    setFormError('');
    try {
      const token = await user?.getIdToken();
      const body = {
        ...form,
        imageUrl: form.imageUrl?.trim() || null,
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
      console.error('Save failed:', err);
      setFormError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
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
      console.error('Toggle published failed:', err);
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
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <RequirePermission permission="page:kabar">
      <div className="min-h-0 flex-1">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Kabar Terbaru</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {updates.length}
                </span>
              )}
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah
            </Button>
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
                          <span className="truncate max-w-[200px] font-medium" title={update.title}>
                            {update.title}
                          </span>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kabar' : 'Tambah Kabar Terbaru'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi kabar terbaru.'
                : 'Isi detail untuk kabar terbaru yang baru.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="kabar-title">Judul <span className="text-destructive">*</span></Label>
              <Input
                id="kabar-title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ibadah Paskah 2026"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="kabar-excerpt">Ringkasan <span className="text-destructive">*</span></Label>
              <Textarea
                id="kabar-excerpt"
                value={form.excerpt}
                onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Deskripsi singkat kabar ini..."
                rows={3}
              />
            </div>

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kabar-category">Kategori <span className="text-destructive">*</span></Label>
                <Select
                  value={form.category}
                  onValueChange={val => { if (val) setForm(prev => ({ ...prev, category: val })); }}
                >
                  <SelectTrigger id="kabar-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kabar-date">Tanggal <span className="text-destructive">*</span></Label>
                <Input
                  id="kabar-date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Color swatches */}
            <div className="space-y-1.5">
              <Label>Warna Aksen</Label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {COLOR_SWATCHES.map(swatch => (
                  <button
                    key={swatch.value}
                    type="button"
                    title={swatch.label}
                    onClick={() => setForm(prev => ({ ...prev, color: swatch.value }))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      form.color === swatch.value
                        ? 'border-foreground scale-110 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                  />
                ))}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="kabar-image">URL Gambar <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
              <Input
                id="kabar-image"
                value={form.imageUrl ?? ''}
                onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
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
          </div>

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
