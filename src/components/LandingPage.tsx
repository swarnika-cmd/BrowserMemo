import React, { useState } from 'react';
import { 
  FileText, ChevronDown, Underline, Bold, Italic, 
  Strikethrough, List, AlignCenter, Moon, Sun, Shield, Scale, 
  XCircle, Sparkles, Save, Pencil, Compass, 
  Zap, ArrowRight, Check, Sparkle
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onSaveNoteAndLaunch: (title: string, content: string, tags: string[]) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onSaveNoteAndLaunch,
  theme,
  setTheme
}) => {
  // Hero toolbar interactive states
  const [heroFont, setHeroFont] = useState<'sans' | 'serif' | 'display'>('sans');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [heroStyleDropdown, setHeroStyleDropdown] = useState(false);

  // Mock Editor interactive states
  const [editorText, setEditorText] = useState(
    "Smarana allows me to write down thoughts instantly, organize them with smart tags, and view connections in a Knowledge Graph. Connecting ideas helps me gain clarity and never lose inspiration."
  );
  const [editorFont, setEditorFont] = useState<'sans' | 'serif' | 'display'>('sans');
  const [editorBold, setEditorBold] = useState(false);
  const [editorItalic, setEditorItalic] = useState(false);
  const [editorUnderline, setEditorUnderline] = useState(false);
  const [editorAlign, setEditorAlign] = useState<'left' | 'center'>('left');
  
  // AI summary states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string[] | null>(null);



  const handleAiSummary = () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setAiSummaryResult(null);

    // Simulate AI model processing time
    setTimeout(() => {
      setIsSummarizing(false);
      setAiSummaryResult([
        "Instant notes capture ensures thoughts are preserved in flow.",
        "Interactive tagging enables structural organization.",
        "Knowledge mapping helps identify semantic connections easily."
      ]);
    }, 1500);
  };

  const handleSaveMockNote = () => {
    // Generate a title based on the first few words
    const titleWords = editorText.split(' ').slice(0, 5).join(' ');
    const title = titleWords.length > 3 ? `${titleWords}...` : "Smarana Quick Capture";
    const tags = ['Intro', 'Demo', 'Capture'];
    onSaveNoteAndLaunch(title, editorText, tags);
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-background text-foreground hero-mesh-gradient font-sans">
      
      {/* Sticky Header Nav */}
      <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl rounded-2xl bg-background/80 backdrop-blur-md border border-border shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-3">
          <a className="flex items-center gap-2" href="#" onClick={(e) => e.preventDefault()}>
            <FileText className="h-6 w-6 text-foreground" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Smarana (स्मरण)</span>
          </a>
          
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#features">Features</a>
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#architecture">Architecture</a>
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#why-smarana">Open Source</a>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Global Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button 
              onClick={onLaunchApp}
              className="hidden text-sm font-medium text-foreground transition-colors hover:text-muted-foreground sm:inline-block px-4 py-2 rounded-lg hover:bg-secondary/50"
            >
              Log in
            </button>
            <button 
              onClick={onLaunchApp}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 shadow-md font-display"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Hero Section */}
        <section className="px-4 pt-28 pb-0 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl hero-card-bg p-8 md:p-12 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto pt-6 pb-12">
              
              {/* Trust Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-4 py-1.5 backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide font-display">
                  100% Client-Side &amp; Private
                </span>
              </div>

              {/* Title Tagline */}
              <h1 
                className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl mb-6 text-balance transition-all duration-300"
                style={{
                  fontFamily: heroFont === 'serif' ? 'var(--font-heading)' : (heroFont === 'display' ? 'var(--font-display)' : 'var(--font-sans)'),
                  fontWeight: isBold ? '900' : '700',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: `${isUnderline ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`.trim() || 'none'
                }}
              >
                Ideas. Notes. Recall.<br />Your Personal Second Brain.
              </h1>

              {/* Tagline Subtitle Description */}
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground text-sm md:text-base tracking-normal">
                A 100% local-first browser workspace for capturing thoughts, linking concepts with knowledge graphs, and using spaced repetition.
              </p>

              {/* Interactive Editor Formatting Toolbar Mockup */}
              <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-0.5 rounded-full border border-border bg-background/50 px-4 py-2 backdrop-blur-sm md:gap-1 md:px-5 md:py-2.5 shadow-md">
                
                {/* Font Selector Dropdown */}
                <div className="relative mr-2">
                  <button 
                    onClick={() => setHeroStyleDropdown(!heroStyleDropdown)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <span className="flex flex-col items-start leading-none text-left">
                      <span className="text-[10px] font-bold text-foreground">
                        {heroFont === 'sans' ? 'Style 01' : (heroFont === 'serif' ? 'Style 02' : 'Style 03')}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {heroFont === 'sans' ? 'Clean Sans' : (heroFont === 'serif' ? 'Classic Serif' : 'Grotesk Display')}
                      </span>
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${heroStyleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options */}
                  {heroStyleDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-32 rounded-lg border border-border bg-card p-1 shadow-lg z-30">
                      <button 
                        onClick={() => { setHeroFont('sans'); setHeroStyleDropdown(false); }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-secondary text-foreground font-sans font-medium"
                      >
                        Clean Sans
                      </button>
                      <button 
                        onClick={() => { setHeroFont('serif'); setHeroStyleDropdown(false); }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-secondary text-foreground font-serif font-medium"
                      >
                        Classic Serif
                      </button>
                      <button 
                        onClick={() => { setHeroFont('display'); setHeroStyleDropdown(false); }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-secondary text-foreground font-display font-medium"
                      >
                        Space Grotesk
                      </button>
                    </div>
                  )}
                </div>

                <span className="mx-1 h-4 w-px bg-border" />

                {/* Inline Formatting buttons */}
                <button 
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`rounded-md p-1.5 transition-all duration-200 ${isUnderline ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  title="Underline text style"
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>
                
                <button 
                  onClick={() => setIsBold(!isBold)}
                  className={`rounded-md p-1.5 transition-all duration-200 ${isBold ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  title="Bold text style"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                
                <button 
                  onClick={() => setIsItalic(!isItalic)}
                  className={`rounded-md p-1.5 transition-all duration-200 ${isItalic ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  title="Italic text style"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                
                <button 
                  onClick={() => setIsStrikethrough(!isStrikethrough)}
                  className={`rounded-md p-1.5 transition-all duration-200 ${isStrikethrough ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  title="Strikethrough text style"
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </button>

                <span className="mx-1 h-4 w-px bg-border" />

                {/* Simulated theme buttons (link with global switch) */}
                <button 
                  onClick={() => setTheme('dark')}
                  className={`rounded-md p-1.5 transition-all duration-200 ${theme === 'dark' ? 'bg-secondary text-foreground border border-border shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                  title="Dark theme mode"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
                
                <button 
                  onClick={() => setTheme('light')}
                  className={`rounded-md p-1.5 transition-all duration-200 ${theme === 'light' ? 'bg-secondary text-foreground border border-border shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                  title="Light theme mode"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={onLaunchApp}
                  className="rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90 shadow-md font-display flex items-center gap-1.5"
                >
                  Launch Web App
                  <ArrowRight size={14} />
                </button>
                <a 
                  href="#architecture"
                  className="rounded-full border border-border bg-secondary/40 text-foreground px-7 py-3 text-sm font-medium transition-colors hover:bg-secondary/70 font-display inline-flex items-center"
                >
                  View Architecture
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Sub-Hero Trustbar */}
        <section className="border-b border-border bg-card/10 py-8 relative">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 md:gap-14">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">100% Data Privacy</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">100% Free &amp; Open Source</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Offline-First Support</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">No Accounts Required</span>
            </div>
          </div>
        </section>

        {/* Features Interactive Area */}
        <section id="features" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Notes that work the way you think.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Notes shouldn't feel messy or scattered. With Smarana, every thought flows into an organized system that adapts to your style, builds semantic graphs, and keeps your memory fresh.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkle size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                Try Interactive Editor Below
              </span>
            </div>
          </div>

          {/* Interactive Mock Note Editor Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow duration-300 hover:shadow-xl">
            
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border px-5 py-3 gap-2 bg-secondary/30">
              <div className="flex items-center gap-1.5">
                
                {/* Editor Style Dropdown */}
                <select 
                  value={editorFont}
                  onChange={(e) => setEditorFont(e.target.value as any)}
                  className="bg-secondary/50 border border-border text-xs rounded-md py-1 px-2.5 font-semibold text-foreground focus:outline-none"
                >
                  <option value="sans">Clean Sans</option>
                  <option value="serif">Classic Serif</option>
                  <option value="display">Space Grotesk</option>
                </select>

                <span className="h-4 w-px bg-border mx-1" />

                {/* Formatting toggles */}
                <button 
                  onClick={() => setEditorBold(!editorBold)}
                  className={`rounded-md p-1.5 transition-all ${editorBold ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setEditorItalic(!editorItalic)}
                  className={`rounded-md p-1.5 transition-all ${editorItalic ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setEditorUnderline(!editorUnderline)}
                  className={`rounded-md p-1.5 transition-all ${editorUnderline ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>

                <span className="h-4 w-px bg-border mx-1" />

                {/* Alignment */}
                <button 
                  onClick={() => setEditorAlign('left')}
                  className={`rounded-md p-1.5 transition-all ${editorAlign === 'left' ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Align left"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setEditorAlign('center')}
                  className={`rounded-md p-1.5 transition-all ${editorAlign === 'center' ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Align center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Right Side: Quick info indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {editorText.length} characters
                </span>
              </div>
            </div>

            {/* Editor Textarea Input Area */}
            <div className="p-6 md:p-8 bg-background/25">
              <textarea 
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                rows={5}
                className="w-full bg-transparent border-none resize-none p-0 focus:ring-0 text-sm md:text-base text-foreground leading-relaxed focus:outline-none"
                style={{
                  fontFamily: editorFont === 'serif' ? 'var(--font-heading)' : (editorFont === 'display' ? 'var(--font-display)' : 'var(--font-sans)'),
                  fontWeight: editorBold ? '700' : '400',
                  fontStyle: editorItalic ? 'italic' : 'normal',
                  textDecoration: editorUnderline ? 'underline' : 'none',
                  textAlign: editorAlign
                }}
                placeholder="Type your notes here and try the interactive toolbar buttons..."
              />

              {/* Dynamic AI Summary Result Section */}
              {(isSummarizing || aiSummaryResult) && (
                <div className="mt-6 border-t border-border pt-6 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-display">
                      Smarana AI Summary
                    </span>
                  </div>

                  {isSummarizing ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="pulse-dot" />
                      <span className="text-xs text-muted-foreground italic">Generating structured key concepts...</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {aiSummaryResult?.map((item, idx) => (
                        <li key={idx} className="list-check-item text-xs text-muted-foreground">
                          <Check size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Editor Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3 bg-secondary/10">
              <button 
                onClick={handleAiSummary}
                disabled={isSummarizing || !editorText.trim()}
                className="flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-hover text-foreground px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} className="text-purple-400" />
                AI Summary
              </button>
              <button 
                onClick={handleSaveMockNote}
                disabled={!editorText.trim()}
                className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold transition-all hover:opacity-90 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                Save &amp; Go to App
              </button>
            </div>

          </div>
        </section>

        {/* Local-First Architecture Section */}
        <section id="architecture" className="bg-card/20 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            
            <div className="mb-14 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Local Architecture</p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Privacy, Speed, and Autonomy.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Architecture 1 - Browser Cache Storage */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex items-center justify-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="10" width="50" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
                    <line x1="25" y1="20" x2="75" y2="20" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="32" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="38" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="44" cy="15" r="1.5" fill="currentColor" />
                    <path d="M 32 30 H 68 M 32 38 H 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="62" y="32" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Browser Cache Storage</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    All captured memos, web clippings, and tags are stored directly in your browser's sandboxed local storage. No external databases, servers, or registrations required.
                  </p>
                </div>
              </div>

              {/* Architecture 2 - Local Spaced Repetition */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex items-center justify-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M 50 18 V 30 L 58 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="50" cy="30" r="4" fill="currentColor" opacity="0.2" />
                    <path d="M 35 42 L 40 47 L 50 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Client-Side Spaced Repetition</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Built-in local execution of Piotr Wozniak's SM-2 learning algorithm calculates optimal intervals for your reviews, helping you retain knowledge on your terms.
                  </p>
                </div>
              </div>

              {/* Architecture 3 - Local Knowledge Mapping */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex items-center justify-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="70" cy="25" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="45" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="35" y1="21" x2="63" y2="24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="33" y1="24" x2="46" y2="41" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="66" y1="29" x2="54" y2="41" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Local Knowledge Mapping</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Memos form a semantic network entirely on your device. The dashboard automatically calculates entity relationships and builds your interactive knowledge graph.
                  </p>
                </div>
              </div>

              {/* Architecture 4 - Local RAG AI Assistance */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex items-center justify-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 25 15 H 75 V 40 H 45 L 35 48 V 40 H 25 Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="42" cy="28" r="1.5" fill="currentColor" />
                    <circle cx="50" cy="28" r="1.5" fill="currentColor" />
                    <circle cx="58" cy="28" r="1.5" fill="currentColor" />
                    <path d="M 70 20 L 78 12 H 88" stroke="currentColor" strokeWidth="1" />
                    <path d="M 84 8 L 88 12 L 84 16" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Client-Side RAG AI Assistance</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Query your second brain using localized natural language processing. Find facts, summarize articles, and trace semantic connections completely offline.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Open Source / Free Showcase Section */}
        <section id="why-smarana" className="py-20 md:py-28 max-w-5xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Open Source &amp; Free</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-balance">
              100% Privacy. Zero Cost.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              No subscription tiers. No cloud telemetry. Your memories are yours to keep, forever.
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-border bg-card/40 p-8 md:p-12 shadow-xl relative overflow-hidden">
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="grid gap-8 md:grid-cols-2 items-center relative z-10">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Why Smarana is fully free
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Smarana is built on local-first web standards. Because all caching, semantic analysis, and spaced repetition calculations run directly in your own browser, there are no expensive hosting servers to maintain.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This architecture ensures your notes remain private, load instantly, work offline, and cost nothing to run or scale.
                </p>
              </div>

              <div className="space-y-4 border-t border-border pt-6 md:border-t-0 md:pt-0 md:pl-8 md:border-l">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">Smarana Core Values</h4>
                <ul className="space-y-3.5">
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Complete data sovereignty (export as JSON anytime)</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Zero third-party trackers or telemetry tools</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Private RAG search running completely client-side</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>No passwords, login credentials, or emails required</span>
                  </li>
                </ul>

                <button 
                  onClick={onLaunchApp}
                  className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold transition-all hover:opacity-90 shadow-md"
                >
                  Start Capturing Now
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Core Strengths Diagram & Values */}
        <section className="py-20 md:py-28 max-w-6xl mx-auto px-6 border-t border-border">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-muted-foreground tracking-wide font-display">
              Built for Thinkers
            </span>
          </div>

          <h2 className="mb-4 max-w-lg font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-balance">
            Smarter Notes. One Simple Space to Capture, Organize &amp; Remember
          </h2>
          <p className="mb-14 max-w-xl text-base text-muted-foreground leading-relaxed">
            Simplify the way you take notes. Write down your thoughts instantly, organize them into clear categories, and find anything in seconds using the spatial layout.
          </p>

          <div className="grid items-center gap-12 md:grid-cols-2">
            
            {/* Visual Schematic SVG decoration */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/20 p-8 flex-center aspect-[4/3] shadow-md">
              <svg className="w-full h-full text-foreground/80" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Node graph mapping representing knowledge network */}
                <circle cx="50" cy="50" r="16" className="fill-secondary stroke-border" strokeWidth="1.5" />
                <circle cx="150" cy="40" r="20" className="fill-secondary stroke-border animate-pulse" strokeWidth="1.5" style={{ animationDuration: '4s' }} />
                <circle cx="100" cy="110" r="18" className="fill-secondary stroke-border" strokeWidth="1.5" />
                
                <line x1="66" y1="48" x2="130" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="62" y1="62" x2="88" y2="98" stroke="currentColor" strokeWidth="1.5" />
                <line x1="138" y1="54" x2="112" y2="96" stroke="currentColor" strokeWidth="1.5" />
                
                {/* Central Brain Icon Representation */}
                <path d="M 92 104 Q 100 96 108 104" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="95" cy="110" r="1.5" fill="currentColor" />
                <circle cx="105" cy="110" r="1.5" fill="currentColor" />

                {/* Sub details floating nodes */}
                <circle cx="150" cy="40" r="6" fill="url(#purpleGlow)" opacity="0.3" className="glow-pulse" />
                
                <defs>
                  <radialGradient id="purpleGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 40) rotate(90) scale(15)">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                {/* Simulated connection points */}
                <text x="38" y="53" fill="currentColor" className="text-[7px] font-bold font-display">Notes</text>
                <text x="138" y="43" fill="currentColor" className="text-[7px] font-bold font-display">RAG AI</text>
                <text x="88" y="113" fill="currentColor" className="text-[7px] font-bold font-display">Recall</text>
              </svg>
            </div>

            {/* Explanatory points */}
            <div className="space-y-8">
              
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary border border-border">
                  <Pencil className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Smart Note Capture</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Quickly jot down ideas, tasks, and reminders without losing flow. Add tags, folders, or checklists to keep everything in order.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary border border-border">
                  <Compass className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Adaptive Organization</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Your notes grow with you. Use smart search, categories, and links to connect ideas and find what you need instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary border border-border">
                  <Zap className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Simple &amp; Flexible</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    A tool that fits your style — whether for study, work, or personal journaling. Take notes your way, on the fly, and access them any time.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA section bottom wrapper */}
        <section id="cta" className="max-w-6xl mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/30 px-8 py-16 text-center md:px-16 shadow-lg">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl relative z-10">
              How You Take Notes?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-relaxed relative z-10">
              Start using Smarana to capture your thoughts instantly, link concepts, and remember everything effortlessly.
            </p>
            
            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={onLaunchApp}
                className="rounded-full bg-foreground text-background px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90 shadow-md font-display"
              >
                Launch Smarana Web App
              </button>
              <button 
                onClick={onLaunchApp}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40 font-display"
              >
                Get Started Free
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer site map */}
      <footer className="border-t border-border bg-card/25 py-12 text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-6 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-foreground" />
              <span className="font-display text-lg font-bold text-foreground tracking-tight">Smarana (स्मरण)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Smart notebook for ideas, notes, and daily planning. Build your second brain.
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              &copy; {new Date().getFullYear()} Smarana. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider font-display">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#architecture" className="hover:text-foreground">Architecture</a></li>
              <li><a href="#why-smarana" className="hover:text-foreground">Open Source</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider font-display">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>Blog</a></li>
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>Documentation</a></li>
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider font-display">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>About Us</a></li>
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>Careers</a></li>
              <li><a href="#" className="hover:text-foreground" onClick={(e)=>e.preventDefault()}>Contact Support</a></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
};
