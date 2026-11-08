import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Volume2,
  VolumeX,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AiOrb } from '../AiOrb.tsx';

export const LiveVoiceView: React.FC = () => {
  const {
    settings,
    assistantState,
    setAssistantState,
    speakText,
    isSpeaking,
    stopSpeaking
  } = useApp();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('Press "Start Live Call" to begin speaking with ' + settings.assistantName);
  const [modelSpokenText, setModelSpokenText] = useState<string>('');

  // Audio Context References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  // Fallback Web Speech Recognition
  const speechRecRef = useRef<any>(null);

  isMutedRef.current = isMuted;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endLiveCall();
    };
  }, []);

  // Helper: Convert Float32Array PCM to 16-bit linear PCM Little-Endian Base64
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Play 24kHz 16-bit PCM audio chunk received from Gemini Live
  const playLiveAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }

    const ctx = outputAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextPlayTimeRef.current < currentTime) {
      nextPlayTimeRef.current = currentTime;
    }

    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;

    audioQueueRef.current.push(source);
    setAssistantState('speaking');

    source.onended = () => {
      audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
      if (audioQueueRef.current.length === 0) {
        setAssistantState('listening');
      }
    };
  };

  // Clear audio queue upon user interruption
  const clearAudioQueue = () => {
    for (const source of audioQueueRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    }
    audioQueueRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setAssistantState('listening');
  };

  // Start Gemini Live Call
  const startLiveCall = async () => {
    setErrorMsg(null);
    setIsConnecting(true);
    setLiveTranscript('Requesting microphone permission...');

    try {
      // 1. Get Microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      // 2. Setup 16kHz input AudioContext
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      inputAudioCtxRef.current = inputCtx;

      // 3. Connect WebSocket to server Gemini Live bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setAssistantState('listening');
        setLiveTranscript(`Connected! Listening to you, ${settings.userNickname}... Speak naturally in Hindi, Hinglish, or English.`);

        // Setup audio processor to stream mic data to WebSocket
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const base64Pcm = floatTo16BitPCMBase64(inputData);
          ws.send(JSON.stringify({ audio: base64Pcm }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playLiveAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            clearAudioQueue();
          }
          if (msg.outputTranscript) {
            setModelSpokenText(prev => prev + ' ' + msg.outputTranscript);
          }
          if (msg.inputTranscript) {
            setLiveTranscript(`You: "${msg.inputTranscript}"`);
          }
          if (msg.error) {
            setErrorMsg(msg.error);
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Live error:', err);
        // If Live API server handshake failed (e.g. key issue), activate fallback voice interaction
        startFallbackVoiceMode();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setAssistantState('idle');
      };
    } catch (err: any) {
      console.warn('Microphone or Live API error:', err);
      setIsConnecting(false);
      setErrorMsg(err.message || 'Microphone access denied or connection failed.');
      startFallbackVoiceMode();
    }
  };

  // Fallback Voice Mode: uses browser SpeechRecognition + Streaming AI + TTS
  const startFallbackVoiceMode = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Live audio connection failed and Web Speech is not available.');
      return;
    }

    setIsConnected(true);
    setIsConnecting(false);
    setAssistantState('listening');
    setLiveTranscript(`Live Voice Fallback Mode active. Speak to ${settings.assistantName}...`);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        const lastIdx = event.results.length - 1;
        const text = event.results[lastIdx][0].transcript;
        if (!text.trim()) return;

        setLiveTranscript(`You: "${text}"`);
        setAssistantState('thinking');

        // Query AI
        try {
          const res = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: text })
          });
          if (res.ok) {
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let aiText = '';
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;
              const chunkStr = decoder.decode(value);
              for (const line of chunkStr.split('\n\n')) {
                if (line.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(line.replace('data: ', ''));
                    if (parsed.chunk) aiText += parsed.chunk;
                  } catch (e) {}
                }
              }
            }
            setModelSpokenText(aiText);
            speakText(aiText);
          }
        } catch (e) {
          console.error(e);
        }
      };

      recognition.onerror = () => {};
      recognition.start();
      speechRecRef.current = recognition;
    } catch (e) {
      console.error(e);
    }
  };

  // End Live Call
  const endLiveCall = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (speechRecRef.current) {
      speechRecRef.current.stop();
      speechRecRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    clearAudioQueue();
    stopSpeaking();
    setIsConnected(false);
    setIsConnecting(false);
    setAssistantState('idle');
    setLiveTranscript(`Live session ended with ${settings.assistantName}.`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 max-w-4xl mx-auto w-full h-[calc(100vh-4rem)] relative select-none">
      {/* Top Header & Status */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>{settings.assistantName} Live Voice</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                Realtime PCM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Low-latency conversational voice engine with user interruption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>{isConnected ? 'Session Active' : 'Standby'}</span>
          </div>
        </div>
      </div>

      {/* Center Interactive Orb with Waveform Aura */}
      <div className="flex flex-col items-center justify-center my-auto space-y-8 w-full max-w-lg">
        <div className="relative">
          <AiOrb size="xl" interactive={false} />
          {isConnected && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-fuchsia-500 to-pink-400 rounded-full audio-bar h-10"
                  style={{
                    animationDelay: `${(i * 0.12).toFixed(2)}s`,
                    opacity: isMuted ? 0.2 : 0.85
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Subtitle Transcript Display */}
        <div className="w-full glass-panel-glow rounded-3xl p-5 text-center space-y-2 border border-purple-500/20">
          <div className="flex items-center justify-center gap-1.5 text-xs text-pink-300 font-semibold">
            <Heart className="w-3.5 h-3.5 fill-pink-400/40" />
            <span>{settings.assistantName} & {settings.userNickname}</span>
          </div>
          <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed min-h-[3rem] flex items-center justify-center">
            {liveTranscript}
          </p>
          {modelSpokenText && (
            <p className="text-xs text-fuchsia-300 italic pt-1 border-t border-purple-900/30">
              "{modelSpokenText.slice(-120)}"
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left w-full">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Control Buttons Bottom Bar */}
      <div className="w-full flex items-center justify-center gap-4 py-4">
        {!isConnected ? (
          <button
            onClick={startLiveCall}
            disabled={isConnecting}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-base shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all transform hover:scale-105 active:scale-95"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Connecting Live Bridge...</span>
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Start Live Call</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {/* Mute Mic */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={`p-4 rounded-3xl border transition-all ${
                isMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endLiveCall}
              className="flex items-center gap-2 px-8 py-4 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all hover:scale-102"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
