import React, { useState } from 'react';
import { Crown, Sparkles, Gift, Flame, Shield, Check, ArrowRight } from 'lucide-react';

export const VipLoyaltySection: React.FC<{ onGetMembership: () => void }> = ({ onGetMembership }) => {
  const [monthlyHours, setMonthlyHours] = useState(15);

  // Compute tier based on monthly hours
  const tier = monthlyHours < 10
    ? { name: 'Bronze Rookie', badge: 'LEVEL 1', cashback: 5, color: 'text-amber-600', border: 'border-amber-700/40', perk: 'Standard game rates + 5% cashback credit' }
    : monthlyHours < 25
    ? { name: 'Silver Striker', badge: 'LEVEL 2', cashback: 10, color: 'text-slate-300', border: 'border-slate-500/40', perk: '10% cashback + 15 mins free warmup on Snooker & PS5' }
    : monthlyHours < 45
    ? { name: 'Gold Cue Master', badge: 'LEVEL 3', cashback: 15, color: 'text-amber-400', border: 'border-amber-500/40', perk: '15% cashback + 1 Free Red Bull / Frappe per visit + Weekend Tournament Entry' }
    : { name: 'Cyber Platinum VIP', badge: 'LEVEL 4 VIP', cashback: 20, color: 'text-cyan-400', border: 'border-cyan-500/40', perk: '20% lifetime cashback + Guaranteed Table Hold + Private Suite Access' };

  const estMonthlySpend = monthlyHours * 250;
  const estCashbackEarned = Math.round((estMonthlySpend * tier.cashback) / 100);
  const estAnnualSavings = estCashbackEarned * 12;

  return (
    <section id="vip-club" className="py-20 bg-slate-900 border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold uppercase border border-cyan-500/30">
            <Crown className="w-3.5 h-3.5" /> Gamified VIP Membership & XP Rewards
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Play More. Earn More Cashback.
          </h2>
          <p className="text-sm text-slate-300">
            Every minute played logs directly to your customer profile. Unlock higher tier discounts, complimentary drinks, and free tournament passes!
          </p>
        </div>

        {/* Interactive XP & Cashback Calculator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Slider */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-white">How Many Hours Do You Play a Month?</span>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono font-black text-sm rounded-xl border border-cyan-500/30">
                  {monthlyHours} Hours / Month
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                step="2"
                value={monthlyHours}
                onChange={e => setMonthlyHours(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2.5 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Casual (4 hrs)</span>
                <span>Regular (15 hrs)</span>
                <span>Enthusiast (30 hrs)</span>
                <span>Pro Gamer (60+ hrs)</span>
              </div>
            </div>

            {/* Calculated Tier Card */}
            <div className={`p-5 rounded-2xl bg-slate-900 border ${tier.border} space-y-3 transition-all`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <Crown className={`w-5 h-5 ${tier.color}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Your Unlocked Tier</div>
                    <div className={`font-black text-base ${tier.color}`}>{tier.name}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-slate-950 text-emerald-400 font-mono text-xs font-black rounded-lg border border-slate-800">
                  {tier.cashback}% CASHBACK
                </span>
              </div>

              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span className="font-bold text-white">Tier Perk:</span> {tier.perk}
              </div>
            </div>
          </div>

          {/* Right: Savings Summary */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                Estimated Member Rewards
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                AUTO-CREDITED TO LEDGER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Monthly Cashback</div>
                <div className="font-mono font-black text-2xl text-emerald-400 mt-1">₹{estCashbackEarned}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Usable on any game or snack</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Annual Member Value</div>
                <div className="font-mono font-black text-2xl text-cyan-400 mt-1">₹{estAnnualSavings}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Direct savings + freebies</div>
              </div>
            </div>

            <button
              onClick={onGetMembership}
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Your Club VIP Membership Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* 4 Tiers Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Bronze Rookie', xp: '0 - 500 XP', cb: '5% Cashback', perk: 'Customer Ledger Profile', color: 'border-amber-800/40 text-amber-500' },
            { name: 'Silver Striker', xp: '500 - 1,500 XP', cb: '10% Cashback', perk: '15m Free Table Warmup', color: 'border-slate-600/40 text-slate-300' },
            { name: 'Gold Cue Master', xp: '1,500 - 3,500 XP', cb: '15% Cashback', perk: 'Free Beverage + Tourney Entry', color: 'border-amber-500/40 text-amber-400' },
            { name: 'Cyber Platinum', xp: '3,500+ XP', cb: '20% Cashback', perk: 'Table Hold + VIP Suite Access', color: 'border-cyan-500/40 text-cyan-400' },
          ].map(t => (
            <div key={t.name} className={`p-4 rounded-2xl bg-slate-950 border ${t.color.split(' ')[0]} space-y-2 text-xs`}>
              <div className="flex justify-between items-center">
                <span className={`font-black ${t.color.split(' ')[1]}`}>{t.name}</span>
                <span className="font-mono text-[10px] text-slate-500">{t.xp}</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">{t.cb}</div>
              <div className="text-[11px] text-slate-400">{t.perk}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
