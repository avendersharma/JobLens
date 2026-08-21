import { QdrantClient } from '@qdrant/js-client-rest';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = process.env.QDRANT_COLLECTION ?? 'joblens_kb';
const VECTOR_SIZE = 768; // sentence-transformers/all-mpnet-base-v2

const client = new QdrantClient({ url: process.env.QDRANT_URL ?? 'http://localhost:6333' });

const embeddings = new HuggingFaceInferenceEmbeddings({
  model: 'sentence-transformers/all-mpnet-base-v2',
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function initCollection(): Promise<void> {
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION);
  if (!exists) {
    await client.createCollection(COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    });
    console.log(`Qdrant collection "${COLLECTION}" created`);
  }
}

export interface ChunkMetadata {
  source: 'resume' | 'jd' | 'github' | 'certificate' | 'portfolio';
  docId: string;
  chunkIndex: number;
  text: string;
  [key: string]: unknown;
}

export async function upsertChunks(chunks: string[], metadata: Omit<ChunkMetadata, 'text' | 'chunkIndex'>): Promise<void> {
  const vectors = await embeddings.embedDocuments(chunks);

  const points = chunks.map((text, i) => ({
    id: uuidv4(),
    vector: vectors[i],
    payload: { ...metadata, text, chunkIndex: i } as ChunkMetadata,
  }));

  await client.upsert(COLLECTION, { wait: true, points });
}

export async function queryKB(text: string, filter?: { source: 'resume' | 'jd' | 'github' | 'certificate' | 'portfolio' }, topK = 5): Promise<ChunkMetadata[]> {
  const vector = await embeddings.embedQuery(text);

  const results = await client.search(COLLECTION, {
    vector,
    limit: topK,
    filter: filter ? { must: [{ key: 'source', match: { value: filter.source } }] } : undefined,
    with_payload: true,
  });

  return results.map((r) => r.payload as ChunkMetadata);
}

export async function queryKBMultiSource(text: string, sources: Array<'resume' | 'jd' | 'github' | 'certificate' | 'portfolio'>, topKPerSource = 5): Promise<ChunkMetadata[]> {
  const vector = await embeddings.embedQuery(text);

  const results = await client.search(COLLECTION, {
    vector,
    limit: topKPerSource * sources.length,
    filter: {
      should: sources.map((s) => ({ key: 'source', match: { value: s } })),
    },
    with_payload: true,
  });

  return results.map((r) => r.payload as ChunkMetadata);
}
