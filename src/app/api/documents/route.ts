import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/admin-logger';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;

// GET — List all documents from Pinecone
export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;
  try {
    // List all vector IDs
    const listRes = await fetch(`${PINECONE_HOST}/vectors/list`, {
      method: 'GET',
      headers: { 'Api-Key': PINECONE_API_KEY },
    });

    if (!listRes.ok) {
      throw new Error(`Pinecone list error: ${listRes.status}`);
    }

    const listData = await listRes.json();
    const ids = (listData.vectors || []).map((v: { id: string }) => v.id);

    if (ids.length === 0) {
      return NextResponse.json({ documents: [] });
    }

    // Fetch all vectors with metadata
    const fetchRes = await fetch(`${PINECONE_HOST}/vectors/fetch`, {
      method: 'GET',
      headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
    });

    // Use query with each ID to get metadata — fetch endpoint needs IDs as params
    const fetchUrl = new URL(`${PINECONE_HOST}/vectors/fetch`);
    ids.forEach((id: string) => fetchUrl.searchParams.append('ids', id));

    const fetchRes2 = await fetch(fetchUrl.toString(), {
      method: 'GET',
      headers: { 'Api-Key': PINECONE_API_KEY },
    });

    if (!fetchRes2.ok) {
      throw new Error(`Pinecone fetch error: ${fetchRes2.status}`);
    }

    const fetchData = await fetchRes2.json();

    const documents = Object.entries(fetchData.vectors || {}).map(
      ([id, vector]: [string, any]) => ({
        id,
        content: vector.metadata?.content || '',
        category: vector.metadata?.category || '',
        source: vector.metadata?.source || '',
        type: vector.metadata?.type || '',
      })
    );

    // Sort by ID for consistent ordering
    documents.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list documents' },
      { status: 500 }
    );
  }
}

// POST — Add a new document
export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id, content, category, source, type } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: 'id and content are required' },
        { status: 400 }
      );
    }

    // Generate embedding
    const embedding = await generateEmbedding(content, 'passage');

    // Upsert to Pinecone
    const upsertRes = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: [
          {
            id,
            values: embedding,
            metadata: {
              content,
              category: category || '',
              source: source || '',
              type: type || '',
            },
          },
        ],
      }),
    });

    if (!upsertRes.ok) {
      const error = await upsertRes.text();
      throw new Error(`Pinecone upsert error: ${error}`);
    }

    logAdminAction(request, 'create', 'document', { resourceId: id, resourceTitle: id });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Add document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add document' },
      { status: 500 }
    );
  }
}
