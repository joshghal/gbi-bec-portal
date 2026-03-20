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

    // 1. Embed query + fetch form settings + fetch live dates in parallel
    const [queryEmbedding, disabledForms, liveSchedule] = await Promise.all([
      generateEmbedding(message, 'query'),
      getDisabledForms(),
      getLiveSchedule(),
    ]);

    // 2. Search Pinecone for relevant documents
    // topK: how many chunks to retrieve. KB has 24 chunks — 7 covers ~30% which is
    // the right balance between recall and context noise. Raise if KB grows past ~50 chunks.
    const results = await searchDocuments(queryEmbedding, { topK: 7 });

    // 3. Build the prompt — live dates always prepended so they're never missed
    const vectorContext = formatDocumentsForContext(results);
    const documentContext = liveSchedule
      ? `${liveSchedule}\n\n---\n\n${vectorContext}`
      : vectorContext;
    const sources = [...new Set(results.map(r => r.metadata.source).filter(Boolean))] as string[];

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
