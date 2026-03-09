'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Loader2,
  Eye,
  Save,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FORM_TYPE_LABELS, FORM_STATUS_LABELS, getFormConfig } from '@/lib/form-config';
import type { FormSubmission } from '@/lib/form-types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
  reviewed: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-400',
  completed: 'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-400',
};

const SUPER_ADMIN_EMAIL = 'joshuag.profesional@gmail.com';

export default function AdminFormsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail dialog
  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      const qs = params.toString();
      const res = await fetch(`/api/forms${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, typeFilter, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleStatusSave = async () => {
    if (!selected || !editStatus) return;
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/forms/${selected.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setSelected(null);
      await fetchSubmissions();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/forms/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setSelected(null);
      await fetchSubmissions();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (sub: FormSubmission) => {
    setSelected(sub);
    setEditStatus(sub.status);
  };

  const getDisplayName = (sub: FormSubmission): string => {
    if (sub.type === 'child-dedication') {
      return sub.data.namaAnak || '-';
    }
    return sub.data.namaLengkap || '-';
  };

  const getFieldLabel = (sub: FormSubmission, fieldKey: string): string => {
    const config = getFormConfig(sub.type);
    if (config) {
      const step = config.steps.find(s => s.field === fieldKey);
      if (step) return step.question;
    }
    return fieldKey;
  };

  return (
    <div className="min-h-0 flex-1">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Formulir</h1>
            <p className="text-xs text-muted-foreground">
              Kelola formulir pendaftaran gereja
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{submissions.length} formulir</Badge>
            <Button variant="outline" size="icon" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v ?? '')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              <SelectItem value="kom">KOM</SelectItem>
              <SelectItem value="baptism">Baptisan</SelectItem>
              <SelectItem value="child-dedication">Penyerahan Anak</SelectItem>
              <SelectItem value="prayer">Pokok Doa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="reviewed">Ditinjau</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat formulir...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {(typeFilter && typeFilter !== 'all') || (statusFilter && statusFilter !== 'all') ? 'Tidak ditemukan.' : 'Belum ada formulir.'}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-[140px]">Tipe</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead className="w-[60px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-sm">
                      {getDisplayName(sub)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {FORM_TYPE_LABELS[sub.type] || sub.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_STYLES[sub.status] || ''}`}
                      >
                        {FORM_STATUS_LABELS[sub.status] || sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString('id-ID')}{' '}
                      {new Date(sub.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDetail(sub)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected && (FORM_TYPE_LABELS[selected.type] || selected.type)}
              {selected && ` - ${getDisplayName(selected)}`}
            </DialogTitle>
            <DialogDescription>
              Dikirim {selected && new Date(selected.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Data fields */}
              <div className="space-y-3">
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">
                      {getFieldLabel(selected, key)}
                    </p>
                    <p className="text-sm mt-0.5">{value || '-'}</p>
                  </div>
                ))}
              </div>

              {/* Status update */}
              <div className="border-t pt-4">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={v => setEditStatus(v ?? '')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="reviewed">Ditinjau</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isSuperAdmin ? (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Hapus
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Batal
              </Button>
              <Button onClick={handleStatusSave} disabled={saving || editStatus === selected?.status}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Simpan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
