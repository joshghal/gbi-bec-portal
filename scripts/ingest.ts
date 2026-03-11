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
  // === New from Google Sites (12 chunks) ===
  {
    id: 'identitas-gereja',
    content: 'GBI Baranangsiang (Gereja Bethel Indonesia Baranangsiang), juga dikenal sebagai GBI Sukawarna. Alamat: Jl. Baranang Siang No.8, Kb. Pisang, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40112, Indonesia. Koordinat: -6.918881, 107.620721. Google Maps: https://maps.app.goo.gl/DxqwnNHV8sZWEzHS7',
    metadata: { category: 'identitas', source: 'google-sites', type: 'info' },
  },
  {
    id: 'identitas-kontak',
    content: 'Kontak GBI BEC (Baranangsiang Evening Church): BEC WhatsApp: 0878-2342-0950 (https://wa.me/6287823420950). Call Centre Unit Pernikahan: WhatsApp 0896-7929-9098 (https://wa.me/6289679299098). Narahubung KOM: Henny — 0858-6006-0050 (https://wa.me/6285860060050). Narahubung Pelayanan Jemaat: Thomas — 0815-7309-7720 (https://wa.me/6281573097720). Instagram: https://www.instagram.com/sukawarna.bec/. YouTube: youtube.com/@gbibaranangsiangsukawarna7008.',
    metadata: { category: 'identitas', source: 'google-sites', type: 'kontak' },
  },
  {
    id: 'jadwal-ibadah',
    content: 'Jadwal Ibadah GBI Baranangsiang setiap hari Minggu pukul 17:00.',
    metadata: { category: 'jadwal', source: 'google-sites', type: 'jadwal' },
  },
  {
    id: 'baptis-persyaratan',
    content: 'Persyaratan Baptisan Air di GBI Baranangsiang: 1) Mengisi formulir pendaftaran baptisan. 2) Pas foto berwarna ukuran 3x4 dua lembar (background merah/biru, jangan dihakter). 3) Membawa baju ganti dan handuk. 4) Pakaian pada saat di baptis bebas rapi dan sopan. 5) Memakai masker bila diperlukan. 6) Hadir satu jam sebelum Baptisan, wajib datang tepat waktu. 7) Apabila berasal dari kepercayaan bukan Kristen, harus membuat surat pernyataan diatas meterai Rp 10.000 yang menyatakan tidak dipaksa dalam mengikuti baptisan, disertai fotocopy KTP. Isi surat pernyataan: nama lengkap, tempat/tanggal lahir, alamat tinggal, ditandatangani di Bandung. 8) Usia 12 tahun keatas. Baptisan diadakan setiap 2 bulan sekali.',
    metadata: { category: 'baptisan', source: 'google-sites', type: 'persyaratan' },
  },
  {
    id: 'baptis-info',
    content: 'Informasi Baptisan GBI Baranangsiang: Surat Baptis dapat diambil di diaken BEC bila sudah mengikuti KOM 100. Surat baptis yang hilang tidak dapat diterbitkan kembali, gereja hanya memberikan surat keterangan. Pendaftaran dapat dilakukan melalui formulir di website ini. Catatan: Bila ada perubahan jadwal, akan diinformasikan kembali. Datang lebih awal untuk registrasi dan pakai jubah baptis.',
    metadata: { category: 'baptisan', source: 'google-sites', type: 'info' },
  },
  {
    id: 'penyerahan-anak',
    content: 'Persyaratan Penyerahan Anak di GBI Baranangsiang: 1) Pas foto anak ukuran 3x4 dua lembar. 2) Fotocopy KTP Ayah. 3) Fotocopy KTP Ibu. 4) Fotocopy akta nikah/pemberkatan nikah orang tua. 5) Fotocopy akta lahir anak. 6) Fotocopy KAJ ayah dan ibu. Dokumen fisik diserahkan ke diaken BEC dengan lengkap. Pakaian bebas rapih dan sopan pada saat penyerahan anak. Untuk pendaftaran, hubungi call centre BEC di WhatsApp 0878-2342-0950 (https://wa.me/6287823420950). Surat penyerahan anak dapat diambil di diaken BEC. Surat yang hilang tidak dapat diterbitkan kembali, gereja hanya memberikan surat keterangan. Penyerahan anak tidak diadakan rutin setiap bulan, cek jadwal Gembala GBI BEC.',
    metadata: { category: 'penyerahan_anak', source: 'google-sites', type: 'persyaratan' },
  },
  {
    id: 'pernikahan-syarat',
    content: 'Persyaratan Pemberkatan Pernikahan di GBI Sukawarna: 1) Mengumpulkan persyaratan lengkap & mengisi formulir min. 5 bulan sebelum tanggal pernikahan (Wajib). 2) Calon mempelai adalah jemaat GBI Sukawarna & memiliki Kartu Anggota Jemaat/KAJ (Wajib). 3) Calon mempelai pria & wanita telah mengikuti kelas KOM 100 (Wajib). 4) Memastikan terlebih dahulu tanggal, waktu dan tempat pada pihak gereja. 5) Mengikuti konseling pernikahan & kelas Bimbingan Pranikah/BPN (setelah persyaratan masuk). Catatan: Bagi yang belum memiliki surat baptis, KAJ & mengikuti KOM 100, harap mengikuti terlebih dahulu sebelum mendaftar pernikahan. Pendaftaran tidak dipungut biaya.',
    metadata: { category: 'pernikahan', source: 'google-sites', type: 'persyaratan' },
  },
  {
    id: 'pernikahan-dokumen',
    content: 'Dokumen yang diperlukan untuk Pemberkatan Pernikahan di GBI Sukawarna (kedua calon mempelai): 1) Fotokopi KTP calon mempelai. 2) Fotokopi Kartu Keluarga (KK). 3) Fotokopi akte lahir calon mempelai. 4) Fotokopi surat baptisan dari gereja manapun. 5) Fotokopi surat ganti nama (jika ada) & fotokopi KTP orang tua. 6) Fotokopi akte kematian & wali (bagi orang tua sudah tidak ada). 7) Surat persetujuan orang tua dari kedua belah pihak diatas materai Rp 10.000 (asli). 8) Fotokopi Kartu Anggota Jemaat GBI Sukawarna (KAJ). 9) Fotokopi sertifikat KOM 100. 10) Pas foto berdampingan mempelai pria dan wanita 4x6 (3 lembar) — atasan kemeja putih polos rapih, latar foto berwarna biru.',
    metadata: { category: 'pernikahan', source: 'google-sites', type: 'persyaratan' },
  },
  {
    id: 'kaj-info',
    content: 'Persyaratan Kartu Anggota Jemaat (KAJ) GBI BEC: 1) Sudah melakukan baptisan selam (boleh dari gereja lain) atau sedang menunggu baptisan selam di GBI BEC. 2) Pernah beribadah di GBI BEC atau mengikuti ibadah online di YouTube Channel GBI Sukawarna. 3) Usia diatas 15 tahun. 4) Sudah lulus mengikuti M-Class (Kelas Membership). 5) Mengisi form pendataan jemaat (Google Form), link form diberikan oleh gereja jika persyaratan 1-4 sudah terpenuhi. 6) Wajib melampirkan foto format JPEG: foto asli surat baptis selam, foto asli KTP/KK, foto diri terbaru. Pendaftaran KAJ tidak tersedia di aplikasi ini. Hubungi Call Centre BEC di WhatsApp 0878-2342-0950 (https://wa.me/6287823420950) untuk informasi lebih lanjut.',
    metadata: { category: 'kaj', source: 'google-sites', type: 'persyaratan' },
  },
  {
    id: 'cool-info',
    content: 'COOL (Community of Love) adalah komsel/kelompok sel GBI Baranangsiang. Untuk bergabung, hubungi call centre BEC. Pendaftaran memerlukan: Nama Lengkap, No. HP/WhatsApp, Alamat Lengkap & Daerah, Usia, dan pilihan apakah ingin menyediakan rumah sebagai tempat COOL atau ingin bergabung di COOL.',
    metadata: { category: 'kegiatan', source: 'google-sites', type: 'info' },
  },
  {
    id: 'doa-kesaksian',
    content: 'Formulir Doa & Kesaksian GBI Baranangsiang: Bapak/Ibu/Saudara dapat menuliskan beban doa atau kesaksian untuk dapat didoakan/ditindaklanjuti oleh Tim Doa dan Pelayanan Jemaat GBI Baranangsiang. Untuk informasi lebih lanjut, hubungi call centre BEC di WhatsApp 0878-2342-0950 (https://wa.me/6287823420950).',
    metadata: { category: 'doa_kesaksian', source: 'google-sites', type: 'info' },
  },
  {
    id: 'pelayanan-jemaat',
    content: 'Pelayanan Jemaat GBI BEC menyediakan layanan berikut: 1) Pelayanan Kedukaan. 2) Ucapan syukur 40 hari, 100 hari, 1 tahun almarhum yang meninggal. 3) Kunjungan yang sakit di rumah sakit. 4) Kunjungan yang sakit di rumah. 5) Pengudusan rumah, kantor, tempat usaha, atau pabrik. 6) Konseling (pribadi, pernikahan, keluarga). 7) Pelayanan Pelepasan (kutuk/okultisme). 8) Perjamuan kudus di rumah (bagi yang tidak bisa pergi ke gereja/lansia). Narahubung Pelayanan Jemaat: Thomas — 0815-7309-7720 (WhatsApp: https://wa.me/6281573097720).',
    metadata: { category: 'pelayanan_jemaat', source: 'kegiatan-gbi-bec', type: 'info' },
  },
  // === Kept from old BEC data (3 chunks) ===
  {
    id: 'jadwal-kom',
    content: 'KOM BEC terdiri dari: KOM 100 (online setiap hari Kamis pukul 18:30 WIB), KOM 200 (online setiap hari Kamis pukul 18:30 WIB), KOM 300 (online setiap hari Rabu pukul 18:30 WIB).',
    metadata: { category: 'kom', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  // === KOM Curriculum from GBI wiki ===
  {
    id: 'kom-overview',
    content: 'KOM (Kehidupan Orientasi Melayani) adalah program pengajaran Firman Tuhan berjenjang di GBI, diluncurkan tahun 2005 menggantikan SOM (Sekolah Orientasi Melayani). Visi: "Mempersiapkan Umat yang Layak." Motto: Discipleship Movement (Matius 28:19). KOM terdiri dari 4 level: KOM 100 Pencari Tuhan (The Seeker) — 27 sesi, KOM 200 Pelayan Tuhan (The Servant) — 23 sesi, KOM 300 Prajurit Tuhan (The Soldier) — 16 sesi, KOM 400 Penilik Tuhan (The Steward) — 16 sesi. Total: 82 sesi. Kurikulum KOM bersifat nasional, ditetapkan oleh GBI pusat Jakarta dan berlaku di seluruh gereja GBI termasuk GBI Sukawarna/BEC.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'overview' },
  },
  {
    id: 'kom-100-materi',
    content: 'KOM 100 Pencari Tuhan (The Seeker) — 27 sesi dalam 4 sub-seri. Seri 110 Dasar-dasar Kekristenan (7 sesi): Hidup manusia, Kejatuhan manusia, Keselamatan, Berkat keselamatan, Baptisan air, Baptisan Roh Kudus, Hidup dalam Firman Allah. Seri 120 Kekristenan yang Bertumbuh (7 sesi): Doa/pujian/penyembahan, Saat teduh, Mendengar suara Tuhan, Tertanam dalam gereja lokal, Kehidupan dalam kelompok sel, Bertekun dalam iman, Kedewasaan rohani. Seri 130 Mengenal Allah (7 sesi): Mengenal Allah yang benar, Firman yang menjadi manusia, Kuasa salib Kristus, Pribadi Roh Kudus, Buah Roh Kudus, Kedatangan Kristus yang kedua, Menantikan pengharapan yang mulia. Seri 140 Kehidupan yang Memberi Dampak (6 sesi): Kehidupan yang menjadi berkat, Bersaksi bagi Kristus, Menemukan panggilan pelayanan, Sembilan karunia Roh Kudus, Memulai pelayanan, Komitmen untuk memberi dampak.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'materi' },
  },
  {
    id: 'kom-200-materi',
    content: 'KOM 200 Pelayan Tuhan (The Servant) — 23 sesi dalam 4 sub-seri. Seri 210 Karakter Pelayan Tuhan (8 sesi): 210.1 Karakter Pelayan Tuhan I (Orang yang miskin hatinya, Orang yang berduka cita), 210.2 Karakter Pelayan Tuhan II (Orang yang lemah lembut, Orang yang lapar dan haus akan kebenaran, Orang yang murah hati), 210.3 Karakter Pelayan Tuhan III (Orang yang suci hatinya, Orang yang membawa damai, Orang yang dianiaya karena kebenaran). Seri 220 Pengetahuan Alkitab (4 sesi): Mengenal Perjanjian Lama, Mengenal Perjanjian Baru, Studi Alkitab induktif, Agama-agama dunia. Seri 230 Kehidupan Kristen (9 sesi): Komunikasi pribadi, Membangun dan membina persahabatan, Pengendalian emosi, Memilih pasangan hidup, Kehidupan nikah Kristiani, Mendidik anak, Panggilan hidup dalam dunia kerja, Strategi kehidupan yang berhasil, Mengelola keuangan Anda. Seri 240 Pengenalan Pelayanan (2 sesi): Pelayanan konseling, Pelayanan khotbah.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'materi' },
  },
  {
    id: 'kom-300-materi',
    content: 'KOM 300 Prajurit Tuhan (The Soldier) — 16 sesi dalam 4 sub-seri. Seri 310 Karakter Prajurit (4 sesi): Kedalaman rohani melalui disiplin, Takut akan Tuhan, Selengkap senjata Allah, Berbaris sebagai Tentara Allah. Seri 320 Prajurit Doa, Pujian, dan Penyembahan (3 sesi): Peta jalan seorang prajurit, Pemulihan Pondok Daud, Prajurit Penyembah. Seri 330 Lima Karakteristik Pelayanan (5 sesi): Terobosan ke arah transformasi, Doa/pujian/penyembahan yang dinamis, Memperluas Kerajaan Allah, Mendewasakan jemaat, Meletakkan doktrin gereja. Seri 340 Menegakkan Kerajaan Allah (4 sesi): Hakikat Kerajaan Allah, Kerajaan Allah di dalam gereja, Kerajaan Allah di dalam dunia kerja, Kerajaan Allah di seluruh bumi.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'materi' },
  },
  {
    id: 'kom-400-materi',
    content: 'KOM 400 Penilik Tuhan (The Steward) — 16 sesi dalam 4 sub-seri, mengikuti pola ABCD. Seri 410 Authentic (4 sesi): Fondasi kehidupan, Memelihara kehidupan batiniah, Kehidupan pribadi seorang pemimpin, Tujuh kekuatan kehidupan yang berharga. Seri 420 Broken Hearted (4 sesi): Terobosan melalui kehancuran hati, Perilaku/karakter/kondisi hati, Anak-anak dalam keluarga rohani, Hidup bebas dari ketersinggungan. Seri 430 Courageous (4 sesi): Tujuh nilai untuk hidup yang berkenan, Tujuh unsur kepemimpinan yang kredibel, Mencetak seorang murid, Menginvestasikan hidup. Seri 440 Destiny Driven (4 sesi): Mengenali musim-musim kehidupan, Panggilan dan tujuan hidup, Timeline pelayanan, Pembuat sejarah dan pengubah masa depan.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'materi' },
  },
  {
    id: 'kom-prasyarat',
    content: 'Prasyarat KOM bersifat berjenjang (progresif): KOM 100 dapat diikuti oleh semua jemaat tanpa prasyarat. KOM 200 mensyaratkan kelulusan KOM 100. KOM 300 mensyaratkan kelulusan KOM 100 dan KOM 200. KOM 400 mensyaratkan kelulusan KOM 100, 200, dan 300. Penting: Sertifikat KOM 100 diperlukan untuk pengambilan surat baptis dan sebagai syarat pendaftaran pemberkatan pernikahan di GBI Sukawarna.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'prasyarat' },
  },
  {
    id: 'kom-kelulusan',
    content: 'Kelulusan KOM: Setiap level KOM memiliki persyaratan kelulusan yang meliputi: 1) Kehadiran minimum sesuai ketentuan. 2) Menyelesaikan tugas/lembar kerja (worksheet) yang diberikan selama kelas. 3) Mengikuti dan lulus ujian akhir KOM. Peserta yang lulus akan menerima sertifikat KOM yang berlaku secara nasional di seluruh gereja GBI di Indonesia.',
    metadata: { category: 'kom', source: 'gbi-kom-wiki', type: 'info' },
  },
  {
    id: 'jadwal-mclass',
    content: 'M-Class diadakan setiap hari Senin pukul 18.30 WIB.',
    metadata: { category: 'kegiatan', source: 'kegiatan-gbi-bec', type: 'jadwal' },
  },
  {
    id: 'kontak-pernikahan',
    content: 'Untuk pemberkatan pernikahan, silahkan menghubungi Call Centre Unit Pernikahan di WhatsApp 0896-7929-9098 (https://wa.me/6289679299098).',
    metadata: { category: 'pernikahan', source: 'kegiatan-gbi-bec', type: 'kontak' },
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
