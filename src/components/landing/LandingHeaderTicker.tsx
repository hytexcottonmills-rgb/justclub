import React from 'react';
import { Zap, Radio, Trophy, Clock, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';

interface LandingHeaderTickerProps {
  onOpenBooking: () => void;
  onLaunchPOS: () => void;
  activeStationsCount?: number;
  totalStationsCount?: number;
}

export const LandingHeaderTicker: React.FC<LandingHeaderTickerProps> = ({
  onOpenBooking,
  onLaunchPOS,
  activeStationsCount = 12,
  totalStationsCount = 16,
}) => {
  return (
    <div className="bg-slate-950 border-b border-indigo-500/20 text-xs text-slate-300 relative overflow-hidden z-20">
      {/* Top Cyber Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Pulsing Live Occupancy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
            <span>ARENA LIVE: {activeStationsCount} / {totalStationsCount} OCCUPIED</span>
          </div>

          <span className="hidden md:inline text-slate-600">|</span>

          {/* Marquee ticker text */}
          <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Smart Table Relays: Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Break 147 by Arjun V.
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Free-Play Protection
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Book Table via WhatsApp</span>
          </button>

          <button
            onClick={onLaunchPOS}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>Live POS Terminal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
