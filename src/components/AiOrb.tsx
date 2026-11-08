import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mic, Volume2, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface AiOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  showStatusLabel?: boolean;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  size = 'md',
  interactive = true,
  onClick,
  showStatusLabel = false
}) => {
  const { assistantState, settings } = useApp();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const getStatusColor = () => {
    switch (assistantState) {
      case 'listening':
        return 'from-emerald-400 via-teal-500 to-cyan-500 shadow-emerald-500/50';
      case 'thinking':
        return 'from-amber-400 via-violet-600 to-fuchsia-600 shadow-amber-500/50';
      case 'speaking':
        return 'from-fuchsia-400 via-pink-500 to-rose-500 shadow-pink-500/50';
      default:
        return 'from-fuchsia-500 via-purple-600 to-indigo-700 shadow-purple-500/40';
    }
  };

  const getStatusIcon = () => {
    switch (assistantState) {
      case 'listening':
        return <Mic className="w-5 h-5 text-emerald-300 animate-pulse" />;
      case 'thinking':
        return <Cpu className="w-5 h-5 text-amber-300 animate-spin" />;
      case 'speaking':
        return <Volume2 className="w-5 h-5 text-pink-300 animate-bounce" />;
      default:
        return <Sparkles className="w-5 h-5 text-fuchsia-200" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        onClick={interactive ? onClick : undefined}
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105 ${sizeClasses[size]}`}
      >
        {/* Outer glowing pulsing aura */}
        <motion.div
          animate={{
            scale: assistantState === 'speaking' ? [1, 1.25, 1.05, 1.2] : assistantState === 'listening' ? [1, 1.15, 1] : [1, 1.08, 1],
            opacity: assistantState !== 'idle' ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3]
          }}
          transition={{ repeat: Infinity, duration: assistantState === 'speaking' ? 1.4 : 3, ease: 'easeInOut' }}
          className={`absolute -inset-4 rounded-full blur-2xl bg-gradient-to-tr ${getStatusColor()} opacity-60`}
        />

        {/* Orbiting cyber rings */}
        <div className="absolute inset-0 rounded-full border border-fuchsia-500/30 animate-glow-spin pointer-events-none">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_8px_#ec4899]" />
        </div>
        <div
          className="absolute -inset-2 rounded-full border border-cyan-400/20 pointer-events-none"
          style={{ animation: 'orb-glow-spin 18s linear infinite reverse' }}
        >
          <div className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee]" />
        </div>

        {/* Inner core gradient sphere */}
        <motion.div
          animate={{
            rotate: 360,
            scale: assistantState === 'speaking' ? [0.95, 1.05, 0.98] : [1, 1.02, 1]
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 25, ease: 'linear' },
            scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }}
          className={`w-full h-full rounded-full bg-gradient-to-tr ${getStatusColor()} p-[2px] shadow-2xl relative overflow-hidden flex items-center justify-center`}
        >
          {/* Glass sheen highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-black/60 rounded-full" />

          {/* Soundwave bars inside core when speaking or listening */}
          {(assistantState === 'speaking' || assistantState === 'listening') && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 z-10">
              <span className="w-1 bg-white/80 rounded-full audio-bar h-8" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 bg-white/90 rounded-full audio-bar h-12" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 bg-white rounded-full audio-bar h-16" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 bg-white/90 rounded-full audio-bar h-10" style={{ animationDelay: '0.4s' }} />
              <span className="w-1 bg-white/80 rounded-full audio-bar h-6" style={{ animationDelay: '0.15s' }} />
            </div>
          )}

          {assistantState === 'idle' && (
            <div className="z-10 text-white/90 drop-shadow-md">
              <Sparkles className="w-8 h-8 text-fuchsia-100 animate-pulse" />
            </div>
          )}

          {assistantState === 'thinking' && (
            <div className="z-10 text-white drop-shadow-md">
              <Cpu className="w-8 h-8 text-amber-200 animate-spin" />
            </div>
          )}
        </motion.div>
      </div>

      {showStatusLabel && (
        <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg text-xs">
          {getStatusIcon()}
          <span className="font-semibold text-slate-200 capitalize tracking-wide">
            {assistantState === 'idle' ? `${settings.assistantName} Online` : assistantState}
          </span>
        </div>
      )}
    </div>
  );
};
