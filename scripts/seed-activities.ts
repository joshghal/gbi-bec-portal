/**
 * Seed Firestore with the 8 default activities for the "Kegiatan Kami" section.
 *
 * Usage: npx tsx scripts/seed-activities.ts
 *
 * - Clears existing `activities` collection, then writes all 8 items with correct order.
 * - Also ensures `settings/kegiatan` document exists with sectionEnabled: true.
 * - Requires GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_BASE64 env var.
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getServiceAccountCredentials } from '../src/lib/service-account';

function init() {
  if (getApps().length > 0) return;
  const creds = getServiceAccountCredentials();
  if (creds) {
    initializeApp({ credential: cert(creds as ServiceAccount) });
  } else {
    initializeApp({ projectId: 'baranangsiang-evening-chur' });
  }
}

const ACTIVITIES = [
  {
    title: 'Ibadah Raya', subtitle: 'Kebaktian Utama', day: 'Minggu · 17:00 WIB',
    description: 'Ibadah utama GBI BEC setiap Minggu sore dengan pujian penyembahan dan pemberitaan Firman Tuhan. Terbuka untuk umum.',
    tags: [], contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    ctaLabel: '', ctaHref: '', ctaExternal: false,
    aiQuestion: 'Kapan jadwal Ibadah Raya GBI BEC dan bagaimana cara menghadirinya?',
  },
  {
    title: 'KOM', subtitle: 'Kehidupan Orientasi Melayani', day: 'Rabu & Kamis · 18:30 WIB',
    description: 'Program pengajaran Firman Tuhan berjenjang — 4 level, 82 sesi total. Kurikulum nasional GBI, sertifikat resmi setiap level.',
    tags: ['KOM 100 · Pencari', 'KOM 200 · Pelayan', 'KOM 300 · Prajurit', 'KOM 400 · Penilik'],
    contacts: [{ name: 'Henny', waLink: 'https://wa.me/6285860060050' }],
    ctaLabel: 'Lihat Materi KOM', ctaHref: '/kom', ctaExternal: false,
    aiQuestion: 'Apa itu program KOM di GBI BEC dan bagaimana cara mendaftar?',
  },
  {
    title: 'Creative Ministry', subtitle: 'Seni & Pujian', day: 'Sabtu',
    description: 'Enam cabang pelayanan seni — dari paduan suara hingga tarian modern. Latihan setiap Sabtu di Baranangsiang.',
    tags: ['Choir Dewasa', 'Choir Anak', 'Balet', 'Tamborine', 'Banner', 'Modern Dance'],
    contacts: [{ name: 'Ibu Fera', waLink: 'https://wa.me/6282119749869' }],
    ctaLabel: '', ctaHref: '', ctaExternal: false,
    aiQuestion: 'Bagaimana cara bergabung dengan Creative Ministry GBI BEC?',
  },
  {
    title: 'COOL', subtitle: 'Community of Love', day: 'Selasa',
    description: 'Kelompok sel untuk saling mendukung dan bertumbuh bersama dalam komunitas kecil yang hangat.',
    tags: [], contacts: [{ name: 'Ps. Agus Sulistyono', waLink: 'https://wa.me/6281910238170' }],
    ctaLabel: '', ctaHref: '', ctaExternal: false,
    aiQuestion: 'Apa itu COOL di GBI BEC dan bagaimana cara bergabung dengan kelompok sel?',
  },
  {
    title: 'M-Class', subtitle: 'Keanggotaan Gereja', day: 'Jadwal diinfokan',
    description: 'Kelas wajib untuk mendapatkan KAJ dan menjadi anggota resmi GBI BEC.',
    tags: ['M-Class', 'Baptisan', 'KAJ', 'Anggota'],
    contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    ctaLabel: 'Daftar M-Class', ctaHref: '/forms/mclass', ctaExternal: false,
    aiQuestion: 'Apa itu M-Class dan bagaimana cara mendaftar menjadi anggota resmi GBI BEC?',
  },
  {
    title: 'Baptisan Air', subtitle: 'Sakramen', day: 'Dua bulan sekali',
    description: 'Baptisan selam bagi jemaat usia 12+ tahun yang telah menyelesaikan KOM 100.',
    tags: [], contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    ctaLabel: 'Daftar Baptisan', ctaHref: '/forms/baptism', ctaExternal: false,
    aiQuestion: 'Apa syarat Baptisan Air di GBI BEC dan bagaimana cara mendaftarnya?',
  },
  {
    title: 'Penyerahan Anak', subtitle: 'Sakramen', day: 'Jadwal diinfokan',
    description: 'Bersama kedua orang tua di hadapan jemaat sebagai komitmen mendidik anak dalam Tuhan.',
    tags: [], contacts: [{ name: 'Call Centre BEC', waLink: 'https://wa.me/6287823420950' }],
    ctaLabel: 'Daftar', ctaHref: '/forms/child-dedication', ctaExternal: false,
    aiQuestion: 'Apa syarat Penyerahan Anak di GBI BEC dan bagaimana cara mendaftarnya?',
  },
  {
    title: 'Pemberkatan Nikah', subtitle: 'Sakramen', day: 'Daftar min. 5 bulan sebelumnya',
    description: 'Bagi jemaat GBI BEC yang memiliki KAJ dan telah lulus KOM 100.',
    tags: [], contacts: [{ name: 'Unit Pernikahan', waLink: 'https://wa.me/6289679299098' }],
    ctaLabel: '', ctaHref: '', ctaExternal: false,
    aiQuestion: 'Apa syarat Pemberkatan Nikah di GBI BEC dan bagaimana cara mendaftarnya?',
  },
];

async function main() {
  init();
  const db = getFirestore();
  const now = new Date().toISOString();

  // 1. Delete existing activities
  const existing = await db.collection('activities').get();
  if (!existing.empty) {
    const batch = db.batch();
    existing.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted ${existing.size} existing activities.`);
  }

  // 2. Write all activities with order
  const batch = db.batch();
  ACTIVITIES.forEach((activity, i) => {
    const ref = db.collection('activities').doc();
    batch.set(ref, {
      ...activity,
      enabled: true,
      order: i,
      createdAt: now,
      updatedAt: now,
    });
  });
  await batch.commit();
  console.log(`Seeded ${ACTIVITIES.length} activities.`);

  // 3. Ensure settings doc
  await db.doc('settings/kegiatan').set({ sectionEnabled: true }, { merge: true });
  console.log('Settings: sectionEnabled = true');

  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
