import React from 'react';
import { 
  Gamepad2, 
  ShoppingBag, 
  Receipt, 
  Users, 
  Settings, 
  Crown, 
  Clock, 
  X,
  Sparkles,
  Layers,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export type NavTab = 'tables' | 'bar_pos' | 'ledgers' | 'analytics' | 'setup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSessionsCount: number;
  unpaidCustomersCount: number;
  atRiskCustomersCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDarkMode: boolean;
  onOpenSuperAdminPortal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeSessionsCount,
  unpaidCustomersCount,
  atRiskCustomersCount,
  isMobileOpen,
  onCloseMobile,
  isDarkMode,
  onOpenSuperAdminPortal,
}) => {
  const navItems = [
    {
      id: 'tables' as NavTab,
      label: 'Game Sessions & Tables',
      icon: Clock,
      badge: activeSessionsCount > 0 ? activeSessionsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Live Timers & Session POS',
    },
    {
      id: 'bar_pos' as NavTab,
      label: 'Standalone Bar POS',
      icon: ShoppingBag,
      description: 'Cafe Walk-ins & Snack Terminal',
    },
    {
      id: 'ledgers' as NavTab,
      label: 'Ledgers & Debts',
      icon: Receipt,
      badge: unpaidCustomersCount > 0 ? unpaidCustomersCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Unpaid Customer Tabs & WhatsApp Links',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: atRiskCustomersCount > 0 ? atRiskCustomersCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Revenue, Profit & Retention Insights',
    },
    {
      id: 'setup' as NavTab,
      label: 'Setup & Assets Config',
      icon: Settings,
      description: 'Game Rates, Bar Inventory & UPI ID',
    },
  ];

  const sidebarContent = (
    <div className={`flex flex-col h-full justify-between p-3 sm:p-4 ${
      isDarkMode ? 'text-slate-300' : 'text-slate-700'
    }`}>
      {/* Navigation Section */}
      <div className="space-y-6">
        <div>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-3 block mb-2 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Main Navigation
          </span>
          <nav className="space-y-1">
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
                          : isDarkMode ? 'text-slate-500' : 'text-slate-400'
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

      {/* Footer Info & Separate Super Admin Portal Access */}
      <div className={`pt-3 border-t text-[11px] space-y-2 px-2 ${
        isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-400'
      }`}>
        {onOpenSuperAdminPortal && (
          <button
            onClick={() => {
              onOpenSuperAdminPortal();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
              isDarkMode
                ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-purple-700 border border-slate-200'
            }`}
            title="Access isolated SaaS Super Admin Portal"
          >
            <span className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-purple-400" /> justclub Owner Portal
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        )}

        <div className="flex items-center justify-between">
          <span className="font-extrabold flex items-center gap-0.5">
            <span className="text-indigo-500">just</span>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>club</span>
            <span className="font-normal opacity-70 ml-1">OS v2.0</span>
          </span>
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
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r ${
        isDarkMode ? 'bg-[#0d121f]/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* App-like Fixed Mobile Bottom Navigation Bar (No side drawer) */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t md:hidden backdrop-blur-xl px-2 py-2 pb-3 min-h-[62px] flex items-center justify-around shadow-2xl transition-colors ${
        isDarkMode
          ? 'bg-[#0b0f1a]/95 border-slate-800/90 text-slate-400'
          : 'bg-white/95 border-slate-200 text-slate-600'
      }`}>
        <button
          onClick={() => onSelectTab('tables')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
            currentTab === 'tables'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Tables</span>
        </button>

        <button
          onClick={() => onSelectTab('bar_pos')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
            currentTab === 'bar_pos'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Bar POS</span>
        </button>

        <button
          onClick={() => onSelectTab('ledgers')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition relative min-w-[56px] min-h-[44px] ${
            currentTab === 'ledgers'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          {unpaidCustomersCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Ledgers</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
            currentTab === 'analytics'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('setup')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
            currentTab === 'setup'
              ? isDarkMode ? 'bg-indigo-500/15 text-indigo-400 font-extrabold' : 'bg-indigo-50 text-indigo-600 font-extrabold'
              : isDarkMode ? 'hover:text-slate-200 text-slate-400' : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Settings</span>
        </button>
      </nav>
    </>
  );
};
