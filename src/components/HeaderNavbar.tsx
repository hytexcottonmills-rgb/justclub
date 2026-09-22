import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Sparkles, Moon, Sun, User, LogOut, Settings, Check, ChevronDown, Building2, Home, UserCheck, Layers, Cloud, RefreshCw, WifiOff, Download, HelpCircle } from 'lucide-react';
import { ClubProfile, AuthUser } from '../types';
import { JustClubLogo } from './JustClubLogo';
import { LiveClockWidget } from './LiveClockWidget';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderNavbarProps {
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeSessionsCount: number;
  totalUnpaidLedgerAmount: number;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
  onNavigateToLanding?: () => void;
  onNavigateToOnboarding?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToBrand?: () => void;
  authUser?: AuthUser | null;
  isSyncing?: boolean;
  onSyncNow?: () => void;
  offlineMode?: boolean;
  onOpenPWAInstallModal?: () => void;
  onStartTour?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  clubProfile,
  isDarkMode,
  onToggleDarkMode,
  activeSessionsCount,
  totalUnpaidLedgerAmount,
  onOpenSettings,
  onLogout,
  onOpenMobileMenu,
  onNavigateToLanding,
  onNavigateToOnboarding,
  onNavigateToLogin,
  onNavigateToBrand,
  authUser,
  isSyncing = false,
  onSyncNow,
  offlineMode = false,
  onOpenPWAInstallModal,
  onStartTour,
}) => {
  const isSuspended = clubProfile.tenantStatus === 'SUSPENDED';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInternalPWAOpen, setIsInternalPWAOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initials for avatar
  const displayName = authUser?.name || clubProfile.ownerName || 'Club Admin';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className={`sticky top-0 z-40 border-b pt-safe ${
      isDarkMode 
        ? 'bg-[#0d121f]/95 border-slate-800 text-slate-100' 
        : 'bg-white/95 border-slate-200 text-slate-800'
    } backdrop-blur-md shadow-xs transition-colors duration-200`}>
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 text-left">
            <JustClubLogo isDarkMode={isDarkMode} size="md" />
          </div>
        </div>

        {/* Center: Tenant Status & Live Telemetry Pill */}
        <div id="pos-header-status" className={`hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full border ${
          isDarkMode
            ? 'bg-slate-950/60 border-slate-800'
            : 'bg-slate-100 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 pr-3 border-r ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs font-semibold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>{clubProfile.businessName}</span>
            {isSuspended ? (
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-red-500/20 text-red-500 border border-red-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Suspended
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${
                isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Tenant Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className={`flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <span className="text-slate-500 font-sans">Active Sessions:</span>
              <span className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{activeSessionsCount}</span>
            </div>

            <div className={`flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <span className="text-slate-500 font-sans">Ledger Unpaid:</span>
              <span className={`font-bold ${totalUnpaidLedgerAmount > 0 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}`}>
                ₹{totalUnpaidLedgerAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sync Status, Live Clock, Theme Switcher & Profile Logout Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync Status Pill */}
          <button
            id="pos-sync-indicator"
            onClick={onSyncNow}
            disabled={isSyncing}
            title={offlineMode ? "Offline Mode — Click to retry sync" : "Click to sync data with cloud now"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs ${
              offlineMode
                ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100')
                : isSyncing
                ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')
            }`}
          >
            {offlineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Offline</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-400/20" />
                <span>Synced</span>
              </>
            )}
          </button>

          {/* Quick Tour Guide Launch Button */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              title="Launch POS Interactive Walkthrough"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs cursor-pointer ${
                isDarkMode 
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden md:inline">POS Guide</span>
            </button>
          )}

          {/* Live Digital Clock & Shift HUD (Desktop & Tablet only) */}
          <div className="hidden md:block">
            <LiveClockWidget
              isDarkMode={isDarkMode}
              activeSessionsCount={activeSessionsCount}
            />
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl transition border ${
              isDarkMode
                ? 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Profile Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition ${
                isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              {authUser?.picture ? (
                <img src={authUser.picture} alt={displayName} className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-none">{displayName}</div>
                <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {authUser ? 'Google SSO' : 'Club Admin'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
            </button>

            {/* Profile Menu Popover */}
            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {/* User Info Header */}
                <div className={`p-3 rounded-xl border mb-2.5 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {authUser?.picture ? (
                      <img src={authUser.picture} alt={displayName} className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{displayName}</div>
                      <div className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {authUser?.email || clubProfile.businessName}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-400 mt-0.5">
                        {authUser ? 'Google One Tap Active' : `+${clubProfile.whatsapp}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Menu Actions */}
                <div className="space-y-1">
                  {/* Sync Now Action Item */}
                  <button
                    onClick={() => {
                      if (onSyncNow) onSyncNow();
                      setIsProfileOpen(false);
                    }}
                    disabled={isSyncing}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing now...' : 'Sync now'}</span>
                  </button>

                  {/* Install App / Add to device */}
                  <button
                    onClick={() => {
                      if (onOpenPWAInstallModal) {
                        onOpenPWAInstallModal();
                      } else {
                        setIsInternalPWAOpen(true);
                      }
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isDarkMode ? 'hover:bg-slate-800 text-purple-300' : 'hover:bg-purple-50 text-purple-700'
                    }`}
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>Install App / Add to device</span>
                  </button>

                  {onNavigateToLanding && (
                    <button
                      onClick={() => {
                        onNavigateToLanding();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Home className="w-4 h-4 text-indigo-400" />
                      <span>Product Homepage</span>
                    </button>
                  )}

                  {onNavigateToLogin && !authUser && (
                    <button
                      onClick={() => {
                        onNavigateToLogin();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Google Login / Switch</span>
                    </button>
                  )}

                  {onStartTour && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onStartTour();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isDarkMode ? 'hover:bg-slate-800 text-indigo-300' : 'hover:bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Take POS Walkthrough</span>
                    </button>
                  )}

                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings & Subscription</span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className={`my-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInternalPWAOpen}
        onClose={() => setIsInternalPWAOpen(false)}
        isDarkMode={isDarkMode}
        appName={clubProfile.businessName || 'JustClub'}
      />
    </header>
  );
};
