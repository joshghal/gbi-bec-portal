import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
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

interface ExportedDoc {
  id: string;
  content: string;
  category: string;
  source: string;
  type: string;
}

// Default knowledge base path — export from admin panel to update this file
const DEFAULT_KB_PATH = resolve(__dirname, 'knowledge-base.json');

function loadChunks(): Chunk[] {
  const jsonPath = resolve(process.argv[2] || DEFAULT_KB_PATH);
  if (!existsSync(jsonPath)) {
    console.error(`Knowledge base file not found: ${jsonPath}`);
    console.error('  Pass a path: npx tsx scripts/ingest.ts path/to/knowledge-base.json');
    console.error('  Or export from admin and save to scripts/knowledge-base.json');
    process.exit(1);
  }
  const docs: ExportedDoc[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  return docs.map(d => ({
    id: d.id,
    content: d.content,
    metadata: { category: d.category, source: d.source, type: d.type },
  }));
}

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

async function listAllPineconeIds(): Promise<string[]> {
  const ids: string[] = [];
  let paginationToken: string | undefined;

  do {
    const url = new URL(`${PINECONE_HOST}/vectors/list`);
    if (paginationToken) url.searchParams.set('paginationToken', paginationToken);

    const response = await fetch(url.toString(), {
      headers: { 'Api-Key': PINECONE_API_KEY },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone list error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    for (const v of data.vectors || []) ids.push(v.id);
    paginationToken = data.pagination?.next;
  } while (paginationToken);

  return ids;
}

async function deleteFromPinecone(ids: string[]) {
  const response = await fetch(`${PINECONE_HOST}/vectors/delete`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinecone delete error: ${response.status} - ${error}`);
  }
}

async function main() {
  const chunks = loadChunks();
  const source = process.argv[2] || DEFAULT_KB_PATH;

  console.log(`\n🏛️  GBI BEC Document Ingestion`);
  console.log(`${'='.repeat(40)}`);
  console.log(`📄 Chunks to ingest: ${chunks.length}`);
  console.log(`📂 Source: ${source}`);
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
  const texts = chunks.map(c => c.content);
  const embeddings = await embedTexts(texts);
  console.log(`✅ Generated ${embeddings.length} embeddings (384 dimensions)\n`);

  // Prepare vectors for Pinecone
  const vectors = chunks.map((chunk, i) => ({
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

  // Delete stale vectors (IDs in Pinecone but not in current KB)
  console.log('🔄 Checking for stale vectors...');
  const existingIds = await listAllPineconeIds();
  const currentIds = new Set(chunks.map(c => c.id));
  const staleIds = existingIds.filter(id => !currentIds.has(id));

  if (staleIds.length > 0) {
    console.log(`🗑️  Deleting ${staleIds.length} stale vector(s): ${staleIds.join(', ')}`);
    await deleteFromPinecone(staleIds);
    console.log(`✅ Deleted stale vectors\n`);
  } else {
    console.log(`✅ No stale vectors found\n`);
  }

  console.log('🎉 Ingestion complete!\n');
}

main().catch(error => {
  console.error('❌ Ingestion failed:', error);
  process.exit(1);
});
