'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  RefreshCw,
  Activity,
  Clock,
  DollarSign,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface MonitorData {
  health: { status: string; latencyMs: number };
  metrics: {
    totalRequests: number;
    avgLatencyMs: number;
    billableInstanceSeconds: number;
    requestsByHour: { time: string; count: number }[];
  };
  cost: {
    estimatedUSD: number;
    estimatedIDR: number;
    period: string;
    breakdown: {
      requests: string;
      vcpuSeconds: string;
      memoryGiBSeconds: string;
    };
  };
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

export default function MonitorPage() {
  const { user } = useAuth();
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/monitor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat metrik');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const healthColor =
    data?.health.status === 'healthy'
      ? 'text-green-500'
      : data?.health.status === 'unhealthy'
        ? 'text-yellow-500'
        : 'text-red-500';

  return (
    <div className="min-h-0 flex-1">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Cloud Run Monitor</h1>
            <p className="text-xs text-muted-foreground">bec-embedding-service — asia-southeast1</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchMetrics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Memuat metrik...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : data ? (
          <>
            {/* Health */}
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${data.health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">Embedding Service</p>
                  <p className="text-xs text-muted-foreground">
                    https://bec-embedding-service-...run.app
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={healthColor}>
                  {data.health.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.health.latencyMs}ms respons
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Activity}
                label="Total Permintaan"
                value={data.metrics.totalRequests.toLocaleString()}
                sub="7 hari terakhir"
              />
              <StatCard
                icon={Clock}
                label="Rata-rata Latensi"
                value={`${data.metrics.avgLatencyMs}ms`}
                sub="Waktu respons rata-rata"
              />
              <StatCard
                icon={Server}
                label="Waktu Instance"
                value={`${data.metrics.billableInstanceSeconds}s`}
                sub="Detik tertagih"
              />
              <StatCard
                icon={Zap}
                label="Cold Start"
                value={data.metrics.billableInstanceSeconds > 0 ? 'Aktif' : 'Idle'}
                sub="Scale-to-zero aktif"
              />
            </div>

            {/* Cost */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Estimasi Biaya — {data.cost.period}
                </Label>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold">
                  Rp {data.cost.estimatedIDR.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">
                  (${data.cost.estimatedUSD.toFixed(4)} USD)
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Permintaan</p>
                  <p>{data.cost.breakdown.requests}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">vCPU</p>
                  <p>{data.cost.breakdown.vcpuSeconds}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Memori</p>
                  <p>{data.cost.breakdown.memoryGiBSeconds}</p>
                </div>
              </div>
            </div>

            {/* Request chart (simple bar) */}
            {data.metrics.requestsByHour.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Permintaan per Jam (7 hari terakhir)
                </Label>
                <div className="flex items-end gap-px h-32">
                  {data.metrics.requestsByHour.slice(-72).map((h, i) => {
                    const max = Math.max(...data.metrics.requestsByHour.slice(-72).map(x => x.count), 1);
                    const height = (h.count / max) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-primary/60 hover:bg-primary rounded-t transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${new Date(h.time).toLocaleString()}: ${h.count} permintaan`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
