import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BillRecord, 
  ClubProfile, 
  GameSplitRule, 
  BarSplitRule, 
  CustomerPlayer,
  AssetCategory,
  GameAsset,
  PaymentMethod
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
  QrCode,
  Edit3,
  Ban,
  AlertTriangle,
  Timer,
  Save,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BillInvoicePrintModal } from './BillInvoicePrintModal';
import { BarReceiptModal } from './BarReceiptModal';
import { getBillRateLabel, getBillGameCostBreakdown } from '../utils/billing';

interface BillsViewProps {
  bills: BillRecord[];
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  gameAssets?: GameAsset[];
  customers?: CustomerPlayer[];
  onNavigateToLedger?: (customerId: string) => void;
  onEditBill?: (updatedBill: BillRecord) => Promise<void> | void;
  onVoidBill?: (billId: string, reason: string) => Promise<void> | void;
  onDeleteBill?: (billId: string) => Promise<void> | void;
  onClearAllBills?: () => Promise<void> | void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  clubProfile,
  isDarkMode,
  gameAssets = [],
  customers = [],
  onNavigateToLedger,
  onEditBill,
  onVoidBill,
}) => {
  // Real-time ticking clock for 5-minute countdown window
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSplitRule, setSelectedSplitRule] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SETTLED' | 'UNSETTLED' | 'VOIDED'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Selected Bill for Detailed Invoice Modal
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const [selectedBarReceipt, setSelectedBarReceipt] = useState<BillRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit and Void Modals State
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null);
  const [voidingBill, setVoidingBill] = useState<BillRecord | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Mistake in billing');
  const [customVoidReason, setCustomVoidReason] = useState<string>('');
  const [isProcessingVoid, setIsProcessingVoid] = useState(false);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);

  // Helper to identify standalone Bar / Cafe orders
  const isBarBill = (bill: BillRecord) => {
    return (
      bill.billNo.startsWith('BAR-') ||
      bill.category === 'Counter' ||
      bill.gameType === 'Bar Quick Sale' ||
      bill.gameType === 'Cafe Quick Sale' ||
      (bill.totalGameCost === 0 && (bill.durationMinutes === 0 || !bill.durationMinutes) && (bill.totalBarCost > 0 || (bill.barItemsSummary && bill.barItemsSummary.length > 0)))
    );
  };

  // Deduplicate incoming bills list by unique bill identifier (billNo > voucherNo > id)
  // Guarantees pristine single-item invoice display and accurate KPI metrics
  const uniqueBills = useMemo(() => {
    const map = new Map<string, BillRecord>();
    (bills || []).forEach(b => {
      const key = String(b.billNo || b.voucherNo || b.id || '').toUpperCase().trim();
      if (key && !map.has(key)) {
        map.set(key, b);
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bills]);

  // Comprehensive categories list derived from gameAssets + historic bills
  const categories = useMemo(() => {
    const set = new Set<string>();
    
    // 1. Add categories from configured club game assets
    if (gameAssets && gameAssets.length > 0) {
      gameAssets.forEach(a => {
        if (a.category) set.add(a.category);
      });
    }

    // 2. Add categories present in historic bills
    uniqueBills.forEach(b => {
      if (b.category) set.add(b.category);
    });

    // 3. Ensure 'Cafe & Beverages' is included
    set.add('Cafe & Beverages');

    const list = Array.from(set);

    const categoryOrder = [
      'Billiards', 
      'Table Tennis', 
      'PS5', 
      'PC Gaming', 
      'VR', 
      'Foosball', 
      'Air Hockey', 
      'Darts', 
      'Karaoke', 
      'Board Games',
      'Cafe & Beverages'
    ];

    list.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a);
      const idxB = categoryOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return list;
  }, [uniqueBills, gameAssets]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return uniqueBills.filter(bill => {
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
        const parseDateSafe = (ts: string | number | Date | null | undefined): Date | null => {
          if (!ts) return null;
          if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
          if (typeof ts === 'number') {
            const d = new Date(ts);
            return isNaN(d.getTime()) ? null : d;
          }
          let str = String(ts).trim();
          if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(str)) {
            str = str.replace(' ', 'T') + 'Z';
          }
          const d = new Date(str);
          return isNaN(d.getTime()) ? null : d;
        };

        const billDate = parseDateSafe(bill.timestamp);
        if (!billDate) return false;

        const today = new Date();
        const isSameDay = (d1: Date, d2: Date) => 
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        if (dateFilter === 'today') {
          if (!isSameDay(billDate, today)) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (!isSameDay(billDate, yesterday)) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          if (billDate < weekAgo) return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bills, searchQuery, selectedCategory, selectedSplitRule, statusFilter, dateFilter]);

  // Most recently created active (non-voided) bill
  const latestActiveBill = useMemo(() => {
    return uniqueBills.find(b => b.status !== 'VOIDED' && !b.isVoided) || null;
  }, [uniqueBills]);

  // Calculate remaining seconds for the 5-minute guardrail window
  const getBillTimeRemainingSecs = (bill: BillRecord) => {
    const elapsedMs = now - new Date(bill.timestamp).getTime();
    return Math.max(0, Math.floor((300000 - elapsedMs) / 1000)); // 5 minutes = 300,000 ms
  };

  // Guardrail check: only the latest record within 5 minutes is editable/voidable
  const isBillEditableAndVoidable = (bill: BillRecord) => {
    if (bill.status === 'VOIDED' || bill.isVoided) return false;
    if (!latestActiveBill || (latestActiveBill.id !== bill.id && latestActiveBill.billNo !== bill.billNo)) return false;
    return getBillTimeRemainingSecs(bill) > 0;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // KPIs
  const kpis = useMemo(() => {
    const activeBills = filteredBills.filter(b => b.status !== 'VOIDED' && !b.isVoided);
    const totalCount = filteredBills.length;
    const totalGame = activeBills.reduce((acc, b) => acc + (b.totalGameCost || 0), 0);
    const totalBar = activeBills.reduce((acc, b) => acc + (b.totalBarCost || 0), 0);
    const totalRevenue = activeBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const settledCount = activeBills.filter(b => b.status === 'SETTLED').length;
    const unsettledCount = activeBills.filter(b => b.status === 'UNSETTLED').length;
    const voidedCount = filteredBills.filter(b => b.status === 'VOIDED' || b.isVoided).length;

    return {
      totalCount,
      totalGame,
      totalBar,
      totalRevenue,
      settledCount,
      unsettledCount,
      voidedCount,
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
    const isBar = isBarBill(bill);

    // 1. Specialized WhatsApp Receipt for standalone Cafe & Bar POS orders
    if (isBar) {
      let text = `*☕ ${clubProfile.businessName} - Cafe & Bar Receipt*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*Order / Bill No:* ${bill.billNo}\n`;
      text += `*Date:* ${dateStr} at ${timeStr}\n`;
      text += `*Customer:* ${targetPlayer?.name || 'Walk-In Guest'}\n\n`;
      text += `*ORDER ITEMS:*\n`;
      if (bill.barItemsSummary && bill.barItemsSummary.length > 0) {
        bill.barItemsSummary.forEach((it, idx) => {
          text += `${idx + 1}. ${it.name} × ${it.quantity} = ₹${it.price * it.quantity}\n`;
        });
      } else {
        text += `1. Cafe & Refreshments = ₹${bill.grandTotal}\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*Grand Total: ₹${bill.grandTotal}*\n`;
      text += `*Status:* ${bill.status === 'SETTLED' ? 'Paid in Full' : 'Added to Khata Account'}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `Thank you for visiting! Enjoy your refreshments.`;

      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    }

    // 2. Standard Snooker / Table Game Session Tax Invoice
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
    const isBar = isBarBill(bill);

    if (isBar) {
      let text = `${clubProfile.businessName} • Cafe Receipt ${bill.billNo}\n`;
      text += `Date: ${dateStr}, ${timeStr}\n`;
      text += `Customer: ${bill.players[0]?.name || 'Walk-In Guest'}\n`;
      text += `Items:\n`;
      if (bill.barItemsSummary && bill.barItemsSummary.length > 0) {
        bill.barItemsSummary.forEach(it => {
          text += `• ${it.name} × ${it.quantity} = ₹${it.price * it.quantity}\n`;
        });
      } else {
        text += `• Cafe Refreshments: ₹${bill.grandTotal}\n`;
      }
      text += `Total: ₹${bill.grandTotal} (${bill.shares[0]?.paymentMethod || 'Cash'})\n`;
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      return;
    }

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
            <option value="all">All Game Categories ({bills.length})</option>
            {categories.map(cat => {
              const count = bills.filter(b => b.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
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
            const isBar = isBarBill(bill);

            // ═══════════════════════════════════════════════════════════════════
            // A. DEDICATED BAR & CAFE QUICK SALE POS ORDER CARD
            // ═══════════════════════════════════════════════════════════════════
            if (isBar) {
              const primaryCustomer = bill.players?.[0] || { name: 'Walk-In Guest', whatsapp: '' };
              const paymentMethod = bill.shares?.[0]?.paymentMethod || 'Cash';
              const isKhata = paymentMethod === 'LEDGER' || bill.status === 'UNSETTLED';
              const items = bill.barItemsSummary && bill.barItemsSummary.length > 0
                ? bill.barItemsSummary
                : [{ name: 'Cafe & Beverage Order', quantity: 1, price: bill.grandTotal }];

              return (
                <motion.div
                  key={bill.id}
                  id={index === 0 ? "bill-record-card" : undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border transition overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200/90 hover:border-amber-200 shadow-sm'
                  }`}
                >
                  {/* Bar Bill Header Bar */}
                  <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/90 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-100/90 border-amber-300 text-amber-700 shadow-xs'
                      }`}>
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono font-black text-sm ${
                            isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                          }`}>
                            {bill.billNo}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            Bar & Cafe Order
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {isBillEditableAndVoidable(bill) && (
                        <>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold animate-pulse">
                            <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{formatTimer(getBillTimeRemainingSecs(bill))}</span>
                          </div>
                          {onEditBill && (
                            <button
                              onClick={() => setEditingBill(bill)}
                              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-xs cursor-pointer"
                              title="Edit latest bill (5-min grace window)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                          {onVoidBill && (
                            <button
                              onClick={() => {
                                setVoidingBill(bill);
                                setVoidReason('Mistake in billing');
                                setCustomVoidReason('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-xs cursor-pointer"
                              title="Void latest bill (5-min grace window)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Void</span>
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleCopyBillText(bill)}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                            : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-xs'
                        }`}
                        title="Copy Cafe Order Summary"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Copy</span>
                      </button>
                      <a
                        href={getWhatsAppInvoiceLink(bill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs cursor-pointer"
                        title="Share Bar Receipt on WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp Receipt</span>
                      </a>
                      <button
                        onClick={() => setSelectedBarReceipt(bill)}
                        className="px-2.5 py-1.5 rounded-lg border text-xs font-extrabold flex items-center gap-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-xs cursor-pointer"
                        title="Print Bar POS Thermal Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => setSelectedBarReceipt(bill)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Bar Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Content Grid for Bar Orders */}
                  <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column (4 cols): Customer & Payment Info */}
                    <div className={`lg:col-span-4 space-y-3.5 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-5 ${
                      isDarkMode ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
                        }`}>
                          Counter & Sales Desk
                        </span>
                        <div className={`font-black text-sm sm:text-base flex items-center gap-2 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          <Coffee className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span>Club Cafe & Refreshments</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            DIRECT POS SALE
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {items.length} item{items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info Card */}
                      <div className={`p-3 rounded-xl border space-y-1.5 ${
                        isDarkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/90'
                      }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                          <span className={`flex items-center gap-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600 font-extrabold'
                          }`}>
                            <Users className={`w-3 h-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                            Customer / Guest
                          </span>
                          {isKhata && onNavigateToLedger && (
                            <button
                              onClick={() => onNavigateToLedger(primaryCustomer.id)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                            >
                              Open Khata
                            </button>
                          )}
                        </div>
                        <div className={`font-black text-sm sm:text-base ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {primaryCustomer.name}
                        </div>
                        {primaryCustomer.whatsapp && (
                          <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Ph: {primaryCustomer.whatsapp}
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-800/40 flex items-center justify-between text-[11px] font-medium">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Payment Method:</span>
                          <span className={`font-bold ${
                            isKhata ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {isKhata ? 'Khata Ledger' : paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Grand Total Box */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className={`text-[10px] uppercase font-bold block ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
                          }`}>Total Amount</span>
                          <span className={`text-2xl font-black font-mono ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            ₹{bill.grandTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right text-[11px] font-mono">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            bill.status === 'SETTLED'
                              ? isDarkMode
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isDarkMode
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {bill.status === 'SETTLED' ? 'PAID IN FULL' : 'CHARGED TO KHATA'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (8 cols): Itemized Food & Drink Breakdown */}
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Coffee className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={`text-xs font-black uppercase tracking-wider ${
                            isDarkMode ? 'text-slate-200' : 'text-slate-900'
                          }`}>
                            Itemized Cafe & Beverage Orders
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono font-bold ${
                          isDarkMode ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          {items.reduce((acc, it) => acc + (it.quantity || 1), 0)} Total Quantity
                        </span>
                      </div>

                      {/* Items Table */}
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
                              <th className="p-3">#</th>
                              <th className="p-3">Item Description</th>
                              <th className="p-3 text-center">Quantity</th>
                              <th className="p-3 text-right">Price per unit</th>
                              <th className="p-3 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                            {items.map((item, idx) => {
                              const lineTotal = item.price * item.quantity;
                              return (
                                <tr key={idx} className={`transition ${
                                  isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                                }`}>
                                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                                    {idx + 1}
                                  </td>
                                  <td className={`p-3 font-bold ${
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {item.name}
                                  </td>
                                  <td className={`p-3 text-center font-mono font-bold ${
                                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                  }`}>
                                    {item.quantity}
                                  </td>
                                  <td className={`p-3 text-right font-mono ${
                                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                                  }`}>
                                    ₹{item.price.toFixed(2)}
                                  </td>
                                  <td className={`p-3 text-right font-mono font-black ${
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    ₹{lineTotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Quick Receipt Summary bar */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                            {isKhata 
                              ? `Added as Debit Entry to ${primaryCustomer.name}'s Khata tab`
                              : `Settled immediately via ${paymentMethod}`}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedBarReceipt(bill)}
                          className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                            isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                          }`}
                        >
                          <span>Open Receipt</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // ═══════════════════════════════════════════════════════════════════
            // B. STANDARD SNOOKER / TABLE GAME SESSION BILL CARD (UNTOUCHED)
            // ═══════════════════════════════════════════════════════════════════
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {isBillEditableAndVoidable(bill) && (
                      <>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold animate-pulse">
                          <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{formatTimer(getBillTimeRemainingSecs(bill))}</span>
                        </div>
                        {onEditBill && (
                          <button
                            onClick={() => setEditingBill(bill)}
                            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-xs cursor-pointer"
                            title="Edit latest bill (5-min grace window)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        {onVoidBill && (
                          <button
                            onClick={() => {
                              setVoidingBill(bill);
                              setVoidReason('Mistake in billing');
                              setCustomVoidReason('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-xs cursor-pointer"
                            title="Void latest bill (5-min grace window)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Void</span>
                          </button>
                        )}
                      </>
                    )}
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {isBillEditableAndVoidable(bill) && (
                          <>
                            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">
                              {formatTimer(getBillTimeRemainingSecs(bill))}
                            </span>
                            {onEditBill && (
                              <button
                                onClick={() => setEditingBill(bill)}
                                className="p-1.5 rounded-lg border bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-xs cursor-pointer"
                                title="Edit latest bill (5-min grace window)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onVoidBill && (
                              <button
                                onClick={() => {
                                  setVoidingBill(bill);
                                  setVoidReason('Mistake in billing');
                                  setCustomVoidReason('');
                                }}
                                className="p-1.5 rounded-lg border bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-xs cursor-pointer"
                                title="Void latest bill (5-min grace window)"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
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
                          onClick={() => isBarBill(bill) ? setSelectedBarReceipt(bill) : setSelectedBill(bill)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            isDarkMode 
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30' 
                              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300 shadow-xs'
                          }`}
                          title={isBarBill(bill) ? "Print Bar POS Thermal Receipt" : "Print A4 Invoice / Export PDF"}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => isBarBill(bill) ? setSelectedBarReceipt(bill) : setSelectedBill(bill)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            isBarBill(bill)
                              ? isDarkMode
                                ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border-amber-500/30'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300 shadow-xs'
                              : isDarkMode 
                                ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border-indigo-500/30' 
                                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border-indigo-300 shadow-xs'
                          }`}
                          title={isBarBill(bill) ? "View Bar Receipt" : "View Full Bill & Invoice"}
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

      {/* 4A. DETAILED INVOICE & A4 PRINTABLE AUDIT MODAL (GAME SESSIONS) */}
      {selectedBill && (
        <BillInvoicePrintModal
          bill={selectedBill}
          clubProfile={clubProfile}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedBill(null)}
        />
      )}

      {/* 4B. DEDICATED BAR & CAFE POS THERMAL RECEIPT MODAL */}
      {selectedBarReceipt && (
        <BarReceiptModal
          bill={selectedBarReceipt}
          clubProfile={clubProfile}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedBarReceipt(null)}
        />
      )}

      {/* 4C. EDIT BILL MODAL (5-MINUTE GUARDRAIL) */}
      <AnimatePresence>
        {editingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black">Edit Invoice #{editingBill.billNo}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {formatTimer(getBillTimeRemainingSecs(editingBill))}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {editingBill.assetName || 'Club Sale'} • Total: ₹{editingBill.grandTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingBill(null)}
                  className={`p-2 rounded-xl transition ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* 5-Min Notice Banner */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2.5">
                  <Timer className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Operator 5-Minute Grace Window Active</span>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      You can edit player assignments, payment methods, and notes for this latest bill before the timer expires or a new bill is generated.
                    </p>
                  </div>
                </div>

                {/* Player shares and payment methods */}
                <div className="space-y-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Payment & Settlement Details
                  </span>

                  {editingBill.shares && editingBill.shares.length > 0 ? (
                    editingBill.shares.map((share, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border space-y-2.5 ${
                          isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{share.playerName}</span>
                          <span className="font-mono font-black text-xs text-emerald-500">₹{share.totalShare.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Payment Method:
                          </span>
                          <select
                            value={share.paymentMethod}
                            onChange={(e) => {
                              const newMethod = e.target.value as PaymentMethod;
                              setEditingBill(prev => {
                                if (!prev) return null;
                                const updatedShares = prev.shares.map((s, i) => i === idx ? { ...s, paymentMethod: newMethod } : s);
                                return { ...prev, shares: updatedShares, paymentMethod: newMethod };
                              });
                            }}
                            className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-hidden cursor-pointer ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Cash">Cash (Immediate Settlement)</option>
                            <option value="UPI">UPI (Immediate Settlement)</option>
                            <option value="Ledger">Khata Ledger (Debit Due)</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Payment Method:
                      </span>
                      <select
                        value={editingBill.paymentMethod || 'Cash'}
                        onChange={(e) => {
                          const newMethod = e.target.value;
                          setEditingBill(prev => prev ? { ...prev, paymentMethod: newMethod } : null);
                        }}
                        className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-hidden cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Ledger">Khata Ledger</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Operator Notes */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Remarks / Audit Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingBill.notes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingBill(prev => prev ? { ...prev, notes: val } : null);
                    }}
                    placeholder="e.g. Corrected player payment method or table remarks..."
                    className={`w-full p-2.5 rounded-xl border text-xs outline-hidden ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingEdit}
                  onClick={async () => {
                    if (!editingBill || !onEditBill) return;
                    setIsProcessingEdit(true);
                    try {
                      await onEditBill(editingBill);
                      setEditingBill(null);
                    } finally {
                      setIsProcessingEdit(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isProcessingEdit ? 'Saving...' : 'Save Bill Changes'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4D. VOID BILL CONFIRMATION MODAL (5-MINUTE GUARDRAIL) */}
      <AnimatePresence>
        {voidingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-rose-950/30 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black">Void Bill #{voidingBill.billNo}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {formatTimer(getBillTimeRemainingSecs(voidingBill))}
                      </span>
                    </div>
                    <p className="text-xs opacity-90">Permanent cancellation with audit stamp</p>
                  </div>
                </div>
                <button
                  onClick={() => setVoidingBill(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Warning notice */}
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>No Data Deletion • Safe Audit Void</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-300/90">
                    Voiding will stamp this bill as <strong>[ VOIDED ]</strong> with financial revenue set to <strong>₹0.00</strong>. Any linked player ledger dues will be automatically reversed. The invoice will remain visible for club records.
                  </p>
                </div>

                {/* Summary Info */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Session / Item:</span>
                    <span className="font-bold">{voidingBill.assetName || 'Quick Sale'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Original Total:</span>
                    <span className="font-mono font-black text-rose-500">₹{voidingBill.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Players Tagged:</span>
                    <span className="font-medium">{voidingBill.players.map(p => p.name).join(', ') || 'Walk-In'}</span>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Select Reason for Voiding
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Mistake in billing',
                      'Wrong table selected',
                      'Customer cancelled',
                      'Duplicate bill created',
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          setVoidReason(reason);
                          setCustomVoidReason('');
                        }}
                        className={`p-2 rounded-xl text-left font-bold text-xs border transition cursor-pointer ${
                          voidReason === reason
                            ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Or enter custom reason..."
                    value={customVoidReason}
                    onChange={(e) => {
                      setCustomVoidReason(e.target.value);
                      setVoidReason(e.target.value || 'Mistake in billing');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs outline-hidden mt-1 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setVoidingBill(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Keep Bill
                </button>
                <button
                  type="button"
                  disabled={isProcessingVoid}
                  onClick={async () => {
                    if (!voidingBill || !onVoidBill) return;
                    setIsProcessingVoid(true);
                    try {
                      const finalReason = customVoidReason.trim() || voidReason || 'Voided by operator';
                      await onVoidBill(voidingBill.id, finalReason);
                      setVoidingBill(null);
                    } finally {
                      setIsProcessingVoid(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isProcessingVoid ? 'Voiding...' : 'Confirm & Stamp as VOID'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
