import React, { useState, useMemo, useRef } from 'react';
import { 
  BillRecord, 
  ClubProfile, 
  GameSplitRule, 
  BarSplitRule, 
  CustomerPlayer,
  AssetCategory
} from '../types';
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Gamepad2, 
  Coffee, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Printer, 
  Eye, 
  ArrowUpDown, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  ChevronRight, 
  ChevronDown, 
  X,
  Share2,
  Copy,
  Check,
  Building2,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BillInvoicePrintModal } from './BillInvoicePrintModal';
import { getBillRateLabel, getBillGameCostBreakdown } from '../utils/billing';

interface BillsViewProps {
  bills: BillRecord[];
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  onNavigateToLedger?: (customerId: string) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  clubProfile,
  isDarkMode,
  onNavigateToLedger,
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSplitRule, setSelectedSplitRule] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SETTLED' | 'UNSETTLED'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Selected Bill for Detailed Invoice Modal
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Categories list derived from bills
  const categories = useMemo(() => {
    const set = new Set<string>();
    bills.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bills]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // 1. Search Query (Bill No, Table Name, Player Name, Phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBillNo = bill.billNo.toLowerCase().includes(q);
        const matchesAsset = bill.assetName.toLowerCase().includes(q);
        const matchesGameType = bill.gameType.toLowerCase().includes(q);
        const matchesPlayer = bill.players.some(p => 
          p.name.toLowerCase().includes(q) || (p.whatsapp && p.whatsapp.includes(q))
        );
        if (!matchesBillNo && !matchesAsset && !matchesGameType && !matchesPlayer) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && bill.category !== selectedCategory) {
        return false;
      }

      // 3. Split Rule Filter
      if (selectedSplitRule !== 'all' && bill.gameSplitRule !== selectedSplitRule) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter !== 'all' && bill.status !== statusFilter) {
        return false;
      }

      // 5. Date Filter
      if (dateFilter !== 'all') {
        const billDate = new Date(bill.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          const bDay = new Date(billDate);
          bDay.setHours(0, 0, 0, 0);
          if (bDay.getTime() !== today.getTime()) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const bDay = new Date(billDate);
          bDay.setHours(0, 0, 0, 0);
          if (bDay.getTime() !== yesterday.getTime()) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (billDate < weekAgo) return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bills, searchQuery, selectedCategory, selectedSplitRule, statusFilter, dateFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const totalCount = filteredBills.length;
    const totalGame = filteredBills.reduce((acc, b) => acc + (b.totalGameCost || 0), 0);
    const totalBar = filteredBills.reduce((acc, b) => acc + (b.totalBarCost || 0), 0);
    const totalRevenue = filteredBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const settledCount = filteredBills.filter(b => b.status === 'SETTLED').length;
    const unsettledCount = filteredBills.filter(b => b.status === 'UNSETTLED').length;

    return {
      totalCount,
      totalGame,
      totalBar,
      totalRevenue,
      settledCount,
      unsettledCount,
    };
  }, [filteredBills]);

  // Helper to format date & time
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  // Helper to format time only from ISO or epoch
  const formatTimeOnly = (val: string | number) => {
    const d = new Date(val);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate WhatsApp Invoice Link for whole bill or player
  const getWhatsAppInvoiceLink = (bill: BillRecord, targetPlayerId?: string) => {
    const targetPlayer = targetPlayerId 
      ? bill.players.find(p => p.id === targetPlayerId)
      : bill.players[0];
    
    const phone = targetPlayer?.whatsapp?.replace(/[^0-9]/g, '') || '';
    const share = targetPlayerId 
      ? bill.shares.find(s => s.playerId === targetPlayerId)
      : null;

    const { dateStr, timeStr } = formatDateTime(bill.timestamp);
    const rateLabel = getBillRateLabel(bill);
    const breakdown = getBillGameCostBreakdown(bill);

    let text = `*${clubProfile.businessName} - Session Invoice* 🎱🧾\n\n` +
      `*Bill No:* ${bill.billNo}\n` +
      `*Date:* ${dateStr} at ${timeStr}\n` +
      `*Game & Table:* ${bill.assetName}\n` +
      `*Format:* ${bill.gameType} (${bill.matchType})\n` +
      `*Rate:* ${rateLabel}\n` +
      `*Time Period:* ${formatTimeOnly(bill.startTime)} - ${formatTimeOnly(bill.endTime)} (${bill.durationMinutes} mins)\n\n` +
      `*Financial Breakdown:*\n` +
      `• Table/Game Total: ₹${bill.totalGameCost}\n` +
      (breakdown ? `• Game Calculation: ${breakdown}\n` : '') +
      (bill.totalBarCost > 0 ? `• Cafe / Bar Total: ₹${bill.totalBarCost}\n` : '') +
      `• *Total Bill: ₹${bill.grandTotal}*\n\n` +
      `*Player vs Player Split Engine:*\n` +
      `• Rule: ${bill.gameSplitRule.replace(/_/g, ' ')}\n`;

    bill.shares.forEach(s => {
      text += `  - ${s.playerName}: Table ₹${s.gameShare} + Bar ₹${s.barShare} = *₹${s.totalShare}* (${s.paymentMethod})\n`;
    });

    if (share) {
      text += `\n👉 *Your Share (${share.playerName}): ₹${share.totalShare}*\n`;
    }

    if (bill.status === 'SETTLED') {
      text += `\n✅ *Status:* Settled in Full\n`;
    } else {
      text += `\n📋 *Status:* Posted to Account Ledger (Balance Due: ₹${share ? share.totalShare : bill.grandTotal})\n`;
    }

    text += `\nThank you for playing at ${clubProfile.businessName}!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyBillText = (bill: BillRecord) => {
    const { dateStr, timeStr } = formatDateTime(bill.timestamp);
    const rateLabel = getBillRateLabel(bill);
    const breakdown = getBillGameCostBreakdown(bill);

    let text = `${clubProfile.businessName} • Invoice ${bill.billNo}\n`;
    text += `Date: ${dateStr}, ${timeStr}\n`;
    text += `Game: ${bill.assetName} (${bill.durationMinutes} mins: ${formatTimeOnly(bill.startTime)} - ${formatTimeOnly(bill.endTime)})\n`;
    text += `Rate: ${rateLabel}\n`;
    if (breakdown) {
      text += `Game Math: ${breakdown}\n`;
    }
    text += `Total: ₹${bill.grandTotal} (Game: ₹${bill.totalGameCost}, Bar: ₹${bill.totalBarCost})\n`;
    text += `Players:\n`;
    bill.shares.forEach(s => {
      text += `• ${s.playerName}: ₹${s.totalShare} (${s.paymentMethod})\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* 1. TOP HEADER & KPI METRIC CARDS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-100/80 border-indigo-300 text-indigo-700 shadow-xs'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Bills & Invoices Hub
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300 font-extrabold'
                }`}>
                  {filteredBills.length} Bills
                </span>
              </h1>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                Audit repository of all game sessions, start-end periods, bar consumptions & PvP split settlements
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle Mode */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className={`p-1 rounded-xl border flex items-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/80 border-slate-300 shadow-xs'
          }`}>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Detailed Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Compact Register
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div id="bills-kpi-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
          }`}>Total Invoiced</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            ₹{kpis.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            {kpis.totalCount} completed sessions
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
          }`}>Game / Table Fees</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            ₹{kpis.totalGame.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            Hourly table collections
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
          }`}>Cafe & Bar Orders</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            isDarkMode ? 'text-amber-400' : 'text-amber-600'
          }`}>
            ₹{kpis.totalBar.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            Snacks & beverage add-ons
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
          }`}>Settlement Status</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold shadow-xs'
            }`}>
              {kpis.settledCount} Paid
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isDarkMode 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-xs'
            }`}>
              {kpis.unsettledCount} On Ledger
            </span>
          </div>
          <span className={`text-[11px] font-medium block mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            Unified split distribution
          </span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div id="bills-filter-toolbar" className={`p-4 rounded-2xl border space-y-3.5 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Bill No (e.g. BILL-101), Table, Game, Player Name or Phone..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-hidden transition ${
                isDarkMode 
                  ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {(['all', 'today', 'yesterday', 'week'] as const).map(df => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition border ${
                  dateFilter === df
                    ? isDarkMode 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isDarkMode 
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' 
                      : 'bg-slate-100/90 border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                {df === 'all' ? 'All Dates' : df === 'week' ? 'Past 7 Days' : df}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className={`flex flex-wrap items-center gap-2.5 pt-3 border-t ${
          isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${
            isDarkMode ? 'text-slate-400' : 'text-slate-700'
          }`}>
            <Filter className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span>Filter By:</span>
          </div>

          {/* Game / Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-hidden cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-indigo-500 focus:border-indigo-600'
            }`}
          >
            <option value="all">All Game Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Split Rule Filter */}
          <select
            value={selectedSplitRule}
            onChange={(e) => setSelectedSplitRule(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-hidden cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-indigo-500 focus:border-indigo-600'
            }`}
          >
            <option value="all">All Split Rules</option>
            <option value="1v1_loser_pays">1v1 Loser Pays Table</option>
            <option value="2v2_loser_pays">2v2 Loser Pays Table</option>
            <option value="1v1_equal">1v1 Equal Split</option>
            <option value="2v2_equal">2v2 Equal Split</option>
            <option value="standard">Solo / Single Host Payer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-hidden cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-indigo-500 focus:border-indigo-600'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="SETTLED">Settled / Paid in Full</option>
            <option value="UNSETTLED">Unsettled / Ledger Debits</option>
          </select>

          {(selectedCategory !== 'all' || selectedSplitRule !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSplitRule('all');
                setStatusFilter('all');
                setDateFilter('all');
                setSearchQuery('');
              }}
              className={`text-xs font-extrabold ml-auto cursor-pointer ${
                isDarkMode ? 'text-rose-400 hover:underline' : 'text-rose-600 hover:text-rose-700 hover:underline'
              }`}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. BILLS LISTING VIEW */}
      {filteredBills.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <Receipt className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-500 opacity-50' : 'text-slate-400'}`} />
          <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No bills found</h3>
          <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            No session settlement bills matched your filter criteria. Try clearing search keywords or selecting all categories.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* --- CARD VIEW: COMPLETE DETAILS AT A GLANCE --- */
        <div className="grid grid-cols-1 gap-4">
          {filteredBills.map((bill, index) => {
            const { dateStr, timeStr } = formatDateTime(bill.timestamp);
            const startTimeStr = formatTimeOnly(bill.startTime);
            const endTimeStr = formatTimeOnly(bill.endTime);

            return (
              <motion.div
                key={bill.id}
                id={index === 0 ? "bill-record-card" : undefined}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border transition overflow-hidden ${
                  isDarkMode 
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
                    : 'bg-white border-slate-200/90 hover:border-indigo-200 shadow-sm'
                }`}
              >
                {/* Bill Header Bar */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/90 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-100/90 border-indigo-300 text-indigo-700 shadow-xs'
                    }`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-sm ${
                          isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                        }`}>
                          {bill.billNo}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                          bill.status === 'SETTLED'
                            ? isDarkMode 
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                            : isDarkMode 
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                              : 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                        }`}>
                          {bill.status === 'SETTLED' ? 'Settled' : 'Ledger Account'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        <Calendar className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span>{dateStr} • {timeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBillText(bill)}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-xs'
                      }`}
                      title="Copy Bill Summary"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <a
                      href={getWhatsAppInvoiceLink(bill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs cursor-pointer"
                      title="Share Bill on WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Bill</span>
                    </a>
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="px-2.5 py-1.5 rounded-lg border text-xs font-extrabold flex items-center gap-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-xs cursor-pointer"
                      title="Print A4 Invoice / Export PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Main Content Grid: Game & Time Info + Financials + PvP Engine */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column (4 cols): Game Details & Exact Time Period */}
                  <div className={`lg:col-span-4 space-y-3.5 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-5 ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
                      }`}>
                        Game & Table Asset
                      </span>
                      <div className={`font-black text-sm sm:text-base flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Gamepad2 className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span>{bill.assetName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {bill.gameType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}>
                          {bill.matchType.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {getBillRateLabel(bill)}
                        </span>
                      </div>
                    </div>

                    {/* Time Period Section */}
                    <div className={`p-3 rounded-xl border space-y-2 ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/90'
                    }`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                        <span className={`flex items-center gap-1 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600 font-extrabold'
                        }`}>
                          <Clock className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                          Time Period
                        </span>
                        <span className={`font-mono font-bold ${
                          isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                        }`}>
                          {bill.durationMinutes} mins
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-bold'}`}>Start Time</span>
                          <span className={`font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{startTimeStr}</span>
                        </div>
                        <div>
                          <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-bold'}`}>End Time</span>
                          <span className={`font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{endTimeStr}</span>
                        </div>
                      </div>
                      {bill.totalPausedDuration && bill.totalPausedDuration > 0 ? (
                        <div className={`text-[10px] pt-1 border-t font-semibold ${
                          isDarkMode ? 'text-amber-400 border-slate-800/40' : 'text-amber-700 border-slate-200'
                        }`}>
                          Paused time: {Math.round(bill.totalPausedDuration / 60)} mins (excluded)
                        </div>
                      ) : null}
                    </div>

                    {/* Financial Summary Box */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
                        }`}>Grand Total</span>
                        <span className={`text-xl font-black font-mono ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                          ₹{bill.grandTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className={`text-right text-[11px] font-mono space-y-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        <div>Game: <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>₹{bill.totalGameCost}</span></div>
                        {getBillGameCostBreakdown(bill) && (
                          <div className={`text-[10px] font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {getBillGameCostBreakdown(bill)}
                          </div>
                        )}
                        <div>Cafe / Bar: <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>₹{bill.totalBarCost}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (8 cols): Player vs Player (PvP) & Split Engine Details */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          isDarkMode ? 'text-slate-200' : 'text-slate-900'
                        }`}>
                          Player vs Player Split Engine Breakdown
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`px-2.5 py-0.5 rounded font-extrabold border ${
                          isDarkMode 
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' 
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-xs'
                        }`}>
                          Game: {bill.gameSplitRule.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded font-extrabold border ${
                          isDarkMode 
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                            : 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                        }`}>
                          Bar: {bill.barSplitRule.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Players Split Table */}
                    <div className={`overflow-x-auto rounded-xl border ${
                      isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200/90 bg-white shadow-xs'
                    }`}>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className={`border-b text-[10px] uppercase tracking-wider font-extrabold ${
                            isDarkMode 
                              ? 'border-slate-800 bg-slate-900/60 text-slate-400' 
                              : 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}>
                            <th className="p-2.5">Player Details</th>
                            <th className="p-2.5 text-center">Role / Matchup</th>
                            <th className="p-2.5 text-right">Game Share</th>
                            <th className="p-2.5 text-right">Bar Share</th>
                            <th className="p-2.5 text-right">Total Due</th>
                            <th className="p-2.5 text-center">Payment Mode</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                          {bill.shares.map((share) => {
                            const isLoser = bill.losingPlayerIds.includes(share.playerId) || share.isLoser;
                            const isWinner = bill.winningPlayerIds?.includes(share.playerId) || share.isWinner;
                            const isHost = bill.singlePayerId === share.playerId || share.isHost;

                            return (
                              <tr key={share.playerId} className={`transition ${
                                isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'
                              }`}>
                                <td className="p-2.5">
                                  <div className="font-bold flex items-center gap-1.5">
                                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>{share.playerName}</span>
                                    {share.whatsapp && (
                                      <a
                                        href={getWhatsAppInvoiceLink(bill, share.playerId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition ${
                                          isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                                        }`}
                                        title="Send personal WhatsApp bill"
                                      >
                                        <Send className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                  {share.whatsapp && (
                                    <div className={`text-[10px] font-mono ${
                                      isDarkMode ? 'text-slate-500' : 'text-slate-500 font-medium'
                                    }`}>
                                      {share.whatsapp}
                                    </div>
                                  )}
                                </td>

                                <td className="p-2.5 text-center">
                                  {isLoser ? (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                      isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-300'
                                    }`}>
                                      Loser (Pays)
                                    </span>
                                  ) : isWinner ? (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                      isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}>
                                      Winner
                                    </span>
                                  ) : isHost ? (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                      isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-300'
                                    }`}>
                                      Host Payer
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] font-semibold ${
                                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                    }`}>Equal Share</span>
                                  )}
                                </td>

                                <td className={`p-2.5 text-right font-mono font-semibold ${
                                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                                }`}>
                                  ₹{share.gameShare.toFixed(2)}
                                </td>

                                <td className={`p-2.5 text-right font-mono font-semibold ${
                                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                                }`}>
                                  ₹{share.barShare.toFixed(2)}
                                </td>

                                <td className={`p-2.5 text-right font-mono font-black ${
                                  isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                                }`}>
                                  ₹{share.totalShare.toFixed(2)}
                                </td>

                                <td className="p-2.5 text-center">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                                    share.paymentMethod === 'Cash'
                                      ? isDarkMode 
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                      : share.paymentMethod === 'UPI'
                                        ? isDarkMode 
                                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : isDarkMode 
                                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                                          : 'bg-rose-100 text-rose-800 border-rose-300'
                                  }`}>
                                    {share.paymentMethod}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Attached Bar Orders items if any */}
                    {bill.barItemsSummary && bill.barItemsSummary.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                        <span className={`font-bold flex items-center gap-1 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-700'
                        }`}>
                          <Coffee className={`w-3 h-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          Cafe Add-ons:
                        </span>
                        {bill.barItemsSummary.map((item, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isDarkMode 
                                ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
                                : 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                            }`}
                          >
                            {item.name} × {item.quantity} (₹{item.price * item.quantity})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* --- COMPACT TABLE VIEW: SCAN HIGH VOLUME OF BILLS --- */
        <div className={`overflow-x-auto rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b text-[10px] uppercase tracking-wider font-extrabold ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <th className="p-3.5">Bill No & Date</th>
                <th className="p-3.5">Game Asset & Type</th>
                <th className="p-3.5 text-center">Time Period</th>
                <th className="p-3.5">PvP Players</th>
                <th className="p-3.5 text-center">Split Rule</th>
                <th className="p-3.5 text-right">Game (₹)</th>
                <th className="p-3.5 text-right">Bar (₹)</th>
                <th className="p-3.5 text-right">Total (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
              {filteredBills.map((bill) => {
                const { dateStr, timeStr } = formatDateTime(bill.timestamp);
                const startTimeStr = formatTimeOnly(bill.startTime);
                const endTimeStr = formatTimeOnly(bill.endTime);

                return (
                  <tr key={bill.id} className={`transition ${
                    isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/80'
                  }`}>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className={`font-mono font-black ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                      }`}>
                        {bill.billNo}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}>
                        {dateStr} • {timeStr}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className={`font-black flex items-center gap-1.5 ${
                        isDarkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        <Gamepad2 className={`w-3.5 h-3.5 shrink-0 ${
                          isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                        }`} />
                        <span>{bill.assetName}</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'
                      }`}>
                        {bill.gameType} • {bill.matchType} • {getBillRateLabel(bill)}
                      </div>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className={`font-mono font-bold ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>
                        {startTimeStr} - {endTimeStr}
                      </div>
                      <div className={`text-[10px] font-mono font-extrabold mt-0.5 ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                      }`}>
                        {bill.durationMinutes} mins
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className={`text-xs font-bold ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>
                        {bill.players.map(p => p.name).join(' vs ')}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-500 font-medium'
                      }`}>
                        {bill.shares.length} shares calculated
                      </div>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {bill.gameSplitRule.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className={`p-3.5 text-right font-mono font-semibold ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      ₹{bill.totalGameCost}
                    </td>

                    <td className={`p-3.5 text-right font-mono font-semibold ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      ₹{bill.totalBarCost}
                    </td>

                    <td className={`p-3.5 text-right font-mono font-black ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                        bill.status === 'SETTLED'
                          ? isDarkMode 
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                          : isDarkMode 
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                            : 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                      }`}>
                        {bill.status === 'SETTLED' ? 'Settled' : 'Ledger'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppInvoiceLink(bill)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            isDarkMode 
                              ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-emerald-500/30' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300 shadow-xs'
                          }`}
                          title="Share on WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            isDarkMode 
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30' 
                              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300 shadow-xs'
                          }`}
                          title="Print A4 Invoice / Export PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            isDarkMode 
                              ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border-indigo-500/30' 
                              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border-indigo-300 shadow-xs'
                          }`}
                          title="View Full Bill & Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. DETAILED INVOICE & A4 PRINTABLE AUDIT MODAL */}
      {selectedBill && (
        <BillInvoicePrintModal
          bill={selectedBill}
          clubProfile={clubProfile}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedBill(null)}
        />
      )}

    </div>
  );
};
