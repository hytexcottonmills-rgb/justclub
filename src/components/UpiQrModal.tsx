import React from 'react';
import { QrCode, X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId: string;
  clubName: string;
  customerName?: string;
  onConfirmPaid?: () => void;
  isDarkMode?: boolean;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  upiId,
  clubName,
  customerName = 'Customer',
  onConfirmPaid,
  isDarkMode = true,
}) => {
  const [copied, setCopied] = React.useState(false);
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}&am=${amount}&cu=INR`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden p-6 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Instant UPI QR Payment</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Zero MDR Fee • Direct Club Account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Display */}
          <div className={`my-5 text-center p-4 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-950/60 border-slate-800/80'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Payable Amount ({customerName})
            </span>
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* SVG QR Code representation */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner my-4 text-slate-900">
            {/* Synthetic high-density UPI QR pattern */}
            <div className="relative w-48 h-48 bg-white p-2 rounded flex flex-col items-center justify-center border border-slate-200">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* QR Finder patterns */}
                <rect x="5" y="5" width="25" height="25" fill="#090d16" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#4f46e5" />

                <rect x="70" y="5" width="25" height="25" fill="#090d16" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#4f46e5" />

                <rect x="5" y="70" width="25" height="25" fill="#090d16" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#4f46e5" />

                {/* Random QR data points visual representation */}
                <rect x="35" y="10" width="6" height="6" fill="#090d16" />
                <rect x="45" y="10" width="6" height="6" fill="#090d16" />
                <rect x="55" y="15" width="6" height="6" fill="#4f46e5" />
                <rect x="10" y="35" width="6" height="6" fill="#090d16" />
                <rect x="20" y="45" width="6" height="6" fill="#090d16" />
                <rect x="35" y="35" width="8" height="8" fill="#4f46e5" />
                <rect x="48" y="35" width="8" height="8" fill="#090d16" />
                <rect x="60" y="35" width="6" height="6" fill="#090d16" />
                <rect x="75" y="35" width="6" height="6" fill="#4f46e5" />

                <rect x="35" y="50" width="6" height="6" fill="#090d16" />
                <rect x="50" y="50" width="8" height="8" fill="#4f46e5" />
                <rect x="65" y="50" width="6" height="6" fill="#090d16" />
                <rect x="80" y="55" width="6" height="6" fill="#090d16" />

                <rect x="35" y="70" width="6" height="6" fill="#4f46e5" />
                <rect x="45" y="75" width="6" height="6" fill="#090d16" />
                <rect x="55" y="70" width="8" height="8" fill="#090d16" />
                <rect x="70" y="70" width="6" height="6" fill="#4f46e5" />
                <rect x="80" y="75" width="6" height="6" fill="#090d16" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-2 py-1 rounded shadow border border-slate-200 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  UPI
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Scan with GPay, PhonePe, Paytm, BHIM
            </p>
          </div>

          {/* UPI ID Details */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
              isDarkMode
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className={`block text-[10px] uppercase font-semibold ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Club UPI VPA</span>
                <span className={`font-mono font-semibold ${
                  isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                }`}>{upiId}</span>
              </div>
              <button
                onClick={copyUpiId}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition text-xs border ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <a
              href={upiUri}
              className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-xl border transition ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Native UPI App
            </a>
          </div>

          {/* Action buttons */}
          <div className={`mt-5 pt-4 border-t flex items-center gap-3 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 text-xs font-medium rounded-xl transition ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            {onConfirmPaid && (
              <button
                onClick={() => {
                  onConfirmPaid();
                  onClose();
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm Payment Received
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
