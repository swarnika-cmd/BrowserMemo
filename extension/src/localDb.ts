/**
 * Local database manager using IndexedDB.
 * Stores decrypted memories in the isolated extension origin.
 * Implements lightweight token-based full-text keyword ranking
 * and Reciprocal Rank Fusion (RRF) for hybrid search.
 */

const DB_NAME = 'smarana_local_db';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

export interface LocalMemory {
  id: string;
  title: string;
  url: string;
  textContent: string;
  createdAt: string;
  sm2: {
    interval: number;
    repetitions: number;
    easeFactor: number;
    nextReviewDate: string;
  };
}

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveLocalMemory(memory: LocalMemory): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(memory);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalMemory(id: string): Promise<LocalMemory | null> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLocalMemory(id: string): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllLocalMemories(): Promise<LocalMemory[]> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function clearLocalDb(): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clean and tokenize a string into lowercase terms.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\d]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 1); // ignore extremely short terms/stop words
}

export interface SearchHit {
  memory: LocalMemory;
  score: number;
}

/**
 * Lightweight client-side TF-IDF / keyword matching ranking.
 */
export async function keywordSearch(query: string): Promise<LocalMemory[]> {
  const terms = tokenize(query);
  if (terms.length === 0) {
    const all = await getAllLocalMemories();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const memories = await getAllLocalMemories();
  const hits: SearchHit[] = [];

  for (const memory of memories) {
    const titleTerms = tokenize(memory.title);
    const contentTerms = tokenize(memory.textContent);
    const urlTerms = tokenize(memory.url);

    let score = 0;

    for (const term of terms) {
      // 1. Matches in Title (highest weight)
      const titleMatches = titleTerms.filter(t => t.includes(term)).length;
      score += titleMatches * 10.0;

      // 2. Matches in URL
      const urlMatches = urlTerms.filter(t => t.includes(term)).length;
      score += urlMatches * 3.0;

      // 3. Matches in Content body
      const contentMatches = contentTerms.filter(t => t.includes(term)).length;
      score += contentMatches * 1.0;
    }

    if (score > 0) {
      hits.push({ memory, score });
    }
  }

  // Sort descending by keyword score
  return hits
    .sort((a, b) => b.score - a.score)
    .map(hit => hit.memory);
}

/**
 * Merges Vector similarity results and Local Keyword matches using Reciprocal Rank Fusion (RRF).
 * 
 * RRF Score = 1 / (60 + rank_vector) + 1 / (60 + rank_keyword)
 */
export function reciprocalRankFusion(
  vectorResults: LocalMemory[],
  keywordResults: LocalMemory[],
  kConst: number = 60
): LocalMemory[] {
  const scoreMap = new Map<string, { memory: LocalMemory; score: number }>();

  // Helper to map an item and compute score contributions
  const applyRank = (list: LocalMemory[], weight: number) => {
    list.forEach((item, index) => {
      const rank = index + 1; // 1-based rank
      const rrfContribution = 1.0 / (kConst + rank);

      const existing = scoreMap.get(item.id);
      if (existing) {
        existing.score += rrfContribution;
      } else {
        scoreMap.set(item.id, { memory: item, score: rrfContribution });
      }
    });
  };

  applyRank(vectorResults, 1.0);
  applyRank(keywordResults, 1.0);

  // Sort the fused results descending by RRF score
  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.memory);
}
