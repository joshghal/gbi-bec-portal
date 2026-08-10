'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * The notulen's one-time notes form.
 *
 * Submitting is irreversible in two ways, which the confirm dialog spells out:
 *   1. it ends the live transcription (an accidental tap mid-sermon truncates it)
 *   2. the link burns — it cannot be used again
 *
 * Notes are mirrored to localStorage on every keystroke so a dropped connection
 * or an accidental refresh in the middle of a service never loses the typing.
 */

const MAX_LENGTH = 20000;

export function NotetakerForm({
  draftId,
  endpoint,
  service,
  live = true,
}: {
  /** Stable key for the localStorage draft — a token or a notulen slug. */
  draftId: string;
  /** POST target: /api/notetaker/<token> or /api/notulen/<slug>. */
  endpoint: string;
  service: string;
  /**
   * Whether the capture is still running. Drives the confirm-dialog copy —
   * warning that submitting stops the transcription is only true while it is.
   */
  live?: boolean;
}) {
  const draftKey = `bec-catatan-draft:${draftId}`;
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | { captureStopping: boolean }>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore any draft from a previous visit on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        setNotes(saved);
        setDraftRestored(true);
      }
    } catch { /* private mode / storage disabled — not worth surfacing */ }
  }, [draftKey]);

  const handleChange = useCallback((value: string) => {
    setNotes(value);
    setDraftRestored(false);
    try { localStorage.setItem(draftKey, value); } catch { /* noop */ }
  }, [draftKey]);

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error ?? `Gagal mengirim (HTTP ${res.status}).`);

      try { localStorage.removeItem(draftKey); } catch { /* noop */ }
      setConfirmOpen(false);
      setDone({ captureStopping: result.captureStopping === true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim catatan.');
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold">Catatan terkirim. Terima kasih!</h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {done.captureStopping
                ? 'Transkripsi ibadah sedang dihentikan, lalu catatan Anda akan digabung dengan hasil transkrip dan diterbitkan otomatis di halaman Kabar. Tidak ada yang perlu Anda lakukan lagi.'
                : 'Catatan Anda akan digabung dengan hasil transkrip dan diterbitkan otomatis di halaman Kabar. Tidak ada yang perlu Anda lakukan lagi.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const charCount = notes.trim().length;
  const canSubmit = charCount > 0 && charCount <= MAX_LENGTH && !submitting;

  return (
    <>
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="font-semibold">{service}</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {live ? (
              <>
                Tulis atau tempel catatan khotbah Anda di bawah. Kirim <strong>setelah khotbah selesai</strong> —
                mengirim catatan sekaligus menandakan khotbah sudah berakhir dan menghentikan transkripsi otomatis.
              </>
            ) : (
              <>
                Ibadah ini sudah selesai direkam. Tulis atau tempel catatan khotbah Anda di bawah,
                lalu kirim — catatan akan langsung digabung dengan transkrip dan diterbitkan.
              </>
            )}
          </p>
        </div>

        {draftRestored && (
          <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Draf sebelumnya dipulihkan dari perangkat ini.
          </p>
        )}

        <Textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'Nama pembicara — Ps. / Pdt. / Pdp. ...\nTema khotbah\n\n1. Poin pertama\n   - detail\n   - Yohanes 15:5\n\n2. Poin kedua\n   - detail'}
          className="min-h-[320px] font-mono text-sm leading-relaxed"
          maxLength={MAX_LENGTH}
          disabled={submitting}
        />

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Sertakan nama pembicara, tema, dan setiap referensi ayat yang disebut.</span>
          <span className={charCount > MAX_LENGTH * 0.95 ? 'text-amber-600 font-medium' : undefined}>
            {charCount.toLocaleString('id-ID')} / {MAX_LENGTH.toLocaleString('id-ID')}
          </span>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={() => setConfirmOpen(true)} disabled={!canSubmit}>
            <Send className="w-4 h-4 mr-1.5" />
            Kirim Catatan
          </Button>
        </div>
      </section>

      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open && !submitting) setConfirmOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kirim catatan sekarang?</DialogTitle>
            <DialogDescription>
              {live ? (
                <>
                  Hanya kirim kalau khotbah <strong>sudah selesai</strong>. Mengirim sekarang akan:
                  <br /><br />
                  • menghentikan transkripsi otomatis ibadah ini — bagian khotbah yang belum terekam tidak bisa dipulihkan
                  <br />
                  • mengunci catatan ibadah ini, sehingga tidak bisa dikirim ulang
                </>
              ) : (
                <>
                  Transkripsi ibadah ini sudah selesai, jadi tidak ada yang terhenti.
                  Catatan Anda akan langsung digabung dan diterbitkan.
                  <br /><br />
                  Setelah dikirim, catatan ibadah ini <strong>tidak bisa dikirim ulang</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogBody />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Belum, kembali
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Ya, khotbah sudah selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
