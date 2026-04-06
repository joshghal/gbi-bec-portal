import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { searchDocuments } from '@/lib/pinecone';
import { callChatAI, parseJSONResponse } from '@/lib/ai/chat-handler';
import {
  buildSystemPrompt,
  buildUserPrompt,
  formatDocumentsForContext,
} from '@/lib/ai/chat-prompts';
import { getAdminFirestore } from '@/lib/firebase-admin';

async function getDisabledForms(): Promise<string[]> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('forms').get();
    return doc.exists ? (doc.data()!.disabledForms || []) : [];
  } catch {
    return [];
  }
}

async function getLiveCoolGroups(query: string): Promise<string> {
  const keywords = ['cool', 'kelompok sel', 'komunitas', 'cell group', 'agus', 'kabid'];
  const q = query.toLowerCase();
  if (!keywords.some(k => q.includes(k))) return '';

  try {
    const db = getAdminFirestore();
    const [snap, settingsDoc] = await Promise.all([
      db.collection('cool_groups').orderBy('order', 'asc').get(),
      db.doc('settings/cool').get(),
    ]);
    if (snap.empty) return '';

    const kabid = settingsDoc.exists ? settingsDoc.data()?.kabid : null;

    const lines = snap.docs.map(d => {
      const g = d.data();
      const parts = [`${g.name} — daerah ${g.area}`];
      if (g.ketua?.name) parts.push(`Ketua: ${g.ketua.name}${g.ketua.phone ? ' (HP: ' + g.ketua.phone + ')' : ''}`);
      if (g.wakil?.name && g.wakil.name !== 'Kosong') parts.push(`Wakil: ${g.wakil.name}${g.wakil.phone ? ' (HP: ' + g.wakil.phone + ')' : ''}`);
      if (g.sekretaris?.name && g.sekretaris.name !== 'Kosong') parts.push(`Sekretaris: ${g.sekretaris.name}${g.sekretaris.phone ? ' (HP: ' + g.sekretaris.phone + ')' : ''}`);
      return parts.join('. ');
    });

    const kabidInfo = kabid?.name
      ? `Kabid COOL: ${kabid.name}${kabid.phone ? ' (HP: ' + kabid.phone + ')' : ''}${kabid.address ? ', Alamat: ' + kabid.address : ''}`
      : 'Kabid COOL: Ps. Agus Sulistiyanto (HP: 081910238170)';

    return `[COOL Group — data terkini] ${kabidInfo}. COOL (Community of Love) adalah komsel/kelompok sel GBI Baranangsiang yang bertemu setiap hari Selasa. COOL itu sebuah wadah di mana setiap jemaat bisa belajar, bertumbuh bersama, dan semakin diperlengkapi lagi untuk penuaian jiwa-jiwa. Saling berdoa dan saling menguatkan. Merupakan perpanjangan tangan dari Tuhan dan Gembala untuk menjangkau jiwa-jiwa yang membutuhkan pelayanan secara khusus. Cara bergabung: hubungi Call Centre BEC di WhatsApp 0878-2342-0950 atau langsung hubungi ketua COOL di daerah terdekat. Pendaftaran memerlukan Nama Lengkap, No. HP/WhatsApp, Alamat & Daerah, Usia, dan pilihan apakah ingin menyediakan rumah sebagai tempat COOL atau bergabung di COOL yang sudah ada. Ada ${lines.length} kelompok COOL:\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}

async function getLiveSchedule(): Promise<string> {
  try {
    const db = getAdminFirestore();
    const today = new Date().toISOString().split('T')[0];

    const [baptismDoc, mclassDoc] = await Promise.all([
      db.collection('settings').doc('baptism-dates').get(),
      db.collection('settings').doc('mclass-dates').get(),
    ]);

    const fmt = (dates: Array<{ date: string; label: string }>) =>
      dates
        .filter(d => d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => d.label || d.date)
        .join(', ');

    const baptismDates = fmt((baptismDoc.data()?.dates || []) as Array<{ date: string; label: string }>);
    const mclassDates = fmt((mclassDoc.data()?.dates || []) as Array<{ date: string; label: string }>);

    const lines: string[] = [];
    if (baptismDates) lines.push(`[jadwal] Jadwal Baptisan Air yang tersedia: ${baptismDates}. Pendaftaran melalui formulir di website.`);
    if (mclassDates) lines.push(`[jadwal] Jadwal M-Class yang tersedia: ${mclassDates}. Pendaftaran melalui formulir di website.`);

    return lines.join('\n\n');
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Embed query + fetch form settings + fetch live dates + COOL groups in parallel
    const [queryEmbedding, disabledForms, liveSchedule, liveCool] = await Promise.all([
      generateEmbedding(message, 'query'),
      getDisabledForms(),
      getLiveSchedule(),
      getLiveCoolGroups(message),
    ]);

    // 2. Search Pinecone for relevant documents
    // topK: how many chunks to retrieve. KB has 36 chunks — 9 covers ~25% which is
    // the right balance between recall and context noise.
    const results = await searchDocuments(queryEmbedding, { topK: 9 });

    // 3. Build the prompt — live dates always prepended so they're never missed
    const vectorContext = formatDocumentsForContext(results);
    const liveContext = [liveSchedule, liveCool].filter(Boolean).join('\n\n---\n\n');
    const documentContext = liveContext
      ? `${liveContext}\n\n---\n\n${vectorContext}`
      : vectorContext;

    const sources = results.map(r => ({ id: r.id, score: Math.round(r.score * 1000) / 1000 }));

    const userPrompt = buildUserPrompt(message, documentContext, history || []);
    const systemPrompt = buildSystemPrompt(disabledForms);

    // 4. Call ASI:One Mini
    const aiResult = await callChatAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    if (!aiResult.success) {
      return NextResponse.json(
        { error: aiResult.error || 'AI request failed' },
        { status: 502 }
      );
    }

    // 5. Parse the JSON response
    const parsed = parseJSONResponse<{
      response: string;
      suggestedQuestions: string[];
      formTrigger?: string | null;
    }>(aiResult.content!);

    if (parsed) {
      // Log unanswered questions (fire-and-forget)
      if (parsed.response.includes('belum memiliki informasi')) {
        getAdminFirestore().collection('chat_misses').add({
          question: message,
          response: parsed.response,
          sources,
          timestamp: new Date(),
        }).catch(() => {});
      }

      return NextResponse.json({
        response: parsed.response,
        suggestedQuestions: parsed.suggestedQuestions || [],
        formTrigger: parsed.formTrigger || null,
        sources,
      });
    }

    // Fallback: return raw content if JSON parsing fails
    const rawContent = aiResult.content ?? '';
    if (rawContent.includes('belum memiliki informasi')) {
      getAdminFirestore().collection('chat_misses').add({
        question: message,
        response: rawContent,
        sources,
        timestamp: new Date(),
      }).catch(() => {});
    }

    return NextResponse.json({
      response: rawContent,
      suggestedQuestions: [],
      sources,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
