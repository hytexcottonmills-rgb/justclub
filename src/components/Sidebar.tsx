import React, { useState } from 'react';
import { 
  Gamepad2, 
  Martini, 
  Receipt, 
  Users, 
  Settings, 
  Crown, 
  Clock, 
  X,
  Sparkles,
  Layers,
  ChevronRight,
  BarChart3,
  FileText,
  MoreHorizontal,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JustClubLogo, JustClubIcon } from './JustClubLogo';

export type NavTab = 'tables' | 'bills' | 'bar_pos' | 'ledgers' | 'analytics' | 'setup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSessionsCount: number;
  unpaidCustomersCount: number;
  atRiskCustomersCount: number;
  billsCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeSessionsCount,
  unpaidCustomersCount,
  atRiskCustomersCount,
  billsCount,
  isMobileOpen,
  onCloseMobile,
  isDarkMode,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const isMoreActive = currentTab === 'analytics' || currentTab === 'setup';

  const navItems = [
    {
      id: 'tables' as NavTab,
      label: 'Arena',
      icon: Gamepad2,
      badge: activeSessionsCount > 0 ? activeSessionsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Live Tables & Sessions',
    },
    {
      id: 'bills' as NavTab,
      label: 'Bills',
      icon: FileText,
      badge: billsCount !== undefined && billsCount > 0 ? billsCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Invoices & Receipts',
    },
    {
      id: 'bar_pos' as NavTab,
      label: 'Bar',
      icon: Martini,
      description: 'Cafe & Quick Sale',
    },
    {
      id: 'ledgers' as NavTab,
      label: 'Players',
      icon: Users,
      badge: unpaidCustomersCount > 0 ? unpaidCustomersCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Accounts, Khata & Tabs',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Insights',
      icon: BarChart3,
      badge: atRiskCustomersCount > 0 ? atRiskCustomersCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Revenue & Performance',
    },
    {
      id: 'setup' as NavTab,
      label: 'Settings',
      icon: Settings,
      description: 'Tariffs, Catalog & UPI',
    },
  ];

  const sidebarContent = (
    <div className={`flex flex-col h-full justify-between p-3 sm:p-4 ${
      isDarkMode ? 'text-slate-300' : 'text-slate-700'
    }`}>
      {/* Navigation Section */}
      <div className="space-y-5">
        {/* Top Mini Brand Header inside Sidebar */}
        <div className={`px-3 pt-2 pb-3 border-b ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
          <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Club Operations OS
          </span>
        </div>

        <div>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-3 block mb-2 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Main Navigation
          </span>
          <nav id="sidebar-nav-tabs" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 group text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : isDarkMode
                        ? 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                        : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700/60'
                          : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-slate-200'
                    } transition`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-[10px] ${
                        isActive 
                          ? 'text-indigo-200' 
                          : isDarkMode ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor} ${
                      isActive ? 'bg-white/20 text-white border-white/30' : ''
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`pt-3 border-t text-[11px] space-y-2 px-2 ${
        isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <JustClubIcon size="xs" />
            <span className="font-extrabold flex items-center gap-0.5">
              <span className="text-indigo-500">just</span>
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
              <span className="font-normal opacity-70 ml-1">OS v2.4</span>
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-500 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Ready
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* PC/Tablet Desktop Persistent Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r h-full overflow-y-auto pt-safe pb-safe ${
        isDarkMode ? 'bg-[#0d121f]/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* App-like Fixed Mobile Bottom Navigation Bar (5 Items: Arena, Bills, Bar, Players, More) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t md:hidden backdrop-blur-xl px-2 py-1.5 pb-safe min-h-[58px] flex items-center justify-around shadow-2xl transition-colors ${
        isDarkMode
          ? 'bg-[#0b0f1a]/95 border-slate-800/90 text-slate-400'
          : 'bg-white/95 border-slate-200 text-slate-600'
      }`}>
        <button
          onClick={() => {
            onSelectTab('tables');
            setIsMoreSheetOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[44px] cursor-pointer ${
            currentTab === 'tables'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <div className="relative">
            <Gamepad2 className="w-4 h-4" />
            {activeSessionsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Arena</span>
        </button>

        <button
          onClick={() => {
            onSelectTab('bills');
            setIsMoreSheetOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[44px] cursor-pointer ${
            currentTab === 'bills'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Bills</span>
        </button>

        <button
          onClick={() => {
            onSelectTab('bar_pos');
            setIsMoreSheetOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[44px] cursor-pointer ${
            currentTab === 'bar_pos'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <Martini className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Bar</span>
        </button>

        <button
          onClick={() => {
            onSelectTab('ledgers');
            setIsMoreSheetOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition relative min-w-[56px] min-h-[44px] cursor-pointer ${
            currentTab === 'ledgers'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4" />
            {unpaidCustomersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Players</span>
        </button>

        {/* 5th Item: More Menu Trigger */}
        <button
          onClick={() => setIsMoreSheetOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition relative min-w-[56px] min-h-[44px] cursor-pointer ${
            isMoreActive || isMoreSheetOpen
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
          aria-label="Open more tools and settings"
        >
          <div className="relative">
            <MoreHorizontal className="w-4 h-4" />
            {atRiskCustomersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Sleek Mobile Bottom Sheet for "More" (Insights, Settings, Super Admin) */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
            />

            {/* Bottom Drawer Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] border-t shadow-2xl p-4 sm:p-6 pb-8 pb-safe max-h-[85vh] overflow-y-auto ${
                isDarkMode ? 'bg-[#0e1424] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Grab Handle */}
              <div 
                onClick={() => setIsMoreSheetOpen(false)}
                className="w-12 h-1 rounded-full bg-slate-400/40 dark:bg-slate-700 mx-auto mb-3.5 cursor-pointer" 
              />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    <span>Club Operations & Admin</span>
                  </h3>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Back-office management, tariffs & performance
                  </p>
                </div>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Cards Grid */}
              <div className="space-y-2.5">
                {/* Insights Action Card */}
                <button
                  onClick={() => {
                    onSelectTab('analytics');
                    setIsMoreSheetOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    currentTab === 'analytics'
                      ? isDarkMode
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                        : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : isDarkMode
                      ? 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-850 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-100/70 border-indigo-200 text-indigo-600'
                    }`}>
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>Insights</span>
                        {atRiskCustomersCount > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            {atRiskCustomersCount} alert
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Revenue, peak hours, shift audits & retention
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>

                {/* Settings Card: Account & Business Profile */}
                <button
                  onClick={() => {
                    onSelectTab('setup');
                    setIsMoreSheetOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('justclub_switch_setup_tab', { detail: 'profile' }));
                    }, 50);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    currentTab === 'setup'
                      ? isDarkMode
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                        : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : isDarkMode
                      ? 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-850 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <Settings className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-black">Account Settings</div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Club Profile, UPI ID, SaaS Subscription & Helpdesk
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>

                {/* Operations & Catalog Card */}
                <button
                  onClick={() => {
                    onSelectTab('setup');
                    setIsMoreSheetOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('justclub_switch_setup_tab', { detail: 'assets' }));
                    }, 50);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-850 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-100/70 border-amber-200 text-amber-600'
                    }`}>
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black">Catalog & Operations Config</div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Table tariffs, Bar inventory & VIP Memberships
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>

              {/* Status Summary Strip */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Arena: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{activeSessionsCount} active</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Players: <strong className="text-amber-600 dark:text-amber-400">{unpaidCustomersCount} tabs</strong>
                  </span>
                </div>
                <span className={`text-[10px] font-sans font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>JustClub OS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
