'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronRight, Clipboard, Loader2, MessageCircle, Plus, Save, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toastApiError } from '@/lib/api-toast';
import { SITE_URL } from '@/lib/seo';

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
  // Meta allow-list status keyed by the raw phone string as entered.
  const [allowList, setAllowList] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
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

  /**
   * Functional variant, required for every list edit.
   *
   * Deriving a new array from the render-time `settings` snapshot loses edits: two
   * updates that land in the same React pass (add-a-row then immediately type, or
   * fast keystrokes across the name and phone fields) both start from the same
   * stale array, so the second silently overwrites the first. Reading from `prev`
   * makes each edit build on the previous one.
   */
  function patchWith(produce: (prev: Settings) => Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...produce(prev) }));
    setDirty(true);
  }

  function updateList(key: 'recipients' | 'adminRecipients', index: number, field: keyof Recipient, value: string) {
    patchWith((prev) => ({
      [key]: prev[key].map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }) as Partial<Settings>);
  }

  function addTo(key: 'recipients' | 'adminRecipients') {
    patchWith((prev) => ({ [key]: [...prev[key], { name: '', phone: '' }] }) as Partial<Settings>);
  }

  function removeFrom(key: 'recipients' | 'adminRecipients', index: number) {
    patchWith((prev) => ({ [key]: prev[key].filter((_, i) => i !== index) }) as Partial<Settings>);
  }

  /**
   * Read Meta's 5-slot allow-list status for every registered number.
   * Sends nothing — see checkRecipientAllowed() in lib/whatsapp.
   */
  const checkAllowList = useCallback(async () => {
    if (!user) return;
    setChecking(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/notetaker-settings/check-recipients', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.configured) return;
      const next: Record<string, string> = {};
      for (const r of data.results ?? []) next[r.phone] = r.status;
      setAllowList(next);
    } catch {
      /* non-critical — the badges simply stay unknown */
    } finally {
      setChecking(false);
    }
  }, [user]);

  // Probe once the card is opened and settings are loaded. Safe to run on open
  // because the probe delivers no messages.
  useEffect(() => {
    if (open && loaded && settings.whatsappConfigured) checkAllowList();
  }, [open, loaded, settings.whatsappConfigured, checkAllowList]);

  /**
   * Prove the WhatsApp config from here rather than discovering it on a Sunday.
   * Sends Meta's hello_world, which exercises token + phone number ID + the test
   * number's recipient allow-list in one call.
   */
  async function handleTestSend(phone: string, name = '', slug = '') {
    if (!user || !phone) return;
    setTestingPhone(phone);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/notetaker-settings/test-send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, slug }),
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
      toast.success(
        slug
          ? `Link permanen terkirim ke ${name || phone} via WhatsApp.`
          : `Pesan tes terkirim ke ${phone}. Cek WhatsApp nomor itu.`,
      );
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
            <div className="space-y-3">
              {/* One control strip: the toggle, TTL and re-check all on a single line.
                  Previously three separate blocks with prose, ~140px of height. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border px-3 py-2">
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked: boolean) => patch({ enabled: checked })}
                  />
                  <span className="font-medium">Kirim link via WhatsApp</span>
                </label>

                <span className="h-4 w-px bg-border" aria-hidden />

                <label className="flex items-center gap-1.5 text-xs" htmlFor="ttl">
                  <span className="text-muted-foreground">Link sekali-pakai berlaku</span>
                  <Input
                    id="ttl"
                    type="number"
                    min={1}
                    max={72}
                    value={settings.linkTtlHours}
                    onChange={(e) => patch({ linkTtlHours: Number(e.target.value) })}
                    className="h-7 w-14 px-2 text-xs"
                  />
                  <span className="text-muted-foreground">jam</span>
                </label>

                {settings.whatsappConfigured && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkAllowList}
                    disabled={checking}
                    className="ml-auto h-7 px-2 text-xs"
                    title="Cek ulang status Terdaftar di Meta. Tidak mengirim pesan apa pun."
                  >
                    {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    {checking ? 'Memeriksa…' : 'Cek status Meta'}
                  </Button>
                )}
              </div>

              {/* Warnings only when they apply — no permanent prose blocks. */}
              {settings.whatsappConfigured === false && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    WhatsApp nonaktif — bagikan link permanen di bawah, alur tetap jalan.
                  </span>
                </p>
              )}
              {phoneCount > TEST_NUMBER_RECIPIENT_CAP && (
                <p className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    {phoneCount} nomor terdaftar, tapi test number Meta hanya bisa mengirim ke{' '}
                    {TEST_NUMBER_RECIPIENT_CAP}. Sisanya gagal (131030); link permanen tetap jalan.
                  </span>
                </p>
              )}

              <RecipientList
                label="Notulen"
                hint="Nama wajib · nomor HP opsional"
                items={settings.recipients}
                showLinks
                canTest={settings.whatsappConfigured === true}
                testingPhone={testingPhone}
                onTest={handleTestSend}
                allowList={allowList}
                onChange={(i, f, v) => updateList('recipients', i, f, v)}
                onAdd={() => addTo('recipients')}
                onRemove={(i) => removeFrom('recipients', i)}
              />

              <RecipientList
                label="Notifikasi admin"
                hint="Kabar saat catatan terbit / perlu ditinjau · butuh nomor HP"
                items={settings.adminRecipients}
                canTest={settings.whatsappConfigured === true}
                testingPhone={testingPhone}
                onTest={handleTestSend}
                allowList={allowList}
                onChange={(i, f, v) => updateList('adminRecipients', i, f, v)}
                onAdd={() => addTo('adminRecipients')}
                onRemove={(i) => removeFrom('adminRecipients', i)}
              />

              <div className="flex items-center justify-end gap-2 border-t pt-2.5">
                <Button variant="ghost" size="sm" onClick={fetchSettings} disabled={saving || loading} className="h-7 px-2 text-xs">
                  Batalkan
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!dirty || saving} className="h-7 px-3 text-xs">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
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

/**
 * One dense row per person: status · name · phone · actions.
 *
 * Replaces a 3-stack bordered card per recipient (~96px each) with a single
 * ~36px row, following the FieldGrid pattern — tabular data in one line — and
 * Material's density guidance on tightening inter-action spacing.
 *
 * Actions stay VISIBLE rather than hover-revealed: hover-only affordances are
 * invisible to keyboard and touch users, which trades accessibility for pixels.
 * Each icon carries a title + aria-label instead.
 */
function RecipientList({
  label,
  hint,
  items,
  showLinks = false,
  canTest = false,
  testingPhone = null,
  onTest,
  allowList = {},
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  hint: string;
  items: Recipient[];
  showLinks?: boolean;
  canTest?: boolean;
  testingPhone?: string | null;
  onTest?: (phone: string, name?: string, slug?: string) => void;
  allowList?: Record<string, string>;
  onChange: (index: number, field: keyof Recipient, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <Label className="text-xs font-semibold">{label}</Label>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
        <Button variant="ghost" size="sm" onClick={onAdd} className="ml-auto h-6 px-1.5 text-[11px]">
          <Plus className="w-3 h-3 mr-1" /> Tambah
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed px-2.5 py-1.5 text-[11px] text-muted-foreground italic">
          belum ada
        </p>
      ) : (
        <div className="rounded-md border divide-y">
          {items.map((r, i) => {
            const phone = (r.phone ?? '').trim();
            return (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1.5">
                <StatusDot status={phone ? allowList[phone] : undefined} hasPhone={!!phone} />
                <Input
                  value={r.name}
                  onChange={(e) => onChange(i, 'name', e.target.value)}
                  placeholder="Nama"
                  aria-label="Nama notulen"
                  className="h-7 flex-1 min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:bg-muted/50"
                />
                <Input
                  value={r.phone ?? ''}
                  onChange={(e) => onChange(i, 'phone', e.target.value)}
                  placeholder="08xx (opsional)"
                  inputMode="tel"
                  aria-label="Nomor HP"
                  className="h-7 w-32 shrink-0 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:bg-muted/50"
                />
                {showLinks && <LinkActions slug={r.slug} name={r.name} phone={phone} />}
                {canTest && onTest && phone && (
                  <IconBtn
                    label={`Kirim link ke ${r.name || phone} via WhatsApp API`}
                    onClick={() => onTest(phone, r.name, r.slug)}
                    disabled={testingPhone !== null}
                  >
                    {testingPhone === phone
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                  </IconBtn>
                )}
                <IconBtn label={`Hapus ${r.name || 'baris ini'}`} onClick={() => onRemove(i)} danger>
                  <Trash2 className="w-3.5 h-3.5" />
                </IconBtn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Icon-only button, always visible, always labelled. */
function IconBtn({
  label, onClick, children, disabled = false, danger = false,
}: {
  label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`shrink-0 rounded p-1 text-muted-foreground disabled:opacity-40 ${
        danger ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Meta allow-list state as a dot rather than a sentence — the explanation moves
 * into the tooltip, which is where it belongs for a status that is usually fine.
 */
function StatusDot({ status, hasPhone }: { status?: string; hasPhone: boolean }) {
  const spec = !hasPhone
    ? { c: 'bg-muted-foreground/30', t: 'Tanpa nomor HP — hanya pakai link permanen, tidak dikirimi WhatsApp' }
    : status === 'registered'
      ? { c: 'bg-emerald-500', t: 'Terdaftar di daftar penerima Meta — WhatsApp bisa terkirim' }
      : status === 'not-registered'
        ? { c: 'bg-amber-500', t: 'BELUM terdaftar di Meta — WhatsApp tidak akan terkirim (131030). Tambahkan di developers.facebook.com → WhatsApp → API Setup → Manage phone number list. Link permanen tetap jalan.' }
        : { c: 'bg-muted-foreground/30', t: 'Status Meta belum dicek' };
  return (
    <span
      className={`shrink-0 h-2 w-2 rounded-full ${spec.c}`}
      title={spec.t}
      aria-label={spec.t}
      role="img"
    />
  );
}

/**
 * Copy + wa.me for the notulen's permanent bookmark.
 *
 * The slug itself is no longer printed — reading it has no value, only sending it
 * does, so it lives in the tooltips and keeps the row to one line.
 */
function LinkActions({ slug, name, phone }: { slug?: string; name: string; phone: string }) {
  const [copied, setCopied] = useState(false);
  if (!slug) {
    return <span className="shrink-0 text-[11px] text-muted-foreground italic px-1">simpan dulu</span>;
  }

  const url = `${SITE_URL}/notulen/${slug}`;
  const digits = phone.replace(/[\s\-+()]/g, '');
  const waNumber = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  const waText =
    `Shalom ${name || 'Notulen'}! \u{1F64F}\n\n` +
    `Ini link tetap untuk mengirim catatan khotbah. Simpan / bookmark link ini — ` +
    `dipakai setiap ibadah, tidak berganti:\n${url}\n\n` +
    `Cara pakai: buka link ini SETELAH khotbah selesai, tulis atau tempel catatan Anda, lalu kirim. ` +
    `Catatan akan otomatis digabung dan diterbitkan di halaman Kabar.\n\nTuhan Yesus memberkati. \u{1F54A}️`;

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
    <>
      <IconBtn label={`Salin link permanen ${name || ''} (${url})`} onClick={copy}>
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
      </IconBtn>
      {waNumber.length >= 10 && (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Buka WhatsApp Anda dengan pesan siap-kirim untuk ${name || 'notulen'}`}
          aria-label={`Kirim link ke ${name || 'notulen'} lewat WhatsApp Anda`}
          className="shrink-0 rounded p-1 text-emerald-700 hover:bg-emerald-50"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}
    </>
  );
}
