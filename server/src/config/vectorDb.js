const { ChromaClient } = require('chromadb');

const COLLECTION_NAME = 'job_roles';

let client = null;
let collection = null;

async function getCollection() {
  if (collection) return collection;

  const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
  client = new ChromaClient({ path: chromaUrl });

  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { description: 'Job role embeddings for semantic matching' },
  });

  return collection;
}

async function upsert(ids, embeddings, documents, metadatas) {
  try {
    const col = await getCollection();
    await col.upsert({ ids, embeddings, documents, metadatas });
  } catch (err) {
    console.warn('Vector DB upsert failed (Chroma offline?):', err.message);
  }
}

async function query(embedding, nResults = 5, where) {
  try {
    const col = await getCollection();
    const result = await col.query({
      queryEmbeddings: [embedding],
      nResults,
      where,
    });
    return result;
  } catch (err) {
    console.warn('Vector DB query failed (Chroma offline?):', err.message);
    return { documents: [], metadatas: [], distances: [] };
  }
}

module.exports = { getCollection, upsert, query, COLLECTION_NAME };
