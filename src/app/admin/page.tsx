'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Save,
  Search,
  LogOut,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Gagal masuk dengan Google.');
    } finally {
      setSigningIn(false);
    }
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
      console.error('Failed to fetch documents:', error);
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
      console.error('Save failed:', error);
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
      console.error('Delete failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const filtered = documents.filter(
    doc =>
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              GBI BEC Knowledge Base
            </p>
          </div>
          {authError && (
            <p className="text-sm text-destructive">{authError}</p>
          )}
          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            variant="outline"
            className="w-full"
          >
            {signingIn ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Masuk dengan Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-lg">Admin — Knowledge Base</h1>
              <p className="text-xs text-muted-foreground">
                Kelola dokumen GBI BEC di Pinecone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{documents.length} dokumen</Badge>
            <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => {
                setEditDoc({ ...EMPTY_DOC });
                setIsNew(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Keluar">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-6">
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
        <DialogContent className="max-w-lg">
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
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={editDoc.category}
                    onValueChange={v =>
                      setEditDoc({ ...editDoc, category: v ?? '' })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipe</Label>
                  <Select
                    value={editDoc.type}
                    onValueChange={v =>
                      setEditDoc({ ...editDoc, type: v ?? '' })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map(t => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
  );
}
