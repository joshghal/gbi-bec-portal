'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Leader {
  name: string;
  phone: string;
  email: string;
}

interface CoolGroup {
  id?: string;
  name: string;
  area: string;
  ketua: Leader;
  wakil: Leader;
  sekretaris: Leader;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_LEADER: Leader = { name: '', phone: '', email: '' };

const EMPTY_FORM: Omit<CoolGroup, 'id' | 'order' | 'createdAt' | 'updatedAt'> = {
  name: '',
  area: '',
  ketua: { ...EMPTY_LEADER },
  wakil: { ...EMPTY_LEADER },
  sekretaris: { ...EMPTY_LEADER },
};

function LeaderFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Leader;
  onChange: (v: Leader) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border px-4 py-3 bg-muted/20">
      <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">{label}</legend>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Nama</Label>
        <Input
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          placeholder="Nama lengkap"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">No HP</Label>
          <Input
            value={value.phone}
            onChange={e => onChange({ ...value, phone: e.target.value })}
            placeholder="08..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input
            value={value.email}
            onChange={e => onChange({ ...value, email: e.target.value })}
            placeholder="email@..."
          />
        </div>
      </div>
    </fieldset>
  );
}

export default function CoolGroupPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CoolGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/cool-groups?all=1', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal memuat data');
      setGroups(await res.json());
    } catch (err) {
      toastApiError(err, 'Gagal memuat COOL group.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, ketua: { ...EMPTY_LEADER }, wakil: { ...EMPTY_LEADER }, sekretaris: { ...EMPTY_LEADER } });
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(g: CoolGroup) {
    setEditingId(g.id ?? null);
    setForm({
      name: g.name,
      area: g.area,
      ketua: g.ketua ?? { ...EMPTY_LEADER },
      wakil: g.wakil ?? { ...EMPTY_LEADER },
      sekretaris: g.sekretaris ?? { ...EMPTY_LEADER },
    });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError('Nama grup wajib diisi.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const token = await user?.getIdToken();
      const url = editingId ? `/api/cool-groups/${editingId}` : '/api/cool-groups';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setDialogOpen(false);
      await fetchGroups();
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan COOL group.');
      setFormError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/cool-groups/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setDeleteId(null);
      await fetchGroups();
    } catch (err) {
      toastApiError(err, 'Gagal menghapus COOL group.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <RequirePermission permission="page:cool-group">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">COOL Group</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {groups.length}
                </span>
              )}
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah
            </Button>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat COOL group...
            </div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Belum ada COOL group.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.id} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{g.name}</p>
                      {g.area && <p className="text-xs text-muted-foreground mt-0.5">{g.area}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(g.id ?? null)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {g.ketua?.name && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground">Ketua:</span>{' '}
                          <span className="font-medium">{g.ketua.name}</span>
                        </div>
                        {g.ketua.phone && (
                          <a href={`https://wa.me/${g.ketua.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            WA
                          </a>
                        )}
                      </div>
                    )}
                    {g.wakil?.name && g.wakil.name !== 'Kosong' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground">Wakil:</span>{' '}
                          <span className="font-medium">{g.wakil.name}</span>
                        </div>
                        {g.wakil.phone && (
                          <a href={`https://wa.me/${g.wakil.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            WA
                          </a>
                        )}
                      </div>
                    )}
                    {g.sekretaris?.name && g.sekretaris.name !== 'Kosong' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground">Sekretaris:</span>{' '}
                          <span className="font-medium">{g.sekretaris.name}</span>
                        </div>
                        {g.sekretaris.phone && (
                          <a href={`https://wa.me/${g.sekretaris.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            WA
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit COOL Group' : 'Tambah COOL Group'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui informasi grup.' : 'Isi detail COOL group baru.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Grup <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cool Barsi Shallom"
                />
              </div>
              <div className="space-y-2">
                <Label>Daerah</Label>
                <Input
                  value={form.area}
                  onChange={e => setForm(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Jl. Sunda, Kosambi"
                />
              </div>
            </div>

            <LeaderFields label="Ketua" value={form.ketua} onChange={v => setForm(prev => ({ ...prev, ketua: v }))} />
            <LeaderFields label="Wakil" value={form.wakil} onChange={v => setForm(prev => ({ ...prev, wakil: v }))} />
            <LeaderFields label="Sekretaris" value={form.sekretaris} onChange={v => setForm(prev => ({ ...prev, sekretaris: v }))} />

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {editingId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus COOL Group</DialogTitle>
            <DialogDescription>Grup ini akan dihapus secara permanen.</DialogDescription>
          </DialogHeader>
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
