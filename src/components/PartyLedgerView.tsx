import React, { useState, useMemo } from 'react';
import { createShortPayToken, getClubSlug } from '../utils/payToken';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  CreditCard, 
  Banknote, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ExternalLink,
  ChevronRight,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  X
} from 'lucide-react';
import { CustomerPlayer, ClubProfile, LedgerEntry, PaymentMethod, BillRecord } from '../types';
import { getLocalDateString } from '../utils/billing';
import { PartyLedgerPrintModal } from './PartyLedgerPrintModal';

interface PartyLedgerViewProps {
  customer: CustomerPlayer;
  clubProfile: ClubProfile;
  entries: LedgerEntry[];
  bills?: BillRecord[];
  onBack: () => void;
  onSettleBalance: (customerId: string, amount: number, method: PaymentMethod, reference?: string) => void;
  onViewBill?: (bill: BillRecord) => void;
  isDarkMode: boolean;
  isReadOnly?: boolean;
}

type TypeFilter = 'all' | 'debit' | 'credit';
type TimeFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_30_days';

export const PartyLedgerView: React.FC<PartyLedgerViewProps> = ({
  customer,
  clubProfile,
  entries,
  bills = [],
  onBack,
  onSettleBalance,
  onViewBill,
  isDarkMode,
  isReadOnly = false,
}) => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payReference, setPayReference] = useState('');

  // Filter entries for this specific customer
  const customerEntries = useMemo(() => {
    return entries.filter(e => e.customerId === customer.id);
  }, [entries, customer.id]);

  // Compute chronologically sorted running balances (oldest to newest)
  const sortedChronological = useMemo(() => {
    return [...customerEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [customerEntries]);

  // Calculate totals and running balances
  const { processedEntries, totalDebits, totalCredits, netClosingBalance } = useMemo(() => {
    let running = 0;
    let debits = 0;
    let credits = 0;

    const list = sortedChronological.map((entry, idx) => {
      const isDebit = entry.type === 'DEBIT_SESSION' || entry.type === 'DEBIT_BAR' || entry.type === 'DEBIT' || entry.type === 'GAME' || entry.type === 'CAFE';
      const amount = Number(entry.amount) || 0;
      if (isDebit) {
        running += amount;
        debits += amount;
      } else {
        running -= amount;
        credits += amount;
      }
      return {
        ...entry,
        isDebit,
        runningBalance: running,
        index: idx + 1,
      };
    });

    return {
      processedEntries: list,
      totalDebits: debits,
      totalCredits: credits,
      netClosingBalance: running,
    };
  }, [sortedChronological]);

  // Apply search, type, and time filters (display order newest first)
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return [...processedEntries]
      .reverse() // show newest on top for daily operations
      .filter((entry) => {
        // 1. Type filter
        if (typeFilter === 'debit' && !entry.isDebit) return false;
        if (typeFilter === 'credit' && entry.isDebit) return false;

        // 2. Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchVoucher = entry.voucherNo?.toLowerCase().includes(q);
          const matchDesc = entry.description?.toLowerCase().includes(q);
          const matchAsset = entry.assetName?.toLowerCase().includes(q);
          if (!matchVoucher && !matchDesc && !matchAsset) return false;
        }

        // 3. Time filter
        const entryDate = new Date(entry.timestamp);
        const entryDateStr = entry.timestamp.split('T')[0];

        if (timeFilter === 'today' && entryDateStr !== todayStr) return false;
        if (timeFilter === 'yesterday' && entryDateStr !== yesterdayStr) return false;
        if (timeFilter === 'this_week' && entryDate < weekAgo) return false;
        if (timeFilter === 'this_month' && entryDate < firstDayOfMonth) return false;
        if (timeFilter === 'last_30_days' && entryDate < monthAgo) return false;

        return true;
      });
  }, [processedEntries, typeFilter, searchQuery, timeFilter]);

  const isDue = netClosingBalance > 0;

  // Open quick payment modal with full outstanding balance pre-filled
  const handleOpenPayModal = () => {
    setPayAmount(Math.max(0, netClosingBalance).toString());
    setPayMethod('UPI');
    setPayReference(`Settlement ${new Date().toLocaleDateString('en-IN')}`);
    setIsPayModalOpen(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    onSettleBalance(customer.id, amt, payMethod, payReference.trim() || undefined);
    setIsPayModalOpen(false);
  };

  const handleShareWhatsApp = () => {
    const rawPhone = customer.whatsapp ? customer.whatsapp.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const upiId = clubProfile.upiId || 'justclub@upi';
    const clubName = clubProfile.businessName || 'JustClub OS';
    const amountDue = Math.max(0, netClosingBalance);
    const paymentRedirectUrl = clubProfile.paymentSlug && clubProfile.paymentSlug.trim()
      ? `https://justclub.in/p/${clubProfile.paymentSlug.trim()}/${amountDue}`
      : `https://justclub.in/p/${createShortPayToken(upiId, amountDue, clubName)}`;

    let message = 
      `*Statement of Account: ${customer.name}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏢 *${clubName}*\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer:* ${customer.name}\n` +
      `📞 *Phone:* ${customer.whatsapp || 'N/A'}\n\n` +
      `📊 *Account Ledger Summary:*\n` +
      `• *Total Billed (Debits):* ₹${totalDebits.toLocaleString('en-IN')}\n` +
      `• *Total Paid (Credits):* ₹${totalCredits.toLocaleString('en-IN')}\n` +
      `• *Current Balance Due:* ₹${amountDue.toLocaleString('en-IN')} ${isDue ? 'DR (You Owe)' : 'CR (Clear/Advance)'}\n\n`;

    if (isDue && amountDue > 0) {
      message += 
        `💳 *Pay Securely via UPI:* \n` +
        `${paymentRedirectUrl}\n\n` +
        `_Click the secure link above to pay directly via GPay, PhonePe, Paytm or BHIM._\n\n`;
    }

    message += `_Thank you for visiting ${clubName}!_`;

    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Find corresponding BillRecord for this entry, or synthesize from rich ledger metadata
  const findMatchingBill = (entry: LedgerEntry): BillRecord | undefined => {
    // 1. Direct Session ID match
    if (entry.sessionId) {
      const bySession = bills.find(b => b.sessionId === entry.sessionId || b.id === entry.sessionId);
      if (bySession) return bySession;
    }

    // 2. Direct Bill No or Voucher No match
    if (entry.voucherNo) {
      const vchLower = entry.voucherNo.toLowerCase();
      const byBillNo = bills.find(b => 
        b.billNo.toLowerCase() === vchLower ||
        b.voucherNo?.toLowerCase() === vchLower
      );
      if (byBillNo) return byBillNo;

      // 3. Match by numeric digits in voucher (e.g. 8472 in VCH-SESS-8472 matching BILL-2026-8472)
      const numMatch = entry.voucherNo.match(/\d+/);
      if (numMatch && numMatch[0].length >= 3) {
        const numStr = numMatch[0];
        const byNum = bills.find(b => 
          b.billNo.includes(numStr) || 
          b.sessionId.includes(numStr) || 
          (b.voucherNo && b.voucherNo.includes(numStr))
        );
        if (byNum) return byNum;
      }
    }

    // 4. Synthesize complete BillRecord on-the-fly from rich LedgerEntry metadata
    // Ensures vouchers (e.g., VCH-SESS-8472) always reliably open the complete bill & invoice modal!
    if (entry.type === 'DEBIT_SESSION' || entry.type === 'DEBIT_BAR') {
      const isSession = entry.type === 'DEBIT_SESSION';
      const duration = entry.durationMinutes || 60;
      const gameCost = entry.totalGameCost ?? (isSession ? entry.amount : 0);
      const barCost = entry.totalBarCost ?? (!isSession ? entry.amount : (entry.barShare || 0));
      const grandTotal = Math.max(entry.amount, gameCost + barCost);

      const endTime = entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString();
      const startTime = new Date(new Date(endTime).getTime() - duration * 60000).toISOString();

      const playersList = [
        { id: entry.customerId, name: entry.customerName, whatsapp: entry.customerPhone },
        ...(entry.coPlayers || []).map((cpName, idx) => ({
          id: `coplayer_${idx}`,
          name: cpName,
          whatsapp: ''
        }))
      ];

      const synthesizedBill: BillRecord = {
        id: `bill_${entry.sessionId || entry.id}`,
        billNo: entry.voucherNo && entry.voucherNo.startsWith('BILL-')
          ? entry.voucherNo
          : (entry.voucherNo?.startsWith('VCH-') 
              ? entry.voucherNo.replace('VCH-SESS-', 'BILL-').replace('VCH-POS-', 'BILL-')
              : (entry.voucherNo || `BILL-${Math.floor(100 + Math.random() * 900)}`)),
        voucherNo: entry.voucherNo,
        sessionId: entry.sessionId || `sess_${entry.id}`,
        assetName: entry.assetName || (isSession ? 'Championship Gaming Arena' : 'Club Cafe & Lounge'),
        category: (entry.assetCategory as any) || 'Billiards',
        gameType: entry.assetName || (isSession ? 'Snooker & Pool Session' : 'Bar & Cafe Order'),
        matchType: (entry.matchType as any) || (playersList.length > 1 ? (playersList.length === 2 ? '1v1' : '2v2') : 'Solo'),
        hourlyRate: entry.hourlyRate || 360,
        billingIncrement: '15min',
        startTime,
        endTime,
        durationMinutes: duration,
        totalPausedDuration: 0,
        totalGameCost: gameCost,
        totalBarCost: barCost,
        discount: 0,
        grandTotal,
        players: playersList,
        gameSplitRule: (entry.splitRule as any) || (entry.isLoser ? '1v1_loser_pays' : 'standard'),
        barSplitRule: (entry.barSplitRule as any) || 'link_to_game_loser',
        losingPlayerIds: entry.isLoser ? [entry.customerId] : [],
        winningPlayerIds: entry.isLoser ? playersList.filter(p => p.id !== entry.customerId).map(p => p.id) : [],
        shares: [
          {
            playerId: entry.customerId,
            playerName: entry.customerName,
            whatsapp: entry.customerPhone,
            gameShare: entry.gameShare ?? (isSession ? entry.amount : 0),
            barShare: entry.barShare ?? (!isSession ? entry.amount : 0),
            totalShare: entry.amount,
            paymentMethod: entry.paymentMethod || 'Ledger',
            isSettled: entry.status === 'SETTLED',
            isLoser: entry.isLoser,
            notes: entry.notes || entry.description,
          },
          ...(entry.coPlayers || []).map((cpName, idx) => ({
            playerId: `coplayer_${idx}`,
            playerName: cpName,
            whatsapp: '',
            gameShare: 0,
            barShare: 0,
            totalShare: 0,
            paymentMethod: 'Ledger' as PaymentMethod,
            isSettled: true,
            isWinner: entry.isLoser,
            notes: 'Co-player',
          }))
        ],
        barItemsSummary: entry.barItemsSummary && entry.barItemsSummary.length > 0 
          ? entry.barItemsSummary 
          : (barCost > 0 ? [{ name: 'Lounge Beverages & Snacks', quantity: 1, price: barCost }] : []),
        status: entry.status === 'SETTLED' ? 'SETTLED' : 'UNSETTLED',
        timestamp: entry.timestamp,
        notes: entry.description || (entry.isLoser ? 'Billed per 1v1 Loser Pays rule' : 'Session ledger charge'),
      };

      return synthesizedBill;
    }

    // 5. Payment receipt fallback
    if (entry.type === 'CREDIT_PAYMENT') {
      const synthesizedReceipt: BillRecord = {
        id: `bill_rcpt_${entry.id}`,
        billNo: entry.voucherNo || `PAYMENT-${Math.floor(100 + Math.random() * 900)}`,
        voucherNo: entry.voucherNo,
        sessionId: entry.sessionId || `rcpt_${entry.id}`,
        assetName: 'Khata Payment Desk',
        category: 'Counter',
        gameType: 'Ledger Settlement Payment',
        matchType: 'Solo',
        hourlyRate: 0,
        startTime: entry.timestamp,
        endTime: entry.timestamp,
        durationMinutes: 0,
        totalGameCost: 0,
        totalBarCost: 0,
        discount: 0,
        grandTotal: entry.amount,
        players: [{ id: entry.customerId, name: entry.customerName, whatsapp: entry.customerPhone }],
        gameSplitRule: 'standard',
        barSplitRule: 'equal_share',
        losingPlayerIds: [],
        shares: [
          {
            playerId: entry.customerId,
            playerName: entry.customerName,
            whatsapp: entry.customerPhone,
            gameShare: 0,
            barShare: 0,
            totalShare: entry.amount,
            paymentMethod: entry.settledMethod || entry.paymentMethod || 'UPI',
            isSettled: true,
            notes: entry.notes || entry.settlementRef || 'Ledger credit payment received',
          }
        ],
        status: 'SETTLED',
        timestamp: entry.timestamp,
        notes: `Payment Ref: ${entry.settlementRef || entry.voucherNo || 'Cashier Counter'}`,
      };
      return synthesizedReceipt;
    }

    return undefined;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Left: Back Button & Customer Profile Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className={`p-2 sm:p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0 ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Back to Customer Directory"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight truncate">
                {customer.name}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                isDue
                  ? isDarkMode 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  : isDarkMode 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isDue ? `₹${netClosingBalance.toLocaleString('en-IN')} Due (DR)` : 'All Settled (NIL)'}
              </span>
            </div>
            
            <div className={`flex items-center gap-3 text-xs mt-0.5 flex-wrap ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                {customer.whatsapp || 'No Phone'}
              </span>
              <span>•</span>
              <span>Visits: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800 font-bold'}>{customer.totalVisits}</strong></span>
              <span>•</span>
              <span>Last: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800 font-bold'}>{customer.lastVisitedDate || 'Recent'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Primary Statement Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Share statement on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Print formal statement / export PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {!isReadOnly && isDue && (
            <button
              onClick={handleOpenPayModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Debits (Billed) */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-slate-900/60 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Total Billed (Debit)
            </span>
            <div className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDarkMode ? 'text-rose-400' : 'text-rose-600'
          }`}>
            ₹{totalDebits.toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Game session shares & cafe tab orders
          </p>
        </div>

        {/* Total Credits (Paid) */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-slate-900/60 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Total Paid (Credit)
            </span>
            <div className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            ₹{totalCredits.toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Settled payments via Cash & UPI
          </p>
        </div>

        {/* Net Outstanding Due */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode 
            ? isDue ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'
            : isDue ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${
              isDue ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {isDue ? "You'll Receive" : "Account Status"}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
              isDue 
                ? 'bg-rose-600 text-white' 
                : 'bg-emerald-600 text-white'
            }`}>
              {isDue ? 'DR (DUE)' : 'CLEAR'}
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDue ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            ₹{Math.abs(netClosingBalance).toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] mt-1 font-semibold ${isDue ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isDue ? 'Outstanding balance awaiting settlement' : 'Customer account has zero pending balance'}
          </p>
        </div>
      </div>

      {/* 3. FILTER, SEARCH & LAYOUT TOOLBAR */}
      <div className={`p-3 sm:p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            placeholder="Search voucher or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none transition ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {/* Type Filter */}
          <div className={`p-1 rounded-xl border flex items-center text-xs ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('debit')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                typeFilter === 'debit'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Debits (Dr)
            </button>
            <button
              onClick={() => setTypeFilter('credit')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                typeFilter === 'credit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Credits (Cr)
            </button>
          </div>

          {/* Time Filter Dropdown / Buttons */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:border-indigo-600'
            }`}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">Past 7 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>

          {/* View Mode Toggle */}
          <div className={`p-1 rounded-xl border flex items-center text-xs ml-auto sm:ml-0 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. STATEMENT TRANSACTIONS VIEW */}
      {filteredEntries.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Receipt className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>No transactions found</h3>
          <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No entries match your search or date filter. Clear filters to see complete history.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Khatabook / Tally style) */
        <div className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b font-extrabold uppercase text-[10px] tracking-wider ${
                  isDarkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <th className="py-3 px-4 w-28">Date & Time</th>
                  <th className="py-3 px-3 w-28">Voucher / Ref</th>
                  <th className="py-3 px-3 w-20">Type</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4 text-right w-28">Debit (₹)</th>
                  <th className="py-3 px-4 text-right w-28">Credit (₹)</th>
                  <th className="py-3 px-4 text-right w-28">Balance (₹)</th>
                  <th className="py-3 px-3 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                {filteredEntries.map((entry) => {
                  const matchingBill = findMatchingBill(entry);
                  const isDebit = entry.isDebit;

                  return (
                    <tr 
                      key={entry.id} 
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-indigo-50/40'
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {formatDate(entry.timestamp)}
                        </div>
                        <div className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatTime(entry.timestamp)}
                        </div>
                      </td>

                      {/* Voucher / Ref No - Clickable to open Session Bill */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs">
                        {matchingBill && onViewBill ? (
                          <button
                            type="button"
                            onClick={() => onViewBill(matchingBill)}
                            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                              isDarkMode 
                                ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-indigo-200 border-indigo-800/60 hover:border-indigo-500/70 shadow-xs' 
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border-indigo-200 hover:border-indigo-300 shadow-xs'
                            }`}
                            title={`Click to open session bill & invoice #${matchingBill.billNo}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="underline decoration-indigo-400/40 group-hover:decoration-indigo-400 underline-offset-2">
                              {entry.voucherNo || (entry.type === 'CREDIT_PAYMENT' ? 'PAYMENT' : 'BILL')}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            isDarkMode ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {entry.voucherNo || '-'}
                          </span>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          isDebit 
                            ? isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                            : isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                        }`}>
                          {entry.type === 'DEBIT_SESSION' 
                            ? 'GAME' 
                            : entry.type === 'DEBIT_BAR' 
                            ? 'CAFE' 
                            : 'PAYMENT'}
                        </span>
                      </td>

                      {/* Particulars & Description */}
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          {entry.description}
                        </div>
                        {entry.notes && (
                          <div className={`text-[10px] mt-0.5 italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {entry.notes}
                          </div>
                        )}
                      </td>

                      {/* Debit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs whitespace-nowrap">
                        {isDebit ? (
                          <span className={isDarkMode ? 'text-rose-400' : 'text-rose-600'}>
                            - ₹{entry.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>-</span>
                        )}
                      </td>

                      {/* Credit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs whitespace-nowrap">
                        {!isDebit ? (
                          <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>
                            + ₹{entry.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>-</span>
                        )}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs whitespace-nowrap">
                        <span className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>
                          ₹{Math.abs(entry.runningBalance).toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[9px] ml-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {entry.runningBalance >= 0 ? 'DR' : 'CR'}
                        </span>
                      </td>

                      {/* Action: 1-click View Bill */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {matchingBill && onViewBill ? (
                          <button
                            onClick={() => onViewBill(matchingBill)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition mx-auto cursor-pointer ${
                              isDarkMode 
                                ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400' 
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}
                            title="View complete session bill"
                          >
                            <span>Bill</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {entry.paymentMethod || 'Ledger'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW (Clean Mobile / Responsive Card View) */
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const matchingBill = findMatchingBill(entry);
            const isDebit = entry.isDebit;

            return (
              <div 
                key={entry.id}
                className={`p-4 rounded-2xl border shadow-xs transition-colors ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 border ${
                      isDebit 
                        ? isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
                        : isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {isDebit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {matchingBill && onViewBill ? (
                          <button
                            type="button"
                            onClick={() => onViewBill(matchingBill)}
                            className={`group inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                              isDarkMode 
                                ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-indigo-200 border-indigo-800/60' 
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border-indigo-200'
                            }`}
                            title={`Click to open session bill #${matchingBill.billNo}`}
                          >
                            <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="underline decoration-indigo-400/40 underline-offset-2">
                              {entry.voucherNo || 'ENTRY'}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isDarkMode ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {entry.voucherNo || 'ENTRY'}
                          </span>
                        )}
                        <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDate(entry.timestamp)} • {formatTime(entry.timestamp)}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {entry.description}
                      </h4>
                      {entry.notes && (
                        <p className={`text-[11px] mt-0.5 italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono text-base font-black ${
                      isDebit 
                        ? isDarkMode ? 'text-rose-400' : 'text-rose-600'
                        : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {isDebit ? '-' : '+'} ₹{entry.amount.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Bal: ₹{Math.abs(entry.runningBalance).toLocaleString('en-IN')} {entry.runningBalance >= 0 ? 'DR' : 'CR'}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                {matchingBill && onViewBill && (
                  <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Linked Session Bill #{matchingBill.billNo}
                    </span>
                    <button
                      onClick={() => onViewBill(matchingBill)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>View Full Bill</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. QUICK RECEIVE PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
            }`}>
              <div>
                <h3 className="text-sm font-bold">Receive Payment</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Credit payment into {customer.name}&apos;s ledger</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="p-5 space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono font-bold text-base outline-none transition ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                  }`}
                  placeholder="Enter amount"
                />
                <div className={`flex items-center justify-between mt-1 text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span>Current Outstanding:</span>
                  <span className={`font-mono font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                    ₹{Math.max(0, netClosingBalance).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      payMethod === 'UPI'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('Cash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      payMethod === 'Cash'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Reference / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                  }`}
                  placeholder="e.g. GPay UPI Ref 984029482"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. A4 PRINT STATEMENT & PDF MODAL */}
      {isPrintModalOpen && (
        <PartyLedgerPrintModal
          customer={customer}
          clubProfile={clubProfile}
          entries={sortedChronological}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
