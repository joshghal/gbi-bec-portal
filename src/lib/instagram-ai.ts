import { callChatAI, parseJSONResponse } from './ai/chat-handler';
import type { InstagramPost } from './instagram-scraper';

export interface KabarDraft {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;   // YYYY-MM-DD — event date extracted from caption, fallback to post date
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Ibadah':           'oklch(0.35 0.04 175)',  // hijau
  'Pengumuman':       'oklch(0.30 0.04 260)',  // biru
  'Kegiatan':         'oklch(0.32 0.04 55)',   // coklat
  'Pelayanan':        'oklch(0.35 0.05 15)',   // merah
  'M-Class':          'oklch(0.30 0.05 300)',  // ungu
  'Penyerahan Anak':  'oklch(0.32 0.05 200)',  // teal
  'Lainnya':          'oklch(0.30 0.05 300)',  // ungu
};

export async function processInstagramPost(
  post: InstagramPost,
  postDate: string, // YYYY-MM-DD fallback if AI can't extract event date
): Promise<KabarDraft> {
  const result = await callChatAI({
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten konten untuk GBI Baranangsiang Evening Church (BEC) Sukawarna, Bandung.
Tugasmu: ubah caption Instagram mentah menjadi konten kabar/berita gereja yang rapi.

Kembalikan HANYA JSON dengan format berikut (tanpa teks lain):
{
  "title": "judul singkat dan deskriptif (maks 80 karakter)",
  "excerpt": "ringkasan 1-2 kalimat (maks 180 karakter)",
  "content": "konten lengkap dalam HTML sederhana (gunakan <p>, <br>, <strong> saja). Tulis ulang dengan bahasa yang lebih rapi, singkat, dan formal — hapus salam berulang, simbol #hashtag, dan teks yang tidak relevan.",
  "category": "salah satu dari: Ibadah, Pengumuman, Kegiatan, Pelayanan, M-Class, Penyerahan Anak, Lainnya",
  "date": "YYYY-MM-DD — tanggal EVENT/KEGIATAN yang disebut dalam caption (bukan tanggal posting). Jika tidak ada tanggal spesifik, gunakan fallback: ${postDate}"
}

Panduan kategori:
- Ibadah: undangan ibadah minggu, ibadah khusus (Jumat Agung, Natal, dll)
- Pengumuman: info penting, perubahan jadwal, pengumuman umum
- Kegiatan: COOL, persekutuan, doa bersama, retreat
- Pelayanan: info pelayanan, rekrutmen tim
- M-Class: kelas pertumbuhan
- Penyerahan Anak: ibadah penyerahan anak
- Lainnya: konten lain (quotes, motivasi, dll)`,
      },
      {
        role: 'user',
        content: `Caption Instagram:\n\n${post.caption || '(tidak ada caption)'}`,
      },
    ],
    temperature: 0.2,
    maxTokens: 800,
  });

  if (!result.success || !result.content) {
    // Fallback: basic extraction without AI
    return buildFallback(post, postDate);
  }

  const parsed = parseJSONResponse<KabarDraft>(result.content);
  if (!parsed || !parsed.title) {
    return buildFallback(post, postDate);
  }

  const category = parsed.category in CATEGORY_COLORS ? parsed.category : 'Lainnya';

  return {
    title: parsed.title.slice(0, 80),
    excerpt: parsed.excerpt?.slice(0, 180) || '',
    content: parsed.content || `<p>${post.caption}</p>`,
    category,
    date: parsed.date || postDate,
    color: CATEGORY_COLORS[category],
  };
}

function buildFallback(post: InstagramPost, postDate: string): KabarDraft {
  const lines = post.caption.split('\n').filter(Boolean);
  const title = lines[0]?.slice(0, 80) || 'Post Instagram';
  const excerpt = post.caption.slice(0, 180);
  return {
    title,
    excerpt,
    content: `<p>${post.caption.replace(/\n/g, '<br>')}</p>`,
    category: 'Lainnya',
    date: postDate,
    color: CATEGORY_COLORS['Lainnya'],
  };
}
