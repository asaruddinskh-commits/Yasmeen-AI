import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  FileCode,
  CheckSquare,
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Smartphone,
  Globe,
  Bot,
  Video,
  GraduationCap,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { ProjectItem } from '../../types.ts';

export const ProjectsView: React.FC = () => {
  const { projects, addProject, deleteProject, settings, setActiveTab, sendMessage, showToast } = useApp();
  const [selectedProj, setSelectedProj] = useState<ProjectItem | null>(projects[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Coding Project');
  const [newDesc, setNewDesc] = useState('');

  const projectTypes = [
    { label: 'Android App', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
    { label: 'Website', icon: <Globe className="w-4 h-4 text-cyan-400" /> },
    { label: 'AI Assistant', icon: <Bot className="w-4 h-4 text-fuchsia-400" /> },
    { label: 'Coding Project', icon: <FileCode className="w-4 h-4 text-amber-400" /> },
    { label: 'YouTube Project', icon: <Video className="w-4 h-4 text-rose-400" /> },
    { label: 'Study Project', icon: <GraduationCap className="w-4 h-4 text-indigo-400" /> },
    { label: 'Custom Project', icon: <Layers className="w-4 h-4 text-purple-400" /> }
  ];

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;
    const newP: Partial<ProjectItem> = {
      title: newTitle,
      type: newType,
      description: newDesc,
      notes: `Project instructions for ${settings.assistantName}: assist with planning, drafting architecture, and reviewing code.`
    };
    addProject(newP);
    setNewTitle('');
    setNewDesc('');
    setShowNewModal(false);
  };

  const handleConsultAI = (project: ProjectItem) => {
    sendMessage(`I want to collaborate with you on my project "${project.title}" (${project.type}). Description: ${project.description}. What should be our next strategic milestone?`);
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-fuchsia-400" />
            <span>Workspace & Project Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end workspaces combining files, tasks, notes, and AI collaboration
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">
            All Workspaces ({projects.length})
          </span>

          <div className="space-y-2">
            {projects.map(p => {
              const isSelected = selectedProj?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProj(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-fuchsia-600/20 text-white border-fuchsia-500/50 shadow-md'
                      : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-fuchsia-300 font-semibold">
                      {p.type}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteProject(p.id);
                        if (selectedProj?.id === p.id) setSelectedProj(null);
                      }}
                      className="p-1 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate">{p.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Project Overview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProj ? (
            <div className="glass-panel-glow rounded-3xl p-6 md:p-8 space-y-6 border border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-900/30 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedProj.title}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono">
                      {selectedProj.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedProj.description}</p>
                </div>

                <button
                  onClick={() => handleConsultAI(selectedProj)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Work with {settings.assistantName}</span>
                </button>
              </div>

              {/* Workspace Notes / Instructions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Project Context & Guidelines</span>
                </span>
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedProj.notes || 'No custom notes provided for this workspace.'}
                </div>
              </div>

              {/* Associated Files */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Project Files ({selectedProj.files?.length || 0})</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedProj.files || []).map(f => (
                    <div
                      key={f.id}
                      onClick={() => setActiveTab('code')}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 cursor-pointer text-xs flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-slate-200">{f.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 space-y-2">
              <FolderKanban className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Select or create a workspace</p>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e24] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Workspace</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Project Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., E-Commerce Mobile App"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0c20]"
                >
                  {projectTypes.map(t => (
                    <option key={t.label} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Short brief about goals..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newTitle.trim()}
                className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
