import type { SM2State } from './sm2';

export interface Memory {
  id: string;
  url: string;
  title: string;
  content: string;
  textContent: string;
  screenshot: string; // SVG URI
  tags: string[];
  entities: {
    topics: string[];
    people: string[];
    organizations: string[];
    dates: string[];
  };
  sm2: SM2State;
  createdAt: string;
  updatedAt: string;
}

// Generate a premium glowing abstract SVG thumbnail to act as a placeholder page screenshot
export function generateThumbnailSvg(title: string, tags: string[]): string {
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60) % 360;
  const shapeCount = 3 + (hash % 4);
  
  let shapes = '';
  for (let i = 0; i < shapeCount; i++) {
    const rx = 10 + ((hash * (i + 1)) % 60);
    const ry = 10 + ((hash * (i + 2)) % 60);
    const cx = 20 + ((hash * (i + 3)) % 160);
    const cy = 20 + ((hash * (i + 4)) % 100);
    const rotation = ((hash * (i + 5)) % 180);
    shapes += `<rect x="${cx}" y="${cy}" width="${rx}" height="${ry}" transform="rotate(${rotation} ${cx} ${cy})" fill="url(#grad2)" opacity="0.15" rx="4"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="100%" height="100%">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue1}, 70%, 15%)" />
          <stop offset="100%" stop-color="hsl(${hue2}, 60%, 8%)" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="hsl(${hue1}, 90%, 65%)" />
          <stop offset="100%" stop-color="hsl(${hue2}, 90%, 55%)" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      ${shapes}
      <circle cx="150" cy="40" r="30" fill="url(#grad2)" opacity="0.1" filter="url(#glow)" />
      <path d="M 20 80 Q 80 50 140 90 T 180 70" fill="none" stroke="url(#grad2)" stroke-width="1.5" opacity="0.3" />
      <text x="15" y="105" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="600" opacity="0.8">${tags[0] || 'Web'}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const oneDayAgo = new Date();
oneDayAgo.setDate(oneDayAgo.getDate() - 1);

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const initialMemories: Memory[] = [
  {
    id: 'mem-1',
    url: 'https://arxiv.org/abs/1706.03762',
    title: 'Attention Is All You Need — Transformer Architecture Paper',
    tags: ['AI', 'Transformers', 'Deep Learning'],
    screenshot: '', // to be populated
    entities: {
      topics: ['Self-Attention', 'Transformer', 'Sequence-to-Sequence', 'Neural Networks'],
      people: ['Vaswani', 'Shazeer', 'Parmar', 'Uszkoreit', 'Jones', 'Gomez', 'Kaiser', 'Polosukhin'],
      organizations: ['Google Brain', 'Google Research', 'University of Toronto'],
      dates: ['June 12, 2017']
    },
    sm2: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() - 3600000).toISOString() // Overdue by an hour
    },
    content: `
      <h3>Attention Is All You Need</h3>
      <p>The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the <strong>Transformer</strong>, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.</p>
      <p>Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.</p>
      <p>Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. It has been used successfully in a variety of tasks including reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations.</p>
    `,
    textContent: 'Attention Is All You Need. The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Self-attention relates different positions of a single sequence in order to compute a representation of the sequence. Google Brain, Google Research, Vaswani.',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString()
  },
  {
    id: 'mem-2',
    url: 'https://supermemo.guru/wiki/SuperMemo_1_vs_SuperMemo_2',
    title: 'The SM-2 Spaced Repetition Algorithm Explained',
    tags: ['Memory', 'Productivity', 'Algorithms'],
    screenshot: '',
    entities: {
      topics: ['Spaced Repetition', 'SM-2 Algorithm', 'SuperMemo', 'Active Recall', 'Forgetting Curve'],
      people: ['Piotr Wozniak'],
      organizations: ['SuperMemo World'],
      dates: ['1987', '1989']
    },
    sm2: {
      interval: 6,
      repetitions: 2,
      easeFactor: 2.6,
      nextReviewDate: new Date(Date.now() + 500000000).toISOString() // Safe in the future
    },
    content: `
      <h3>The SM-2 Algorithm</h3>
      <p>The SuperMemo-2 (SM-2) algorithm was developed by Piotr Wozniak in 1987. It is the mathematical core of most modern flashcard applications, including Anki and SuperMemo. The algorithm tracks the user's recall ability and calculates the optimal intervals for reviewing information to prevent forgetting while minimizing review overhead.</p>
      <p>SM-2 relies on 3 key state variables:
        <ul>
          <li><strong>Repetitions (n):</strong> The number of consecutive successful reviews.</li>
          <li><strong>Ease Factor (EF):</strong> A floating point coefficient measuring how easy the card is to remember. It starts at 2.5.</li>
          <li><strong>Interval (I):</strong> The wait time in days before the next review.</li>
        </ul>
      </p>
      <p>During review, the user rates their response from 0 to 5. If the score is 3 or higher (meaning correct recall), the repetition count increments, and the interval grows exponentially. If the score is below 3 (failure to recall), the repetition count is reset to 0, and the review interval is reset to 1 day.</p>
    `,
    textContent: 'The SM-2 Spaced Repetition Algorithm. Developed by Piotr Wozniak in 1987. It is the mathematical core of modern flashcard apps like Anki. Tracks repetitions, ease factor (starts at 2.5), and interval. User rates response 0 to 5. Score >= 3 means successful recall; interval grows. Score < 3 resets repetition count to 0 and interval to 1 day.',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString()
  },
  {
    id: 'mem-3',
    url: 'https://fortelabs.com/blog/basb/',
    title: 'Building a Second Brain: The PARA Method',
    tags: ['Productivity', 'Note-Taking', 'Knowledge'],
    screenshot: '',
    entities: {
      topics: ['Second Brain', 'PARA Method', 'Projects', 'Areas', 'Resources', 'Archives', 'Digital Organization'],
      people: ['Tiago Forte'],
      organizations: ['Forte Labs'],
      dates: ['2022']
    },
    sm2: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() - 7200000).toISOString() // Overdue by 2 hours
    },
    content: `
      <h3>Building a Second Brain (BASB)</h3>
      <p>Created by Tiago Forte, "Building a Second Brain" is a methodology for saving and systematically reminding yourself of the ideas, inspirations, insights, and connections we've gained through our experience. It relies on the <strong>PARA</strong> organizational system:</p>
      <p>
        <ol>
          <li><strong>Projects:</strong> Short-term efforts in your work or life that you're actively working on now (with a specific deadline/outcome).</li>
          <li><strong>Areas:</strong> Long-term responsibilities you want to manage over time (e.g. Health, Finances, Product Management).</li>
          <li><strong>Resources:</strong> Topics or interests that may be useful in the future (e.g. CSS layout, Coffee brewing, Machine learning).</li>
          <li><strong>Archives:</strong> Inactive items from the other three categories that you want to keep for reference but are no longer active.</li>
        </ol>
      </p>
      <p>The goal is to move from passive reading and bookmarking to active digital curation, ensuring your notes support your active projects directly.</p>
    `,
    textContent: 'Building a Second Brain by Tiago Forte. A methodology for saving and organizing digital knowledge. The PARA method divides notes into: Projects (deadlines), Areas (responsibilities), Resources (interests), and Archives (inactive). Shift from passive linking to active curation.',
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString()
  },
  {
    id: 'mem-4',
    url: 'https://distill.pub/2018/building-blocks/',
    title: 'The Building Blocks of Interpretability in Neural Networks',
    tags: ['AI', 'Explainability', 'Neural Networks'],
    screenshot: '',
    entities: {
      topics: ['Interpretability', 'Feature Visualization', 'Attribution', 'Spatial Activation', 'AI Safety'],
      people: ['Chris Olah', 'Arvind Satyanarayan', 'Ian Johnson', 'Shan Carter'],
      organizations: ['OpenAI', 'Google Brain'],
      dates: ['March 2018']
    },
    sm2: {
      interval: 12,
      repetitions: 3,
      easeFactor: 2.7,
      nextReviewDate: new Date(Date.now() + 1000000000).toISOString() // Far future
    },
    content: `
      <h3>Building Blocks of Interpretability</h3>
      <p>How do we understand what a neural network sees? By combining <strong>feature visualization</strong> (what is a neuron looking for?) and <strong>attribution</strong> (how does it affect the output?), we can explore how neural networks make decisions.</p>
      <p>Feature visualization allows us to see the internal representations that are learned. For example, lower layers of a convolutional network detect simple textures, edges, and colors. Middle layers detect shapes, patterns, and assemblies. High-level layers represent rich semantic objects like dog faces, buildings, or wheels.</p>
      <p>Attribution maps tell us which parts of an image were responsible for triggering a particular classification. Combining these techniques reveals the circuits inside neural networks, describing how representations are combined step-by-step.</p>
    `,
    textContent: 'Building Blocks of Interpretability. Explains neural networks via feature visualization and attribution. Lower layers detect edges; middle layers detect shapes; higher layers detect rich semantic objects (dog faces, wheels). Authored by Chris Olah, Arvind Satyanarayan. Distill, OpenAI, Google Brain.',
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString()
  },
  {
    id: 'mem-5',
    url: 'https://psychclassics.yorku.ca/Miller/',
    title: 'The Magical Number Seven, Plus or Minus Two',
    tags: ['Psychology', 'Memory', 'UX-Design'],
    screenshot: '',
    entities: {
      topics: ['Working Memory', 'Cognitive Capacity', 'Chunking', 'Information Theory', 'Psychological limits'],
      people: ['George A. Miller'],
      organizations: ['Harvard University', 'American Psychological Association'],
      dates: ['1956']
    },
    sm2: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() - 1800000).toISOString() // Overdue by 30 mins
    },
    content: `
      <h3>The Magical Number Seven, Plus or Minus Two</h3>
      <p>George A. Miller's classic 1956 paper, "The Magical Number Seven, Plus or Minus Two: Some Limits on Our Capacity for Processing Information", is one of the most highly cited papers in psychology. It argues that the human working memory capacity can hold roughly <strong>7 ± 2 chunks</strong> of information at one time.</p>
      <p>Miller introduced the concept of <strong>chunking</strong> — organizing individual items of information into meaningful groups. By chunking numbers, letters, or words (e.g. grouping ten digits "0123456789" into a phone format "012-345-6789"), humans can bypass immediate recall limits and process much larger quantities of information.</p>
    `,
    textContent: 'The Magical Number Seven, Plus or Minus Two: Some Limits on Our Capacity for Processing Information. Published by George A. Miller in 1956. Human working memory capacity is about 7 plus or minus 2 chunks. Chunking groups individual pieces of data into meaningful units to bypass recall limits. Harvard University.',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString()
  }
];

// Initialize screenshot SVGs
initialMemories.forEach(mem => {
  mem.screenshot = generateThumbnailSvg(mem.title, mem.tags);
});
