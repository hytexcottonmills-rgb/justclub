import React, { useState } from 'react';
import { JustClubIcon } from './JustClubLogo';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  FileCode, 
  Sparkles, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

interface BrandAssetSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const BrandAssetSpecModal: React.FC<BrandAssetSpecModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullGraphic, setShowFullGraphic] = useState(false);

  if (!isOpen) return null;

  const handleCopySvg = () => {
    fetch('/favicon.svg')
      .then(res => res.text())
      .then(svgText => {
        navigator.clipboard.writeText(svgText);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      })
      .catch(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header Bar */}
        <div className={`p-5 px-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>JustClub Brand Assets & Technical Specs</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Production Master
                </span>
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Standalone, isolated geometric emblems for favicons, app launcher tiles, and vector design systems.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullGraphic(!showFullGraphic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                showFullGraphic
                  ? 'bg-purple-600 text-white border-purple-500'
                  : isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{showFullGraphic ? 'Interactive Panels' : 'Full Graphic Spec'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {showFullGraphic ? (
            /* Render Full High-Resolution Master Graphic Spec Sheet */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <img
                  src="/justclub-brand-specs.jpg"
                  alt="JustClub Master Brand Specification Sheet"
                  className="w-full h-auto object-contain select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Format: 8K Master Graphic Asset Display Page (JPEG / 1024×1024 @ 300 DPI)</span>
                <a
                  href="/justclub-brand-specs.jpg"
                  download="justclub-brand-specification-sheet.jpg"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Graphic Page
                </a>
              </div>
            </div>
          ) : (
            /* Interactive 4-Panel Technical Display */
            <div className="space-y-6">
              {/* TOP ROW: 2 Favicon Panels (Light Mode & Dark Mode) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top-Left: Light Mode Favicon */}
                <div className="p-5 rounded-2xl border bg-slate-950 border-slate-800 flex flex-col items-center justify-between space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-slate-300">
                      LIGHT MODE FAVICON (ICO/PNG)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Light Vignette
                    </span>
                  </div>

                  {/* Circular Vignette Preview */}
                  <div className="w-36 h-36 rounded-full bg-slate-100 flex flex-col items-center justify-center shadow-inner border border-slate-300 relative group">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <JustClubIcon size="lg" variant="light" withContainer={false} />
                    </div>
                    <div className="absolute -bottom-2 text-[9px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-xs">
                      32x32px
                    </div>
                  </div>

                  <div className="w-full pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Deep Purple on Light Canvas</span>
                    <a
                      href="/favicon-light-32x32.png"
                      download="favicon-light-32x32.png"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> PNG
                    </a>
                  </div>
                </div>

                {/* Top-Right: Dark Mode Favicon */}
                <div className="p-5 rounded-2xl border bg-slate-950 border-slate-800 flex flex-col items-center justify-between space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-slate-300">
                      DARK MODE FAVICON (ICO/PNG)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Glow Vignette
                    </span>
                  </div>

                  {/* Circular Dark Charcoal Vignette Preview */}
                  <div className="w-36 h-36 rounded-full bg-slate-950 flex flex-col items-center justify-center shadow-inner border border-slate-800 relative group">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <JustClubIcon size="lg" variant="dark" withContainer={false} />
                    </div>
                    <div className="absolute -bottom-2 text-[9px] font-mono font-bold bg-purple-950 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full shadow-xs">
                      32x32px
                    </div>
                  </div>

                  <div className="w-full pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">White with Purple Edge Glow</span>
                    <a
                      href="/favicon-32x32.png"
                      download="favicon-dark-32x32.png"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> PNG
                    </a>
                  </div>
                </div>
              </div>

              {/* LOWER HALF: JUSTCLUB STANDALONE APP LAUNCHER ICONS (PNG/SVG) */}
              <div className="p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-950/80 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-4">
                  <div>
                    <h3 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>JUSTCLUB STANDALONE APP LAUNCHER ICONS (PNG/SVG)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Production standalone marks with zero surrounding text for PWA launchers, mobile stores & desktop apps.
                    </p>
                  </div>

                  <button
                    onClick={handleCopySvg}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'SVG Code Copied!' : 'Copy SVG XML'}</span>
                  </button>
                </div>

                {/* Three Large Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Left Larger Tile: 192x192px White-on-Dark */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center p-3 transition-transform hover:scale-105">
                      <JustClubIcon size="2xl" variant="dark" withContainer={false} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black font-mono text-white block">192x192px</span>
                      <span className="text-[10px] text-slate-400">PWA / Android Maskable</span>
                    </div>
                    <a
                      href="/justclub-launcher-192.png"
                      download="justclub-launcher-192x192.png"
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> 192px
                    </a>
                  </div>

                  {/* Center Larger Tile: 512x512px Purple-on-Light */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 rounded-3xl bg-white border border-slate-200 shadow-xl flex items-center justify-center p-3 transition-transform hover:scale-105">
                      <JustClubIcon size="2xl" variant="light" withContainer={false} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black font-mono text-white block">512x512px</span>
                      <span className="text-[10px] text-slate-400">Play Store / High-Res Light</span>
                    </div>
                    <a
                      href="/justclub-launcher-512.png"
                      download="justclub-launcher-512x512.png"
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> 512px
                    </a>
                  </div>

                  {/* Right Larger Tile: SVG Vector White-on-Dark with Glow */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 rounded-3xl bg-slate-950 border border-purple-500/50 shadow-xl shadow-purple-900/30 flex items-center justify-center p-3 transition-transform hover:scale-105 relative">
                      <JustClubIcon size="2xl" variant="dark" withContainer={false} />
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black font-mono text-purple-300 block">SVG Vector</span>
                      <span className="text-[10px] text-slate-400">Lossless Master Source</span>
                    </div>
                    <a
                      href="/favicon.svg"
                      download="justclub-emblem.svg"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                      <Download className="w-3.5 h-3.5" /> Vector SVG
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>Geometry: Enclosing circular arc + stylized 'd' musical note stem + nested negative space club cutout (♣).</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/justclub-brand-specs.jpg"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-purple-400"
            >
              <span>View Full Graphic</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
