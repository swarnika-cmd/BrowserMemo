import { useState, useEffect } from 'react';
import { initialMemories, generateThumbnailSvg } from './utils/mockData';
import type { Memory } from './utils/mockData';
import { searchMemories } from './utils/search';
import { calculateSM2 } from './utils/sm2';
import { Sidebar } from './components/Sidebar';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { SpacedRepetition } from './components/SpacedRepetition';
import { ChatInterface } from './components/ChatInterface';
import { MemoryDetail } from './components/MemoryDetail';
import { StatsPanel } from './components/StatsPanel';
import { LandingPage } from './components/LandingPage';
import { Network, MessageSquare, Brain, LayoutDashboard, Flame } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: 'wsp-1', name: 'Personal Brain', role: 'Owner' },
  { id: 'wsp-2', name: 'AI Research Hub', role: 'Editor' },
  { id: 'wsp-3', name: 'Tech-Newsletter Drafts', role: 'Viewer' }
];

function App() {
  // 1. Core State
  const [showDashboard, setShowDashboard] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('scribblit_theme') as 'dark' | 'light') || 'dark';
  });

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'chat' | 'review' | 'stats'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  
  // Learning & Streaks state
  const [streak, setStreak] = useState(3);
  const [completedCount, setCompletedCount] = useState(4);
  const [lastReviewDate, setLastReviewDate] = useState<string>('');

  // Sync animation simulation
  const [isSyncing, setIsSyncing] = useState(false);

  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = useState('Personal Brain');

  // Sync theme with DOM class
  useEffect(() => {
    localStorage.setItem('scribblit_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const getAndMigrate = (newKey: string, oldKey: string): string | null => {
      const newVal = localStorage.getItem(newKey);
      if (newVal) return newVal;
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal) {
        localStorage.setItem(newKey, oldVal);
        localStorage.removeItem(oldKey);
        return oldVal;
      }
      return null;
    };

    // 1. Memories loading
    const cachedMemories = getAndMigrate('surata_memories', 'orma_memories');
    if (cachedMemories) {
      try {
        setMemories(JSON.parse(cachedMemories));
      } catch {
        setMemories(initialMemories);
      }
    } else {
      // Seed default memories on first run
      setMemories(initialMemories);
      localStorage.setItem('surata_memories', JSON.stringify(initialMemories));
    }

    // 2. Streak loading
    const cachedStreak = getAndMigrate('surata_streak', 'orma_streak');
    if (cachedStreak) setStreak(parseInt(cachedStreak));

    // 3. Completed counts loading
    const cachedCompleted = getAndMigrate('surata_completed_count', 'orma_completed_count');
    if (cachedCompleted) setCompletedCount(parseInt(cachedCompleted));

    // 4. Last review date loading
    const cachedDate = getAndMigrate('surata_last_review_date', 'orma_last_review_date');
    if (cachedDate) setLastReviewDate(cachedDate);

    // 5. Workspaces loading
    const cachedWorkspaces = getAndMigrate('surata_workspaces', 'orma_workspaces');
    if (cachedWorkspaces) {
      try {
        setWorkspaces(JSON.parse(cachedWorkspaces));
      } catch {
        setWorkspaces(DEFAULT_WORKSPACES);
      }
    }
    const cachedCurrentWorkspace = getAndMigrate('surata_current_workspace', 'orma_current_workspace');
    if (cachedCurrentWorkspace) setCurrentWorkspace(cachedCurrentWorkspace);
  }, []);

  // Save memories to LocalStorage on updates
  const saveMemories = (updatedList: Memory[]) => {
    setMemories(updatedList);
    localStorage.setItem('surata_memories', JSON.stringify(updatedList));
    
    // Simulate real-time sync trigger (WebSocket sync visual)
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  // 2. Memory Actions
  const handleAddMemory = (newMem: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'screenshot'>) => {
    const memoryId = `mem-${Date.now()}`;
    const fullMemory: Memory = {
      ...newMem,
      id: memoryId,
      screenshot: generateThumbnailSvg(newMem.title, newMem.tags),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Assign active workspace tag to memory metadata
    const metaMemory = {
      ...fullMemory,
      entities: {
        ...fullMemory.entities,
        organizations: [...fullMemory.entities.organizations, currentWorkspace]
      }
    };

    saveMemories([metaMemory, ...memories]);
    setSelectedMemory(metaMemory);
  };

  const handleSaveNoteAndLaunch = (title: string, content: string, tags: string[]) => {
    handleAddMemory({
      title,
      content: `<p>${content}</p>`,
      textContent: content,
      tags,
      url: '',
      entities: {
        topics: tags,
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
    setShowDashboard(true);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    saveMemories(updated);
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleReviewMemory = (id: string, rating: number) => {
    const card = memories.find(m => m.id === id);
    if (!card) return;

    const newSm2 = calculateSM2(card.sm2, rating);
    const updatedCard = {
      ...card,
      sm2: newSm2,
      updatedAt: new Date().toISOString()
    };

    const updatedMemories = memories.map(m => m.id === id ? updatedCard : m);
    saveMemories(updatedMemories);

    // Update Streak and Completed Counts
    const todayStr = new Date().toDateString();
    let newStreak = streak;
    let newCompleted = completedCount + 1;

    if (lastReviewDate !== todayStr) {
      // Completed review first time today
      newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('surata_streak', newStreak.toString());
      
      setLastReviewDate(todayStr);
      localStorage.setItem('surata_last_review_date', todayStr);
    }

    setCompletedCount(newCompleted);
    localStorage.setItem('surata_completed_count', newCompleted.toString());
  };

  // Add Collaborative Workspace
  const handleAddWorkspace = (name: string) => {
    const newWsp: Workspace = {
      id: `wsp-${Date.now()}`,
      name,
      role: 'Owner'
    };
    const updated = [...workspaces, newWsp];
    setWorkspaces(updated);
    localStorage.setItem('surata_workspaces', JSON.stringify(updated));
    setCurrentWorkspace(name);
    localStorage.setItem('surata_current_workspace', name);
  };

  // Select memory by details click
  const handleSelectMemoryById = (id: string) => {
    const card = memories.find(m => m.id === id);
    if (card) {
      setSelectedMemory(card);
    }
  };

  // 3. Search & Filter Pipelines
  // First, filter by current workspace (using custom entities tag to represent workspace division)
  const workspaceMemories = memories.filter(m => {
    if (currentWorkspace === 'Personal Brain') {
      // Show memories that don't belong to other team workspaces
      const hasCoLabTag = m.entities.organizations.some(org => org === 'AI Research Hub' || org === 'Tech-Newsletter Drafts');
      return !hasCoLabTag;
    }
    // For collaborative workspaces, show memories tagged with that workspace
    return m.entities.organizations.includes(currentWorkspace);
  });

  const searchResults = searchMemories(workspaceMemories, {
    query: searchQuery,
    tags: selectedTags,
    domain: selectedDomain
  });

  const filteredMemories = searchResults.map(r => r.memory);

  // Compute Spaced Repetition Due Queue
  const now = new Date();
  const dueMemories = workspaceMemories.filter(m => {
    return new Date(m.sm2.nextReviewDate) <= now;
  });

  if (!showDashboard) {
    return (
      <LandingPage 
        onLaunchApp={() => setShowDashboard(true)}
        onSaveNoteAndLaunch={handleSaveNoteAndLaunch}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      
      {/* Sidebar - Captures, search and memory stream */}
      <Sidebar 
        memories={filteredMemories}
        onSelectMemory={setSelectedMemory}
        selectedMemory={selectedMemory}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        isSyncing={isSyncing}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Navigation Header */}
        <div 
          className="h-14 border-b flex items-center justify-between px-6 flex-shrink-0 z-20"
          style={{ 
            backgroundColor: 'var(--bg-panel)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight border transition-all ${
                activeTab === 'graph'
                  ? 'text-white shadow-sm'
                  : 'bg-transparent border-transparent hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'graph' ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: activeTab === 'graph' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'graph' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Network size={14} className={activeTab === 'graph' ? 'text-white' : ''} />
              Knowledge Graph
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight border transition-all ${
                activeTab === 'chat'
                  ? 'text-white shadow-sm'
                  : 'bg-transparent border-transparent hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'chat' ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: activeTab === 'chat' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'chat' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <MessageSquare size={14} />
              RAG Chat
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight border transition-all relative ${
                activeTab === 'review'
                  ? 'text-white shadow-sm'
                  : 'bg-transparent border-transparent hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'review' ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: activeTab === 'review' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'review' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Brain size={14} />
              Review Queue
              {dueMemories.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex-center animate-pulse"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                >
                  {dueMemories.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight border transition-all ${
                activeTab === 'stats'
                  ? 'text-white shadow-sm'
                  : 'bg-transparent border-transparent hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'stats' ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: activeTab === 'stats' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'stats' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <LayoutDashboard size={14} />
              Workspace Dashboard
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            {/* Active Workspace Label */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}></span>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wide">
                {currentWorkspace}
              </span>
            </div>

            {/* Streak Label */}
            <div className="flex items-center gap-1">
              <Flame style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} size={15} />
              <span className="text-xs font-extrabold text-[var(--text-primary)]">{streak}d Streak</span>
            </div>

            {/* Exit to Home */}
            <button
              onClick={() => setShowDashboard(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              Exit to Home
            </button>
          </div>
        </div>

        {/* View Routing Body */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'graph' && (
            <KnowledgeGraph 
              memories={filteredMemories} 
              onSelectMemory={setSelectedMemory} 
              selectedMemory={selectedMemory} 
            />
          )}

          {activeTab === 'chat' && (
            <ChatInterface 
              memories={workspaceMemories}
              onSelectMemoryById={handleSelectMemoryById}
            />
          )}

          {activeTab === 'review' && (
            <SpacedRepetition 
              dueMemories={dueMemories}
              onReviewMemory={handleReviewMemory}
              streak={streak}
              completedCount={completedCount}
            />
          )}

          {activeTab === 'stats' && (
            <StatsPanel 
              memories={workspaceMemories}
              dueCount={dueMemories.length}
              completedCount={completedCount}
              streak={streak}
              currentWorkspace={currentWorkspace}
              setCurrentWorkspace={(wsp) => {
                setCurrentWorkspace(wsp);
                localStorage.setItem('surata_current_workspace', wsp);
              }}
              workspaces={workspaces}
              onAddWorkspace={handleAddWorkspace}
            />
          )}
        </div>

        {/* Floating Detail Sheet Pane (Slide out) */}
        <MemoryDetail 
          memory={selectedMemory} 
          onClose={() => setSelectedMemory(null)} 
        />

      </div>
    </div>
  );
}

export default App;
