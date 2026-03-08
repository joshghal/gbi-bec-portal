// Church Embedding Service client (multilingual-e5-small)

const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || 'http://localhost:8000';

export async function generateEmbedding(
  text: string,
  type: 'query' | 'passage' = 'query'
): Promise<number[]> {
  const response = await fetch(`${EMBEDDING_API_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, type }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function generateEmbeddings(
  texts: string[],
  type: 'query' | 'passage' = 'query'
): Promise<number[][]> {
  const response = await fetch(`${EMBEDDING_API_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: texts, type }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}
