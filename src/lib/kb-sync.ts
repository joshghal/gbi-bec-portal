import { generateEmbedding } from '@/lib/embeddings';
import { upsertDocuments } from '@/lib/pinecone';
import { getAdminFirestore } from '@/lib/firebase-admin';

interface FormDate {
  date: string;
  label: string;
  slots: number;
}

const KB_CONFIG: Record<string, { id: string; label: string; category: string }> = {
  mclass: {
    id: 'jadwal-mclass',
    label: 'M-Class (Kelas Membership)',
    category: 'kegiatan',
  },
  baptism: {
    id: 'jadwal-baptisan',
    label: 'Baptisan Air',
    category: 'baptisan',
  },
};

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildScheduleContent(formType: string, dates: FormDate[]): string {
  const cfg = KB_CONFIG[formType];
  if (!cfg) return '';

  const today = new Date().toISOString().split('T')[0];
  const upcoming = dates
    .filter(d => d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) {
    return `Jadwal ${cfg.label} GBI Baranangsiang: Belum ada jadwal yang tersedia saat ini. Silakan hubungi admin untuk informasi lebih lanjut. Pendaftaran dan kegiatan ${cfg.label} tidak dipungut biaya.`;
  }

  const dateList = upcoming.map(d => formatDateID(d.date)).join(', ');
  return `Jadwal ${cfg.label} GBI Baranangsiang yang tersedia: ${dateList}. Pendaftaran dapat dilakukan melalui formulir di website. Pendaftaran dan kegiatan ${cfg.label} tidak dipungut biaya.`;
}

export async function syncScheduleToKB(formType: string, dates: FormDate[]) {
  const cfg = KB_CONFIG[formType];
  if (!cfg) return;

  const content = buildScheduleContent(formType, dates);
  const embedding = await generateEmbedding(content, 'passage');
  await upsertDocuments([{
    id: cfg.id,
    embedding,
    content,
    metadata: { category: cfg.category, source: 'admin-dates', type: 'jadwal' },
  }]);
}

/**
 * Sync all form type schedules to KB by reading dates from Firestore.
 * Returns the types that were synced.
 */
export async function syncAllSchedulesToKB(): Promise<string[]> {
  const db = getAdminFirestore();
  const synced: string[] = [];

  for (const formType of Object.keys(KB_CONFIG)) {
    const doc = await db.collection('settings').doc(`${formType}-dates`).get();
    const dates: FormDate[] = doc.exists ? (doc.data()!.dates || []) : [];
    await syncScheduleToKB(formType, dates);
    synced.push(formType);
  }

  return synced;
}
