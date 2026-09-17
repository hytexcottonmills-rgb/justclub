import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, Zap, Activity, Info, ToggleLeft, ToggleRight, Sparkles, ChevronDown, Check } from 'lucide-react';

interface LiveClockWidgetProps {
  isDarkMode?: boolean;
  activeSessionsCount?: number;
  compact?: boolean;
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({
  isDarkMode = true,
  activeSessionsCount = 0,
  compact = false,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [use24Hour, setUse24Hour] = useState<boolean>(() => {
    return localStorage.getItem('justclub_clock_24h') === 'true';
  });
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sessionStartTime] = useState<number>(() => Date.now());

  // 1-second interval live ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save 24h preference
  useEffect(() => {
    localStorage.setItem('justclub_clock_24h', String(use24Hour));
  }, [use24Hour]);

  // Click outside to close HUD
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Format Time
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formattedHours = use24Hour
    ? String(hours).padStart(2, '0')
    : String(hours % 12 || 12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Format Date
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = dayNames[time.getDay()];
  const dateNum = time.getDate();
  const monthName = monthNames[time.getMonth()];
  const year = time.getFullYear();

  // Peak Hours / Slot computation
  const getSlotInfo = (h: number) => {
    if (h >= 6 && h < 12) {
      return {
        label: 'Morning Slot',
        color: isDarkMode
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-amber-800 bg-amber-50 border-amber-200',
        isPeak: false,
      };
    }
    if (h >= 12 && h < 17) {
      return {
        label: 'Afternoon Slot',
        color: isDarkMode
          ? 'text-sky-400 bg-sky-500/10 border-sky-500/20'
          : 'text-sky-800 bg-sky-50 border-sky-200',
        isPeak: false,
      };
    }
    if (h >= 17 && h < 22) {
      return {
        label: 'Evening Peak 🔥',
        color: isDarkMode
          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
          : 'text-rose-700 bg-rose-50 border-rose-200 font-bold',
        isPeak: true,
      };
    }
    return {
      label: 'Late Night Slot 🌙',
      color: isDarkMode
        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
        : 'text-indigo-800 bg-indigo-50 border-indigo-200',
      isPeak: false,
    };
  };

  const slot = getSlotInfo(hours);

  // Calculate session uptime
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
  const uptimeHours = Math.floor(elapsedSeconds / 3600);
  const uptimeMinutes = Math.floor((elapsedSeconds % 3600) / 60);
  const uptimeSecs = elapsedSeconds % 60;

  // Local timezone string
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Header Clock Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Live Operating Clock & Shift HUD (Click for controls)"
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none shadow-xs group ${
          isOpen
            ? isDarkMode
              ? 'bg-slate-800 border-indigo-500/60 ring-2 ring-indigo-500/30 text-white'
              : 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 shadow-sm'
            : isDarkMode
              ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:border-slate-700'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        {/* Pulsing clock icon */}
        <div className={`relative flex items-center justify-center transition-colors ${
          isDarkMode ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-700'
        }`}>
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Digital Time Readout */}
        <div className="flex items-center font-mono font-bold text-xs sm:text-sm tracking-tight leading-none">
          <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{formattedHours}</span>
          <span className={`mx-0.5 animate-pulse ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>:</span>
          <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{formattedMinutes}</span>
          {showSeconds && (
            <>
              <span className={`mx-0.5 text-[10px] hidden xs:inline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>:</span>
              <span className={`text-[10px] sm:text-xs font-normal hidden xs:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {formattedSeconds}
              </span>
            </>
          )}
          {!use24Hour && (
            <span className={`ml-1 text-[10px] sm:text-xs font-sans font-extrabold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {ampm}
            </span>
          )}
        </div>

        {/* Mini Date Badge on Tablet/Desktop */}
        {!compact && (
          <div className={`hidden md:flex items-center gap-1.5 pl-2 border-l text-[11px] font-sans ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}>
            <Calendar className={`w-3 h-3 shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className="whitespace-nowrap font-medium">
              {dayName}, {dateNum} {monthName}
            </span>
          </div>
        )}

        <ChevronDown className={`w-3 h-3 transition-transform ${
          isOpen
            ? isDarkMode ? 'rotate-180 text-indigo-400' : 'rotate-180 text-indigo-600'
            : isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`} />
      </button>

      {/* Interactive Time HUD & Controls Popover */}
      {isOpen && (
        <div className={`absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-88 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl shadow-slate-900/10'
        }`}>
          {/* HUD Header */}
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDarkMode
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-200'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Arena Operating Clock
                </h3>
                <span className={`text-[10px] font-mono flex items-center gap-1 font-medium ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Synced with System Time
                </span>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${slot.color}`}>
              {slot.label}
            </span>
          </div>

          {/* Large Digital Display */}
          <div className={`my-3.5 p-3.5 rounded-xl border text-center relative overflow-hidden ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}>
            <div className={`font-mono font-black text-2xl sm:text-3xl tracking-wider ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-900'
            }`}>
              <span>{formattedHours}</span>
              <span className={isDarkMode ? 'text-indigo-400/80' : 'text-indigo-600'}>:</span>
              <span>{formattedMinutes}</span>
              <span className={isDarkMode ? 'text-indigo-400/80' : 'text-indigo-600'}>:</span>
              <span>{formattedSeconds}</span>
              {!use24Hour && (
                <span className={`text-base font-sans font-extrabold ml-1.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-indigo-600'
                }`}>
                  {ampm}
                </span>
              )}
            </div>
            <div className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {dayName}, {dateNum} {monthName} {year} • <span className={`font-mono text-[11px] font-semibold ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>{timeZoneName}</span>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-indigo-50/60 border-indigo-100'
            }`}>
              <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Activity className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} /> Active Tables
              </div>
              <div className={`font-mono font-extrabold text-sm ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-900'
              }`}>
                {activeSessionsCount} Table{activeSessionsCount !== 1 ? 's' : ''} Running
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-amber-50/60 border-amber-100'
            }`}>
              <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Zap className={`w-3 h-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} /> Shift Uptime
              </div>
              <div className={`font-mono font-extrabold text-sm ${
                isDarkMode ? 'text-amber-400' : 'text-amber-900'
              }`}>
                {uptimeHours}h {uptimeMinutes}m {uptimeSecs}s
              </div>
            </div>
          </div>

          {/* Clock Display Settings */}
          <div className={`pt-3 border-t space-y-2 text-xs ${
            isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">Time Display Format</span>
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-bold ${
                isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setUse24Hour(false)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    !use24Hour
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12-Hour
                </button>
                <button
                  type="button"
                  onClick={() => setUse24Hour(true)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    use24Hour
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  24-Hour
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">Show Live Seconds</span>
              <button
                type="button"
                onClick={() => setShowSeconds(!showSeconds)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                  showSeconds
                    ? isDarkMode
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {showSeconds ? 'Enabled' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className={`mt-3 p-2 rounded-lg text-[10px] flex items-center gap-1.5 ${
            isDarkMode
              ? 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}>
            <Info className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span>Table session fees & duration calculations reference this device clock in real-time.</span>
          </div>
        </div>
      )}
    </div>
  );
};
