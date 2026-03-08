import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { searchDocuments } from '@/lib/pinecone';
import { callChatAI, parseJSONResponse } from '@/lib/ai/chat-handler';
import {
  CHAT_SYSTEM_PROMPT,
  buildUserPrompt,
  formatDocumentsForContext,
} from '@/lib/ai/chat-prompts';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Embed the user query
    const queryEmbedding = await generateEmbedding(message, 'query');

    // 2. Search Pinecone for relevant documents
    const results = await searchDocuments(queryEmbedding, { topK: 5 });

    // 3. Build the prompt with document context
    const documentContext = formatDocumentsForContext(results);
    const sources = [...new Set(results.map(r => r.metadata.source).filter(Boolean))] as string[];

    const userPrompt = buildUserPrompt(message, documentContext, history || []);

    // 4. Call ASI:One Mini
    const aiResult = await callChatAI({
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
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
    }>(aiResult.content!);

    if (parsed) {
      return NextResponse.json({
        response: parsed.response,
        suggestedQuestions: parsed.suggestedQuestions || [],
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
