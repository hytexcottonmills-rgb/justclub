import React, { useState, useEffect } from 'react';
import { GameAsset, GameSession, CustomerPlayer, BarItem, MatchType, AssetCategory, BillingIncrement, BillingBasis } from '../types';
import { calculateSessionMetrics, formatMinutes } from '../utils/billing';
import { sanitize10DigitMobile, formatWhatsAppDisplay } from '../utils/phone';
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
  Bell,
  Sparkles,
  Edit3,
  Trash2,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionReminderModal } from './SessionReminderModal';
import { EditSessionModal } from './EditSessionModal';
import { CancelSessionModal } from './CancelSessionModal';
import { WhatsAppInput } from './WhatsAppInput';

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
  onCancelSession?: (sessionId: string, restoreStock: boolean, reason?: string) => void;
  onUpdateSession?: (
    sessionId: string,
    matchType: MatchType,
    players: CustomerPlayer[],
    barOrders: any[]
  ) => void;
  onAddGameAsset?: (asset: Omit<GameAsset, 'id'>) => void;
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
  onCancelSession,
  onUpdateSession,
  onAddGameAsset,
  isDarkMode = true,
  isReadOnly = false,
}) => {
  // Reminder Modal state
  const [reminderModalSession, setReminderModalSession] = useState<GameSession | null>(null);
  // Edit Session Modal state
  const [editingSession, setEditingSession] = useState<GameSession | null>(null);
  // Cancel Session Modal state
  const [cancellingSession, setCancellingSession] = useState<GameSession | null>(null);
  // Add Asset Modal State
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('Billiards');
  const [newAssetRate, setNewAssetRate] = useState<number>(300);
  const [newAssetIncrement, setNewAssetIncrement] = useState<BillingIncrement>('exact');
  const [newAssetBillingBasis, setNewAssetBillingBasis] = useState<BillingBasis>('PER_TABLE');
  const [addAssetError, setAddAssetError] = useState<string | null>(null);

  const handleSaveNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) {
      setAddAssetError('Please enter a table or station name.');
      return;
    }
    if (newAssetRate < 0 || isNaN(newAssetRate)) {
      setAddAssetError('Hourly rate must be 0 or greater.');
      return;
    }
    if (onAddGameAsset) {
      onAddGameAsset({
        name: newAssetName.trim(),
        category: newAssetCategory,
        hourlyRate: Number(newAssetRate),
        billingIncrement: newAssetIncrement,
        billingBasis: newAssetBillingBasis,
        status: 'available',
      });
    }
    setIsAddAssetModalOpen(false);
    setNewAssetName('');
    setNewAssetRate(300);
    setNewAssetCategory('Billiards');
    setNewAssetIncrement('exact');
    setNewAssetBillingBasis('PER_TABLE');
    setAddAssetError(null);
  };
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

  // Welcome / Grand Opening guidance banner state
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    return localStorage.getItem('justclub_welcome_dismissed') !== 'true' && localStorage.getItem('justclub_onboarding_completed') === 'true';
  });

  const handleDismissWelcome = () => {
    localStorage.setItem('justclub_welcome_dismissed', 'true');
    setShowWelcomeBanner(false);
  };

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

  // Dynamically derive category filter tabs from configured game assets
  const categories = React.useMemo(() => {
    const presentCats: string[] = Array.from(new Set(assets.map(a => a.category).filter(Boolean))) as string[];
    const categoryOrder = [
      'Billiards', 
      'Table Tennis', 
      'PS5', 
      'PC Gaming', 
      'VR', 
      'Foosball', 
      'Air Hockey', 
      'Darts', 
      'Karaoke', 
      'Board Games'
    ];
    presentCats.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a);
      const idxB = categoryOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ['All', ...presentCats];
  }, [assets]);

  // Reset selected category if it is no longer available in categories
  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

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
    const cleanPhone = sanitize10DigitMobile(newCustPhone);
    if (!newCustName.trim() || cleanPhone.length !== 10) return;
    const created = onAddNewCustomer(newCustName.trim(), cleanPhone);
    setSelectedPlayerIds(prev => [...prev, created.id]);
    setNewCustName('');
    setNewCustPhone('');
    setShowNewCustForm(false);
  };

  const handleConfirmStartSession = () => {
    if (!startingAsset) return;
    const requiredPlayers = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : Infinity;
    
    // If fewer players tagged than required, fallback to filling with first available
    let finalIds = [...selectedPlayerIds];
    if (matchType !== 'group' && finalIds.length < requiredPlayers) {
      const remaining = customers.filter(c => !finalIds.includes(c.id));
      for (let i = finalIds.length; i < requiredPlayers; i++) {
        if (remaining[i - finalIds.length]) {
          finalIds.push(remaining[i - finalIds.length].id);
        }
      }
    }

    if (matchType === 'group' && finalIds.length === 0) {
      return;
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

      {/* Grand Opening Welcome Banner */}
      {showWelcomeBanner && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/30' 
            : 'bg-gradient-to-r from-indigo-50 via-white to-white border-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs sm:text-sm font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <span>🎉 Club Setup Complete — Your Floor is Live!</span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {assets.length} Stations Active
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                All your tables and bar inventory are configured. Click <strong className="text-indigo-400">"Start Session"</strong> on any table to meter match timers and split bills.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismissWelcome}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            Got it, Let's Play
          </button>
        </div>
      )}

      {/* Category Segmented Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All' ? assets.length : assets.filter(a => a.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isDarkMode
                    ? 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono font-black ${
                isSelected 
                  ? 'bg-indigo-500 text-white' 
                  : isDarkMode 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
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
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {asset.billingBasis === 'PER_PERSON' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        Per Person
                      </span>
                    )}
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
                    {activeSession?.status === 'running' ? 'Running' : 'Paused'}
                  </span>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    Available
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
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {activeSession.taggedPlayers.length} Tagged Players
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setEditingSession(activeSession)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer ${
                              isDarkMode ? 'text-indigo-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'
                            }`}
                            title="Edit players and match format"
                          >
                            <Edit3 className="w-2.5 h-2.5" /> Edit
                          </button>
                        )}
                      </div>
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
                        <div className="flex items-center gap-1.5">
                          <span>Attached Bar Snacks ({activeSession.attachedBarOrders.length})</span>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => setEditingSession(activeSession)}
                              className={`p-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer ${
                                isDarkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-slate-100'
                              }`}
                              title="Edit attached snacks"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
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

              {/* Card Action Controls (Clean 2-Row Operational Layout) */}
              <div className={`pt-3 border-t space-y-2 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                {isOccupied && activeSession ? (
                  <>
                    {/* Row 1: Quick Controls (Pause/Resume [Icon], Reminder [Icon], + Snack, Edit) */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Pause / Resume Icon Button */}
                      <button
                        type="button"
                        onClick={() => !isReadOnly && onTogglePauseSession(activeSession.id)}
                        disabled={isReadOnly}
                        className={`h-9 w-10 sm:w-11 rounded-xl text-xs font-semibold transition border flex items-center justify-center shrink-0 cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                            : isDarkMode
                              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title={isReadOnly ? 'POS is View-Only' : activeSession.status === 'running' ? 'Pause Session' : 'Resume Session'}
                        aria-label={activeSession.status === 'running' ? 'Pause Session' : 'Resume Session'}
                      >
                        {activeSession.status === 'running' ? (
                          <Pause className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </button>

                      {/* Reminder Icon Button */}
                      <button
                        type="button"
                        onClick={() => !isReadOnly && setReminderModalSession(activeSession)}
                        disabled={isReadOnly}
                        className={`h-9 w-10 sm:w-11 rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 transition border cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                            : activeSession.reminderMinutes
                              ? isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 ring-1 ring-indigo-500/40' : 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-200'
                              : isDarkMode ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title={activeSession.reminderMinutes ? `Reminder: ${activeSession.reminderMinutes}m (click to edit)` : 'Set Session Reminder'}
                        aria-label="Set Session Reminder"
                      >
                        <Bell className={`w-4 h-4 shrink-0 ${activeSession.reminderMinutes ? (isDarkMode ? 'text-indigo-400 fill-indigo-400/20' : 'text-indigo-600 fill-indigo-600/20') : 'text-slate-400'}`} />
                      </button>

                      {/* + Snack Button */}
                      <button
                        type="button"
                        onClick={() => !isReadOnly && setAddingSnackSession(activeSession)}
                        disabled={isReadOnly}
                        className={`h-9 flex-1 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                            : isDarkMode
                              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title="Add snacks and beverages to this table"
                      >
                        <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate font-bold">+ Snack</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => !isReadOnly && setEditingSession(activeSession)}
                        disabled={isReadOnly}
                        className={`h-9 flex-1 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                            : isDarkMode
                              ? 'bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                        title="Edit players and bar items"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate font-bold">Edit</span>
                      </button>
                    </div>

                    {/* Row 2: Main Actions (Cancel & End/Split) */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      <button
                        onClick={() => !isReadOnly && setCancellingSession(activeSession)}
                        disabled={isReadOnly}
                        className={`col-span-2 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-800'
                            : isDarkMode
                              ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border-rose-500/30'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                        title="Cancel this session & free table"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">Cancel</span>
                      </button>

                      <button
                        onClick={() => !isReadOnly && onOpenSplitBilling(activeSession)}
                        disabled={isReadOnly}
                        className={`col-span-3 py-2.5 px-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-md cursor-pointer ${
                          isReadOnly
                            ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-850 shadow-none'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                        }`}
                      >
                        <Calculator className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">End & Split</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (isReadOnly) return;
                      setStartingAsset(asset);
                      setSelectedPlayerIds(customers.slice(0, 2).map(c => c.id));
                    }}
                    disabled={isReadOnly}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                      isReadOnly
                        ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Session Timer
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* --- ADD NEW GAME TABLE / CONSOLE CARD (Always accessible for new or existing clubs) --- */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-2xl border-2 border-dashed p-5 flex flex-col justify-between transition-all duration-200 ${
            isDarkMode
              ? 'bg-slate-900/30 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 text-slate-100'
              : 'bg-slate-50/70 border-slate-300 hover:border-indigo-400 hover:bg-slate-50 text-slate-900'
          }`}
        >
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  isDarkMode
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}>
                  NEW STATION
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  CONFIGURE
                </span>
              </div>
              <h3 className={`text-base font-bold mt-1 leading-snug ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Add Game Table or Console
              </h3>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              Setup
            </span>
          </div>

          {/* Center Body Placeholder */}
          <div className={`my-6 py-6 border border-dashed rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition ${
            isDarkMode ? 'border-slate-800/80 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-white/60 text-slate-600'
          }`}>
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Gamepad2 className="w-7 h-7 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold">Setup next game station</span>
            <span className="text-[11px] opacity-75">Snooker, Pool, PS5, Foosball, VR & more</span>
          </div>

          {/* Bottom Action Button */}
          <div className={`pt-3 border-t ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => {
                if (isReadOnly) return;
                setIsAddAssetModalOpen(true);
              }}
              disabled={isReadOnly}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                isReadOnly
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Configure & Add Station
            </button>
          </div>
        </motion.div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['solo', '1v1', '2v2', 'group'] as MatchType[]).map(type => (
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
                    {type} {type === 'solo' ? '(1 Player)' : type === '1v1' ? '(2 Players)' : type === '2v2' ? '(4 Players)' : '(Any number)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Tagging Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tag Registered Players ({matchType === 'group' ? `${selectedPlayerIds.length} tagged` : `${selectedPlayerIds.length} / ${matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : 4}`})
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                    <WhatsAppInput
                      value={newCustPhone}
                      onChange={setNewCustPhone}
                      isDarkMode={isDarkMode}
                      size="sm"
                      placeholder="WhatsApp (10 digits)"
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
                  placeholder="Search customer by name or WhatsApp no..."
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
                            const maxAllowed = matchType === 'solo' ? 1 : matchType === '1v1' ? 2 : matchType === '2v2' ? 4 : Infinity;
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
                          <span className={`text-[11px] block font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatWhatsAppDisplay(cust.whatsapp)}</span>
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
                disabled={matchType === 'group' && selectedPlayerIds.length === 0}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-lg flex items-center gap-1.5 ${
                  matchType === 'group' && selectedPlayerIds.length === 0
                    ? 'bg-slate-700 opacity-50 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
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
                .map(item => {
                  const isOutOfStock = item.stock !== null && item.stock <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>₹{item.price}</span>
                          {item.stock !== null ? (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isOutOfStock
                                ? (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600 border border-red-200')
                                : item.stock <= 5
                                ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200')
                                : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                            }`}>
                              {isOutOfStock ? 'Out of stock' : `${item.stock} in stock`}
                            </span>
                          ) : (
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Unlimited</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isOutOfStock) return;
                          onAddBarItemToSession(addingSnackSession.id, item, 1);
                          setAddingSnackSession(null);
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1 text-xs transition ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> {isOutOfStock ? 'Empty' : 'Add +1'}
                      </button>
                    </div>
                  );
                })}
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

      {/* --- MODAL 4: EDIT SESSION (PLAYERS & BAR SNACKS) --- */}
      <EditSessionModal
        isOpen={Boolean(editingSession)}
        session={editingSession}
        customers={customers}
        barItems={barItems}
        onClose={() => setEditingSession(null)}
        onSaveSession={(sessionId, matchType, players, barOrders) => {
          if (onUpdateSession) {
            onUpdateSession(sessionId, matchType, players, barOrders);
          }
          setEditingSession(null);
        }}
        onAddNewCustomer={onAddNewCustomer}
        isDarkMode={isDarkMode}
      />

      {/* --- MODAL 5: CANCEL SESSION CONFIRMATION --- */}
      <CancelSessionModal
        isOpen={Boolean(cancellingSession)}
        session={cancellingSession}
        onClose={() => setCancellingSession(null)}
        onConfirmCancel={(sessionId, restoreStock, reason) => {
          if (onCancelSession) {
            onCancelSession(sessionId, restoreStock, reason);
          }
          setCancellingSession(null);
        }}
        isDarkMode={isDarkMode}
      />

      {/* --- MODAL 6: ADD NEW TABLE OR GAMING CONSOLE --- */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg border rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-start justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Add New Table or Gaming Console
                </h3>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configures hourly rates and billing rules for active play sessions
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddAssetModalOpen(false);
                  setAddAssetError(null);
                }}
                className={`p-1.5 rounded-lg transition cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAsset} className="space-y-4">
              {addAssetError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-400 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addAssetError}</span>
                </div>
              )}

              {/* Field 1: Table / Asset Name */}
              <div className="space-y-1.5">
                <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Table / Asset Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table 4 - Snooker"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold border transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                  required
                  autoFocus
                />
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Display label on Arena dashboard
                </p>
              </div>

              {/* Field 2: Game Category */}
              <div className="space-y-1.5">
                <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Game Category
                </label>
                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Billiards">Billiards / Snooker</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="PS5">PlayStation / Xbox Consoles</option>
                  <option value="PC Gaming">PC Gaming Rigs</option>
                  <option value="VR">VR Pod / Station</option>
                  <option value="Foosball">Foosball Table</option>
                  <option value="Air Hockey">Air Hockey Table</option>
                  <option value="Darts">Darts Lane</option>
                  <option value="Karaoke">Karaoke Suite</option>
                  <option value="Board Games">Board Game Lounge</option>
                </select>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Filter tag in session view
                </p>
              </div>

              {/* Field 3: Hourly Rental Rate */}
              <div className="space-y-1.5">
                <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Hourly Rental Rate <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="300"
                    value={newAssetRate || ''}
                    onChange={(e) => setNewAssetRate(Number(e.target.value))}
                    className={`w-full rounded-xl pl-7 pr-12 py-2.5 text-xs font-mono font-bold border transition ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                    }`}
                    required
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    / hour
                  </span>
                </div>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Price per 60 minutes played
                </p>
              </div>

              {/* Field 4: Time Billing Method */}
              <div className="space-y-1.5">
                <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Time Billing Method
                </label>
                <select
                  value={newAssetIncrement}
                  onChange={(e) => setNewAssetIncrement(e.target.value as BillingIncrement)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="exact">Exact Minutes Billing (Per Sec/Min)</option>
                  <option value="15min">15-Minute Blocks Rounding</option>
                </select>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {newAssetIncrement === 'exact' ? 'Calculates exact elapsed minutes' : 'Rounds elapsed duration up to next 15-minute block'}
                </p>
              </div>

              {/* Field 5: Billing Basis */}
              <div className="space-y-1.5">
                <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Billing Basis
                </label>
                <select
                  value={newAssetBillingBasis}
                  onChange={(e) => setNewAssetBillingBasis(e.target.value as BillingBasis)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="PER_TABLE">Per Table (Flat hourly rate)</option>
                  <option value="PER_PERSON">Per Person (Hourly rate × player count)</option>
                </select>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {newAssetBillingBasis === 'PER_PERSON' ? 'Multiplies hourly rate by player count' : 'Flat rate for table regardless of players'}
                </p>
              </div>

              {/* Modal Buttons */}
              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAssetModalOpen(false);
                    setAddAssetError(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Table / Console Asset
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
