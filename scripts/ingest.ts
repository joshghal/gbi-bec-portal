import { config } from 'dotenv';
config({ path: '.env.local' });

const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || 'http://localhost:8000';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'baranangsiang-evening-chruch';

interface Chunk {
  id: string;
  content: string;
  metadata: {
    category: string;
    source: string;
    type: string;
  };
}

// Pre-processed church document chunks
const CHUNKS: Chunk[] = [
  {
    id: 'jadwal-ibadah',
    content: 'Ibadah GBI BEC diadakan setiap hari Minggu pukul 17.00 WIB.',
    metadata: { category: 'jadwal', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'jadwal-mclass',
    content: 'M-Class diadakan setiap hari Senin pukul 18.30 WIB.',
    metadata: { category: 'jadwal', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'jadwal-baptisan',
    content: 'Baptisan diadakan setiap 2 bulan sekali. Jadwal baptisan bisa dilihat di jadwal kegiatan dalam group WhatsApp.',
    metadata: { category: 'baptisan', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'info-cool',
    content: 'COOL (Community of Love) diadakan secara onsite dan online. Jadwal COOL dapat dilihat pada jadwal COOL secara khusus.',
    metadata: { category: 'kegiatan', source: 'kegiatan-gbi-bec', type: 'info' },
  },
  {
    id: 'jadwal-kom',
    content: 'KOM BEC terdiri dari: KOM 100 (online setiap hari Kamis pukul 18:30 WIB), KOM 200 (online setiap hari Kamis pukul 18:30 WIB), KOM 300 (online setiap hari Rabu pukul 18:30 WIB).',
    metadata: { category: 'kom', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'jadwal-penyerahan-anak',
    content: 'Penyerahan anak tidak diadakan rutin setiap bulan. Jadwal melihat jadwal Gembala GBI BEC. Bisa dilihat di jadwal kegiatan BEC untuk bulan berjalan di dalam group WhatsApp.',
    metadata: { category: 'penyerahan_anak', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'kontak-pernikahan',
    content: 'Untuk pemberkatan pernikahan, silahkan menghubungi Call Centre Unit Pernikahan di nomor HP 0896-7929-9098.',
    metadata: { category: 'pernikahan', source: 'kegiatan-gbi-bec', type: 'kontak' },
  },
  {
    id: 'kontak-callcentre',
    content: 'Jika ada pertanyaan lainnya, silahkan hubungi Call Centre GBI BEC di WhatsApp 0878-2342-0950 (https://wa.me/6287823420950).',
    metadata: { category: 'kontak', source: 'kegiatan-gbi-bec', type: 'kontak' },
  },
  {
    id: 'syarat-baptisan-air',
    content: 'Persyaratan Baptisan Air di GBI Sukawarna: Usia minimal 12 tahun. Pasfoto ukuran 3x4 sebanyak 2 lembar (foto formal, background merah/biru, jangan dihakter). Mengisi formulir pendaftaran dengan benar dan rapih menggunakan huruf cetak (terhindar dari kesalahan pembuatan nama peserta dan nama ayah & ibu, sesuai akta lahir). Membawa baju ganti dan handuk. Pakaian bebas rapih dan sopan pada saat dibaptis.',
    metadata: { category: 'baptisan', source: 'baptisan-air', type: 'persyaratan' },
  },
  {
    id: 'syarat-baptisan-nonkristen',
    content: 'Peserta baptis yang berasal dari kepercayaan bukan Kristen wajib membuat Surat Pernyataan bahwa tidak ada paksaan dalam mengikuti pembaptisan, dengan memakai materai Rp 10.000 dan disertai fotocopy KTP. Peserta baptis wajib datang tepat waktu.',
    metadata: { category: 'baptisan', source: 'baptisan-air', type: 'persyaratan' },
  },
  {
    id: 'info-surat-baptis',
    content: 'Surat Baptis dapat diambil di cabang ibadah bila sudah mengikuti pembelajaran KOM 100 (Kehidupan Orientasi Melayani). Surat baptis yang hilang tidak dapat diterbitkan kembali, gereja hanya memberikan surat keterangan.',
    metadata: { category: 'baptisan', source: 'baptisan-air', type: 'info' },
  },
  {
    id: 'syarat-penyerahan-anak',
    content: 'Persyaratan Penyerahan Anak di GBI Sukawarna: Pasfoto anak ukuran 3x4 sebanyak 2 lembar. Fotocopy akta lahir anak. Fotocopy surat pemberkatan nikah atau akta nikah. Fotocopy KTP ayah dan ibu. Fotocopy KAJ ayah dan ibu. Dokumen fisik diserahkan ke cabang ibadah dengan lengkap. Pakaian bebas rapih dan sopan pada saat penyerahan anak.',
    metadata: { category: 'penyerahan_anak', source: 'penyerahan-anak', type: 'persyaratan' },
  },
  {
    id: 'info-surat-penyerahan-anak',
    content: 'Surat penyerahan anak dapat diambil di cabang ibadah. Surat penyerahan anak yang hilang tidak dapat diterbitkan kembali, gereja hanya memberikan surat keterangan.',
    metadata: { category: 'penyerahan_anak', source: 'penyerahan-anak', type: 'info' },
  },
  {
    id: 'form-baptisan-muslim',
    content: 'Surat Pernyataan untuk baptisan dari non-Kristen di GBI Sukawarna Bandung: Peserta mengisi nama lengkap, tempat/tanggal lahir, dan alamat tinggal. Menyatakan memberi diri untuk dibaptis air/dipermandikan atas dasar kesadaran sendiri dan tanpa paksaan dari pihak manapun. Surat pernyataan dibuat dalam keadaan sehat, ditempel materai Rp 10.000, dan ditandatangani di Bandung.',
    metadata: { category: 'baptisan', source: 'form-baptisan-muslim', type: 'persyaratan' },
  },
];

async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${EMBEDDING_API_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: texts, type: 'passage' }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding;
}

async function upsertToPinecone(
  vectors: { id: string; values: number[]; metadata: Record<string, string> }[]
) {
  // Use Pinecone REST API directly for the script
  const response = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vectors }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinecone upsert error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function main() {
  console.log(`\n🏛️  GBI BEC Document Ingestion`);
  console.log(`${'='.repeat(40)}`);
  console.log(`📄 Chunks to ingest: ${CHUNKS.length}`);
  console.log(`🔗 Embedding API: ${EMBEDDING_API_URL}`);
  console.log(`📌 Pinecone index: ${PINECONE_INDEX}\n`);

  // Check if embedding service is running
  try {
    const health = await fetch(`${EMBEDDING_API_URL}/health`);
    if (!health.ok) throw new Error('unhealthy');
    console.log('✅ Embedding service is healthy\n');
  } catch {
    console.error('❌ Embedding service is not running at', EMBEDDING_API_URL);
    console.error('   Start the church-embedding-service first.\n');
    process.exit(1);
  }

  // Embed all chunks
  console.log('🔄 Generating embeddings...');
  const texts = CHUNKS.map(c => c.content);
  const embeddings = await embedTexts(texts);
  console.log(`✅ Generated ${embeddings.length} embeddings (384 dimensions)\n`);

  // Prepare vectors for Pinecone
  const vectors = CHUNKS.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: {
      content: chunk.content,
      ...chunk.metadata,
    },
  }));

  // Upsert to Pinecone
  console.log('🔄 Upserting to Pinecone...');
  await upsertToPinecone(vectors);
  console.log(`✅ Upserted ${vectors.length} vectors to Pinecone\n`);

  console.log('🎉 Ingestion complete!\n');
}

main().catch(error => {
  console.error('❌ Ingestion failed:', error);
  process.exit(1);
});
