import React, { useState } from 'react';
import type { Memory } from '../utils/mockData';
import { getDomain } from '../utils/search';
import { CheckCircle, Award, Flame, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface SpacedRepetitionProps {
  dueMemories: Memory[];
  onReviewMemory: (id: string, rating: number) => void;
  streak: number;
  completedCount: number;
}

export const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({
  dueMemories,
  onReviewMemory,
  streak,
  completedCount
}) => {
  const [reveal, setReveal] = useState(false);
  const [animClass, setAnimClass] = useState('');

  const currentCard = dueMemories[0];

  const handleRate = (rating: number) => {
    if (!currentCard) return;

    // Trigger exit animation
    setAnimClass('slide-out');
    
    setTimeout(() => {
      onReviewMemory(currentCard.id, rating);
      setReveal(false);
      setAnimClass('slide-in');
      
      // Clean up enter animation
      setTimeout(() => {
        setAnimClass('');
      }, 300);
    }, 300);
  };

  const getIntervalLabel = (memory: Memory, rating: number) => {
    const { interval, repetitions, easeFactor } = memory.sm2;
    if (rating < 3) return '1d';
    if (repetitions === 0) return '1d';
    if (repetitions === 1) return '6d';
    return `${Math.ceil(interval * (easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))))}d`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#030406] h-full overflow-y-auto">
      
      {/* Top Banner Stats */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between glass-panel p-4 shadow-lg bg-[rgba(13,16,27,0.4)]">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[var(--color-primary)]" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Session</h4>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {dueMemories.length} due cards remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Completed counter */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Reviewed</span>
            <span className="text-sm font-bold text-[var(--color-secondary)]">{completedCount} cards</span>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]">
            <Flame className="text-[var(--color-warning)] fill-[var(--color-warning)]" size={16} />
            <div>
              <span className="text-[9px] uppercase font-bold text-[var(--color-warning)] block leading-none">Streak</span>
              <span className="text-xs font-black text-[var(--text-primary)] leading-none">{streak} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      {currentCard ? (
        <div className={`w-full max-w-lg relative flex flex-col gap-6 transition-all duration-300 ${animClass}`} style={{ minHeight: '380px' }}>
          
          {/* Flashcard Frame */}
          <div className={`glass-panel p-6 shadow-xl border-l-4 transition-all duration-500 bg-[rgba(16,20,35,0.7)] flex flex-col justify-between ${
            reveal 
              ? 'border-l-[var(--color-primary)]' 
              : 'border-l-[var(--color-secondary)]'
          }`} style={{ minHeight: '300px' }}>
            
            <div>
              {/* Card Meta Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"></span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wide uppercase">
                    {getDomain(currentCard.url)}
                  </span>
                </div>
                <div className="text-[9px] font-semibold text-[var(--text-muted)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                  Ease: {currentCard.sm2.easeFactor.toFixed(2)}x
                </div>
              </div>

              {/* Title (Front) */}
              <h2 className="text-lg font-bold text-[var(--text-primary)] leading-snug mb-3">
                {currentCard.title}
              </h2>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-5">
                {currentCard.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[10px] text-[var(--text-secondary)]">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content Preview / Back of the Card */}
              {reveal ? (
                <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-lg text-xs leading-relaxed text-[var(--text-secondary)] animate-fade-in max-h-[160px] overflow-y-auto">
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentCard.content }} 
                    className="prose prose-invert"
                  />
                  {/* Extracted Entities */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Key Entities Detected:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.entities.topics.map(topic => (
                        <span key={topic} className="px-1.5 py-0.2 rounded bg-[var(--color-primary-glow)] text-[var(--color-primary)] text-[9px] font-medium border border-[rgba(139,92,246,0.15)]">
                          {topic}
                        </span>
                      ))}
                      {currentCard.entities.people.map(person => (
                        <span key={person} className="px-1.5 py-0.2 rounded bg-[rgba(6,182,212,0.1)] text-[var(--color-secondary)] text-[9px] font-medium border border-[rgba(6,182,212,0.15)]">
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-[var(--border-color)] rounded-lg bg-[rgba(255,255,255,0.01)]">
                  <BookOpen size={28} className="text-[var(--text-muted)] opacity-35 mb-2" />
                  <p className="text-xs text-[var(--text-muted)] font-medium">Read the title and recall the details in your memory.</p>
                </div>
              )}
            </div>

            {/* Reveal Button */}
            {!reveal && (
              <button 
                onClick={() => setReveal(true)}
                className="btn btn-primary w-full mt-6 text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5"
              >
                Reveal Memory Summary
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* SM-2 Recall Controls (Rating) */}
          {reveal && (
            <div className="grid grid-cols-4 gap-2.5 animate-fade-in">
              <button 
                onClick={() => handleRate(1)}
                className="btn py-3 px-1 border border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.08)] hover:bg-[rgba(244,63,94,0.2)] text-[var(--color-danger)] font-bold text-xs rounded-lg flex flex-col gap-1 items-center"
              >
                <span className="text-[14px]">😫</span>
                <span>Forgot</span>
                <span className="text-[9px] font-medium text-[rgba(244,63,94,0.6)]">Next: {getIntervalLabel(currentCard, 1)}</span>
              </button>
              
              <button 
                onClick={() => handleRate(3)}
                className="btn py-3 px-1 border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] hover:bg-[rgba(245,158,11,0.2)] text-[var(--color-warning)] font-bold text-xs rounded-lg flex flex-col gap-1 items-center"
              >
                <span className="text-[14px]">🤨</span>
                <span>Hard</span>
                <span className="text-[9px] font-medium text-[rgba(245,158,11,0.6)]">Next: {getIntervalLabel(currentCard, 3)}</span>
              </button>
              
              <button 
                onClick={() => handleRate(4)}
                className="btn py-3 px-1 border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] hover:bg-[rgba(59,130,246,0.2)] text-blue-400 font-bold text-xs rounded-lg flex flex-col gap-1 items-center"
              >
                <span className="text-[14px]">🙂</span>
                <span>Good</span>
                <span className="text-[9px] font-medium text-[rgba(59,130,246,0.6)]">Next: {getIntervalLabel(currentCard, 4)}</span>
              </button>
              
              <button 
                onClick={() => handleRate(5)}
                className="btn py-3 px-1 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] hover:bg-[rgba(16,185,129,0.2)] text-[var(--color-success)] font-bold text-xs rounded-lg flex flex-col gap-1 items-center"
              >
                <span className="text-[14px]">😎</span>
                <span>Easy</span>
                <span className="text-[9px] font-medium text-[rgba(16,185,129,0.6)]">Next: {getIntervalLabel(currentCard, 5)}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Completed Panel */
        <div className="w-full max-w-lg glass-panel p-8 text-center flex flex-col items-center justify-center gap-5 shadow-2xl bg-[rgba(13,16,27,0.7)] border-t-2 border-t-[var(--color-success)] animate-fade-in" style={{ minHeight: '380px' }}>
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border border-[rgba(16,185,129,0.2)] flex-center text-[var(--color-success)]">
            <CheckCircle size={32} />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">All Caught Up!</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
              You've cleared your spaced repetition queue for today. The SM-2 engine has scheduled your memories for future review intervals based on your historical recall quality.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] italic font-medium px-4 py-2 border border-dashed border-[var(--border-color)] rounded-lg bg-[rgba(255,255,255,0.01)] max-w-sm">
            <Sparkles size={14} className="text-[var(--color-warning)] flex-shrink-0" />
            <span>"Memory is the mother of all wisdom." — Aeschylus</span>
          </div>

          {/* Quick Stats Panel */}
          <div className="w-full grid grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Streak Active</span>
              <span className="text-base font-extrabold text-[var(--color-warning)] flex-center gap-1.5 mt-1">
                <Flame size={16} className="fill-[var(--color-warning)]" />
                {streak} Days
              </span>
            </div>
            <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Retention Rate</span>
              <span className="text-base font-extrabold text-[var(--color-secondary)] flex-center gap-1.5 mt-1">
                <Award size={16} />
                92%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slide transitions stylesheet */}
      <style>{`
        @keyframes slideOut {
          0% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
          100% { transform: scale(0.95) translateY(-10px); opacity: 0; filter: blur(4px); }
        }
        @keyframes slideIn {
          0% { transform: scale(0.95) translateY(10px); opacity: 0; filter: blur(4px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
        .slide-out {
          animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

    </div>
  );
};
