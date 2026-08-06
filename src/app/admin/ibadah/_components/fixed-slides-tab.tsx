'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Save, Music } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { toastApiError } from '@/lib/api-toast';
import { DEFAULT_SONG_BACKGROUND, type FixedSlide } from '@/lib/service-slides/types';

export function FixedSlidesTab() {
  const { user } = useAuth();
  const [slides, setSlides] = useState<FixedSlide[]>([]);
  const [songBg, setSongBg] = useState(DEFAULT_SONG_BACKGROUND);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const t = await user.getIdToken();
      const res = await fetch('/api/service-slides/fixed', { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) throw new Error('Gagal memuat');
      const data = await res.json();
      setSlides(Array.isArray(data.slides) ? data.slides : []);
      setSongBg(data.songBackgroundUrl || DEFAULT_SONG_BACKGROUND);
    } catch (e) {
      toastApiError(e, 'Gagal memuat slide tetap.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  function update(i: number, patch: Partial<FixedSlide>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    setSlides((prev) => [...prev, { id: `slide-${Date.now()}`, label: 'Slide Baru', imageUrl: '', order: prev.length }]);
  }

  function removeSlide(i: number) {
    setSlides((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const t = await user!.getIdToken();
      const payload = slides.map((s, i) => ({ ...s, order: i }));
      const res = await fetch('/api/service-slides/fixed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ slides: payload, songBackgroundUrl: songBg }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      toast.success('Slide tetap disimpan.');
    } catch (e) {
      toastApiError(e, 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Memuat...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground max-w-xl">
          Slide bergambar yang selalu dipakai tiap ibadah. Set baru otomatis memuatnya. Ganti gambar kapan saja.
        </p>
        <Button onClick={handleSave} size="sm" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
          Simpan
        </Button>
      </div>

      {/* Song background */}
      <div className="rounded-lg border bg-card p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-4 h-4 text-[#9a7230]" />
          <p className="text-sm font-medium">Latar Slide Lagu</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Gambar latar di belakang lirik lagu. Lirik ditampilkan putih di tengahnya.
        </p>
        <div className="max-w-md">
          <ImageUpload value={songBg} onChange={setSongBg} placeholder="Upload latar lagu atau tempel URL..." />
        </div>
      </div>

      {/* Fixed slides */}
      <div className="space-y-3">
        {slides.map((s, i) => (
          <div key={s.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-4">
              <span className="text-xs font-mono text-muted-foreground pt-2 w-5 text-center shrink-0">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Nama slide</Label>
                <Input value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Doa Penutup" />
              </div>
              <div className="w-64 shrink-0 space-y-2">
                <Label className="text-xs">Gambar slide</Label>
                <ImageUpload value={s.imageUrl} onChange={(url) => update(i, { imageUrl: url })} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                onClick={() => removeSlide(i)}
                title="Hapus slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-3" onClick={addSlide}>
        <Plus className="w-4 h-4 mr-1.5" />
        Tambah Slide Tetap
      </Button>
    </div>
  );
}
