import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Zap,
  Layers,
  Copy,
  Check,
  X,
  Play,
  Vibrate,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { settings, showToast } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'studio' | 'bubblewrap' | 'test'>('install');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadAndroidProject = () => {
    window.location.href = '/api/android/export-project';
    showToast('Downloading complete Android Studio Project (.zip)...', 'success');
  };

  const testVibration = () => {
    if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.vibrate === 'function') {
      (window as any).AndroidBridge.vibrate(200);
      showToast('Native Android Vibrate triggered via Bridge!', 'success');
    } else if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      showToast('Web Vibration API triggered!', 'success');
    } else {
      showToast('Vibration not supported on this device/browser', 'info');
    }
  };

  const testNativeToast = () => {
    if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.showToast === 'function') {
      (window as any).AndroidBridge.showToast(`Hello from ${settings.assistantName}!`);
      showToast('Native Android Toast triggered!', 'success');
    } else {
      showToast(`Android Bridge active in Web Simulator mode for ${settings.assistantName}`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e24] border border-purple-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-purple-900/30 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-fuchsia-950/20 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{settings.assistantName} Android App Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  APK & PWA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct installation, APK compilation, and native Kotlin source code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-purple-900/20 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'install'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 Direct 1-Click Install
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'studio'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Android Studio Project (.zip)
          </button>
          <button
            onClick={() => setActiveTab('bubblewrap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'bubblewrap'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 1-Command APK / TWA
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'test'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔬 Bridge Hardware Test
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* TAB 1: 1-CLICK INSTALL */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900/50 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Android App Installation</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Installs {settings.assistantName} directly to your home screen as a standalone app with full offline support.
                  </p>
                </div>
                {isInstalled ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Installed</span>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const success = await install();
                      if (!success) {
                        showToast('On Chrome Android: tap 3 dots (⋮) -> "Add to Home screen" or "Install App"', 'info');
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Install on Phone</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Native Standalone Mode</span>
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Zero browser URL bars or navigation buttons. Runs edge-to-edge with system theme status bar tinting.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hardware Mic & Camera Access</span>
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Gemini Live voice conversations and camera vision work smoothly without session drops.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="font-bold text-fuchsia-300">How to install manually on any Android browser:</span>
                <p className="text-slate-400">
                  1. Open this website in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.<br/>
                  2. Tap the browser menu (<strong>⋮</strong> in the top-right corner).<br/>
                  3. Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.<br/>
                  4. The {settings.assistantName} icon will appear directly in your app drawer!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID STUDIO PROJECT (.ZIP) */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-fuchsia-950/30 to-slate-900/60 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Full Android Studio Project (.zip)</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Includes Kotlin MainActivity, WebChromeClient permission guards, and AndroidActionBridge.
                  </p>
                </div>
                <button
                  onClick={handleDownloadAndroidProject}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-fuchsia-500/20 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .zip</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 space-y-2">
                <span className="font-bold text-white">How to compile APK in 1 minute using Android Studio:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                  <li>Download and extract the ZIP file above.</li>
                  <li>Open <strong>Android Studio</strong> and click <strong>Open</strong> &rarr; choose the extracted folder.</li>
                  <li>Allow Gradle to sync for 10-15 seconds.</li>
                  <li>Click top menu <strong>Build</strong> &rarr; <strong>Build Bundle(s) / APK(s)</strong> &rarr; <strong>Build APK(s)</strong>.</li>
                  <li>Your standalone native Android APK is created in <code className="text-fuchsia-300">app/build/outputs/apk/debug/app-debug.apk</code>!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: BUBBLEWRAP 1-COMMAND APK */}
          {activeTab === 'bubblewrap' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                You can generate a signed native Android APK or Play Store Bundle (.aab) with Google's official Bubblewrap tool using our manifest:
              </p>

              <div className="rounded-2xl bg-black border border-purple-900/30 p-4 font-mono text-[11px] text-emerald-400 space-y-2 overflow-x-auto">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                  <span>Terminal Command</span>
                  <button
                    onClick={() => handleCopy(`npx @bubblewrap/cli init --manifest="${window.location.origin}/manifest.webmanifest"\nnpx @bubblewrap/cli build`, 'twa')}
                    className="hover:text-white"
                  >
                    {copiedCode === 'twa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div># 1. Initialize Android APK from your live manifest</div>
                <div>npx @bubblewrap/cli init --manifest="{window.location.origin}/manifest.webmanifest"</div>
                <div className="pt-2"># 2. Compile signed APK / Play Store Bundle</div>
                <div>npx @bubblewrap/cli build</div>
              </div>
            </div>
          )}

          {/* TAB 4: BRIDGE HARDWARE TEST */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Test the bidirectional JavaScript &harr; Android Bridge functions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={testVibration}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-fuchsia-500/40 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center gap-2 text-fuchsia-400 font-bold">
                    <Vibrate className="w-4 h-4" />
                    <span>Test Device Vibration</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Triggers haptic feedback via AndroidBridge.vibrate()</p>
                </button>

                <button
                  onClick={testNativeToast}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-fuchsia-500/40 text-left space-y-1 transition-all"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Bell className="w-4 h-4" />
                    <span>Test Native Toast</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Invokes Android Toast notification via AndroidBridge.showToast()</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
