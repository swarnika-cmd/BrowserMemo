import React, { useState } from 'react';
import type { Memory } from '../utils/mockData';
import { getDomain } from '../utils/search';
import { X, ExternalLink, Calendar, Key, Tag, Code } from 'lucide-react';

interface MemoryDetailProps {
  memory: Memory | null;
  onClose: () => void;
}

export const MemoryDetail: React.FC<MemoryDetailProps> = ({
  memory,
  onClose
}) => {
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  if (!memory) return null;

  const domain = getDomain(memory.url);

  // Generate a mock 1536-dimension float array to simulate OpenAI text-embedding-3-small
  const generateMockEmbedding = (id: string): number[] => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockArray: number[] = [];
    // Fill first 10 items for display readability
    for (let i = 0; i < 8; i++) {
      mockArray.push(parseFloat(Math.sin(seed + i).toFixed(5)));
    }
    return mockArray;
  };

  // Construct the exact v2 PostgreSQL Database Model Representation
  const pgvectorRow = {
    id: memory.id,
    user_id: "usr-49f2b8-92c2",
    workspace_id: "wsp-default-001",
    url: memory.url,
    title: memory.title,
    content: memory.content,
    text_content: memory.textContent,
    tags: memory.tags,
    extracted_entities: memory.entities,
    embedding_dim: 1536,
    embedding_preview: [...generateMockEmbedding(memory.id), '... 1528 more dimensions'],
    sm2_state: {
      interval: memory.sm2.interval,
      repetitions: memory.sm2.repetitions,
      ease_factor: memory.sm2.easeFactor,
      next_review_date: memory.sm2.nextReviewDate
    },
    created_at: memory.createdAt,
    updated_at: memory.updatedAt
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] bg-[rgba(10,12,22,0.95)] border-l border-[var(--border-color)] shadow-2xl z-30 flex flex-col animate-slide-in-right backdrop-filter backdrop-blur-md">
      
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[rgba(13,16,27,0.4)]">
        <div className="flex items-center gap-2">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
            className="w-4 h-4 rounded"
          />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{domain}</span>
        </div>
        <button 
          onClick={onClose}
          className="btn btn-ghost p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable details */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        
        {/* Screenshot preview */}
        <div className="w-full h-[140px] rounded-lg overflow-hidden border border-[var(--border-color)] bg-zinc-950 relative group">
          <img 
            src={memory.screenshot} 
            alt="Page capture thumbnail" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
            <a 
              href={memory.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] text-white flex items-center gap-1 hover:underline font-semibold pointer-events-auto"
            >
              <ExternalLink size={10} />
              Visit Original Link
            </a>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-base font-bold text-white leading-snug">
            {memory.title}
          </h2>
          <a 
            href={memory.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:underline mt-1 block truncate"
          >
            {memory.url}
          </a>
        </div>

        {/* Content text Summary */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Memory Summary</span>
          <div className="p-3.5 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg text-xs leading-relaxed text-[var(--text-secondary)]">
            <div 
              dangerouslySetInnerHTML={{ __html: memory.content }} 
              className="prose prose-sm prose-invert"
            />
          </div>
        </div>

        {/* Extracted Entities Details */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Auto-Extracted Key Entities</span>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Topics */}
            <div className="p-2.5 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1.5 flex items-center gap-1">
                <Tag size={10} className="text-[var(--color-primary)]" />
                Topics
              </span>
              <div className="flex flex-wrap gap-1">
                {memory.entities.topics.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[9px] text-[var(--text-secondary)]">{t}</span>
                ))}
                {memory.entities.topics.length === 0 && <span className="text-[9px] text-[var(--text-muted)]">None found</span>}
              </div>
            </div>

            {/* People & Entities */}
            <div className="p-2.5 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1.5 flex items-center gap-1">
                <Key size={10} className="text-[var(--color-secondary)]" />
                Key People
              </span>
              <div className="flex flex-wrap gap-1">
                {memory.entities.people.map(p => (
                  <span key={p} className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[9px] text-[var(--text-secondary)]">{p}</span>
                ))}
                {memory.entities.people.length === 0 && <span className="text-[9px] text-[var(--text-muted)]">None found</span>}
              </div>
            </div>

            {/* Organizations */}
            <div className="p-2.5 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg col-span-2">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">Organizations & Sources</span>
              <div className="flex flex-wrap gap-1">
                {memory.entities.organizations.map(org => (
                  <span key={org} className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[9px] text-[var(--text-secondary)]">{org}</span>
                ))}
                {memory.entities.organizations.length === 0 && <span className="text-[9px] text-[var(--text-muted)]">None found</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SM-2 Review Settings */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">SM-2 Spaced Repetition State</span>
          <div className="p-3 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.03)]">
              <span className="text-[var(--text-secondary)] font-medium">Repetitions:</span>
              <span className="text-white font-semibold">{memory.sm2.repetitions} times</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.03)]">
              <span className="text-[var(--text-secondary)] font-medium">Interval:</span>
              <span className="text-white font-semibold">{memory.sm2.interval} days</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.03)]">
              <span className="text-[var(--text-secondary)] font-medium">Ease Factor (Difficulty):</span>
              <span className="text-white font-semibold">{memory.sm2.easeFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-medium">Next Scheduled Review:</span>
              <span className="text-[var(--color-secondary)] font-bold flex items-center gap-1">
                <Calendar size={12} />
                {new Date(memory.sm2.nextReviewDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable pgvector JSON Inspector */}
        <div className="border border-[var(--border-color)] rounded-lg overflow-hidden mt-2">
          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="w-full p-3 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] flex items-center justify-between text-left text-xs font-semibold text-[var(--text-secondary)] border-none cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Code size={14} className="text-[var(--color-primary)]" />
              Inspect pgvector Database Row
            </span>
            <span className="text-[9px] font-bold bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] px-1.5 py-0.5 rounded uppercase">
              {showJsonInspector ? 'Hide' : 'Show'}
            </span>
          </button>
          {showJsonInspector && (
            <div className="p-4 bg-zinc-950 font-mono text-[9px] text-[var(--color-secondary)] overflow-x-auto border-t border-[var(--border-color)] max-h-[220px] leading-relaxed">
              <pre>{JSON.stringify(pgvectorRow, null, 2)}</pre>
            </div>
          )}
        </div>

      </div>

      {styleTag}
    </div>
  );
};

// slide in keyframes
const styleTag = (
  <style>{`
    @keyframes slideInRight {
      0% { transform: translateX(100%); }
      100% { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `}</style>
);
