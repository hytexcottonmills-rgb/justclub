import React from 'react';
import { usePWAInstall, DevicePlatform } from '../hooks/usePWAInstall';
import { Smartphone, Laptop, Download, X, Sparkles, CheckCircle2, Apple, Chrome, Compass, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  appName?: string;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
  appName = 'JustClub',
}) => {
  const { isInstallable, isInstalled, devicePlatform, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallTrigger = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const getPlatformLabel = (p: DevicePlatform) => {
    switch (p) {
      case 'ios':
        return 'iPhone & iPad';
      case 'android':
        return 'Android';
      case 'windows':
        return 'Windows';
      case 'mac':
        return 'Mac';
      default:
        return 'Your Device';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6">
        <div className="min-h-full flex items-center justify-center py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden relative my-auto ${
              isDarkMode
                ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full transition z-10 ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content Padding Container */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Hero Banner */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Web App & Desktop Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                Make yourself at home.
              </h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Open {appName} in your browser or add it to your device for a fast, app-style window.
              </p>
            </div>

            {/* Inner Section Container */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Add {appName} to your device</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No installer files, app store accounts, or developer permissions needed.
                  </p>
                </div>

                {/* Direct Native Install Button if browser supports beforeinstallprompt */}
                {isInstallable && !isInstalled && (
                  <button
                    onClick={handleInstallTrigger}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install One-Click App</span>
                  </button>
                )}

                {isInstalled && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>App Currently Installed</span>
                  </div>
                )}
              </div>

              {/* 4 Platform Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. iPhone & iPad */}
                <div
                  className={`p-5 rounded-xl border transition relative flex flex-col justify-between ${
                    devicePlatform === 'ios'
                      ? (isDarkMode ? 'bg-indigo-950/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-300')
                      : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm">iPhone & iPad</h4>
                      </div>
                      {devicePlatform === 'ios' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                          YOUR DEVICE
                        </span>
                      )}
                    </div>

                    <ol className={`space-y-2 text-xs list-decimal list-inside ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li>Open this website in <strong>Safari</strong>.</li>
                      <li>Tap the <strong>Share</strong> icon, then tap <strong>Add to Home Screen</strong>.</li>
                      <li>Enable <strong>Open as Web App</strong> if shown, then tap <strong>Add</strong>.</li>
                    </ol>
                  </div>

                  <p className={`mt-4 pt-3 border-t text-[11px] leading-relaxed ${
                    isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-500'
                  }`}>
                    Open the new home-screen icon before enabling notifications. Web push requires iOS 16.4+.
                  </p>
                </div>

                {/* 2. Android */}
                <div
                  className={`p-5 rounded-xl border transition relative flex flex-col justify-between ${
                    devicePlatform === 'android'
                      ? (isDarkMode ? 'bg-indigo-950/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-300')
                      : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm">Android</h4>
                      </div>
                      {devicePlatform === 'android' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                          YOUR DEVICE
                        </span>
                      )}
                    </div>

                    <ol className={`space-y-2 text-xs list-decimal list-inside ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li>Open the website in <strong>Chrome</strong>.</li>
                      <li>Open browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                      <li>Follow the browser's quick installation prompt.</li>
                    </ol>
                  </div>

                  {isInstallable && devicePlatform === 'android' && (
                    <button
                      onClick={handleInstallTrigger}
                      className="mt-4 w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition shadow-sm"
                    >
                      Install Android App Now
                    </button>
                  )}
                </div>

                {/* 3. Windows */}
                <div
                  className={`p-5 rounded-xl border transition relative flex flex-col justify-between ${
                    devicePlatform === 'windows'
                      ? (isDarkMode ? 'bg-indigo-950/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-300')
                      : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm">Windows</h4>
                      </div>
                      {devicePlatform === 'windows' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                          YOUR DEVICE
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Use Edge or Chrome. Choose the <strong>install icon</strong> in the address bar (or browser's <strong>Apps / Install {appName}</strong> menu).
                    </p>
                  </div>

                  {isInstallable && devicePlatform === 'windows' && (
                    <button
                      onClick={handleInstallTrigger}
                      className="mt-4 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
                    >
                      Install Windows Desktop App
                    </button>
                  )}
                </div>

                {/* 4. Mac */}
                <div
                  className={`p-5 rounded-xl border transition relative flex flex-col justify-between ${
                    devicePlatform === 'mac'
                      ? (isDarkMode ? 'bg-indigo-950/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-300')
                      : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm">Mac</h4>
                      </div>
                      {devicePlatform === 'mac' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                          YOUR DEVICE
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      In supported Safari versions, choose <strong>File → Add to Dock</strong>. Chrome and Edge also offer one-click browser installation.
                    </p>
                  </div>

                  {isInstallable && devicePlatform === 'mac' && (
                    <button
                      onClick={handleInstallTrigger}
                      className="mt-4 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
                    >
                      Install Mac Desktop App
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fast offline caching & background cloud synchronization supported on all devices.</span>
              </div>
              <button
                onClick={onClose}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Close Guide
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </AnimatePresence>
  );
};
