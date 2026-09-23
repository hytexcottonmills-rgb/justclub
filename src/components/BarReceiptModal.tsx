import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  Coffee,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  User,
  ShoppingBag,
  Sparkles,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { BillRecord, ClubProfile } from '../types';
import { printDocumentElement } from '../utils/pdfExport';

interface BarReceiptModalProps {
  bill: BillRecord | null;
  clubProfile: ClubProfile;
  isDarkMode?: boolean;
  onClose: () => void;
}

// Indian currency number to words
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

export const BarReceiptModal: React.FC<BarReceiptModalProps> = ({
  bill,
  clubProfile,
  isDarkMode = true,
  onClose,
}) => {
  const [receiptType, setReceiptType] = useState<'pos_80mm' | 'standard'>('pos_80mm');

  if (!bill) return null;

  const orderNo = bill.billNo || bill.voucherNo || `BAR-${bill.id.slice(-4)}`;
  const totalAmount = bill.grandTotal || bill.totalBarCost || 0;
  const inWords = numberToWords(totalAmount);

  const dateObj = new Date(bill.timestamp);
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

  const primaryCustomer = bill.players?.[0] || { name: 'Walk-In Guest', whatsapp: '' };
  const share = bill.shares?.[0];
  const paymentMethod = (share?.paymentMethod || 'Cash').toUpperCase();
  const isKhata = paymentMethod === 'LEDGER' || bill.status === 'UNSETTLED';

  // Prepare itemized F&B items
  const items = bill.barItemsSummary && bill.barItemsSummary.length > 0
    ? bill.barItemsSummary
    : [{ name: 'Cafe & Beverage Order', quantity: 1, price: totalAmount }];

  const handlePrint = async () => {
    await printDocumentElement('bar-pos-receipt-print-area');
  };

  const handleShareWhatsApp = () => {
    const rawPhone = (primaryCustomer.whatsapp || '').replace(/\D/g, '');
    const phoneWithCountry = rawPhone ? (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone) : '';

    let text = `*☕ ${clubProfile.businessName || clubProfile.name} - CAFE & BAR RECEIPT*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Order / Bill No:* ${orderNo}\n`;
    text += `*Date:* ${dateFormatted} at ${timeFormatted}\n`;
    text += `*Customer:* ${primaryCustomer.name}\n\n`;
    text += `*ORDER ITEMS:*\n`;
    items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.name} x ${it.quantity} = ₹${it.price * it.quantity}\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Grand Total:* ₹${totalAmount.toLocaleString('en-IN')}\n`;
    text += `*Payment Mode:* ${paymentMethod} (${isKhata ? 'Khata Ledger' : 'Paid'})\n`;
    text += `*Amount in Words:* ${inWords}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Thank you for visiting! Enjoy your refreshments.\n`;
    if (clubProfile.phone) text += `Contact: ${clubProfile.phone}\n`;

    const encoded = encodeURIComponent(text);
    const url = phoneWithCountry
      ? `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all print:border-none print:shadow-none print:max-w-none print:w-full ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Top Controls Header (Hidden on Print) */}
        <div className={`px-5 py-4 border-b flex items-center justify-between print:hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Bar & Cafe Receipt</h3>
              <p className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {orderNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Share Bill on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Print Thermal POS Receipt"
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

        {/* Thermal / Standard POS Slip Body */}
        <div id="bar-pos-receipt-print-area" className="p-6 sm:p-7 space-y-5 print:p-2 print:text-black">
          {/* 1. CLUB BRANDING HEADER */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-800 print:border-slate-400">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 print:border-black print:text-black">
              <Coffee className="w-3 h-3" />
              Club Cafe & Bar POS
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
              {clubProfile.businessName || clubProfile.name}
            </h2>
            {clubProfile.address && (
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 max-w-xs mx-auto">
                {clubProfile.address}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 print:text-slate-700 pt-0.5">
              {clubProfile.phone && <span>Ph: {clubProfile.phone}</span>}
              {clubProfile.gstin && <span>GSTIN: {clubProfile.gstin}</span>}
            </div>
          </div>

          {/* 2. ORDER META INFO */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className={`p-2.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            } print:border-slate-300 print:bg-transparent`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Order / Token No
              </span>
              <span className="font-mono font-black text-sm text-amber-500 dark:text-amber-400 print:text-black">
                {orderNo}
              </span>
            </div>

            <div className={`p-2.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            } print:border-slate-300 print:bg-transparent`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Date & Time
              </span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 print:text-black block">
                {dateFormatted}
              </span>
              <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                {timeFormatted}
              </span>
            </div>
          </div>

          {/* 3. CUSTOMER / GUEST INFO */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          } print:border-slate-300 print:bg-transparent`}>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 print:text-slate-600 block">
                Customer / Guest
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
                {primaryCustomer.name}
              </span>
              {primaryCustomer.whatsapp && (
                <span className="text-[11px] font-mono text-slate-500 block">
                  {primaryCustomer.whatsapp}
                </span>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
              bill.status === 'SETTLED'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {bill.status === 'SETTLED' ? 'PAID' : 'ON KHATA'}
            </span>
          </div>

          {/* 4. ITEMIZED F&B TABLE */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 border-b pb-1.5 dark:border-slate-800 border-slate-200 flex justify-between">
              <span>Item Description</span>
              <div className="flex gap-4">
                <span className="w-10 text-center">Qty</span>
                <span className="w-16 text-right">Price</span>
                <span className="w-16 text-right">Total</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200 text-xs">
              {items.map((item, idx) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {item.name}
                    </span>
                    <div className="flex gap-4 font-mono text-xs">
                      <span className="w-10 text-center text-slate-500 dark:text-slate-400 print:text-black">
                        {item.quantity}
                      </span>
                      <span className="w-16 text-right text-slate-500 dark:text-slate-400 print:text-black">
                        ₹{item.price}
                      </span>
                      <span className="w-16 text-right font-bold text-slate-900 dark:text-white print:text-black">
                        ₹{lineTotal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. GRAND TOTAL CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 text-center space-y-1.5 print:border-black print:bg-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 print:text-black block">
              Grand Total
            </span>
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 print:text-black">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] font-medium italic text-amber-700/80 dark:text-amber-300/80 print:text-black">
              "{inWords}"
            </p>
          </div>

          {/* 6. PAYMENT MODE INFO */}
          <div className="flex items-center justify-between py-2 border-t border-b border-dashed border-slate-300 dark:border-slate-800 text-xs print:border-slate-400">
            <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
              Payment Method
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {paymentMethod === 'UPI' ? (
                <CreditCard className="w-4 h-4 text-indigo-500" />
              ) : paymentMethod === 'LEDGER' ? (
                <Receipt className="w-4 h-4 text-amber-500" />
              ) : (
                <Banknote className="w-4 h-4 text-emerald-500" />
              )}
              <span>
                {paymentMethod === 'LEDGER' 
                  ? `Player Khata (${primaryCustomer.name})` 
                  : (paymentMethod === 'UPI' ? 'UPI Transfer' : 'Cash at Counter')}
              </span>
            </div>
          </div>

          {/* 7. FOOTER */}
          <div className="text-center pt-2 space-y-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 print:text-slate-600">
            <p className="font-bold">*** THANK YOU FOR VISITING ***</p>
            <p>JustClub POS • Club Operations OS</p>
          </div>
        </div>

        {/* Bottom Actions Footer (Hidden on Print) */}
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
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print POS Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
