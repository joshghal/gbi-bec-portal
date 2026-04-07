'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, RefreshCw, Users, Eye, Clock, MapPin,
  Monitor, Smartphone, Tablet, Activity, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { RequirePermission } from '@/components/require-permission';

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

/* ─── Formatters ─── */

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0 dtk';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} dtk`;
  if (s === 0) return `${m} mnt`;
  return `${m} mnt ${s} dtk`;
}

/* ─── Chart helpers ─── */

function smoothLinePath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }
  return d;
}

function smoothAreaPath(pts: [number, number][], h: number): string {
  if (pts.length < 2) return '';
  const line = smoothLinePath(pts);
  const last = pts[pts.length - 1];
  return `${line} L ${last[0]},${h} L ${pts[0][0]},${h} Z`;
}

/* ─── Device config ─── */

const DEVICE_COLOR: Record<string, string> = {
  desktop: '#10b981',
  mobile:  '#3b82f6',
  tablet:  '#8b5cf6',
};

function DeviceIcon({ category }: { category: string }) {
  const Icon = category === 'mobile' ? Smartphone : category === 'tablet' ? Tablet : Monitor;
  return <Icon className="w-3.5 h-3.5 text-muted-foreground" />;
}

/* ─── Mini donut ─── */

function MiniDonut({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!total) return <div className="w-12 h-12 rounded-full bg-muted/30 shrink-0" />;
  const r = 17;
  const C = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <g transform="rotate(-90 24 24)">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeOpacity=".1" />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * C;
          const offset = -(cum / total) * C;
          cum += seg.value;
          return (
            <circle key={i} cx="24" cy="24" r={r} fill="none"
              stroke={seg.color} strokeWidth="6"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ─── Stat card ─── */

function StatCard({
  icon: Icon, label, value, sub, delta, accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  delta?: { pct: number; up: boolean } | null;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl p-5 space-y-3 border border-border bg-card transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          accent ? 'bg-primary/15' : 'bg-muted/50'
        }`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        {delta != null && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
            delta.up
              ? 'text-emerald-600 bg-emerald-500/10'
              : 'text-red-500 bg-red-500/10'
          }`}>
            {delta.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta.pct}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ─── Main page ─── */

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoverDay, setHoverDay] = useState<{ date: string; users: number; sessions: number } | null>(null);

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

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const week  = data?.overview.week  || {};
  const month = data?.overview.month || {};

  function delta(wk: number, mo: number) {
    if (!mo) return null;
    const pace = wk * (30 / 7);
    const pct  = Math.abs(Math.round(((pace - mo) / mo) * 100));
    return { pct, up: pace >= mo };
  }

  // Chart geometry
  const CW = 800, CH = 120, PY = 10;
  const daily  = data?.daily || [];
  const maxU   = Math.max(...daily.map(d => d.users), 1);
  const pts: [number, number][] = daily.map((d, i) => [
    (i / Math.max(daily.length - 1, 1)) * CW,
    PY + (1 - d.users / maxU) * (CH - PY * 2),
  ]);
  const linePath = smoothLinePath(pts);
  const areaPath = smoothAreaPath(pts, CH);
  const xLabels  = daily.filter((_, i) => i === 0 || i % 7 === 0 || i === daily.length - 1);

  // Aggregates
  const devTotal  = data?.devices.reduce((s, d) => s + d.users, 0) || 0;
  const locTotal  = data?.locations.reduce((s, l) => s + l.users, 0) || 0;
  const pageMax   = Math.max(...(data?.pages.map(p => p.views) || []), 1);

  return (
    <RequirePermission permission="page:analytics">
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

        <main className="p-6 space-y-5">
          {loading && !data ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat analitik...
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">{error}</div>
          ) : data ? (
            <>
              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Users} label="Pengguna Aktif" accent
                  value={String(week.activeUsers || 0)}
                  sub={`${month.activeUsers || 0} pengguna (30 hari)`}
                  delta={delta(week.activeUsers || 0, month.activeUsers || 0)}
                />
                <StatCard
                  icon={Eye} label="Tampilan Halaman"
                  value={String(week.pageViews || 0)}
                  sub={`${month.pageViews || 0} tampilan (30 hari)`}
                  delta={delta(week.pageViews || 0, month.pageViews || 0)}
                />
                <StatCard
                  icon={Activity} label="Sesi"
                  value={String(week.sessions || 0)}
                  sub={`${month.sessions || 0} sesi (30 hari)`}
                  delta={delta(week.sessions || 0, month.sessions || 0)}
                />
                <StatCard
                  icon={Clock} label="Rata-rata Durasi"
                  value={formatDuration(week.avgSessionDuration || 0)}
                  sub="Per sesi · 7 hari"
                  delta={null}
                />
              </div>

              {/* ── Area Chart ── */}
              {daily.length > 1 && (
                <div className="border rounded-xl bg-card p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-medium">Pengguna Harian</p>
                    <span className="text-xs text-muted-foreground min-h-[1em]">
                      {hoverDay
                        ? `${new Date(hoverDay.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} — ${hoverDay.users} pengguna · ${hoverDay.sessions} sesi`
                        : '30 hari terakhir'}
                    </span>
                  </div>

                  {/* Grid + SVG wrapper */}
                  <div className="relative" onMouseLeave={() => setHoverDay(null)}>
                    {/* Horizontal gridlines */}
                    <div className="absolute inset-x-0" style={{ top: 0, height: 140, pointerEvents: 'none' }}>
                      {[0.25, 0.5, 0.75].map(p => (
                        <div
                          key={p}
                          className="absolute inset-x-0 border-t border-dashed border-border/40"
                          style={{ top: `${p * 100}%` }}
                        />
                      ))}
                    </div>

                    {/* SVG chart */}
                    <svg
                      viewBox={`0 0 ${CW} ${CH}`}
                      style={{ width: '100%', height: 140, overflow: 'visible' }}
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area fill */}
                      <path d={areaPath} fill="url(#areaGrad)" />

                      {/* Top stroke */}
                      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />

                      {/* Hover hit areas */}
                      {pts.map(([x, y], i) => (
                        <g key={i}>
                          <rect
                            x={x - CW / daily.length / 2}
                            y={0}
                            width={CW / daily.length}
                            height={CH}
                            fill="transparent"
                            onMouseEnter={() => setHoverDay(daily[i])}
                          />
                          {hoverDay === daily[i] && (
                            <>
                              <line x1={x} y1={0} x2={x} y2={CH}
                                stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
                              <circle cx={x} cy={y} r="4"
                                fill="#3b82f6" stroke="white" strokeWidth="2" />
                            </>
                          )}
                        </g>
                      ))}
                    </svg>

                    {/* X-axis labels */}
                    <div className="relative mt-2 h-4">
                      {xLabels.map((d, idx) => {
                        const orig = daily.indexOf(d);
                        const pct  = (orig / Math.max(daily.length - 1, 1)) * 100;
                        return (
                          <span
                            key={idx}
                            className="absolute text-[10px] text-muted-foreground -translate-x-1/2 whitespace-nowrap"
                            style={{ left: `${pct}%` }}
                          >
                            {new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Bottom grid ── */}
              <div className="grid md:grid-cols-[1fr_340px] gap-5 items-start">

                {/* Locations */}
                <div className="border rounded-xl bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">Lokasi Pengguna</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {locTotal} total · 30 hari
                    </span>
                  </div>
                  {data.locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Belum ada data</p>
                  ) : (
                    <div className="space-y-3">
                      {data.locations.map((loc, i) => {
                        const city    = loc.city !== '(not set)' ? loc.city : loc.country;
                        const country = loc.city !== '(not set)' ? loc.country : '';
                        const pct     = locTotal > 0 ? (loc.users / locTotal) * 100 : 0;
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-mono text-muted-foreground/50 w-4 shrink-0 tabular-nums">
                                  {i + 1}
                                </span>
                                <span className="font-medium truncate">{city}</span>
                                {country && (
                                  <span className="text-xs text-muted-foreground shrink-0">{country}</span>
                                )}
                              </div>
                              <span className="tabular-nums font-semibold shrink-0 text-sm">{loc.users}</span>
                            </div>
                            <div className="h-1 rounded-full bg-muted/40 ml-6">
                              <div
                                className="h-full rounded-full bg-primary/50 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right col */}
                <div className="space-y-5">

                  {/* Devices */}
                  <div className="border rounded-xl bg-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium">Perangkat</p>
                      <span className="text-xs text-muted-foreground">30 hari</span>
                    </div>
                    {data.devices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data</p>
                    ) : (
                      <div className="flex items-center gap-4">
                        <MiniDonut
                          segments={data.devices.map(d => ({
                            value: d.users,
                            color: DEVICE_COLOR[d.category.toLowerCase()] ?? '#94a3b8',
                          }))}
                        />
                        <div className="flex-1 space-y-2.5">
                          {data.devices.map((d, i) => {
                            const pct   = devTotal > 0 ? (d.users / devTotal) * 100 : 0;
                            const color = DEVICE_COLOR[d.category.toLowerCase()] ?? '#94a3b8';
                            return (
                              <div key={i} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <DeviceIcon category={d.category.toLowerCase()} />
                                    <span className="capitalize font-medium">{d.category}</span>
                                  </div>
                                  <span className="tabular-nums text-muted-foreground">
                                    {d.users} · {Math.round(pct)}%
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted/40">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Pages */}
                  <div className="border rounded-xl bg-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium">Halaman Teratas</p>
                      <span className="text-xs text-muted-foreground">7 hari</span>
                    </div>
                    {data.pages.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data</p>
                    ) : (
                      <div className="space-y-3">
                        {data.pages.map((p, i) => {
                          const pct    = (p.views / pageMax) * 100;
                          const parts  = p.path.split('/').filter(Boolean);
                          const slug   = parts[parts.length - 1] || '/';
                          const prefix = parts.length > 1 ? `/${parts.slice(0, -1).join('/')}/` : '';
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 text-xs">
                                  <span className="font-mono text-muted-foreground/50 w-4 shrink-0 tabular-nums">
                                    {i + 1}
                                  </span>
                                  <span className="truncate text-muted-foreground">
                                    {prefix}
                                    <span className="font-semibold text-foreground">{slug}</span>
                                  </span>
                                </div>
                                <span className="text-xs tabular-nums font-semibold shrink-0">
                                  {p.views}
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-muted/40 ml-6">
                                <div
                                  className="h-full rounded-full bg-primary/35 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </RequirePermission>
  );
}
