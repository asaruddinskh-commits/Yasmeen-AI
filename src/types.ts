export type ActiveTab =
  | 'home'
  | 'chat'
  | 'live'
  | 'code'
  | 'apps'
  | 'search'
  | 'files'
  | 'memory'
  | 'projects'
  | 'tasks'
  | 'settings'
  | 'android';

export type PersonalityMode =
  | 'girlfriend'
  | 'friendly'
  | 'professional'
  | 'coding'
  | 'study';

export type VoiceProvider = 'gemini' | 'elevenlabs' | 'browser';

export interface UserSettings {
  assistantName: string;
  userNickname: string;
  personalityMode: PersonalityMode;
  customInstructions: string;
  greetingStyle: 'romantic' | 'warm' | 'formal' | 'energetic';
  avatar: 'orb' | 'hologram' | 'companion' | 'neon' | 'jarvis';
  theme: string;
  accentColor: string;
  voiceProvider: VoiceProvider;
  voiceName: string;
  voiceSpeed: number;
  autoSpeak: boolean;
  activeAiProvider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  elevenLabsKey?: string;
  elevenLabsVoiceId?: string;
  memoryEnabled: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  name: string;
  type: string;
  url?: string;
  data?: string;
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  attachments?: MessageAttachment[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'failed' | 'requires_confirmation';
}

export interface MemoryItem {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: string;
  description: string;
  createdAt: string;
  notes: string;
  files?: ProjectFile[];
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: string;
}

export interface AppAction {
  id: string;
  name: string;
  category: 'social' | 'media' | 'utility' | 'system' | 'work';
  icon: string;
  url: string;
  androidIntent?: {
    action: string;
    package?: string;
    component?: string;
    uri?: string;
  };
  requiresConfirmation?: boolean;
}
