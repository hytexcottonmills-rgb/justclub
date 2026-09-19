import React, { useState, useEffect } from 'react';
import { GameAsset, GameSession, CustomerPlayer, BarItem, MatchType, AssetCategory } from '../types';
import { calculateSessionMetrics, formatMinutes } from '../utils/billing';
import { 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  Coffee, 
  Calculator, 
  Users, 
  Gamepad2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Search,
  Check,
  X,
  UserPlus,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionReminderModal } from './SessionReminderModal';
import { useTranslation } from '../i18n';

interface ActiveTablesViewProps {
  assets: GameAsset[];
  activeSessions: GameSession[];
  customers: CustomerPlayer[];
  barItems: BarItem[];
  onStartSession: (assetId: string, matchType: MatchType, taggedPlayerIds: string[]) => void;
  onTogglePauseSession: (sessionId: string) => void;
  onAddBarItemToSession: (sessionId: string, item: BarItem, qty: number) => void;
  onOpenSplitBilling: (session: GameSession) => void;
  onAddNewCustomer: (name: string, whatsapp: string) => CustomerPlayer;
  onSetSessionReminder?: (sessionId: string, minutes: number | null) => void;
  isDarkMode?: boolean;
  isReadOnly?: boolean;
}

export const ActiveTablesView: React.FC<ActiveTablesViewProps> = ({
  assets,
  activeSessions,
  customers,
  barItems,
  onStartSession,
  onTogglePauseSession,
  onAddBarItemToSession,
  onOpenSplitBilling,
  onAddNewCustomer,
  onSetSessionReminder,
  isDarkMode = true,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();
  // Reminder Modal state
  const [reminderModalSession, setReminderModalSession] = useState<GameSession | null>(null);
  // Live timer tick state
  const [, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter category state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Start Session Modal State
  const [startingAsset, setStartingAsset] = useState<GameAsset | null>(null);
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // New Customer Inline Form State
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Add Snack Drawer State
  const [addingSnackSession, setAddingSnackSession] = useState<GameSession | null>(null);
  const [barSearch, setBarSearch] = useState('');

  const categories = ['All', 'Billiards', 'PS5', 'VR', 'Table Tennis'];

  const filteredAssets = assets.filter(a => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    return true;
  });

  // Calculate live total metrics
  const activeCount = activeSessions.filter(s => s.status === 'running' || s.status === 'paused').length;
  const totalLiveRevenue = activeSessions.reduce((acc, s) => {
    const m = calculateSessionMetrics(s);
    return acc + m.totalCost;
  }, 0);

  const handleCreateNewCust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    const created = onAddNewCustomer(newCustName, newCustPhone);
    setSelectedPlayerIds(prev => [...prev, created.id]);
    setNewCustName('');
    setNewCustPhone('');
    setShowNewCustForm(false);
  };

  const handleConfirmStartSession = () => {
    if (!startingAsset) return;
    const requiredPlayers = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : 4;
    
    // If fewer players tagged than required, fallback to filling with first available
    let finalIds = [...selectedPlayerIds];
    if (finalIds.length < requiredPlayers) {
      const remaining = customers.filter(c => !finalIds.includes(c.id));
      for (let i = finalIds.length; i < requiredPlayers; i++) {
        if (remaining[i - finalIds.length]) {
          finalIds.push(remaining[i - finalIds.length].id);
        }
      }
    }

    onStartSession(startingAsset.id, matchType, finalIds);
    setStartingAsset(null);
    setSelectedPlayerIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Telemetry Spark Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Clock className="w-5 h-5 text-indigo-500" /> Game Sessions & Table Timers
          </h1>
          <p className={`text-xs mt-0.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Monitor real-time table meters, match types (Solo/1v1/2v2), and attached bar orders.
          </p>
        </div>

        {/* Quick Spark Stats */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className={`px-3.5 py-2 border rounded-xl text-xs flex items-center gap-2.5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className={`block text-[10px] uppercase font-semibold truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>Live Occupancy</span>
              <span className={`text-sm font-bold truncate block ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>{activeCount} / {assets.length} Assets</span>
            </div>
          </div>

          <div className={`px-3.5 py-2 border rounded-xl text-xs flex items-center gap-2.5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <span className={`block text-[10px] uppercase font-semibold truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>Running Ticker Total</span>
              <span className={`text-sm font-bold font-mono truncate block ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>₹{totalLiveRevenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Segmented Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : isDarkMode
                  ? 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Game Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredAssets.map((asset) => {
          const activeSession = activeSessions.find(
            s => s.assetId === asset.id && (s.status === 'running' || s.status === 'paused')
          );
          const isOccupied = Boolean(activeSession);
          const metrics = activeSession ? calculateSessionMetrics(activeSession) : null;

          return (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                isOccupied
                  ? isDarkMode
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/20'
                    : 'bg-white border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                  : isDarkMode
                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                      isDarkMode
                        ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {asset.category}
                    </span>
                    <span className={`text-xs font-mono ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      ₹{asset.hourlyRate}/hr ({asset.billingIncrement})
                    </span>
                  </div>
                  <h3 className={`text-base font-bold mt-1 leading-snug ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {asset.name}
                  </h3>
                </div>

                {/* Status Indicator Pill */}
                {isOccupied ? (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    activeSession?.status === 'running'
                      ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${activeSession?.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {activeSession?.status === 'running' ? t('arena.running', 'Running') : t('arena.paused', 'Paused')}
                  </span>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {t('arena.available', 'Available')}
                  </span>
                )}
              </div>

              {/* Active Session Content */}
              {isOccupied && activeSession && metrics ? (
                <div className={`space-y-4 my-3 p-4 rounded-xl border ${
                  isDarkMode
                    ? 'bg-slate-950/70 border-slate-800/80'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  
                  {/* Timer & Live Cost display */}
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-[10px] uppercase font-semibold block ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Elapsed Duration
                      </span>
                      <span className={`text-2xl font-extrabold font-mono tracking-tight ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`}>
                        {metrics.formattedDuration}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-semibold block ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Live Billed Cost
                      </span>
                      <div className={`text-xl font-extrabold font-mono ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        ₹{metrics.totalCost}
                      </div>
                      <span className={`text-[10px] ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        (Game: ₹{metrics.gameCost} • Bar: ₹{metrics.barCost})
                      </span>
                    </div>
                  </div>

                  {/* Match type & Tagged Players */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium flex items-center gap-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        Match: <strong className={`uppercase font-bold ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>{activeSession.matchType}</strong>
                      </span>
                      <span className={`text-[11px] ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {activeSession.taggedPlayers.length} Tagged Players
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeSession.taggedPlayers.map(player => (
                        <span
                          key={player.id}
                          className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 border ${
                            isDarkMode
                              ? 'bg-slate-900 text-slate-200 border-slate-800'
                              : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                          }`}
                        >
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attached Bar Orders */}
                  {activeSession.attachedBarOrders.length > 0 && (
                    <div className={`pt-2 border-t text-xs space-y-1 ${
                      isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-semibold uppercase tracking-wider flex items-center justify-between ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <span>Attached Bar Snacks ({activeSession.attachedBarOrders.length})</span>
                        <span className={isDarkMode ? 'text-amber-400 font-mono' : 'text-amber-600 font-mono'}>₹{metrics.barCost}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeSession.attachedBarOrders.map(item => (
                          <span key={item.itemId} className={`text-[11px] px-2 py-0.5 rounded border ${
                            isDarkMode
                              ? 'bg-slate-900 text-slate-300 border-slate-800'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}>
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Reminder Badge */}
                  {activeSession.reminderMinutes && activeSession.reminderTargetTime && (
                    <div 
                      onClick={() => !isReadOnly && setReminderModalSession(activeSession)}
                      className={`pt-2 border-t text-xs flex items-center justify-between cursor-pointer transition p-2 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                      }`}
                      title="Click to change reminder"
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Bell className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse shrink-0`} />
                        <span>Reminder: {activeSession.reminderMinutes}m</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-85">
                        {(() => {
                          const remMs = activeSession.reminderTargetTime - Date.now();
                          if (remMs <= 0) return 'Ringing!';
                          const mins = Math.ceil(remMs / 60000);
                          return `${mins}m left`;
                        })()}
                      </span>
                    </div>
                  )}

                </div>
              ) : (
                /* Idle Asset Placeholder */
                <div className={`my-6 py-6 border border-dashed rounded-xl text-center flex flex-col items-center justify-center gap-1 ${
                  isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
                }`}>
                  <Gamepad2 className="w-8 h-8 opacity-60 stroke-[1.5]" />
                  <span className="text-xs font-medium">Ready for next session</span>
                  <span className="text-[11px] opacity-75">Rate: ₹{asset.hourlyRate}/hr</span>
                </div>
              )}

              {/* Card Action Controls */}
              <div className={`pt-3 border-t flex flex-wrap items-center gap-1.5 sm:gap-2 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                {isOccupied && activeSession ? (
                  <>
                    <button
                      onClick={() => !isReadOnly && onTogglePauseSession(activeSession.id)}
                      disabled={isReadOnly}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer ${
                        isReadOnly
                          ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                          : isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                      title={isReadOnly ? 'POS is View-Only' : activeSession.status === 'running' ? 'Pause Session' : 'Resume Session'}
                    >
                      {activeSession.status === 'running' ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                    </button>

                    <button
                      onClick={() => !isReadOnly && setReminderModalSession(activeSession)}
                      disabled={isReadOnly}
                      className={`p-2.5 sm:px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border shrink-0 cursor-pointer ${
                        isReadOnly
                          ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                          : activeSession.reminderMinutes
                            ? isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                      title="Set Session Reminder"
                    >
                      <Bell className={`w-3.5 h-3.5 ${activeSession.reminderMinutes ? (isDarkMode ? 'text-indigo-400 fill-indigo-400/20' : 'text-indigo-600 fill-indigo-600/20') : 'text-slate-400'}`} />
                      <span className="hidden sm:inline">{activeSession.reminderMinutes ? `${activeSession.reminderMinutes}m` : 'Reminder'}</span>
                    </button>

                    <button
                      onClick={() => !isReadOnly && setAddingSnackSession(activeSession)}
                      disabled={isReadOnly}
                      className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition flex-1 justify-center border whitespace-nowrap cursor-pointer ${
                        isReadOnly
                          ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                          : isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span>+ Snack</span>
                    </button>

                    <button
                      onClick={() => !isReadOnly && onOpenSplitBilling(activeSession)}
                      disabled={isReadOnly}
                      className={`px-2.5 sm:px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition flex-1 justify-center whitespace-nowrap shadow-md cursor-pointer ${
                        isReadOnly
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-850 shadow-none'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{t('arena.stop_session', 'End & Split')}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (isReadOnly) return;
                      setStartingAsset(asset);
                      setSelectedPlayerIds(customers.slice(0, 2).map(c => c.id));
                    }}
                    disabled={isReadOnly}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md ${
                      isReadOnly
                        ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {t('arena.start_session', 'Start Session Timer')}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- MODAL 1: START NEW SESSION MODAL --- */}
      {startingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg border rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Initiate Game Session</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{startingAsset.name} (₹{startingAsset.hourlyRate}/hr)</p>
              </div>
              <button
                onClick={() => setStartingAsset(null)}
                className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Type Picker */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Match Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['solo', '1v1', '2v2'] as MatchType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMatchType(type)}
                    className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                      matchType === type
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type} {type === 'solo' ? '(1 Player)' : type === '1v1' ? '(2 Players)' : '(4 Players)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Tagging Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tag Registered Players ({selectedPlayerIds.length} / {matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : 4})
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCustForm(!showNewCustForm)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Quick Register New
                </button>
              </div>

              {/* Inline Quick Register Form */}
              {showNewCustForm && (
                <form onSubmit={handleCreateNewCust} className={`p-3 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
                }`}>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp (e.g. 9876543210)"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Save & Auto-Tag Customer
                  </button>
                </form>
              )}

              {/* Customer Search & Select list */}
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {customers
                  .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.whatsapp.includes(customerSearch))
                  .map(cust => {
                    const isSelected = selectedPlayerIds.includes(cust.id);
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== cust.id));
                          } else {
                            const maxAllowed = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : 4;
                            if (selectedPlayerIds.length < maxAllowed) {
                              setSelectedPlayerIds([...selectedPlayerIds, cust.id]);
                            }
                          }
                        }}
                        className={`w-full p-2 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 font-semibold text-indigo-600 dark:text-indigo-300'
                            : isDarkMode
                              ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span>{cust.name}</span>
                          <span className={`text-[11px] block font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{cust.whatsapp}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Action buttons */}
            <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setStartingAsset(null)}
                className={`px-4 py-2 text-xs font-medium rounded-xl ${
                  isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartSession}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Start Timer Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 2: ADD BAR SNACK TO RUNNING SESSION --- */}
      {addingSnackSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md border rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Append Bar Item to Session</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Asset: {addingSnackSession.assetName}</p>
              </div>
              <button
                onClick={() => setAddingSnackSession(null)}
                className={`p-1.5 rounded-lg ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search food or beverage..."
                value={barSearch}
                onChange={(e) => setBarSearch(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {barItems
                .filter(item => item.name.toLowerCase().includes(barSearch.toLowerCase()))
                .map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                      <span className={`font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>₹{item.price}</span>
                    </div>

                    <button
                      onClick={() => {
                        onAddBarItemToSession(addingSnackSession.id, item, 1);
                        setAddingSnackSession(null);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add +1
                    </button>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* --- MODAL 3: SESSION REMINDER SETTER --- */}
      <SessionReminderModal
        isOpen={Boolean(reminderModalSession)}
        onClose={() => setReminderModalSession(null)}
        session={reminderModalSession}
        onSetReminder={(sessionId, minutes) => {
          if (onSetSessionReminder) {
            onSetSessionReminder(sessionId, minutes);
          }
        }}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
