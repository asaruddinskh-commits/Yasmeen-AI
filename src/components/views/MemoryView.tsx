import React, { useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Trash2,
  Search,
  Check,
  Edit2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const MemoryView: React.FC = () => {
  const {
    settings,
    updateSettings,
    memories,
    addMemory,
    deleteMemory,
    clearAllMemories,
    showToast
  } = useApp();

  const [newMemoryText, setNewMemoryText] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Preference');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (!newMemoryText.trim()) return;
    addMemory(newMemoryText, newCategory);
    setNewMemoryText('');
  };

  const filteredMemories = memories.filter(m =>
    m.text.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-fuchsia-400" />
            <span>Persistent Long-Term Memory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Information and preferences {settings.assistantName} remembers naturally across conversations and sessions
          </p>
        </div>

        {/* Memory Toggle */}
        <button
          onClick={() => updateSettings({ memoryEnabled: !settings.memoryEnabled })}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
            settings.memoryEnabled
              ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
              : 'bg-slate-900 text-slate-400 border-slate-700'
          }`}
        >
          {settings.memoryEnabled ? (
            <>
              <ToggleRight className="w-5 h-5 text-fuchsia-400" />
              <span>Memory Enabled</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-500" />
              <span>Memory Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Add New Memory Card */}
      <div className="p-5 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-4">
        <span className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-fuchsia-400" />
          <span>Teach {settings.assistantName} Something New</span>
        </span>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newMemoryText}
            onChange={e => setNewMemoryText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`e.g., "Favorite food is Biryani", "Working on a React Native app", "Prefers Hinglish responses"`}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none bg-[#0a0c20]"
          >
            <option value="Personal Preference">Personal Preference</option>
            <option value="Work & Coding">Work & Coding</option>
            <option value="Life & Routine">Life & Routine</option>
            <option value="Relationships & Family">Relationships & Family</option>
            <option value="Important Goal">Important Goal</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={!newMemoryText.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            Save Memory
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search remembered facts..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {memories.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all memory items?')) {
                clearAllMemories();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Memories</span>
          </button>
        )}
      </div>

      {/* Memories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs space-y-2">
            <BrainCircuit className="w-8 h-8 mx-auto text-slate-600" />
            <p>No memory items found.</p>
          </div>
        ) : (
          filteredMemories.map(mem => (
            <div
              key={mem.id}
              className="p-5 rounded-3xl glass-panel border border-purple-900/20 flex flex-col justify-between space-y-3 group hover:border-fuchsia-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{mem.category}</span>
                </span>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                  title="Forget memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{mem.text}"
              </p>

              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-purple-900/20">
                Learned on {new Date(mem.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
