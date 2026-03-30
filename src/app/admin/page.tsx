'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  Save,
  Search,
  CalendarSync,
  Download,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toastApiError } from '@/lib/api-toast';
import { toast } from 'sonner';
import { RequirePermission } from '@/components/require-permission';

interface Document {
  id: string;
  content: string;
  category: string;
  source: string;
  type: string;
}

const CATEGORIES = [
  'jadwal',
  'baptisan',
  'penyerahan_anak',
  'kom',
  'kegiatan',
  'pernikahan',
  'kontak',
  'umum',
];

const TYPES = ['jadwal', 'persyaratan', 'info', 'kontak'];

const EMPTY_DOC: Document = {
  id: '',
  content: '',
  category: '',
  source: '',
  type: '',
};

export default function AdminPage() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [syncing, setSyncing] = useState(false);

  // Dialog state
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);

  const getAuthHeaders = async () => {
    const token = await user?.getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      toastApiError(error, 'Gagal memuat dokumen.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSave = async () => {
    if (!editDoc || !editDoc.content.trim()) return;

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      if (isNew) {
        if (!editDoc.id.trim()) return;
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers,
          body: JSON.stringify(editDoc),
        });
        if (!res.ok) throw new Error('Failed to create');
      } else {
        const res = await fetch(`/api/documents/${encodeURIComponent(editDoc.id)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(editDoc),
        });
        if (!res.ok) throw new Error('Failed to update');
      }
      setEditDoc(null);
      await fetchDocuments();
    } catch (error) {
      toastApiError(error, 'Gagal menyimpan dokumen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/documents/${encodeURIComponent(deleteDoc.id)}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteDoc(null);
      await fetchDocuments();
    } catch (error) {
      toastApiError(error, 'Gagal menghapus dokumen.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncDates = async () => {
    setSyncing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/documents/sync-dates', {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to sync');
      await fetchDocuments();
    } catch (error) {
      toastApiError(error, 'Gagal sinkronisasi tanggal.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(documents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = documents.filter(
    doc =>
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RequirePermission permission="page:knowledge-base">
      <div className="min-h-0 flex-1">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">Knowledge Base</h1>
              <p className="text-xs text-muted-foreground">
                Kelola dokumen GBI BEC di Pinecone
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{documents.length} dokumen</Badge>
              <Button variant="outline" size="icon" onClick={handleSyncDates} disabled={syncing} title="Sync Jadwal">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarSync className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportJSON} disabled={documents.length === 0} title="Export JSON">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="icon"
                onClick={() => {
                  setEditDoc({ ...EMPTY_DOC });
                  setIsNew(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat dokumen...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {searchQuery ? 'Tidak ditemukan.' : 'Belum ada dokumen.'}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">ID</TableHead>
                    <TableHead>Konten</TableHead>
                    <TableHead className="w-[120px]">Kategori</TableHead>
                    <TableHead className="w-[100px]">Tipe</TableHead>
                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                      <TableCell className="text-sm max-w-md">
                        <p className="line-clamp-2">{doc.content}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.type}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditDoc({ ...doc });
                              setIsNew(false);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteDoc(doc)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>

        {/* Edit / Add Dialog */}
        <Dialog open={!!editDoc} onOpenChange={open => !open && setEditDoc(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isNew ? 'Tambah Dokumen Baru' : 'Edit Dokumen'}</DialogTitle>
              <DialogDescription>
                {isNew
                  ? 'Tambahkan informasi baru ke knowledge base.'
                  : 'Ubah konten dan metadata. Embedding akan di-generate ulang.'}
              </DialogDescription>
            </DialogHeader>

            {editDoc && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doc-id">ID</Label>
                  <Input
                    id="doc-id"
                    value={editDoc.id}
                    onChange={e =>
                      setEditDoc({ ...editDoc, id: e.target.value })
                    }
                    disabled={!isNew}
                    placeholder="contoh: jadwal-ibadah-minggu"
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="doc-content">Konten</Label>
                  <Textarea
                    id="doc-content"
                    value={editDoc.content}
                    onChange={e =>
                      setEditDoc({ ...editDoc, content: e.target.value })
                    }
                    placeholder="Tulis informasi yang akan dijadikan jawaban oleh chatbot..."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <SearchableSelect
                      options={CATEGORIES}
                      value={editDoc.category}
                      onChange={v => setEditDoc({ ...editDoc, category: v })}
                      placeholder="Pilih kategori"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipe</Label>
                    <SearchableSelect
                      options={TYPES}
                      value={editDoc.type}
                      onChange={v => setEditDoc({ ...editDoc, type: v })}
                      placeholder="Pilih tipe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="doc-source">Sumber</Label>
                  <Input
                    id="doc-source"
                    value={editDoc.source}
                    onChange={e =>
                      setEditDoc({ ...editDoc, source: e.target.value })
                    }
                    placeholder="contoh: kegiatan-gbi-bec"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDoc(null)}>
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editDoc?.content.trim() || (isNew && !editDoc?.id.trim())}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                {isNew ? 'Tambah' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteDoc} onOpenChange={open => !open && setDeleteDoc(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Dokumen?</DialogTitle>
              <DialogDescription>
                Dokumen <strong className="text-foreground">{deleteDoc?.id}</strong> akan
                dihapus permanen dari knowledge base.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDoc(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1.5" />
                )}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
