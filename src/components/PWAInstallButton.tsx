import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs whitespace-nowrap shrink-0">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        title="Install CodeAtlas to your desktop or device"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Install on iOS
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add CodeAtlas to your iOS Home Screen for offline access:
              </p>
              <ol className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-4">
                <li>
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in Safari toolbar.
                </li>
                <li>
                  Scroll down and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong className="text-slate-900 dark:text-white">Add</strong> in top right.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-medium text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGenericGuide(true)}
        title="Install CodeAtlas App"
        className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
      >
        <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span>Install</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Install CodeAtlas
              </h3>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div>
                <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">Desktop (Chrome / Edge / Brave):</strong>
                Click the install icon in the address bar or open browser menu &rarr; <em>Install CodeAtlas</em>.
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">Mobile:</strong>
                Tap the browser menu &rarr; <em>Install app</em> or <em>Add to Home screen</em>.
              </div>
            </div>
            <button
              onClick={() => setShowGenericGuide(false)}
              className="mt-5 w-full rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
