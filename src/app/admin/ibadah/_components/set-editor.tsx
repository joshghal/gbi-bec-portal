'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Download,
  Wand2,
  Music,
  Presentation,
  Check,
  ImageIcon,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toastApiError } from '@/lib/api-toast';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { segmentLyrics } from '@/lib/service-slides/segment';
import { buildServicePptx } from '@/lib/pptx/build-service-pptx';
import {
  countSlides,
  DEFAULT_SONG_BACKGROUND,
  type FixedSlide,
  type ServiceItem,
  type ServiceSet,
} from '@/lib/service-slides/types';
import { AddSongDialog, type AddedSong } from './add-song-dialog';

/* ── Thumbnail (bg-image div avoids next/no-img-element) ────── */
function Thumb({ url, className }: { url?: string; className?: string }) {
  return (
    <div
      className={`rounded bg-cover bg-center border bg-muted shrink-0 ${className ?? ''}`}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    >
      {!url && (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

/* ── Sortable item row ──────────────────────────────────────── */
function SortableItem({
  item,
  index,
  onEdit,
  onRemove,
}: {
  item: ServiceItem;
  index: number;
  onEdit: (item: ServiceItem) => void;
  onRemove: (key: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative' as const,
  };

  const isSong = item.type === 'song';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-2.5 sm:px-3 sm:py-3 bg-card ${
        isDragging ? 'shadow-lg ring-1 ring-primary/20' : ''
      }`}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-xs font-mono text-muted-foreground w-5 text-center shrink-0">{index + 1}</span>

      {isSong ? (
        <div className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-[#9a7230]/10 text-[#9a7230]">
          <Music className="w-3 h-3" />
          Lagu
        </div>
      ) : (
        <Thumb url={item.imageUrl} className="w-14 h-8" />
      )}

      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block" title={isSong ? item.title : item.label}>
          {isSong ? item.title || <span className="text-muted-foreground italic">(tanpa judul)</span> : item.label}
        </span>
        <span className="text-xs text-muted-foreground block mt-0.5 truncate">
          {isSong ? `${item.artist ? `${item.artist} · ` : ''}${Math.max(1, item.slides.length)} slide` : 'Slide tetap'}
        </span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)} title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(item.key)}
          title="Hapus dari set"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ── Set editor ─────────────────────────────────────────────── */
export function SetEditor({ setId, onBack }: { setId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const [fixedTemplates, setFixedTemplates] = useState<FixedSlide[]>([]);
  const [songBg, setSongBg] = useState(DEFAULT_SONG_BACKGROUND);

  const [addSongOpen, setAddSongOpen] = useState(false);
  const [addFixedOpen, setAddFixedOpen] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Edit item dialog
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [eLabel, setELabel] = useState('');
  const [eImageUrl, setEImageUrl] = useState('');
  const [eTitle, setETitle] = useState('');
  const [eArtist, setEArtist] = useState('');
  const [eLyrics, setELyrics] = useState('');
  const [eTidying, setETidying] = useState(false);

  // Custom fixed slide (in add-fixed dialog)
  const [nfLabel, setNfLabel] = useState('');
  const [nfImageUrl, setNfImageUrl] = useState('');

  const totalSlides = useMemo(() => countSlides(items), [items]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const t = await user.getIdToken();
      const [setRes, cfgRes] = await Promise.all([
        fetch(`/api/service-sets/${setId}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/service-slides/fixed', { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (!setRes.ok) throw new Error('Gagal memuat set');
      const data: ServiceSet = await setRes.json();
      setTitle(data.title ?? '');
      setServiceDate(data.serviceDate ?? '');
      setItems(Array.isArray(data.items) ? data.items : []);
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setFixedTemplates(Array.isArray(cfg.slides) ? cfg.slides : []);
        setSongBg(cfg.songBackgroundUrl || DEFAULT_SONG_BACKGROUND);
      }
    } catch (e) {
      toastApiError(e, 'Gagal memuat set.');
    } finally {
      setLoading(false);
    }
  }, [user, setId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const persist = useCallback(
    async (patch: Partial<Pick<ServiceSet, 'title' | 'serviceDate' | 'items'>>) => {
      if (!user) return;
      try {
        const t = await user.getIdToken();
        const res = await fetch(`/api/service-sets/${setId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('Gagal menyimpan');
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
      } catch (e) {
        toastApiError(e, 'Gagal menyimpan perubahan.');
      }
    },
    [user, setId],
  );

  function commitItems(next: ServiceItem[]) {
    setItems(next);
    persist({ items: next });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.key === active.id);
    const newIndex = items.findIndex((i) => i.key === over.id);
    commitItems(arrayMove(items, oldIndex, newIndex));
  }

  function removeItem(key: string) {
    commitItems(items.filter((i) => i.key !== key));
  }

  function handleAddSong(song: AddedSong) {
    const item: ServiceItem = {
      key: crypto.randomUUID(),
      type: 'song',
      songId: song.songId,
      title: song.title,
      artist: song.artist,
      slides: song.slides,
    };
    commitItems([...items, item]);
    toast.success('Lagu ditambahkan ke set.');
  }

  function addFixed(label: string, imageUrl: string, fixedId?: string) {
    const item: ServiceItem = { key: crypto.randomUUID(), type: 'fixed', fixedId, label, imageUrl };
    commitItems([...items, item]);
  }

  function handleAddFixedTemplate(t: FixedSlide) {
    addFixed(t.label, t.imageUrl, t.id);
    setAddFixedOpen(false);
  }

  function handleAddFixedCustom() {
    if (!nfImageUrl) {
      toast.error('Pilih gambar slide dulu.');
      return;
    }
    addFixed(nfLabel.trim() || 'Slide Tetap', nfImageUrl);
    setNfLabel('');
    setNfImageUrl('');
    setAddFixedOpen(false);
  }

  function openEdit(item: ServiceItem) {
    setEditing(item);
    if (item.type === 'fixed') {
      setELabel(item.label);
      setEImageUrl(item.imageUrl);
    } else {
      setETitle(item.title);
      setEArtist(item.artist ?? '');
      setELyrics(item.slides.join('\n\n'));
    }
  }

  async function handleEditTidy() {
    if (!eLyrics.trim()) return;
    setETidying(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch('/api/songs/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ rawLyrics: eLyrics }),
      });
      const data = await res.json();
      if (Array.isArray(data.slides) && data.slides.length) {
        setELyrics(data.slides.join('\n\n'));
        toast.success(data.configured === false ? 'Dirapikan (pembagian otomatis).' : 'Lirik dirapikan AI.');
      }
    } catch (e) {
      toastApiError(e, 'Gagal merapikan.');
    } finally {
      setETidying(false);
    }
  }

  function saveEdit() {
    if (!editing) return;
    const next = items.map((it) => {
      if (it.key !== editing.key) return it;
      if (it.type === 'fixed') {
        return { ...it, label: eLabel.trim(), imageUrl: eImageUrl };
      }
      return { ...it, title: eTitle.trim(), artist: eArtist.trim(), slides: segmentLyrics(eLyrics) };
    });
    commitItems(next);
    setEditing(null);
  }

  async function handlePolish() {
    if (!items.some((i) => i.type === 'song')) {
      toast.error('Belum ada lagu untuk dirapikan.');
      return;
    }
    setPolishing(true);
    try {
      const t = await user!.getIdToken();
      const res = await fetch('/api/service-sets/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.configured === false) {
        toast.error('Fitur AI belum aktif', { description: 'GEMINI_API_KEY belum diatur di server.' });
        return;
      }
      if (Array.isArray(data.items)) {
        commitItems(data.items);
        toast.success('Lirik dirapikan', { description: 'Periksa hasilnya sebelum menayangkan.' });
      } else {
        toast.error('Gagal merapikan.');
      }
    } catch (e) {
      toastApiError(e, 'Gagal merapikan.');
    } finally {
      setPolishing(false);
    }
  }

  async function handleExport() {
    if (items.length === 0) {
      toast.error('Set masih kosong.');
      return;
    }
    setExporting(true);
    try {
      const set: ServiceSet = { id: setId, title: title || 'Ibadah', serviceDate, items, createdAt: '', updatedAt: '' };
      await buildServicePptx(set, songBg);
      toast.success('File PowerPoint diunduh.');
    } catch (e) {
      toastApiError(e, 'Gagal membuat file PowerPoint.');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Memuat set...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack} title="Kembali">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => persist({ title })}
              className="font-semibold text-base border-transparent hover:border-input focus:border-input px-2 -ml-2"
              placeholder="Judul set ibadah"
            />
          </div>
          {savedFlash && (
            <span className="text-xs text-green-600 inline-flex items-center gap-1 shrink-0">
              <Check className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{totalSlides} slide total</span>
          <Button variant="outline" size="sm" onClick={handlePolish} disabled={polishing}>
            {polishing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
            Rapikan Lirik (AI)
          </Button>
          <Button size="sm" onClick={handleExport} disabled={exporting || items.length === 0}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Download className="w-4 h-4 mr-1.5" />}
            Unduh PPTX
          </Button>
        </div>
      </div>

      {/* Add buttons */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => setAddSongOpen(true)}>
          <Music className="w-4 h-4 mr-1.5" />
          Tambah Lagu
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAddFixedOpen(true)}>
          <Presentation className="w-4 h-4 mr-1.5" />
          Tambah Slide Tetap
        </Button>
      </div>

      {/* Running order */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-1 rounded-lg border border-dashed">
          <Presentation className="w-6 h-6 mb-1 opacity-40" />
          Set masih kosong. Tambahkan lagu atau slide tetap.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.key)} strategy={verticalListSortingStrategy}>
            <div className="rounded-lg border bg-card overflow-hidden divide-y">
              {items.map((item, index) => (
                <SortableItem key={item.key} item={item} index={index} onEdit={openEdit} onRemove={removeItem} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddSongDialog open={addSongOpen} onOpenChange={setAddSongOpen} onAdd={handleAddSong} />

      {/* Add fixed slide dialog */}
      <Dialog open={addFixedOpen} onOpenChange={setAddFixedOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Slide Tetap</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-5">
            {fixedTemplates.length > 0 && (
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dari slide tetap</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {fixedTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleAddFixedTemplate(t)}
                      className="text-left rounded-lg border overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                    >
                      <Thumb url={t.imageUrl} className="w-full aspect-video rounded-none border-0" />
                      <span className="block text-xs px-2 py-1.5 truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Atau gambar khusus</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama</Label>
                  <Input value={nfLabel} onChange={(e) => setNfLabel(e.target.value)} placeholder="Pengumuman" />
                </div>
                <ImageUpload value={nfImageUrl} onChange={setNfImageUrl} />
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" onClick={handleAddFixedCustom} disabled={!nfImageUrl}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah gambar khusus
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog open={editing !== null} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.type === 'song' ? 'Edit Lagu di Set' : 'Edit Slide Tetap'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            {editing?.type === 'fixed' ? (
              <>
                <div className="space-y-1.5">
                  <Label>Nama slide</Label>
                  <Input value={eLabel} onChange={(e) => setELabel(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Gambar slide</Label>
                  <div className="max-w-md">
                    <ImageUpload value={eImageUrl} onChange={setEImageUrl} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Judul</Label>
                    <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Artis</Label>
                    <Input value={eArtist} onChange={(e) => setEArtist(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Lirik (baris kosong = pindah slide)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleEditTidy}
                      disabled={eTidying || !eLyrics.trim()}
                    >
                      {eTidying ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
                      Rapikan
                    </Button>
                  </div>
                  <Textarea
                    value={eLyrics}
                    onChange={(e) => setELyrics(e.target.value)}
                    rows={9}
                    className="font-mono text-sm leading-relaxed"
                  />
                  <p className="text-xs text-muted-foreground">{segmentLyrics(eLyrics).length} slide</p>
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={saveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
