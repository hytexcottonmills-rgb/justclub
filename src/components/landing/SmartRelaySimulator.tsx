import React, { useState } from 'react';
import { Zap, Power, Lightbulb, ShieldCheck, Check, Clock, Play, Pause, RotateCcw } from 'lucide-react';

export const SmartRelaySimulator: React.FC = () => {
  const [isLampOn, setIsLampOn] = useState(true);
  const [activeTable, setActiveTable] = useState<'snooker' | 'pool' | 'ps5'>('snooker');
  const [relayStatus, setRelayStatus] = useState<'ACTIVE' | 'CUTOFF'>('ACTIVE');
  const [autoLightRule, setAutoLightRule] = useState(true);

  const toggleRelay = () => {
    const nextState = !isLampOn;
    setIsLampOn(nextState);
    setRelayStatus(nextState ? 'ACTIVE' : 'CUTOFF');
  };

  return (
    <section id="smart-relays" className="py-20 bg-slate-950 border-b border-slate-800 relative overflow-hidden">
      {/* Background Neon Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" /> Club-Time Automated Hardware Relay
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Smart Table Relay & Lighting Control
          </h2>
          <p className="text-sm text-slate-300">
            Inspired by world-class billiard arenas: Automatically turn table canopy lights & console power sockets <strong>ON</strong> when a session starts, and cut power <strong>OFF</strong> the second the bill is settled.
          </p>
        </div>

        {/* Interactive Simulator Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Visual Simulation */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Table Hardware Relay #04
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
                  isLampOn
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {isLampOn ? '● RELAY CLOSED (POWER ON)' : '○ RELAY OPEN (POWER CUT)'}
                </span>
              </div>

              {/* Station Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTable('snooker')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTable === 'snooker' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Snooker 12ft
                </button>
                <button
                  onClick={() => setActiveTable('pool')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTable === 'pool' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pool 9ft
                </button>
                <button
                  onClick={() => setActiveTable('ps5')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTable === 'ps5' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PS5 TV Power
                </button>
              </div>
            </div>

            {/* Visual Table & Light Rig Canvas */}
            <div className={`relative h-64 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center p-6 overflow-hidden ${
              isLampOn
                ? 'bg-gradient-to-b from-amber-500/25 via-emerald-950/60 to-slate-950 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950 border-slate-800 opacity-60'
            }`}>
              {/* Overhead Canopy Light Fixture */}
              <div className="absolute top-4 flex flex-col items-center">
                <div className="w-48 h-3.5 bg-slate-800 rounded-full border border-slate-700 shadow-md relative">
                  {isLampOn && (
                    <div className="absolute inset-0 bg-amber-400/80 rounded-full blur-[2px] animate-pulse" />
                  )}
                </div>
                {/* Light Beam Projection */}
                {isLampOn && (
                  <div className="w-72 h-44 bg-gradient-to-b from-amber-300/30 to-transparent clip-path-polygon blur-sm pointer-events-none" />
                )}
              </div>

              {/* Table / Asset Representation */}
              <div className="relative z-10 text-center mt-8">
                {activeTable === 'snooker' && (
                  <div className="space-y-2">
                    <div className="inline-block p-4 rounded-2xl bg-emerald-900/90 border-4 border-amber-800 shadow-2xl">
                      <div className="text-3xl">🎱 🔴 🟡 🟢 🟤 🔵 🩷 🖤</div>
                    </div>
                    <div className="font-extrabold text-sm text-white">Championship Snooker Table (English Cloth)</div>
                    <div className="text-xs text-slate-300">
                      {isLampOn ? '✨ Canopy Light Active • Professional Tournament Lux' : '🌑 Table Dark • Ready for Next Booking'}
                    </div>
                  </div>
                )}

                {activeTable === 'pool' && (
                  <div className="space-y-2">
                    <div className="inline-block p-4 rounded-2xl bg-blue-900/90 border-4 border-slate-700 shadow-2xl">
                      <div className="text-3xl">🎱 🟡 🔵 🔴 🟣 🟠 🟢 🟤</div>
                    </div>
                    <div className="font-extrabold text-sm text-white">American 9ft Pool Table (Simonis Cloth)</div>
                    <div className="text-xs text-slate-300">
                      {isLampOn ? '✨ 200W LED Fixture ON' : '🌑 Table Light Standby'}
                    </div>
                  </div>
                )}

                {activeTable === 'ps5' && (
                  <div className="space-y-2">
                    <div className="inline-block p-4 rounded-2xl bg-indigo-950 border-4 border-indigo-700 shadow-2xl">
                      <div className="text-3xl">🎮 📺 ⚡</div>
                    </div>
                    <div className="font-extrabold text-sm text-white">PS5 Pro 4K 120Hz TV Smart Socket</div>
                    <div className="text-xs text-slate-300">
                      {isLampOn ? '⚡ HDMI & OLED TV Powered ON' : '🚫 TV Screen Auto-Shutoff on Settle'}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Wattage / Voltage Meter */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <span>V: 230V AC</span>
                <span>•</span>
                <span>P: {isLampOn ? '145W' : '0W'}</span>
                <span>•</span>
                <span className={isLampOn ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isLampOn ? 'RELAY CLOSED' : 'RELAY OPEN'}
                </span>
              </div>
            </div>

            {/* Manual Toggle Test Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Test Smart Light Trigger in Real-Time:</span>
              <button
                onClick={toggleRelay}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg ${
                  isLampOn
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isLampOn ? 'Simulate Session Stop (Cut Light)' : 'Simulate Session Start (Light ON)'}</span>
              </button>
            </div>
          </div>

          {/* Right: Why This Eliminates Revenue Leakage */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-black text-lg text-white">How Club-Time Relay Protects Your Club:</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero Unauthorized Free Play</span>
                </div>
                <p className="text-slate-400">
                  Staff cannot forget to start timers or let friends play secretly. If the table is dark, nobody can play!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Exact Pro-Rata Automatic Billing</span>
                </div>
                <p className="text-slate-400">
                  The exact second the light fires up, the POS ledger logs the start timestamp. When the bill is paid, the relay opens instantly.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Compatible with Sonoff, Tuya & ESP32</span>
                </div>
                <p className="text-slate-400">
                  Easily link standard Wi-Fi smart switches or 8-channel relay boards for under ₹2,000 per 8 tables.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Enable Hardware Relay Module</span>
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-mono font-bold text-[10px]">
                INCLUDED IN TRIAL
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
