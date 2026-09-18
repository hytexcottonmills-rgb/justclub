import React, { useState, useEffect } from 'react';
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
  CircleDot,
  Pause,
  RotateCcw,
  CreditCard,
  Plus,
  Trash2,
  Share2,
  Lock,
  Flame,
  CheckCircle2,
  X,
  Smartphone,
  Layers,
  HelpCircle,
  ExternalLink,
  Menu
} from 'lucide-react';
import { JustClubLogo, JustClubIcon } from './JustClubLogo';
import { AuthUser } from '../types';
import { PolicyModal, PolicyType } from './PolicyModal';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onOpenPosDemo: () => void;
  onOpenLogin: () => void;
  authUser: AuthUser | null;
  onLogout: () => void;
  isDarkMode?: boolean;
}

// Category Definition Interface
interface GameCategoryInfo {
  id: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  rateDesc: string;
  billingBehavior: string;
  demoAssetName: string;
  demoRate: number;
  description: string;
  accentColor: string;
}

const gameCategories: GameCategoryInfo[] = [
  {
    id: 'billiards',
    name: 'Billiards & Snooker',
    badge: 'Cue Sports',
    icon: CircleDot,
    rateDesc: 'Per-minute / rounded session billing',
    billingBehavior: 'Precision timer billing with 15-min or 30-min roundups',
    demoAssetName: 'Billiards Table 01 (French Cloth)',
    demoRate: 300,
    description: 'Track Snooker, 8-Ball, and Pool tables. Auto-calculate session rates with exact-minute or interval rounding.',
    accentColor: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'ps5',
    name: 'PlayStation / Xbox',
    badge: 'Consoles',
    icon: Gamepad2,
    rateDesc: 'Console + controller based pricing',
    billingBehavior: 'Tiered rates per controller (1v1, 2v2, 4-Player FC 24)',
    demoAssetName: 'PS5 Station 02 (4K OLED 120Hz)',
    demoRate: 240,
    description: 'Manage PS5 & Xbox Series X booths. Charge per controller or per match with automatic controller count scaling.',
    accentColor: 'from-indigo-500/20 to-blue-600/10 border-indigo-500/40 text-indigo-400',
  },
  {
    id: 'pc',
    name: 'PC Gaming',
    badge: 'eSports Rigs',
    icon: Monitor,
    rateDesc: 'Hourly station billing',
    billingBehavior: 'Rig-level session metering & steam lounge passes',
    demoAssetName: 'PC Rig 04 (RTX 4080 • 240Hz)',
    demoRate: 150,
    description: 'Power eSports arenas and PC cafes. Meter high-spec gaming rigs with custom hourly and overnight rates.',
    accentColor: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'vr',
    name: 'Virtual Reality',
    badge: 'VR Pods',
    icon: Headphones,
    rateDesc: 'Pod / session metering',
    billingBehavior: '15-min slot timers with headset safety alerts',
    demoAssetName: 'VR Pod 01 (Meta Quest 3 Arena)',
    demoRate: 450,
    description: 'Manage interactive VR pods and free-roam arenas with timed experience packages and safety countdowns.',
    accentColor: 'from-purple-500/20 to-fuchsia-600/10 border-purple-500/40 text-purple-400',
  },
  {
    id: 'tabletennis',
    name: 'Table Tennis',
    badge: 'Ping Pong',
    icon: CircleDot,
    rateDesc: 'Per-table session billing',
    billingBehavior: 'Standard hourly ping pong table tariff',
    demoAssetName: 'Table Tennis Table 01 (Stiga Pro)',
    demoRate: 180,
    description: 'Track table tennis sessions with flat hourly or per-game rates, paddle rentals, and tournament slots.',
    accentColor: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-400',
  },
  {
    id: 'foosball',
    name: 'Foosball',
    badge: 'Table Soccer',
    icon: Sparkles,
    rateDesc: 'Quick match billing',
    billingBehavior: 'Fast 10-minute or hourly table rental',
    demoAssetName: 'Tornado Foosball Table 01',
    demoRate: 120,
    description: 'Ideal for quick casual matches or tournament tables with flexible token and time billing modes.',
    accentColor: 'from-orange-500/20 to-amber-600/10 border-orange-500/40 text-orange-400',
  },
  {
    id: 'airhockey',
    name: 'Air Hockey',
    badge: 'Arcade Arena',
    icon: Zap,
    rateDesc: 'Fast session billing',
    billingBehavior: 'Puck timer & game-based session logs',
    demoAssetName: 'Dynamo Air Hockey Arena 01',
    demoRate: 160,
    description: 'Manage high-energy air hockey tables with quick match counters and automated LED light bar indicators.',
    accentColor: 'from-rose-500/20 to-red-600/10 border-rose-500/40 text-rose-400',
  },
  {
    id: 'darts',
    name: 'Darts Lane',
    badge: 'Precision',
    icon: Target,
    rateDesc: 'Lane-based billing',
    billingBehavior: 'Per-hour lane tariff with electronic board link',
    demoAssetName: 'Darts Target Board Lane 01',
    demoRate: 200,
    description: 'Track steel-tip and soft-tip electronic darts lanes with player rotation counters and drink ordering.',
    accentColor: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/40 text-yellow-400',
  },
  {
    id: 'karaoke',
    name: 'Karaoke Booths',
    badge: 'Private Rooms',
    icon: Mic,
    rateDesc: 'Private room billing',
    billingBehavior: 'Room size + guest count hourly package',
    demoAssetName: 'VIP Karaoke Suite Alpha (10 Pax)',
    demoRate: 1200,
    description: 'Manage VIP soundproof karaoke suites with guest count limits, food combo packages, and hourly extension prompts.',
    accentColor: 'from-pink-500/20 to-rose-600/10 border-pink-500/40 text-pink-400',
  },
  {
    id: 'boardgames',
    name: 'Board Games',
    badge: 'Table Lounge',
    icon: Dices,
    rateDesc: 'Table / session billing',
    billingBehavior: 'Cover charge per player or flat table rate',
    demoAssetName: 'Board Game Table 03 (Catan / Risk)',
    demoRate: 150,
    description: 'Charge per person cover fees or table hourly rates for strategy games, RPG nights, and library rentals.',
    accentColor: 'from-violet-500/20 to-purple-600/10 border-violet-500/40 text-violet-400',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onOpenPosDemo,
  onOpenLogin,
  authUser,
  onLogout,
  isDarkMode = true,
}) => {
  const handleLaunchPOS = () => {
    if (authUser) {
      onOpenPosDemo();
    } else {
      onOpenLogin();
    }
  };

  // --- DEMO INTERACTIVE STATE ---
  
  // 1. Live Hero Floor Control Center Ticking Timers
  const [heroSeconds, setHeroSeconds] = useState(6138); // ~01:42:18
  const [ps5Seconds, setPs5Seconds] = useState(3525);   // ~00:58:45
  const [pcSeconds, setPcSeconds] = useState(8100);    // ~02:15:00
  const [ttSeconds, setTtSeconds] = useState(2710);    // ~00:45:10
  const [karaokeSeconds, setKaraokeSeconds] = useState(4200); // ~01:10:00

  // Active Session Drawer Modal for Hero Floor
  const [activeModalAsset, setActiveModalAsset] = useState<string | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [extraSnackItems, setExtraSnackItems] = useState<{ name: string; price: number; qty: number }[]>([
    { name: 'Red Bull Energy', price: 140, qty: 1 },
    { name: 'Loaded Nachos', price: 180, qty: 1 },
  ]);

  // Demo Total Revenue Counter
  const [demoRevenue, setDemoRevenue] = useState(18420);
  const [activeSessionCount, setActiveSessionCount] = useState(5);

  // 2. Selected Game Category for Explorer
  const [selectedCatId, setSelectedCatId] = useState('billiards');
  const selectedCat = gameCategories.find(c => c.id === selectedCatId) || gameCategories[0];

  // 3. Split Billing Demo Mode State
  const [splitMode, setSplitMode] = useState<'50-50' | 'equal' | 'loser-pays' | 'loser-team' | 'custom'>('loser-pays');

  // 4. Bar + Snack POS Interactive Order State
  const [barDemoItems, setBarDemoItems] = useState<{ id: string; name: string; price: number; qty: number; stock: number }[]>([
    { id: '1', name: 'Cold Coffee / Frappe', price: 160, qty: 2, stock: 45 },
    { id: '2', name: 'Red Bull Energy Drink', price: 140, qty: 1, stock: 28 },
    { id: '3', name: 'Cheese Loaded Nachos', price: 180, qty: 1, stock: 19 },
  ]);

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Policy Modal States
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<PolicyType>('privacy');

  // Ticking effect for live POS timers
  useEffect(() => {
    if (isTimerPaused) return;
    const interval = setInterval(() => {
      setHeroSeconds(s => s + 1);
      setPs5Seconds(s => s + 1);
      setPcSeconds(s => s + 1);
      setTtSeconds(s => s + 1);
      setKaraokeSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused]);

  // Helper format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Billiards charge (₹300/hr)
  const calcCharge = (totalSec: number, hourlyRate: number) => {
    const hours = totalSec / 3600;
    return Math.round(hours * hourlyRate);
  };

  // Add Item in Bar POS Demo
  const handleAddBarDemoItem = (name: string, price: number) => {
    setBarDemoItems(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing) {
        return prev.map(i => i.name === name ? { ...i, qty: i.qty + 1, stock: Math.max(0, i.stock - 1) } : i);
      }
      return [...prev, { id: Date.now().toString(), name, price, qty: 1, stock: 15 }];
    });
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-900 text-slate-100'
    }`}>
      
      {/* ----------------------------------------------------------------- */}
      {/* 1. BRAND NAVIGATION BAR */}
      {/* ----------------------------------------------------------------- */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JustClubLogo isDarkMode={true} size="md" showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-400">
            <a href="#live-floor" className="hover:text-indigo-400 transition">Live Floor POS</a>
            <a href="#categories" className="hover:text-indigo-400 transition font-mono uppercase tracking-wider">10 Game Categories</a>
            <a href="#session-engine" className="hover:text-indigo-400 transition">Universal Engine</a>
            <a href="#split-billing" className="hover:text-indigo-400 transition">Split Billing</a>
            <a href="#customer-ledger" className="hover:text-indigo-400 transition">Customer Ledger</a>
            <a href="#pricing" className="hover:text-indigo-400 transition">Pricing Plans</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {authUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onOpenPosDemo}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="hidden xs:inline">Open Club POS</span>
                  <span className="xs:hidden">POS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="hidden sm:block px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 border border-slate-700/60 rounded-xl transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>

                <button
                  onClick={onStartOnboarding}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Start Free Trial</span>
                  <span className="xs:hidden">Trial</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-indigo-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 bg-[#090d16]/98 px-4 py-4 space-y-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
              <a
                href="#live-floor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Live Floor POS</span>
              </a>
              <a
                href="#categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>10 Game Types</span>
              </a>
              <a
                href="#session-engine"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Universal Engine</span>
              </a>
              <a
                href="#split-billing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>Split Billing</span>
              </a>
              <a
                href="#customer-ledger"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-rose-400" />
                <span>Customer Ledger</span>
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 hover:text-white transition flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>Pricing Plans</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLaunchPOS();
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Launch Interactive Club POS Demo</span>
              </button>
              {authUser && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold mb-6 shadow-lg shadow-indigo-500/10">
            <JustClubIcon size="xs" />
            <span>The Operating System for Multi-Game Clubs</span>
            <span className="px-2 py-0.5 text-[9px] bg-emerald-500 text-slate-950 font-black uppercase rounded-full">15 Days Free Trial</span>
          </div>

          {/* Master Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6">
            The Operating System for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              Multi-Game Clubs
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed mb-8">
            Run every game, every table, every customer and every bill from one powerful club POS.
          </p>

          {/* Supported Categories Pills Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-10">
            {[
              { label: 'Billiards', icon: '🎱' },
              { label: 'Snooker', icon: '🎱' },
              { label: 'PlayStation', icon: '🎮' },
              { label: 'PC Gaming', icon: '🖥' },
              { label: 'VR Pods', icon: '🥽' },
              { label: 'Table Tennis', icon: '🏓' },
              { label: 'Foosball', icon: '⚽' },
              { label: 'Air Hockey', icon: '🏒' },
              { label: 'Darts', icon: '🎯' },
              { label: 'Karaoke', icon: '🎤' },
              { label: 'Board Games', icon: '🎲' },
            ].map(cat => (
              <span key={cat.label} className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-extrabold text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-indigo-500/40 transition">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button
              onClick={onStartOnboarding}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Start 15-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunchPOS}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span>Explore Live POS</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-semibold mb-14">
            15 days free • No credit card required • Instant setup
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. HERO VISUAL — LIVE CLUB FLOOR (INTERACTIVE POS CONTROL CENTER) */}
      {/* ----------------------------------------------------------------- */}
      <section id="live-floor" className="py-12 bg-slate-950/80 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            
            {/* Control Center Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Tv className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white tracking-tight">JUSTCLUB — LIVE CLUB FLOOR</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {activeSessionCount} SESSIONS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Click any table or station below to open live POS session controls</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800/90 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Today's Revenue</div>
                  <div className="font-mono font-black text-emerald-400 text-sm">₹{demoRevenue.toLocaleString()}</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Occupancy Rate</div>
                  <div className="font-mono font-black text-indigo-400 text-sm">74%</div>
                </div>
              </div>
            </div>

            {/* Live Interactive Grid of Club Floor Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* ASSET 1: Billiards Table 01 */}
              <div
                onClick={() => setActiveModalAsset('billiards-1')}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] flex items-center gap-1">
                    🎱 Billiards
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    OCCUPIED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">Billiards Table 01</h3>
                <div className="text-xs text-slate-400 mb-4">Rahul vs Vikram • 1v1 Match</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Live Timer</div>
                    <div className="font-mono font-black text-amber-400 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      {formatTime(heroSeconds)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Game Bill</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">₹{calcCharge(heroSeconds, 200)}</div>
                  </div>
                </div>
              </div>

              {/* ASSET 2: Billiards Table 02 (AVAILABLE) */}
              <div
                onClick={() => setActiveModalAsset('billiards-2')}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-extrabold text-[10px] flex items-center gap-1">
                    🎱 Billiards
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold text-[10px] uppercase border border-slate-700">
                    AVAILABLE
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">Billiards Table 02</h3>
                <div className="text-xs text-slate-500 mb-4">Snooker Tournament Grade</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Rate: ₹300/hr</span>
                  <span className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 rounded font-bold text-[10px]">Start Session</span>
                </div>
              </div>

              {/* ASSET 3: PS5 Station 01 */}
              <div
                onClick={() => setActiveModalAsset('ps5-1')}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer relative group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] flex items-center gap-1">
                    🎮 PS5 Lounge
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    OCCUPIED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">PS5 Station 01</h3>
                <div className="text-xs text-slate-400 mb-4">Arjun & Squad • FC 24 2v2</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Live Timer</div>
                    <div className="font-mono font-black text-indigo-400 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      {formatTime(ps5Seconds)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Game Bill</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">₹{calcCharge(ps5Seconds, 240)}</div>
                  </div>
                </div>
              </div>

              {/* ASSET 4: PC Rig 04 */}
              <div
                onClick={() => setActiveModalAsset('pc-4')}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer relative group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] flex items-center gap-1">
                    🖥 PC Rig
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    OCCUPIED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">PC Rig 04 (Valorant)</h3>
                <div className="text-xs text-slate-400 mb-4">Kiran • RTX 4080 eSports</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Live Timer</div>
                    <div className="font-mono font-black text-cyan-400 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      {formatTime(pcSeconds)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Game Bill</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">₹{calcCharge(pcSeconds, 120)}</div>
                  </div>
                </div>
              </div>

              {/* ASSET 5: VR Pod 02 (AVAILABLE) */}
              <div
                onClick={() => setActiveModalAsset('vr-2')}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 font-extrabold text-[10px] flex items-center gap-1">
                    🥽 VR Arena
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold text-[10px] uppercase border border-slate-700">
                    AVAILABLE
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">VR Pod 02 (Beat Saber)</h3>
                <div className="text-xs text-slate-500 mb-4">Meta Quest 3 Motion Pod</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Rate: ₹450/hr</span>
                  <span className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 rounded font-bold text-[10px]">Start Session</span>
                </div>
              </div>

              {/* ASSET 6: Table Tennis 01 */}
              <div
                onClick={() => setActiveModalAsset('tt-1')}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer relative group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                    🏓 Table Tennis
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    OCCUPIED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">Table Tennis 01</h3>
                <div className="text-xs text-slate-400 mb-4">Yash & Rohan • Singles</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Live Timer</div>
                    <div className="font-mono font-black text-emerald-400 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      {formatTime(ttSeconds)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Game Bill</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">₹{calcCharge(ttSeconds, 180)}</div>
                  </div>
                </div>
              </div>

              {/* ASSET 7: Karaoke Room A */}
              <div
                onClick={() => setActiveModalAsset('karaoke-a')}
                className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer relative group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 font-extrabold text-[10px] flex items-center gap-1">
                    🎤 Karaoke
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    OCCUPIED
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">Karaoke Room A</h3>
                <div className="text-xs text-slate-400 mb-4">Priya Party (6 Guests)</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Live Timer</div>
                    <div className="font-mono font-black text-pink-400 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                      {formatTime(karaokeSeconds)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Game Bill</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">₹{calcCharge(karaokeSeconds, 1200)}</div>
                  </div>
                </div>
              </div>

              {/* ASSET 8: Darts Lane 01 (AVAILABLE) */}
              <div
                onClick={() => setActiveModalAsset('darts-1')}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 font-extrabold text-[10px] flex items-center gap-1">
                    🎯 Darts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold text-[10px] uppercase border border-slate-700">
                    AVAILABLE
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition">Darts Lane 01</h3>
                <div className="text-xs text-slate-500 mb-4">Electronic Target Board</div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Rate: ₹200/hr</span>
                  <span className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 rounded font-bold text-[10px]">Start Session</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. INTERACTIVE SESSION MODAL DEMO */}
      {/* ----------------------------------------------------------------- */}
      {activeModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-xs relative">
            
            <button
              onClick={() => setActiveModalAsset(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <CircleDot className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30">
                  LIVE DEMO SESSION
                </span>
                <h3 className="font-extrabold text-base text-white mt-0.5">BILLIARDS TABLE 01</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Customer Player</span>
                <div className="font-extrabold text-white text-xs">Rahul Sharma</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Opponent / Mode</span>
                <div className="font-extrabold text-white text-xs">Vikram (1v1 Match)</div>
              </div>
            </div>

            {/* Live Timer & Game Bill */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Session Timer</span>
                <div className="font-mono font-black text-2xl text-amber-400 flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${isTimerPaused ? 'text-slate-500' : 'animate-spin text-amber-400'}`} />
                  {formatTime(heroSeconds)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Game Session Charge</span>
                <div className="font-mono font-black text-2xl text-emerald-400">
                  ₹{calcCharge(heroSeconds, 200)}
                </div>
              </div>
            </div>

            {/* Attached Orders */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400 font-bold text-[11px]">
                <span>Attached Snack Bar Orders</span>
                <button
                  type="button"
                  onClick={() => setExtraSnackItems(prev => [...prev, { name: 'Cold Coffee', price: 160, qty: 1 }])}
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {extraSnackItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.name} × {item.qty}</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  isTimerPaused ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isTimerPaused ? 'Resume Timer' : 'Pause Session'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const gameAmt = calcCharge(heroSeconds, 200);
                  const snackAmt = extraSnackItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
                  setDemoRevenue(r => r + gameAmt + snackAmt);
                  setActiveModalAsset(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Checkout (₹{calcCharge(heroSeconds, 200) + extraSnackItems.reduce((a, i) => a + i.price * i.qty, 0)})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 6. GAME CATEGORY EXPLORER */}
      {/* ----------------------------------------------------------------- */}
      <section id="categories" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase border border-indigo-500/30">
              Complete Compatibility
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One POS. Every Game in Your Club.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Whatever your venue offers, JustClub gives every game, table, station and room the same simple operating system.
            </p>
          </div>

          {/* 10 Category Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {gameCategories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">{cat.badge}</span>
                  </div>
                  <div className={`font-extrabold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {cat.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Panel for Selected Category */}
          <div className="p-8 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                <selectedCat.icon className="w-4 h-4 text-indigo-400" />
                <span>{selectedCat.name} Configuration</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">{selectedCat.description}</h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-400">Tariff Logic</span>
                  <span className="font-extrabold text-indigo-400">{selectedCat.rateDesc}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-400">POS Session Rule</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedCat.billingBehavior}</span>
                </div>
              </div>

              <button
                onClick={onStartOnboarding}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Setup {selectedCat.name} Tariffs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Live Interactive Interactive Preview Component for Category */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-extrabold text-white text-xs">
                  <selectedCat.icon className="w-4 h-4 text-amber-400" />
                  <span>{selectedCat.demoAssetName}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  LIVE POS CARD
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Standard Rate</span>
                  <span className="text-white font-bold">₹{selectedCat.demoRate} / Hour</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Increment Mode</span>
                  <span className="text-emerald-400 font-bold">Exact Minute Pro-Rata</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>WhatsApp Receipt Link</span>
                  <span className="text-indigo-400 font-bold">Enabled</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Demo 1-Hour Session Cost</span>
                <span className="font-mono font-black text-xl text-emerald-400">₹{selectedCat.demoRate}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 7. UNIVERSAL SESSION ENGINE */}
      {/* ----------------------------------------------------------------- */}
      <section id="session-engine" className="py-20 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase border border-emerald-500/30">
              Universal Operating System
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Every Game. One Session Engine.
            </h2>
            <p className="text-sm text-slate-400">
              No matter the category, your staff follows the exact same 9-step effortless checkout workflow.
            </p>
          </div>

          {/* Animated 9-Step Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
            {[
              { step: '01', title: 'SELECT GAME', icon: Gamepad2 },
              { step: '02', title: 'SELECT ASSET', icon: Tv },
              { step: '03', title: 'START SESSION', icon: Play },
              { step: '04', title: 'LIVE TIMER', icon: Clock },
              { step: '05', title: 'ADD PRODUCTS', icon: Coffee },
              { step: '06', title: 'SPLIT BILL', icon: Users },
              { step: '07', title: 'PAYMENT', icon: CreditCard },
              { step: '08', title: 'RECEIPT', icon: Receipt },
              { step: '09', title: 'REVENUE', icon: BarChart3 },
            ].map((s) => {
              const IconComp = s.icon;
              return (
                <div key={s.step} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 hover:border-indigo-500/50 transition group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto font-mono font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 font-bold">STEP {s.step}</div>
                  <div className="font-extrabold text-[11px] text-slate-200 group-hover:text-white">{s.title}</div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 8. SPLIT BILLING DEMO (INTERACTIVE SECTION) */}
      {/* ----------------------------------------------------------------- */}
      <section id="split-billing" className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold uppercase border border-amber-500/30">
              Automated Bill Splitting
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Stop Fighting Over the Bill.
            </h2>
            <p className="text-sm text-slate-400">
              Split game sessions exactly the way your club plays — 1v1 Loser Pays, 2v2 Team Loser, 50/50, or Equal split.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1: Sample Bill Setup */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" /> Active Session Bill
              </h3>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span>🎱 Billiards 2-Hr Session</span>
                  <span className="font-mono text-amber-400">₹800</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Coke × 2</span>
                  <span className="font-mono">₹160</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Red Bull × 1</span>
                  <span className="font-mono">₹140</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Cheese Nachos × 1</span>
                  <span className="font-mono">₹200</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center font-bold text-sm">
                  <span className="text-white">Total Bill</span>
                  <span className="font-mono text-emerald-400">₹1,300</span>
                </div>
              </div>

              {/* Split Mode Selector Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Select Interactive Split Logic:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setSplitMode('loser-pays')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      splitMode === 'loser-pays' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    🎯 Loser Pays (1v1)
                  </button>

                  <button
                    onClick={() => setSplitMode('loser-team')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      splitMode === 'loser-team' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    👥 Loser Team (2v2)
                  </button>

                  <button
                    onClick={() => setSplitMode('50-50')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      splitMode === '50-50' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    ⚖️ 50 / 50 Split
                  </button>

                  <button
                    onClick={() => setSplitMode('equal')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      splitMode === 'equal' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    📊 Equal Split (4 Players)
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Calculated Player Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-white text-base flex items-center justify-between">
                <span>Player Payment Breakdown</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold border border-emerald-500/30">
                  {splitMode.toUpperCase()} MODE ACTIVE
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {splitMode === 'loser-pays' && (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-sm">Rahul (Winner 🏆)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">Pays Bar Only</span>
                      </div>
                      <div className="text-slate-400">Game Charge: <strong className="text-white">₹0</strong> (Covered by Loser)</div>
                      <div className="text-slate-400">Snacks / Drinks (50%): <strong className="text-white">₹250</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Rahul Total</span>
                        <span className="font-mono text-emerald-400">₹250</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-sm">Vikram (Loser 💀)</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">Pays Game LP</span>
                      </div>
                      <div className="text-slate-400">Game Charge (100%): <strong className="text-amber-400">₹800</strong></div>
                      <div className="text-slate-400">Snacks / Drinks (50%): <strong className="text-white">₹250</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Vikram Total</span>
                        <span className="font-mono text-red-400">₹1,050</span>
                      </div>
                    </div>
                  </>
                )}

                {splitMode === '50-50' && (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="font-extrabold text-white text-sm">Rahul (Player A)</div>
                      <div className="text-slate-400">Game Charge (50%): <strong className="text-white">₹400</strong></div>
                      <div className="text-slate-400">Snacks / Drinks (50%): <strong className="text-white">₹250</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Player A Total</span>
                        <span className="font-mono text-emerald-400">₹650</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="font-extrabold text-white text-sm">Vikram (Player B)</div>
                      <div className="text-slate-400">Game Charge (50%): <strong className="text-white">₹400</strong></div>
                      <div className="text-slate-400">Snacks / Drinks (50%): <strong className="text-white">₹250</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Player B Total</span>
                        <span className="font-mono text-emerald-400">₹650</span>
                      </div>
                    </div>
                  </>
                )}

                {splitMode === 'equal' && (
                  <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Rahul', 'Vikram', 'Arjun', 'Kiran'].map((name, i) => (
                      <div key={name} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs text-center">
                        <div className="font-extrabold text-white">{name}</div>
                        <div className="text-[10px] text-slate-400">Equal 1/4 Share</div>
                        <div className="font-mono font-black text-emerald-400 text-sm">₹325</div>
                      </div>
                    ))}
                  </div>
                )}

                {splitMode === 'loser-team' && (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                      <div className="font-extrabold text-white text-sm">Winning Team (Rahul & Arjun)</div>
                      <div className="text-slate-400">Game Charge: <strong className="text-emerald-400">₹0</strong></div>
                      <div className="text-slate-400">Bar Orders (1/4 each): <strong className="text-white">₹125</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Per Winner</span>
                        <span className="font-mono text-emerald-400">₹125</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/30 space-y-2 text-xs">
                      <div className="font-extrabold text-white text-sm">Losing Team (Vikram & Kiran)</div>
                      <div className="text-slate-400">Game Charge (₹400 each): <strong className="text-amber-400">₹400</strong></div>
                      <div className="text-slate-400">Bar Orders (1/4 each): <strong className="text-white">₹125</strong></div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-slate-300">Per Loser</span>
                        <span className="font-mono text-red-400">₹525</span>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Instant WhatsApp QR Link Preview */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-300">Generate Dynamic WhatsApp Split Payment Links</span>
                </div>
                <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold rounded-lg font-mono">
                  Send WhatsApp UPI QR
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 9. BAR + SNACK POS (INTERACTIVE INVENTORY DEMO) */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase border border-emerald-500/30">
              Integrated Snack Bar POS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Your Games and Bar on the Same Bill.
            </h2>
            <p className="text-sm text-slate-400">
              Add snacks, beverages, hookah, and combos directly to any table or console session.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Column: Interactive Item Adder Buttons */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-base">Quick Add Catalog Items (Click to Test Inventory)</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: 'Cold Coffee / Frappe', price: 160 },
                  { name: 'Red Bull Energy Drink', price: 140 },
                  { name: 'Cheese Loaded Nachos', price: 180 },
                  { name: 'Crispy French Fries', price: 120 },
                  { name: 'Paneer Tikka Pizza', price: 280 },
                  { name: 'Red Bull Combo', price: 320 },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => handleAddBarDemoItem(item.name, item.price)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left transition space-y-1 group"
                  >
                    <div className="font-extrabold text-white group-hover:text-emerald-300 text-[11px] truncate">{item.name}</div>
                    <div className="font-mono text-emerald-400 font-bold">₹{item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Bill Order & Stock Ledger */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-extrabold text-white text-xs flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-emerald-400" /> Attached Order — Table 04
                </span>
                <span className="text-[10px] font-mono text-slate-400">AUTO-DECREMENT INVENTORY</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {barDemoItems.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-white">{item.name} × {item.qty}</div>
                      <div className="text-[10px] text-slate-500 font-mono">In Stock: {item.stock} Units</div>
                    </div>
                    <div className="font-mono text-emerald-400 font-black">₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Combined Bar Order Total</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  ₹{barDemoItems.reduce((acc, i) => acc + i.price * i.qty, 0)}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 10. CUSTOMER LEDGER & RETENTION */}
      {/* ----------------------------------------------------------------- */}
      <section id="customer-ledger" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs font-bold uppercase border border-purple-500/30">
              Customer Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Know Every Customer. Not Just Every Sale.
            </h2>
            <p className="text-sm text-slate-400">
              Track customer visit histories, credit/debit balances, favorite games, and loyalty rewards.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Customer Profile & Loyalty Card */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/40 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    RS
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Rahul Sharma</h3>
                    <div className="text-slate-400 font-mono">+91 98765 43210</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-slate-500">Total Visits</div>
                    <div className="font-mono font-bold text-white text-sm">24 Visits</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Lifetime Spend</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">₹18,420</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Loyalty Rank</span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold font-mono text-[10px]">
                    ⭐ LEVEL 7 CUE MASTER
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Credit / Debit Ledger */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-white text-base">Rahul's Running Credit / Debit Ledger</h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Debit (Owed)</th>
                      <th className="p-3 text-right">Credit (Paid)</th>
                      <th className="p-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950">
                    <tr>
                      <td className="p-3 font-mono text-slate-400">Oct 12, 2026</td>
                      <td className="p-3 font-bold text-white">Opening Balance Advance</td>
                      <td className="p-3 text-right font-mono text-slate-500">—</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">₹500</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">+₹500</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-400">Oct 14, 2026</td>
                      <td className="p-3 font-bold text-white">UPI Payment Received</td>
                      <td className="p-3 text-right font-mono text-slate-500">—</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">₹250</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">+₹750</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-400">Oct 15, 2026</td>
                      <td className="p-3 font-bold text-white">Billiards 2-Hr Session</td>
                      <td className="p-3 text-right font-mono text-red-400 font-bold">₹400</td>
                      <td className="p-3 text-right font-mono text-slate-500">—</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">+₹350</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-slate-400">Oct 15, 2026</td>
                      <td className="p-3 font-bold text-white">Snacks & Drinks Order</td>
                      <td className="p-3 text-right font-mono text-red-400 font-bold">₹150</td>
                      <td className="p-3 text-right font-mono text-slate-500">—</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">+₹200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 11. OWNER BUSINESS INTELLIGENCE DASHBOARD */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold uppercase border border-cyan-500/30">
              Executive Analytics
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              From Game Sessions to Business Intelligence.
            </h2>
            <p className="text-sm text-slate-400">
              Real-time revenue metrics, category breakdowns, and occupancy performance.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
            
            {/* Top 4 Key Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-400">Today's Total Revenue</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-2">₹42,850</div>
                <div className="text-[11px] text-emerald-500 font-bold mt-1">↑ +18% vs last week</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-400">Total Game Sessions</div>
                <div className="text-3xl font-black text-white font-mono mt-2">128</div>
                <div className="text-[11px] text-slate-400 mt-1">Across 10 Categories</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-400">Peak Occupancy</div>
                <div className="text-3xl font-black text-indigo-400 font-mono mt-2">74%</div>
                <div className="text-[11px] text-indigo-300 mt-1">Peak: 7 PM - 11 PM</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-400">Average Bill Size</div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-2">₹335</div>
                <div className="text-[11px] text-slate-400 mt-1">Game + Bar Order</div>
              </div>
            </div>

            {/* Category Revenue Distribution Bars */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="font-extrabold text-white text-sm">Revenue Share per Attraction Category</h3>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Billiards & Snooker', amt: 14200, pct: '33%', color: 'bg-amber-500' },
                  { name: 'PlayStation & Consoles', amt: 8600, pct: '20%', color: 'bg-indigo-500' },
                  { name: 'PC Gaming Rigs', amt: 6300, pct: '15%', color: 'bg-cyan-500' },
                  { name: 'Snack Bar & Beverages', amt: 5450, pct: '13%', color: 'bg-emerald-500' },
                  { name: 'Virtual Reality Arena', amt: 4500, pct: '11%', color: 'bg-purple-500' },
                  { name: 'Table Tennis & Others', amt: 3800, pct: '8%', color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>{item.name}</span>
                      <span className="font-mono text-white">₹{item.amt.toLocaleString()} ({item.pct})</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 12. MULTI-TENANT POSITIONING */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase border border-indigo-500/30">
              Multi-Tenant Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One Cloud Platform. Independent Club OS.
            </h2>
            <p className="text-sm text-slate-400">
              Each club gets its own isolated venue space, staff credentials, custom tariffs, and private reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-extrabold text-white text-sm">Isolated Venue Database</h3>
              <p className="text-slate-400">Your customer ledgers, game rates, and revenue reports stay 100% private and protected.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-extrabold text-white text-sm">Custom Game Tariffs</h3>
              <p className="text-slate-400">Configure custom hourly rates, minimum billing increments, and peak weekend surge pricing.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-extrabold text-white text-sm">Staff Account Controls</h3>
              <p className="text-slate-400">Grant counter staff POS billing permissions without exposing executive financial reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 13. PRICING PLANS SECTION */}
      {/* ----------------------------------------------------------------- */}
      <section id="pricing" className="py-20 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase border border-emerald-500/30">
              Simple Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Start Free Today. Upgrade Anytime.
            </h2>
            <p className="text-sm text-slate-400">
              15-Day Free Trial included on all plans. ₹0 required today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Monthly Plan */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-slate-400">Monthly Plan</span>
                <div>
                  <div className="text-4xl font-black text-white font-mono">₹499</div>
                  <div className="text-xs text-slate-400">billed monthly</div>
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Includes 15-Day Free Trial (₹0 today)
                </div>

                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Game Tables & PS5</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Automated Split Billing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Integrated Snack Bar POS</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Customer Credit Ledgers</li>
                </ul>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition"
              >
                Start Free Trial
              </button>
            </div>

            {/* Quarterly Plan */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950 to-slate-900 border-2 border-indigo-500 shadow-2xl space-y-6 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                MOST POPULAR • SAVE 13%
              </div>

              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-indigo-400">3-Month Plan</span>
                <div>
                  <div className="text-4xl font-black text-white font-mono">₹1,299</div>
                  <div className="text-xs text-indigo-300 font-mono">~₹433 / month</div>
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Includes 15-Day Free Trial (₹0 today)
                </div>

                <ul className="space-y-2 text-xs text-slate-200 border-t border-indigo-500/20 pt-4">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> All Monthly Plan Features</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Priority WhatsApp Support</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Save ₹198 vs Monthly</li>
                </ul>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                Start Free Trial
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-purple-400">Yearly Plan</span>
                <div>
                  <div className="text-4xl font-black text-white font-mono">₹4,499</div>
                  <div className="text-xs text-purple-300 font-mono">~₹375 / month</div>
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Includes 15-Day Free Trial (₹0 today)
                </div>

                <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Save ₹1,489 (2 Months Free)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Printed Acrylic QR Stand Package</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> 1-on-1 Dedicated Account Manager</li>
                </ul>
              </div>

              <button
                onClick={onStartOnboarding}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition"
              >
                Start Free Trial
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 14. FINAL CALL TO ACTION */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-24 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Your Club Has 10 Games.<br />
            <span className="text-indigo-400">You Need One System.</span>
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Stop managing tables, timers, bills, customers and inventory separately. Run everything from JustClub.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartOnboarding}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-2xl transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Start Your 15-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunchPOS}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-sm rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span>Explore Live POS</span>
            </button>
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 15. FOOTER */}
      {/* ----------------------------------------------------------------- */}
      <footer className="py-6 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <JustClubLogo isDarkMode={true} size="sm" showText={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-semibold text-slate-500 text-[11px]">
            <button
              onClick={() => {
                setPolicyModalType('privacy');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setPolicyModalType('terms');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setPolicyModalType('refund');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              Refund Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setPolicyModalType('delivery');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              SaaS Delivery
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setPolicyModalType('contact');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              Contact & Support
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setPolicyModalType('security');
                setIsPolicyModalOpen(true);
              }}
              className="hover:text-indigo-400 transition"
            >
              Payment Security
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[11px] text-center md:text-right leading-relaxed">
            © 2026 JustCLUB. Operated by Rajaganapathy Kamalakannan. All Rights Reserved.
          </div>

        </div>
      </footer>

      {/* Cashfree Merchant Approval Policy Modal */}
      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        policyType={policyModalType}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
