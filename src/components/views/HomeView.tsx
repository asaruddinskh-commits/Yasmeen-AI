import React from 'react';
import {
  MessageSquare,
  Radio,
  Code2,
  Globe,
  Upload,
  FolderKanban,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Brain,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AiOrb } from '../AiOrb.tsx';

export const HomeView: React.FC = () => {
  const {
    settings,
    setActiveTab,
    conversations,
    tasks,
    memories,
    createNewConversation
  } = useApp();

  const quickActions = [
    {
      title: 'Start Chat',
      desc: 'Text & multimodal assistant',
      icon: <MessageSquare className="w-5 h-5 text-fuchsia-400" />,
      color: 'hover:border-fuchsia-500/50 hover:bg-fuchsia-950/20',
      action: () => {
        createNewConversation();
        setActiveTab('chat');
      }
    },
    {
      title: 'Start Live Voice',
      desc: 'Real-time Gemini Live call',
      icon: <Radio className="w-5 h-5 text-pink-400" />,
      color: 'hover:border-pink-500/50 hover:bg-pink-950/20',
      action: () => setActiveTab('live')
    },
    {
      title: 'Open Coding Agent',
      desc: 'Full-stack development AI',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-950/20',
      action: () => setActiveTab('code')
    },
    {
      title: 'Search Web',
      desc: 'Real-time grounded search',
      icon: <Globe className="w-5 h-5 text-indigo-400" />,
      color: 'hover:border-indigo-500/50 hover:bg-indigo-950/20',
      action: () => setActiveTab('search')
    },
    {
      title: 'Upload File',
      desc: 'Analyze documents & code',
      icon: <Upload className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
      action: () => setActiveTab('files')
    },
    {
      title: 'Open Projects',
      desc: 'Workspaces & repositories',
      icon: <FolderKanban className="w-5 h-5 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-950/20',
      action: () => setActiveTab('projects')
    },
    {
      title: 'Build Android App',
      desc: 'APK compiler & live simulator',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
      action: () => setActiveTab('android')
    },
    {
      title: 'Apps & Actions',
      desc: 'YouTube, WhatsApp, Maps bridge',
      icon: <LayoutGrid className="w-5 h-5 text-purple-400" />,
      color: 'hover:border-purple-500/50 hover:bg-purple-950/20',
      action: () => setActiveTab('apps')
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section with Interactive AI Orb */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-glow p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-xs text-fuchsia-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Companion & Jarvis Active</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-indigo-300">{settings.userNickname}</span> 💕
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-medium">
            I'm <span className="font-bold text-white underline decoration-fuchsia-500/60 underline-offset-4">{settings.assistantName}</span>. How can I help you today?
          </p>

          <p className="text-sm text-slate-400 max-w-lg">
            I'm completely customized to your needs. Ask me anything, speak with me in Live Voice mode, launch code generation, or manage your personal tasks.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab('live')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-indigo-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.7)] transition-all hover:scale-102"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Start Live Voice</span>
            </button>
            <button
              onClick={() => {
                createNewConversation();
                setActiveTab('chat');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-sm border border-purple-500/30 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-fuchsia-400" />
              <span>New Conversation</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-102"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Build Android App</span>
            </button>
          </div>
        </div>

        {/* Dynamic AI Orb Visualizer */}
        <div className="z-10 py-4">
          <AiOrb size="lg" showStatusLabel interactive onClick={() => setActiveTab('live')} />
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Quick Actions Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-fuchsia-400" />
            <span>Quick Capabilities</span>
          </h2>
          <span className="text-xs text-slate-400">All tools functional & live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {quickActions.map(action => (
            <button
              key={action.title}
              onClick={action.action}
              className={`p-4 rounded-2xl glass-panel text-left transition-all duration-300 border border-purple-900/20 ${action.color} group hover:shadow-lg`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Dashboard Grid: Recent Chats & Tasks & Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-fuchsia-400" />
              <span>Recent Conversations</span>
            </span>
            <button
              onClick={() => setActiveTab('chat')}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {conversations.slice(0, 4).map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveTab('chat');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/60 text-left transition-all group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-fuchsia-300">
                    {c.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Priority Reminders */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>Tasks & Reminders</span>
            </span>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.slice(0, 4).map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${
                      t.completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-500'
                    }`}
                  />
                  <span className={`truncate font-medium ${t.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {t.title}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold flex-shrink-0 ${
                  t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent Memory Snippet */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>What I Remember About You</span>
            </span>
            <button
              onClick={() => setActiveTab('memory')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              All memories <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {memories.slice(0, 3).map(m => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs space-y-1"
              >
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">
                  {m.category}
                </span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{m.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
