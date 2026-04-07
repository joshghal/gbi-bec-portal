'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { stripHtml } from '@/lib/slug';
import { Switch } from '@/components/ui/switch';
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

interface Contact {
  name: string;
  waLink: string;
}

interface Activity {
  id?: string;
  title: string;
  subtitle: string;
  day: string;
  description: string;
  longDescription: string;
  tags: string[];
  contacts: Contact[];
  ctaLabel: string;
  ctaHref: string;
  ctaExternal: boolean;
  aiQuestion: string;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM: Omit<Activity, 'id' | 'order' | 'createdAt' | 'updatedAt'> = {
  title: '',
  subtitle: '',
  day: '',
  description: '',
  longDescription: '',
  tags: [],
  contacts: [],
  ctaLabel: '',
  ctaHref: '',
  ctaExternal: false,
  aiQuestion: '',
  enabled: true,
};

/* ── Sortable row ───────────────────────────────────────────── */

function SortableRow({
  activity,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onToggle: (a: Activity) => void;
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2.5 sm:px-4 sm:py-3 bg-card ${
        isDragging ? 'shadow-lg ring-1 ring-primary/20' : ''
      } ${!activity.enabled ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block" title={activity.title}>
          {activity.title}
        </span>
        <span className="text-xs text-muted-foreground block mt-0.5">
          {activity.subtitle}
        </span>
      </div>

      {/* Day */}
      <span className="hidden md:block text-xs text-muted-foreground shrink-0 w-[140px]">
        {activity.day}
      </span>

      {/* Enabled toggle */}
      <Switch
        checked={activity.enabled}
        onCheckedChange={() => onToggle(activity)}
      />

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(activity)} title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(activity)}
          title="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */

export default function KegiatanPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Section toggle
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [togglingSection, setTogglingSection] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const [activitiesRes, settingsRes] = await Promise.all([
        fetch('/api/activities?all=1', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/activities/settings'),
      ]);
      if (!activitiesRes.ok) throw new Error('Gagal memuat data');
      const [data, settings] = await Promise.all([activitiesRes.json(), settingsRes.json()]);
      setActivities(data);
      setSectionEnabled(settings.sectionEnabled ?? true);
    } catch (err) {
      toastApiError(err, 'Gagal memuat kegiatan.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  async function handleToggleSection(enabled: boolean) {
    setTogglingSection(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/activities/settings', {
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
    setTagsInput('');
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditingId(activity.id ?? null);
    setForm({
      title: activity.title,
      subtitle: activity.subtitle,
      day: activity.day,
      description: activity.description,
      longDescription: activity.longDescription ?? '',
      tags: activity.tags ?? [],
      contacts: activity.contacts ?? [],
      ctaLabel: activity.ctaLabel ?? '',
      ctaHref: activity.ctaHref ?? '',
      ctaExternal: activity.ctaExternal ?? false,
      aiQuestion: activity.aiQuestion ?? '',
      enabled: activity.enabled,
    });
    setTagsInput((activity.tags ?? []).join(', '));
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setFormError('Judul wajib diisi.');
      return;
    }
    if (stripHtml(form.description).length > 200) {
      setFormError('Ringkasan terlalu panjang. Maksimal 200 karakter.');
      return;
    }
    if (stripHtml(form.longDescription).length > 500) {
      setFormError('Deskripsi lengkap terlalu panjang. Maksimal 500 karakter.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const token = await user?.getIdToken();
      const body = {
        ...form,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      };

      const url = editingId ? `/api/activities/${editingId}` : '/api/activities';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setDialogOpen(false);
      await fetchActivities();
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan kegiatan.');
      setFormError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled(activity: Activity) {
    if (!activity.id) return;
    try {
      const token = await user?.getIdToken();
      await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !activity.enabled }),
      });
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, enabled: !a.enabled } : a)
      );
    } catch (err) {
      toastApiError(err, 'Gagal mengubah status.');
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex(a => a.id === active.id);
    const newIndex = activities.findIndex(a => a.id === over.id);
    const newList = arrayMove(activities, oldIndex, newIndex);
    setActivities(newList);

    try {
      const token = await user?.getIdToken();
      await fetch('/api/activities/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: newList.map(a => a.id) }),
      });
    } catch (err) {
      toastApiError(err, 'Gagal mengubah urutan.');
      await fetchActivities();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/activities/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setDeleteId(null);
      await fetchActivities();
    } catch (err) {
      toastApiError(err, 'Gagal menghapus kegiatan.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <RequirePermission permission="page:kegiatan">
      <div className="min-h-0 flex-1">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Kegiatan Kami</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {activities.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
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
              Memuat kegiatan...
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Belum ada kegiatan. Klik &ldquo;Tambah&rdquo; untuk membuat yang pertama.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={activities.map(a => a.id!)} strategy={verticalListSortingStrategy}>
                <div className="rounded-lg border bg-card overflow-hidden divide-y">
                  {activities.map((activity) => (
                    <SortableRow
                      key={activity.id}
                      activity={activity}
                      onToggle={handleToggleEnabled}
                      onEdit={openEdit}
                      onDelete={(a) => setDeleteId(a.id ?? null)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi kegiatan.'
                : 'Isi detail kegiatan baru.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {/* ── Informasi Dasar ──────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Informasi Dasar</legend>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Judul <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ibadah Raya"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={form.subtitle}
                    onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Kebaktian Utama"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jadwal</Label>
                <Input
                  value={form.day}
                  onChange={e => setForm(prev => ({ ...prev, day: e.target.value }))}
                  placeholder="Minggu · 17:00 WIB"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ringkasan</Label>
                  <span className={`text-xs font-mono tabular-nums ${stripHtml(form.description).length > 200 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {stripHtml(form.description).length}/200
                  </span>
                </div>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi singkat kegiatan..."
                  rows={2}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Deskripsi Lengkap <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
                  <span className={`text-xs font-mono tabular-nums ${stripHtml(form.longDescription).length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {stripHtml(form.longDescription).length}/500
                  </span>
                </div>
                <RichTextEditor
                  value={form.longDescription}
                  onChange={val => setForm(prev => ({ ...prev, longDescription: val }))}
                  placeholder="Penjelasan lebih detail tentang kegiatan ini..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tags <span className="text-muted-foreground text-xs font-normal">(pisahkan dengan koma)</span></Label>
                <Input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="KOM 100, KOM 200, KOM 300"
                />
              </div>
            </fieldset>

            <hr className="border-border" />

            {/* ── Kontak & Aksi ─────────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kontak & Aksi</legend>

              {/* Contacts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Kontak WhatsApp</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setForm(prev => ({ ...prev, contacts: [...prev.contacts, { name: '', waLink: '' }] }))}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Tambah
                  </Button>
                </div>
                {form.contacts.map((contact, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <Input
                      value={contact.name}
                      onChange={e => {
                        const updated = [...form.contacts];
                        updated[ci] = { ...updated[ci], name: e.target.value };
                        setForm(prev => ({ ...prev, contacts: updated }));
                      }}
                      placeholder="Nama"
                      className="flex-1"
                    />
                    <Input
                      value={contact.waLink}
                      onChange={e => {
                        const updated = [...form.contacts];
                        updated[ci] = { ...updated[ci], waLink: e.target.value };
                        setForm(prev => ({ ...prev, contacts: updated }));
                      }}
                      placeholder="https://wa.me/62..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setForm(prev => ({ ...prev, contacts: prev.contacts.filter((_, j) => j !== ci) }))}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {form.contacts.length === 0 && (
                  <p className="text-xs text-muted-foreground">Belum ada kontak.</p>
                )}
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label CTA <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
                  <Input
                    value={form.ctaLabel}
                    onChange={e => setForm(prev => ({ ...prev, ctaLabel: e.target.value }))}
                    placeholder="Daftar Baptisan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link CTA</Label>
                  <Input
                    value={form.ctaHref}
                    onChange={e => setForm(prev => ({ ...prev, ctaHref: e.target.value }))}
                    placeholder="/formulir/baptis"
                  />
                </div>
              </div>

              {/* AI Question */}
              <div className="space-y-2">
                <Label>Pertanyaan AI <span className="text-muted-foreground text-xs font-normal">(untuk tombol &ldquo;Tanya AI Kami&rdquo;)</span></Label>
                <Input
                  value={form.aiQuestion}
                  onChange={e => setForm(prev => ({ ...prev, aiQuestion: e.target.value }))}
                  placeholder="Kapan jadwal Ibadah Raya GBI BEC?"
                />
              </div>
            </fieldset>

            <hr className="border-border" />

            {/* ── Pengaturan ───────────────────────────── */}
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pengaturan</p>
            <div className="space-y-3 pt-1">
              {form.ctaLabel && (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Link CTA External</p>
                    <p className="text-xs text-muted-foreground">Buka di tab baru</p>
                  </div>
                  <Switch
                    checked={form.ctaExternal}
                    onCheckedChange={checked => setForm(prev => ({ ...prev, ctaExternal: checked }))}
                  />
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Aktifkan</p>
                  <p className="text-xs text-muted-foreground">Tampilkan di halaman utama</p>
                </div>
                <Switch
                  checked={form.enabled}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
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
              {editingId ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Kegiatan</DialogTitle>
            <DialogDescription>
              Kegiatan ini akan dihapus secara permanen dan tidak bisa dikembalikan.
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
