import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView } from './components/views/HomeView.tsx';
import { ChatView } from './components/views/ChatView.tsx';
import { LiveVoiceView } from './components/views/LiveVoiceView.tsx';
import { CodingAgentView } from './components/views/CodingAgentView.tsx';
import { AppsActionsView } from './components/views/AppsActionsView.tsx';
import { WebSearchView } from './components/views/WebSearchView.tsx';
import { FilesView } from './components/views/FilesView.tsx';
import { MemoryView } from './components/views/MemoryView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { TasksView } from './components/views/TasksView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { AndroidAppBuilderView } from './components/views/AndroidAppBuilderView.tsx';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toast } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'chat':
        return <ChatView />;
      case 'live':
        return <LiveVoiceView />;
      case 'code':
        return <CodingAgentView />;
      case 'apps':
        return <AppsActionsView />;
      case 'search':
        return <WebSearchView />;
      case 'files':
        return <FilesView />;
      case 'memory':
        return <MemoryView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'settings':
        return <SettingsView />;
      case 'android':
        return <AndroidAppBuilderView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Dynamic ambient futuristic neon lighting */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-fuchsia-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-xs text-white shadow-2xl backdrop-blur-xl animate-bounce">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Center Layout: Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
