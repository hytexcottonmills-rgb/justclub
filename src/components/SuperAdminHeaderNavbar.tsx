import React from 'react';
import { Crown, Sun, Moon, ArrowLeft, Building2 } from 'lucide-react';
import { LiveClockWidget } from './LiveClockWidget';

interface SuperAdminHeaderNavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExitSuperAdminPortal: () => void;
  totalSubscribers: number;
  totalSaasMrr: number;
}

export const SuperAdminHeaderNavbar: React.FC<SuperAdminHeaderNavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onExitSuperAdminPortal,
  totalSubscribers,
  totalSaasMrr,
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b ${
      isDarkMode 
        ? 'bg-[#0b0f1a]/95 border-purple-900/40 text-slate-100' 
        : 'bg-white/95 border-purple-200 text-slate-800'
    } backdrop-blur-md shadow-sm transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand logo & Super Admin Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 ring-1 ring-white/20">
            <Crown className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-base tracking-tight flex items-center gap-1`}>
                <span className="text-purple-400">just</span>
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
                <span className="text-purple-300 font-normal">Owner Portal</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Super Admin
              </span>
            </div>
            <span className={`text-[11px] hidden sm:inline-block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Multi-Tenant POS Subscription Management & Telemetry
            </span>
          </div>
        </div>

        {/* Center: SaaS MRR Telemetry */}
        <div className={`hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full border ${
          isDarkMode
            ? 'bg-slate-950/80 border-purple-900/30'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Active Tenants:</span>
            <span className={`font-bold font-mono ${isDarkMode ? 'text-white' : 'text-purple-950'}`}>{totalSubscribers}</span>
          </div>
          <div className={`h-3 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-purple-200'}`} />
          <div className="flex items-center gap-2 text-xs">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>MRR:</span>
            <span className="font-bold font-mono text-emerald-500">₹{totalSaasMrr.toLocaleString('en-IN')}/mo</span>
          </div>
        </div>

        {/* Right: Live Clock, Theme Switcher & Exit Portal */}
        <div className="flex items-center gap-3">
          {/* Live Digital Clock & HUD (Desktop & Tablet only) */}
          <div className="hidden md:block">
            <LiveClockWidget isDarkMode={isDarkMode} />
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl transition border ${
              isDarkMode
                ? 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Return to Client POS Panel Button */}
          <button
            onClick={onExitSuperAdminPortal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Client POS Panel</span>
          </button>
        </div>

      </div>
    </header>
  );
};
