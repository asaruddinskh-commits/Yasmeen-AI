import React from 'react';
import {
  Home,
  MessageSquare,
  Radio,
  Code2,
  LayoutGrid,
  Globe,
  FileText,
  BrainCircuit,
  FolderKanban,
  CheckSquare,
  Settings,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ActiveTab } from '../types.ts';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks } = useApp();

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'live', label: 'Gemini Live', icon: <Radio className="w-5 h-5 text-pink-400" />, badge: 'LIVE' },
    { id: 'code', label: 'Coding Agent', icon: <Code2 className="w-5 h-5" /> },
    { id: 'apps', label: 'Apps & Actions', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'search', label: 'Web Search', icon: <Globe className="w-5 h-5" /> },
    { id: 'files', label: 'Files & Docs', icon: <FileText className="w-5 h-5" /> },
    { id: 'memory', label: 'Memory', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
    {
      id: 'tasks',
      label: 'Tasks & Reminders',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingTasksCount > 0 ? String(pendingTasksCount) : undefined
    },
    { id: 'android', label: 'Android App Studio', icon: <Smartphone className="w-5 h-5 text-emerald-400" />, badge: 'APK' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-purple-900/20 bg-[#070919]/70 backdrop-blur-xl h-[calc(100vh-4rem)] p-4 justify-between select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Jarvis Core System
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 text-white border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? 'text-fuchsia-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.id === 'live'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini status card */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/20">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Engine Status</span>
          <span className="text-emerald-400 font-mono">100% Online</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 h-full w-full animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
