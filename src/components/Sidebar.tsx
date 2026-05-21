import React, { useState } from 'react';
import { Search, Globe, Plus, Trash2, Tag, Calendar, Database, CloudLightning } from 'lucide-react';
import type { Memory } from '../utils/mockData';
import { getDomain } from '../utils/search';

interface SidebarProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  selectedMemory: Memory | null;
  onAddMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'screenshot'>) => void;
  onDeleteMemory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  isSyncing: boolean;
}

// Pre-baked articles for capture simulator
const SIMULATED_PAGES = [
  {
    url: 'https://rust-lang.org/learn',
    title: 'Rust: Safe Systems Programming & Memory Management',
    tags: ['Rust', 'Systems-Programming', 'Performance'],
    content: 'Rust is a multi-paradigm, high-level, general-purpose programming language designed for performance and safety, especially safe concurrency. Rust is syntactically similar to C++, but can guarantee memory safety by using a borrow checker to validate references. It achieves memory safety without garbage collection.',
    textContent: 'Rust programming language for performance and safety. Syntactically similar to C++ but guarantees memory safety via borrow checker. No garbage collection.',
    entities: {
      topics: ['Borrow Checker', 'Memory Safety', 'Concurrency', 'Systems Programming'],
      people: ['Graydon Hoare'],
      organizations: ['Mozilla Research', 'Rust Foundation'],
      dates: ['2010', '2015']
    }
  },
  {
    url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    title: 'A Complete Guide to CSS Grid Layout',
    tags: ['CSS', 'Design', 'Web-Development'],
    content: 'CSS Grid Layout is the most powerful layout system available in CSS. It is a 2-dimensional system, meaning it can handle both columns and rows, unlike Flexbox which is largely a 1-dimensional system. You apply CSS rules both to a parent element (the Grid Container) and to its children.',
    textContent: 'CSS Grid Layout complete guide. Two-dimensional system handling both columns and rows. Apply styles to Grid Container and items. Layouts grid layout properties.',
    entities: {
      topics: ['CSS Grid', 'Flexbox', 'Responsive Design', 'Layouts'],
      people: ['Tab Atkins'],
      organizations: ['W3C'],
      dates: ['2017']
    }
  },
  {
    url: 'https://d3js.org/what-is-d3',
    title: 'D3.js: Visualizing Data with Dynamic Documents',
    tags: ['Data-Viz', 'D3', 'Javascript'],
    content: 'D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG, and CSS. D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components.',
    textContent: 'D3.js Data-Driven Documents. JavaScript library for data manipulation. Uses SVG, HTML5, CSS. Emphasizes web standards. Force directed layouts.',
    entities: {
      topics: ['SVG Graphics', 'Data Visualization', 'Force-Directed Graph', 'DOM Manipulation'],
      people: ['Mike Bostock'],
      organizations: ['Observable'],
      dates: ['2011']
    }
  },
  {
    url: 'https://pinecone.io/learn/vector-database/',
    title: 'What is a Vector Database? Semantic Search Core',
    tags: ['AI', 'Vector-DB', 'Search'],
    content: 'A vector database is a type of database that stores data as high-dimensional vectors, which are mathematical representations of features or attributes. Each vector has a certain number of dimensions, ranging from tens to thousands, depending on the complexity of the data. High-dimensional vector search enables semantic meaning match.',
    textContent: 'What is a Vector Database? Stores data as high-dimensional vectors. Vector representation of features. Enforces semantic searches using similarity metric.',
    entities: {
      topics: ['Vector Embeddings', 'Cosine Similarity', 'ANN Search', 'pgvector'],
      people: ['Shashank Khandelwal'],
      organizations: ['Pinecone', 'OpenAI'],
      dates: ['2023']
    }
  },
  {
    url: 'https://developer.chrome.com/docs/extensions/mv3/intro/',
    title: 'Chrome Extensions: Transitioning to Manifest V3',
    tags: ['Chrome-Ext', 'MV3', 'Javascript'],
    content: 'Manifest V3 represents one of the most significant shifts in the Chrome extensions platform since it launched. MV3 extensions are designed to be more secure, performant, and privacy-respecting by default, transitioning from persistent background pages to event-driven Service Workers.',
    textContent: 'Chrome Extensions Manifest V3 introduction. Secure, performant, privacy-preserving. Persistent background pages replaced with service workers.',
    entities: {
      topics: ['Service Workers', 'Manifest V3', 'Declarative Net Request', 'Chrome API'],
      people: ['Simeon Vincent'],
      organizations: ['Google Chrome Team'],
      dates: ['2020', '2024']
    }
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  memories,
  onSelectMemory,
  selectedMemory,
  onAddMemory,
  onDeleteMemory,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  selectedDomain,
  setSelectedDomain,
  isSyncing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [simIndex, setSimIndex] = useState(0);

  // Manual Form States
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');

  // Get unique tags and domains from all memories
  const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));
  const allDomains = Array.from(new Set(memories.map(m => getDomain(m.url))));

  const handleSimulateCapture = () => {
    const page = SIMULATED_PAGES[simIndex];
    onAddMemory({
      url: page.url,
      title: page.title,
      tags: page.tags,
      content: page.content,
      textContent: page.textContent,
      entities: page.entities,
      sm2: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString()
      }
    });

    // Cycle through simulation index
    setSimIndex((simIndex + 1) % SIMULATED_PAGES.length);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newTitle) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onAddMemory({
      url: newUrl,
      title: newTitle,
      tags: parsedTags.length > 0 ? parsedTags : ['Web'],
      content: `<p>${newContent || newTitle}</p>`,
      textContent: newContent || newTitle,
      entities: {
        topics: parsedTags,
        people: [],
        organizations: [],
        dates: [new Date().toLocaleDateString()]
      },
      sm2: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString()
      }
    });

    // Reset Form
    setNewUrl('');
    setNewTitle('');
    setNewTags('');
    setNewContent('');
    setShowAddForm(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="sidebar-container glass-panel flex flex-col h-full" style={{ width: '380px', flexShrink: 0, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner: Sync & App Info */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex-center text-white font-extrabold text-sm tracking-tighter">
            OR
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]" style={{ margin: 0 }}>ORMA</h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">Your Intelligent Memory</p>
          </div>
        </div>
        
        {/* Sync Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)]">
          {isSyncing ? (
            <>
              <CloudLightning size={12} className="text-[var(--color-secondary)] animate-pulse" />
              <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Syncing</span>
            </>
          ) : (
            <>
              <Database size={12} className="text-[var(--color-success)]" />
              <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Local DB Synced</span>
            </>
          )}
        </div>
      </div>

      {/* Simulator Actions */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-col gap-2">
        <button 
          onClick={handleSimulateCapture}
          className="btn btn-primary w-full text-xs font-semibold py-2 px-3 flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          One-Click Page Capture
        </button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-secondary w-full text-xs py-2 px-3 flex items-center justify-center"
        >
          {showAddForm ? 'Close Manual Saver' : 'Manual Save Form'}
        </button>

        {/* Manual Input Form */}
        {showAddForm && (
          <form onSubmit={handleManualSubmit} className="mt-3 p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-lg flex flex-col gap-2.5 animate-fade-in">
            <input 
              type="text" 
              placeholder="Page URL (e.g. https://google.com)" 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="text-xs w-full py-1.5 px-2"
              required
            />
            <input 
              type="text" 
              placeholder="Page Title" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="text-xs w-full py-1.5 px-2"
              required
            />
            <input 
              type="text" 
              placeholder="Tags (comma separated: AI, web)" 
              value={newTags}
              onChange={e => setNewTags(e.target.value)}
              className="text-xs w-full py-1.5 px-2"
            />
            <textarea 
              placeholder="Paste content snippet..." 
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
              className="text-xs w-full py-1.5 px-2 resize-none"
            />
            <button type="submit" className="btn btn-primary text-xs py-1 px-3 self-end">
              Save Memory
            </button>
          </form>
        )}
      </div>

      {/* Filters Area */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-col gap-3">
        {/* Text Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Semantic & Full-text search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        {/* Filter Badges: Domains & Tags */}
        <div className="flex flex-col gap-2">
          {/* Domain Dropdown Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Globe size={13} className="text-[var(--text-muted)]" />
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="bg-transparent border-none p-0 text-xs text-[var(--text-primary)] cursor-pointer focus:ring-0 w-full"
              style={{ paddingLeft: '2px' }}
            >
              <option value="">All Domains ({allDomains.length})</option>
              {allDomains.map(dom => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
          </div>

          {/* Tags List */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 max-h-[60px] overflow-y-auto pr-1">
              {allTags.map(tag => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                      isActive 
                        ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]' 
                        : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <Tag size={8} />
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Memory Stream Scroll list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold tracking-wider uppercase mb-1">
          <span>Captured Memories ({memories.length})</span>
        </div>
        
        {memories.length === 0 ? (
          <div className="flex-center flex-col gap-2 py-10 px-4 text-center">
            <Database size={24} className="text-[var(--text-muted)] opacity-30" />
            <p className="text-xs text-[var(--text-secondary)]">No memories saved yet.</p>
            <p className="text-[10px] text-[var(--text-muted)]">Click "One-Click Page Capture" to grab your first page!</p>
          </div>
        ) : (
          memories.map(memory => {
            const domain = getDomain(memory.url);
            const isSelected = selectedMemory?.id === memory.id;
            
            // Format nice relative or short date
            const reviewDate = new Date(memory.createdAt);
            const dateStr = reviewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return (
              <div 
                key={memory.id}
                onClick={() => onSelectMemory(memory)}
                className={`glass-card p-3 flex flex-col gap-2 relative group cursor-pointer border transition-all ${
                  isSelected 
                    ? 'border-[var(--color-primary)] bg-[rgba(139,92,246,0.08)] shadow-[var(--shadow-glow)]' 
                    : 'border-[var(--border-color)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                {/* Header (Favicon + Domain + Date) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                      alt=""
                      onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                      className="w-3.5 h-3.5 rounded bg-[rgba(255,255,255,0.1)] flex-shrink-0"
                    />
                    <span className="text-[10px] text-[var(--text-secondary)] font-semibold tracking-wide hover:underline">
                      {domain}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Calendar size={10} />
                      {dateStr}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMemory(memory.id);
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[rgba(255,255,255,0.03)]"
                      title="Delete Memory"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  {memory.title}
                </h3>

                {/* Snippet summary preview */}
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {memory.textContent}
                </p>

                {/* Tags bottom bar */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {memory.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.04)] text-[9px] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {memory.tags.length > 3 && (
                    <span className="text-[8px] text-[var(--text-muted)] font-bold self-center">
                      +{memory.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
