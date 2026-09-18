import React, { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock, Plus, Calculator, X } from 'lucide-react';
import { GameSession } from '../types';

interface SessionReminderAlertModalProps {
  session: GameSession | null;
  onClose: () => void;
  onExtendReminder: (sessionId: string, minutes: number) => void;
  onOpenSplitBilling: (session: GameSession) => void;
  isDarkMode?: boolean;
}

// Play web audio chime when reminder triggers
function playReminderChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2: B5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export const SessionReminderAlertModal: React.FC<SessionReminderAlertModalProps> = ({
  session,
  onClose,
  onExtendReminder,
  onOpenSplitBilling,
  isDarkMode = true,
}) => {
  useEffect(() => {
    if (session) {
      playReminderChime();
    }
  }, [session?.id]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 text-center transition-all ${
          isDarkMode 
            ? 'bg-slate-900 border-indigo-500/40 text-white ring-1 ring-indigo-500/30' 
            : 'bg-white border-indigo-200 text-slate-900 shadow-indigo-500/10'
        }`}
      >
        {/* Animated Ringing Bell Icon */}
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto animate-bounce ${
          isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          <BellRing className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
            Session Reminder Ringing
          </span>
          <h3 className="text-xl font-black mt-2 tracking-tight">
            {session.assetName}
          </h3>
          <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Players: {session.taggedPlayers.map(p => p.name).join(', ') || 'Walk-in Match'}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/70 border-indigo-100'
        }`}>
          <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-indigo-900/80'}`}>Reminder Timer Reached</div>
          <div className={`text-2xl font-black font-mono mt-0.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
            {session.reminderMinutes || 60} Minutes Timer
          </div>
          <div className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Session is still running automatically. Select an action below.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onExtendReminder(session.id, 15);
                onClose();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span>Extend +15m</span>
            </button>

            <button
              onClick={() => {
                onExtendReminder(session.id, 30);
                onClose();
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span>Extend +30m</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSplitBilling(session);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>End Session & Split Billing</span>
          </button>

          <button
            onClick={onClose}
            className={`w-full py-2.5 text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dismiss Alert
          </button>
        </div>

      </div>
    </div>
  );
};
