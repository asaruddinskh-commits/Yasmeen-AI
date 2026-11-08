import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SearchResult {
  query: string;
  summary: string;
  sources: Array<{ title: string; url: string; snippet?: string }>;
}

export const WebSearchView: React.FC = () => {
  const { settings, setActiveTab, sendMessage } = useApp();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<string[]>([
    'Latest updates on AI agents 2026',
    'Best practices for Gemini Live WebSocket voice',
    'TypeScript 7 new features'
  ]);

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm || query;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentResult(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);
        if (!history.includes(q)) {
          setHistory(prev => [q, ...prev.slice(0, 9)]);
        }
      } else {
        const err = await res.json();
        setCurrentResult({
          query: q,
          summary: `Search error: ${err.error || 'Failed to complete search query.'}`,
          sources: []
        });
      }
    } catch (err: any) {
      setCurrentResult({
        query: q,
        summary: `Search network error: ${err.message}`,
        sources: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskChat = (contextSummary: string) => {
    sendMessage(`Based on this web search result: "${contextSummary.slice(0, 300)}...", explain more details and practical takeaways for me.`);
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-fuchsia-400" />
          <span>Grounded Web Intelligence</span>
        </h2>
        <p className="text-xs text-slate-400">
          Real-time web search powered by Google Search grounding with transparent source citations
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 rounded-2xl glass-panel-glow border border-purple-500/30 flex items-center gap-2">
        <Search className="w-5 h-5 text-fuchsia-400 ml-3" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search the live web for facts, news, documentation, or code..."
          className="flex-1 bg-transparent border-none py-2 px-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSearch()}
          disabled={isLoading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>Search Web</span>
        </button>
      </div>

      {/* Recent History Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
          <Clock className="w-3 h-3" />
          <span>Recent Queries:</span>
        </span>
        {history.map(item => (
          <button
            key={item}
            onClick={() => {
              setQuery(item);
              handleSearch(item);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-slate-300 text-xs transition-all"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Search Results Display */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">
            {settings.assistantName} is searching the web and verifying sources...
          </p>
        </div>
      )}

      {currentResult && (
        <div className="space-y-6">
          {/* AI Grounded Summary */}
          <div className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Synthesis & Direct Answer</span>
              </div>
              <button
                onClick={() => handleAskChat(currentResult.summary)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask {settings.assistantName} About This</span>
              </button>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {currentResult.summary}
            </div>
          </div>

          {/* Sources Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Verified Sources ({currentResult.sources.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentResult.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl glass-panel border border-purple-900/20 hover:border-cyan-500/40 hover:bg-slate-900/40 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {src.title}
                    </h4>
                    {src.snippet && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {src.snippet}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono pt-1">
                    <span className="truncate max-w-[200px]">{src.url}</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
