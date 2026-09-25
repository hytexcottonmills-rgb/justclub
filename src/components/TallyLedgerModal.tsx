import React, { useState, useMemo } from 'react';
import { CustomerPlayer, LedgerEntry, PaymentMethod } from '../types';
import { 
  FileText, 
  Printer, 
  MessageSquare, 
  QrCode, 
  X, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Gamepad2, 
  Coffee, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Layers, 
  Download,
  Share2,
  Calendar,
  Building2,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UpiQrModal } from './UpiQrModal';
import { printDocumentElement } from '../utils/pdfExport';
import { formatWhatsAppDisplay, formatWhatsAppForLink } from '../utils/phone';

interface TallyLedgerModalProps {
  customer: CustomerPlayer;
  ledgerEntries: LedgerEntry[];
  clubName: string;
  upiId: string;
  onClose: () => void;
  onOpenSettleModal: (customer: CustomerPlayer, defaultAmount?: number, entryId?: string) => void;
  isDarkMode?: boolean;
}

export const TallyLedgerModal: React.FC<TallyLedgerModalProps> = ({
  customer,
  ledgerEntries,
  clubName,
  upiId,
  onClose,
  onOpenSettleModal,
  isDarkMode = true,
}) => {
  // View Theme Mode: 'tally_classic' (Tally ERP Green/Navy Theme) | 'modern' (Dark/Light Slate)
  // View presentation mode: 'modern' matches the app's unified theme (light/dark), 'tally_classic' offers CRT retro view
  const [viewStyle, setViewStyle] = useState<'tally_classic' | 'modern'>('modern');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEBITS' | 'CREDITS' | 'PENDING'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_7_DAYS'>('ALL');
  
  // Row expansion state for line-item audit - defaults to true so Tally statement shows all details immediately
  const [showAllDetails, setShowAllDetails] = useState<boolean>(true);
  const [collapsedRowIds, setCollapsedRowIds] = useState<Set<string>>(new Set());
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    if (showAllDetails) {
      setCollapsedRowIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setExpandedRowIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  // UPI QR Modal state
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Filter and sort customer entries chronologically (oldest to newest for running balance math)
  const sortedCustomerEntries = useMemo(() => {
    return [...ledgerEntries]
      .filter(e => e.customerId === customer.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [ledgerEntries, customer.id]);

  // Compute Running Balance for each entry from opening balance (0)
  interface TallyRow extends LedgerEntry {
    runningBalance: number; // positive = credit (advance), negative = debit (receivable)
    balanceType: 'Dr' | 'Cr' | '-';
    debitAmount: number;
    creditAmount: number;
  }

  const { tallyRows, totalDebits, totalCredits, netClosingBalance } = useMemo(() => {
    let currentBalance = 0;
    let debitsSum = 0;
    let creditsSum = 0;

    const rows: TallyRow[] = sortedCustomerEntries.map(entry => {
      let debit = 0;
      let credit = 0;
      const isVoided = entry.status === 'VOIDED' || Boolean(entry.isVoided);

      if (!isVoided) {
        if (entry.type.startsWith('DEBIT') || entry.type === 'GAME' || entry.type === 'CAFE') {
          debit = Number(entry.amount) || 0;
          debitsSum += debit;
          currentBalance -= debit;
        } else {
          credit = Number(entry.amount) || 0;
          creditsSum += credit;
          currentBalance += credit;
        }
      }

      let balanceType: 'Dr' | 'Cr' | '-' = '-';
      if (currentBalance < 0) balanceType = 'Dr';
      else if (currentBalance > 0) balanceType = 'Cr';

      return {
        ...entry,
        isVoided,
        debitAmount: debit,
        creditAmount: credit,
        runningBalance: currentBalance,
        balanceType,
      };
    });

    return {
      tallyRows: rows,
      totalDebits: debitsSum,
      totalCredits: creditsSum,
      netClosingBalance: currentBalance,
    };
  }, [sortedCustomerEntries]);

  // Apply visual search and filter
  const displayedRows = useMemo(() => {
    return tallyRows.filter(row => {
      // Type Filter
      if (typeFilter === 'DEBITS' && row.debitAmount === 0) return false;
      if (typeFilter === 'CREDITS' && row.creditAmount === 0) return false;
      if (typeFilter === 'PENDING' && row.status !== 'PENDING') return false;

      // Date Filter
      if (dateFilter === 'LAST_7_DAYS') {
        const entryTime = new Date(row.timestamp).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (entryTime < sevenDaysAgo) return false;
      } else if (dateFilter === 'THIS_MONTH') {
        const entryDate = new Date(row.timestamp);
        const now = new Date();
        if (entryDate.getMonth() !== now.getMonth() || entryDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAsset = row.assetName?.toLowerCase().includes(q);
        const matchDesc = row.description.toLowerCase().includes(q);
        const matchVch = row.voucherNo?.toLowerCase().includes(q);
        const matchNotes = row.notes?.toLowerCase().includes(q);
        const matchItems = row.barItemsSummary?.some(i => i.name.toLowerCase().includes(q));
        if (!matchAsset && !matchDesc && !matchVch && !matchNotes && !matchItems) return false;
      }

      return true;
    });
  }, [tallyRows, typeFilter, dateFilter, searchQuery]);

  // Format WhatsApp Tally Statement
  const handleShareWhatsAppStatement = () => {
    const lines = [
      `*${clubName.toUpperCase()} - ACCOUNT STATEMENT*`,
      `*Customer:* ${customer.name} (${formatWhatsAppDisplay(customer.whatsapp)})`,
      `*Statement Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      `------------------------------------------`,
      `*TRANSACTIONS BREAKDOWN:*`,
    ];

    displayedRows.forEach((row, idx) => {
      const dateStr = new Date(row.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const timeStr = new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      
      if (row.debitAmount > 0) {
        lines.push(`\n#${idx + 1} [${row.voucherNo || 'VCH'}] ${dateStr} ${timeStr}`);
        lines.push(`• *To:* ${row.assetName || row.description}`);
        if (row.gameShare) {
          lines.push(`  🎮 Game: ₹${row.gameShare} (${row.durationMinutes || 0}m @ ₹${row.hourlyRate || 0}/hr, ${row.matchType || 'Match'})`);
        }
        if (row.barShare) {
          const itemsStr = row.barItemsSummary?.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Cafe Items';
          lines.push(`  ☕ Bar: ₹${row.barShare} (${itemsStr})`);
        }
        if (row.splitRule) {
          lines.push(`  ⚖️ Split: ${row.splitRule.replace(/_/g, ' ')}${row.isLoser ? ' (Loser Billed)' : ''}`);
        }
        lines.push(`  *Debit (Dr):* ₹${row.debitAmount.toFixed(2)} | *Bal:* ₹${Math.abs(row.runningBalance).toFixed(2)} ${row.balanceType}`);
      } else {
        const method = row.paymentMethod === 'Cash' ? 'Cash' : 'UPI';
        lines.push(`\n#${idx + 1} [Receipt] ${dateStr} ${timeStr}`);
        lines.push(`• *Payment Receipt:* ₹${row.creditAmount.toFixed(2)} (${method})`);
        lines.push(`  *Bal:* ₹${Math.abs(row.runningBalance).toFixed(2)} ${row.balanceType}`);
      }
    });

    lines.push(`\n------------------------------------------`);
    lines.push(`*Total Debits (Dr):* ₹${totalDebits.toFixed(2)}`);
    lines.push(`*Total Credits (Cr):* ₹${totalCredits.toFixed(2)}`);
    const closingTxt = netClosingBalance < 0 
      ? `*Closing Net Balance (Due):* ₹${Math.abs(netClosingBalance).toFixed(2)} Dr (Outstanding)`
      : netClosingBalance > 0
        ? `*Closing Net Balance:* ₹${netClosingBalance.toFixed(2)} Cr (Advance Credit)`
        : `*Closing Balance:* ₹0.00 (Account All Clear)`;
    lines.push(closingTxt);

    if (netClosingBalance < 0) {
      lines.push(`\n📋 *Status:* Posted to Account Ledger. Please settle at the counter during your next visit.`);
    }

    lines.push(`\n_Generated via Tally Accounting Ledger Engine_`);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${formatWhatsAppForLink(customer.whatsapp)}?text=${encoded}`, '_blank');
  };

  const isDebitDue = netClosingBalance < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className={`w-full max-w-5xl h-[94vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          viewStyle === 'tally_classic'
            ? 'bg-[#002b36] border-[#073642] text-[#93a1a1]'
            : isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* TALLY TOP BREADCRUMB & CONTROL BANNER */}
        <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 select-none text-xs font-mono ${
          viewStyle === 'tally_classic'
            ? 'bg-[#073642] border-[#002b36] text-[#2aa198]'
            : isDarkMode
              ? 'bg-slate-950 border-slate-800 text-indigo-400'
              : 'bg-slate-100 border-slate-200 text-indigo-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
              viewStyle === 'tally_classic'
                ? 'bg-emerald-500/20 text-emerald-400'
                : isDarkMode
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              TALLY PRIME ERP v5.2
            </span>
            <span className={`hidden sm:inline ${
              viewStyle === 'tally_classic' ? 'text-slate-400' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Gateway of Tally &gt; Display More Reports &gt; Account Books &gt; Ledger
            </span>
            <span className="sm:hidden font-bold">Ledger Account</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className={`flex items-center rounded-lg border p-0.5 text-[11px] ${
              viewStyle === 'tally_classic'
                ? 'border-[#073642] bg-[#00212b]'
                : isDarkMode
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-300 bg-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setViewStyle('modern')}
                className={`px-2 py-0.5 rounded font-semibold transition ${
                  viewStyle === 'modern'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unified Theme
              </button>
              <button
                type="button"
                onClick={() => setViewStyle('tally_classic')}
                className={`px-2 py-0.5 rounded font-semibold transition ${
                  viewStyle === 'tally_classic'
                    ? 'bg-[#2aa198] text-[#002b36] font-bold shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tally Classic CRT
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition ${
                viewStyle === 'tally_classic'
                  ? 'text-slate-400 hover:text-white hover:bg-[#073642]'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Close Statement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TALLY REPORT HEADER */}
        <div className={`p-4 sm:p-5 border-b ${
          viewStyle === 'tally_classic'
            ? 'bg-[#00212b] border-[#073642]'
            : isDarkMode
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: Company & Ledger Account */}
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider ${
                viewStyle === 'tally_classic'
                  ? 'text-amber-400'
                  : isDarkMode
                    ? 'text-amber-400'
                    : 'text-amber-700'
              }`}>
                <Building2 className="w-3.5 h-3.5" />
                <span>{clubName}</span>
                <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
                <span>GST/UIN: 27AABCA1234F1Z9</span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
                viewStyle === 'tally_classic'
                  ? 'text-white'
                  : isDarkMode
                    ? 'text-white'
                    : 'text-slate-900'
              }`}>
                <span>{customer.name}</span>
                <span className={`text-xs font-mono font-normal px-2 py-0.5 rounded-full border ${
                  viewStyle === 'tally_classic'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  Account Ledger (Dr/Cr)
                </span>
              </h1>
              <p className={`text-xs font-mono flex items-center gap-3 ${
                viewStyle === 'tally_classic'
                  ? 'text-slate-400'
                  : isDarkMode
                    ? 'text-slate-400'
                    : 'text-slate-600'
              }`}>
                <span>WhatsApp: {formatWhatsAppDisplay(customer.whatsapp)}</span>
                <span>•</span>
                <span>Visits: {customer.totalVisits}</span>
                <span>•</span>
                <span>LTV: ₹{customer.lifetimeValue.toLocaleString('en-IN')}</span>
              </p>
            </div>

            {/* Right: Closing Balance Box & Fast Settle Action */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className={`p-3 rounded-xl border font-mono text-right min-w-[170px] ${
                viewStyle === 'tally_classic'
                  ? 'bg-[#073642] border-[#2aa198]/40'
                  : isDarkMode
                    ? 'bg-slate-900 border-slate-800 shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className={`text-[10px] uppercase font-bold ${
                  viewStyle === 'tally_classic'
                    ? 'text-slate-400'
                    : isDarkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                }`}>
                  Closing Net Balance
                </div>
                <div className={`text-xl font-black mt-0.5 ${
                  isDebitDue 
                    ? 'text-rose-500' 
                    : netClosingBalance > 0 
                      ? 'text-emerald-500' 
                      : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  ₹{Math.abs(netClosingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {netClosingBalance < 0 ? 'Dr' : netClosingBalance > 0 ? 'Cr' : ''}
                </div>
                <div className={`text-[10px] ${
                  viewStyle === 'tally_classic'
                    ? 'text-slate-400'
                    : isDarkMode
                      ? 'text-slate-400'
                      : 'text-slate-600'
                }`}>
                  {isDebitDue ? '⚠️ Debit Receivable' : netClosingBalance > 0 ? '✅ Advance Credit' : 'Account Settled'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                {isDebitDue && (
                  <button
                    type="button"
                    onClick={() => onOpenSettleModal(customer, Math.abs(netClosingBalance))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center justify-center gap-1.5 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>F6 : Record Receipt</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  {isDebitDue && (
                    <button
                      type="button"
                      onClick={() => setIsQrOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1 transition"
                      title="Show Dynamic UPI QR"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI QR</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleShareWhatsAppStatement}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition ${
                      viewStyle === 'tally_classic'
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isDarkMode
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}
                    title="Send Tally Statement on WhatsApp"
                  >
                    <MessageSquare className={`w-3.5 h-3.5 ${isDarkMode || viewStyle === 'tally_classic' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => printDocumentElement('tally-printable-statement')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition cursor-pointer ${
                      viewStyle === 'tally_classic'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="Print Tally A4 Statement"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            viewStyle === 'tally_classic' 
              ? 'border-[#073642]' 
              : isDarkMode 
                ? 'border-slate-800/80' 
                : 'border-slate-200'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search game, table, voucher no, Red Bull, coffee, note..."
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none ${
                  viewStyle === 'tally_classic'
                    ? 'bg-[#073642] border-[#2aa198]/30 text-white focus:border-[#2aa198]'
                    : isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 shadow-xs'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-2 transition ${
                    isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className={`mr-1 flex items-center gap-1 ${
                isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {(['ALL', 'DEBITS', 'CREDITS', 'PENDING'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    typeFilter === f
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : viewStyle === 'tally_classic'
                        ? 'bg-[#073642] text-slate-400 hover:text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {f === 'ALL' && 'All Vouchers'}
                  {f === 'DEBITS' && 'Debits Only (Dr)'}
                  {f === 'CREDITS' && 'Credits Only (Cr)'}
                  {f === 'PENDING' && 'Pending Due'}
                </button>
              ))}

              <div className={`h-4 w-px mx-1 hidden sm:block ${
                viewStyle === 'tally_classic' ? 'bg-[#073642]' : isDarkMode ? 'bg-slate-800' : 'bg-slate-300'
              }`} />

              {(['ALL', 'THIS_MONTH', 'LAST_7_DAYS'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    dateFilter === d
                      ? 'bg-amber-600 text-white shadow-xs'
                      : viewStyle === 'tally_classic'
                        ? 'bg-[#073642] text-slate-400 hover:text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {d === 'ALL' && 'All Dates'}
                  {d === 'THIS_MONTH' && 'This Month'}
                  {d === 'LAST_7_DAYS' && '7 Days'}
                </button>
              ))}

              <div className={`h-4 w-px mx-1 hidden sm:block ${
                viewStyle === 'tally_classic' ? 'bg-[#073642]' : isDarkMode ? 'bg-slate-800' : 'bg-slate-300'
              }`} />

              {/* Show All Audit Details Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowAllDetails(!showAllDetails);
                  setCollapsedRowIds(new Set());
                  setExpandedRowIds(new Set());
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition border ${
                  showAllDetails
                    ? viewStyle === 'tally_classic'
                      ? 'bg-[#2aa198]/20 text-[#2aa198] border-[#2aa198]/50 shadow-xs'
                      : 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : viewStyle === 'tally_classic'
                      ? 'bg-[#073642] text-slate-400 border-[#2aa198]/20 hover:text-white'
                      : isDarkMode
                        ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle full table metrics, cafe items, hourly rates, and split audit for all rows"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{showAllDetails ? 'All Audit Details: ON' : 'Show Audit Details'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TALLY LEDGER GRID TABLE */}
        <div id="tally-printable-statement" className={`flex-1 overflow-y-auto font-mono text-xs select-text ${
          viewStyle === 'tally_classic' ? 'bg-[#002b36]' : isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <table className="w-full border-collapse">
            {/* Tally Columns */}
            <thead className={`sticky top-0 z-10 text-[11px] uppercase tracking-wider border-b ${
              viewStyle === 'tally_classic'
                ? 'bg-[#073642] text-[#2aa198] border-[#002b36]'
                : isDarkMode
                  ? 'bg-slate-950 text-slate-300 border-slate-800'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <tr>
                <th className="py-2.5 px-3 text-left w-28 font-bold">Date & Time</th>
                <th className="py-2.5 px-3 text-left font-bold">Particulars & Audit Breakdown</th>
                <th className="py-2.5 px-3 text-center w-28 font-bold">Vch Type</th>
                <th className="py-2.5 px-3 text-center w-28 font-bold">Vch No.</th>
                <th className="py-2.5 px-3 text-right w-28 font-bold">Debit (Dr ₹)</th>
                <th className="py-2.5 px-3 text-right w-28 font-bold">Credit (Cr ₹)</th>
                <th className="py-2.5 px-3 text-right w-32 font-bold">Balance (₹)</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${
              viewStyle === 'tally_classic' 
                ? 'divide-[#073642]/60' 
                : isDarkMode 
                  ? 'divide-slate-800/60' 
                  : 'divide-slate-200'
            }`}>
              {/* Opening Balance Row */}
              <tr className={`${
                viewStyle === 'tally_classic' 
                  ? 'bg-[#00212b]/60 text-slate-400' 
                  : isDarkMode 
                    ? 'bg-slate-950/40 text-slate-400' 
                    : 'bg-slate-50/80 text-slate-500'
              } italic`}>
                <td className="py-2 px-3">01-Apr-2026</td>
                <td className={`py-2 px-3 font-semibold ${
                  viewStyle === 'tally_classic' ? 'text-slate-300' : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`} colSpan={3}>
                  To Opening Balance (B/F)
                </td>
                <td className="py-2 px-3 text-right">-</td>
                <td className="py-2 px-3 text-right">-</td>
                <td className={`py-2 px-3 text-right font-bold ${
                  viewStyle === 'tally_classic' ? 'text-slate-300' : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>₹0.00</td>
              </tr>

              {/* Transactions List */}
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-12 text-center italic ${
                    isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => {
                  const isExpanded = showAllDetails ? !collapsedRowIds.has(row.id) : expandedRowIds.has(row.id);
                  const isNonSessionCredit = row.creditAmount > 0 || row.type === 'CREDIT_PAYMENT' || (!row.sessionId && !row.assetName && row.type !== 'DEBIT_SESSION' && row.type !== 'DEBIT_BAR');
                  const paymentMethod = row.paymentMethod === 'Cash' ? 'Cash' : 'UPI';
                  const dateObj = new Date(row.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <React.Fragment key={row.id}>
                      <tr 
                        onClick={() => toggleRow(row.id)}
                        className={`transition cursor-pointer group ${
                          isExpanded 
                            ? viewStyle === 'tally_classic' 
                              ? 'bg-[#073642]/80' 
                              : isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-50/70'
                            : viewStyle === 'tally_classic'
                              ? 'hover:bg-[#073642]/40'
                              : isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* 1. Date & Time */}
                        <td className="py-2.5 px-3 align-top whitespace-nowrap">
                          <div className={`font-semibold ${
                            viewStyle === 'tally_classic' ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>{formattedDate}</div>
                          <div className={`text-[10px] ${
                            viewStyle === 'tally_classic' ? 'text-slate-400' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{formattedTime}</div>
                        </td>

                        {/* 2. Particulars & Summary */}
                        <td className="py-2.5 px-3 align-top">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className={`font-bold flex items-center gap-1.5 ${
                                viewStyle === 'tally_classic' ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {row.debitAmount > 0 ? (
                                  <span className={viewStyle === 'tally_classic' || isDarkMode ? 'text-amber-400 font-extrabold' : 'text-amber-700 font-extrabold'}>To</span>
                                ) : (
                                  <span className={viewStyle === 'tally_classic' || isDarkMode ? 'text-emerald-400 font-extrabold' : 'text-emerald-700 font-extrabold'}>By</span>
                                )}
                                <span>
                                  {isNonSessionCredit
                                    ? `Payment Received (${paymentMethod})`
                                    : (row.assetName || row.description)}
                                </span>
                              </div>

                              {/* Quick summary badges for session/bar rows vs simplified receipt */}
                              {!isNonSessionCredit ? (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                  {row.gameShare ? (
                                    <span className={`px-1.5 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                                      isDarkMode || viewStyle === 'tally_classic'
                                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}>
                                      <Gamepad2 className="w-2.5 h-2.5" />
                                      Game ₹{row.gameShare} ({row.durationMinutes || 0}m)
                                    </span>
                                  ) : null}

                                  {row.barShare ? (
                                    <span className={`px-1.5 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                                      isDarkMode || viewStyle === 'tally_classic'
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}>
                                      <Coffee className="w-2.5 h-2.5" />
                                      Bar ₹{row.barShare}
                                    </span>
                                  ) : null}

                                  {row.splitRule ? (
                                    <span className={`px-1.5 py-0.5 rounded font-semibold border ${
                                      row.isLoser
                                        ? isDarkMode || viewStyle === 'tally_classic'
                                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                                          : 'bg-rose-50 text-rose-700 border-rose-200'
                                        : isDarkMode || viewStyle === 'tally_classic'
                                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {row.splitRule.replace(/_/g, ' ')}
                                      {row.isLoser && ' ⚠️ Loser'}
                                    </span>
                                  ) : null}

                                  {row.status === 'PENDING' && (
                                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                                      isDarkMode || viewStyle === 'tally_classic'
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                    }`}>
                                      UNSETTLED
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1 text-[10px]">
                                  <span className={`px-1.5 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                                    isDarkMode || viewStyle === 'tally_classic'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                    Receipt • {paymentMethod}
                                  </span>
                                </div>
                              )}
                            </div>

                            <button 
                              type="button" 
                              className={`p-1 rounded transition ${
                                isDarkMode || viewStyle === 'tally_classic'
                                  ? 'text-slate-400 group-hover:text-white'
                                  : 'text-slate-400 group-hover:text-slate-800'
                              }`}
                              title="Toggle Full Audit Details"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* 3. Voucher Type */}
                        <td className="py-2.5 px-3 align-top text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.type === 'DEBIT_SESSION'
                              ? isDarkMode || viewStyle === 'tally_classic' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : row.type === 'DEBIT_BAR'
                                ? isDarkMode || viewStyle === 'tally_classic' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                : isDarkMode || viewStyle === 'tally_classic' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {row.type === 'DEBIT_SESSION' && 'Session'}
                            {row.type === 'DEBIT_BAR' && 'POS Cafe'}
                            {isNonSessionCredit && 'Receipt'}
                          </span>
                        </td>

                        {/* 4. Voucher Number */}
                        <td className={`py-2.5 px-3 align-top text-center font-mono whitespace-nowrap ${
                          viewStyle === 'tally_classic' ? 'text-slate-300' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {row.voucherNo || (isNonSessionCredit ? 'PAYMENT' : 'BILL')}
                        </td>

                        {/* 5. Debit (Dr ₹) */}
                        <td className={`py-2.5 px-3 align-top text-right font-mono font-bold whitespace-nowrap ${
                          viewStyle === 'tally_classic' || isDarkMode ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          {row.debitAmount > 0 ? `₹${row.debitAmount.toFixed(2)}` : '-'}
                        </td>

                        {/* 6. Credit (Cr ₹) */}
                        <td className={`py-2.5 px-3 align-top text-right font-mono font-bold whitespace-nowrap ${
                          viewStyle === 'tally_classic' || isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                          {row.creditAmount > 0 ? `₹${row.creditAmount.toFixed(2)}` : '-'}
                        </td>

                        {/* 7. Running Balance */}
                        <td className="py-2.5 px-3 align-top text-right font-mono font-bold whitespace-nowrap">
                          <span className={
                            row.runningBalance < 0
                              ? 'text-rose-500'
                              : row.runningBalance > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }>
                            ₹{Math.abs(row.runningBalance).toFixed(2)} {row.balanceType}
                          </span>
                        </td>
                      </tr>

                      {/* EXPANDED FULL TALLY AUDIT DETAILS */}
                      {isExpanded && (
                        <tr className={`${
                          viewStyle === 'tally_classic' 
                            ? 'bg-[#00212b] border-[#073642]' 
                            : isDarkMode 
                              ? 'bg-slate-950 border-slate-800' 
                              : 'bg-slate-50/90 border-slate-200'
                        } border-b`}>
                          <td colSpan={7} className="p-4 pl-12 text-xs space-y-3">
                            {isNonSessionCredit ? (
                              /* Simplified Payment Receipt Card - showing only date, time, method (Cash or UPI), and amount */
                              <div className={`p-4 rounded-xl border font-sans max-w-md ${
                                viewStyle === 'tally_classic'
                                  ? 'bg-[#073642]/90 border-[#2aa198]/30'
                                  : isDarkMode
                                    ? 'bg-slate-900/90 border-slate-800'
                                    : 'bg-white border-slate-200 shadow-xs'
                              }`}>
                                <div className={`text-[11px] uppercase tracking-wider font-bold flex items-center justify-between pb-2.5 mb-3 border-b ${
                                  viewStyle === 'tally_classic'
                                    ? 'border-[#2aa198]/30 text-emerald-400'
                                    : isDarkMode
                                      ? 'border-slate-800 text-emerald-400'
                                      : 'border-slate-100 text-emerald-700'
                                }`}>
                                  <div className="flex items-center gap-1.5">
                                    <Receipt className="w-4 h-4 text-emerald-500" />
                                    <span>Payment Receipt</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    viewStyle === 'tally_classic' || isDarkMode
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {paymentMethod}
                                  </span>
                                </div>

                                <div className={`grid grid-cols-2 gap-y-3 gap-x-4 text-xs ${
                                  isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  <div>
                                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date</span>
                                    <span className="font-medium font-mono">{formattedDate}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Time</span>
                                    <span className="font-medium font-mono">{formattedTime}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Method</span>
                                    <span className={`font-bold ${
                                      isDarkMode || viewStyle === 'tally_classic' ? 'text-emerald-300' : 'text-emerald-700'
                                    }`}>
                                      {paymentMethod}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Amount</span>
                                    <span className={`font-mono font-bold text-sm ${
                                      isDarkMode || viewStyle === 'tally_classic' ? 'text-emerald-400' : 'text-emerald-600'
                                    }`}>
                                      ₹{row.creditAmount.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Game Session or Cafe Order Audit Grid */
                              <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl border font-sans ${
                                viewStyle === 'tally_classic'
                                  ? 'bg-[#073642]/90 border-[#2aa198]/30'
                                  : isDarkMode
                                    ? 'bg-slate-900/90 border-slate-800'
                                    : 'bg-white border-slate-200 shadow-xs'
                              }`}>
                                {/* Box 1: Game & Asset Info */}
                                <div className="space-y-1.5">
                                  <div className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                                    isDarkMode || viewStyle === 'tally_classic' ? 'text-indigo-400' : 'text-indigo-600'
                                  }`}>
                                    <Gamepad2 className="w-3.5 h-3.5" />
                                    {row.type === 'DEBIT_BAR' && !row.assetName ? 'Cafe & Order Info' : 'Game & Table Metrics'}
                                  </div>
                                  <div className={`space-y-0.5 text-xs ${
                                    isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    {row.assetName ? (
                                      <>
                                        <div><span className="text-slate-500">Asset:</span> <span className={`font-semibold ${isDarkMode || viewStyle === 'tally_classic' ? 'text-white' : 'text-slate-900'}`}>{row.assetName}</span></div>
                                        <div><span className="text-slate-500">Category:</span> {row.assetCategory || 'Snooker/Pool'}</div>
                                        <div><span className="text-slate-500">Duration:</span> <span className={`font-mono font-bold ${isDarkMode || viewStyle === 'tally_classic' ? 'text-indigo-300' : 'text-indigo-600'}`}>{row.durationMinutes || 0} mins</span></div>
                                        <div><span className="text-slate-500">Hourly Rate:</span> ₹{row.hourlyRate || 0}/hr</div>
                                        <div><span className="text-slate-500">Total Table Cost:</span> ₹{row.totalGameCost || row.gameShare || 0}</div>
                                        <div><span className="text-slate-500">Player Game Share:</span> <span className={`font-mono font-bold ${isDarkMode || viewStyle === 'tally_classic' ? 'text-amber-400' : 'text-amber-700'}`}>₹{row.gameShare || 0}</span></div>
                                      </>
                                    ) : (
                                      <>
                                        <div><span className="text-slate-500">Category:</span> Cafe & Refreshments POS</div>
                                        <div><span className="text-slate-500">Order Source:</span> Direct Counter Service</div>
                                        <div><span className="text-slate-500">Total Bill:</span> <span className={`font-mono font-bold ${isDarkMode || viewStyle === 'tally_classic' ? 'text-amber-400' : 'text-amber-700'}`}>₹{row.totalBarCost || row.amount}</span></div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Box 2: Bar / Cafe Orders */}
                                <div className="space-y-1.5">
                                  <div className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                                    isDarkMode || viewStyle === 'tally_classic' ? 'text-amber-400' : 'text-amber-700'
                                  }`}>
                                    <Coffee className="w-3.5 h-3.5" />
                                    Bar & Snacks Consumed
                                  </div>
                                  {row.barItemsSummary && row.barItemsSummary.length > 0 ? (
                                    <div className="space-y-1 text-xs">
                                      <ul className={`space-y-0.5 ${isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {row.barItemsSummary.map((item, i) => (
                                          <li key={i} className="flex justify-between">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className={`font-mono ${isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-400' : 'text-slate-600'}`}>₹{item.price * item.quantity}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className={`pt-1 border-t flex justify-between font-bold ${
                                        isDarkMode || viewStyle === 'tally_classic' ? 'border-slate-800' : 'border-slate-200'
                                      }`}>
                                        <span className={isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-400' : 'text-slate-600'}>Player Bar Share:</span>
                                        <span className={`font-mono ${isDarkMode || viewStyle === 'tally_classic' ? 'text-amber-400' : 'text-amber-700'}`}>₹{row.barShare || 0}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className={`italic text-xs ${
                                      isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                      No bar or snack items ordered during this session.
                                    </div>
                                  )}
                                </div>

                                {/* Box 3: Split Rule, Match Outcome & Settlement Status */}
                                <div className="space-y-1.5">
                                  <div className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                                    isDarkMode || viewStyle === 'tally_classic' ? 'text-emerald-400' : 'text-emerald-700'
                                  }`}>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Split Rule & Voucher Audit
                                  </div>
                                  <div className={`space-y-0.5 text-xs ${
                                    isDarkMode || viewStyle === 'tally_classic' ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    <div><span className="text-slate-500">Game Split:</span> <span className={`font-semibold ${isDarkMode || viewStyle === 'tally_classic' ? 'text-white' : 'text-slate-900'}`}>{row.splitRule?.replace(/_/g, ' ') || 'Standard'}</span></div>
                                    <div><span className="text-slate-500">Bar Split:</span> {row.barSplitRule?.replace(/_/g, ' ') || 'Equal Share'}</div>
                                    {row.isLoser !== undefined && (
                                      <div>
                                        <span className="text-slate-500">Match Outcome:</span>{' '}
                                        <span className={row.isLoser ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                          {row.isLoser ? '⚠️ Conceded / Loser (Paid Game & Bar)' : 'Winner / Shared'}
                                        </span>
                                      </div>
                                    )}
                                    {row.coPlayers && row.coPlayers.length > 0 && (
                                      <div><span className="text-slate-500">Tagged Co-Players:</span> {row.coPlayers.join(', ')}</div>
                                    )}
                                    {row.settlementRef && (
                                      <div><span className="text-slate-500">Txn Reference:</span> <span className={`font-mono ${isDarkMode || viewStyle === 'tally_classic' ? 'text-emerald-300' : 'text-emerald-700 font-bold'}`}>{row.settlementRef}</span></div>
                                    )}
                                    {row.notes && (
                                      <div className={`text-[11px] italic mt-1 p-1.5 rounded border ${
                                        viewStyle === 'tally_classic'
                                          ? 'bg-[#00212b] border-[#2aa198]/30 text-slate-300'
                                          : isDarkMode
                                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                                            : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}>
                                        "{row.notes}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* TALLY DOUBLE UNDERLINE TOTALS FOOTER */}
            <tfoot className={`font-mono font-bold text-xs ${
              viewStyle === 'tally_classic' 
                ? 'bg-[#00212b] text-white' 
                : isDarkMode 
                  ? 'bg-slate-950 text-white' 
                  : 'bg-slate-100 text-slate-900'
            }`}>
              {/* Grand Totals */}
              <tr className={`border-t-2 ${
                viewStyle === 'tally_classic' ? 'border-[#073642]' : isDarkMode ? 'border-slate-700' : 'border-slate-300'
              }`}>
                <td className="py-2.5 px-3 text-left" colSpan={4}>
                  TOTAL (Current Period)
                </td>
                <td className={`py-2.5 px-3 text-right font-mono font-black border-t-2 border-b-2 ${
                  viewStyle === 'tally_classic' 
                    ? 'text-amber-400 border-[#073642]' 
                    : isDarkMode 
                      ? 'text-amber-400 border-slate-700' 
                      : 'text-amber-700 border-slate-300'
                }`}>
                  ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={`py-2.5 px-3 text-right font-mono font-black border-t-2 border-b-2 ${
                  viewStyle === 'tally_classic' 
                    ? 'text-emerald-400 border-[#073642]' 
                    : isDarkMode 
                      ? 'text-emerald-400 border-slate-700' 
                      : 'text-emerald-700 border-slate-300'
                }`}>
                  ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={`py-2.5 px-3 text-right font-mono font-black border-t-2 border-b-2 ${
                  viewStyle === 'tally_classic' ? 'border-[#073642]' : isDarkMode ? 'border-slate-700' : 'border-slate-300'
                }`}>
                  <span className={isDebitDue ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                    ₹{Math.abs(netClosingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {netClosingBalance < 0 ? 'Dr' : netClosingBalance > 0 ? 'Cr' : ''}
                  </span>
                </td>
              </tr>

              {/* Tally Closing Net Line with Double Border */}
              <tr className={`border-b-4 border-double ${
                viewStyle === 'tally_classic'
                  ? 'border-[#2aa198]/40 bg-[#073642]/60'
                  : isDarkMode
                    ? 'border-slate-600 bg-slate-900/50'
                    : 'border-slate-400 bg-slate-200/60'
              }`}>
                <td className={`py-2 px-3 text-left font-extrabold ${
                  viewStyle === 'tally_classic' ? 'text-slate-300' : isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`} colSpan={4}>
                  By Closing Balance (C/F)
                </td>
                <td className="py-2 px-3 text-right" colSpan={2}>
                  {netClosingBalance < 0 ? 'Debit Balance Due' : 'Advance Credit'}
                </td>
                <td className={`py-2 px-3 text-right font-black ${
                  isDebitDue ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  ₹{Math.abs(netClosingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {netClosingBalance < 0 ? 'Dr' : 'Cr'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BOTTOM AUDIT & FAST ACTIONS FOOTER */}
        <div className={`p-3 sm:p-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
          viewStyle === 'tally_classic'
            ? 'bg-[#00212b] border-[#073642]'
            : isDarkMode
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 font-mono text-[11px] ${
            viewStyle === 'tally_classic' ? 'text-slate-400' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Double-Entry Tally Compliant • Click any transaction row to expand full game & F&B audit details.</span>
          </div>

          <div className="flex items-center gap-2">
            {isDebitDue && (
              <button
                type="button"
                onClick={() => onOpenSettleModal(customer, Math.abs(netClosingBalance))}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Settle Full Due (₹{Math.abs(netClosingBalance)})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                viewStyle === 'tally_classic'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>

      {/* DYNAMIC UPI QR MODAL */}
      {isQrOpen && (
        <UpiQrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          amount={Math.abs(netClosingBalance)}
          upiId={upiId}
          clubName={clubName}
          customerName={customer.name}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
