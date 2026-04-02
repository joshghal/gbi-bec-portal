'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toastApiError } from '@/lib/api-toast';
import { toast } from 'sonner';

interface Announcement {
  enabled: boolean;
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
}

const EMPTY: Announcement = {
  enabled: false,
  title: '',
  description: '',
  ctaLabel: '',
  ctaLink: '',
};

export default function PengumumanPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<Announcement>({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncement = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/announcement');
      if (res.ok) {
        const data = await res.json();
        setForm({
          enabled: data.enabled ?? false,
          title: data.title ?? '',
          description: data.description ?? '',
          ctaLabel: data.ctaLabel ?? '',
          ctaLink: data.ctaLink ?? '',
        });
      }
    } catch (err) {
      toastApiError(err, 'Gagal memuat pengumuman.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  async function handleSave() {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      toast.success('Pengumuman berhasil disimpan.');
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan pengumuman.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequirePermission permission="page:pengumuman">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-semibold text-lg">Pengumuman</h1>
              <p className="text-xs text-muted-foreground">Banner pengumuman di halaman utama</p>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form card */}
              <div className="rounded-lg border bg-card p-5 sm:p-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Panggilan Pelayanan"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Isi Pengumuman</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Bagi Bapak/Ibu/Sdr/i yang rindu melayani..."
                    rows={3}
                  />
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label Tombol <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
                    <Input
                      value={form.ctaLabel}
                      onChange={e => setForm(prev => ({ ...prev, ctaLabel: e.target.value }))}
                      placeholder="Hubungi Call Centre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link Tombol</Label>
                    <Input
                      value={form.ctaLink}
                      onChange={e => setForm(prev => ({ ...prev, ctaLink: e.target.value }))}
                      placeholder="https://wa.me/62..."
                    />
                  </div>
                </div>
              </div>

              {/* Toggle + Save */}
              <div className="rounded-lg border bg-card p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Aktifkan Pengumuman</p>
                    <p className="text-xs text-muted-foreground">Tampilkan banner di halaman utama</p>
                  </div>
                  <Switch
                    checked={form.enabled}
                    onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan
                </Button>
              </div>

            </div>
          )}
        </main>
      </div>
    </RequirePermission>
  );
}
