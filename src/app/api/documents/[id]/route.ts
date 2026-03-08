import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { verifyAuthToken } from '@/lib/firebase-admin';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_HOST = process.env.PINECONE_HOST!;

// PUT — Update a document (re-embeds content)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { content, category, source, type } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // Re-embed the updated content
    const embedding = await generateEmbedding(content, 'passage');

    // Upsert (update) to Pinecone
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

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE — Remove a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const deleteRes = await fetch(`${PINECONE_HOST}/vectors/delete`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: [id] }),
    });

    if (!deleteRes.ok) {
      const error = await deleteRes.text();
      throw new Error(`Pinecone delete error: ${error}`);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
