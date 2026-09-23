import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Receipt,
  Send,
  Building2,
  Phone,
  QrCode,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Banknote,
  User,
  ShieldCheck,
  Wallet,
  ArrowDownRight
} from 'lucide-react';
import { CustomerPlayer, ClubProfile, LedgerEntry } from '../types';
import { downloadInvoiceAsPdf, printDocumentElement } from '../utils/pdfExport';

interface PaymentReceiptModalProps {
  entry: LedgerEntry & { runningBalance?: number; isDebit?: boolean };
  customer: CustomerPlayer;
  clubProfile: ClubProfile;
  isDarkMode?: boolean;
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
  isDarkMode = true,
  onClose,
}) => {
  const [receiptFormat, setReceiptFormat] = useState<'a4' | 'thermal_80mm' | 'thermal_58mm'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const amount = Math.abs(Number(entry.amount) || 0);
  const voucherNo = entry.voucherNo || `PAYMENT-${String(entry.id).slice(-4)}`;
  const method = (entry.settledMethod || entry.paymentMethod || 'UPI').toUpperCase();
  const refCode = entry.settlementRef || (entry.notes?.match(/\(([^)]+)\)/)?.[1]) || null;
  const inWords = numberToWords(amount);

  // Auto-scale on mobile so the A4/Thermal receipt fits horizontally on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          const targetWidth = receiptFormat === 'a4' ? 760 : receiptFormat === 'thermal_80mm' ? 380 : 300;
          const availableWidth = window.innerWidth - 24;
          const scale = Math.max(0.40, Math.min(1, availableWidth / targetWidth));
          setZoomScale(scale);
        } else {
          setZoomScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [receiptFormat]);

  const formatDateTime = (timestamp: string | number) => {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return { dateStr: String(timestamp), timeStr: '' };
      const dateStr = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { dateStr, timeStr };
    } catch {
      return { dateStr: String(timestamp), timeStr: '' };
    }
  };

  const dt = formatDateTime(entry.timestamp);

  const closingBalance = entry.runningBalance ?? customer.ledgerBalance;
  const prevBalance = (closingBalance !== undefined) ? (closingBalance + amount) : null;

  const handlePrint = async () => {
    await printDocumentElement('printable-payment-receipt');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const fileName = `Payment_Receipt_${voucherNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    await downloadInvoiceAsPdf('printable-payment-receipt', fileName);
    setIsDownloadingPdf(false);
  };

  const handleCopySummary = () => {
    const summaryText =
      `*${clubProfile.businessName} - Payment Receipt*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧾 Voucher No: ${voucherNo}\n` +
      `📅 Date: ${dt.dateStr} ${dt.timeStr}\n` +
      `👤 Received From: ${customer.name}\n` +
      `💳 Payment Channel: ${method}\n` +
      (refCode ? `🔢 Reference / UTR: ${refCode}\n` : '') +
      `💰 Amount Received: Rs. ${amount.toFixed(2)}\n` +
      `🔤 In Words: ${inWords}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      (prevBalance !== null ? `Previous Balance Due: Rs. ${prevBalance.toFixed(2)}\n` : '') +
      `Amount Credited: -Rs. ${amount.toFixed(2)}\n` +
      (closingBalance !== undefined ? `Current Outstanding Balance Due: Rs. ${closingBalance.toFixed(2)}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      (entry.notes ? `Notes: ${entry.notes}\n` : '') +
      `Thank you for your payment!`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const getWhatsAppReceiptLink = () => {
    const rawPhone = (customer.phone || '').replace(/\D/g, '');
    let phone = rawPhone ? (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone) : '';

    let text =
      `*${clubProfile.businessName} - Official Payment Receipt*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧾 *Receipt Voucher No:* ${voucherNo}\n` +
      `📅 *Date & Time:* ${dt.dateStr}, ${dt.timeStr}\n` +
      `👤 *Received With Thanks From:* ${customer.name}\n` +
      `💳 *Payment Channel:* ${method}\n`;

    if (refCode) {
      text += `🔢 *Txn Reference / UTR:* ${refCode}\n`;
    }

    text +=
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *AMOUNT RECEIVED:* *₹${amount.toFixed(2)}*\n` +
      `🔤 _"${inWords}"_\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📊 *Khata Balance Update:*\n`;

    if (prevBalance !== null) {
      text += `• Previous Balance Due: ₹${prevBalance.toFixed(2)}\n`;
    }
    text += `• Payment Credited: -₹${amount.toFixed(2)}\n`;
    if (closingBalance !== undefined) {
      text += `• *Current Outstanding Balance Due: ₹${closingBalance.toFixed(2)}*\n`;
    }

    if (entry.notes) {
      text += `\n📝 *Notes:* ${entry.notes}\n`;
    }

    text += `\n✅ *Status:* Payment Credited to Account\n\n` +
      `_Thank you for choosing ${clubProfile.businessName}!_`;

    const encoded = encodeURIComponent(text);
    return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 1. TOP ACTIONS CONTROL BAR (No-Print) */}
        <div className="no-print p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
                Payment Receipt : #{voucherNo}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Paid / Credit Received
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Voucher Ref: {voucherNo} • Customer: {customer.name} • Mode: {method} • Amount: ₹{amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Format Selector: A4 vs 80mm vs 58mm */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setReceiptFormat('a4')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  receiptFormat === 'a4'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="A4 Standard Document"
              >
                A4 Voucher
              </button>
              <button
                onClick={() => setReceiptFormat('thermal_80mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  receiptFormat === 'thermal_80mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="80mm POS Thermal Receipt"
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setReceiptFormat('thermal_58mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  receiptFormat === 'thermal_58mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="58mm Compact POS Receipt"
              >
                58mm POS
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.4, prev - 0.1))}
                className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-slate-300 w-9 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
                className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white border-l border-slate-700 transition cursor-pointer"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Copy Receipt Summary"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>

            {/* WhatsApp Share */}
            <a
              href={getWhatsAppReceiptLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Share Receipt via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Print Voucher Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE DOCUMENT PREVIEW WITH RESPONSIVE SCALE CONTAINER */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-100 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 850)}px` : undefined,
            }}
            className="shrink-0"
          >
            {receiptFormat === 'a4' ? (
              /* --- A4 STANDARD OFFICIAL MONEY RECEIPT VOUCHER --- */
              <div
                id="printable-payment-receipt"
                className="printable-document bg-white text-slate-900 rounded-xl shadow-md border border-slate-300 p-6 sm:p-8 w-[760px] text-xs"
                style={{ minHeight: '960px' }}
              >
                {/* Header: Club Profile & Official Letterhead */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-900 text-white p-2 flex flex-col items-center justify-center font-black">
                      <span className="text-lg leading-none tracking-tighter text-emerald-400">JC</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400">CLUB</span>
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                        {clubProfile.businessName}
                      </h1>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {clubProfile.address || 'Club & Gaming Lounge Premises'}, {clubProfile.city || 'Chennai'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-700 font-semibold mt-1">
                        {clubProfile.upiId && (
                          <span>UPI ID: <strong className="font-mono text-slate-900">{clubProfile.upiId}</strong></span>
                        )}
                        <span>Phone: {clubProfile.contactPhone || clubProfile.whatsapp || '+91 98400 12345'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded">
                      Official Payment Receipt
                    </span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                      #{voucherNo}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 font-bold">
                      Voucher Ref: {voucherNo}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Date: {dt.dateStr} • {dt.timeStr}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-300">
                      Payment Received & Credited
                    </span>
                  </div>
                </div>

                {/* Customer Information Ribbon */}
                <div className="my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Received With Thanks From
                      </div>
                      <div className="text-base font-black text-slate-900">
                        {customer.name}
                      </div>
                      {customer.phone && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Ph: {customer.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[11px] space-y-0.5 font-mono">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Customer Khata Account
                    </div>
                    <div className="font-bold text-slate-800">
                      ID: #{customer.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Category: Regular Member / Player
                    </div>
                  </div>
                </div>

                {/* Prominent Amount Box & Words */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border-2 border-emerald-300 flex items-center justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Payment Amount Received
                    </div>
                    <div className="text-3xl font-black font-mono text-emerald-950">
                      ₹{amount.toFixed(2)}
                    </div>
                    <div className="text-xs font-semibold text-emerald-800 italic">
                      "{inWords}"
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Payment Channel
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-emerald-200 shadow-xs text-xs font-bold text-slate-800">
                      {method === 'CASH' ? (
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>{method} {method === 'UPI' ? 'Transfer / QR' : ''}</span>
                    </div>
                    {refCode && (
                      <div className="text-[11px] font-mono text-slate-600">
                        UTR / Ref: <strong className="text-slate-900">{refCode}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Khata Ledger Statement Impact */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    Customer Khata Ledger Impact & Running Balance
                  </div>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3 text-left">Description / Particulars</th>
                          <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Credit / Paid (₹)</th>
                          <th className="py-2.5 px-3 text-right bg-slate-900">Net Due Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {prevBalance !== null && (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-700 font-medium">
                              Previous Outstanding Ledger Balance Due
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">
                              ₹{prevBalance.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-400">
                              -
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700">
                              ₹{prevBalance.toFixed(2)} DR
                            </td>
                          </tr>
                        )}
                        <tr className="bg-emerald-50/70 font-semibold">
                          <td className="py-2.5 px-3 text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Payment Received • Ref: {voucherNo} ({method})</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            -
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            - ₹{amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950 bg-emerald-100/50">
                            {closingBalance !== undefined ? `₹${closingBalance.toFixed(2)} DR` : '-'}
                          </td>
                        </tr>
                        {closingBalance !== undefined && (
                          <tr className="bg-slate-50 font-bold">
                            <td className="py-2 px-3 text-slate-900">
                              Current Balance Due Remaining
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                            <td className="py-2 px-3 text-right font-mono text-sm text-slate-900 bg-slate-100">
                              ₹{closingBalance.toFixed(2)} DR
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Purpose & Notes Box */}
                {entry.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                      Voucher Purpose / Remarks
                    </div>
                    <div className="text-slate-800 font-medium leading-relaxed">
                      {entry.notes}
                    </div>
                  </div>
                )}

                {/* Terms & Authorized Signature Block */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
                  <div>
                    <div className="font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Receipt Terms & Notes
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 leading-snug">
                      <li>Payment receipt is valid subject to realization of funds (for UPI/Cheque/Bank).</li>
                      <li>Payment has been credited to customer ledger account in D1.</li>
                      <li>For any billing clarification, contact club front desk management.</li>
                    </ul>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">
                        For {clubProfile.businessName}
                      </span>
                      <span className="text-[9px] text-slate-400">Cashier / Authorized Signatory</span>
                    </div>
                    <div className="border-t border-slate-400 w-36 pt-1 text-center font-mono text-[9px] text-slate-400 mt-6">
                      Stamp / Signature
                    </div>
                  </div>
                </div>

                {/* Bottom Watermark */}
                <div className="mt-4 pt-2 border-t border-slate-100 text-center text-[9px] text-slate-400 font-mono">
                  Computer Generated Money Receipt • Voucher: {voucherNo} • JustClub Gaming System
                </div>
              </div>
            ) : (
              /* --- POS THERMAL RECEIPT FORMAT (80mm or 58mm Roll) --- */
              <div
                id="printable-payment-receipt"
                className={`printable-document bg-white text-slate-950 font-mono shadow-md border border-slate-300 p-4 sm:p-5 text-[11px] leading-tight ${
                  receiptFormat === 'thermal_80mm' ? 'w-[360px]' : 'w-[280px]'
                }`}
                style={{ fontFamily: '"Courier New", Courier, monospace' }}
              >
                {/* Thermal Header */}
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <div className="font-black text-sm uppercase tracking-wide">
                    {clubProfile.businessName}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {clubProfile.address || 'Gaming Club & Lounge'}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Ph: {clubProfile.contactPhone || clubProfile.whatsapp || '+91 98400 12345'}
                  </div>
                  {clubProfile.upiId && (
                    <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                      UPI: {clubProfile.upiId}
                    </div>
                  )}
                </div>

                {/* Receipt Title & Meta */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="text-center font-bold text-xs uppercase tracking-wider">
                    *** PAYMENT RECEIPT ***
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">RECEIPT NO:</span>
                    <span className="font-bold">{voucherNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">VCH REF:</span>
                    <span className="font-bold">{voucherNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">DATE:</span>
                    <span>{dt.dateStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">TIME:</span>
                    <span>{dt.timeStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">STATUS:</span>
                    <span className="font-bold">CREDITED / PAID</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">RECEIVED FROM:</span>
                    <span className="font-black text-xs">{customer.name}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">PHONE:</span>
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">CHANNEL:</span>
                    <span className="font-bold">{method}</span>
                  </div>
                  {refCode && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">TXN REF / UTR:</span>
                      <span className="font-bold">{refCode}</span>
                    </div>
                  )}
                </div>

                {/* Amount Received Box */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="flex justify-between items-center text-sm font-black">
                    <span>AMOUNT RECEIVED:</span>
                    <span className="text-base font-mono">₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-700 italic">
                    "{inWords}"
                  </div>
                </div>

                {/* Khata Balance Summary */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-600">
                    KHATA BALANCE SUMMARY:
                  </div>
                  {prevBalance !== null && (
                    <div className="flex justify-between">
                      <span>Previous Balance Due:</span>
                      <span>₹{prevBalance.toFixed(2)} DR</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Payment Credited:</span>
                    <span>-₹{amount.toFixed(2)} CR</span>
                  </div>
                  {closingBalance !== undefined && (
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-dotted border-slate-300">
                      <span>CURRENT BALANCE DUE:</span>
                      <span>₹{closingBalance.toFixed(2)} DR</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {entry.notes && (
                  <div className="py-1.5 border-b border-dashed border-slate-400 text-[10px] text-slate-600">
                    <div>NOTES: {entry.notes}</div>
                  </div>
                )}

                {/* Thermal Footer */}
                <div className="text-center pt-3 space-y-1">
                  <div className="font-bold text-[10px] uppercase">
                    Payment Credited Successfully
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Thank you for your payment!
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono mt-1">
                    Receipt #{voucherNo}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. MODAL FOOTER ACTIONS */}
        <div className="no-print p-3 sm:p-4 bg-slate-900 border-t border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getWhatsAppReceiptLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </a>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'Generating...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
