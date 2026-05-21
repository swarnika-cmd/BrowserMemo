import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, ChevronDown, Underline, Bold, Italic, 
  Strikethrough, List, AlignCenter, Moon, Sun, Shield, Scale, 
  TrendingDown, XCircle, Sparkles, Save, Pencil, Compass, 
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
    "Scribblit allows me to write down thoughts instantly, organize them with smart tags, and view connections in a Knowledge Graph. Connecting ideas helps me gain clarity and never lose inspiration."
  );
  const [editorFont, setEditorFont] = useState<'sans' | 'serif' | 'display'>('sans');
  const [editorBold, setEditorBold] = useState(false);
  const [editorItalic, setEditorItalic] = useState(false);
  const [editorUnderline, setEditorUnderline] = useState(false);
  const [editorAlign, setEditorAlign] = useState<'left' | 'center'>('left');
  
  // AI summary states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string[] | null>(null);

  // Animated numbers count
  const [userCount, setUserCount] = useState(98400);

  useEffect(() => {
    // Slowly increment users count for premium live feel
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    const title = titleWords.length > 3 ? `${titleWords}...` : "Scribblit Quick Capture";
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
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Scribblit</span>
          </a>
          
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#features">Features</a>
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#platforms">Platforms</a>
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#pricing">Pricing</a>
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
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide font-display">
                  +{userCount.toLocaleString()} active minds online
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
                Ideas. Notes. Clarity.<br />Wherever your mind goes.
              </h1>

              {/* Tagline Subtitle Description */}
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground text-sm md:text-base tracking-normal">
                Combine note-taking, idea tracking, and daily planning in one smart notebook — ready whenever inspiration hits.
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
                  Launch App Dashboard
                  <ArrowRight size={14} />
                </button>
                <button 
                  onClick={onLaunchApp}
                  className="rounded-full border border-border bg-secondary/40 text-foreground px-7 py-3 text-sm font-medium transition-colors hover:bg-secondary/70 font-display"
                >
                  Start Free Trial
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* Sub-Hero Trustbar */}
        <section className="border-b border-border bg-card/10 py-8 relative">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 md:gap-14">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">No Setup Fee</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">100% Data Ownership</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">80%+ Reduced Cognitive Load</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Cancel Anytime</span>
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
                Notes shouldn't feel messy or scattered. With Scribblit, every thought flows into an organized system that adapts to your style, builds semantic graphs, and keeps your memory fresh.
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
                      Scribblit AI Summary
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

        {/* Platforms Grid Section */}
        <section id="platforms" className="bg-card/20 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            
            <div className="mb-14 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Sync Anywhere</p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Clarity. Wherever your mind goes.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Platform 1 - Android */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex-center p-6">
                  {/* Premium Vector SVG Mockup instead of missing image */}
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="35" y="5" width="30" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="2" fill="currentColor" />
                    <line x1="45" y1="8" x2="55" y2="8" stroke="currentColor" strokeWidth="1" />
                    <path d="M 40 18 H 60 M 40 26 H 60 M 40 34 H 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="52" y="32" width="8" height="8" rx="1" fill="currentColor" opacity="0.2" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Scribblit for Android</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Take notes on the go with fast, secure sync across all your devices. Capture thoughts instantly and access them offline.
                  </p>
                </div>
              </div>

              {/* Platform 2 - iOS */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="36" y="7" width="28" height="46" rx="5" stroke="currentColor" strokeWidth="2" />
                    <line x1="48" y1="9" x2="52" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 42 16 H 58 M 42 22 H 58 M 42 28 H 58" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    <rect x="42" y="34" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Scribblit for iOS</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Jot down notes, organize with folders, and collaborate on shared projects — all from your iPhone or iPad with widget support.
                  </p>
                </div>
              </div>

              {/* Platform 3 - Desktop */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="15" y="10" width="70" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M 40 46 L 35 52 H 65 L 60 46 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="52" x2="70" y2="52" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M 22 18 H 45 M 22 24 H 40 M 22 30 H 45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="65" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="70" y1="29" x2="76" y2="35" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Scribblit for Windows / Linux</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Work smarter on desktop. Enjoy keyboard shortcuts, offline editing, window snapping, and distraction-free writing.
                  </p>
                </div>
              </div>

              {/* Platform 4 - Web */}
              <div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50 flex-center p-6">
                  <svg className="w-4/5 h-4/5 text-muted-foreground opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="6 2" />
                    <path d="M 38 30 H 62 M 50 18 V 42" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <rect x="42" y="24" width="16" height="12" rx="2" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
                    <path d="M 47 30 L 53 30" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="px-6 py-5 border-t border-border">
                  <h3 className="font-display text-lg font-bold text-foreground">Scribblit for Web</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Access your notes anywhere. A lightweight, lightning-fast web app optimized for speed that loads in under 3 seconds.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section id="pricing" className="py-20 md:py-28 max-w-5xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pricing</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-balance">
              Choose your pricing plan
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              Keep your notes organized, clear, and easy to find. Every thought flows into a system that adapts to your style.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            
            {/* Free Plan */}
            <div className="group relative flex flex-col rounded-2xl border border-border bg-card/60 text-foreground hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-1 flex-col p-7">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Free</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold tracking-tight">$0</span>
                  <span className="text-xs font-medium text-muted-foreground">forever</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">For casual note-takers getting started.</p>
                
                <div className="my-6 h-px bg-border" />
                
                <ul className="flex-1 space-y-3.5">
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Up to 50 notes</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Basic search &amp; tagging</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Single device access</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Community support</span>
                  </li>
                </ul>

                <button 
                  onClick={onLaunchApp}
                  className="mt-8 w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-transparent text-foreground hover:bg-foreground hover:text-primary-foreground py-3 text-sm font-bold transition-all"
                >
                  Get Started
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Pro Plan (Highlighted Card) */}
            <div className="group relative flex flex-col rounded-2xl border border-foreground bg-foreground text-primary-foreground shadow-2xl md:-my-4 md:py-4 transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-foreground px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-foreground/10">
                Most Popular
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Pro</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold tracking-tight">$69</span>
                  <span className="text-xs font-medium text-primary-foreground/50">/year</span>
                </div>
                <p className="mt-3 text-xs text-primary-foreground/60">For power users who need more capacity.</p>
                
                <div className="my-6 h-px bg-primary-foreground/10" />
                
                <ul className="flex-1 space-y-3.5">
                  <li className="list-check-item text-xs text-primary-foreground/80">
                    <Check size={14} className="text-primary-foreground mt-0.5" />
                    <span>Unlimited notes &amp; notebooks</span>
                  </li>
                  <li className="list-check-item text-xs text-primary-foreground/80">
                    <Check size={14} className="text-primary-foreground mt-0.5" />
                    <span>Advanced search &amp; tagging</span>
                  </li>
                  <li className="list-check-item text-xs text-primary-foreground/80">
                    <Check size={14} className="text-primary-foreground mt-0.5" />
                    <span>Real-time collaboration</span>
                  </li>
                  <li className="list-check-item text-xs text-primary-foreground/80">
                    <Check size={14} className="text-primary-foreground mt-0.5" />
                    <span>Cloud sync across devices</span>
                  </li>
                  <li className="list-check-item text-xs text-primary-foreground/80">
                    <Check size={14} className="text-primary-foreground mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                </ul>

                <button 
                  onClick={onLaunchApp}
                  className="mt-8 w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-foreground text-foreground hover:bg-primary-foreground/90 py-3 text-sm font-bold transition-all shadow-md"
                >
                  Upgrade to Pro
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Vision Pro Plan */}
            <div className="group relative flex flex-col rounded-2xl border border-border bg-card/60 text-foreground hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-1 flex-col p-7">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Vision Pro</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold tracking-tight">$149</span>
                  <span className="text-xs font-medium text-muted-foreground">/year</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">For teams that think and work together.</p>
                
                <div className="my-6 h-px bg-border" />
                
                <ul className="flex-1 space-y-3.5">
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Everything in Pro plan</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Team workspaces &amp; settings</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Admin roles &amp; permissions</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Dedicated support manager</span>
                  </li>
                  <li className="list-check-item text-xs text-muted-foreground">
                    <Check size={14} className="text-foreground/70 mt-0.5" />
                    <span>Custom integrations API</span>
                  </li>
                </ul>

                <button 
                  onClick={onLaunchApp}
                  className="mt-8 w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-transparent text-foreground hover:bg-foreground hover:text-primary-foreground py-3 text-sm font-bold transition-all"
                >
                  Contact Sales
                  <ArrowRight size={14} />
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
              Start Using Scribblit to capture your thoughts instantly, link concepts, and remember everything effortlessly.
            </p>
            
            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={onLaunchApp}
                className="rounded-full bg-foreground text-background px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90 shadow-md font-display"
              >
                Launch Scribblit Web App
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
              <span className="font-display text-lg font-bold text-foreground tracking-tight">Scribblit</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Smart notebook for ideas, notes, and daily planning. Build your second brain.
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              &copy; {new Date().getFullYear()} Scribblit Inc. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider font-display">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#platforms" className="hover:text-foreground">Platforms</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
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
