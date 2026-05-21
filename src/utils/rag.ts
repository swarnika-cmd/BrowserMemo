import type { Memory } from './mockData';
import { searchMemories } from './search';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citations?: { id: string; title: string; url: string }[];
}

/**
 * Pre-baked intelligent answers with citations for seed topics.
 */
const RESPONSES_DATABASE = [
  {
    keywords: ['attention', 'transformer', 'vaswani', 'deep learning', 'attention is all you need', 'attention mechanism'],
    answer: `Based on your saved research paper **Attention Is All You Need** [1](mem-1), the Google Brain team introduced the **Transformer** architecture. 

Unlike previous sequence transduction models that relied on Recurrent Neural Networks (RNNs) or CNNs, the Transformer is based *solely* on attention mechanisms. 

Key details:
* **Self-Attention**: Relates different positions of a single sequence to compute its representation [1](mem-1).
* **Parallelization**: By dispensing with recurrence, training can be parallelized, reducing compute time significantly.
* **BLEU Score**: It achieved a record 28.4 BLEU on English-to-German translation, beating previous records by over 2 BLEU [1](mem-1).`,
    memoryIds: ['mem-1']
  },
  {
    keywords: ['spaced repetition', 'sm-2', 'sm2', 'supermemo', 'wozniak', 'forgetting curve', 'interval'],
    answer: `According to your saved documentation on **The SM-2 Spaced Repetition Algorithm** [1](mem-2), developed by Piotr Wozniak in 1987:

The algorithm optimizes review intervals using three core variables:
1. **Repetitions (n)**: Consecutive successful recalls.
2. **Ease Factor (EF)**: Indicates how easily a card is remembered (starts at 2.5) [1](mem-2).
3. **Interval (I)**: Number of days to wait before the next review.

When you review a card, you rate it from 0 to 5. A rating of **3 or higher** (Forgot/Hard/Good/Easy) is a success, and the interval grows exponentially (e.g., 1 day, then 6, then multiplied by the Ease Factor) [1](mem-2). A rating **below 3** resets repetitions to 0 and the interval back to 1 day.`,
    memoryIds: ['mem-2']
  },
  {
    keywords: ['second brain', 'para', 'tiago forte', 'organization', 'productivity', 'forte labs'],
    answer: `Your saved article on **Building a Second Brain: The PARA Method** [1](mem-3) explains Tiago Forte's digital organization framework.

PARA organizes information based on active utility rather than topic categories:
1. **Projects**: Short-term tasks you are actively working on with a specific deadline (e.g., "Build Scribblit v0") [1](mem-3).
2. **Areas**: Long-term ongoing responsibilities (e.g., "Health", "Finances", "Coding Skills").
3. **Resources**: Topics of interest that might be useful later (e.g., "Deep Learning", "CSS Layouts") [1](mem-3).
4. **Archives**: Completed items from the other folders saved for reference.

This method shifts your browsing from passive bookmarking into active digital curation support for active projects.`,
    memoryIds: ['mem-3']
  },
  {
    keywords: ['interpretability', 'neural network', 'olah', 'convolutional', 'feature visualization', 'attribution'],
    answer: `Based on the paper **The Building Blocks of Interpretability** [1](mem-4) by Chris Olah and collaborators:

Interpretability in deep learning is built by combining two core techniques:
* **Feature Visualization**: Shows what a specific neuron is looking for.
* **Attribution**: Shows which parts of an input image triggered the output [1](mem-4).

They discovered that layers form a structured representation:
* **Lower layers** detect basic features: edges, textures, and lines [1](mem-4).
* **Middle layers** detect intermediate parts: shapes, assemblies, and patterns.
* **Higher layers** identify full semantic concepts (e.g., dog faces, wheels).`,
    memoryIds: ['mem-4']
  },
  {
    keywords: ['seven', 'magical number', 'miller', 'memory limit', 'capacity', 'working memory', 'chunking'],
    answer: `According to your saved psychology classic, **The Magical Number Seven, Plus or Minus Two** [1](mem-5) by George A. Miller (1956):

The human short-term working memory is limited to holding roughly **7 ± 2 items** (or "chunks") of information [1](mem-5).

To bypass this bottleneck, humans use a technique called **chunking** — grouping individual data points into larger, meaningful units (such as formatting phone numbers as 123-456-789 instead of a continuous sequence) [1](mem-5]. This allows us to hold significantly more information in active memory.`,
    memoryIds: ['mem-5']
  }
];

/**
 * Streams a simulated RAG response based on the query.
 */
export function streamRAGResponse(
  query: string,
  allMemories: Memory[],
  history: ChatMessage[],
  onToken: (token: string, currentCitations: { id: string; title: string; url: string }[]) => void,
  onDone: (fullText: string, finalCitations: { id: string; title: string; url: string }[]) => void
) {
  if (history.length > 0) {
    console.log(`Analyzing history context: ${history.length} turns active`);
  }
  const queryLower = query.toLowerCase().trim();
  
  // 1. Retrieve relevant memories
  const searchResults = searchMemories(allMemories, { query });
  const matchingResults = searchResults.filter(r => r.score > 0.15).slice(0, 3);
  
  let chosenResponse = '';
  let citationIds: string[] = [];

  // Try to find a pre-baked response matching query keywords
  const matchedPrebaked = RESPONSES_DATABASE.find(item =>
    item.keywords.some(keyword => queryLower.includes(keyword))
  );

  if (matchedPrebaked) {
    chosenResponse = matchedPrebaked.answer;
    citationIds = matchedPrebaked.memoryIds;
  } else if (matchingResults.length > 0) {
    // Dynamically construct a response using retrieved memories
    const primary = matchingResults[0].memory;
    const secondary = matchingResults[1]?.memory;
    
    citationIds = matchingResults.map(r => r.memory.id);
    
    chosenResponse = `I found a couple of memories in your Second Brain related to your query. 

First, **${primary.title}** [1](${primary.id}) mentions:
> "${primary.textContent.slice(0, 160)}..."

${secondary ? `Additionally, your memory **${secondary.title}** [2](${secondary.id}) refers to similar concepts. These connections suggest topics related to ${primary.tags.join(', ')}.` : ''}

How can I help you explore these documents further?`;
  } else {
    // General fallback when nothing matches
    chosenResponse = `I couldn't find any specific memories in your Second Brain matching **"${query}"**. 

However, you can try asking about topics you have already saved, such as:
* **Transformers & Attention** (e.g. *Attention Is All You Need* [1](mem-1))
* **Spaced Repetition & Learning** (e.g. *SM-2 Algorithm* [2](mem-2))
* **Note Organization** (e.g. *Building a Second Brain* [3](mem-3))
* **Interpretability in Deep Learning** (e.g. *Olah's Interpretability Blocks* [4](mem-4))
* **Cognitive Psychology** (e.g. *The Magical Number 7* [5](mem-5))

Would you like me to explain any of these topics, or would you like to capture a new page?`;
    citationIds = ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5'];
  }

  // Map citationIds to actual Memory objects
  const citations = citationIds
    .map(id => allMemories.find(m => m.id === id))
    .filter((m): m is Memory => m !== undefined)
    .map(m => ({
      id: m.id,
      title: m.title,
      url: m.url
    }));

  // Simulate token streaming
  const tokens = chosenResponse.split(/(\s+)/); // split by whitespace keeping spaces
  let currentIndex = 0;
  let accumulatedText = '';
  
  const timer = setInterval(() => {
    if (currentIndex < tokens.length) {
      const token = tokens[currentIndex];
      accumulatedText += token;
      onToken(accumulatedText, citations);
      currentIndex++;
    } else {
      clearInterval(timer);
      onDone(accumulatedText, citations);
    }
  }, 25); // ~40 tokens per second stream speed
}
