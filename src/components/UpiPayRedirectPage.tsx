import React, { useEffect, useState } from 'react';
import { Smartphone, Zap, ShieldCheck, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { decodeAndVerifyPayToken } from '../utils/payToken';

export const UpiPayRedirectPage: React.FC = () => {
  const [params, setParams] = useState({
    upi: '',
    name: '',
    amt: '0',
    note: 'Ledger Settlement'
  });
  const [isTampered, setIsTampered] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let upi = '';
    let amt = '0';
    let name = 'JustClub Merchant';
    let note = 'Ledger Settlement';
    let tamperedDetected = false;

    // 1. Check for Short URL format: /p/SLUG/AMOUNT or /p/UPI_ID/AMOUNT or /p/TOKEN
    if ((pathParts[0] === 'p' || pathParts[0] === 'pay') && pathParts.length >= 2) {
      if (pathParts.length === 2 && !pathParts[1].includes('@') && pathParts[1].length > 20) {
        // Token format /p/TOKEN
        const token = pathParts[1];
        const decoded = decodeAndVerifyPayToken(token);
        if (decoded) {
          upi = decoded.upi;
          amt = String(decoded.amt);
          name = decoded.name || 'JustClub Merchant';
        } else {
          tamperedDetected = true;
        }
      } else {
        // Clean URL format: /p/SLUG/AMOUNT or /p/UPI_ID/AMOUNT
        const slugOrUpi = decodeURIComponent(pathParts[1]);
        if (pathParts.length >= 3) {
          amt = decodeURIComponent(pathParts[2]);
        }

        if (slugOrUpi.includes('@')) {
          upi = slugOrUpi;
        } else {
          // Try resolving tenant/club slug from localStorage
          let foundUpi = '';
          let foundName = '';
          try {
            const savedProfile = localStorage.getItem('club_pos_profile');
            if (savedProfile) {
              const prof = JSON.parse(savedProfile);
              const customSlug = (prof.paymentSlug || '').toLowerCase();
              const autoSlug = (prof.businessName || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '');
              if (customSlug === slugOrUpi.toLowerCase() || autoSlug === slugOrUpi.toLowerCase() || prof.id === slugOrUpi) {
                foundUpi = prof.upiId;
                foundName = prof.businessName;
              }
            }
          } catch (e) {
            console.error('Error reading club profile for slug lookup:', e);
          }

          if (foundUpi) {
            upi = foundUpi;
            name = foundName || name;
          } else {
            upi = slugOrUpi;
          }
        }
      }
    }

    // Query parameters overrides or fallback
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token') || urlParams.get('t');
    if (queryToken) {
      const decoded = decodeAndVerifyPayToken(queryToken);
      if (decoded) {
        upi = decoded.upi;
        amt = String(decoded.amt);
        name = decoded.name || name;
      } else {
        tamperedDetected = true;
      }
    }

    upi = urlParams.get('pa') || urlParams.get('upi') || upi;
    amt = urlParams.get('am') || urlParams.get('amt') || amt || '0';
    name = urlParams.get('pn') || urlParams.get('name') || name;
    note = urlParams.get('tn') || urlParams.get('note') || note;

    setIsTampered(tamperedDetected);
    setParams({ upi, name, amt, note });

    if (upi && !tamperedDetected) {
      const defaultUpiUri = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amt)}&cu=INR&tn=${encodeURIComponent(note)}`;
      const timer = setTimeout(() => {
        window.location.href = defaultUpiUri;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isTampered) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-red-950/40 border border-red-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>
          <h1 className="text-xl font-bold text-red-200">Payment Link Error</h1>
          <p className="text-xs text-red-300/80 leading-relaxed">
            This payment link has been altered or tampered with and cannot be processed. Please request a fresh payment link from the sender.
          </p>
          <div className="p-3 bg-red-950/80 border border-red-900 rounded-xl text-[11px] font-mono text-red-400">
            Security Reason: Cryptographic Signature Mismatch
          </div>
        </div>
      </div>
    );
  }

  const { upi, name, amt, note } = params;

  const encodedUpi = encodeURIComponent(upi);
  const encodedName = encodeURIComponent(name);
  const encodedAmt = encodeURIComponent(amt);
  const encodedNote = encodeURIComponent(note);

  const baseUpiParams = `pa=${encodedUpi}&pn=${encodedName}&am=${encodedAmt}&cu=INR&tn=${encodedNote}`;

  // Direct app deep-links
  const defaultUpiUri = `upi://pay?${baseUpiParams}`;
  const gpayUri = `tez://upi/pay?${baseUpiParams}`;
  const phonepeUri = `phonepe://pay?${baseUpiParams}`;
  const paytmUri = `paytmmp://pay?${baseUpiParams}`;
  const bhimUri = `bhim://pay?${baseUpiParams}`;
  const credUri = `cred://pay?${baseUpiParams}`;
  const amazonPayUri = `upi://pay?${baseUpiParams}`;

  const formattedAmount = Number(amt || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">{name}</h1>
          <p className="text-xs text-slate-400 font-medium">Verified Merchant UPI Gateway</p>
        </div>

        {/* Amount Card */}
        <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-5 text-center mb-5 shadow-inner">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Outstanding Amount
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            ₹{formattedAmount}
          </div>
          <div className="mt-2 text-xs text-slate-400 bg-slate-900/80 py-1.5 px-3 rounded-lg border border-slate-800/80 inline-block font-mono">
            {note}
          </div>
        </div>

        {/* Payee Info */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300 mb-5">
          <span className="text-slate-400">Payee UPI ID:</span>
          <span className="font-mono font-bold text-indigo-300">{upi || 'N/A'}</span>
        </div>

        {upi ? (
          <>
            {/* Primary Default Auto Launcher Button */}
            <a
              href={defaultUpiUri}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25 text-sm mb-5 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>Auto-Launch Default UPI App</span>
            </a>

            {/* 6 Direct UPI Payment App Selectors */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Select Your Payment App:
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Google Pay */}
                <a
                  href={gpayUri}
                  className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
                    G
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Google Pay</div>
                    <div className="text-[9px] text-slate-400">Tez / GPay</div>
                  </div>
                </a>

                {/* 2. PhonePe */}
                <a
                  href={phonepeUri}
                  className="bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                    पे
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-purple-200 group-hover:text-purple-100 transition">PhonePe</div>
                    <div className="text-[9px] text-purple-400/80">Direct Launch</div>
                  </div>
                </a>

                {/* 3. Paytm */}
                <a
                  href={paytmUri}
                  className="bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                    Paytm
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-sky-200 group-hover:text-sky-100 transition">Paytm</div>
                    <div className="text-[9px] text-sky-400/80">UPI Wallet</div>
                  </div>
                </a>

                {/* 4. BHIM UPI */}
                <a
                  href={bhimUri}
                  className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                    BHIM
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-200 group-hover:text-emerald-100 transition">BHIM UPI</div>
                    <div className="text-[9px] text-emerald-400/80">NPCI Official</div>
                  </div>
                </a>

                {/* 5. CRED Pay */}
                <a
                  href={credUri}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-black border border-stone-700 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                    CRED
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-200 group-hover:text-stone-100 transition">CRED Pay</div>
                    <div className="text-[9px] text-stone-400">Rewards UPI</div>
                  </div>
                </a>

                {/* 6. Amazon Pay / WhatsApp / All Apps */}
                <a
                  href={amazonPayUri}
                  className="bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 rounded-xl p-3 flex items-center gap-2.5 transition active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm">
                    aPay
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100 transition">Amazon Pay</div>
                    <div className="text-[9px] text-amber-400/80">& All UPI Apps</div>
                  </div>
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-medium">
            Invalid or missing UPI VPA parameter.
          </div>
        )}

        {/* Status Indicator */}
        <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Select any app above to launch instant payment</span>
        </p>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800/60 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Powered by <strong className="text-slate-300">JustClub OS</strong> • Verified Merchant Link</span>
        </div>
      </div>
    </div>
  );
};
