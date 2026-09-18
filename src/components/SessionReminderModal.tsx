import React, { useState } from 'react';
import { Bell, X, Clock, Check } from 'lucide-react';
import { GameSession } from '../types';

interface SessionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GameSession | null;
  onSetReminder: (sessionId: string, minutes: number | null) => void;
  isDarkMode?: boolean;
}

export const SessionReminderModal: React.FC<SessionReminderModalProps> = ({
  isOpen,
  onClose,
  session,
  onSetReminder,
  isDarkMode = true,
}) => {
  if (!isOpen || !session) return null;

  const currentReminder = session.reminderMinutes || 60;
  const [minutesInput, setMinutesInput] = useState<number>(currentReminder);

  const quickPills = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
  ];

  const handleSelectPill = (mins: number) => {
    setMinutesInput(mins);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutesInput && minutesInput > 0) {
      onSetReminder(session.id, minutesInput);
    } else {
      onSetReminder(session.id, null);
    }
    onClose();
  };

  const handleClearReminder = () => {
    onSetReminder(session.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-6 transition-all ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl border ${
              isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Session reminder</h3>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {session.assetName} • {session.taggedPlayers.map(p => p.name).join(', ') || 'Walk-in Match'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Banner */}
        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          The session keeps running when this reminder rings. It never stops or changes billing automatically. Keep the counter open for the in-app alert. Closed-app web push needs enabled club notifications and an internet connection.
        </p>

        {/* Remind me after section */}
        <form onSubmit={handleSaveReminder} className="space-y-4 pt-1">
          <label className={`block text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Remind me after
          </label>

          {/* Quick Pill Selectors */}
          <div className="grid grid-cols-4 gap-2.5">
            {quickPills.map((pill) => {
              const isSelected = minutesInput === pill.minutes;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handleSelectPill(pill.minutes)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                      : isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Custom Duration Input Field */}
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              max="1440"
              value={minutesInput || ''}
              onChange={(e) => setMinutesInput(Math.max(1, parseInt(e.target.value) || 0))}
              className={`w-full py-3.5 pl-4 pr-20 rounded-2xl border text-sm font-mono font-bold focus:outline-none focus:border-amber-500 transition ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
              placeholder="Custom duration"
              required
            />
            <span className={`absolute right-4 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              minutes
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3">
            {session.reminderMinutes && (
              <button
                type="button"
                onClick={handleClearReminder}
                className={`px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                Clear reminder
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 fill-current" />
              <span>Set reminder</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
