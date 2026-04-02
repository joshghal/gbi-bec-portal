'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Trash2, MessageCircleQuestion, Search, User, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RequirePermission } from '@/components/require-permission';

interface ChatMiss {
  id: string;
  question: string;
  response: string;
  sources: string[];
  timestamp: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fullTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ChatMissesPage() {
  const { user } = useAuth();
  const [misses, setMisses] = useState<ChatMiss[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChatMiss | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }, [user]);

  const fetchMisses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/chat-misses', { headers });
      const data = await res.json();
      setMisses(data.misses || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    fetchMisses();
  }, [fetchMisses]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/chat-misses/${id}`, { method: 'DELETE', headers });
      setMisses(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/chat-misses', { method: 'DELETE', headers });
      setMisses([]);
      setSelected(null);
    } finally {
      setClearing(false);
      setClearOpen(false);
    }
  };

  const filtered = misses.filter(m =>
    m.question.toLowerCase().includes(search.toLowerCase()) ||
    m.response.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RequirePermission permission="page:chat-misses">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">Pertanyaan Tak Terjawab</h1>
              <p className="text-xs text-muted-foreground">
                Pertanyaan yang tidak dapat dijawab AI — gunakan untuk melengkapi knowledge base
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{misses.length} entri</Badge>
              <Button variant="outline" size="icon" onClick={fetchMisses} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setClearOpen(true)}
                disabled={misses.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari pertanyaan atau respons..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <MessageCircleQuestion className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {search ? 'Tidak ditemukan.' : 'Belum ada pertanyaan tak terjawab.'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Respons AI</TableHead>
                    <TableHead className="w-[180px]">Konteks Ditemukan</TableHead>
                    <TableHead className="w-[120px]">Waktu</TableHead>
                    <TableHead className="w-[60px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(miss => (
                    <TableRow
                      key={miss.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(miss)}
                    >
                      <TableCell className="text-sm font-medium max-w-xs">
                        <p className="line-clamp-2">{miss.question}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-sm">
                        <p className="line-clamp-2">{miss.response}</p>
                      </TableCell>
                      <TableCell>
                        {miss.sources.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {miss.sources.map((s, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {relativeTime(miss.timestamp)}
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(miss.id)}
                          disabled={deletingId === miss.id}
                        >
                          {deletingId === miss.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>

        {/* Detail modal */}
        <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Percakapan</DialogTitle>
              {selected && (
                <DialogDescription>{fullTime(selected.timestamp)}</DialogDescription>
              )}
            </DialogHeader>

            {selected && (
              <DialogBody className="space-y-4">
                {/* Question */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Pertanyaan</p>
                    <p className="text-sm leading-relaxed">{selected.question}</p>
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-border ml-3.5" />

                {/* Response */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Respons AI</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.response}</p>
                  </div>
                </div>

                {/* Sources */}
                {selected.sources.length > 0 && (
                  <div className="bg-muted/50 rounded-lg px-3 py-2.5 ml-10">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Konteks yang ditemukan</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.sources.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </DialogBody>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive mr-auto"
                onClick={() => selected && handleDelete(selected.id)}
                disabled={!!deletingId}
              >
                {deletingId === selected?.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
                Hapus
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear all confirmation */}
        <Dialog open={clearOpen} onOpenChange={setClearOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Semua Entri?</DialogTitle>
              <DialogDescription>
                Semua <strong className="text-foreground">{misses.length} pertanyaan</strong> tak terjawab akan dihapus permanen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleClearAll} disabled={clearing}>
                {clearing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                Hapus Semua
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
