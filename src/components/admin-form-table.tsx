'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  Loader2,
  Eye,
  Pencil,
  Save,
  Trash2,
  Sheet,
  Search,
  MessageCircle,
  Link as LinkIcon,
  Copy,
  Printer,
  CheckCheck,
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
import { PrintFormChildDedication } from '@/components/print-form-child-dedication';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toastApiError } from '@/lib/api-toast';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FORM_TYPE_LABELS, FORM_STATUS_LABELS, getFormConfig } from '@/lib/form-config';
import { normalizePhoneForWhatsApp } from '@/lib/search-utils';
import type { FormSubmission } from '@/lib/form-types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-accent bg-accent text-muted-foreground',
  reviewed: 'border-primary/20 bg-primary-light text-primary',
  completed: 'border-primary/30 bg-primary/10 text-primary',
  hadir: 'border-primary/30 bg-primary/10 text-primary',
  'tidak-hadir': 'border-destructive/30 bg-destructive/10 text-destructive',
};

function EditLinkCopy({ editLink }: { editLink: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1 flex items-center gap-1.5 overflow-hidden">
      <div className="flex-1 overflow-hidden rounded-md bg-muted/60 px-2.5 py-1.5">
        <p className="text-xs truncate select-all">{editLink}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(editLink);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
      >
        {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

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

  const [editing, setEditing] = useState<FormSubmission | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);

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
      toastApiError(error, 'Gagal memuat data formulir.');
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
      toastApiError(error, 'Gagal mengubah status.');
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
      toastApiError(error, 'Gagal menghapus data.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (sub: FormSubmission) => {
    setSelected(sub);
    setEditStatus(sub.status);
  };

  const openEdit = (sub: FormSubmission) => {
    setEditing(sub);
    setEditData({ ...sub.data });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/forms/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: editing.type, data: editData }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditing(null);
      await fetchSubmissions();
    } catch (error) {
      toastApiError(error, 'Gagal menyimpan perubahan.');
    } finally {
      setSavingEdit(false);
    }
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
          <div className="w-full sm:w-[180px]">
            <SearchableSelect
              options={['all', 'pending', 'reviewed', 'completed', 'hadir', 'tidak-hadir']}
              labels={{ all: 'Semua status', pending: 'Menunggu', reviewed: 'Ditinjau', completed: 'Selesai', hadir: 'Hadir', 'tidak-hadir': 'Tidak Hadir' }}
              value={statusFilter}
              onChange={v => setStatusFilter(v || 'all')}
              placeholder="Semua status"
            />
          </div>
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
                    <TableHead className="w-[90px] text-left">Aksi</TableHead>
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
                      <TableCell className="text-left">
                        <div className="flex items-center justify-start gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDetail(sub)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(sub)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {formType === 'child-dedication' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const printWin = window.open('', '_blank', 'width=800,height=1000');
                                if (!printWin) return;
                                printWin.document.write(`<!DOCTYPE html><html><head><title>Formulir Penyerahan Anak - ${sub.data?.namaAnak || ''}</title></head><body><div id="root"></div></body></html>`);
                                printWin.document.close();
                                import('react-dom/client').then(({ createRoot }) => {
                                  const root = createRoot(printWin.document.getElementById('root')!);
                                  root.render(
                                    <PrintFormChildDedication data={sub.data as Record<string, string>} />
                                  );
                                  setTimeout(() => { printWin.print(); }, 500);
                                });
                              }}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
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
        <DialogContent className="sm:max-w-2xl" style={{ maxHeight: '85vh', gridTemplateRows: 'auto 1fr auto' }}>
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>
              {selected && (FORM_TYPE_LABELS[selected.type] || selected.type)}
              {selected && ` - ${getDisplayName(selected)}`}
            </DialogTitle>
            <DialogDescription>
              Dikirim {selected && new Date(selected.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 overflow-y-auto px-4 py-2">
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

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Link Edit
                </p>
                <EditLinkCopy editLink={`${typeof window !== 'undefined' ? window.location.origin : ''}/forms/edit/${selected.id}?token=${selected.editToken}`} />
              </div>

              {!isReadOnly && (
                <div className="border-t pt-4">
                  <Label>Status</Label>
                  <SearchableSelect
                    options={['pending', 'reviewed', 'completed', 'hadir', 'tidak-hadir']}
                    labels={{ pending: 'Menunggu', reviewed: 'Ditinjau', completed: 'Selesai', hadir: 'Hadir', 'tidak-hadir': 'Tidak Hadir' }}
                    value={editStatus}
                    onChange={v => setEditStatus(v || 'pending')}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div className="flex gap-2">
              {isSuperAdmin && !isReadOnly && (
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Hapus
                </Button>
              )}
            </div>
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

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl" style={{ maxHeight: '85vh', gridTemplateRows: 'auto 1fr auto' }}>
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>
              Edit — {editing && (FORM_TYPE_LABELS[editing.type] || editing.type)}
            </DialogTitle>
            <DialogDescription>
              {editing && getDisplayName(editing)}
            </DialogDescription>
          </DialogHeader>

          {editing && (() => {
            const config = getFormConfig(editing.type);
            const steps = config?.steps ?? [];
            return (
              <div className="space-y-3 overflow-y-auto px-4 py-2">
                {steps.filter(s => !s.hidden).map(step => (
                  <div key={step.field}>
                    <Label className="text-xs text-muted-foreground">{step.label}</Label>
                    {step.type === 'textarea' ? (
                      <Textarea
                        className="mt-1 text-sm"
                        rows={3}
                        value={editData[step.field] || ''}
                        onChange={e => setEditData(prev => ({ ...prev, [step.field]: e.target.value }))}
                      />
                    ) : step.type === 'select' && step.options ? (
                      <SearchableSelect
                        options={step.options}
                        value={editData[step.field] || ''}
                        onChange={v => setEditData(prev => ({ ...prev, [step.field]: v }))}
                        placeholder="Pilih..."
                      />
                    ) : step.type === 'date' ? (
                      <DateInput
                        value={editData[step.field] || ''}
                        onChange={v => setEditData(prev => ({ ...prev, [step.field]: v }))}
                      />
                    ) : (
                      <Input
                        className="mt-1 text-sm"
                        type={step.type === 'tel' ? 'tel' : step.type === 'email' ? 'email' : 'text'}
                        value={editData[step.field] || ''}
                        onChange={e => setEditData(prev => ({ ...prev, [step.field]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={handleEditSave} disabled={savingEdit}>
              {savingEdit ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
