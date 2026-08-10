/**
 * Sermon note combining — manual notetaker notes + AI transcript summary → one
 * polished catatan khotbah in BEC house style.
 *
 * Extracted from the /api/sermon-captures/[id]/combine-summary route so that the
 * automated publish chain (/api/sermon-captures/[id]/publish-chain) runs the
 * IDENTICAL merge. Two copies of this prompt would drift; there is only one.
 *
 * Source of truth for SUMMARY_SYSTEM is gbi-bec-youtube-live-sync/src/live-summary.ts.
 */

// Same BEC house-style prompt as the engine + regenerate-summary route.
export const SUMMARY_SYSTEM = `Kamu adalah pencatat khotbah untuk GBI Baranangsiang Evening Church (BEC). Diberikan transkrip live ibadah, hasilkan catatan khotbah dalam GAYA jemaat BEC yang persis seperti contoh-contoh yang sudah dipublish di https://gbibec.id/kabar.

OUTPUT: 100% Bahasa Indonesia, gaya catatan (BUKAN esai prosa). Kalimat singkat, langsung ke poin.

STRUKTUR WAJIB:
[Baris 1] Nama pembicara — format: "Ps. <Nama>" atau "Pdt. <Nama>" atau "Pdp. <Nama>".
[Baris 2] Tema/judul khotbah dalam sentence case. Boleh SATU kata kunci di-KAPITAL.
[Body] Headers numerik untuk poin besar khotbah. Bullet dan sub-bullet utk elaborasi.

REFERENSI ALKITAB (PRIORITAS UTAMA):
- WAJIB sertakan SETIAP referensi ayat Alkitab yang disebut di salah satu sumber.
- Format standar: "Pengkhotbah 1:2", "Yohanes 15:1-5".
- Gunakan nama buku LENGKAP.
- KALAU pembicara membaca ayat lengkap, KUTIP LENGKAP setelah referensinya dalam tanda kutip.

PENEKANAN (CAPS): Gunakan KAPITAL HEMAT untuk 3-7 kata kunci sepanjang catatan.
BAHASA: 100% Bahasa Indonesia.
ATURAN: JANGAN menambahkan info yang tidak ada di sumber. Tutup dengan "Tuhan Yesus memberkati."`;

// Combine uses the strongest Gemini reasoning model available (best at faithful,
// grounded instruction-following). Falls back down the chain if the key lacks
// access to a newer preview model, so the combine never hard-fails on model choice.
export const GEMINI_MODELS = ['gemini-3.1-pro-preview', 'gemini-3-pro-preview', 'gemini-2.5-pro'];

export type CombineResult =
  | { ok: true; summary: string; model: string }
  | { ok: false; error: string };

export interface CombineInput {
  manualNotes: string;
  aiSummary: string;
  videoTitle?: string | null;
  apiKey: string;
}

/**
 * Build the user-turn prompt. Exported for testability — the wording carries the
 * whole "manual = skeleton, AI = enrichment" contract.
 */
export function buildCombinePrompt(manualNotes: string, aiSummary: string, videoTitle?: string | null): string {
  const videoTitleLine = videoTitle
    ? `METADATA — Judul video YouTube: "${videoTitle}"\n(Sumber fallback untuk nama pembicara saja, kalau salah satu sumber catatan punya nama yang lebih lengkap — termasuk gelar akademik seperti S.E., M.Th, S.S., M.A., D.Min — PAKAI yang lebih lengkap itu, bukan ini.)\n\n`
    : '';

  return `${videoTitleLine}Kamu diberikan DUA sumber catatan untuk SATU khotbah yang sama. Tugasmu: PAKAI CATATAN MANUAL sebagai kerangka, lalu PERKAYA setiap poinnya dengan penjelasan dari RINGKASAN AI, sehingga jadi SATU catatan final yang utuh, kaya, dan mengalir mulus (polished).

PRINSIP UTAMA — manual = kerangka, AI = pengayaan:
• CATATAN MANUAL = KERANGKA DASAR. Ikuti struktur, urutan poin, alur, framing, penekanan, dan kalimat kunci pembicara dari catatan manual. Inilah tulang punggung — JANGAN diubah jadi kerangka tematik milik AI.
• RINGKASAN AI = SUMBER PENGAYAAN. Isinya bagus & lengkap — pakai untuk MENJELASKAN dan MENGELABORASI setiap poin di catatan manual: isi penjelasan yang kurang/hilang di manual, dan KUTIP TEKS AYAT LENGKAP untuk referensi yang manual sebut.
• TUGAS INTI: ambil tiap poin/bullet di catatan manual, lalu "daging-i" dengan penjelasan yang relevan dari ringkasan AI. Tidak boleh ada poin manual yang dibiarkan telanjang tanpa penjelasan kalau AI punya penjelasannya.

═══════════════════════════════════════════════════════
SUMBER 1 — RINGKASAN AI (otomatis dari transkrip Gemini Live) — SUMBER PENGAYAAN
═══════════════════════════════════════════════════════
Penjelasan & teks ayat di sini umumnya BAGUS — tambang materi ini untuk mengelaborasi poin-poin manual. (Kelemahan: kadang salah dengar referensi ayat, dan urutannya bukan alur asli pembicara — jadi JANGAN ikuti strukturnya, ikuti manual.)

${aiSummary}

═══════════════════════════════════════════════════════
SUMBER 2 — CATATAN MANUAL (notetaker manusia yang hadir langsung) — KERANGKA DASAR
═══════════════════════════════════════════════════════
Ini kerangka yang WAJIB diikuti: struktur, urutan poin, framing, penekanan, kalimat kunci pembicara, dan referensi Alkitab yang akurat.

${manualNotes}

═══════════════════════════════════════════════════════

ATURAN PENGGABUNGAN:
1. **Nama pembicara (Baris 1):** PILIH versi paling lengkap dari ketiga sumber (manual, AI, metadata). Pertahankan SEMUA gelar (S.E., M.Th, S.S., M.A., D.Min, B.A., dll) persis seperti ditulis notetaker — termasuk format koma/spasi-nya.
2. **Tema (Baris 2):** PAKAI tema/judul yang dipakai PEMBICARA seperti di catatan manual (mis. "Masa Depan Penuh Harapan"), bukan tema bikinan AI.
3. **Kerangka = manual:** ikuti urutan poin, penanda/judul section, dan alur dari catatan manual. Pertahankan kalimat kunci pembicara (mis. pertanyaan pembuka, "Tuhan simpan misi di hati kita", penomoran 1/2 milik pembicara). JANGAN menyusun ulang ke kerangka tematik AI.
4. **Pengayaan = AI:** untuk SETIAP poin/bullet manual yang terlalu singkat atau tanpa penjelasan, AMBIL penjelasan/elaborasi yang sesuai dari ringkasan AI dan kembangkan poin itu jadi utuh dan jelas.
5. **Bible refs & teks ayat:** referensi & keakuratannya ikut manual; KUTIP teks ayat LENGKAP dari ringkasan AI untuk setiap ayat yang manual sebut.
6. **Penekanan/KAPITAL:** ikuti pola notetaker.
7. **Batas:** elaborasi dari AI boleh dipakai sebebasnya untuk MEMPERKAYA poin manual, TAPI JANGAN menambah POIN BESAR / section baru yang tidak ada di manual, dan jangan mengarang di luar kedua sumber.
8. **POLISH (penting):** hasil harus mengalir sebagai SATU catatan utuh — transisi halus, format konsisten (header untuk poin besar, bullet untuk elaborasi), tanpa pengulangan/nesting yang janggal, tanpa kalimat yang terasa ditempel. Gaya catatan jemaat BEC.
9. **JANGAN mengutip "AI berkata..." atau "Notetaker berkata..."** — output adalah catatan yang menyatu. Output HANYA catatan akhir, tanpa pengantar/komentar. Tutup dengan "Tuhan Yesus memberkati."`;
}

/**
 * Run the merge. Never throws — returns a discriminated result so both the
 * interactive route and the unattended publish chain can handle failure without
 * try/catch noise. Tries each model in order; first usable text wins.
 */
export async function combineSermonNotes({
  manualNotes,
  aiSummary,
  videoTitle,
  apiKey,
}: CombineInput): Promise<CombineResult> {
  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SUMMARY_SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: buildCombinePrompt(manualNotes, aiSummary, videoTitle) }] }],
    // Low temperature → deterministic, faithful merge (less creative drift).
    generationConfig: { temperature: 0.2, maxOutputTokens: 16384 },
  });

  const modelErrors: string[] = [];
  for (const model of GEMINI_MODELS) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestBody },
      );
      if (!resp.ok) {
        modelErrors.push(`${model} → ${resp.status}: ${(await resp.text()).slice(0, 150)}`);
        continue;
      }
      const json = (await resp.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = (json.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();
      if (!text) {
        modelErrors.push(`${model}: empty output`);
        continue;
      }
      return { ok: true, summary: text, model };
    } catch (e) {
      modelErrors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.error('All Gemini models failed for combine:', modelErrors);
  return { ok: false, error: `Gemini combine failed: ${modelErrors.join(' | ').slice(0, 300)}` };
}
