import React, { useState } from 'react';
import {
  Mic,
  Radio,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Plus,
  Heart,
  Bot,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AndroidAppModal } from './AndroidAppModal.tsx';

export const Navbar: React.FC = () => {
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const {
    settings,
    activeTab,
    setActiveTab,
    assistantState,
    createNewConversation,
    isSpeaking,
    stopSpeaking
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-purple-900/30 bg-[#070919]/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Dynamic Assistant Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 shadow-[0_0_15px_rgba(217,70,239,0.35)] group-hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-all">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#070919] rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-fuchsia-200 to-pink-400 bg-clip-text text-transparent">
                {settings.assistantName}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                JARVIS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="capitalize text-[11px] text-slate-300">
                {assistantState === 'idle' ? 'Ready for Jaan' : assistantState}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Center status pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-purple-500/20 text-xs">
        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
        <span className="text-slate-300">Companion to</span>
        <span className="font-bold text-pink-300">{settings.userNickname}</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400 capitalize">{settings.personalityMode} Mode</span>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Quick New Chat */}
        <button
          onClick={() => {
            createNewConversation();
            setActiveTab('chat');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-medium transition-all"
          title="New Chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Live Voice Shortcut */}
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
            activeTab === 'live'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30'
              : 'bg-slate-900/80 hover:bg-fuchsia-950/40 text-pink-300 border border-pink-500/30'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Live Call</span>
        </button>

        {/* Mute / Stop Speaking button if active */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all animate-bounce"
            title="Stop Speaking"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        )}

        {/* Android App Button */}
        <button
          onClick={() => setShowAndroidModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
          title="Android App APK & Install"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Android App</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-purple-900/30'
          }`}
          title="Settings & Profile"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      <AndroidAppModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </header>
  );
};
