'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  RefreshCw,
  Users,
  Eye,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface AnalyticsData {
  overview: {
    week: Record<string, number>;
    month: Record<string, number>;
  };
  locations: { country: string; city: string; users: number; sessions: number }[];
  pages: { path: string; views: number; users: number }[];
  devices: { category: string; users: number }[];
  daily: { date: string; users: number; sessions: number }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <Label className="text-xs uppercase tracking-wide">{label}</Label>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const deviceIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'mobile': return Smartphone;
    case 'tablet': return Tablet;
    default: return Monitor;
  }
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const week = data?.overview.week || {};
  const month = data?.overview.month || {};

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Analitik Pengguna</h1>
            <p className="text-xs text-muted-foreground">Google Analytics — G-SC5XWRE3BV</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat analitik...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : data ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Pengguna Aktif"
                value={String(week.activeUsers || 0)}
                sub={`${month.activeUsers || 0} (30h)`}
              />
              <StatCard
                icon={Eye}
                label="Tampilan Halaman"
                value={String(week.pageViews || 0)}
                sub={`${month.pageViews || 0} (30h)`}
              />
              <StatCard
                icon={BarChart3}
                label="Sesi"
                value={String(week.sessions || 0)}
                sub={`${month.sessions || 0} (30h)`}
              />
              <StatCard
                icon={Clock}
                label="Rata-rata Durasi"
                value={`${Math.round(week.avgSessionDuration || 0)}d`}
                sub="Per sesi (7h)"
              />
            </div>

            {/* Daily Users Chart */}
            {data.daily.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pengguna Aktif Harian (30 hari)
                </Label>
                <div className="flex items-end gap-px h-32">
                  {data.daily.map((d, i) => {
                    const max = Math.max(...data.daily.map(x => x.users), 1);
                    const height = (d.users / max) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-primary/60 hover:bg-primary rounded-t transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${d.date}: ${d.users} pengguna, ${d.sessions} sesi`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Two column: Locations + Devices */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Locations */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Lokasi Pengguna (30h)
                  </Label>
                </div>
                {data.locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data</p>
                ) : (
                  <div className="space-y-2">
                    {data.locations.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>
                          {loc.city !== '(not set)' ? loc.city : loc.country}
                          {loc.city !== '(not set)' && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({loc.country})
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {loc.users} pengguna
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Devices + Top Pages */}
              <div className="space-y-6">
                {/* Devices */}
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Perangkat (30h)
                  </Label>
                  {data.devices.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data</p>
                  ) : (
                    <div className="space-y-2">
                      {data.devices.map((d, i) => {
                        const Icon = deviceIcon(d.category);
                        const total = data.devices.reduce((sum, x) => sum + x.users, 0);
                        const pct = total > 0 ? Math.round((d.users / total) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="capitalize">{d.category}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {d.users} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Pages */}
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Halaman Teratas (7h)
                  </Label>
                  {data.pages.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data</p>
                  ) : (
                    <div className="space-y-2">
                      {data.pages.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs truncate max-w-[180px]">
                            {p.path}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {p.views} tampilan
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
