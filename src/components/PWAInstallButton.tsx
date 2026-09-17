import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Apple, X, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'floating' | 'sidebar' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as standalone native PWA, show verified status or hide
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Installed as App</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt modal for devices that don't emit beforeinstallprompt immediately
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install JustClub Mobile / Desktop App"
        className={`flex items-center gap-1.5 font-bold transition-all active:scale-95 shadow-sm ${
          variant === 'sidebar'
            ? 'w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-purple-900/30'
            : 'px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-white text-xs'
        }`}
      >
        {isIOS ? (
          <Apple className="w-3.5 h-3.5 text-slate-300" />
        ) : isAndroid ? (
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Download className="w-3.5 h-3.5 text-purple-400" />
        )}
        <span>{isIOS ? 'Install on iOS' : isAndroid ? 'Install APK/PWA' : 'Install App'}</span>
      </button>

      {/* iOS / Mobile Installation Helper Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Install JustClub PWA</h3>
                    <p className="text-xs text-slate-400">Android & iOS App Experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Apple className="w-3.5 h-3.5" /> For iPhone & iPad (Safari):
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                    <li>Tap the <strong className="text-white">Share</strong> button at bottom of Safari.</li>
                    <li>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</li>
                    <li>Tap <strong className="text-white">Add</strong> in top right corner.</li>
                  </ol>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> For Android & Chrome:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                    <li>Tap the 3 dots menu (<strong className="text-white">⋮</strong>) in Chrome.</li>
                    <li>Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.</li>
                    <li>The app will install directly to your app drawer.</li>
                  </ol>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300">
                  ⚡ <strong>PWABuilder Ready:</strong> This app can be converted into standalone Google Play (`.aab`) and Apple App Store packages with zero code changes.
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-900/30"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
