import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  onOpenAndroidModal?: () => void;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenAndroidModal,
  className = ''
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  return (
    <button
      onClick={() => {
        if (isInstallable) {
          install();
        } else if (onOpenAndroidModal) {
          onOpenAndroidModal();
        }
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ${className}`}
      title="Install Android App"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
};
