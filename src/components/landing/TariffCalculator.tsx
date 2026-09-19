import React, { useState } from 'react';
import { Calculator, Clock, Users, Coffee, Receipt, ArrowRight, Check, Sparkles } from 'lucide-react';
import { GAME_OPTIONS } from './BookingModal';

interface ExtraItem {
  id: string;
  name: string;
  price: number;
}

const SNACK_OPTIONS: ExtraItem[] = [
  { id: '1', name: 'Cold Coffee / Frappe', price: 160 },
  { id: '2', name: 'Red Bull Energy Drink', price: 140 },
  { id: '3', name: 'Loaded Cheese Nachos', price: 180 },
  { id: '4', name: 'Crispy French Fries', price: 120 },
  { id: '5', name: 'Gourmet Club Burger', price: 190 },
  { id: '6', name: 'Mocktail Blue Lagoon', price: 150 },
];

const GAME_TARIFFS: Record<string, { hourlyRate: number; minDuration: number; unit: string }> = {
  billiards: { hourlyRate: 200, minDuration: 0.5, unit: 'Table' },
  snooker: { hourlyRate: 350, minDuration: 1, unit: '12ft Table' },
  ps5: { hourlyRate: 240, minDuration: 0.5, unit: 'Console' },
  pc: { hourlyRate: 120, minDuration: 1, unit: 'Rig' },
  vr: { hourlyRate: 450, minDuration: 0.25, unit: 'Pod' },
  tabletennis: { hourlyRate: 180, minDuration: 0.5, unit: 'Table' },
  foosball: { hourlyRate: 120, minDuration: 0.5, unit: 'Table' },
  airhockey: { hourlyRate: 160, minDuration: 0.5, unit: 'Table' },
  darts: { hourlyRate: 200, minDuration: 0.5, unit: 'Lane' },
  karaoke: { hourlyRate: 1200, minDuration: 1, unit: 'Suite' },
  boardgames: { hourlyRate: 150, minDuration: 1, unit: 'Table' },
};

export const TariffCalculator: React.FC<{ onBookNow: (gameId: string) => void }> = ({ onBookNow }) => {
  const [selectedGameId, setSelectedGameId] = useState('snooker');
  const [durationHours, setDurationHours] = useState(2);
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({
    '1': 2, // 2 Cold Coffees
    '3': 1, // 1 Loaded Nachos
  });
  const [splitMode, setSplitMode] = useState<'equal' | 'loser_pays' | '50_50'>('loser_pays');
  const [playersCount, setPlayersCount] = useState(2);

  const tariff = GAME_TARIFFS[selectedGameId] || GAME_TARIFFS.snooker;
  const gameInfo = GAME_OPTIONS.find(g => g.id === selectedGameId) || GAME_OPTIONS[0];

  const gameCharge = Math.round(durationHours * tariff.hourlyRate);
  const snacksCharge = Object.entries(selectedSnacks).reduce((sum, [id, qty]) => {
    const item = SNACK_OPTIONS.find(s => s.id === id);
    return sum + (item ? item.price * Number(qty) : 0);
  }, 0);

  const totalBill = gameCharge + snacksCharge;

  const toggleSnack = (id: string) => {
    setSelectedSnacks(prev => {
      const current = prev[id] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const updateSnackQty = (id: string, delta: number) => {
    setSelectedSnacks(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <section id="calculator" className="py-20 bg-slate-900 border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase border border-indigo-500/30">
            <Calculator className="w-3.5 h-3.5" /> Interactive Live Bill & Tariff Simulator
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Calculate Your Game + Bar Bill Instantly
          </h2>
          <p className="text-sm text-slate-300">
            Select any of our 11 gaming attractions, adjust playing hours, add snacks & drinks, and simulate custom split billing.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Game Zone Selector Buttons */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Step 1: Choose Attraction ({GAME_OPTIONS.length} Games)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {GAME_OPTIONS.map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      selectedGameId === game.id
                        ? 'bg-indigo-600 text-white font-extrabold border-indigo-500 shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{game.icon}</span>
                    <div className="truncate">
                      <div className="text-[11px] truncate">{game.name.split('(')[0]}</div>
                      <div className={`text-[10px] font-mono ${selectedGameId === game.id ? 'text-indigo-200' : 'text-emerald-400'}`}>
                        {game.rate}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Duration Slider */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" /> Playing Duration:
                </span>
                <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 font-mono font-black text-sm rounded-xl border border-indigo-500/30">
                  {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'} ({durationHours * 60} mins)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={durationHours}
                onChange={e => setDurationHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>30 Mins</span>
                <span>1 Hour</span>
                <span>2 Hours</span>
                <span>3 Hours</span>
                <span>4 Hours</span>
                <span>5 Hours</span>
              </div>
            </div>

            {/* 3. Extra Bar & Cafe Snacks */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-emerald-400" /> Step 2: Add Snacks & Drinks to the Bill
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SNACK_OPTIONS.map(snack => {
                  const qty = selectedSnacks[snack.id] || 0;
                  return (
                    <div
                      key={snack.id}
                      className={`p-2.5 rounded-xl border transition ${
                        qty > 0
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-bold leading-tight truncate">{snack.name}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="font-mono text-emerald-400 font-extrabold text-xs">₹{snack.price}</span>
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateSnackQty(snack.id, -1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono text-white text-xs font-bold">{qty}</span>
                            <button
                              onClick={() => updateSnackQty(snack.id, 1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleSnack(snack.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-bold transition"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Split Mode Selection */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Step 3: Split Billing Rule
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSplitMode('loser_pays')}
                  className={`p-2.5 rounded-xl border text-center transition text-xs font-bold ${
                    splitMode === 'loser_pays' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🎯 1v1 Loser Pays
                </button>
                <button
                  onClick={() => setSplitMode('50_50')}
                  className={`p-2.5 rounded-xl border text-center transition text-xs font-bold ${
                    splitMode === '50_50' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  ⚖️ 50 / 50 Split
                </button>
                <button
                  onClick={() => setSplitMode('equal')}
                  className={`p-2.5 rounded-xl border text-center transition text-xs font-bold ${
                    splitMode === 'equal' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👥 4-Way Equal
                </button>
              </div>
            </div>

          </div>

          {/* Right Live Invoice Card (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <span className="font-extrabold text-white text-sm">Estimated Invoice</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30">
                LIVE CALCULATION
              </span>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{gameInfo.icon}</span>
                    <span>{gameInfo.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {durationHours} Hours × ₹{tariff.hourlyRate}/hr
                  </div>
                </div>
                <div className="font-mono text-emerald-400 font-black text-sm">₹{gameCharge}</div>
              </div>

              {Object.entries(selectedSnacks).map(([id, qty]) => {
                const item = SNACK_OPTIONS.find(s => s.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between items-center text-slate-300">
                    <div>
                      <div className="font-medium text-slate-200">{item.name} × {qty}</div>
                      <div className="text-[10px] text-slate-500 font-mono">₹{item.price} each</div>
                    </div>
                    <div className="font-mono text-emerald-400 font-black text-sm">₹{item.price * Number(qty)}</div>
                  </div>
                );
              })}
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Games Total:</span>
                <span className="font-mono text-white">₹{gameCharge}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>F&B / Snacks Total:</span>
                <span className="font-mono text-white">₹{snacksCharge}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base font-extrabold">
                <span className="text-white">Estimated Grand Total:</span>
                <span className="font-mono text-emerald-400 text-xl font-black">₹{totalBill}</span>
              </div>
            </div>

            {/* Player Share Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Player Shares ({splitMode.replace('_', ' ').toUpperCase()}):
              </span>

              {splitMode === 'loser_pays' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-bold">Player 1 (Winner 🏆):</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{Math.round(snacksCharge / 2)} <span className="text-[10px] text-slate-500">(Drinks only)</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-bold">Player 2 (Loser 💀):</span>
                    <span className="font-mono text-red-400 font-bold">
                      ₹{gameCharge + Math.round(snacksCharge / 2)} <span className="text-[10px] text-slate-500">(Game + Drinks)</span>
                    </span>
                  </div>
                </div>
              )}

              {splitMode === '50_50' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Each Player (2 Players):</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{Math.round(totalBill / 2)}</span>
                  </div>
                </div>
              )}

              {splitMode === 'equal' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Each Player (4 Players):</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{Math.round(totalBill / 4)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => onBookNow(selectedGameId)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book {gameInfo.name.split('(')[0]} Now at This Rate</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
