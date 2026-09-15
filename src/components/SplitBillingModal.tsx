import React, { useState, useEffect } from 'react';
import { 
  GameSession, 
  GameSplitRule, 
  BarSplitRule, 
  PaymentMethod, 
  CustomerPlayer, 
  BillSettlementResult 
} from '../types';
import { calculateSessionMetrics, computeSplitSettlement, generateWhatsAppReceiptLink } from '../utils/billing';
import { UpiQrModal } from './UpiQrModal';
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
  QrCode,
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
  const isSolo = session.matchType === 'solo';

  // Rule State
  const initialGameRule: GameSplitRule = isSolo ? 'standard' : is1v1 ? '1v1_loser_pays' : '2v2_loser_pays';
  const [gameRule, setGameRule] = useState<GameSplitRule>(initialGameRule);

  const isLoserPaysActive = gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays';

  const [barRule, setBarRule] = useState<BarSplitRule>(
    metrics.barCost > 0 && isLoserPaysActive ? 'link_to_game_loser' : 'equal_share'
  );

  const handleSetGameRule = (newRule: GameSplitRule) => {
    setGameRule(newRule);
    const isNewEqual = newRule === '1v1_equal' || newRule === '2v2_equal' || newRule === 'standard';
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

  // Payment methods per player
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>(() => {
    const initial: Record<string, PaymentMethod> = {};
    players.forEach(p => {
      initial[p.id] = 'Cash';
    });
    return initial;
  });

  // Active UPI QR Modal state for specific player payment
  const [qrModalPlayer, setQrModalPlayer] = useState<{ name: string; amount: number } | null>(null);

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

  const handleSetPaymentMethod = (playerId: string, method: PaymentMethod) => {
    setPaymentMethods(prev => ({ ...prev, [playerId]: method }));
  };

  const handleFinalize = () => {
    onConfirmSettlement(settlementResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Checkout & Split Billing Engine
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {session.matchType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Asset: <span className="text-slate-200 font-semibold">{session.assetName}</span> • Duration: <span className="font-mono text-indigo-300">{metrics.formattedDuration}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-400 font-medium">Game Time Cost</span>
              </div>
              <span className="text-base font-bold font-mono text-white">
                ₹{metrics.gameCost}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400 font-medium">Attached Bar Order</span>
              </div>
              <span className="text-base font-bold font-mono text-white">
                ₹{metrics.barCost}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/30">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-indigo-200 font-semibold">Grand Total</span>
              </div>
              <span className="text-lg font-extrabold font-mono text-emerald-400">
                ₹{metrics.totalCost}
              </span>
            </div>
          </div>

          {/* Section 1: Game Time Split Matrix */}
          {!isSolo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" /> 1. Game Time Split Rule
                </h3>
                <span className="text-[11px] text-slate-500">
                  Select outcome based on match rules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rule A: Equal Split */}
                <button
                  type="button"
                  onClick={() => handleSetGameRule(is1v1 ? '1v1_equal' : '2v2_equal')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                    gameRule === '1v1_equal' || gameRule === '2v2_equal'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    gameRule === '1v1_equal' || gameRule === '2v2_equal' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Equal Split ({is1v1 ? '50/50' : '25% each'})</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
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
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300">Loser Pays (LP) Rule</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {is1v1 
                        ? '1 selected losing player absorbs 100% of game time cost.'
                        : '2 selected losing players split game time cost 50/50.'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Loser Selection Picker */}
              {(gameRule === '1v1_loser_pays' || gameRule === '2v2_loser_pays') && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/30 text-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                    <span>Tag the Game Loser{is2v2 ? 's (Select 2)' : ' (Select 1)'}:</span>
                    <span className="text-[11px] font-normal text-slate-400">
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
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
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
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-400" /> 2. Attached Bar Order Split Rule
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">
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
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Link to Game Loser (LP)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
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
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Equal Share</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Divide bar bill evenly across all players.
                  </div>
                </button>

                {/* Single Payer */}
                <button
                  type="button"
                  onClick={() => setBarRule('single_payer')}
                  className={`p-3 rounded-xl border text-left transition ${
                    barRule === 'single_payer'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Single Payer</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Assign 100% bar bill to 1 player.
                  </div>
                </button>

                {/* Custom Split */}
                <button
                  type="button"
                  onClick={() => setBarRule('custom_split')}
                  className={`p-3 rounded-xl border text-left transition ${
                    barRule === 'custom_split'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Custom Split</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Select specific players to share bar bill.
                  </div>
                </button>
              </div>

              {/* Single Payer Selection */}
              {barRule === 'single_payer' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
                  <span className="text-slate-400 font-medium">Select Bar Payer:</span>
                  <select
                    value={singlePayerId}
                    onChange={(e) => setSinglePayerId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Bar Players Selection */}
              {barRule === 'custom_split' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <span className="text-slate-400 font-medium block">Select Players Sharing Bar Bill:</span>
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
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
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

          {/* Section 3: Final Computed Breakdown per Tagged Player */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" /> 3. Player Settlement Shares & Payment Method
            </h3>

            <div className="space-y-2.5">
              {settlementResult.shares.map((share) => {
                const customerObj = players.find(p => p.id === share.playerId);
                const currentLedger = customerObj?.ledgerBalance || 0;

                return (
                  <div
                    key={share.playerId}
                    className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Player details & share breakdown */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{share.playerName}</span>
                        <span className="text-xs text-slate-500 font-mono">+{share.whatsapp}</span>
                        {currentLedger < 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                            Ledger Debit: ₹{Math.abs(currentLedger)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Game Share: <strong className="text-slate-200">₹{share.gameCostShare}</strong></span>
                        <span>Bar Share: <strong className="text-slate-200">₹{share.barCostShare}</strong></span>
                        <span className="text-emerald-400 font-bold">Total: ₹{share.totalShare}</span>
                      </div>
                    </div>

                    {/* Right: Payment Method buttons & Action */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetPaymentMethod(share.playerId, 'Cash')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            share.paymentMethod === 'Cash'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Cash
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleSetPaymentMethod(share.playerId, 'UPI');
                            setQrModalPlayer({ name: share.playerName, amount: share.totalShare });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            share.paymentMethod === 'UPI'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          UPI
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetPaymentMethod(share.playerId, 'Ledger')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            share.paymentMethod === 'Ledger'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Push to Ledger
                        </button>
                      </div>

                      {/* WhatsApp receipt preview button */}
                      <a
                        href={generateWhatsAppReceiptLink(
                          share.playerName,
                          share.whatsapp,
                          clubName,
                          share.totalShare,
                          share.paymentMethod === 'Ledger' ? 0 : share.totalShare,
                          share.paymentMethod === 'Ledger' ? share.totalShare : 0,
                          upiId
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition"
                        title="Generate Zero-Cost WhatsApp Receipt Link"
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
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Settle POS & auto-release asset <span className="font-semibold text-white">{session.assetName}</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalize}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete & Settle Session (₹{metrics.totalCost})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Individual Player UPI QR Modal Trigger */}
      {qrModalPlayer && (
        <UpiQrModal
          isOpen={Boolean(qrModalPlayer)}
          onClose={() => setQrModalPlayer(null)}
          amount={qrModalPlayer.amount}
          upiId={upiId}
          clubName={clubName}
          customerName={qrModalPlayer.name}
        />
      )}
    </div>
  );
};
