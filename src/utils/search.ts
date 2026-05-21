import type { Memory } from './mockData';

// Extract domain from URL
export function getDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace('www.', '');
  } catch {
    return 'unknown.com';
  }
}

// Tokenize text into lowercase words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // filter out short words
}

// Compute term frequency for a list of tokens
function getTermFrequency(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

// Compute cosine similarity between two frequency vectors
function computeCosineSimilarity(vec1: Record<string, number>, vec2: Record<string, number>): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  allKeys.forEach(key => {
    const val1 = vec1[key] || 0;
    const val2 = vec2[key] || 0;
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export interface SearchOptions {
  query?: string;
  tags?: string[];
  domain?: string;
  startDate?: string;
  endDate?: string;
}

export interface SearchResult {
  memory: Memory;
  score: number;
}

/**
 * Perform hybrid semantic + keyword search in memory list.
 */
export function searchMemories(memories: Memory[], options: SearchOptions): SearchResult[] {
  const { query, tags, domain, startDate, endDate } = options;
  
  // 1. Filter memories
  let filtered = memories.filter(memory => {
    // Tag filter (match any if tags provided)
    if (tags && tags.length > 0) {
      const hasMatchingTag = tags.every(t => memory.tags.includes(t));
      if (!hasMatchingTag) return false;
    }

    // Domain filter
    if (domain) {
      const memDomain = getDomain(memory.url).toLowerCase();
      if (!memDomain.includes(domain.toLowerCase())) return false;
    }

    // Date filters
    const memTime = new Date(memory.createdAt).getTime();
    if (startDate) {
      const startTime = new Date(startDate).getTime();
      if (memTime < startTime) return false;
    }
    if (endDate) {
      const endTime = new Date(endDate).getTime();
      if (memTime > endTime) return false;
    }

    return true;
  });

  // 2. Score memories if query exists
  if (!query || query.trim() === '') {
    // If no query, rank by recency (score is based on timestamp)
    return filtered
      .map(mem => ({
        memory: mem,
        score: new Date(mem.createdAt).getTime()
      }))
      .sort((a, b) => b.score - a.score);
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return filtered.map(mem => ({ memory: mem, score: 1 })).sort((a, b) => b.memory.createdAt.localeCompare(a.memory.createdAt));
  }

  const queryTF = getTermFrequency(queryTokens);

  const results: SearchResult[] = filtered.map(memory => {
    // Tokenize fields
    const titleTokens = tokenize(memory.title);
    const contentTokens = tokenize(memory.textContent);
    const tagTokens = tokenize(memory.tags.join(' '));
    const entityTokens = tokenize([
      ...memory.entities.topics,
      ...memory.entities.people,
      ...memory.entities.organizations
    ].join(' '));

    // Calculate term frequencies with weights
    // Title is weighted highly (3x), Content (1x), Tags/Entities (2x)
    const docTF: Record<string, number> = {};
    
    titleTokens.forEach(t => { docTF[t] = (docTF[t] || 0) + 3; });
    contentTokens.forEach(t => { docTF[t] = (docTF[t] || 0) + 1; });
    tagTokens.forEach(t => { docTF[t] = (docTF[t] || 0) + 2; });
    entityTokens.forEach(t => { docTF[t] = (docTF[t] || 0) + 2; });

    // Vector Cosine Similarity (Semantic score simulation)
    const cosineSim = computeCosineSimilarity(queryTF, docTF);

    // Exact word keyword matches score (BM25-like)
    let keywordScore = 0;
    queryTokens.forEach(token => {
      // Direct substring search checks
      if (memory.title.toLowerCase().includes(token)) keywordScore += 5;
      if (memory.textContent.toLowerCase().includes(token)) keywordScore += 1;
      if (memory.tags.some(t => t.toLowerCase().includes(token))) keywordScore += 3;
    });
    const normalizedKeywordScore = Math.min(1, keywordScore / (queryTokens.length * 5));

    // Combine using Hybrid weights: 60% cosine (semantic), 40% keyword matches
    const hybridScore = 0.6 * cosineSim + 0.4 * normalizedKeywordScore;

    return {
      memory,
      score: hybridScore
    };
  });

  // Sort by score (descending), tiebreaker on recency
  return results.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.0001) {
      return b.memory.createdAt.localeCompare(a.memory.createdAt);
    }
    return b.score - a.score;
  });
}
