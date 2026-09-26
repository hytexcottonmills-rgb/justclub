import React, { useState, useMemo } from 'react';
import { 
  GameSession, 
  GameSplitRule, 
  BarSplitRule, 
  PaymentMethod, 
  CustomerPlayer, 
  BillSettlementResult 
} from '../types';
import { calculateSessionMetrics, computeSplitSettlement, generateWhatsAppReceiptLink, formatWhatsAppDisplay } from '../utils/billing';
import { 
  X, 
  Check, 
  Calculator, 
  Award, 
  Coffee, 
  Users, 
  CreditCard, 
  Send, 
  MessageSquare, 
  Receipt,
  DollarSign,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SplitBillingModalProps {
  isOpen: boolean;
  session: GameSession | null;
  upiId: string;
  clubName: string;
  onClose: () => void;
  onConfirmSettlement: (result: BillSettlementResult) => void;
  isDarkMode?: boolean;
}

export const SplitBillingModal: React.FC<SplitBillingModalProps> = ({
  isOpen,
  session,
  upiId,
  clubName,
  onClose,
  onConfirmSettlement,
  isDarkMode = true,
}) => {
  if (!isOpen || !session) return null;

  const metrics = calculateSessionMetrics(session);
  const players = session.taggedPlayers;
  const is1v1 = session.matchType === '1v1';
  const is2v2 = session.matchType === '2v2';
  const isGroup = session.matchType === 'group';
  const isSolo = session.matchType === 'solo';

  // Rule State
  const initialGameRule: GameSplitRule = isSolo ? 'standard' : is1v1 ? '1v1_loser_pays' : is2v2 ? '2v2_loser_pays' : 'group_equal';
  const [gameRule, setGameRule] = useState<GameSplitRule>(initialGameRule);

  const isLoserPaysActive = gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays';

  const [barRule, setBarRule] = useState<BarSplitRule>(
    metrics.barCost > 0 && isLoserPaysActive ? 'link_to_game_loser' : 'equal_share'
  );

  const handleSetGameRule = (newRule: GameSplitRule) => {
    setGameRule(newRule);
    const isNewEqual = newRule === '1v1_equal' || newRule === '2v2_equal' || newRule === 'group_equal' || newRule === 'standard';
    if (isNewEqual && barRule === 'link_to_game_loser') {
      setBarRule('equal_share');
    }
  };

  // Loser selection state
  // For 1v1, defaults to player 1. For 2v2, defaults to first 2 players.
  const [losingPlayerIds, setLosingPlayerIds] = useState<string[]>(() => {
    if (is1v1 && players.length >= 2) return [players[1].id];
    if (is2v2 && players.length >= 4) return [players[2].id, players[3].id];
    return players[0] ? [players[0].id] : [];
  });

  // Single payer state
  const [singlePayerId, setSinglePayerId] = useState<string>(players[0]?.id || '');

  // Custom bar split player selection state
  const [customBarSplitPlayerIds, setCustomBarSplitPlayerIds] = useState<string[]>(
    players.map(p => p.id)
  );

  // In Ledger-First architecture, all checkout shares are strictly posted to the customer's ledger
  const paymentMethods: Record<string, PaymentMethod> = useMemo(() => {
    const initial: Record<string, PaymentMethod> = {};
    players.forEach(p => {
      initial[p.id] = 'Ledger';
    });
    return initial;
  }, [players]);

  // Computed Settlement result
  const settlementResult = computeSplitSettlement({
    session,
    gameSplitRule: gameRule,
    barSplitRule: barRule,
    losingPlayerIds,
    singlePayerId,
    customBarSplitPlayerIds,
    playerPaymentMethods: paymentMethods,
  });

  const toggleLoser = (playerId: string) => {
    if (is1v1) {
      setLosingPlayerIds([playerId]);
    } else if (is2v2) {
      if (losingPlayerIds.includes(playerId)) {
        if (losingPlayerIds.length > 1) {
          setLosingPlayerIds(losingPlayerIds.filter(id => id !== playerId));
        }
      } else {
        if (losingPlayerIds.length < 2) {
          setLosingPlayerIds([...losingPlayerIds, playerId]);
        } else {
          setLosingPlayerIds([losingPlayerIds[1], playerId]);
        }
      }
    }
  };

  const toggleCustomBarPlayer = (playerId: string) => {
    if (customBarSplitPlayerIds.includes(playerId)) {
      if (customBarSplitPlayerIds.length > 1) {
        setCustomBarSplitPlayerIds(customBarSplitPlayerIds.filter(id => id !== playerId));
      }
    } else {
      setCustomBarSplitPlayerIds([...customBarSplitPlayerIds, playerId]);
    }
  };

  const handleFinalize = () => {
    onConfirmSettlement(settlementResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border ${
              isDarkMode 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Checkout & Split Billing Engine
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  isDarkMode 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {session.matchType.toUpperCase()}
                </span>
                <span className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  isDarkMode 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Pushes to Ledger
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Asset: <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{session.assetName}</span> • Duration: <span className={`font-mono font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{metrics.formattedDuration}</span> • <span className={isDarkMode ? 'text-amber-300' : 'text-amber-700 font-medium'}>All player shares are posted to Customer Ledgers for settlement</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>

          {/* Top Summary Bar */}
          <div className={`grid grid-cols-1 ${settlementResult.totalDiscount && settlementResult.totalDiscount > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-slate-950/80 border-slate-800' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800' 
                : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Game Time Cost</span>
              </div>
              <span className={`text-base font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ₹{metrics.gameCost}
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800' 
                : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-2">
                <Coffee className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Attached Bar Order</span>
              </div>
              <span className={`text-base font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ₹{metrics.barCost}
              </span>
            </div>

            {settlementResult.totalDiscount !== undefined && settlementResult.totalDiscount > 0 && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-amber-950/40 border-amber-500/30' 
                  : 'bg-amber-50/80 border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">⭐</span>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>VIP Discount</span>
                </div>
                <span className={`text-base font-bold font-mono ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  -₹{settlementResult.totalDiscount}
                </span>
              </div>
            )}

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-indigo-950/40 border-indigo-500/30' 
                : 'bg-indigo-50/80 border-indigo-200'
            }`}>
              <div className="flex items-center gap-2">
                <Receipt className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-indigo-200' : 'text-indigo-950'}`}>Grand Total</span>
              </div>
              <span className={`text-lg font-extrabold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                ₹{settlementResult.grandTotal}
              </span>
            </div>
          </div>

          {/* Round Off Summary Banner */}
          {settlementResult.roundOffAmount !== undefined && Math.abs(settlementResult.roundOffAmount) >= 0.01 && (
            <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-1 text-xs ${
              isDarkMode 
                ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="font-semibold">
                Round Off: {settlementResult.roundOffAmount > 0 ? '+' : ''}₹{settlementResult.roundOffAmount}
              </span>
              <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Split evenly to the nearest rupee so every player pays exactly the same amount
              </span>
            </div>
          )}

          {/* Section 1: Game Time Split Matrix */}
          {!isSolo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Award className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} /> 1. Game Time Split Rule
                </h3>
                <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {isGroup ? 'Equal split across group' : 'Select outcome based on match rules'}
                </span>
              </div>

              {isGroup ? (
                <div className={`p-3.5 rounded-xl border text-left flex items-start gap-3 ${
                  isDarkMode
                    ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                    : 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/30'
                }`}>
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Split Equally Among All {players.length} Players</div>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Total game cost (₹{metrics.gameCost}) is divided equally (₹{Math.round(metrics.gameCost / Math.max(1, players.length))} each) among all {players.length} players.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Rule A: Equal Split */}
                  <button
                    type="button"
                    onClick={() => handleSetGameRule(is1v1 ? '1v1_equal' : '2v2_equal')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      gameRule === '1v1_equal' || gameRule === '2v2_equal'
                        ? isDarkMode
                          ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                          : 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/30'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      gameRule === '1v1_equal' || gameRule === '2v2_equal' 
                        ? 'bg-indigo-600 text-white' 
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Equal Split ({is1v1 ? '50/50' : '25% each'})</div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Total game cost (₹{metrics.gameCost}) is divided equally among all {players.length} players.
                      </p>
                    </div>
                  </button>

                  {/* Rule B: Loser Pays (LP) */}
                  <button
                    type="button"
                    onClick={() => handleSetGameRule(is1v1 ? '1v1_loser_pays' : '2v2_loser_pays')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays'
                        ? isDarkMode
                          ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                          : 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500/30'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays' 
                        ? 'bg-amber-500 text-slate-950' 
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Loser Pays (LP) Rule</div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {is1v1 
                          ? '1 selected losing player absorbs 100% of game time cost.'
                          : '2 selected losing players split game time cost 50/50.'}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Loser Selection Picker */}
              {!isGroup && (gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays') && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDarkMode 
                    ? 'bg-slate-950/80 border-amber-500/30 text-slate-200' 
                    : 'bg-amber-50/60 border-amber-200 text-slate-800'
                }`}>
                  <div className={`text-xs font-semibold flex items-center justify-between ${
                    isDarkMode ? 'text-amber-300' : 'text-amber-900'
                  }`}>
                    <span>Tag the Game Loser{is2v2 ? 's (Select 2)' : ' (Select 1)'}:</span>
                    <span className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Click player card to toggle loser tag
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {players.map(p => {
                      const isSelectedLoser = losingPlayerIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleLoser(p.id)}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                            isSelectedLoser
                              ? isDarkMode
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                                : 'bg-amber-100 border-amber-500 text-amber-950 font-bold shadow-xs'
                              : isDarkMode
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isSelectedLoser && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-slate-950 font-bold rounded">
                              LOSER
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Attached Bar Order Split Matrix */}
          {metrics.barCost > 0 && (
            <div className={`space-y-3 pt-2 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Coffee className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} /> 2. Attached Bar Order Split Rule
                </h3>
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Total Bar: ₹{metrics.barCost}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Link to Game Loser (Only visible when Loser Pays is selected for Game Split) */}
                {!isSolo && isLoserPaysActive && (
                  <button
                    type="button"
                    onClick={() => setBarRule('link_to_game_loser')}
                    className={`p-3 rounded-xl border text-left transition ${
                      barRule === 'link_to_game_loser'
                        ? isDarkMode
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                          : 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500/30'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-xs font-bold flex items-center gap-1 ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-800'
                    }`}>
                      <Award className="w-3.5 h-3.5" /> Link to Game Loser (LP)
                    </div>
                    <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Shift 100% of bar bill to tagged game loser(s).
                    </div>
                  </button>
                )}

                {/* Equal Share */}
                <button
                  type="button"
                  onClick={() => setBarRule('equal_share')}
                  className={`p-3 rounded-xl border text-left transition ${
                    barRule === 'equal_share'
                      ? isDarkMode
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/30'
                      : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Equal Share</div>
                  <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Divide bar bill evenly across all players.
                  </div>
                </button>

                {/* Single Payer */}
                <button
                  type="button"
                  onClick={() => setBarRule('single_payer')}
                  className={`p-3 rounded-xl border text-left transition ${
                    barRule === 'single_payer'
                      ? isDarkMode
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/30'
                      : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Single Payer</div>
                  <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Assign 100% bar bill to 1 player.
                  </div>
                </button>

                {/* Custom Split */}
                <button
                  type="button"
                  onClick={() => setBarRule('custom_split')}
                  className={`p-3 rounded-xl border text-left transition ${
                    barRule === 'custom_split'
                      ? isDarkMode
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/30'
                      : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Custom Split</div>
                  <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select specific players to share bar bill.
                  </div>
                </button>
              </div>

              {/* Single Payer Selection */}
              {barRule === 'single_payer' && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select Bar Payer:</span>
                  <select
                    value={singlePayerId}
                    onChange={(e) => setSinglePayerId(e.target.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border focus:outline-none focus:border-indigo-500 ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white' 
                        : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Bar Players Selection */}
              {barRule === 'custom_split' && (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`font-medium block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select Players Sharing Bar Bill:</span>
                  <div className="flex flex-wrap gap-2">
                    {players.map(p => {
                      const isIncluded = customBarSplitPlayerIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleCustomBarPlayer(p.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                            isIncluded
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : isDarkMode
                                ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Final Computed Breakdown per Tagged Player (Pushed to Ledger) */}
          <div className={`space-y-3 pt-2 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <CreditCard className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> 3. Player Settlement Shares (Post to Ledgers)
              </h3>
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <Receipt className="w-3.5 h-3.5" /> All shares debit to Customer Accounts
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-200/90' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <ShieldCheck className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>
                <strong>Ledger-First Architecture:</strong> Completing this session pushes calculated shares directly into each customer's account ledger. Full payment collection (Cash or UPI QR) happens in the <strong>Players</strong> tab.
              </span>
            </div>

            <div className="space-y-2.5">
              {settlementResult.shares.map((share) => {
                const customerObj = players.find(p => p.id === share.playerId);
                const currentLedger = customerObj?.ledgerBalance || 0;

                return (
                  <div
                    key={share.playerId}
                    className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition ${
                      isDarkMode 
                        ? 'bg-slate-950/90 border-slate-800' 
                        : 'bg-slate-50/80 border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Left: Player details & share breakdown */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{share.playerName}</span>
                        <span className="text-xs text-slate-500 font-mono">{formatWhatsAppDisplay(share.whatsapp)}</span>
                        {share.membershipBadge && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${
                            isDarkMode
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            <span>⭐</span>
                            <span>{share.membershipBadge}</span>
                          </span>
                        )}
                        {currentLedger < 0 ? (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                            isDarkMode 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            Existing Debit: ₹{Math.abs(currentLedger)}
                          </span>
                        ) : currentLedger > 0 ? (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                            isDarkMode 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            Wallet Credit: ₹{currentLedger}
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                            isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                          }`}>
                            Balance: ₹0
                          </span>
                        )}
                      </div>

                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {share.gameDiscountAmount && share.gameDiscountAmount > 0 ? (
                          <span>
                            Game: <span className="line-through text-slate-500">₹{share.gameCostShare}</span>{' '}
                            <span className="text-emerald-500 font-bold">-₹{share.gameDiscountAmount} ({share.gameDiscountPercent}%)</span>{' '}
                            = <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900 font-bold'}>₹{share.netGameCostShare}</strong>
                          </span>
                        ) : (
                          <span>Game Share: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900 font-bold'}>₹{share.gameCostShare}</strong></span>
                        )}
                        {share.barDiscountAmount && share.barDiscountAmount > 0 ? (
                          <span>
                            Bar: <span className="line-through text-slate-500">₹{share.barCostShare}</span>{' '}
                            <span className="text-amber-500 font-bold">-₹{share.barDiscountAmount} ({share.barDiscountPercent}%)</span>{' '}
                            = <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900 font-bold'}>₹{share.netBarCostShare}</strong>
                          </span>
                        ) : (
                          <span>Bar Share: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900 font-bold'}>₹{share.netBarCostShare ?? share.barCostShare}</strong></span>
                        )}
                        <span className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Total Due: ₹{share.totalShare}</span>
                      </div>
                    </div>

                    {/* Right: Direct Ledger Post Badge & WhatsApp Share */}
                    <div className={`flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 justify-between sm:justify-start ${
                      isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                    }`}>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                        isDarkMode 
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' 
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <Receipt className={`w-3.5 h-3.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        <span>Debit ₹{share.totalShare} to Ledger</span>
                      </div>

                      {/* WhatsApp Share preview button */}
                      <a
                        href={generateWhatsAppReceiptLink(
                          share.playerName,
                          share.whatsapp,
                          clubName,
                          share.totalShare,
                          0,
                          share.totalShare,
                          upiId
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2 rounded-xl border transition shrink-0 ${
                          isDarkMode 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title="Preview WhatsApp Split Breakdown"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <ShieldCheck className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className="truncate">
              Push <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₹{settlementResult.grandTotal}</span> to ledgers & release <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{session.assetName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800' 
                  : 'text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleFinalize}
              className="px-4 sm:px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Check className="w-4 h-4" />
              <span>Push All to Ledgers & Release Table (₹{settlementResult.grandTotal})</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
