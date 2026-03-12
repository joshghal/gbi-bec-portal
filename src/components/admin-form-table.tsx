'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  Loader2,
  Eye,
  Save,
  Trash2,
  Sheet,
  Search,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { normalizePhoneForWhatsApp } from '@/lib/search-utils';
import type { FormSubmission } from '@/lib/form-types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-accent bg-accent text-muted-foreground',
  reviewed: 'border-primary/20 bg-primary-light text-primary',
  completed: 'border-primary/30 bg-primary/10 text-primary',
};

export function AdminFormTable({ formType, title, readOnly = false }: { formType: string; title: string; readOnly?: boolean }) {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const isReadOnly = readOnly || !hasPermission(`page:forms/${formType}`);

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchSubmissions = useCallback(async (cursor?: string) => {
    if (!user) return;
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      params.set('type', formType);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/forms?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.submissions) {
        if (cursor) {
          setSubmissions(prev => [...prev, ...data.submissions]);
        } else {
          setSubmissions(data.submissions);
        }
      }
      setNextCursor(data.nextCursor ?? null);
      if (data.sheetUrl) {
        setSheetUrl(data.sheetUrl);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, formType, statusFilter, searchQuery]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 400);
  };

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
      if (step) return step.label || step.question;
    }
    return fieldKey;
  };

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{title}</h1>
            <p className="text-xs text-muted-foreground">
              Kelola formulir pendaftaran gereja
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{submissions.length} formulir</Badge>
            {sheetUrl && (
              <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Sheet className="w-4 h-4 mr-1.5" />
                  Sheets
                </Button>
              </a>
            )}
            <Button variant="outline" size="icon" onClick={() => fetchSubmissions()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-[280px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama, telepon, email..."
              className="pl-8 w-full"
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat formulir...
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {searchQuery.trim()
              ? 'Tidak ditemukan.'
              : statusFilter && statusFilter !== 'all'
                ? 'Tidak ditemukan.'
                : 'Belum ada formulir.'}
          </div>
        ) : (
          <>
            <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
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

            {nextCursor && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchSubmissions(nextCursor)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : null}
                  Muat lebih banyak
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-3">
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">
                      {getFieldLabel(selected, key)}
                    </p>
                    {key === 'noTelepon' && value ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm">{value}</p>
                        <a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(value)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            WA
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm mt-0.5">{value || '-'}</p>
                    )}
                  </div>
                ))}
              </div>

              {!isReadOnly && (
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
              )}
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isSuperAdmin && !isReadOnly ? (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Hapus
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                {isReadOnly ? 'Tutup' : 'Batal'}
              </Button>
              {!isReadOnly && (
                <Button onClick={handleStatusSave} disabled={saving || editStatus === selected?.status}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Save className="w-4 h-4 mr-1.5" />
                  )}
                  Simpan
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
