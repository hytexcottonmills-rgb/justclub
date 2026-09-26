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
  Gamepad2,
  Coffee,
  Users,
  Send,
  Building2,
  Phone,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BillRecord, ClubProfile } from '../types';
import { downloadInvoiceAsPdf, printDocumentElement } from '../utils/pdfExport';
import { getBillRateLabel, getBillGameCostBreakdown, formatWhatsAppForLink, formatWhatsAppDisplay } from '../utils/billing';

interface BillInvoicePrintModalProps {
  bill: BillRecord | null;
  clubProfile: ClubProfile;
  isDarkMode?: boolean;
  onClose: () => void;
}

export const BillInvoicePrintModal: React.FC<BillInvoicePrintModalProps> = ({
  bill,
  clubProfile,
  isDarkMode = true,
  onClose,
}) => {
  const [invoiceFormat, setInvoiceFormat] = useState<'a4' | 'thermal_80mm' | 'thermal_58mm'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Auto-scale on mobile so the A4/Thermal invoice fits horizontally on iPhone / mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          const targetWidth = invoiceFormat === 'a4' ? 760 : invoiceFormat === 'thermal_80mm' ? 380 : 300;
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
  }, [invoiceFormat]);

  if (!bill) return null;

  const handlePrint = async () => {
    await printDocumentElement('printable-invoice');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const fileName = `Invoice_${bill.billNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    await downloadInvoiceAsPdf('printable-invoice', fileName);
    setIsDownloadingPdf(false);
  };

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

  const formatTimeOnly = (epochMs: number) => {
    try {
      const d = new Date(epochMs);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const dt = formatDateTime(bill.timestamp);

  const handleCopySummary = () => {
    const rateLabel = getBillRateLabel(bill);
    const breakdown = getBillGameCostBreakdown(bill);

    const summaryText =
      `*${clubProfile.businessName} - Tax Invoice*\n` +
      `Bill No: ${bill.billNo}\n` +
      `Date: ${dt.dateStr} ${dt.timeStr}\n` +
      `Table/Asset: ${bill.assetName} (${bill.gameType})\n` +
      `Duration: ${bill.durationMinutes} mins (Rate: ${rateLabel})\n` +
      (breakdown ? `Game Math: ${breakdown}\n` : '') +
      `Game Total: Rs. ${bill.totalGameCost.toFixed(2)}\n` +
      (bill.totalBarCost > 0 ? `Cafe/Bar Total: Rs. ${bill.totalBarCost.toFixed(2)}\n` : '') +
      (bill.roundOffAmount !== undefined && Math.abs(bill.roundOffAmount) >= 0.01 ? `Round Off: ${bill.roundOffAmount > 0 ? '+' : ''}Rs. ${bill.roundOffAmount.toFixed(2)}\n` : '') +
      `Grand Total: Rs. ${bill.grandTotal.toFixed(2)}\n` +
      `Status: ${bill.status}\n` +
      `Split: ${bill.gameSplitRule.replace(/_/g, ' ')}\n` +
      `Players:\n` +
      bill.shares.map((s) => `• ${s.playerName}: Rs. ${s.totalShare.toFixed(2)} (${s.paymentMethod})`).join('\n') +
      (clubProfile.upiId ? `\nUPI Payment ID: ${clubProfile.upiId}` : '');

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const getWhatsAppInvoiceLink = (specificPlayerId?: string) => {
    const targetShare = specificPlayerId
      ? bill.shares.find((s) => s.playerId === specificPlayerId)
      : null;

    const rawPhone = targetShare?.whatsapp || bill.players?.[0]?.whatsapp || '';
    const phone = formatWhatsAppForLink(rawPhone);

    const rateLabel = getBillRateLabel(bill);
    const breakdown = getBillGameCostBreakdown(bill);

    let text =
      `*${clubProfile.businessName} - Session Invoice*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧾 *Invoice No:* ${bill.billNo}\n` +
      `📅 *Date:* ${dt.dateStr}, ${dt.timeStr}\n` +
      `🎱 *Table/Asset:* ${bill.assetName} (${bill.gameType})\n` +
      `⏱️ *Time:* ${formatTimeOnly(bill.startTime)} - ${formatTimeOnly(bill.endTime)} (${bill.durationMinutes} mins)\n` +
      `💰 *Rate:* ${rateLabel}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Game Amount:* ₹${bill.totalGameCost.toFixed(2)}\n`;

    if (breakdown) {
      text += `📐 *Game Math:* ${breakdown}\n`;
    }

    if (bill.totalBarCost > 0) {
      text += `☕ *Cafe & Bar:* ₹${bill.totalBarCost.toFixed(2)}\n`;
    }

    if (bill.roundOffAmount !== undefined && Math.abs(bill.roundOffAmount) >= 0.01) {
      const sign = bill.roundOffAmount > 0 ? '+' : '';
      text += `⚖️ *Round Off:* ${sign}₹${bill.roundOffAmount.toFixed(2)}\n`;
      text += `_Split evenly to the nearest rupee so every player pays exactly the same amount_\n`;
    }

    text += `💳 *Grand Total:* ₹${bill.grandTotal.toFixed(2)}\n\n`;

    if (targetShare) {
      text +=
        `👤 *Your Individual Share:*\n` +
        `• Name: ${targetShare.playerName}\n` +
        `• Due Amount: *₹${targetShare.totalShare.toFixed(2)}*\n` +
        `• Mode: ${targetShare.paymentMethod}\n\n`;
    } else {
      text +=
        `👥 *Player Breakdown:*\n` +
        bill.shares.map((s) => `• ${s.playerName}: ₹${s.totalShare.toFixed(2)} (${s.paymentMethod})`).join('\n') +
        `\n\n`;
    }

    if (bill.status === 'SETTLED') {
      text += `✅ *Status:* Settled in Full\n\n`;
    } else {
      text += `📋 *Status:* Posted to Club Account Ledger (Balance Due: ₹${(targetShare ? targetShare.totalShare : bill.grandTotal).toFixed(2)})\n\n`;
    }

    text += `_Thank you for visiting ${clubProfile.businessName}!_`;

    const encoded = encodeURIComponent(text);
    return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className={`rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* 1. TOP ACTIONS CONTROL BAR (No-Print) */}
        <div className={`no-print p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
                Session Invoice : #{bill.billNo}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  bill.status === 'SETTLED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {bill.status === 'SETTLED' ? 'Paid in Full' : 'Posted to Ledger'}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Voucher Ref: {bill.voucherNo || bill.billNo} • {bill.assetName} • {bill.durationMinutes} mins • Grand Total: ₹{bill.grandTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Format Selector: A4 vs 80mm vs 58mm */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setInvoiceFormat('a4')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  invoiceFormat === 'a4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="A4 Standard Document"
              >
                A4 Tax Invoice
              </button>
              <button
                onClick={() => setInvoiceFormat('thermal_80mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  invoiceFormat === 'thermal_80mm'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="80mm POS Thermal Receipt"
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setInvoiceFormat('thermal_58mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  invoiceFormat === 'thermal_58mm'
                    ? 'bg-indigo-600 text-white shadow-xs'
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
              title="Copy Bill Summary"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>

            {/* WhatsApp Share */}
            <a
              href={getWhatsAppInvoiceLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Share Invoice via WhatsApp"
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
              title="Print Receipt / Invoice"
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
        <div className={`flex-1 overflow-auto p-2 sm:p-6 flex justify-center items-start ${
          isDarkMode ? 'bg-slate-950/80' : 'bg-slate-100'
        }`}>
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 850)}px` : undefined,
            }}
            className="shrink-0"
          >
            {invoiceFormat === 'a4' ? (
              /* --- A4 STANDARD TAX INVOICE FORMAT --- */
              <div
                id="printable-invoice"
                className="printable-document bg-white text-slate-900 rounded-xl shadow-md border border-slate-300 p-6 sm:p-8 w-[760px] text-xs"
                style={{ minHeight: '960px' }}
              >
                {/* Header: Club Profile & Official Letterhead */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-900 text-white p-2 flex flex-col items-center justify-center font-black">
                      <span className="text-lg leading-none tracking-tighter text-indigo-400">JC</span>
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
                        <span>WhatsApp: {formatWhatsAppDisplay(clubProfile.whatsapp || clubProfile.contactPhone || '9840012345')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded">
                      Tax Invoice / Bill
                    </span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                      #{bill.billNo}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-700 font-bold">
                      Voucher Ref: {bill.voucherNo || bill.billNo}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Date: {dt.dateStr} • {dt.timeStr}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                      bill.status === 'SETTLED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {bill.status === 'SETTLED' ? 'Settled in Full' : 'Added to Customer Ledger'}
                    </span>
                  </div>
                </div>

                {/* Session Coordinates Ribbon */}
                <div className="my-3 py-2 px-3 bg-slate-100 rounded border border-slate-200 flex flex-wrap items-center justify-between text-[11px] gap-2">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-indigo-700" />
                    <span className="font-bold text-slate-900">{bill.assetName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">{bill.gameType}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                      {bill.matchType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 font-mono text-[10px]">
                    <span>Rate: <strong>{getBillRateLabel(bill)}</strong></span>
                    <span>Time: <strong>{formatTimeOnly(bill.startTime)} - {formatTimeOnly(bill.endTime)}</strong></span>
                    <span className="text-indigo-700 font-bold">Duration: {bill.durationMinutes} mins</span>
                  </div>
                </div>

                {/* 2-Column Party & Match Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Players Box */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Participating Players & Ledgers</span>
                      <span className="text-slate-400 font-normal">({bill.shares.length} players)</span>
                    </div>
                    <div className="space-y-1">
                      {bill.shares.map((share) => (
                        <div key={share.playerId} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{share.playerName}</span>
                            {share.whatsapp && (
                              <span className="text-[10px] text-slate-400 font-mono">({formatWhatsAppDisplay(share.whatsapp)})</span>
                            )}
                            {share.isWinner && (
                              <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-bold">Winner</span>
                            )}
                            {share.isLoser && (
                              <span className="text-[9px] px-1 bg-rose-100 text-rose-800 rounded font-bold">Loser</span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{share.totalShare.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match & Split Rules Summary */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Split Engine & Settlement Mode
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Game Split Rule:</span>
                          <span className="font-bold text-slate-900">{bill.gameSplitRule.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cafe/Bar Split Rule:</span>
                          <span className="font-bold text-slate-900">{bill.barSplitRule.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Settlement Status:</span>
                          <span className="font-bold text-emerald-700">{bill.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Total Billed:</span>
                      <span className="font-mono font-black text-sm text-indigo-900">
                        ₹{bill.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itemized Table 1: Game Session Time Breakdown */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-indigo-600" />
                    Table & Session Time Charges
                  </div>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                          <th className="py-2 px-3 text-left">Asset / Table</th>
                          <th className="py-2 px-3 text-center">Billed Minutes</th>
                          <th className="py-2 px-3 text-right">Hourly Rate</th>
                          <th className="py-2 px-3 text-right">Session Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {bill.assetName} ({bill.gameType} - {bill.matchType.toUpperCase()})
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-semibold">
                            {bill.durationMinutes} mins
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {getBillRateLabel(bill)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{bill.totalGameCost.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Itemized Table 2: Cafe & Bar Consumables (if any) */}
                {bill.barItemsSummary && bill.barItemsSummary.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      Cafe & Bar Orders Breakdown
                    </div>
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                            <th className="py-2 px-3 text-center w-8">#</th>
                            <th className="py-2 px-3 text-left">Item Name</th>
                            <th className="py-2 px-3 text-center w-20">Quantity</th>
                            <th className="py-2 px-3 text-right w-24">Unit Price</th>
                            <th className="py-2 px-3 text-right w-24">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {bill.barItemsSummary.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-1.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-medium text-slate-800">{item.name}</td>
                              <td className="py-1.5 px-3 text-center font-mono">× {item.quantity}</td>
                              <td className="py-1.5 px-3 text-right font-mono">₹{item.price.toFixed(2)}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Itemized Table 3: Player vs Player (PvP) Split Settlement Matrix */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Player vs Player Split Engine Breakdown
                  </div>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                          <th className="py-2 px-2 text-center w-8 border-r border-slate-700">#</th>
                          <th className="py-2 px-3 text-left border-r border-slate-700">Player Details</th>
                          <th className="py-2 px-2 text-right w-24 border-r border-slate-700">Game Share</th>
                          <th className="py-2 px-2 text-right w-28 border-r border-slate-700 text-rose-300">Discount</th>
                          <th className="py-2 px-2 text-right w-24 border-r border-slate-700">Bar Share</th>
                          <th className="py-2 px-2 text-right w-28 border-r border-slate-700 bg-indigo-900/80">
                            Total Share (₹)
                          </th>
                          <th className="py-2 px-3 text-center w-28">Payment Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {bill.shares.map((share, idx) => {
                          const savedDiscount = (share.gameDiscountAmount || 0) + (share.barDiscountAmount || 0);
                          const calculatedDiscount = Math.max(0, (share.gameShare || 0) + (share.barShare || 0) - (share.totalShare || 0));
                          const displayDiscount = savedDiscount > 0 ? savedDiscount : calculatedDiscount;
                          
                          const numPlayers = bill.players?.length || 2;
                          const playerIndividualShare = bill.totalGameCost / numPlayers;
                          const discountPercent = share.gameDiscountPercent || (displayDiscount > 0 ? 100 : 0);

                          return (
                            <tr key={share.playerId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-1.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="py-1.5 px-3 border-r border-slate-200">
                                <div className="font-bold text-slate-900">{share.playerName}</div>
                                {share.whatsapp && (
                                  <div className="text-[10px] text-slate-500 font-mono">{formatWhatsAppDisplay(share.whatsapp)}</div>
                                )}
                                {share.membershipBadge && (
                                  <div className="text-[9px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                                    <span>⭐ {share.membershipBadge}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono border-r border-slate-200 text-slate-800">
                                ₹{share.gameShare.toFixed(2)}
                              </td>
                              <td className="py-1.5 px-2 text-right border-r border-slate-200">
                                {displayDiscount > 0 ? (
                                  <div className="space-y-0.5 text-right font-mono">
                                    <span className="text-xs font-bold text-rose-600">-₹{displayDiscount.toFixed(2)}</span>
                                    <div className="text-[8px] font-bold text-indigo-600 uppercase tracking-tight leading-tight">
                                      {discountPercent}% of ₹{playerIndividualShare.toFixed(2)} Share
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-mono text-xs text-slate-400">₹0.00</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono border-r border-slate-200">
                                ₹{share.barShare.toFixed(2)}
                              </td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200 bg-indigo-50/50">
                              ₹{share.totalShare.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                                {share.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Financial Totals Audit Box */}
                <div className="p-3 bg-slate-50 rounded-lg border-2 border-slate-300 flex items-center justify-between gap-4 mb-4">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-600">
                      Table Session Subtotal: <strong className="font-mono text-slate-900">₹{bill.totalGameCost.toFixed(2)}</strong>
                      {getBillGameCostBreakdown(bill) && (
                        <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                          ({getBillGameCostBreakdown(bill)})
                        </div>
                      )}
                    </div>
                    {bill.totalBarCost > 0 && (
                      <div className="text-slate-600">
                        Cafe & Bar Consumables Subtotal: <strong className="font-mono text-slate-900">₹{bill.totalBarCost.toFixed(2)}</strong>
                      </div>
                    )}
                    {bill.roundOffAmount !== undefined && Math.abs(bill.roundOffAmount) >= 0.01 && (
                      <div className="text-slate-600">
                        Round Off: <strong className="font-mono text-slate-900">{bill.roundOffAmount > 0 ? '+' : ''}₹{bill.roundOffAmount.toFixed(2)}</strong>
                        <span className="text-[10px] text-slate-500 block italic">
                          Split evenly to the nearest rupee so every player pays exactly the same amount
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500">
                      Calculated via {bill.gameSplitRule.replace(/_/g, ' ')} logic • Ref: {bill.voucherNo || bill.billNo}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Grand Total Invoiced
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900">
                      ₹{bill.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Settlement & Reference Block */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 items-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Settlement & Payment Details
                    </div>
                    {clubProfile.upiId ? (
                      <div className="space-y-0.5 text-xs">
                        <div>
                          Payee UPI ID: <strong className="font-mono text-indigo-700">{clubProfile.upiId}</strong>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Front desk / counter settlement recorded
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600">
                        Cash or Ledger settlement recorded at front desk.
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[10px] text-slate-500">
                    <div>Voucher Reference:</div>
                    <div className="font-mono font-bold text-slate-800 text-xs">{bill.voucherNo || bill.billNo}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Computer Generated Tax Invoice</div>
                  </div>
                </div>

                {/* Terms & Authorized Signature Block */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
                  <div>
                    <div className="font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Club Billing Terms & Policies
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 leading-snug">
                      <li>Session billing is computed per standard club rates & rules.</li>
                      <li>Any discrepancy must be reported within 24 hours of match close.</li>
                      <li>All credit transactions are recorded in the official Customer Khata.</li>
                    </ul>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase">
                        For {clubProfile.businessName}
                      </span>
                      <span className="text-[9px] text-slate-400">Authorized Signatory & Billing Desk</span>
                    </div>
                    <div className="border-t border-slate-400 w-36 pt-1 text-center font-mono text-[9px] text-slate-400 mt-6">
                      Stamp / Seal
                    </div>
                  </div>
                </div>

                {/* Bottom Watermark */}
                <div className="mt-4 pt-2 border-t border-slate-100 text-center text-[9px] text-slate-400 font-mono">
                  Computer Generated Invoice • Voucher: {bill.voucherNo || bill.billNo} • Valid without physical signature • JustClub
                </div>
              </div>
            ) : (
              /* --- POS THERMAL RECEIPT FORMAT (80mm or 58mm Roll) --- */
              <div
                id="printable-invoice"
                className={`printable-document bg-white text-slate-950 font-mono shadow-md border border-slate-300 p-4 sm:p-5 text-[11px] leading-tight ${
                  invoiceFormat === 'thermal_80mm' ? 'w-[360px]' : 'w-[280px]'
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
                    WhatsApp: {formatWhatsAppDisplay(clubProfile.whatsapp || clubProfile.contactPhone || '9840012345')}
                  </div>
                  {clubProfile.upiId && (
                    <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                      UPI: {clubProfile.upiId}
                    </div>
                  )}
                </div>

                {/* Bill Metadata */}
                <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>BILL NO: {bill.billNo}</span>
                    <span>{bill.status}</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-900">
                    <span>VCH REF: {bill.voucherNo || bill.billNo}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>DATE: {dt.dateStr}</span>
                    <span>TIME: {dt.timeStr}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TABLE: {bill.assetName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>MATCH: {bill.gameType} ({bill.matchType})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TIME: {formatTimeOnly(bill.startTime)}-{formatTimeOnly(bill.endTime)}</span>
                    <span>{bill.durationMinutes}m</span>
                  </div>
                </div>

                {/* Session Charge Line */}
                <div className="py-2 border-b border-dashed border-slate-400">
                  <div className="flex justify-between font-bold">
                    <span>Table Session ({bill.durationMinutes}m @ {getBillRateLabel(bill)})</span>
                    <span>₹{bill.totalGameCost.toFixed(2)}</span>
                  </div>
                  {getBillGameCostBreakdown(bill) && (
                    <div className="text-[9px] text-slate-700 font-bold mt-0.5">
                      {getBillGameCostBreakdown(bill)}
                    </div>
                  )}
                </div>

                {/* Bar items if any */}
                {bill.barItemsSummary && bill.barItemsSummary.length > 0 && (
                  <div className="py-2 border-b border-dashed border-slate-400">
                    <div className="font-bold text-[10px] uppercase mb-1">CAFE & BAR CONSUMABLES:</div>
                    {bill.barItemsSummary.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px]">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-1 text-[10px]">
                      <span>Bar Subtotal:</span>
                      <span>₹{bill.totalBarCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Round Off */}
                {bill.roundOffAmount !== undefined && Math.abs(bill.roundOffAmount) >= 0.01 && (
                  <div className="py-1.5 border-b border-dashed border-slate-400 text-[10px]">
                    <div className="flex justify-between">
                      <span>Round Off:</span>
                      <span>{bill.roundOffAmount > 0 ? '+' : ''}₹{bill.roundOffAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 italic mt-0.5">
                      Split evenly to the nearest rupee so every player pays exactly the same amount
                    </div>
                  </div>
                )}

                {/* Grand Total */}
                <div className="py-2.5 border-b-2 border-slate-900 font-bold text-xs space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>GRAND TOTAL:</span>
                    <span>₹{bill.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-normal">
                    Rule: {bill.gameSplitRule.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* Player Breakdown */}
                <div className="py-2 border-b border-dashed border-slate-400">
                  <div className="font-bold text-[10px] uppercase mb-1">PLAYER SHARES / KHATA:</div>
                  {bill.shares.map((share, idx) => {
                    const totalDiscount = (share.gameDiscountAmount || 0) + (share.barDiscountAmount || 0);
                    return (
                      <div key={idx} className="py-0.5 space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <div className="truncate pr-2">
                            <span className="font-semibold">{share.playerName}</span>
                            <span className="text-[9px] text-slate-500 ml-1">({share.paymentMethod})</span>
                          </div>
                          <span className="font-bold whitespace-nowrap">₹{share.totalShare.toFixed(2)}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-[9px] text-slate-500 pl-2">
                            <span>↳ {share.membershipBadge || 'Discount'}:</span>
                            <span className="font-medium font-mono">-₹{totalDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Thermal Receipt Footer */}
                <div className="pt-2 text-center text-[10px] space-y-1">
                  <div className="font-bold text-[9px] uppercase">
                    VOUCHER REF: {bill.voucherNo || bill.billNo}
                  </div>
                  <div className="font-bold text-[9px] uppercase tracking-wide">
                    *** THANK YOU FOR VISITING ***
                  </div>
                  <div className="text-[8px] text-slate-500">
                    Computer Generated Receipt • Please Visit Again!
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
              href={getWhatsAppInvoiceLink()}
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
