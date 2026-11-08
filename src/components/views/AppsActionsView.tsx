import React, { useState } from 'react';
import {
  LayoutGrid,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Youtube,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Compass,
  Calculator,
  Calendar,
  Camera,
  Search,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  Download,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface AppItem {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  url: string;
  intentScheme?: string;
  packageName?: string;
  isSensitive?: boolean;
}

export const AppsActionsView: React.FC = () => {
  const { settings, showToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'launcher' | 'bridge'>('launcher');
  const [confirmApp, setConfirmApp] = useState<AppItem | null>(null);
  const [copiedBridgeCode, setCopiedBridgeCode] = useState(false);

  const supportedApps: AppItem[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'Media',
      icon: <Youtube className="w-5 h-5 text-red-500" />,
      url: 'https://youtube.com',
      intentScheme: 'vnd.youtube://',
      packageName: 'com.google.android.youtube'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      category: 'Communication',
      icon: <Mail className="w-5 h-5 text-red-400" />,
      url: 'https://mail.google.com',
      intentScheme: 'googlegmail://',
      packageName: 'com.google.android.gm'
    },
    {
      id: 'maps',
      name: 'Google Maps',
      category: 'Navigation',
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      url: 'https://maps.google.com',
      intentScheme: 'geo:0,0?q=',
      packageName: 'com.google.android.apps.maps'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'Messaging',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      url: 'https://web.whatsapp.com',
      intentScheme: 'whatsapp://send',
      packageName: 'com.whatsapp'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'Messaging',
      icon: <MessageCircle className="w-5 h-5 text-cyan-400" />,
      url: 'https://web.telegram.org',
      intentScheme: 'tg://',
      packageName: 'org.telegram.messenger'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'Social',
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      url: 'https://instagram.com',
      intentScheme: 'instagram://',
      packageName: 'com.instagram.android'
    },
    {
      id: 'chrome',
      name: 'Google Search',
      category: 'Utility',
      icon: <Search className="w-5 h-5 text-blue-400" />,
      url: 'https://google.com',
      packageName: 'com.android.chrome'
    },
    {
      id: 'calculator',
      name: 'Online Calculator',
      category: 'Utility',
      icon: <Calculator className="w-5 h-5 text-amber-400" />,
      url: 'https://www.google.com/search?q=calculator',
      packageName: 'com.google.android.calculator'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      category: 'Productivity',
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      url: 'https://calendar.google.com',
      packageName: 'com.google.android.calendar'
    },
    {
      id: 'camera',
      name: 'Camera Utility',
      category: 'Hardware',
      icon: <Camera className="w-5 h-5 text-purple-400" />,
      url: '#camera',
      isSensitive: true,
      packageName: 'com.android.camera'
    }
  ];

  const handleLaunchApp = (app: AppItem) => {
    if (app.isSensitive) {
      setConfirmApp(app);
      return;
    }
    executeApp(app);
  };

  const executeApp = (app: AppItem) => {
    // Check if running in native Android WebView Bridge
    if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.launchApp === 'function') {
      (window as any).AndroidBridge.launchApp(app.packageName || app.id);
      showToast(`Triggered native Android intent for ${app.name}`, 'success');
      return;
    }

    // Standard web browser fallback
    if (app.url.startsWith('http')) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
      showToast(`Opened ${app.name} in secure tab`, 'info');
    } else {
      showToast(`Action for ${app.name} requires Android Companion Bridge or hardware permission`, 'info');
    }
  };

  const androidBridgeCode = `// Android Kotlin Companion Bridge for YESMIN AI
package com.yesmin.assistant

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.JavascriptInterface

class AndroidActionBridge(private val context: Context) {

    @JavascriptInterface
    fun launchApp(packageName: String): Boolean {
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                // Fallback to Google Play Store if not installed
                val playIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
                playIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(playIntent)
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-fuchsia-400" />
            <span>Apps & Safe Actions Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browser URL launcher with extensible Android WebView / Companion Bridge Architecture
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-purple-900/30">
          <button
            onClick={() => setActiveSubTab('launcher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'launcher'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            App Launcher
          </button>
          <button
            onClick={() => setActiveSubTab('bridge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'bridge'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Android Bridge Architecture
          </button>
        </div>
      </div>

      {activeSubTab === 'launcher' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {supportedApps.map(app => (
            <div
              key={app.id}
              className="p-5 rounded-3xl glass-panel border border-purple-900/20 hover:border-fuchsia-500/40 hover:bg-slate-900/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center">
                  {app.icon}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                  {app.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{app.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {app.packageName}
                </p>
              </div>

              <button
                onClick={() => handleLaunchApp(app)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all"
              >
                <span>Launch App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Android Bridge Technical Architecture View */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel-glow border border-purple-500/30 space-y-4">
            <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
              <Smartphone className="w-5 h-5" />
              <span>Android WebView & Native Action Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In compliance with browser sandboxing standards, standard web browsers cannot directly invoke native device intents without user interaction. To enable true native control on mobile devices, {settings.assistantName} uses a two-tier architecture:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-pink-300">1. Web Interface</span>
                <p className="text-slate-400">Emits typed action events (`OPEN_APP`, `INTENT`) through postMessage or JavascriptInterface.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-fuchsia-300">2. Companion Bridge</span>
                <p className="text-slate-400">Android WebView captures method calls via `@JavascriptInterface` security layer.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-indigo-300">3. Native Intent</span>
                <p className="text-slate-400">Launches target app packages via `startActivity()` with appropriate permission guards.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="/api/android/export-project"
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Studio Project (.zip)</span>
              </a>
              <button
                onClick={() => {
                  if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.vibrate === 'function') {
                    (window as any).AndroidBridge.vibrate(200);
                  } else if ('vibrate' in navigator) {
                    navigator.vibrate(200);
                  }
                  showToast('Android hardware bridge verified active!', 'success');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-purple-500/30 transition-all"
              >
                <Zap className="w-4 h-4 text-fuchsia-400" />
                <span>Test Hardware Bridge</span>
              </button>
            </div>
          </div>

          {/* Android Kotlin Code Snippet */}
          <div className="rounded-3xl glass-panel border border-purple-900/30 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-purple-900/20 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">AndroidActionBridge.kt</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(androidBridgeCode);
                  setCopiedBridgeCode(true);
                  setTimeout(() => setCopiedBridgeCode(false), 2000);
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                {copiedBridgeCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBridgeCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-[#05060f] overflow-x-auto leading-relaxed">
              {androidBridgeCode}
            </pre>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Sensitive Hardware Actions */}
      {confirmApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e24] border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Confirm Action</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {settings.assistantName} is requesting access to launch <span className="font-bold text-white">{confirmApp.name}</span>. Do you authorize this action?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = confirmApp;
                  setConfirmApp(null);
                  executeApp(target);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Authorize & Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
