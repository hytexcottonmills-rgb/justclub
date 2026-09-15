import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Zap, 
  Clock, 
  Receipt, 
  Users, 
  Coffee, 
  BarChart3, 
  Building2, 
  ChevronRight,
  Tv,
  QrCode,
  Award,
  Crown,
  Calendar,
  Gift,
  Gamepad2,
  Monitor,
  Headphones,
  Target,
  Mic,
  Dices,
  CircleDot
} from 'lucide-react';
import { JustClubLogo } from './JustClubLogo';
import { AuthUser } from '../types';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onOpenPosDemo: () => void;
  onOpenLogin: () => void;
  authUser: AuthUser | null;
  onLogout: () => void;
  isDarkMode?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onOpenPosDemo,
  onOpenLogin,
  authUser,
  onLogout,
  isDarkMode = true,
}) => {
  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP LANDING NAVIGATION BAR */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-[#090d16]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JustClubLogo isDarkMode={isDarkMode} size="md" />
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-400">
            <a href="#categories" className="hover:text-indigo-400 transition">Game Types</a>
            <a href="#features" className="hover:text-indigo-400 transition">Features</a>
            <a href="#demo" className="hover:text-indigo-400 transition">Live Demo</a>
            <a href="#pricing" className="hover:text-indigo-400 transition">Pricing Plans</a>
          </div>

          <div className="flex items-center gap-3">
            {authUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenPosDemo}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <span>Open POS Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 border border-slate-700/60 rounded-xl transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenLogin}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    isDarkMode
                      ? 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign In</span>
                </button>

                <button
                  onClick={onStartOnboarding}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Onboard Club</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>The Multi-Game Lounge & Club Operating System</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500 text-white font-extrabold uppercase rounded">15 Days Free Trial</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            One System for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              Billiards, Consoles, PC, VR & Lounges
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            From Snooker & 8-Ball tables to PS5, PC Gaming Rigs, VR Pods, Foosball, Air Hockey, Darts, Karaoke Booths, and Board Game Lounges — manage real-time session timers, snack POS, and WhatsApp split billing seamlessly.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onStartOnboarding}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Start 15-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPosDemo}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl border font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
              }`}
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span>Explore Live POS Terminal</span>
            </button>
          </div>

          {/* Social Proof Metric Bar */}
          <div className="pt-8 border-t border-slate-800/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">10+</div>
              <div className="text-xs text-slate-400 font-medium">Game Categories Supported</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">150+</div>
              <div className="text-xs text-slate-400 font-medium">Clubs & Lounges Powered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹4.2M+</div>
              <div className="text-xs text-slate-400 font-medium">Monthly Game Volume</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₹499/mo</div>
              <div className="text-xs text-slate-400 font-medium">Monthly Plan Base</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-GAME CATEGORY GRID SHOWCASE */}
      <section id="categories" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Complete Compatibility</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Built for Every Game & Attraction in Your Venue</p>
            <p className="text-xs text-slate-400 mt-2">Whether you run a cue sports parlor, gaming cafe, VR arcade, or family lounge bar.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Category 1: Billiards */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <CircleDot className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Billiards & Snooker</h3>
              <p className="text-[11px] text-slate-400">15-min rounding, 1v1 & 2v2 loser-pays rules.</p>
            </div>

            {/* Category 2: PlayStation / Consoles */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">PS5 & Xbox Consoles</h3>
              <p className="text-[11px] text-slate-400">Per-controller pricing & FIFA match splits.</p>
            </div>

            {/* Category 3: PC Gaming */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">PC Gaming Rigs</h3>
              <p className="text-[11px] text-slate-400">Hourly desk timers & Esports squad tabs.</p>
            </div>

            {/* Category 4: VR Arcade */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Virtual Reality (VR)</h3>
              <p className="text-[11px] text-slate-400">Motion pod session metering & safety timers.</p>
            </div>

            {/* Category 5: Table Tennis */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Table Tennis</h3>
              <p className="text-[11px] text-slate-400">Per-table hourly rates & paddle rentals.</p>
            </div>

            {/* Category 6: Foosball */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Foosball Tables</h3>
              <p className="text-[11px] text-slate-400">Quick match timer & 2v2 tournament splits.</p>
            </div>

            {/* Category 7: Air Hockey */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Air Hockey</h3>
              <p className="text-[11px] text-slate-400">Fast arcade puck timers & instant QR pay.</p>
            </div>

            {/* Category 8: Darts */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Darts Lanes</h3>
              <p className="text-[11px] text-slate-400">Per-lane session tracking & beverage pairing.</p>
            </div>

            {/* Category 9: Karaoke */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Karaoke Rooms</h3>
              <p className="text-[11px] text-slate-400">Private room hourly rates + attached food tabs.</p>
            </div>

            {/* Category 10: Board Games */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition text-center group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Dices className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white mb-1">Board Game Lounge</h3>
              <p className="text-[11px] text-slate-400">Table cover charge & group snack orders.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT POS PREVIEW SECTION */}
      <section id="demo" className="py-20 relative bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Live Multi-Category Terminal</h2>
            <p className="text-3xl font-extrabold text-white">Track All Game Assets Simultaneously</p>
          </div>

          {/* Dashboard Frame Preview */}
          <div className="rounded-3xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">justclub-multi-game-pos.app</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                ⚡ 4 Active Session Meters
              </div>
            </div>

            {/* Mock Table Cards Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Card 1: Snooker */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5 text-emerald-400" /> Snooker #1
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400">
                    Billiards
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-indigo-400 mb-1">01:42:18</div>
                <div className="text-[11px] text-slate-400 mb-3">Rahul vs. Vikram (1v1)</div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-bold text-emerald-400">₹340.00</span>
                </div>
              </div>

              {/* Card 2: PS5 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" /> PS5 Station #2
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/10 text-indigo-400">
                    Console
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white mb-1">00:58:45</div>
                <div className="text-[11px] text-slate-400 mb-3">FC24 2v2 Tournament</div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between">
                  <span className="text-slate-400">Split:</span>
                  <span className="font-bold text-indigo-400">Loser Team Pays</span>
                </div>
              </div>

              {/* Card 3: PC Rig */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-blue-400" /> PC Rig #04
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/10 text-blue-400">
                    PC Gaming
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-300 mb-1">02:15:00</div>
                <div className="text-[11px] text-slate-400 mb-3">Valorant Competitive</div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between">
                  <span className="text-slate-400">Rate:</span>
                  <span className="font-bold text-emerald-400">₹120/hr</span>
                </div>
              </div>

              {/* Card 4: Karaoke Room */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-pink-400" /> Karaoke Suite A
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-pink-500/10 text-pink-400">
                    Private Suite
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-pink-300 mb-1">01:10:00</div>
                <div className="text-[11px] text-slate-400 mb-3">6 Guests + Snack Order</div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-bold text-emerald-400">₹1,450.00</span>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onOpenPosDemo}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition inline-flex items-center gap-2"
              >
                <span>Launch Full Interactive Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEY FEATURES GRID */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">All-In-One Club OS</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">Everything Your Gaming Lounge Needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Universal Asset Timers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated per-minute and block-rounding timers for Billiards, Table Tennis, PS5, PC Rigs, VR Pods, Foosball, Air Hockey, and Karaoke rooms.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Split Billing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant 50/50 Equal Split, 1v1 Loser Pays All, 2v2 Loser Team Split, and custom percentage allocations calculated in 1 click.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Attached Snack & Bar POS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attach cold drinks, snacks, energy cans, and hookah orders directly to active session timers with real-time stock inventory decrement.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">WhatsApp UPI Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate dynamic UPI QR codes and formatted WhatsApp receipt links sent directly to players' smartphones for instant payment.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Customer Debt Ledgers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track unpaid member tabs, credit balances, and lifetime player value (LTV) with 1-click partial or full debt settlement.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Retention & Revenue Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Telemetry on at-risk players (inactive &gt;30 days), peak table occupancy hours, and net monthly revenue breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION - 3 DISCOUNTS & BILLING PLANS */}
      <section id="pricing" className="py-24 bg-slate-950/80 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-4">
              <Gift className="w-3.5 h-3.5" />
              <span>Includes 15-Days Risk-Free Trial On Every Plan</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Flexible Club Subscription Plans</h2>
            <p className="text-sm text-slate-400 mt-3">Choose the billing cycle that fits your club. Upgrade, downgrade, or cancel anytime.</p>
          </div>

          {/* 3 PLANS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* PLAN 1: MONTHLY PLAN */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Monthly Plan</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Standard
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-black text-white font-mono">₹499</span>
                  <span className="text-xs text-slate-400 font-normal"> / month</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-6 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 15 Days Free Trial Included
                </div>

                <p className="text-xs text-slate-400 mb-6">Pay month-to-month with complete freedom and zero long-term commitment.</p>

                <div className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800/80 pt-4">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>15 Days Free Trial</strong> (₹0 today)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Supports All 10+ Game Asset Categories</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Automated Split Billing (1v1, 2v2, Equal)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Bar POS & Snack Inventory Control</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>WhatsApp Dynamic UPI Receipts</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3.5 px-4 rounded-2xl border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-extrabold text-xs transition"
              >
                Start Monthly Free Trial
              </button>
            </div>

            {/* PLAN 2: QUARTERLY 3-MONTH PLAN (HIGHLIGHTED / POPULAR) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                <Crown className="w-3 h-3" /> Most Popular (Save 13%)
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Quarterly Plan (3 Months)</span>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Save ₹198
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-4xl font-black text-white font-mono">₹1,299</span>
                  <span className="text-xs text-slate-400 font-normal"> / 3 months</span>
                </div>
                <div className="text-xs text-indigo-300 font-mono mb-2">
                  (Only <strong className="text-white">₹433/mo</strong> • Billed Quarterly)
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-6 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 15 Days Free Trial Included
                </div>

                <p className="text-xs text-slate-300 mb-6">Our most popular plan for established gaming lounges wanting balanced savings.</p>

                <div className="space-y-3 text-xs text-slate-200 mb-8 border-t border-indigo-500/20 pt-4">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>15 Days Free Trial</strong> (₹0 today)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>13% Discount</strong> compared to monthly billing</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Supports All 10+ Game Asset Categories</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Automated Split Billing Engine</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Priority WhatsApp Onboarding & Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                Start 3-Month Free Trial
              </button>
            </div>

            {/* PLAN 3: YEARLY 12-MONTH PLAN (MAX DISCOUNT) */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-purple-500/40 flex flex-col justify-between hover:border-purple-500/80 transition relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                Max Savings (2 Months Free!)
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Yearly Plan (12 Months)</span>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Save 25%
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-4xl font-black text-white font-mono">₹4,499</span>
                  <span className="text-xs text-slate-400 font-normal"> / year</span>
                </div>
                <div className="text-xs text-purple-300 font-mono mb-2">
                  (Only <strong className="text-white">₹375/mo</strong> • Billed Annually)
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-6 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 15 Days Free Trial Included
                </div>

                <p className="text-xs text-slate-400 mb-6">Maximum value for high-traffic multi-game lounges & chains wanting the best ROI.</p>

                <div className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800/80 pt-4">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>15 Days Free Trial</strong> (₹0 today)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Save ₹1,489/year</strong> (Get 2 Months Free)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Supports All 10+ Game Asset Categories</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Custom Printed UPI QR Acrylic Stands</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Dedicated VIP Account Manager</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 hover:text-white font-extrabold text-xs transition"
              >
                Start Yearly Free Trial
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BOTTOM FOOTER */}
      <footer className="py-12 border-t border-slate-800 bg-[#070a12] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <JustClubLogo isDarkMode={isDarkMode} size="sm" />
            <span>© 2026 justclub OS V2. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <button onClick={onOpenLogin} className="hover:text-slate-300 transition">Google Sign In</button>
            <button onClick={onStartOnboarding} className="hover:text-slate-300 transition">Club Onboarding</button>
            <button onClick={onOpenPosDemo} className="hover:text-slate-300 transition">POS Terminal</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
