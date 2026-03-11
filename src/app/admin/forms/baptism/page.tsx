'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

interface BaptismDate {
  date: string;
  label: string;
  slots: number;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BaptismDateManager() {
  const { user } = useAuth();
  const [dates, setDates] = useState<BaptismDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [pendingDelete, setPendingDelete] = useState<BaptismDate | null>(null);
  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forms/baptism-dates');
      const data = await res.json();
      setDates(data.dates || []);
    } catch (error) {
      console.error('Failed to fetch baptism dates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const saveDates = useCallback(async (updated: BaptismDate[]) => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/forms/baptism-dates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dates: updated }),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (error) {
      console.error('Save baptism dates failed:', error);
      fetchDates(); // revert to server state on error
    } finally {
      setSaving(false);
    }
  }, [user, fetchDates]);

  const addDate = () => {
    if (!newDate) return;
    const exists = dates.some(d => d.date === newDate);
    if (exists) return;

    const label = formatDateLabel(newDate);
    const updated = [...dates, { date: newDate, label, slots: 20 }].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    setDates(updated);
    setNewDate('');
    saveDates(updated);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const updated = dates.filter(d => d.date !== pendingDelete.date);
    setDates(updated);
    setPendingDelete(null);
    saveDates(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat tanggal...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-sm">Tanggal Baptisan Tersedia</h2>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
      </div>

      {/* List of dates */}
      {dates.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada tanggal baptisan.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {dates.map(d => (
            <Badge
              key={d.date}
              variant="secondary"
              className="text-sm py-1.5 px-3 gap-1.5"
            >
              {d.label}
              <button
                type="button"
                onClick={() => setPendingDelete(d)}
                className="ml-1 hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add date input */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="w-[180px]"
          min={new Date().toISOString().split('T')[0]}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDate}
          disabled={!newDate}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Tambah
        </Button>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tanggal Baptisan</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{pendingDelete?.label}</strong>? Pendaftar yang sudah memilih tanggal ini tidak akan terpengaruh, tetapi tanggal ini tidak akan muncul lagi di formulir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminBaptismPage() {
  return (
    <RequirePermission permission="page:forms/baptism">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="border-b bg-card px-6 py-4">
          <BaptismDateManager />
        </div>
        <AdminFormTable formType="baptism" title="Baptisan" />
      </div>
    </RequirePermission>
  );
}
