import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Receipt, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  CreditCard, 
  Banknote, 
  User, 
  Building2,
  ShieldCheck,
  ArrowDownRight
} from 'lucide-react';
import { CustomerPlayer, ClubProfile, LedgerEntry } from '../types';

interface PaymentReceiptModalProps {
  entry: LedgerEntry & { runningBalance?: number; isDebit?: boolean };
  customer: CustomerPlayer;
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  onClose: () => void;
}

// Helper to convert numbers to Indian currency words
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  const integerPart = Math.floor(Math.abs(num));
  let str = '';
  
  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundred = integerPart % 1000;

  if (crore > 0) str += inWords(crore) + 'Crore ';
  if (lakh > 0) str += inWords(lakh) + 'Lakh ';
  if (thousand > 0) str += inWords(thousand) + 'Thousand ';
  if (hundred > 0) str += inWords(hundred);

  return (str.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  entry,
  customer,
  clubProfile,
  isDarkMode,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const amount = Math.abs(Number(entry.amount) || 0);
  const voucherNo = entry.voucherNo || `PAYMENT-${String(entry.id).slice(-4)}`;
  const method = (entry.settledMethod || entry.paymentMethod || 'UPI').toUpperCase();
  const refCode = entry.settlementRef || (entry.notes?.match(/\(([^)]+)\)/)?.[1]) || null;
  const inWords = numberToWords(amount);

  const dateObj = new Date(entry.timestamp);
  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const closingBalance = entry.runningBalance ?? customer.ledgerBalance;
  const prevBalance = (closingBalance !== undefined) ? (closingBalance + amount) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawPhone = (customer.phone || '').replace(/\D/g, '');
    const phoneWithCountry = rawPhone ? (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone) : '';

    let text = `*💳 PAYMENT RECEIPT - ${clubProfile.name.toUpperCase()}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Receipt No:* ${voucherNo}\n`;
    text += `*Date:* ${dateFormatted} at ${timeFormatted}\n`;
    text += `*Received From:* ${customer.name}\n\n`;
    text += `*Amount Received:* ₹${amount.toLocaleString('en-IN')}\n`;
    text += `*Payment Mode:* ${method}${refCode ? ` (${refCode})` : ''}\n`;
    text += `*Amount in Words:* ${inWords}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (closingBalance !== undefined) {
      const balType = closingBalance >= 0 ? 'DR (Due)' : 'CR (Advance)';
      text += `*Updated Ledger Balance:* ₹${Math.abs(closingBalance).toLocaleString('en-IN')} ${balType}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    }
    text += `Thank you for your payment!\n`;
    if (clubProfile.phone) text += `Contact: ${clubProfile.phone}\n`;

    const encoded = encodeURIComponent(text);
    const url = phoneWithCountry
      ? `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all print:border-none print:shadow-none print:max-w-none print:w-full ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Top Controls (Hidden on Print) */}
        <div className={`px-5 py-4 border-b flex items-center justify-between print:hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Payment Receipt</h3>
              <p className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {voucherNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Share Receipt on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 print:p-4 print:text-black">
          {/* 1. CLUB BRANDING HEADER */}
          <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-300 dark:border-slate-800 print:border-slate-400">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 print:border-black print:text-black">
              <ShieldCheck className="w-3 h-3" />
              Official Payment Receipt
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
              {clubProfile.name}
            </h2>
            {clubProfile.address && (
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 max-w-sm mx-auto">
                {clubProfile.address}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 print:text-slate-700 pt-0.5">
              {clubProfile.phone && <span>Ph: {clubProfile.phone}</span>}
              {clubProfile.gstin && <span>GSTIN: {clubProfile.gstin}</span>}
            </div>
          </div>

          {/* 2. RECEIPT METADATA ROW */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            } print:border-slate-300 print:bg-transparent`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Receipt Voucher No
              </span>
              <span className="font-mono font-bold text-sm text-indigo-500 dark:text-indigo-400 print:text-black">
                {voucherNo}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            } print:border-slate-300 print:bg-transparent`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Date & Time
              </span>
              <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 print:text-black block">
                {dateFormatted}
              </span>
              <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                {timeFormatted}
              </span>
            </div>
          </div>

          {/* 3. CUSTOMER DETAILS */}
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          } print:border-slate-300 print:bg-transparent`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                  Received With Thanks From
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white print:text-black">
                  {customer.name}
                </h4>
                {customer.phone && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 print:text-slate-700">
                    {customer.phone}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 print:hidden">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 4. AMOUNT RECEIVED HERO CARD */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 text-center space-y-2 print:border-emerald-700 print:bg-none">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 print:text-emerald-800 block">
              Amount Received
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-medium italic text-emerald-700/80 dark:text-emerald-300/80 print:text-black">
              "{inWords}"
            </p>
          </div>

          {/* 5. PAYMENT MODE & PARTICULARS */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
                Payment Channel
              </span>
              <div className="flex items-center gap-1.5 font-bold">
                {method === 'UPI' ? (
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Banknote className="w-4 h-4 text-emerald-500" />
                )}
                <span>{method === 'UPI' ? 'UPI Transfer / QR' : 'Cash'}</span>
              </div>
            </div>

            {refCode && (
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
                  Txn Reference / UTR
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  {refCode}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between py-2 border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium shrink-0">
                Purpose / Notes
              </span>
              <span className="text-right text-slate-700 dark:text-slate-300 print:text-black ml-4 font-medium">
                {entry.description || 'Customer ledger debt payment settlement'}
              </span>
            </div>
          </div>

          {/* 6. LEDGER IMPACT BREAKDOWN */}
          {closingBalance !== undefined && prevBalance !== null && (
            <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            } print:border-slate-300 print:bg-transparent`}>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Khata Balance Summary
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
                <span>Previous Balance Due</span>
                <span className="font-mono">
                  ₹{Math.abs(prevBalance).toLocaleString('en-IN')} {prevBalance >= 0 ? 'DR' : 'CR'}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Payment Credited</span>
                <span className="font-mono">- ₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 flex items-center justify-between font-bold text-slate-900 dark:text-white print:text-black">
                <span>Current Outstanding Due</span>
                <span className="font-mono text-sm text-indigo-500 dark:text-indigo-400 print:text-black">
                  ₹{Math.abs(closingBalance).toLocaleString('en-IN')} {closingBalance >= 0 ? 'DR' : 'CR'}
                </span>
              </div>
            </div>
          )}

          {/* 7. SIGNATORY FOOTER */}
          <div className="pt-4 flex items-end justify-between text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-700">
            <div>
              <p className="font-medium">Computer generated receipt.</p>
              <p className="text-[10px] font-mono">JustClub Operations OS</p>
            </div>
            <div className="text-right space-y-6">
              <div className="h-6"></div>
              <div className="border-t border-slate-400 dark:border-slate-700 print:border-black pt-1 px-2 font-bold text-slate-700 dark:text-slate-300 print:text-black">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions (Hidden on Print) */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 print:hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
