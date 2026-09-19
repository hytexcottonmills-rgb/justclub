import React, { useState } from 'react';
import { Trophy, Medal, Crown, Flame, Award, Users, ArrowUpRight, Sparkles } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  game: string;
  score: string;
  winRate: string;
  badge: string;
  xp: number;
}

const TOURNAMENT_DATA: Record<string, { title: string; prize: string; entries: LeaderboardEntry[] }> = {
  snooker: {
    title: 'Championship Snooker Break Ladder',
    prize: '₹15,000 Cash Pool + Gold Cue Trophy',
    entries: [
      { rank: 1, name: 'Arjun V. (The Sniper)', avatar: 'AV', game: '12ft Snooker', score: '147 Maximum Break', winRate: '92%', badge: 'MAXIMUM 147', xp: 4850 },
      { rank: 2, name: 'Rahul Sharma', avatar: 'RS', game: '12ft Snooker', score: '124 Century Break', winRate: '86%', badge: 'CENTURY CLUB', xp: 3920 },
      { rank: 3, name: 'Vikrant Menon', avatar: 'VM', game: '12ft Snooker', score: '108 Century Break', winRate: '81%', badge: 'POT MASTER', xp: 3410 },
      { rank: 4, name: 'Kiran Patel', avatar: 'KP', game: '12ft Snooker', score: '92 Break', winRate: '75%', badge: 'PRO DIVISION', xp: 2890 },
      { rank: 5, name: 'Zaid Khan', avatar: 'ZK', game: '12ft Snooker', score: '88 Break', winRate: '72%', badge: 'CHALLENGER', xp: 2450 },
    ]
  },
  ps5: {
    title: 'EA FC 25 / FIFA Weekend League',
    prize: '₹10,000 + PS5 Pro DualSense Edge Controller',
    entries: [
      { rank: 1, name: 'Rohan Deshmukh', avatar: 'RD', game: 'PS5 FC 25', score: '38 Wins - 2 Losses', winRate: '95%', badge: 'ELITE DIVISION 1', xp: 5120 },
      { rank: 2, name: 'Aditya Roy', avatar: 'AR', game: 'PS5 FC 25', score: '34 Wins - 6 Losses', winRate: '85%', badge: 'CHAMPION', xp: 4200 },
      { rank: 3, name: 'Sameer Sheikh', avatar: 'SS', game: 'PS5 FC 25', score: '31 Wins - 9 Losses', winRate: '78%', badge: 'GOLD I', xp: 3650 },
      { rank: 4, name: 'Farhan M.', avatar: 'FM', game: 'PS5 FC 25', score: '28 Wins - 12 Losses', winRate: '70%', badge: 'GOLD II', xp: 2980 },
    ]
  },
  pc: {
    title: 'Valorant & CS2 5v5 Lan League',
    prize: '₹25,000 Team Bounty + Gaming Headsets',
    entries: [
      { rank: 1, name: 'Team CyberViper', avatar: 'CV', game: 'PC Esports', score: 'Rating 1.48 (MVP)', winRate: '89%', badge: 'RADIANT', xp: 6200 },
      { rank: 2, name: 'Phantom Squad', avatar: 'PS', game: 'PC Esports', score: 'Rating 1.35', winRate: '82%', badge: 'IMMORTAL', xp: 5300 },
      { rank: 3, name: 'Alpha Strikers', avatar: 'AS', game: 'PC Esports', score: 'Rating 1.22', winRate: '76%', badge: 'ASCENDANT', xp: 4400 },
    ]
  },
  darts: {
    title: 'Target Darts 180s Precision League',
    prize: '₹8,000 Cash + Tungsten Darts Set',
    entries: [
      { rank: 1, name: 'Naveen Kumar', avatar: 'NK', game: 'Darts Alley', score: '180 Maximum × 14', winRate: '91%', badge: 'BULLSEYE KING', xp: 3900 },
      { rank: 2, name: 'Devendra S.', avatar: 'DS', game: 'Darts Alley', score: '180 Maximum × 9', winRate: '84%', badge: 'TRIPLE 20', xp: 3150 },
    ]
  }
};

export const TournamentLeaderboard: React.FC<{ onJoinTournament: () => void }> = ({ onJoinTournament }) => {
  const [activeTab, setActiveTab] = useState<'snooker' | 'ps5' | 'pc' | 'darts'>('snooker');
  const tournament = TOURNAMENT_DATA[activeTab];

  return (
    <section id="tournaments" className="py-20 bg-slate-950 border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold uppercase border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" /> Club Arena Tournaments & Hall of Fame
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Live Arena Leaderboards
          </h2>
          <p className="text-sm text-slate-300">
            Compete in weekly tournaments, climb the high-break ladders, unlock club XP, and take home cash prizes & trophies!
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {[
            { id: 'snooker', label: '🎱 Snooker 147 Break', icon: Trophy },
            { id: 'ps5', label: '🎮 PS5 FC 25 League', icon: Crown },
            { id: 'pc', label: '🖥 PC Valorant & CS2', icon: Flame },
            { id: 'darts', label: '🎯 Darts 180s Club', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                Active Weekly Tournament
              </span>
              <h3 className="text-xl font-black text-white">{tournament.title}</h3>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Tournament Prize Pool</span>
              <span className="font-mono font-black text-amber-400 text-sm">{tournament.prize}</span>
            </div>
          </div>

          {/* Leaderboard Entries List */}
          <div className="space-y-3">
            {tournament.entries.map(entry => (
              <div
                key={entry.rank}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  entry.rank === 1
                    ? 'bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : entry.rank === 2
                    ? 'bg-slate-950 border-slate-700'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : entry.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : entry.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{entry.rank}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center border border-slate-700">
                    {entry.avatar}
                  </div>

                  <div>
                    <div className="font-black text-sm text-white flex items-center gap-2">
                      <span>{entry.name}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold uppercase border border-indigo-500/30">
                        {entry.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{entry.game}</div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center gap-6 self-end sm:self-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">High Score / Record</div>
                    <div className="font-mono font-black text-emerald-400 text-sm">{entry.score}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Win Rate</div>
                    <div className="font-mono font-black text-indigo-300 text-sm">{entry.winRate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">XP Points</div>
                    <div className="font-mono font-black text-amber-400 text-sm">{entry.xp.toLocaleString()} XP</div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Register CTA Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">
                Want your name on this leaderboard? Weekend tournaments happen every Saturday & Sunday!
              </span>
            </div>
            <button
              onClick={onJoinTournament}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <span>Register for Weekend Tournament</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
