import React, { useState } from 'react';
import { JustClubIcon } from './JustClubLogo';
import { 
  Download, 
  ArrowLeft, 
  Copy, 
  Check, 
  Maximize2, 
  Sparkles, 
  ExternalLink,
  Code,
  Shield,
  Layers
} from 'lucide-react';

interface BrandAssetsViewProps {
  onBack: () => void;
  onNavigateToPOS?: () => void;
}

export const BrandAssetsView: React.FC<BrandAssetsViewProps> = ({
  onBack,
  onNavigateToPOS,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'interactive' | 'master_graphic'>('interactive');

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
    <div className="min-h-screen bg-[#111319] text-white flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">JustClub</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30">
                Design System Specification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveViewMode('interactive')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeViewMode === 'interactive'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Technical Specs
              </button>
              <button
                onClick={() => setActiveViewMode('master_graphic')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeViewMode === 'master_graphic'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8K Spec Sheet Graphic
              </button>
            </div>

            {onNavigateToPOS && (
              <button
                onClick={onNavigateToPOS}
                className="hidden sm:flex px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition items-center gap-1.5"
              >
                <span>Launch POS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Specification Display Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Intro Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase block mb-1">
              Visual Brand Architecture // Emblems & Favicons
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              JustClub Standalone Graphic Asset Specification
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Production-ready, mathematically aligned vector geometry unifying the lowercase &apos;d&apos;, musical note stem, outer enclosing circular ring, and nested negative-space 3-leaf club (clover) cutout.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySvg}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'SVG XML Copied!' : 'Copy Vector SVG'}</span>
            </button>
            <a
              href="/justclub-brand-specs.jpg"
              download="justclub-brand-specification-sheet.jpg"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res Graphic</span>
            </a>
          </div>
        </div>

        {activeViewMode === 'master_graphic' ? (
          /* Render High-Resolution Graphic Poster */
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center p-2">
              <img
                src="/justclub-brand-specs.jpg"
                alt="JustClub Master Brand Specification Sheet"
                className="w-full max-w-4xl h-auto object-contain rounded-2xl select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span>Master Specification Sheet (JPEG / 1024×1024 @ 300 DPI)</span>
              <a
                href="/justclub-brand-specs.jpg"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-purple-400"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Exact 4-Section Specification Grid on Charcoal Gradient */
          <div className="space-y-6">
            {/* TOP ROW: Two Favicon Specification Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top-Left Section (Light Mode Favicon) */}
              <section className="rounded-3xl border border-slate-800 bg-[#161821] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <h2 className="text-sm font-black tracking-wider uppercase text-white">
                    LIGHT MODE FAVICON (ICO/PNG)
                  </h2>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700">
                    Daylight / White Tab
                  </span>
                </div>

                {/* Circular Vignette with Isolated Deep Purple Vector Mark */}
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-44 h-44 rounded-full bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] flex flex-col items-center justify-center shadow-2xl border-4 border-slate-300 relative transition-transform duration-300 group-hover:scale-105">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <JustClubIcon size="xl" variant="light" withContainer={false} />
                    </div>
                    {/* 32x32px Dimension Pill */}
                    <div className="absolute -bottom-3 text-[10px] font-mono font-bold bg-slate-900 text-white px-3 py-0.5 rounded-full border border-slate-700 shadow-lg">
                      32x32px
                    </div>
                  </div>
                </div>

                {/* Technical Description & Download */}
                <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 text-center sm:text-left">
                    <span className="font-semibold text-slate-200">Emblem Color:</span> Deep Purple (#4A154B)
                    <span className="block text-[11px] text-slate-500">Rendered against light circular vignette</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="/favicon-light-32x32.png"
                      download="favicon-light-32x32.png"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> 32px PNG
                    </a>
                    <a
                      href="/favicon-light.svg"
                      download="favicon-light.svg"
                      className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> SVG
                    </a>
                  </div>
                </div>
              </section>

              {/* Top-Right Section (Dark Mode Favicon) */}
              <section className="rounded-3xl border border-slate-800 bg-[#161821] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <h2 className="text-sm font-black tracking-wider uppercase text-white">
                    DARK MODE FAVICON (ICO/PNG)
                  </h2>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-500/30">
                    Midnight / Dark Tab
                  </span>
                </div>

                {/* Deep Charcoal Circular Vignette with High-Contrast White Vector Mark & Subtle Purple Glow */}
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-44 h-44 rounded-full bg-gradient-to-b from-[#0a0c10] to-[#040507] flex flex-col items-center justify-center shadow-2xl border-4 border-slate-800 relative transition-transform duration-300 group-hover:scale-105">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <JustClubIcon size="xl" variant="dark" withContainer={false} />
                    </div>
                    {/* 32x32px Dimension Pill */}
                    <div className="absolute -bottom-3 text-[10px] font-mono font-bold bg-purple-950 text-purple-200 px-3 py-0.5 rounded-full border border-purple-500/40 shadow-lg">
                      32x32px
                    </div>
                  </div>
                </div>

                {/* Technical Description & Download */}
                <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 text-center sm:text-left">
                    <span className="font-semibold text-slate-200">Emblem Color:</span> High-Contrast Pure White (#FFFFFF)
                    <span className="block text-[11px] text-purple-400/80">Subtle light-purple inner/outer edge glow</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="/favicon-dark-32x32.png"
                      download="favicon-dark-32x32.png"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> 32px PNG
                    </a>
                    <a
                      href="/favicon-dark.svg"
                      download="favicon-dark.svg"
                      className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> SVG
                    </a>
                  </div>
                </div>
              </section>
            </div>

            {/* LOWER HALF: JUSTCLUB STANDALONE APP LAUNCHER ICONS (PNG/SVG) */}
            <section className="rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-[#181528] via-[#141622] to-[#0d0f18] p-6 sm:p-8 space-y-8 shadow-2xl relative">
              {/* Lower Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                      JUSTCLUB STANDALONE APP LAUNCHER ICONS (PNG/SVG)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    High-resolution isolated emblem tiles formatted for Progressive Web Apps (PWA), Android launcher, Apple Touch icon, and native window tiles.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900/90 text-purple-300 border border-purple-500/30">
                    Standalone Marks // No Text
                  </span>
                </div>
              </div>

              {/* Three Larger High-Resolution Version Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Larger Tile: 192x192px White-on-Dark */}
                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5 hover:border-slate-700 transition group">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Dark Launcher Squircle</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">PWA 192</span>
                  </div>

                  {/* 192px Preview Squircle */}
                  <div className="w-36 h-36 rounded-3xl bg-[#0b0d13] border border-slate-800 shadow-2xl flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105">
                    <JustClubIcon size="2xl" variant="dark" withContainer={false} />
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-black font-mono text-white">192x192px</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Pure white-on-dark version</div>
                  </div>

                  <a
                    href="/justclub-launcher-192.png"
                    download="justclub-launcher-192x192.png"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download 192x192 PNG</span>
                  </a>
                </div>

                {/* Center Larger Tile: 512x512px Purple-on-Light */}
                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5 hover:border-slate-700 transition group">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-300 uppercase">Light Launcher Squircle</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/20">Store 512</span>
                  </div>

                  {/* 512px Preview Squircle (Against a white inner tile) */}
                  <div className="w-36 h-36 rounded-3xl bg-white border border-slate-200 shadow-2xl flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105">
                    <JustClubIcon size="2xl" variant="light" withContainer={false} />
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-black font-mono text-white">512x512px</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Deep purple-on-light inner tile</div>
                  </div>

                  <a
                    href="/justclub-launcher-512.png"
                    download="justclub-launcher-512x512.png"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download 512x512 PNG</span>
                  </a>
                </div>

                {/* Right Larger Tile: SVG Vector White-on-Dark with Glow */}
                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-5 hover:border-purple-400 transition group shadow-lg shadow-purple-950/40">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-300 uppercase">Vector Master</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-400/40">Master SVG</span>
                  </div>

                  {/* SVG Vector Preview with subtle glowing edge */}
                  <div className="w-36 h-36 rounded-3xl bg-[#0b0d13] border-2 border-purple-500/60 shadow-2xl shadow-purple-900/40 flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105 relative">
                    <JustClubIcon size="2xl" variant="dark" withContainer={false} />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-black font-mono text-purple-300">SVG Vector</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Pure white with soft purple edge glow</div>
                  </div>

                  <a
                    href="/favicon.svg"
                    download="justclub-emblem.svg"
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Scalable SVG</span>
                  </a>
                </div>
              </div>

              {/* Technical Specifications Callout Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Geometric Geometry Integrity</span>
                    <span>1:1 Aspect Ratio, dual-mode SVG media queries, lossless bezier vector curves.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href="/apple-touch-icon.png"
                    download="apple-touch-icon.png"
                    className="text-purple-400 hover:text-purple-300 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Apple Touch Icon
                  </a>
                  <a
                    href="/justclub-avatar.jpg"
                    download="justclub-avatar-1024.jpg"
                    className="text-purple-400 hover:text-purple-300 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> 1024px Avatar
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
