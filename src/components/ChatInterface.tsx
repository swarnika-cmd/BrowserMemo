import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal } from 'lucide-react';
import type { Memory } from '../utils/mockData';
import { streamRAGResponse } from '../utils/rag';
import type { ChatMessage } from '../utils/rag';

interface ChatInterfaceProps {
  memories: Memory[];
  onSelectMemoryById: (id: string) => void;
}

const PRESET_PROMPTS = [
  { text: 'Explain the SM-2 algorithm', icon: '🧠' },
  { text: 'What is the PARA method?', icon: '📂' },
  { text: 'What are attention mechanisms?', icon: '⚡' },
  { text: 'How does interpretability work?', icon: '🔍' }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  memories,
  onSelectMemoryById
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Hello! I am Smarana AI, your Intelligent Second Brain. I have semantic access to everything you have captured online. \n\nAsk me anything about your saved memories, or select one of the suggestion chips below to start!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const botMessageId = `msg-bot-${Date.now()}`;

    const newHistory: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toISOString()
      }
    ];

    setMessages(newHistory);
    setInputValue('');
    setIsGenerating(true);

    // Stream Bot Response
    streamRAGResponse(
      textToSend,
      memories,
      newHistory,
      (partialText, citations) => {
        // Token received: update bot message in history
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === botMessageId);
          if (index === -1) {
            return [
              ...prev,
              {
                id: botMessageId,
                sender: 'bot',
                text: partialText,
                timestamp: new Date().toISOString(),
                citations
              }
            ];
          } else {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              text: partialText,
              citations
            };
            return updated;
          }
        });
      },
      () => {
        // Finished streaming
        setIsGenerating(false);
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  // Render text and replace citations [1](id) with custom clickable elements
  const renderMessageText = (text: string) => {
    const citationRegex = /(\[\d+\]\([^)]+\))/g;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]\(([^)]+)\)/);
      if (match) {
        const num = match[1];
        const memId = match[2];
        return (
          <button
            key={index}
            onClick={() => onSelectMemoryById(memId)}
            className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[var(--border-color)] hover:bg-white hover:text-black text-white text-[10px] font-bold transition-all cursor-pointer align-baseline select-none"
            title="Click to view memory detail"
          >
            {num}
          </button>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      
      {/* Console Header */}
      <div 
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ backgroundColor: 'rgba(24, 24, 27, 0.4)' }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-white" />
          <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">RAG Chat Terminal</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium">
          <Sparkles size={12} className="text-[var(--text-secondary)]" />
          <span>Active Context: {memories.length} Memories</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${
                isBot ? 'self-start items-start' : 'self-end items-end'
              }`}
            >
              {/* Sender Tag */}
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
                {isBot ? 'Smarana AI' : 'User'}
              </span>

              {/* Message Bubble */}
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed border transition-all ${
                  isBot 
                    ? 'border-[var(--border-color)] text-[var(--text-secondary)] rounded-tl-none' 
                    : 'bg-white border-transparent text-black rounded-tr-none shadow-md'
                }`}
                style={{
                  backgroundColor: isBot ? 'rgba(24, 24, 27, 0.65)' : '#ffffff'
                }}
              >
                {renderMessageText(msg.text)}
              </div>

              {/* Citations Bottom Sheet (only for bot responses with sources) */}
              {isBot && msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                  {msg.citations.map((cit, idx) => (
                    <button
                      key={cit.id}
                      onClick={() => onSelectMemoryById(cit.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] hover:border-[rgba(255,255,255,0.15)] text-[9px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all font-medium"
                    >
                      <span className="w-1 h-1 rounded-full bg-white"></span>
                      [{idx + 1}] {cit.title.slice(0, 20)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {isGenerating && (
          <div className="self-start flex flex-col max-w-[80%] items-start">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
              Smarana AI
            </span>
            <div className="p-3 border border-[var(--border-color)] text-[var(--text-muted)] rounded-2xl rounded-tl-none flex items-center gap-1.5 py-2.5 px-4" style={{ backgroundColor: 'rgba(24, 24, 27, 0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Container */}
      {messages.length === 1 && !isGenerating && (
        <div className="px-6 pb-2 pt-1 flex flex-wrap gap-2 animate-fade-in">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] hover:border-[rgba(255,255,255,0.15)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-semibold"
            >
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Panel */}
      <div 
        className="p-6 border-t flex gap-2"
        style={{ 
          backgroundColor: 'rgba(24, 24, 27, 0.4)',
          borderColor: 'var(--border-color)'
        }}
      >
        <textarea
          placeholder="Ask a question about your knowledge graph (e.g. 'What is the SM-2 algorithm?')"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isGenerating}
          rows={1}
          className="flex-1 resize-none py-3 px-4 text-xs bg-[rgba(255,255,255,0.01)] border-[var(--border-color)] focus:bg-[rgba(255,255,255,0.03)] focus:border-white min-h-[42px] max-h-[120px]"
        />
        <button
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isGenerating}
          className={`btn btn-primary p-3 rounded-lg flex-shrink-0 ${
            (!inputValue.trim() || isGenerating) ? 'opacity-50 cursor-not-allowed shadow-none bg-zinc-800' : ''
          }`}
          style={{ width: '42px', height: '42px', padding: 0 }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
