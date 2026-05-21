import React, { useState } from 'react';
import type { Memory } from '../utils/mockData';
import { Award, Flame, Users, Calendar, Plus, UserPlus, CheckCircle, Activity, Globe } from 'lucide-react';

interface StatsPanelProps {
  memories: Memory[];
  dueCount: number;
  completedCount: number;
  streak: number;
  currentWorkspace: string;
  setCurrentWorkspace: (workspace: string) => void;
  workspaces: { id: string; name: string; role: 'Owner' | 'Editor' | 'Viewer' }[];
  onAddWorkspace: (name: string) => void;
}

interface TeamActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'save' | 'review' | 'join';
}

const INITIAL_TEAM_ACTIVITIES: TeamActivity[] = [
  { id: 'act-1', user: 'Alice Vance', action: 'captured page', target: 'Introduction to PyTorch Geometric', time: '12m ago', type: 'save' },
  { id: 'act-2', user: 'Marcus Aurel', action: 'reviewed 8 cards', target: 'SuperMemo Algorithms', time: '1h ago', type: 'review' },
  { id: 'act-3', user: 'Sofia Chen', action: 'joined workspace', target: 'AI Research Hub', time: '3h ago', type: 'join' },
  { id: 'act-4', user: 'Alice Vance', action: 'captured page', target: 'Retrieval-Augmented Generation at Scale', time: '5h ago', type: 'save' }
];

export const StatsPanel: React.FC<StatsPanelProps> = ({
  memories,
  dueCount,
  completedCount,
  streak,
  currentWorkspace,
  setCurrentWorkspace,
  workspaces,
  onAddWorkspace
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [showInviteFeedback, setShowInviteFeedback] = useState(false);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>(INITIAL_TEAM_ACTIVITIES);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    onAddWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInvitedMembers([...invitedMembers, inviteEmail]);
    setShowInviteFeedback(true);
    
    // Add to activity feed
    const newAct: TeamActivity = {
      id: `act-${Date.now()}`,
      user: 'You',
      action: 'invited colleague',
      target: inviteEmail,
      time: 'Just now',
      type: 'join'
    };
    setTeamActivities([newAct, ...teamActivities]);
    setInviteEmail('');

    setTimeout(() => {
      setShowInviteFeedback(false);
    }, 3000);
  };

  const activeWorkspace = workspaces.find(w => w.name === currentWorkspace) || workspaces[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 h-full flex flex-col gap-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>Surata Control Dashboard</h2>
        <p className="text-xs text-[var(--text-muted)]">Manage your knowledge networks, analytics, and collaborative workspaces.</p>
      </div>

      {/* Grid 1: Analytics Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Memories */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Total Index</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{memories.length}</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-medium mt-1 block">Webpages Cached</span>
          </div>
          <div 
            className="w-10 h-10 rounded-lg border flex-center text-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
          >
            <Globe size={18} />
          </div>
        </div>

        {/* Learning Streak */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Recall Streak</span>
            <span className="text-xl font-extrabold text-[var(--color-warning)] mt-1 block">{streak} Days</span>
            <span className="text-[9px] text-[var(--text-muted)] font-medium mt-1 block">Daily reviews completed: {completedCount}</span>
          </div>
          <div 
            className="w-10 h-10 rounded-lg border flex-center text-[var(--color-warning)]"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
          >
            <Flame size={18} className="fill-[var(--color-warning)]" />
          </div>
        </div>

        {/* Due Cards */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Due Today</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{dueCount} Cards</span>
            <span className="text-[9px] text-[var(--color-danger)] font-medium mt-1 block">Awaiting review</span>
          </div>
          <div 
            className="w-10 h-10 rounded-lg border flex-center text-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
          >
            <Calendar size={18} />
          </div>
        </div>

        {/* Retrieval Accuracy */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Retention Score</span>
            <span className="text-xl font-extrabold text-[var(--color-success)] mt-1 block">92.4%</span>
            <span className="text-[9px] text-[var(--text-muted)] font-medium mt-1 block">SuperMemo accuracy</span>
          </div>
          <div 
            className="w-10 h-10 rounded-lg border flex-center text-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
          >
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* Grid 2: Workspaces Panel & Team Activity Feed */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Left Side: Workspace Management */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users size={16} className="text-white" />
              Collaborative Workspaces (P2)
            </h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              Workspace Role: <strong className="text-white uppercase">{activeWorkspace.role}</strong>
            </span>
          </div>

          {/* Active Workspace Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Selected Workspace</label>
            <select
              value={currentWorkspace}
              onChange={e => setCurrentWorkspace(e.target.value)}
              className="w-full text-xs bg-[rgba(255,255,255,0.02)] border-[var(--border-color)] py-2 px-3 focus:border-white"
              style={{ color: 'var(--text-primary)' }}
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.name} style={{ backgroundColor: 'var(--bg-panel-solid)', color: '#ffffff' }}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          {/* Invite Colleague */}
          {activeWorkspace.role !== 'Viewer' ? (
            <form onSubmit={handleInvite} className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Invite Colleagues by Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="name@team.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 text-xs py-2 px-3 focus:border-white"
                  required
                />
                <button type="submit" className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1">
                  <UserPlus size={14} />
                  Invite
                </button>
              </div>
              
              {showInviteFeedback && (
                <div className="flex items-center gap-1.5 text-[10px] text-white font-medium mt-1 animate-fade-in">
                  <CheckCircle size={12} />
                  <span>Invitation sent successfully! Pending workspace sync.</span>
                </div>
              )}
            </form>
          ) : (
            <div className="p-3 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--color-danger)] font-medium">
              You are a <strong>Viewer</strong> in this workspace. Editing and invitations are restricted to Owner and Editors.
            </div>
          )}

          {/* Create New Workspace */}
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-4 mt-2">
            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Create New Workspace</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Workspace name (e.g. Technical Writing)"
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                className="flex-1 text-xs py-2 px-3 focus:border-white"
                required
              />
              <button type="submit" className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1">
                <Plus size={14} />
                Create
              </button>
            </div>
          </form>

          {/* Invited Members List */}
          {invitedMembers.length > 0 && (
            <div className="mt-2">
              <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Pending Members ({invitedMembers.length})</span>
              <div className="flex flex-wrap gap-1">
                {invitedMembers.map(email => (
                  <span key={email} className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] text-[9px] text-[var(--text-muted)] font-medium">
                    {email} (Pending)
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Activity Feed */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity size={16} className="text-[var(--text-secondary)]" />
              Workspace Activity Feed
            </h3>
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Live Sync</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[280px] pr-1">
            {teamActivities.map(act => (
              <div key={act.id} className="p-3 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-lg flex items-start gap-2.5 hover:bg-[rgba(255,255,255,0.02)] transition-all">
                {/* Action Icon representation */}
                <div 
                  className="w-6 h-6 rounded-full flex-center text-[10px] border"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-color)' }}
                >
                  {act.type === 'save' ? '🌐' : act.type === 'review' ? '🧠' : '👥'}
                </div>
                
                <div className="flex-1">
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)] font-semibold">{act.user}</strong> {act.action}{' '}
                    <span className="text-white font-medium">{act.target}</span>
                  </p>
                  <span className="text-[9px] text-[var(--text-muted)] font-medium block mt-0.5">{act.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
