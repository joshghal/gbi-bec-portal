'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Presentation, Copy, ChevronRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { countSlides, type ServiceSet } from '@/lib/service-slides/types';
import { SetEditor } from './set-editor';

export function SetsTab() {
  const { user } = useAuth();
  const [sets, setSets] = useState<ServiceSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [duplicateFrom, setDuplicateFrom] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const t = await user.getIdToken();
      const res = await fetch('/api/service-sets', { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) throw new Error('Gagal memuat set');
      setSets(await res.json());
    } catch (e) {
      toastApiError(e, 'Gagal memuat set ibadah.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedId === null) fetchSets();
  }, [selectedId, fetchSets]);

  function openCreate() {
    const today = new Date();
    setNewTitle('');
    setNewDate(today.toISOString().slice(0, 10));
    setDuplicateFrom('');
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!newTitle.trim()) {
      toast.error('Judul set wajib diisi.');
      return;
    }
    setCreating(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch('/api/service-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({
          title: newTitle.trim(),
          serviceDate: newDate,
          duplicateFrom: duplicateFrom || undefined,
        }),
      });
      if (!res.ok) throw new Error('Gagal membuat set');
      const created = await res.json();
      setCreateOpen(false);
      toast.success('Set dibuat.');
      setSelectedId(created.id);
    } catch (e) {
      toastApiError(e, 'Gagal membuat set.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch(`/api/service-sets/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setDeleteId(null);
      toast.success('Set dihapus.');
      await fetchSets();
    } catch (e) {
      toastApiError(e, 'Gagal menghapus set.');
    } finally {
      setDeleting(false);
    }
  }

  if (selectedId) {
    return <SetEditor setId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Presentasi ibadah per minggu. Buat baru atau salin dari minggu lalu.</p>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Buat Set
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Memuat...
        </div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-1">
          <Presentation className="w-6 h-6 mb-1 opacity-40" />
          Belum ada set ibadah. Klik &ldquo;Buat Set&rdquo; untuk mulai.
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden divide-y">
          {sets.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
              <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setSelectedId(s.id ?? null)}>
                <Presentation className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm truncate block">{s.title}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    {s.serviceDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {s.serviceDate}
                      </span>
                    )}
                    <span>{countSlides(s.items ?? [])} slide</span>
                  </span>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(s.id ?? null)}
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Set Ibadah</DialogTitle>
            <DialogDescription>Set baru otomatis berisi slide-slide tetap.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1.5">
              <Label>
                Judul <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ibadah Raya Minggu"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {sets.length > 0 && (
              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  Salin dari (opsional)
                </Label>
                <Select value={duplicateFrom} onValueChange={(v) => setDuplicateFrom(v ?? '')}>
                  <SelectTrigger className="w-full bg-muted/40">
                    <SelectValue>
                      {(val: string | null) => {
                        const s = val ? sets.find((x) => x.id === val) : null;
                        return s ? s.title : '— Set kosong (hanya slide tetap) —';
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Set kosong (hanya slide tetap) —</SelectItem>
                    {sets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Buat &amp; Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Set</DialogTitle>
            <DialogDescription>Set ibadah ini akan dihapus permanen.</DialogDescription>
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
