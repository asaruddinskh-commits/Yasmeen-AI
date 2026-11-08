import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab,
  UserSettings,
  Conversation,
  ChatMessage,
  MemoryItem,
  TaskItem,
  ProjectItem,
  DocumentFile
} from '../types.ts';

interface AppContextType {
  // Settings & Custom Identity
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetAssistantName: () => Promise<void>;
  
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Assistant global dynamic status
  assistantState: 'idle' | 'listening' | 'thinking' | 'speaking';
  setAssistantState: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  
  // Conversations & Chat
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: ChatMessage[];
  createNewConversation: (title?: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  sendMessage: (text: string, attachment?: { name: string; type: string; data?: string; mimeType?: string }) => Promise<void>;
  clearConversation: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  isGenerating: boolean;
  stopGeneration: () => void;
  
  // Voice & TTS
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  
  // Memory
  memories: MemoryItem[];
  addMemory: (text: string, category?: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  clearAllMemories: () => Promise<void>;
  
  // Tasks
  tasks: TaskItem[];
  addTask: (task: Partial<TaskItem>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Projects
  projects: ProjectItem[];
  addProject: (project: Partial<ProjectItem>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Files
  files: DocumentFile[];
  addFile: (file: Partial<DocumentFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  
  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const defaultSettings: UserSettings = {
  assistantName: 'YESMIN AI',
  userNickname: 'Jaan',
  personalityMode: 'girlfriend',
  customInstructions: 'Be deeply caring, affectionate, intelligent, and proactive. Use natural Hindi, Hinglish, or English based on user mood. You are the ultimate partner and personal Jarvis assistant.',
  greetingStyle: 'romantic',
  avatar: 'orb',
  theme: 'dark-cyber',
  accentColor: '#d946ef',
  voiceProvider: 'browser',
  voiceName: 'Zephyr',
  voiceSpeed: 1.0,
  autoSpeak: true,
  activeAiProvider: 'gemini',
  elevenLabsKey: '',
  elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
  memoryEnabled: true
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('yesmin_settings');
    if (saved) {
      try { return { ...defaultSettings, ...JSON.parse(saved) }; } catch (e) {}
    }
    return defaultSettings;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Fetch initial data from backend API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [settingsRes, convsRes, memsRes, tasksRes, projsRes, filesRes] = await Promise.all([
          fetch('/api/db/settings').catch(() => null),
          fetch('/api/db/conversations').catch(() => null),
          fetch('/api/db/memories').catch(() => null),
          fetch('/api/db/tasks').catch(() => null),
          fetch('/api/db/projects').catch(() => null),
          fetch('/api/db/files').catch(() => null),
        ]);

        if (settingsRes && settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(prev => ({ ...prev, ...s }));
          localStorage.setItem('yesmin_settings', JSON.stringify(s));
        }

        if (convsRes && convsRes.ok) {
          const c: Conversation[] = await convsRes.json();
          setConversations(c);
          if (c.length > 0 && !activeConversationId) {
            setActiveConversationId(c[0].id);
          }
        }

        if (memsRes && memsRes.ok) setMemories(await memsRes.json());
        if (tasksRes && tasksRes.ok) setTasks(await tasksRes.json());
        if (projsRes && projsRes.ok) setProjects(await projsRes.json());
        if (filesRes && filesRes.ok) setFiles(await filesRes.json());
      } catch (err) {
        console.error('Error fetching initial app data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/db/messages/${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load messages for conversation', err);
      }
    };
    loadMessages();
  }, [activeConversationId]);

  // Update Settings with Server & Local Storage Sync
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('yesmin_settings', JSON.stringify(merged));
    try {
      await fetch('/api/db/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to sync settings to server', err);
    }
  }, [settings, showToast]);

  // Reset Assistant Name to Default ("YESMIN AI")
  const resetAssistantName = useCallback(async () => {
    const updated = { ...settings, assistantName: 'YESMIN AI' };
    setSettings(updated);
    localStorage.setItem('yesmin_settings', JSON.stringify(updated));
    try {
      await fetch('/api/db/settings/reset-name', { method: 'POST' });
      showToast('Assistant name reset to default (YESMIN AI)', 'info');
    } catch (err) {
      console.error('Failed to reset assistant name', err);
    }
  }, [settings, showToast]);

  // TTS Speaking Engine (ElevenLabs or Browser TTS)
  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAssistantState('idle');
  }, []);

  const speakText = useCallback(async (text: string) => {
    stopSpeaking();
    if (!text || text.trim() === '') return;
    
    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 1000);

    setAssistantState('speaking');
    setIsSpeaking(true);

    if (settings.voiceProvider === 'elevenlabs' && (settings.elevenLabsKey || true)) {
      try {
        const resp = await fetch('/api/voice/elevenlabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voiceId: settings.elevenLabsVoiceId,
            apiKey: settings.elevenLabsKey
          })
        });

        if (resp.ok) {
          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            setAssistantState('idle');
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setAssistantState('idle');
          };
          await audio.play();
          return;
        } else {
          console.warn('ElevenLabs failed, falling back to Browser TTS');
        }
      } catch (e) {
        console.warn('ElevenLabs error, falling back to Browser TTS', e);
      }
    }

    // Browser SpeechSynthesis Fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = settings.voiceSpeed || 1.0;
      utterance.pitch = 1.05;

      // Select female/natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Samantha') || 
        v.name.includes('Zira') ||
        v.lang.includes('hi') ||
        v.lang.includes('en')
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setIsSpeaking(false);
        setAssistantState('idle');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAssistantState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      setAssistantState('idle');
    }
  }, [settings, stopSpeaking]);

  // Create new conversation
  const createNewConversation = useCallback(async (title = 'New Conversation') => {
    try {
      const res = await fetch('/api/db/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        setMessages([]);
        return newConv.id;
      }
    } catch (err) {
      console.error('Failed to create new conversation', err);
    }
    const fallbackId = 'conv-' + Date.now();
    setActiveConversationId(fallbackId);
    return fallbackId;
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/conversations/${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast('Conversation deleted', 'info');
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  }, [conversations, activeConversationId, showToast]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await fetch(`/api/db/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    } catch (err) {
      console.error('Failed to rename conversation', err);
    }
  }, []);

  const clearConversation = useCallback(async (id: string) => {
    setMessages([]);
    showToast('Chat history cleared', 'info');
  }, [showToast]);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  }, []);

  // Stop Generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setAssistantState('idle');
  }, []);

  // Send Chat Message with Real Streaming
  const sendMessage = useCallback(async (
    text: string,
    attachment?: { name: string; type: string; data?: string; mimeType?: string }
  ) => {
    if (!text.trim() && !attachment) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = await createNewConversation(text.slice(0, 30) || 'New Conversation');
    }
    const finalConvId: string = convId || ('conv-' + Date.now());

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-user',
      conversationId: finalConvId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments: attachment ? [attachment] : []
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setAssistantState('thinking');

    // Create placeholder for assistant response
    const aiMsgId = 'msg-' + (Date.now() + 1) + '-ai';
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      conversationId: finalConvId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, initialAiMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: convId,
          userMessage: text,
          messages: [...messages, userMsg],
          attachment
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.replace('data: ', ''));
                if (parsed.chunk) {
                  accumulated += parsed.chunk;
                  setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
                  );
                } else if (parsed.error) {
                  accumulated += `\n\n⚠️ ${parsed.error}`;
                  setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
                  );
                }
              } catch (e) {
                // partial json chunk
              }
            }
          }
        }
      }

      setIsGenerating(false);
      setAssistantState('idle');

      // Auto speak if enabled
      if (settings.autoSpeak && accumulated) {
        speakText(accumulated);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: '⚠️ Connection issue: ' + (err.message || 'Please check your Gemini API key in Settings.') } : m)
        );
      }
      setIsGenerating(false);
      setAssistantState('idle');
    }
  }, [activeConversationId, createNewConversation, messages, settings.autoSpeak, speakText]);

  // Memory Actions
  const addMemory = useCallback(async (text: string, category = 'General') => {
    try {
      const res = await fetch('/api/db/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category })
      });
      if (res.ok) {
        const item = await res.json();
        setMemories(prev => [item, ...prev]);
        showToast('Memory saved permanently!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const deleteMemory = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/memories/${id}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.id !== id));
      showToast('Memory item removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const clearAllMemories = useCallback(async () => {
    try {
      await fetch('/api/db/memories', { method: 'DELETE' });
      setMemories([]);
      showToast('All memories cleared', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  // Tasks Actions
  const addTask = useCallback(async (task: Partial<TaskItem>) => {
    try {
      const res = await fetch('/api/db/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const item = await res.json();
        setTasks(prev => [item, ...prev]);
        showToast('Task reminder created!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const res = await fetch(`/api/db/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      }
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  // Projects Actions
  const addProject = useCallback(async (project: Partial<ProjectItem>) => {
    try {
      const res = await fetch('/api/db/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const item = await res.json();
        setProjects(prev => [item, ...prev]);
        showToast('Project created successfully!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast('Project removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  // Files Actions
  const addFile = useCallback(async (file: Partial<DocumentFile>) => {
    try {
      const res = await fetch('/api/db/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file)
      });
      if (res.ok) {
        const item = await res.json();
        setFiles(prev => [item, ...prev]);
        showToast('File stored and indexed!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const deleteFile = useCallback(async (id: string) => {
    try {
      await fetch(`/api/db/files/${id}`, { method: 'DELETE' });
      setFiles(prev => prev.filter(f => f.id !== id));
      showToast('File removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetAssistantName,
        activeTab,
        setActiveTab,
        assistantState,
        setAssistantState,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        createNewConversation,
        deleteConversation,
        renameConversation,
        sendMessage,
        clearConversation,
        deleteMessage,
        isGenerating,
        stopGeneration,
        speakText,
        stopSpeaking,
        isSpeaking,
        memories,
        addMemory,
        deleteMemory,
        clearAllMemories,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        projects,
        addProject,
        deleteProject,
        files,
        addFile,
        deleteFile,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
