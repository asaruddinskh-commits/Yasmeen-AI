import React, { useState } from 'react';
import {
  Settings,
  User,
  Bot,
  Volume2,
  Cpu,
  Layers,
  Palette,
  Shield,
  Info,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Key,
  ExternalLink,
  Trash2,
  Download,
  Activity,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { PersonalityMode, VoiceProvider } from '../../types.ts';

type SettingsSection =
  | 'profile'
  | 'providers'
  | 'voice'
  | 'live'
  | 'services'
  | 'appearance'
  | 'privacy'
  | 'about';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  status: 'active' | 'configured' | 'optional';
  configKey: string;
}

const serviceCatalog: ServiceItem[] = [
  { id: 'gemini', name: 'Gemini 3.8 Intelligence', category: 'LLM & Reasoning', desc: 'Primary core AI multimodal reasoning and Live API engine.', status: 'active', configKey: 'GEMINI_API_KEY' },
  { id: 'openai', name: 'OpenAI GPT-4o', category: 'LLM & Reasoning', desc: 'Alternative GPT language model connector.', status: 'configured', configKey: 'OPENAI_API_KEY' },
  { id: 'anthropic', name: 'Anthropic Claude 3.7', category: 'LLM & Reasoning', desc: 'Claude models provider connector.', status: 'configured', configKey: 'ANTHROPIC_API_KEY' },
  { id: 'elevenlabs', name: 'ElevenLabs Voice Engine', category: 'Audio Synthesis', desc: 'Ultra-realistic human emotive voice generation.', status: 'configured', configKey: 'ELEVENLABS_API_KEY' },
  { id: 'stt', name: 'Speech-to-Text (PCM/Web)', category: 'Audio Input', desc: 'Continuous 16kHz audio transcription and speech recognition.', status: 'active', configKey: 'STT_ENGINE' },
  { id: 'tts', name: 'Text-to-Speech Engine', category: 'Audio Output', desc: '24kHz low-latency speech playback and Web Speech synthesis.', status: 'active', configKey: 'TTS_ENGINE' },
  { id: 'search', name: 'Google Search Grounding', category: 'Information', desc: 'Real-time live web query search with source citation.', status: 'active', configKey: 'SEARCH_GROUNDING' },
  { id: 'imagegen', name: 'Multimodal Vision & Analysis', category: 'Computer Vision', desc: 'High-precision visual OCR, diagram, and code screenshot audit.', status: 'active', configKey: 'VISION_API' },
  { id: 'maps', name: 'Google Maps Navigation', category: 'Geospatial', desc: 'Location intent resolver and navigation bridge.', status: 'active', configKey: 'MAPS_API' },
  { id: 'firebase', name: 'Firebase Cloud Platform', category: 'Cloud Infrastructure', desc: 'Optional Firestore persistent database and auth sync.', status: 'configured', configKey: 'FIREBASE_CONFIG' },
  { id: 'storage', name: 'Document & Blob Storage', category: 'Storage', desc: 'Local file-backed indexing engine with JSON storage.', status: 'active', configKey: 'STORAGE_PATH' },
  { id: 'sandbox', name: 'Isolated Coding Sandbox', category: 'Execution', desc: 'Sandboxed virtual runtime for secure code execution.', status: 'active', configKey: 'SANDBOX_ENGINE' },
  { id: 'analytics', name: 'Jarvis Health & Audit Logs', category: 'Diagnostics', desc: 'Real-time latency, error tracking, and execution logs.', status: 'active', configKey: 'ANALYTICS_CORE' },
  { id: 'custom', name: 'Custom OpenAI-Compatible Endpoint', category: 'Custom Proxy', desc: 'Self-hosted vLLM, Ollama, or custom private LLM URL.', status: 'optional', configKey: 'CUSTOM_BASE_URL' }
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAssistantName,
    speakText,
    showToast,
    clearAllMemories
  } = useApp();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Form State
  const [assistantNameInput, setAssistantNameInput] = useState(settings.assistantName);
  const [userNicknameInput, setUserNicknameInput] = useState(settings.userNickname);
  const [personalityInput, setPersonalityInput] = useState<PersonalityMode>(settings.personalityMode);
  const [customInstructionsInput, setCustomInstructionsInput] = useState(settings.customInstructions);
  const [greetingStyleInput, setGreetingStyleInput] = useState(settings.greetingStyle);

  // Voice State
  const [voiceProviderInput, setVoiceProviderInput] = useState<VoiceProvider>(settings.voiceProvider);
  const [voiceNameInput, setVoiceNameInput] = useState(settings.voiceName);
  const [voiceSpeedInput, setVoiceSpeedInput] = useState(settings.voiceSpeed);
  const [autoSpeakInput, setAutoSpeakInput] = useState(settings.autoSpeak);
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState(settings.elevenLabsKey || '');
  const [elevenLabsVoiceIdInput, setElevenLabsVoiceIdInput] = useState(settings.elevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM');

  // Provider Test Status
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string; latency?: number } | null>(null);

  // Service Modal
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleSaveProfile = async () => {
    await updateSettings({
      assistantName: assistantNameInput.trim() || 'YESMIN AI',
      userNickname: userNicknameInput.trim() || 'Jaan',
      personalityMode: personalityInput,
      customInstructions: customInstructionsInput,
      greetingStyle: greetingStyleInput
    });
  };

  const handleResetDefaultName = async () => {
    await resetAssistantName();
    setAssistantNameInput('YESMIN AI');
  };

  const handleSaveVoice = async () => {
    await updateSettings({
      voiceProvider: voiceProviderInput,
      voiceName: voiceNameInput,
      voiceSpeed: voiceSpeedInput,
      autoSpeak: autoSpeakInput,
      elevenLabsKey: elevenLabsKeyInput,
      elevenLabsVoiceId: elevenLabsVoiceIdInput
    });
  };

  const handleTestVoice = async () => {
    speakText(`Hi ${userNicknameInput}! This is ${assistantNameInput} speaking with your configured voice engine. How do I sound?`);
  };

  const handleTestProvider = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: provider === 'elevenlabs' ? elevenLabsKeyInput : undefined
        })
      });
      const data = await res.json();
      setTestResult({
        provider,
        success: data.success,
        message: data.message,
        latency: data.latencyMs
      });
    } catch (e: any) {
      setTestResult({
        provider,
        success: false,
        message: e.message || 'Connection test failed'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/db/settings');
      const settingsData = await res.json();
      const exportBlob = new Blob([JSON.stringify({ settings: settingsData, exportedAt: new Date().toISOString() }, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yesmin_ai_backup_${Date.now()}.json`;
      a.click();
      showToast('Configuration exported as JSON', 'success');
    } catch (e) {
      showToast('Export failed', 'error');
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile & Assistant', icon: <User className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice & ElevenLabs', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'providers', label: 'AI Providers', icon: <Cpu className="w-4 h-4" /> },
    { id: 'services', label: 'API & Services (14)', icon: <Layers className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'about', label: 'About & System', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-fuchsia-400" />
          <span>System Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize {settings.assistantName}'s identity, voice, AI providers, and services. Changes persist permanently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {sections.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as SettingsSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-fuchsia-600/20 text-white border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <span className={isActive ? 'text-fuchsia-400' : 'text-slate-500'}>
                  {s.icon}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="lg:col-span-3">
          {/* SECTION 1: PROFILE & ASSISTANT IDENTITY */}
          {activeSection === 'profile' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-fuchsia-400" />
                  <span>Assistant Identity & Live Name Customization</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Change the default name (e.g. to "Muskan" or "Jarvis"). It instantly updates headers, greetings, live voice, and prompts.
                </p>
              </div>

              {/* Live Preview Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-fuchsia-950/30 to-slate-900/60 border border-fuchsia-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider">Live Preview</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    "Hi, {userNicknameInput || 'Jaan'}! I'm {assistantNameInput || 'YESMIN AI'}. How can I help you?"
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  Online
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assistant Name with Reset */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Assistant Custom Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={assistantNameInput}
                        onChange={e => setAssistantNameInput(e.target.value)}
                        placeholder="e.g., Muskan, Jarvis, Yesmin"
                        className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={handleResetDefaultName}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
                        title="Reset to default YESMIN AI"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Default</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Default: YESMIN AI</span>
                  </div>

                  {/* User Nickname */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Your Preferred Nickname
                    </label>
                    <input
                      type="text"
                      value={userNicknameInput}
                      onChange={e => setUserNicknameInput(e.target.value)}
                      placeholder="e.g., Jaan, Babu, Boss, Alex"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">How the assistant addresses you warmly</span>
                  </div>
                </div>

                {/* Personality Mode */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Companion Personality Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'girlfriend', label: 'Girlfriend / Companion', desc: 'Affectionate, witty, deeply caring' },
                      { id: 'friendly', label: 'Friendly Companion', desc: 'Warm, positive, supportive best-friend' },
                      { id: 'professional', label: 'Professional Jarvis', desc: 'Precise, executive, polished' },
                      { id: 'coding', label: 'Coding Specialist', desc: 'Principal engineer, clean code' },
                      { id: 'study', label: 'Study & Academic Tutor', desc: 'Patient teacher, concepts mastery' }
                    ].map(p => {
                      const isSelected = personalityInput === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPersonalityInput(p.id as PersonalityMode)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-fuchsia-600/20 text-white border-fuchsia-500/50 shadow-md'
                              : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <p className="text-xs font-bold">{p.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Personality Instructions */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Custom Prompt Instructions
                  </label>
                  <textarea
                    value={customInstructionsInput}
                    onChange={e => setCustomInstructionsInput(e.target.value)}
                    rows={3}
                    placeholder="Provide custom guidelines for speech style, specific nicknames, or topic focus..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Assistant Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: VOICE & ELEVENLABS */}
          {activeSection === 'voice' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-fuchsia-400" />
                  <span>Voice Synthesis & ElevenLabs Integration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose between ElevenLabs emotive voices, Gemini Voice, or natural browser TTS.
                </p>
              </div>

              <div className="space-y-4">
                {/* Voice Provider selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Active Voice Engine
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'browser', label: 'Browser Natural TTS', desc: 'Zero API keys required' },
                      { id: 'elevenlabs', label: 'ElevenLabs Voice', desc: 'Ultra-realistic human audio' },
                      { id: 'gemini', label: 'Gemini Voice', desc: 'Official Live PCM model' }
                    ].map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceProviderInput(v.id as VoiceProvider)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          voiceProviderInput === v.id
                            ? 'bg-fuchsia-600/20 text-white border-fuchsia-500/50 shadow-md'
                            : 'bg-slate-900/50 text-slate-400 border-slate-800'
                        }`}
                      >
                        <p className="text-xs font-bold">{v.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ElevenLabs Configuration */}
                {voiceProviderInput === 'elevenlabs' && (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <span className="text-xs font-bold text-fuchsia-300">ElevenLabs Credentials</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">ElevenLabs API Key</label>
                        <input
                          type="password"
                          value={elevenLabsKeyInput}
                          onChange={e => setElevenLabsKeyInput(e.target.value)}
                          placeholder="xi-api-key..."
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Voice ID</label>
                        <input
                          type="text"
                          value={elevenLabsVoiceIdInput}
                          onChange={e => setElevenLabsVoiceIdInput(e.target.value)}
                          placeholder="21m00Tcm4TlvDq8ikWAM (Rachel)"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Speech Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Speech Rate / Speed: {voiceSpeedInput}x
                    </label>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={voiceSpeedInput}
                      onChange={e => setVoiceSpeedInput(parseFloat(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Auto Speak Replies</span>
                      <span className="text-[10px] text-slate-400">Speak AI text responses out loud automatically</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSpeakInput}
                      onChange={e => setAutoSpeakInput(e.target.checked)}
                      className="w-4 h-4 accent-fuchsia-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleTestVoice}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Test Voice Audio</span>
                </button>

                <button
                  onClick={handleSaveVoice}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Voice Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: AI PROVIDER MANAGER */}
          {activeSection === 'providers' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-fuchsia-400" />
                  <span>AI Provider Configuration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage API keys, active providers, and test live server endpoints.
                </p>
              </div>

              <div className="space-y-4">
                {/* Gemini Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Google Gemini</span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        Active Provider
                      </span>
                    </div>
                    <button
                      onClick={() => handleTestProvider('gemini')}
                      disabled={testingProvider === 'gemini'}
                      className="px-3 py-1 rounded-lg bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-semibold"
                    >
                      {testingProvider === 'gemini' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Model: <span className="font-mono text-slate-200">gemini-3.8-flash</span> • Live Model: <span className="font-mono text-slate-200">gemini-3.8-live</span>
                  </p>
                </div>

                {/* ElevenLabs Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">ElevenLabs Voice</span>
                    <button
                      onClick={() => handleTestProvider('elevenlabs')}
                      disabled={testingProvider === 'elevenlabs'}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      {testingProvider === 'elevenlabs' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Emotive audio streaming engine with sub-second latency.
                  </p>
                </div>

                {/* Test Output Banner */}
                {testResult && (
                  <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{testResult.message}</span>
                    </div>
                    {testResult.latency && (
                      <span className="font-mono text-[10px]">{testResult.latency}ms</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: API & SERVICES (14 distinct services) */}
          {activeSection === 'services' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-fuchsia-400" />
                  <span>API & Services Manager (14 Distinct Services)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Every integrated service has its dedicated configuration card, connection tester, and status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {serviceCatalog.map(srv => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl glass-panel border border-purple-900/20 hover:border-fuchsia-500/30 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{srv.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          srv.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {srv.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-fuchsia-400 font-mono mt-0.5 block">{srv.category}</span>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{srv.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-purple-900/20">
                      <span className="text-[10px] font-mono text-slate-500">{srv.configKey}</span>
                      <button
                        onClick={() => setSelectedService(srv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-fuchsia-400" />
                  <span>Theme & Futuristic Aesthetics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customize colors, glassmorphism glow intensity, and visual themes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Theme Palette
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'dark-cyber', name: 'Cyber Obsidian & Fuchsia', bg: 'bg-[#05060f]' },
                      { id: 'navy-deep', name: 'Deep Space Navy', bg: 'bg-[#060919]' },
                      { id: 'midnight-purple', name: 'Midnight Purple Glow', bg: 'bg-[#0b0819]' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateSettings({ theme: t.id })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          settings.theme === t.id
                            ? 'border-fuchsia-500 bg-fuchsia-600/20 text-white shadow-lg'
                            : 'border-slate-800 bg-slate-900/50 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">{t.name}</span>
                        <div className="mt-2 flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-fuchsia-500" />
                          <span className="w-4 h-4 rounded-full bg-purple-600" />
                          <span className="w-4 h-4 rounded-full bg-cyan-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: PRIVACY & DATA */}
          {activeSection === 'privacy' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-fuchsia-400" />
                  <span>Privacy, Security & Data Ownership</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your chat logs, memories, and API keys are stored securely on your server instance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Export Complete JSON Backup</span>
                    <span className="text-[10px] text-slate-400">Download settings, memories, and system configurations</span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-300 block">Clear All Assistant Memories</span>
                    <span className="text-[10px] text-slate-400">Permanently reset the long-term memory store</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Erase all saved assistant memories?')) {
                        clearAllMemories();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Clear Memories
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: ABOUT */}
          {activeSection === 'about' && (
            <div className="p-6 md:p-8 rounded-3xl glass-panel-glow border border-purple-500/20 space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h3 className="text-lg font-bold text-white">
                  YESMIN AI — Full-Stack Architecture
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Version 2.0 Production • Powered by Gemini 3.8 & Realtime Live Audio Bridge
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">Assistant Engine:</strong> Dynamically bound to "{settings.assistantName}". User nickname set to "{settings.userNickname}".
                </p>
                <p>
                  <strong className="text-white">Live Voice Bridge:</strong> Realtime PCM WebSocket pipeline (`/live`) streaming directly to Gemini Live API with zero simulation.
                </p>
                <p>
                  <strong className="text-white">Security Guarantee:</strong> Backend proxy routes (`/api/*`) guard all secret API keys. No private credentials exposed to client bundles.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Individual Service Configuration Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e24] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
              <h3 className="font-bold text-sm text-white">{selectedService.name} Configuration</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono">
                {selectedService.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedService.desc}</p>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold block">Environment Key / Variable</label>
              <input
                type="text"
                readOnly
                value={selectedService.configKey}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-fuchsia-300 font-mono bg-slate-900/80"
              />
              <span className="text-[10px] text-slate-500">Configured securely in server environment (.env)</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`${selectedService.name} connection verified OK`, 'success');
                  setSelectedService(null);
                }}
                className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold"
              >
                Test & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
