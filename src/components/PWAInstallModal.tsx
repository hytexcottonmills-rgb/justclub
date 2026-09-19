import React, { useState, useEffect } from 'react';
import { usePWAInstall, DevicePlatform } from '../hooks/usePWAInstall';
import { Smartphone, Laptop, Download, X, Sparkles, CheckCircle2, Apple, Chrome, Compass, Share2, Info, ArrowRight } from 'lucide-react';
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

  // Selected tab defaults to detected device platform
  const [selectedPlatform, setSelectedPlatform] = useState<DevicePlatform>('android');

  useEffect(() => {
    if (devicePlatform && devicePlatform !== 'other') {
      setSelectedPlatform(devicePlatform);
    } else {
      setSelectedPlatform('android');
    }
  }, [devicePlatform, isOpen]);

  if (!isOpen) return null;

  const handleInstallTrigger = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const platforms: { id: DevicePlatform; label: string; icon: React.ReactNode; sub: string }[] = [
    { id: 'ios', label: 'iPhone & iPad', icon: <Smartphone className="w-4 h-4" />, sub: 'Safari iOS 16.4+' },
    { id: 'android', label: 'Android', icon: <Smartphone className="w-4 h-4" />, sub: 'Chrome & Web App' },
    { id: 'windows', label: 'Windows', icon: <Laptop className="w-4 h-4" />, sub: 'Edge / Chrome' },
    { id: 'mac', label: 'Mac', icon: <Laptop className="w-4 h-4" />, sub: 'Safari Dock & Chrome' },
  ];

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

            {/* Modal Content Container */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Hero Banner */}
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Device App & Native POS Integration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                  Install {appName} on your device
                </h2>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Follow instructions below for your specific device for an app-style window with offline capabilities.
                </p>
              </div>

              {/* Device Selector Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select Device Platform
                  </span>
                  {devicePlatform !== 'other' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Detected: {devicePlatform.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {platforms.map((p) => {
                    const isUserDevice = p.id === devicePlatform;
                    const isSelected = p.id === selectedPlatform;

                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                              : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 text-indigo-950'
                            : isDarkMode
                            ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800/50 text-slate-400'}`}>
                            {p.icon}
                          </div>
                          {isUserDevice && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold tracking-tight border border-emerald-500/30">
                              YOUR DEVICE
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{p.label}</div>
                          <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HERO SPECIFIC DEVICE INSTRUCTION CARD */}
              <div
                className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      {selectedPlatform === 'ios' || selectedPlatform === 'android' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Laptop className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">
                          {selectedPlatform === 'ios' && 'iPhone & iPad Setup'}
                          {selectedPlatform === 'android' && 'Android Setup'}
                          {selectedPlatform === 'windows' && 'Windows PC Setup'}
                          {selectedPlatform === 'mac' && 'Mac Desktop Setup'}
                        </h3>
                        {selectedPlatform === devicePlatform && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-extrabold border border-indigo-500/30">
                            REQUIRED FOR THIS DEVICE
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedPlatform === 'ios' && 'Add directly to your iOS Home Screen using Safari.'}
                        {selectedPlatform === 'android' && 'Install one-click Chrome Web App or add to home screen.'}
                        {selectedPlatform === 'windows' && 'Launch in standalone window using Edge or Chrome.'}
                        {selectedPlatform === 'mac' && 'Add to Dock in Safari or install via Chrome/Edge.'}
                      </p>
                    </div>
                  </div>

                  {/* Direct Native One-Click Install Button if browser emits prompt */}
                  {isInstallable && !isInstalled && (
                    <button
                      onClick={handleInstallTrigger}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install App Now</span>
                    </button>
                  )}

                  {isInstalled && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>App Installed on this device</span>
                    </div>
                  )}
                </div>

                {/* Specific Device Step-by-Step Instructions */}
                {selectedPlatform === 'ios' && (
                  <div className="space-y-4">
                    <ol className={`space-y-3 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                        <div>
                          Open <strong>{window.location.host}</strong> in <strong>Safari</strong> on your iPhone or iPad.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                        <div>
                          Tap the <strong>Share</strong> button <Share2 className="inline w-3.5 h-3.5 text-indigo-400 mx-1" /> at the bottom Safari toolbar.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                        <div>
                          Scroll down the menu and tap <strong>Add to Home Screen</strong> (+).
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">4</span>
                        <div>
                          Tap <strong>Add</strong> in the top-right corner. {appName} will launch as an app icon on your iOS home screen!
                        </div>
                      </li>
                    </ol>

                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 ${
                      isDarkMode ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}>
                      <Info className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span><strong>iOS Web Push Notice:</strong> Open the app icon from your Home Screen to receive live game alerts and bill updates (requires iOS 16.4+).</span>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'android' && (
                  <div className="space-y-4">
                    <ol className={`space-y-3 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                        <div>
                          Open <strong>{window.location.host}</strong> in <strong>Google Chrome</strong>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                        <div>
                          Tap the top browser menu (<strong>⋮</strong>) and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                        <div>
                          Confirm installation. The app will install directly into your Android app drawer.
                        </div>
                      </li>
                    </ol>

                    {isInstallable && (
                      <button
                        onClick={handleInstallTrigger}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Android App Directly</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedPlatform === 'windows' && (
                  <div className="space-y-4">
                    <ol className={`space-y-3 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                        <div>
                          Use <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong> on Windows.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                        <div>
                          Click the <strong>Install App icon (⊕)</strong> inside the address URL bar, or choose <strong>Menu → Apps → Install {appName}</strong>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                        <div>
                          A standalone desktop window will launch and pin to your Windows Start Menu & Taskbar.
                        </div>
                      </li>
                    </ol>

                    {isInstallable && (
                      <button
                        onClick={handleInstallTrigger}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Windows App Directly</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedPlatform === 'mac' && (
                  <div className="space-y-4">
                    <ol className={`space-y-3 text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                        <div>
                          In <strong>Safari (macOS Sonoma+)</strong>, click <strong>File → Add to Dock</strong>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                        <div>
                          In <strong>Chrome / Edge</strong>, click the <strong>Install icon</strong> in the address bar or choose <strong>Save and Share → Install {appName}</strong>.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                        <div>
                          The app will open as a native Mac app window in your Launchpad & Dock.
                        </div>
                      </li>
                    </ol>

                    {isInstallable && (
                      <button
                        onClick={handleInstallTrigger}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Mac App Directly</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2">
                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fast offline caching & SQLite/Cloudflare sync supported across all devices.</span>
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
