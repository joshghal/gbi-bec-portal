'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ExternalLink,
  Download,
  Eye,
  RefreshCw,
  FileImage,
} from 'lucide-react';

interface PosterGroup {
  slug: string;
  title: string;
  cover: string | null;
  content: string | null;
  coverExport: string | null;
  contentExport: string | null;
}

interface PosterData {
  posters: PosterGroup[];
  hasExports: boolean;
}

function PosterCard({
  file,
  exportFile,
  type,
  onExport,
  exporting,
}: {
  file: string;
  exportFile: string | null;
  type: 'Cover' | 'Content';
  onExport: (file: string) => void;
  exporting: boolean;
}) {
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="relative aspect-[24/15] bg-muted">
        {previewing ? (
          <iframe
            src={`/posters/${file}`}
            className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
            title={file}
          />
        ) : (
          <button
            onClick={() => setPreviewing(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <Eye className="w-6 h-6" />
            <span className="text-xs">Muat Preview</span>
          </button>
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{type}</p>
            {exportFile ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-medium">PNG</span>
            ) : (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Belum export</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{file}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onExport(file)}
            disabled={exporting}
            title="Export PNG"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(`/posters/${file}`, '_blank')}
            title="Buka di tab baru"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          {exportFile && (
            <a
              href={`/posters/exports/${exportFile}`}
              download={exportFile}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Download PNG"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostersPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingFiles, setExportingFiles] = useState<Set<string>>(new Set());
  const [exportMsg, setExportMsg] = useState('');

  const fetchPosters = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/posters', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat data poster');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const doExport = useCallback(async (files: string[]) => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch('/api/posters/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ files }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Export gagal' }));
      throw new Error(err.error || 'Export gagal');
    }
    return res.json();
  }, [user]);

  const handleExportAll = useCallback(async () => {
    setExportingAll(true);
    setExportMsg('');
    try {
      const result = await doExport([]);
      setExportMsg(`${result.results.length} poster berhasil di-export${result.errors.length ? `, ${result.errors.length} gagal` : ''}`);
      await fetchPosters();
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : 'Export gagal');
    } finally {
      setExportingAll(false);
    }
  }, [doExport, fetchPosters]);

  const handleExportSingle = useCallback(async (file: string) => {
    setExportingFiles(prev => new Set(prev).add(file));
    setExportMsg('');
    try {
      const result = await doExport([file]);
      if (result.errors?.length) {
        setExportMsg(`Gagal export ${file}: ${result.errors[0].error}`);
      } else {
        setExportMsg(`${result.results[0].png} berhasil di-export (${result.results[0].sizeKB}KB)`);
      }
      await fetchPosters();
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : 'Export gagal');
    } finally {
      setExportingFiles(prev => {
        const next = new Set(prev);
        next.delete(file);
        return next;
      });
    }
  }, [doExport, fetchPosters]);

  useEffect(() => {
    fetchPosters();
  }, [fetchPosters]);

  const isExporting = exportingAll || exportingFiles.size > 0;

  const exportedCount = data?.posters.reduce((n, g) =>
    n + (g.coverExport ? 1 : 0) + (g.contentExport ? 1 : 0), 0
  ) ?? 0;
  const totalCount = data?.posters.reduce((n, g) =>
    n + (g.cover ? 1 : 0) + (g.content ? 1 : 0), 0
  ) ?? 0;

  return (
    <RequirePermission permission="page:posters">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">Poster</h1>
              <p className="text-xs text-muted-foreground">
                {data ? `${data.posters.length} grup · ${exportedCount}/${totalCount} PNG tersedia` : 'Kelola poster layanan gereja'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPosters}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleExportAll}
                disabled={isExporting}
              >
                {exportingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4 mr-2" />
                )}
                Export Semua
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {exportMsg && (
            <div className="mb-4 border rounded-lg p-3 bg-muted/50">
              <p className="text-sm">{exportMsg}</p>
            </div>
          )}

          {loading && !data ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-destructive">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-8">
              {data.posters.map(group => (
                <section key={group.slug}>
                  <h2 className="font-semibold text-base mb-3">{group.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.cover && (
                      <PosterCard
                        file={group.cover}
                        exportFile={group.coverExport}
                        type="Cover"
                        onExport={handleExportSingle}
                        exporting={exportingAll || exportingFiles.has(group.cover)}
                      />
                    )}
                    {group.content && (
                      <PosterCard
                        file={group.content}
                        exportFile={group.contentExport}
                        type="Content"
                        onExport={handleExportSingle}
                        exporting={exportingAll || exportingFiles.has(group.content)}
                      />
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </RequirePermission>
  );
}
