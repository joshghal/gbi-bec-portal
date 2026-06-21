import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { getAdminFirestore, verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

// House-style prompt — kept in sync with gbi-bec-youtube-live-sync/src/live-summary.ts SUMMARY_SYSTEM.
// (When this drifts, the engine's prompt is the source of truth; copy verbatim.)
const SUMMARY_SYSTEM = `Kamu adalah pencatat khotbah untuk GBI Baranangsiang Evening Church (BEC). Diberikan transkrip live ibadah, hasilkan catatan khotbah dalam GAYA jemaat BEC yang persis seperti contoh-contoh yang sudah dipublish di https://gbibec.id/kabar.

OUTPUT: 100% Bahasa Indonesia, gaya catatan (BUKAN esai prosa). Kalimat singkat, langsung ke poin.

STRUKTUR WAJIB:

[Baris 1] Nama pembicara — format: "Ps. <Nama>" atau "Pdt. <Nama>" atau "Pdp. <Nama>". Kalau belum jelas, tulis "Pembicara: -".

[Baris 2] Tema/judul khotbah dalam sentence case (Huruf Awal Saja). Boleh ada SATU kata kunci di-KAPITAL kalau pembicara menekankannya berulang-ulang.

[Body] Poin-poin utama. Gunakan campuran:
- Headers numerik untuk poin besar khotbah: "1. Daud menangis", "2. Daud menolak pahit", dst.
- Bullet (-) dan sub-bullet untuk elaborasi di bawah header.
- Pernyataan thesis singkat 1 baris setelah header bila pembicara membuat klaim langsung.

REFERENSI ALKITAB (PRIORITAS UTAMA):
- WAJIB sertakan SETIAP referensi ayat Alkitab yang disebut pembicara di dalam catatan.
- Konversi referensi lisan ke format standar: "pasal pertama ayat kedua" dari Pengkhotbah → "Pengkhotbah 1:2".
- Gunakan nama buku LENGKAP (Yohanes, Mazmur, Pengkhotbah). Singkatan hanya kalau pembicara pakai.
- KALAU pembicara membaca ayat lengkap, KUTIP LENGKAP setelah referensinya dalam tanda kutip. Contoh:
    Yohanes 15:5 — "Akulah pokok anggur, kamulah ranting-rantingnya..."
    Matius 22:37 — "Kasihilah Tuhan, Allahmu, dengan segenap hatimu..."
- Kalau hanya disebut referensinya tanpa pembacaan, tetap tulis referensinya — cukup tanpa kutipan.
- Setiap poin/section yang membahas suatu pasal harus diawali atau diakhiri dengan referensi pasalnya.

PENEKANAN (CAPS): Gunakan KAPITAL secara HEMAT untuk 3-7 kata kunci sepanjang catatan.

BAHASA: 100% Bahasa Indonesia. Singkatan natural (dg, yg, Krn, utk) diperbolehkan.

ATURAN KETAT:
- JANGAN menambahkan informasi yang tidak ada di transkrip.
- JANGAN membuat sub-judul artifisial ("Pendahuluan", "Penutup").
- Tutup dengan "Tuhan Yesus memberkati." (untuk versi final/regenerasi yang sudah lengkap).`;

const GEMINI_MODEL = 'gemini-2.5-pro';

// POST /api/sermon-captures/[id]/regenerate-summary
// Reads the saved transcript from GCS, calls Gemini 2.5 Pro to produce a fresh
// BEC-style catatan khotbah, and writes it back to Firestore + GCS.
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
    const captureRef = db.collection('sermon_captures').doc(id);
    const snap = await captureRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cap = snap.data()!;

    // Read transcript from GCS
    const transcriptUri: string | undefined = cap.gcsPaths?.transcript;
    if (!transcriptUri) {
      return NextResponse.json({ error: 'No GCS transcript path on this capture' }, { status: 400 });
    }
    const match = transcriptUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!match) {
      return NextResponse.json({ error: `Bad GCS URI: ${transcriptUri}` }, { status: 400 });
    }
    const [, bucket, path] = match;
    const storage = new Storage();
    const [buf] = await storage.bucket(bucket).file(path).download();
    const transcript = buf.toString('utf-8');
    if (transcript.length < 100) {
      return NextResponse.json({ error: `Transcript too short (${transcript.length} chars)` }, { status: 400 });
    }

    // Call Gemini 2.5 Pro
    const videoTitle: string = cap.title ?? '';
    const videoTitleLine = videoTitle
      ? `METADATA — Judul video YouTube: "${videoTitle}"\n(Gunakan ini untuk mengisi baris pertama "Ps./Pdt. <Nama>" — JANGAN tebak nama atau gelar dari transkrip.)\n\n`
      : '';
    const userMsg = `${videoTitleLine}TRANSKRIP IBADAH (LENGKAP, sudah selesai):\n\n${transcript}\n\n---\nIni adalah versi FINAL untuk dipublikasi sebagai catatan khotbah. Pembicara sudah menyelesaikan khotbahnya.\n\nBuat catatan khotbah lengkap dlm GAYA BEC. Ikuti SEMUA aturan di system prompt persis.\n\nOutput HANYA catatan, tanpa pengantar/penutup AI/komentar.`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SUMMARY_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: userMsg }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
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
    const summary = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!summary) {
      return NextResponse.json({ error: 'Empty summary from Gemini' }, { status: 502 });
    }

    // Save back to Firestore + GCS
    const now = new Date().toISOString();
    const snapshot = { atSec: 0, summary, transcriptChars: transcript.length };
    await captureRef.update({
      latestSummary: summary,
      finalSummary: summary,
      summarySnapshots: [snapshot],
      summaryModel: GEMINI_MODEL,
      summaryRegeneratedAt: now,
      updatedAt: now,
    });
    // Best-effort upload to GCS as final_summary.md alongside transcript
    try {
      const finalPath = path.replace(/transcript\.txt$/, 'final_summary.md');
      await storage.bucket(bucket).file(finalPath).save(summary, {
        contentType: 'text/markdown; charset=utf-8',
      });
    } catch (e) {
      console.warn('GCS final_summary.md write failed:', e);
    }

    logAdminAction(request, 'update', 'sermon-capture', { resourceId: id, resourceTitle: `regenerate-summary: ${videoTitle}` });
    return NextResponse.json({ summary, model: GEMINI_MODEL, transcriptChars: transcript.length });
  } catch (err) {
    console.error('Regenerate summary error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
