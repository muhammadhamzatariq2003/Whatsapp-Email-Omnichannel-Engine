import React from 'react';
import { LayoutDashboard, Users, GitFork, MessageSquare, Clock, BarChart3, Settings, ShieldCheck } from 'lucide-react';

interface SidebarProps { currentTab: string; setCurrentTab: (tab: string) => void; isDemo: boolean; }

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isDemo }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead Operations', icon: Users },
    { id: 'pipeline', label: 'Revenue Pipeline', icon: GitFork },
    { id: 'inbox', label: 'Omnichannel Inbox', icon: MessageSquare },
    { id: 'followups', label: 'Follow-Up Matrix', icon: Clock },
    { id: 'analytics', label: 'Performance Audit', icon: BarChart3 },
    { id: 'settings', label: 'Platform & APIs', icon: Settings },
  ];
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100 font-mono">KAJIOU</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">AI Operations</p>
          </div>
        </div>
        {isDemo && (
          <div className="mx-4 mt-3 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider">Demo Mode Active</span>
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          </div>
        )}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon; const active = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}`}>
                <Icon size={17} strokeWidth={1.75} className={active ? 'text-indigo-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono">KJ</div>
        <div className="overflow-hidden">
          <p className="text-xs font-medium text-slate-200 truncate">Admin</p>
          <p className="text-[10px] text-slate-500 font-mono truncate">admin@kajiou.ai</p>
        </div>
      </div>
    </aside>
  );
};
