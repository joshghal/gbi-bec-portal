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

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Embed the user query + fetch form settings in parallel
    const [queryEmbedding, disabledForms] = await Promise.all([
      generateEmbedding(message, 'query'),
      getDisabledForms(),
    ]);

    // 2. Search Pinecone for relevant documents
    const results = await searchDocuments(queryEmbedding, { topK: 5 });

    // 3. Build the prompt with document context
    const documentContext = formatDocumentsForContext(results);
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
      return NextResponse.json({
        response: parsed.response,
        suggestedQuestions: parsed.suggestedQuestions || [],
        formTrigger: parsed.formTrigger || null,
        sources,
      });
    }

    // Fallback: return raw content if JSON parsing fails
    return NextResponse.json({
      response: aiResult.content,
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
