import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not set');
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

export function getIndex() {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX || 'baranangsiang-evening-chruch';
  return client.index(indexName);
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    source?: string;
    category?: string;
    type?: string;
  };
}

export async function searchDocuments(
  queryEmbedding: number[],
  options: { topK?: number; filter?: Record<string, unknown> } = {}
): Promise<SearchResult[]> {
  const { topK = 5, filter } = options;

  const index = getIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    ...(filter && { filter }),
  });

  return (result.matches || []).map(match => ({
    id: match.id,
    score: match.score || 0,
    content: (match.metadata?.content as string) || '',
    metadata: {
      source: match.metadata?.source as string,
      category: match.metadata?.category as string,
      type: match.metadata?.type as string,
    },
  }));
}

export async function upsertDocuments(
  documents: {
    id: string;
    embedding: number[];
    content: string;
    metadata: Record<string, string>;
  }[]
) {
  const index = getIndex();

  const vectors = documents.map(doc => ({
    id: doc.id,
    values: doc.embedding,
    metadata: {
      content: doc.content,
      ...doc.metadata,
    },
  }));

  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert({ records: batch });
  }

  return vectors.length;
}
