import React, { useEffect, useState } from 'react';
import { Smartphone, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export const UpiPayRedirectPage: React.FC = () => {
  const [params, setParams] = useState({
    upi: '',
    name: '',
    amt: '0',
    note: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upi = urlParams.get('upi') || '';
    const name = urlParams.get('name') || 'JustClub Merchant';
    const amt = urlParams.get('amt') || '0';
    const note = urlParams.get('note') || 'Ledger Settlement';

    setParams({ upi, name, amt, note });

    if (upi) {
      const deepLink = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amt)}&cu=INR&tn=${encodeURIComponent(note)}`;
      // Trigger automatic deep link redirect on mobile browsers
      const timer = setTimeout(() => {
        window.location.href = deepLink;
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const upiDeepLink = params.upi
    ? `upi://pay?pa=${encodeURIComponent(params.upi)}&pn=${encodeURIComponent(params.name)}&am=${encodeURIComponent(params.amt)}&cu=INR&tn=${encodeURIComponent(params.note)}`
    : '#';

  const formattedAmount = Number(params.amt || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-1">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">{params.name}</h1>
          <p className="text-xs text-slate-400">Secure Self-Hosted UPI Gateway</p>
        </div>

        {/* Amount Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center mb-6 shadow-inner">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Outstanding Ledger Amount
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ₹{formattedAmount}
          </div>
          <div className="mt-2 text-xs text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800/80 inline-block font-mono">
            {params.note}
          </div>
        </div>

        {/* Payee Info */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300 mb-6">
          <span className="text-slate-400">Merchant UPI ID:</span>
          <span className="font-mono font-bold text-indigo-300">{params.upi || 'N/A'}</span>
        </div>

        {/* Direct Action Button */}
        {params.upi ? (
          <a
            href={upiDeepLink}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 text-sm animate-pulse"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Open UPI App to Pay</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </a>
        ) : (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-medium">
            Invalid or missing UPI configuration
          </div>
        )}

        {/* Fallback Text */}
        <p className="text-[11px] text-slate-500 text-center mt-4 leading-relaxed">
          Launching GPay, PhonePe, Paytm or BHIM automatically.<br />
          If your app doesn&apos;t open, tap the button above.
        </p>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Powered by <strong className="text-slate-300">JustClub OS</strong> • Self-Hosted Gateway</span>
        </div>
      </div>
    </div>
  );
};
