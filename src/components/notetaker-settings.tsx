'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronRight, Clipboard, Link as LinkIcon, Loader2, Plus, Save, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toastApiError } from '@/lib/api-toast';

/**
 * Notulen configuration for the Sunday automation.
 *
 * Lives on the khotbah page rather than /admin/pengaturan because it is only
 * meaningful alongside the captures it drives — and it inherits `page:khotbah`,
 * which the content_editor role already holds.
 */

interface Recipient {
  name: string;
  phone?: string;
  /** Permanent private path, minted server-side on save. */
  slug?: string;
}

interface Settings {
  enabled: boolean;
  recipients: Recipient[];
  adminRecipients: Recipient[];
  linkTtlHours: number;
  whatsappConfigured?: boolean;
}

const EMPTY: Settings = { enabled: false, recipients: [], adminRecipients: [], linkTtlHours: 12 };

/**
 * Meta's free test number can only ever message 5 numbers, and a number added to
 * that list can never be removed. Permanent links have no such limit, so this cap
 * applies ONLY to people who need the WhatsApp push.
 */
const TEST_NUMBER_RECIPIENT_CAP = 5;

export function NotetakerSettings() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingPhone, setTestingPhone] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/notetaker-settings', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings({ ...EMPTY, ...data });
      setLoaded(true);
      setDirty(false);
    } catch (err) {
      toastApiError(err, 'Gagal memuat pengaturan notulen.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Lazy — only load once the card is actually opened.
  useEffect(() => {
    if (open && !loaded) fetchSettings();
  }, [open, loaded, fetchSettings]);

  // Only numbers consume a test-number slot; name-only notulen use links alone.
  const phoneCount = [...settings.recipients, ...settings.adminRecipients].filter(
    (r) => (r.phone ?? '').trim().length > 0,
  ).length;

  function patch(next: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...next }));
    setDirty(true);
  }

  function updateList(key: 'recipients' | 'adminRecipients', index: number, field: keyof Recipient, value: string) {
    patch({
      [key]: settings[key].map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    } as Partial<Settings>);
  }

  function addTo(key: 'recipients' | 'adminRecipients') {
    patch({ [key]: [...settings[key], { name: '', phone: '' }] } as Partial<Settings>);
  }

  function removeFrom(key: 'recipients' | 'adminRecipients', index: number) {
    patch({ [key]: settings[key].filter((_, i) => i !== index) } as Partial<Settings>);
  }

  /**
   * Prove the WhatsApp config from here rather than discovering it on a Sunday.
   * Sends Meta's hello_world, which exercises token + phone number ID + the test
   * number's recipient allow-list in one call.
   */
  async function handleTestSend(phone: string) {
    if (!user || !phone) return;
    setTestingPhone(phone);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/notetaker-settings/test-send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Meta's own message names the fault precisely; the hint says what to do.
        toast.error(result?.error ?? `Gagal (HTTP ${res.status})`, {
          description: result?.hint,
          duration: 12000,
        });
        return;
      }
      toast.success(`Pesan tes terkirim ke ${phone}. Cek WhatsApp nomor itu.`);
    } catch (err) {
      toastApiError(err, 'Gagal mengirim pesan tes.');
    } finally {
      setTestingPhone(null);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/notetaker-settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? `HTTP ${res.status}`);
      setSettings((prev) => ({ ...prev, ...result }));
      setDirty(false);
      toast.success('Pengaturan notulen disimpan.');
    } catch (err) {
      toastApiError(err, 'Gagal menyimpan pengaturan notulen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30"
      >
        {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="font-medium text-sm">Pengaturan Notulen &amp; Otomasi</span>
        {loaded && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              settings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {settings.recipients.length} notulen{settings.enabled ? ' · WA aktif' : ''}
          </span>
        )}
      </button>

      {open && (
        <div className="border-t px-4 py-4">
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat…
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notulen membuka <strong>link permanen</strong> mereka, menulis catatan, lalu mengirim.
                Itu menghentikan transkripsi, menggabungkan catatan dengan ringkasan AI,
                dan menerbitkannya otomatis ke Kabar. Link permanen selalu aktif dan tidak butuh WhatsApp.
              </p>

              {settings.whatsappConfigured === false && (
                <div className="flex items-start gap-2 rounded-lg border p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Pengiriman WhatsApp tidak aktif (<code>WHATSAPP_TOKEN</code> /{' '}
                    <code>WHATSAPP_PHONE_NUMBER_ID</code> belum diisi). Ini <strong>tidak masalah</strong> —
                    bagikan link permanen di bawah ke notulen, semuanya tetap berjalan.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Kirim link otomatis via WhatsApp</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Opsional. Kalau aktif dan WhatsApp terkonfigurasi, notulen juga dikirimi link sekali-pakai
                    saat ibadah mulai. Link permanen tetap jalan meski ini nonaktif.
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked: boolean) => patch({ enabled: checked })}
                />
              </div>

              {phoneCount > TEST_NUMBER_RECIPIENT_CAP && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Ada <strong>{phoneCount} nomor</strong> terdaftar, tapi test number Meta hanya bisa
                    mengirim ke <strong>{TEST_NUMBER_RECIPIENT_CAP}</strong>. Nomor di luar daftar penerima
                    di Meta akan gagal terkirim (error 131030). Link permanen tetap jalan untuk semua orang —
                    batas ini hanya soal pengiriman WhatsApp.
                  </span>
                </div>
              )}

              <RecipientList
                label="Notulen"
                hint="Nama wajib. Nomor HP opsional — hanya dipakai kalau pengiriman WhatsApp aktif. Link permanen muncul setelah disimpan."
                items={settings.recipients}
                showLinks
                canTest={settings.whatsappConfigured === true}
                testingPhone={testingPhone}
                onTest={handleTestSend}
                onChange={(i, f, v) => updateList('recipients', i, f, v)}
                onAdd={() => addTo('recipients')}
                onRemove={(i) => removeFrom('recipients', i)}
              />

              <RecipientList
                label="Notifikasi admin"
                hint="Dapat kabar saat catatan sudah terbit, atau saat perlu ditinjau manual. Butuh nomor HP + WhatsApp aktif. Kosongkan untuk memakai daftar notulen."
                items={settings.adminRecipients}
                canTest={settings.whatsappConfigured === true}
                testingPhone={testingPhone}
                onTest={handleTestSend}
                onChange={(i, f, v) => updateList('adminRecipients', i, f, v)}
                onAdd={() => addTo('adminRecipients')}
                onRemove={(i) => removeFrom('adminRecipients', i)}
              />

              <div className="flex items-center gap-3">
                <Label htmlFor="ttl" className="text-sm shrink-0">Masa berlaku link</Label>
                <Input
                  id="ttl"
                  type="number"
                  min={1}
                  max={72}
                  value={settings.linkTtlHours}
                  onChange={(e) => patch({ linkTtlHours: Number(e.target.value) })}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">jam</span>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={fetchSettings} disabled={saving || loading}>
                  Batalkan perubahan
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecipientList({
  label,
  hint,
  items,
  showLinks = false,
  canTest = false,
  testingPhone = null,
  onTest,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  hint: string;
  items: Recipient[];
  /** Render each person's permanent bookmark link with a copy button. */
  showLinks?: boolean;
  /** WhatsApp is configured, so a test send is possible. */
  canTest?: boolean;
  testingPhone?: string | null;
  onTest?: (phone: string) => void;
  onChange: (index: number, field: keyof Recipient, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5">
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="space-y-2">
        {items.map((r, i) => (
          <div key={i} className="rounded-lg border p-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={r.name}
                onChange={(e) => onChange(i, 'name', e.target.value)}
                placeholder="Nama"
                className="flex-1"
              />
              <Input
                value={r.phone ?? ''}
                onChange={(e) => onChange(i, 'phone', e.target.value)}
                placeholder="08xxxxxxxxxx (opsional)"
                inputMode="tel"
                className="flex-1"
              />
              {canTest && onTest && (r.phone ?? '').trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTest((r.phone ?? '').trim())}
                  disabled={testingPhone !== null}
                  className="shrink-0 text-muted-foreground"
                  title="Kirim pesan tes (hello_world) ke nomor ini untuk memastikan konfigurasi WhatsApp benar"
                >
                  {testingPhone === (r.phone ?? '').trim() ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title={`Hapus ${r.name || 'baris ini'}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {showLinks && <PermanentLink slug={r.slug} name={r.name} />}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">— belum ada —</p>
        )}
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah
        </Button>
      </div>
    </div>
  );
}

/**
 * The notulen's permanent bookmark. This is the delivery path that needs no
 * WhatsApp — copy it once and send it to them however you like.
 */
function PermanentLink({ slug, name }: { slug?: string; name: string }) {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <p className="text-xs text-muted-foreground italic px-1">
        Link permanen dibuat setelah disimpan.
      </p>
    );
  }

  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/notulen/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(`Link ${name || 'notulen'} disalin.`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Gagal menyalin link.');
    }
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <LinkIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
      <code className="flex-1 min-w-0 truncate text-xs text-muted-foreground">/notulen/{slug}</code>
      <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs shrink-0">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
        <span className="ml-1.5">{copied ? 'Tersalin' : 'Salin link'}</span>
      </Button>
    </div>
  );
}
