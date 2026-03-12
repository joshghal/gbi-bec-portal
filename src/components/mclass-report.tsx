'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Users, UserCheck, Percent } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface MClassEntry {
  id: string;
  noMClass: string;
  namaLengkap: string;
  noTelepon: string;
  tanggalMClass: string;
  status: string;
  createdAt: string;
}

interface DateGroup {
  total: number;
  completed: number;
  entries: MClassEntry[];
}

interface ReportData {
  total: number;
  totalCompleted: number;
  byDate: Record<string, DateGroup>;
  byMonth: Record<string, { total: number; completed: number }>;
  submissions: MClassEntry[];
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/[0.06] shadow-sm p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function MClassReport({ onExportReady }: { onExportReady?: (exportFn: (() => void) | null) => void }) {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const fetchReport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/forms/mclass-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const dateKeys = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.byDate).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return { total: 0, completed: 0, entries: [] as MClassEntry[] };
    if (selectedDate === 'all') {
      return {
        total: data.total,
        completed: data.totalCompleted,
        entries: data.submissions,
      };
    }
    const group = data.byDate[selectedDate];
    return group || { total: 0, completed: 0, entries: [] };
  }, [data, selectedDate]);

  const attendanceRate = filtered.total > 0
    ? Math.round((filtered.completed / filtered.total) * 100)
    : 0;

  const handleExport = () => {
    const rows = filtered.entries.map((e, i) => ({
      'No': i + 1,
      'No M-Class': e.noMClass,
      'Nama': e.namaLengkap,
      'HP': e.noTelepon,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    ws['!cols'] = [
      { wch: 4 },
      { wch: 16 },
      { wch: 30 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = selectedDate === 'all' ? 'Semua' : selectedDate;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `Laporan-MClass-${sheetName}.xlsx`);
  };

  useEffect(() => {
    if (data && filtered.entries.length > 0) {
      onExportReady?.(() => handleExport());
    } else {
      onExportReady?.(null);
    }
    return () => onExportReady?.(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filtered, onExportReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Memuat laporan...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        Gagal memuat laporan.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedDate('all')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedDate === 'all'
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Semua
        </button>
        {dateKeys.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              selectedDate === date
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {date}
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
              {data.byDate[date].total}
            </Badge>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={Users}
          label="Total Pendaftar"
          value={filtered.total}
          sub={selectedDate !== 'all' ? selectedDate : `${dateKeys.length} tanggal`}
        />
        <StatCard
          icon={UserCheck}
          label="Hadir"
          value={filtered.completed}
          sub="Status: Hadir"
        />
        <StatCard
          icon={Percent}
          label="Tingkat Kehadiran"
          value={`${attendanceRate}%`}
          sub={`${filtered.completed} dari ${filtered.total} pendaftar`}
        />
      </div>

      {/* Per-date breakdown (only when "Semua" is selected) */}
      {selectedDate === 'all' && dateKeys.length > 0 && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/[0.06] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Per Tanggal</h3>
          </div>
          <div className="divide-y">
            {dateKeys.map(date => {
              const g = data.byDate[date];
              const rate = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;
              return (
                <div key={date} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{date}</p>
                    <p className="text-xs text-muted-foreground">{g.total} pendaftar</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{g.completed}/{g.total}</p>
                      <p className="text-xs text-muted-foreground">{rate}% hadir</p>
                    </div>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
