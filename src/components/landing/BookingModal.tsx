import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Gamepad2, Send, CheckCircle2, Sparkles } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGame?: string;
  clubWhatsApp?: string;
}

export const GAME_OPTIONS = [
  { id: 'billiards', name: 'Billiards (Pool 9ft)', icon: '🎱', rate: '₹200/hr' },
  { id: 'snooker', name: 'Snooker (Championship 12ft)', icon: '🎱', rate: '₹350/hr' },
  { id: 'ps5', name: 'PlayStation 5 Pro & Xbox', icon: '🎮', rate: '₹240/hr' },
  { id: 'pc', name: 'PC Gaming (RTX 4080)', icon: '🖥', rate: '₹120/hr' },
  { id: 'vr', name: 'VR Pods (360° Motion)', icon: '🥽', rate: '₹450/hr' },
  { id: 'tabletennis', name: 'Table Tennis (Olympic)', icon: '🏓', rate: '₹180/hr' },
  { id: 'foosball', name: 'Foosball (Tornado Pro)', icon: '⚽', rate: '₹120/hr' },
  { id: 'airhockey', name: 'Air Hockey (Arcade)', icon: '🏒', rate: '₹160/hr' },
  { id: 'darts', name: 'Darts Alley (Electronic)', icon: '🎯', rate: '₹200/hr' },
  { id: 'karaoke', name: 'VIP Karaoke Private Suite', icon: '🎤', rate: '₹1,200/hr' },
  { id: 'boardgames', name: 'Board Games Lounge', icon: '🎲', rate: '₹150/hr' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultGame = 'snooker',
  clubWhatsApp = '919876543210'
}) => {
  const [selectedGame, setSelectedGame] = useState(defaultGame);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState('2');
  const [playerCount, setPlayerCount] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const gameInfo = GAME_OPTIONS.find(g => g.id === selectedGame) || GAME_OPTIONS[0];

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const message = `*CLUB TIME - TABLE/STATION RESERVATION REQUEST*%0A` +
      `━━━━━━━━━━━━━━━━━━━━━━%0A` +
      `🎯 *Game / Zone:* ${gameInfo.icon} ${gameInfo.name}%0A` +
      `👤 *Guest Name:* ${customerName}%0A` +
      `📱 *WhatsApp:* ${customerPhone || 'Not provided'}%0A` +
      `📅 *Date:* ${bookingDate}%0A` +
      `⏰ *Time Slot:* ${bookingTime} (${durationHours} Hours)%0A` +
      `👥 *Number of Players:* ${playerCount}%0A` +
      (specialRequests ? `📝 *Notes:* ${specialRequests}%0A` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━%0A` +
      `Please confirm table availability! Sent from Club Time Portal.`;

    const cleanNumber = clubWhatsApp.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    
    window.open(waUrl, '_blank');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-xs relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> Live Club Reservation
            </div>
            <h3 className="font-black text-lg sm:text-xl text-white tracking-tight mt-0.5">
              Book Table or Gaming Station
            </h3>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-base text-white">WhatsApp Booking Opened!</h4>
            <p className="text-slate-300 text-xs">
              Your reservation details have been formatted for our reception desk. We will confirm your station in seconds!
            </p>
          </div>
        ) : (
          <form onSubmit={handleWhatsAppBooking} className="space-y-4">
            
            {/* Game Zone Picker */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 block">
                1. Select Game Zone ({GAME_OPTIONS.length} Available)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GAME_OPTIONS.map(game => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      selectedGame === game.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{game.icon}</span>
                    <div className="truncate">
                      <div className="text-[11px] truncate">{game.name.split('(')[0]}</div>
                      <div className="text-[9px] font-mono text-emerald-400">{game.rate}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Duration and Players */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
                  Duration (Hours)
                </label>
                <select
                  value={durationHours}
                  onChange={e => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">1 Hour</option>
                  <option value="1.5">1.5 Hours</option>
                  <option value="2">2 Hours (Popular)</option>
                  <option value="3">3 Hours</option>
                  <option value="4">4 Hours (Marathon)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Players / Guests
                </label>
                <select
                  value={playerCount}
                  onChange={e => setPlayerCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">1 Player</option>
                  <option value="2">2 Players (1v1)</option>
                  <option value="4">4 Players (2v2)</option>
                  <option value="6">6+ Guests (Party)</option>
                  <option value="10">10+ Guests (Private Suite)</option>
                </select>
              </div>
            </div>

            {/* Guest Name & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
                Special Requests / F&B Orders
              </label>
              <input
                type="text"
                placeholder="e.g. Reserve Corner Snooker Table, Red Bull on arrival"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Send Reservation via WhatsApp</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              ⚡ Instant confirmation • Table held for 15 minutes past start time
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
