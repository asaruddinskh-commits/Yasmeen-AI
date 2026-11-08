import React, { useState } from 'react';
import {
  Home,
  MessageSquare,
  Radio,
  Code2,
  Settings,
  MoreHorizontal,
  LayoutGrid,
  Globe,
  FileText,
  BrainCircuit,
  FolderKanban,
  CheckSquare,
  Smartphone,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ActiveTab } from '../types.ts';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'live', label: 'Live', icon: <Radio className="w-5 h-5 text-pink-400 animate-pulse" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const moreItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'apps', label: 'Apps & Actions', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'search', label: 'Web Search', icon: <Globe className="w-5 h-5" /> },
    { id: 'files', label: 'Files & Docs', icon: <FileText className="w-5 h-5" /> },
    { id: 'memory', label: 'Memory Bank', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'android', label: 'Android App Studio', icon: <Smartphone className="w-5 h-5 text-emerald-400" /> },
    { id: 'tasks', label: 'Tasks & Reminders', icon: <CheckSquare className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Mobile Drawer Modal for additional tools */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end p-4">
          <div className="bg-[#0b0e24] border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
              <span className="font-bold text-slate-200">Jarvis Tools & Workspace</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMoreMenu(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-fuchsia-600/20 text-white border-fuchsia-500/50 shadow-lg'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="mb-1.5 text-fuchsia-400">{item.icon}</span>
                  <span className="text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#070919]/90 backdrop-blur-xl border-t border-purple-900/30 px-2 flex items-center justify-around">
        {mainItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-fuchsia-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-fuchsia-500/20 border border-fuchsia-500/40' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200"
        >
          <div className="p-1 rounded-xl">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
