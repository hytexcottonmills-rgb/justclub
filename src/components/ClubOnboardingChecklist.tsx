import React, { useState, useEffect } from 'react';
import { ClubProfile, GameAsset, BarItem, GameSession, SubscriptionConfig } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  QrCode, 
  Gamepad2, 
  Martini, 
  Crown, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  X, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ClubOnboardingChecklistProps {
  clubProfile: ClubProfile;
  gameAssets: GameAsset[];
  barItems: BarItem[];
  activeSessions: GameSession[];
  subscriptionConfig: SubscriptionConfig;
  totalBillsCount: number;
  onNavigateToSetup: (subTab?: 'profile' | 'subscription' | 'assets' | 'bar' | 'support') => void;
  onNavigateToAnalytics: (subTab?: 'revenue' | 'expenses' | 'retention') => void;
  onStartFirstMatch?: () => void;
  isDarkMode?: boolean;
}

export const ClubOnboardingChecklist: React.FC<ClubOnboardingChecklistProps> = ({
  clubProfile,
  gameAssets,
  barItems,
  activeSessions,
  subscriptionConfig,
  totalBillsCount,
  onNavigateToSetup,
  onNavigateToAnalytics,
  onStartFirstMatch,
  isDarkMode = true,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('justclub_checklist_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Check onboarding readiness
  const isUpiConfigured = Boolean(clubProfile.upiId && clubProfile.upiId.trim() !== '');
  const isAssetsConfigured = gameAssets.length > 0;
  const isBarConfigured = barItems.length > 0;
  const isPlanConfigured = Boolean(subscriptionConfig.planTier || subscriptionConfig.status === 'active');
  const isFirstMatchDone = activeSessions.length > 0 || totalBillsCount > 0;

  const tasks = [
    {
      id: 'upi',
      title: 'Club Profile & UPI QR',
      description: 'Set your club name, owner phone, and counter UPI VPA for QR settlements.',
      isDone: isUpiConfigured,
      icon: QrCode,
      actionText: isUpiConfigured ? 'Edit Details' : 'Set Up UPI',
      action: () => onNavigateToSetup('profile'),
      stepNum: 1,
    },
    {
      id: 'subscription',
      title: 'Subscription Plan (3 Options)',
      description: 'Select Monthly, Quarterly (Popular), or Yearly plan to unlock unlimited sessions.',
      isDone: isPlanConfigured,
      icon: Crown,
      actionText: isPlanConfigured ? 'Change Plan' : 'Select Plan',
      action: () => onNavigateToSetup('subscription'),
      stepNum: 2,
    },
    {
      id: 'assets',
      title: `Game Assets (${gameAssets.length}) & Tariffs`,
      description: 'Configure your snooker, pool, and PS5 tables with hourly rates and minimum meters.',
      isDone: isAssetsConfigured,
      icon: Gamepad2,
      actionText: isAssetsConfigured ? 'Manage Tables' : 'Add Tables',
      action: () => onNavigateToSetup('assets'),
      stepNum: 3,
    },
    {
      id: 'bar',
      title: `Bar & Snack Catalog (${barItems.length})`,
      description: 'Add snacks and drinks, configure retail price vs wholesale cost (COGS).',
      isDone: isBarConfigured,
      icon: Martini,
      actionText: isBarConfigured ? 'Manage Menu' : 'Add Items',
      action: () => onNavigateToSetup('bar'),
      stepNum: 4,
    },
    {
      id: 'first_match',
      title: 'Start First Live Match in Arena',
      description: 'Pick an available table, tag players, and start the digital billing clock.',
      isDone: isFirstMatchDone,
      icon: Play,
      actionText: isFirstMatchDone ? 'In Progress' : 'Start Match',
      action: () => {
        if (onStartFirstMatch) onStartFirstMatch();
      },
      stepNum: 5,
    },
  ];

  const completedCount = tasks.filter(t => t.isDone).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('justclub_checklist_dismissed', 'true');
    } catch {}
  };

  const handleStartTour = () => {
    if ((window as any).__JUSTCLUB_START_TOUR__) {
      (window as any).__JUSTCLUB_START_TOUR__();
    }
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
            Onboarding Setup ({completedCount}/{tasks.length} Complete)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsDismissed(false);
              localStorage.removeItem('justclub_checklist_dismissed');
            }}
            className="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer"
          >
            Show Checklist
          </button>
          <button
            onClick={handleStartTour}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Start Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id="onboarding-setup-widget"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border shadow-xl overflow-hidden transition-all ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30'
          : 'bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border-indigo-200'
      }`}
    >
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            progressPercent === 100 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          }`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {progressPercent === 100 ? '🎉 Club 100% Ready for Business!' : '🚀 Club POS Onboarding & Launchpad'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                progressPercent === 100
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}>
                {completedCount} of {tasks.length} Done ({progressPercent}%)
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Follow these setup steps to configure your assets, menu, and payment QR for counter billing.
            </p>
          </div>
        </div>

        {/* Right Actions: Interactive Tour & Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleStartTour}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
            title="Launch Driver.js Interactive Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive POS Tour</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={isCollapsed ? 'Expand Checklist' : 'Collapse Checklist'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDismiss}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-700 hover:border-rose-500/30'
                : 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200'
            }`}
            title="Dismiss Checklist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-slate-800/50 h-1.5">
        <div 
          className={`h-full transition-all duration-500 rounded-r-full ${
            progressPercent === 100
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/50'
          }`}
          style={{ width: `${Math.max(progressPercent, 5)}%` }}
        />
      </div>

      {/* Collapsible Steps Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((task) => {
                const IconComponent = task.icon;
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 ${
                      task.isDone
                        ? isDarkMode
                          ? 'bg-slate-900/60 border-emerald-500/30'
                          : 'bg-emerald-50/50 border-emerald-200'
                        : isDarkMode
                          ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        task.isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-indigo-500/15 text-indigo-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 line-clamp-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {task.isDone ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                            <Circle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </div>

                      <button
                        onClick={task.action}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          task.isDone
                            ? isDarkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                        }`}
                      >
                        <span>{task.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
