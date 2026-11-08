import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Play,
  Code2,
  FileCode,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Layers,
  BatteryCharging,
  Wifi,
  Signal,
  ArrowLeft,
  Circle,
  Square,
  MessageSquare,
  Calculator,
  FileText,
  Clock,
  Mic,
  Send,
  Zap,
  Cpu,
  Sliders,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

type AndroidPresetApp = 'companion' | 'calculator' | 'notes' | 'stopwatch' | 'custom';

export const AndroidAppBuilderView: React.FC = () => {
  const { settings, showToast } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [activeApp, setActiveApp] = useState<AndroidPresetApp>('companion');
  const [activeCodeTab, setActiveCodeTab] = useState<'kotlin' | 'layout' | 'manifest' | 'gradle'>('kotlin');
  const [copied, setCopied] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  // Custom Generated App State
  const [customAppName, setCustomAppName] = useState<string>('');
  const [customAppSummary, setCustomAppSummary] = useState<string>('');
  const [customAppFeatures, setCustomAppFeatures] = useState<string[]>([]);
  const [customAppPreviewHtml, setCustomAppPreviewHtml] = useState<string>('');

  // Code Snippets State (initially holds Companion App code, dynamically replaced by AI generator)
  const [codeSnippets, setCodeSnippets] = useState({
    kotlin: `package ai.yesmin.companion

import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.mainWebView)
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.mediaPlaybackRequiresUserGesture = false

        // Bridge for native Android hardware interaction
        webView.addJavascriptInterface(AndroidActionBridge(this), "AndroidBridge")
        webView.webChromeClient = WebChromeClient()
        webView.loadUrl("https://yesmin.ai")
    }
}`,
    layout: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#05060f">

    <WebView
        android:id="@+id/mainWebView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`,
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ai.yesmin.companion">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${settings.assistantName}"
        android:theme="@style/Theme.Companion">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    gradle: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ai.yesmin.companion"
    compileSdk = 34

    defaultConfig {
        applicationId = "ai.yesmin.companion"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
}`
  });

  // Mini App States inside Simulator
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [notes, setNotes] = useState<string[]>([
    'Meeting with Jaan at 5 PM',
    'Review Android Manifest permissions',
    'YESMIN AI companion ideas'
  ]);
  const [newNote, setNewNote] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [simChatMessages, setSimChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: `Hi ${settings.userNickname}! YESMIN Android companion is active.` }
  ]);

  // Stopwatch timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateCustomApp = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim() || isBuilding) return;

    setIsBuilding(true);
    showToast(`Compiling Android App for "${targetPrompt}"...`, 'info');

    try {
      const resp = await fetch('/api/android/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt })
      });

      if (!resp.ok) {
        throw new Error('Server error generating Android app');
      }

      const data = await resp.json();
      if (data.success) {
        setCustomAppName(data.appName);
        setCustomAppSummary(data.summary);
        setCustomAppFeatures(data.features || []);
        setCustomAppPreviewHtml(data.previewHtml);
        setCodeSnippets({
          kotlin: data.kotlinCode,
          layout: data.layoutXml,
          manifest: data.manifestXml,
          gradle: data.gradleCode
        });
        setActiveApp('custom');
        showToast(`Android App "${data.appName}" compiled successfully!`, 'success');
        setPrompt('');
      } else {
        throw new Error(data.error || 'Failed to build app');
      }
    } catch (err: any) {
      console.error('App generation error:', err);
      showToast('Could not compile custom app. Try again.', 'error');
    } finally {
      setIsBuilding(false);
    }
  };

  const downloadApkUrl = customAppName
    ? `/api/android/download-apk?appName=${encodeURIComponent(customAppName)}`
    : '/api/android/download-apk';

  const downloadProjectUrl = customAppName
    ? `/api/android/export-project?appName=${encodeURIComponent(customAppName)}`
    : '/api/android/export-project';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Smartphone className="w-7 h-7 text-emerald-400" />
            <span>Android App Studio & APK Builder</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build, test in real-time Android simulator, and compile native Android APKs
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={downloadApkUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {customAppName ? `${customAppName} (.apk)` : 'APK (.apk)'}</span>
          </a>

          <a
            href={downloadProjectUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-purple-500/30 transition-all"
          >
            <Download className="w-4 h-4 text-fuchsia-400" />
            <span>Android Studio Project (.zip)</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Android Simulator Left + Builder Controls Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: REALISTIC ANDROID SMARTPHONE SIMULATOR */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Android 15 Virtual Device Emulator</span>
          </div>

          {/* Android Phone Chassis */}
          <div className="relative w-[320px] h-[640px] bg-slate-950 rounded-[48px] p-3.5 shadow-[0_0_50px_rgba(16,185,129,0.25)] border-[5px] border-slate-700/80 flex flex-col justify-between">
            {/* Screen Glass */}
            <div className="w-full h-full bg-[#070919] rounded-[36px] overflow-hidden flex flex-col justify-between border border-slate-800 relative">
              {/* Top Android Status Bar */}
              <div className="h-7 w-full px-5 flex items-center justify-between text-[11px] font-semibold text-slate-300 bg-slate-900/60 z-20">
                <span>09:41</span>
                {/* Punch-hole camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700/60" />
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Screen Content: Active Android App */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between text-xs">
                {/* 1. COMPANION APP */}
                {activeApp === 'companion' && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-fuchsia-600/30 to-purple-600/20 border border-fuchsia-500/40 text-center">
                      <h4 className="font-extrabold text-sm text-white">{settings.assistantName} Mobile</h4>
                      <p className="text-[10px] text-fuchsia-200 mt-0.5">Hi {settings.userNickname}! Android core online.</p>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px]">
                      {simChatMessages.map((m, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl text-[11px] max-w-[85%] ${
                            m.role === 'user'
                              ? 'ml-auto bg-fuchsia-600 text-white'
                              : 'mr-auto bg-slate-900 text-slate-200 border border-slate-800'
                          }`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center gap-1 pt-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && chatInput.trim()) {
                            setSimChatMessages(prev => [
                              ...prev,
                              { role: 'user', text: chatInput },
                              { role: 'assistant', text: `Haan ${settings.userNickname}, I received your mobile command!` }
                            ]);
                            setChatInput('');
                          }
                        }}
                        placeholder="Say something to companion..."
                        className="flex-1 px-3 py-1.5 text-[11px] rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!chatInput.trim()) return;
                          setSimChatMessages(prev => [
                            ...prev,
                            { role: 'user', text: chatInput },
                            { role: 'assistant', text: `Haan ${settings.userNickname}, received on Android!` }
                          ]);
                          setChatInput('');
                        }}
                        className="p-1.5 rounded-xl bg-fuchsia-600 text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CALCULATOR APP */}
                {activeApp === 'calculator' && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-900 text-right font-mono text-2xl font-bold text-emerald-400 border border-slate-800">
                      {calcDisplay}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center font-bold text-sm">
                      {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '⌫', '='].map(btn => (
                        <button
                          key={btn}
                          onClick={() => {
                            if (btn === 'C') setCalcDisplay('0');
                            else if (btn === '⌫') setCalcDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
                            else if (btn === '=') {
                              try {
                                setCalcDisplay(String(eval(calcDisplay)));
                              } catch {
                                setCalcDisplay('Error');
                              }
                            } else {
                              setCalcDisplay(d => d === '0' ? btn : d + btn);
                            }
                          }}
                          className={`p-3 rounded-xl transition-all ${
                            btn === '='
                              ? 'bg-emerald-600 text-white'
                              : ['/', '*', '-', '+'].includes(btn)
                              ? 'bg-fuchsia-600/30 text-fuchsia-300'
                              : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. NOTES APP */}
                {activeApp === 'notes' && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-white text-xs">Android Quick Notes</span>
                      <span className="text-[10px] text-fuchsia-400">{notes.length} items</span>
                    </div>
                    <div className="space-y-1.5 flex-1 overflow-y-auto">
                      {notes.map((n, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                          {n}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 pt-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Add new note..."
                        className="flex-1 px-3 py-1.5 text-[11px] rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newNote.trim()) {
                            setNotes(prev => [newNote, ...prev]);
                            setNewNote('');
                          }
                        }}
                        className="px-3 py-1.5 bg-fuchsia-600 rounded-xl text-white font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. STOPWATCH APP */}
                {activeApp === 'stopwatch' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <span className="text-4xl font-mono font-bold text-emerald-400">
                      {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                          timerRunning ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {timerRunning ? 'Pause' : 'Start'}
                      </button>
                      <button
                        onClick={() => {
                          setTimerRunning(false);
                          setTimerSeconds(0);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. CUSTOM AI-GENERATED ANDROID APP */}
                {activeApp === 'custom' && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {customAppPreviewHtml ? (
                      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-[#070919] relative">
                        <iframe
                          title={customAppName || 'Custom Android App'}
                          srcDoc={customAppPreviewHtml}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-modals"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
                        <h4 className="font-bold text-white text-sm">{customAppName || 'Generated App'}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{customAppSummary || 'Ready to run on device'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Android System Navigation Bar */}
              <div className="h-10 w-full px-10 flex items-center justify-around bg-black text-slate-500 border-t border-slate-900 z-20">
                <button onClick={() => showToast('Android Back Key triggered', 'info')} className="hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveApp('companion')} className="hover:text-white">
                  <Circle className="w-4 h-4" />
                </button>
                <button onClick={() => showToast('Android Recents triggered', 'info')} className="hover:text-white">
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* App Switcher Buttons for Simulator */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {[
              { id: 'companion', label: 'YESMIN Companion', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              ...(customAppName
                ? [{ id: 'custom', label: `★ ${customAppName}`, icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> }]
                : []),
              { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
              { id: 'notes', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'stopwatch', label: 'Stopwatch', icon: <Clock className="w-3.5 h-3.5" /> }
            ].map(app => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id as AndroidPresetApp)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeApp === app.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {app.icon}
                <span>{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ANDROID BUILDER CONTROLS & CODE INSPECTOR */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Input Bar */}
          <div className="p-5 rounded-3xl glass-panel-glow border border-emerald-500/30 space-y-3">
            <span className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Android App Generator</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Prompt anything in English or Hinglish (e.g., "Compass app bana do")
              </span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateCustomApp()}
                placeholder='e.g., "Build an Android fitness tracker app", "Flashlight & SOS tool", "Expense tracker"'
                className="flex-1 px-4 py-2.5 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => handleGenerateCustomApp()}
                disabled={isBuilding || !prompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {isBuilding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isBuilding ? 'Building APK...' : 'Build App'}</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Try:</span>
              {[
                'Fitness Tracker & Step Counter',
                'Flashlight & Smart Compass',
                'Daily Expense Tracker',
                'Audio Recorder with Waveform'
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => {
                    setPrompt(chip);
                    handleGenerateCustomApp(chip);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[10px] transition-all"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Install Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Direct APK Download</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">v1.0.0</span>
              </div>
              <p className="text-xs text-slate-400">
                Install directly onto any Android phone or tablet without compilation.
              </p>
              <div className="pt-2">
                <a
                  href={downloadApkUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {customAppName ? `${customAppName} (.apk)` : '.apk File'}</span>
                </a>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Android Studio Project</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono">Full Kotlin</span>
              </div>
              <p className="text-xs text-slate-400">Full source code with Gradle scripts, manifests, and WebView permissions.</p>
              <div className="pt-2">
                <a
                  href={downloadProjectUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Project .zip</span>
                </a>
              </div>
            </div>
          </div>

          {/* Features Pill List if Custom App */}
          {customAppFeatures.length > 0 && (
            <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{customAppName} Native Architecture Features</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customAppFeatures.map((f, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 text-center font-medium">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Inspector Tabs */}
          <div className="rounded-3xl glass-panel border border-purple-900/30 overflow-hidden">
            <div className="p-3 bg-slate-900/90 border-b border-purple-900/20 flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'kotlin', label: 'MainActivity.kt' },
                  { id: 'layout', label: 'activity_main.xml' },
                  { id: 'manifest', label: 'AndroidManifest.xml' },
                  { id: 'gradle', label: 'build.gradle.kts' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCodeTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeCodeTab === tab.id
                        ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(codeSnippets[activeCodeTab], activeCodeTab)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                {copied === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === activeCodeTab ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-5 font-mono text-xs text-slate-200 bg-[#05060f] overflow-x-auto leading-relaxed max-h-[300px]">
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
