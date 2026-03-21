'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';

interface AdminLog {
  id: string;
  adminEmail: string;
  action: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string | null;
  resourceTitle?: string | null;
  timestamp: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Tambah',
  update: 'Ubah',
  delete: 'Hapus',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  delete: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const RESOURCE_LABELS: Record<string, string> = {
  'kabar': 'Kabar Terbaru',
  'kabar-settings': 'Pengaturan Kabar',
  'document': 'Basis Pengetahuan',
  'admin-user': 'Kelola Admin',
  'form-status': 'Status Formulir',
};

const FILTER_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'create', label: 'Tambah' },
  { value: 'update', label: 'Ubah' },
  { value: 'delete', label: 'Hapus' },
];

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function LogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchLogs = useCallback(async (cursor?: string) => {
    if (!user) return;
    const isLoadMore = !!cursor;
    isLoadMore ? setLoadingMore(true) : setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      if (cursor) params.set('before', cursor);

      const res = await fetch(`/api/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat log');

      const data: { logs: AdminLog[]; nextCursor: string | null } = await res.json();
      setLogs(prev => isLoadMore ? [...prev, ...data.logs] : data.logs);
      setNextCursor(data.nextCursor);
    } catch {
      setError('Gagal memuat log aktivitas.');
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }, [user, actionFilter]);

  useEffect(() => {
    setLogs([]);
    setNextCursor(null);
    fetchLogs();
  }, [fetchLogs]);

  return (
    <RequirePermission permission="page:log">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-lg">Log Aktivitas</h1>
              {!loading && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {logs.length}
                </span>
              )}
            </div>
            {/* Action filter pills */}
            <div className="flex items-center gap-1.5">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setActionFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    actionFilter === opt.value
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat log...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-destructive text-sm">{error}</div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Belum ada aktivitas yang tercatat.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Waktu</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Admin</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tindakan</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Sumber</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr
                        key={log.id}
                        className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {formatTs(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs truncate max-w-[160px]" title={log.adminEmail}>
                          {log.adminEmail}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-muted text-muted-foreground'}`}>
                            {ACTION_LABELS[log.action] ?? log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {RESOURCE_LABELS[log.resource] ?? log.resource}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate" title={log.resourceTitle ?? log.resourceId ?? ''}>
                          {log.resourceTitle || log.resourceId || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {nextCursor && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(nextCursor)}
                    disabled={loadingMore}
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                    Muat lebih
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </RequirePermission>
  );
}
