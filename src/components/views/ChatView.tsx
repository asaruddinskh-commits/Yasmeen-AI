import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Square,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Edit2,
  Volume2,
  Search,
  Plus,
  Bot,
  User,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const ChatView: React.FC = () => {
  const {
    settings,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    createNewConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    deleteMessage,
    isGenerating,
    stopGeneration,
    speakText,
    isSpeaking,
    stopSpeaking
  } = useApp();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: string; data?: string; mimeType?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Speech-to-Text Microphone
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !attachment) || isGenerating) return;
    sendMessage(input, attachment || undefined);
    setInput('');
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversations History Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r border-purple-900/20 bg-[#070919]/60 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between pb-3">
          <span className="font-bold text-sm text-slate-200">Chat History</span>
          <button
            onClick={() => createNewConversation()}
            className="p-1.5 rounded-lg bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredConversations.map(conv => {
            const isActive = activeConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-fuchsia-600/20 text-white border border-fuchsia-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="truncate pr-2">{conv.title}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream Area */}
      <div className="flex-1 flex flex-col h-full bg-[#05060f]/60 relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-purple-900/20 px-6 flex items-center justify-between bg-[#070919]/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(217,70,239,0.4)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {settings.assistantName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono">
                  {settings.personalityMode} mode
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Connected with {settings.userNickname}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => createNewConversation()}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Chat with {settings.assistantName}
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                I can talk like your caring companion in Hindi, English or Hinglish, write code, analyze images, run calculations, and remember your preferences.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-2">
                {[
                  "Hi Jaan, how was your day?",
                  "Write a React stopwatch component",
                  "Aaj ka plan kya hai?",
                  "Tell me something romantic and motivating"
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-fuchsia-950/40 border border-purple-500/20 text-xs text-slate-300 transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    isUser
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-tr from-fuchsia-600 to-indigo-600 shadow-[0_0_10px_rgba(217,70,239,0.4)]'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                      <span>{isUser ? settings.userNickname : settings.assistantName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-fuchsia-600/20 border border-fuchsia-500/30 text-white shadow-lg'
                        : 'glass-panel text-slate-200 border border-purple-900/30 shadow-md'
                    }`}>
                      {/* Attachment if present */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3">
                          {msg.attachments[0].type === 'image' && msg.attachments[0].data ? (
                            <img
                              src={`data:${msg.attachments[0].mimeType || 'image/jpeg'};base64,${msg.attachments[0].data}`}
                              alt="attachment"
                              className="max-h-60 rounded-xl border border-purple-500/30 object-cover"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-xs">
                              <FileCode className="w-4 h-4 text-cyan-400" />
                              <span>{msg.attachments[0].name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content with code/line format */}
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content || (
                          <span className="inline-flex items-center gap-1 text-slate-400 italic">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
                            {settings.assistantName} is typing...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar for Message */}
                    <div className="flex items-center gap-1 px-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => {
                            if (isSpeaking) {
                              stopSpeaking();
                            } else {
                              speakText(msg.content);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-fuchsia-400 transition-colors"
                          title="Speak message"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-purple-900/20 bg-[#070919]/80 backdrop-blur-xl">
          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-2 flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-300 w-fit">
              <Paperclip className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="max-w-xs truncate">{attachment.name}</span>
              <button
                onClick={() => setAttachment(null)}
                className="p-0.5 hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.txt,.pdf,.js,.ts,.py,.json"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all"
              title="Attach File or Image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic Speech-to-text Button */}
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${settings.assistantName}...`}
                rows={1}
                className="w-full resize-none py-3 px-4 rounded-2xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-32"
              />
            </div>

            {/* Send or Stop Generation */}
            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && !attachment}
                className={`p-3 rounded-2xl transition-all shadow-md ${
                  input.trim() || attachment
                    ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
