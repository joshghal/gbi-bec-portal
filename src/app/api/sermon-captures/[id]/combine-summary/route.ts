import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// Same BEC house-style prompt as the engine + regenerate-summary route.
// Source of truth lives in gbi-bec-youtube-live-sync/src/live-summary.ts SUMMARY_SYSTEM.
const SUMMARY_SYSTEM = `Kamu adalah pencatat khotbah untuk GBI Baranangsiang Evening Church (BEC). Diberikan transkrip live ibadah, hasilkan catatan khotbah dalam GAYA jemaat BEC yang persis seperti contoh-contoh yang sudah dipublish di https://gbibec.id/kabar.

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

const GEMINI_MODEL = 'gemini-2.5-pro';

// POST /api/sermon-captures/[id]/combine-summary
// Merges manualNotes (from notetaker) + AI summary (finalSummary || latestSummary)
// into ONE polished catatan using Gemini 2.5 Pro. The combine prompt explicitly
// instructs the model to prefer Bible refs from the manual source (notetakers
// catch them more accurately than ASR) and structure from whichever source is
// more complete.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY env var is not configured on the portal. Set it on Vercel.' },
      { status: 500 },
    );
  }

  const { id } = await params;
  try {
    const db = getAdminFirestore();
    const ref = db.collection('sermon_captures').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cap = snap.data()!;

    const manualNotes: string = (cap.manualNotes ?? '').trim();
    const aiSummary: string = (cap.finalSummary ?? cap.latestSummary ?? '').trim();

    if (!manualNotes) {
      return NextResponse.json(
        { error: 'Belum ada catatan manual. Tambahkan dulu lewat tombol Edit di section Catatan Manual.' },
        { status: 400 },
      );
    }
    if (!aiSummary) {
      return NextResponse.json(
        { error: 'Belum ada ringkasan AI. Klik "Generate Summary" dulu untuk membuat ringkasan dari transkrip.' },
        { status: 400 },
      );
    }

    const videoTitle: string = cap.title ?? '';
    const videoTitleLine = videoTitle
      ? `METADATA — Judul video YouTube: "${videoTitle}"\n(Gunakan untuk mengisi baris pertama nama pembicara — JANGAN tebak dari sumber lain.)\n\n`
      : '';

    const userMsg = `${videoTitleLine}Kamu diberikan DUA sumber catatan untuk SATU khotbah yang sama. Tugasmu adalah menggabungkan keduanya menjadi SATU catatan final.

═══════════════════════════════════════════════════════
SUMBER 1 — RINGKASAN AI (dihasilkan otomatis dari transkrip Gemini Live)
═══════════════════════════════════════════════════════
Karakteristik: cakupan lengkap (mencatat semua yang diucapkan), tapi mungkin kurang nuance, salah dengar referensi ayat, atau missing insight.

${aiSummary}

═══════════════════════════════════════════════════════
SUMBER 2 — CATATAN MANUAL (dari notetaker manusia yang hadir langsung)
═══════════════════════════════════════════════════════
Karakteristik: tidak selengkap AI dari sisi cakupan kata-kata, tapi PUNYA insight yang lebih dalam, penekanan/aplikasi yang lebih akurat, dan referensi Alkitab yang lebih reliable.

${manualNotes}

═══════════════════════════════════════════════════════

ATURAN PENGGABUNGAN:
1. **Bible refs:** prioritaskan dari catatan manual (notetaker catat lebih akurat). Kalau ada di salah satu sumber saja, tetap sertakan. Kutip ayat lengkap jika tersedia di salah satu sumber.
2. **Struktur (urutan poin, judul section):** ikuti yang paling jelas dari kedua sumber. Boleh hybrid.
3. **Penekanan/KAPITAL:** ikuti pola dari notetaker (mereka tahu mana yang ditekankan pembicara).
4. **Konten penjelasan:** gunakan dari kedua sumber. Hindari duplikasi dan kontradiksi.
5. **Tema khotbah (baris kedua):** ambil yang lebih tajam dan singkat.
6. **JANGAN menambahkan informasi yang tidak ada di SALAH SATU dari dua sumber.** Tidak ada konten hasil tebakan.
7. **JANGAN mengutip "AI berkata..." atau "Notetaker berkata..."** — output adalah catatan yang menyatu, bukan komparasi.
8. Output HANYA catatan akhir, tanpa pengantar/penutup AI/komentar. Tutup dengan "Tuhan Yesus memberkati."`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SUMMARY_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: userMsg }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 8192 },
        }),
      },
    );
    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: `Gemini API ${geminiResp.status}: ${errText.slice(0, 200)}` }, { status: 502 });
    }
    const geminiJson = await geminiResp.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const combined = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!combined) {
      return NextResponse.json({ error: 'Empty output from Gemini' }, { status: 502 });
    }

    // Persist to Firestore
    const now = new Date().toISOString();
    await ref.update({
      combinedSummary: combined,
      combinedSummaryModel: GEMINI_MODEL,
      combinedAt: now,
      combinedStale: false,
    });

    // Best-effort: also write combined_summary.md alongside transcript in GCS
    try {
      const transcriptUri: string | undefined = cap.gcsPaths?.transcript;
      if (transcriptUri) {
        const match = transcriptUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
        if (match) {
          const [, bucket, path] = match;
          const combinedPath = path.replace(/transcript\.txt$/, 'combined_summary.md');
          await new Storage().bucket(bucket).file(combinedPath).save(combined, {
            contentType: 'text/markdown; charset=utf-8',
          });
        }
      }
    } catch (e) {
      console.warn('GCS combined_summary.md write failed:', e);
    }

    logAdminAction(request, 'update', 'sermon-capture', { resourceId: id, resourceTitle: `combine-summary: ${videoTitle}` });
    return NextResponse.json({
      summary: combined,
      model: GEMINI_MODEL,
      manualNotesLength: manualNotes.length,
      aiSummaryLength: aiSummary.length,
      combinedLength: combined.length,
    });
  } catch (err) {
    console.error('Combine summary error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
