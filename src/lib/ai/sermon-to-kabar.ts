import { callChatAI, parseJSONResponse } from './chat-handler';
import { formatDateLong } from '../format-date';
import { stripHtml } from '../slug';

/**
 * Turns raw "catatan khotbah" (sermon notes) into a polished Kabar draft.
 *
 * Uses ASI1 in two focused calls for reliability:
 *   1. Content  -> clean semantic HTML (raw, no JSON wrapping)
 *   2. Metadata -> tiny JSON { theme, speaker, date }
 * Title, excerpt, category, color and serviceType are assembled deterministically
 * so they never depend on the model getting long structured JSON right.
 */

const KHOTBAH_COLOR = 'oklch(0.35 0.04 175)'; // hijau — matches every existing catatan khotbah cover
const DEFAULT_SERVICE = 'Ibadah Raya';

export interface SermonKabarDraft {
  title: string;
  excerpt: string;
  content: string;
  category: 'Ibadah';
  color: string;
  date: string; // YYYY-MM-DD
  // poster fields
  speaker: string;
  theme: string;
  serviceType: string;
}

const ID_MONTHS: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

/** Best-effort parse of an Indonesian date ("7 Juni 2026") from free text -> YYYY-MM-DD. */
function parseIndoDate(text: string): string | null {
  const m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const day = Number(m[1]);
    const month = ID_MONTHS[m[2].toLowerCase()];
    const year = Number(m[3]);
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  return iso ? iso[0] : null;
}

/** Pull "*Ps. Name*" style speaker and "*Theme*" from the first emphasized lines as a fallback. */
function heuristicMeta(notes: string): { speaker: string; theme: string } {
  const starred = [...notes.matchAll(/\*([^*\n]{2,80})\*/g)].map(m => m[1].trim());
  const speaker = starred.find(s => /^(ps|pdt|pdm|gembala|ev|pdp)\b\.?/i.test(s)) || '';
  const theme = starred.find(s => s !== speaker && !/^(ps|pdt|pdm|gembala|ev|pdp)\b\.?/i.test(s)) || '';
  return { speaker, theme };
}

function cleanHtml(raw: string): string {
  let html = raw.trim();
  // strip ```html ... ``` fences if the model added them
  const fence = html.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (fence) html = fence[1].trim();
  // keep only the markup region
  const first = html.indexOf('<');
  const last = html.lastIndexOf('>');
  if (first > 0 || last < html.length - 1) html = html.slice(first === -1 ? 0 : first, last === -1 ? undefined : last + 1);
  return html.trim();
}

function buildExcerpt(serviceType: string, speaker: string, theme: string): string {
  const full = `Catatan khotbah ${serviceType} oleh ${speaker} — ${theme}.`;
  if (stripHtml(`<p>${full}</p>`).length <= 150 && speaker) {
    return `<p>Catatan khotbah ${serviceType} oleh ${speaker} — <strong>${theme}</strong>.</p>`;
  }
  // shorter form without speaker
  const short = `Catatan khotbah ${serviceType} — ${theme}.`;
  if (stripHtml(`<p>${short}</p>`).length <= 150) {
    return `<p>Catatan khotbah ${serviceType} — <strong>${theme}</strong>.</p>`;
  }
  // last resort: theme only, truncated
  const t = theme.slice(0, 130);
  return `<p>Catatan khotbah — <strong>${t}</strong>.</p>`;
}

const CONTENT_SYSTEM = `Kamu adalah editor konten untuk GBI Baranangsiang Evening Church (BEC) Sukawarna, Bandung.
Tugasmu: merapikan CATATAN KHOTBAH mentah menjadi HTML yang bersih dan terstruktur untuk halaman artikel gereja.

ATURAN:
- Pertahankan SEMUA poin, ayat Alkitab, dan urutannya. Jangan meringkas, menghapus, atau menambah ajaran baru.
- Perbaiki ejaan dan bentangkan singkatan menjadi kata penuh: bgm→bagaimana, utk→untuk, dg/dgn→dengan, krn→karena, mjd→menjadi, jgn→jangan, yg→yang, sdh→sudah, org→orang, tdk→tidak, dll→dan lain-lain, klo→kalau.
- Gunakan HANYA tag ini: <p>, <strong>, <em>, <ul>, <ol>, <li>. Setiap <li> berisi <p>.
- Baris pembuka (pengkhotbah & tema) ditulis: <p><strong><em>Nama Pengkhotbah</em></strong></p> lalu <p><strong><em>Tema</em></strong></p>.
- Judul bagian / sub-topik ditebalkan dengan <strong>.
- Referensi ayat Alkitab dimiringkan dengan <em> (mis. <em>Yohanes 4:21</em>).
- Daftar bernomor (1,2,3...) gunakan <ol>; daftar butir gunakan <ul>. Sub-poin boleh <ul> bersarang di dalam <li>.
- Tutup dengan <p><strong>Tuhan Yesus memberkati.</strong></p>
- KELUARKAN HANYA HTML. Tanpa penjelasan, tanpa code fence, tanpa teks lain.`;

const META_SYSTEM = `Ekstrak metadata dari catatan khotbah gereja. Kembalikan HANYA JSON valid, tanpa teks lain:
{"theme":"tema/judul khotbah singkat","speaker":"nama pengkhotbah lengkap dengan gelar (mis. Ps. Franky Kuncoro)","date":"YYYY-MM-DD tanggal ibadah"}
Jika suatu field tidak ada, isi dengan string kosong.`;

export async function processSermonNotes(notes: string, fallbackDate: string): Promise<SermonKabarDraft> {
  const [contentRes, metaRes] = await Promise.all([
    callChatAI({
      messages: [
        { role: 'system', content: CONTENT_SYSTEM },
        { role: 'user', content: `Catatan khotbah:\n\n${notes}` },
      ],
      temperature: 0.15,
      maxTokens: 3000,
    }),
    callChatAI({
      messages: [
        { role: 'system', content: META_SYSTEM },
        { role: 'user', content: notes },
      ],
      temperature: 0,
      maxTokens: 200,
    }),
  ]);

  // --- metadata (AI + heuristic fallback) ---
  const heur = heuristicMeta(notes);
  const parsed = metaRes.success && metaRes.content
    ? parseJSONResponse<{ theme?: string; speaker?: string; date?: string }>(metaRes.content)
    : null;

  const speaker = (parsed?.speaker || heur.speaker || '').trim();
  const theme = (parsed?.theme || heur.theme || 'Catatan Khotbah').trim();
  const date =
    (parsed?.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null) ||
    parseIndoDate(notes) ||
    fallbackDate;
  const serviceType = DEFAULT_SERVICE;

  // --- content (AI + raw fallback) ---
  let content: string;
  if (contentRes.success && contentRes.content && contentRes.content.includes('<')) {
    content = cleanHtml(contentRes.content);
  } else {
    // graceful fallback: wrap the raw notes
    const body = notes
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `<p>${l.replace(/^\*+|\*+$/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
      .join('\n');
    content = `${body}\n<p><strong>Tuhan Yesus memberkati.</strong></p>`;
  }

  const title = `${theme} — Catatan Khotbah ${serviceType} ${formatDateLong(date)}`;
  const excerpt = buildExcerpt(serviceType, speaker, theme);

  return {
    title,
    excerpt,
    content,
    category: 'Ibadah',
    color: KHOTBAH_COLOR,
    date,
    speaker,
    theme,
    serviceType,
  };
}
