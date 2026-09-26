import React, { useState, useMemo, useRef } from 'react';
import { 
  BillRecord, 
  ClubProfile, 
  GameSplitRule, 
  BarSplitRule, 
  CustomerPlayer,
  AssetCategory,
  GameAsset,
  CancelledSessionRecord,
  ClubExpense,
  ExpenseCategory
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
  Ban,
  ShieldAlert,
  RotateCcw,
  Info,
  UserX,
  Plus,
  Trash2,
  PlusCircle,
  Wallet,
  CreditCard,
  ArrowDownRight,
  ReceiptText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BillInvoicePrintModal } from './BillInvoicePrintModal';
import { BarReceiptModal } from './BarReceiptModal';
import { getBillRateLabel, getBillGameCostBreakdown } from '../utils/billing';

interface BillsViewProps {
  bills: BillRecord[];
  cancelledSessions?: CancelledSessionRecord[];
  clubProfile: ClubProfile;
  isDarkMode: boolean;
  gameAssets?: GameAsset[];
  expenses?: ClubExpense[];
  onLogExpense?: (expense: Omit<ClubExpense, 'id' | 'createdAt' | 'status' | 'loggedByEmail'>) => Promise<void> | void;
  onVoidExpense?: (id: string, reason: string) => Promise<void> | void;
  userRole?: string;
  onNavigateToLedger?: (customerId: string) => void;
  onDeleteBill?: (billId: string) => Promise<void> | void;
  onClearAllBills?: () => Promise<void> | void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  cancelledSessions = [],
  clubProfile,
  isDarkMode,
  gameAssets = [],
  expenses = [],
  onLogExpense,
  onVoidExpense,
  userRole = 'club_owner',
  onNavigateToLedger,
}) => {
  // Navigation Sub-Tab: 'bills' (Customer Invoices) vs 'expenses' (Club Outflows)
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'expenses'>('bills');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSplitRule, setSelectedSplitRule] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SETTLED' | 'UNSETTLED' | 'CANCELLED'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selected Bill for Detailed Invoice Modal
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const [selectedBarReceipt, setSelectedBarReceipt] = useState<BillRecord | null>(null);
  const [activeMobileDrawerBill, setActiveMobileDrawerBill] = useState<BillRecord | null>(null);
  const [focusedPcBill, setFocusedPcBill] = useState<BillRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAuditId, setCopiedAuditId] = useState<string | null>(null);

  // Selected Cancelled Session for Detailed Void Inspector Modal / Drawer
  const [focusedPcCancelledSessionId, setFocusedPcCancelledSessionId] = useState<string | null>(null);
  const [activeMobileDrawerCancelledSession, setActiveMobileDrawerCancelledSession] = useState<any | null>(null);

  // Log Expense Dialog States
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('RENT');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');
  const [expDate, setExpDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expReceiptNo, setExpReceiptNo] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [selectedExpenseCategoryFilter, setSelectedExpenseCategoryFilter] = useState<string>('all');

  // Void Expense Dialog State
  const [voidConfirmExpense, setVoidConfirmExpense] = useState<ClubExpense | null>(null);
  const [voidReasonText, setVoidReasonText] = useState('');
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

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
      if (statusFilter !== 'all' && statusFilter !== 'CANCELLED' && bill.status !== statusFilter) {
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

  // Set default focused PC bill when filteredBills changes
  const activePcBill = useMemo(() => {
    if (focusedPcBill && filteredBills.some(b => b.id === focusedPcBill.id)) {
      return filteredBills.find(b => b.id === focusedPcBill.id) || null;
    }
    return filteredBills[0] || null;
  }, [focusedPcBill, filteredBills]);

  // Filtered Cancelled Sessions Audit Log
  const filteredCancelledSessions = useMemo(() => {
    return (cancelledSessions || []).filter(item => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAsset = (item.assetName || '').toLowerCase().includes(q);
        const matchesReason = (item.cancellationReason || '').toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        const matchesPlayer = (item.taggedPlayers || []).some(p => 
          (p.name || '').toLowerCase().includes(q) || (p.whatsapp && p.whatsapp.includes(q))
        );
        if (!matchesAsset && !matchesReason && !matchesCategory && !matchesPlayer) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.cancelledAt);
        if (isNaN(itemDate.getTime())) return false;
        const today = new Date();
        const isSameDay = (d1: Date, d2: Date) => 
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        if (dateFilter === 'today') {
          if (!isSameDay(itemDate, today)) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (!isSameDay(itemDate, yesterday)) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          if (itemDate < weekAgo) return false;
        }
      }

      return true;
    }).sort((a, b) => (b.cancelledAt || 0) - (a.cancelledAt || 0));
  }, [cancelledSessions, searchQuery, selectedCategory, dateFilter]);

  // Total Voided Meter Amount from filtered cancellations
  const totalVoidedAmount = useMemo(() => {
    return filteredCancelledSessions.reduce((sum, s) => sum + (s.discardedMeterAmount || 0), 0);
  }, [filteredCancelledSessions]);

  // Set default focused PC Cancelled Session when filteredCancelledSessions changes
  const activePcCancelledSession = useMemo(() => {
    if (focusedPcCancelledSessionId && filteredCancelledSessions.some(c => c.id === focusedPcCancelledSessionId)) {
      return filteredCancelledSessions.find(c => c.id === focusedPcCancelledSessionId) || null;
    }
    return filteredCancelledSessions[0] || null;
  }, [focusedPcCancelledSessionId, filteredCancelledSessions]);

  // Filtered Expenses Logic
  const filteredExpenses = useMemo(() => {
    const list = expenses || [];
    return list.filter(exp => {
      // 1. Category Filter
      if (selectedExpenseCategoryFilter !== 'all' && exp.category !== selectedExpenseCategoryFilter) {
        return false;
      }
      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesReceipt = (exp.receiptNo || '').toLowerCase().includes(q);
        const matchesCategory = exp.category.toLowerCase().includes(q);
        const matchesEmail = (exp.loggedByEmail || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesReceipt && !matchesCategory && !matchesEmail) {
          return false;
        }
      }
      // 3. Date Filter
      if (dateFilter !== 'all') {
        const expDateObj = new Date(exp.expenseDate);
        if (isNaN(expDateObj.getTime())) return false;
        const today = new Date();
        const isSameDay = (d1: Date, d2: Date) => 
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        if (dateFilter === 'today') {
          if (!isSameDay(expDateObj, today)) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (!isSameDay(expDateObj, yesterday)) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          if (expDateObj < weekAgo) return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }, [expenses, selectedExpenseCategoryFilter, searchQuery, dateFilter]);

  const activeExpenses = useMemo(() => {
    return (expenses || []).filter(e => e.status !== 'VOIDED');
  }, [expenses]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.filter(e => e.status !== 'VOIDED').reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  // Helper for Category Badge Styling
  const getExpenseCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'RENT':
        return { label: 'Rent & Premises', icon: '🏠', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'ELECTRICITY':
        return { label: 'Electricity & Utilities', icon: '⚡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'SALARY':
        return { label: 'Staff Salary', icon: '👥', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'INTERNET_SOFTWARE':
        return { label: 'Internet & Software', icon: '🌐', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'BAR_PURCHASE':
        return { label: 'Bar Stock Purchase', icon: '🍺', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'MAINTENANCE':
        return { label: 'Maintenance & Repairs', icon: '🎱', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
      case 'SUPPLIES':
        return { label: 'Supplies & Consumables', icon: '📦', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      default:
        return { label: 'Miscellaneous', icon: '🛠️', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    }
  };

  // Submit Expense Handlers
  const handleCreateExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount || Number(expAmount) <= 0) return;
    setIsSubmittingExpense(true);
    try {
      if (onLogExpense) {
        await onLogExpense({
          category: expCategory,
          title: expTitle.trim(),
          amount: Number(expAmount),
          paymentMethod: expPaymentMethod,
          expenseDate: expDate || new Date().toISOString().split('T')[0],
          receiptNo: expReceiptNo.trim() || undefined,
          notes: expNotes.trim() || undefined,
        });
      }
      setIsLogExpenseOpen(false);
      setExpTitle('');
      setExpAmount('');
      setExpReceiptNo('');
      setExpNotes('');
    } catch (err) {
      console.error('Failed to log expense:', err);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleVoidExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidConfirmExpense || !voidReasonText.trim()) return;
    setIsSubmittingVoid(true);
    try {
      if (onVoidExpense) {
        await onVoidExpense(voidConfirmExpense.id, voidReasonText.trim());
      }
      setVoidConfirmExpense(null);
      setVoidReasonText('');
    } catch (err) {
      console.error('Failed to void expense:', err);
    } finally {
      setIsSubmittingVoid(false);
    }
  };

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

  const handleCopyAuditRecord = (item: CancelledSessionRecord) => {
    const { dateStr, timeStr } = formatDateTime(new Date(item.cancelledAt).toISOString());
    let text = `🛑 ${clubProfile.businessName} • VOIDED SESSION AUDIT LOG\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Station: ${item.assetName} (${item.category})\n`;
    text += `Cancelled At: ${dateStr} at ${timeStr}\n`;
    text += `Duration Played: ${item.durationFormatted} (${item.durationMinutes} mins)\n`;
    text += `Discarded Meter Value: ₹${item.discardedMeterAmount} (Voided - not charged)\n`;
    text += `Tagged Players: ${item.taggedPlayers.map(p => p.name).join(', ') || 'None'} (No ledger balance change)\n`;
    if (item.returnedStockSummary && item.returnedStockSummary.length > 0) {
      text += `Restored Stock: ${item.returnedStockSummary.map(s => `${s.quantity}x ${s.name}`).join(', ')}\n`;
    }
    text += `Reason: ${item.cancellationReason || 'Cancelled by staff'}\n`;
    text += `Logged by: ${item.cancelledBy || 'Staff'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Audit Notice: Voided session. No invoice generated. Zero revenue impact.`;

    navigator.clipboard.writeText(text);
    setCopiedAuditId(item.id);
    setTimeout(() => setCopiedAuditId(null), 2000);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* 1. TOP HEADER & STREAMLINED ACTIONS */}
      <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-xs'
            }`}>
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Bills & Register</span>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold border ${
                  isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300 font-extrabold'
                }`}>
                  {activeSubTab === 'bills' ? `${uniqueBills.length} Invoices` : `${activeExpenses.length} Outflows`}
                </span>
              </h1>
              <p className={`text-xs mt-0.5 hidden sm:block ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                Audit repository of all game sessions, bar sales, split settlements, and operational club expenses
              </p>
            </div>
          </div>

          {/* Log Expense Action Button on Mobile Header */}
          <button
            onClick={() => setIsLogExpenseOpen(true)}
            className="sm:hidden px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Expense</span>
          </button>
        </div>

        {/* Desktop Header Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5 flex-wrap">
          {/* Primary Log Expense Button */}
          <button
            onClick={() => setIsLogExpenseOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Club Expense</span>
          </button>

          {/* View Mode Toggle (Cards vs Compact Table) - Active when on Bills tab */}
          {activeSubTab === 'bills' && (
            <div className={`p-1 rounded-xl border flex items-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/80 border-slate-300 shadow-xs'
            }`}>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table'
                    ? isDarkMode ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STREAMLINED SUB-TAB SEGMENTED PILL BAR */}
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl border w-full ${
        isDarkMode 
          ? 'bg-slate-900/60 border-slate-800' 
          : 'bg-slate-200/80 border-slate-300/80'
      }`}>
        <button
          onClick={() => setActiveSubTab('bills')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'bills'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>Customer Bills</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
            activeSubTab === 'bills' 
              ? 'bg-white/20 text-white' 
              : isDarkMode 
                ? 'bg-slate-800 text-slate-400' 
                : 'bg-slate-300 text-slate-700'
          }`}>
            {uniqueBills.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'expenses'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Club Outflows</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
            activeSubTab === 'expenses' 
              ? 'bg-white/20 text-white' 
              : isDarkMode 
                ? 'bg-slate-800 text-slate-400' 
                : 'bg-slate-300 text-slate-700'
          }`}>
            {activeExpenses.length}
          </span>
        </button>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div id="bills-kpi-summary" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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

        <div 
          onClick={() => setActiveSubTab('expenses')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeSubTab === 'expenses'
              ? 'ring-2 ring-indigo-500 bg-indigo-500/5'
              : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200/90 shadow-sm hover:border-indigo-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-rose-400' : 'text-rose-600 font-extrabold'
          }`}>Logged Club Expenses</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            isDarkMode ? 'text-rose-400' : 'text-rose-600'
          }`}>
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            {activeExpenses.length} operational outflow logs
          </span>
        </div>

        {/* 5th KPI: Net Financial Margin */}
        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500 font-extrabold'
            }`}>Net Operating Flow</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            kpis.totalRevenue - totalExpenseAmount >= 0
              ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              : isDarkMode ? 'text-rose-400' : 'text-rose-600'
          }`}>
            ₹{(kpis.totalRevenue - totalExpenseAmount).toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
            Invoiced revenue minus expenses
          </span>
        </div>
      </div>

      {/* 2. CUSTOMER BILLS SUB-TAB VIEW */}
      {activeSubTab === 'bills' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER TOOLBAR (STREAMLINED MOBILE LAYOUT) */}
          <div id="bills-filter-toolbar" className={`p-3 sm:p-4 rounded-2xl border space-y-2.5 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
          }`}>
            {/* ROW 1: SEARCH BAR + COMPACT FILTERS TOGGLE BUTTON */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={statusFilter === 'CANCELLED' ? "Search cancelled table, reason, player..." : "Search Bill No, Table or Player..."}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold border outline-hidden transition ${
                    isDarkMode 
                      ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  showAdvancedFilters || selectedCategory !== 'all' || selectedSplitRule !== 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : isDarkMode
                      ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Filters</span>
                {(selectedCategory !== 'all' || selectedSplitRule !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* ROW 2: SINGLE HORIZONTAL QUICK CHIP STRIP */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {/* Status Chips */}
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  statusFilter === 'all'
                    ? isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === 'all' ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                  {uniqueBills.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('SETTLED')}
                className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  statusFilter === 'SETTLED'
                    ? isDarkMode ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Paid</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === 'SETTLED' ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                  {uniqueBills.filter(b => b.status === 'SETTLED').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('UNSETTLED')}
                className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  statusFilter === 'UNSETTLED'
                    ? isDarkMode ? 'bg-rose-600 text-white border-rose-500 shadow-xs' : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3 h-3 text-rose-400" />
                <span>Unsettled</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === 'UNSETTLED' ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                  {uniqueBills.filter(b => b.status === 'UNSETTLED').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('CANCELLED')}
                className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  statusFilter === 'CANCELLED'
                    ? isDarkMode ? 'bg-rose-700 text-white border-rose-600 shadow-xs' : 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-rose-300' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <Ban className="w-3 h-3 text-rose-400" />
                <span>Cancelled</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusFilter === 'CANCELLED' ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                  {cancelledSessions?.length || 0}
                </span>
              </button>

              <div className={`h-4 w-px my-auto mx-1 shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`} />

              {/* Date Quick Chips */}
              {(['all', 'today', 'yesterday', 'week'] as const).map(df => (
                <button
                  key={df}
                  type="button"
                  onClick={() => setDateFilter(df)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold capitalize whitespace-nowrap transition border shrink-0 cursor-pointer ${
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

            {/* COLLAPSIBLE ADVANCED FILTERS */}
            <div className={`pt-3 border-t flex-wrap items-center gap-2.5 ${
              showAdvancedFilters ? 'flex' : 'hidden sm:flex'
            } ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode ? 'text-slate-400' : 'text-slate-700'
              }`}>
                <Filter className={`w-3.5 h-3.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>Filters:</span>
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Split Rule Filter */}
              {statusFilter !== 'CANCELLED' && (
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
              )}

              {/* Mobile-only View Mode Toggle (Cards vs Table) */}
              <div className={`p-0.5 rounded-lg border flex items-center shrink-0 ml-auto ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
              }`}>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Detailed Cards View"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Compact Table View"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {(selectedCategory !== 'all' || selectedSplitRule !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSplitRule('all');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setSearchQuery('');
                  }}
                  className={`text-xs font-extrabold cursor-pointer ${
                    isDarkMode ? 'text-rose-400 hover:underline' : 'text-rose-600 hover:text-rose-700 hover:underline'
                  }`}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. CANCELLED / VOIDS AUDIT LOG VIEW                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {statusFilter === 'CANCELLED' ? (
        <div className="space-y-4">
          {/* Informational Anti-Leakage & Void Security Notice */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDarkMode 
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border shrink-0 ${
                isDarkMode ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  Session Cancellation & Void Audit Ledger
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-200 text-rose-900'
                  }`}>
                    Anti-Fraud
                  </span>
                </h3>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-rose-300/80' : 'text-rose-700'}`}>
                  Cancelled sessions have <strong>NO Bill/Invoice #</strong>, add <strong>₹0 to player ledger balances</strong>, and contribute <strong>zero rupees to club revenue</strong>.
                </p>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border ${
              isDarkMode ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-white border-rose-200 text-rose-800 shadow-xs'
            }`}>
              {filteredCancelledSessions.length} Voided Entries • ₹{totalVoidedAmount.toLocaleString('en-IN')} Discarded
            </div>
          </div>

          {filteredCancelledSessions.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <ShieldAlert className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-500 opacity-50' : 'text-slate-400'}`} />
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No cancelled sessions recorded</h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                All game sessions were properly finalized and billed. No void records match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Mobile View: Render compact card list with drawer triggers */}
              <div className="block md:hidden space-y-4">
                {filteredCancelledSessions.map((item, index) => {
                  const { dateStr } = formatDateTime(new Date(item.cancelledAt).toISOString());
                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl border p-4 space-y-3 transition overflow-hidden cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-900/70 border-slate-800' 
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                      onClick={() => setActiveMobileDrawerCancelledSession(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                            VOID
                          </span>
                          <span className={`font-mono font-black text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {item.assetName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold line-through text-rose-500">
                          ₹{item.discardedMeterAmount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {item.durationFormatted}
                        </span>
                        <span>{dateStr}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-150 dark:border-slate-800/85">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-1.5 py-0.2 rounded border border-slate-300 dark:border-slate-700/85">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMobileDrawerCancelledSession(item);
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Audit Details →
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* PC View: Dual-Pane Master-Detail Split Layout */}
              <div className="hidden md:grid grid-cols-5 gap-5 items-start">
                
                {/* LEFT COLUMN: THE CANCELLED LEDGER TABLE (3/5 width) */}
                <div className="col-span-3 space-y-3">
                  <div className={`rounded-2xl border overflow-hidden shadow-xl ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                            isDarkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            <th className="p-3">Asset</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3 text-right">Discarded</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                          {filteredCancelledSessions.map((item, index) => {
                            const { dateStr } = formatDateTime(new Date(item.cancelledAt).toISOString());
                            const isSelected = activePcCancelledSession?.id === item.id;
                            return (
                              <tr
                                key={item.id || index}
                                onClick={() => setFocusedPcCancelledSessionId(item.id)}
                                className={`cursor-pointer transition ${
                                  isSelected
                                    ? isDarkMode ? 'bg-rose-950/20 text-rose-300 font-bold' : 'bg-rose-50 text-rose-950 font-bold'
                                    : isDarkMode ? 'hover:bg-slate-800/20 text-slate-300' : 'hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                      <Ban className="w-3 h-3" />
                                    </div>
                                    <span className="font-mono font-black">{item.assetName}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700/80">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500 dark:text-slate-400">
                                  {dateStr}
                                </td>
                                <td className="p-3 font-mono">
                                  {item.durationFormatted}
                                </td>
                                <td className="p-3 text-right font-mono font-black text-rose-500 line-through">
                                  ₹{item.discardedMeterAmount}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DETAIL INSPECTOR SIDEBAR (2/5 width) */}
                <div className="col-span-2 space-y-4">
                  {activePcCancelledSession ? (
                    <div className={`rounded-2xl border p-4 shadow-xl flex flex-col justify-between transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800' 
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                      {/* Detailed Inspector content */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-mono font-black text-[10px] text-rose-500">VOIDED SESSION</div>
                              <h2 className="text-sm font-black tracking-tight">{activePcCancelledSession.assetName}</h2>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700">
                            {activePcCancelledSession.category} • {activePcCancelledSession.matchType}
                          </span>
                        </div>

                        <div className="space-y-3">
                          
                          {/* Duration played box */}
                          <div className={`p-3 rounded-xl border ${
                            isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Duration Played</span>
                            </div>
                            <div className="text-sm font-black">{activePcCancelledSession.durationFormatted}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatTimeOnly(activePcCancelledSession.startTime)} ➔ {formatTimeOnly(activePcCancelledSession.cancelledAt)} ({activePcCancelledSession.durationMinutes} mins)
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-405 mt-1">
                              Configured Rate: ₹{activePcCancelledSession.hourlyRate}/hr
                            </div>
                          </div>

                          {/* Discarded meter value box */}
                          <div className={`p-3 rounded-xl border ${
                            isDarkMode ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50/60 border-rose-200/60'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Discarded Meter Value</span>
                            </div>
                            <div className="text-lg font-black font-mono text-rose-500 line-through">
                              ₹{activePcCancelledSession.discardedMeterAmount}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Zero Customer Debt
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">
                              Excluded from gross revenue
                            </div>
                          </div>

                          {/* Inventory reversal box */}
                          <div className={`p-3 rounded-xl border ${
                            isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              <Coffee className="w-3.5 h-3.5 text-amber-500" />
                              <span>Inventory Reversal</span>
                            </div>
                            {activePcCancelledSession.returnedStockSummary && activePcCancelledSession.returnedStockSummary.length > 0 ? (
                              <div className="space-y-1">
                                {activePcCancelledSession.returnedStockSummary.map((s: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                    <span>{s.quantity}x {s.name} returned to stock</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic">No bar items attached</div>
                            )}
                          </div>

                          {/* Tagged players box */}
                          <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                            isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-xs font-bold text-slate-400">Players:</span>
                              {activePcCancelledSession.taggedPlayers && activePcCancelledSession.taggedPlayers.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {activePcCancelledSession.taggedPlayers.map((p: any) => (
                                    <span key={p.id} className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">None</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 shrink-0">
                              Ledger Untouched
                            </span>
                          </div>

                          {/* Cancellation Reason audit */}
                          <div className={`p-3 rounded-xl border space-y-1.5 ${
                            isDarkMode ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>Reason for Cancellation</span>
                            </div>
                            <p className="text-xs italic font-medium">
                              "{activePcCancelledSession.cancellationReason || 'No specific reason provided'}"
                            </p>
                            <div className="text-[10px] pt-1.5 border-t border-rose-500/15 text-slate-400 font-bold">
                              Operator: <span className="text-rose-500">{activePcCancelledSession.cancelledBy || 'Staff'}</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Sticky Footer copy audit action */}
                      <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleCopyAuditRecord(activePcCancelledSession)}
                          className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            copiedAuditId === activePcCancelledSession.id
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-xs'
                          }`}
                        >
                          {copiedAuditId === activePcCancelledSession.id ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              <span>Copied Log to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Audit Log Record</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className={`rounded-2xl border p-8 text-center ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
                    }`}>
                      <ShieldAlert className="w-8 h-8 mx-auto text-slate-500 opacity-50 mb-2" />
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Void Selected</h3>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* 4. STANDARD INVOICES LISTING (CARDS / TABLE)                       */
        /* ═══════════════════════════════════════════════════════════════════ */
        filteredBills.length === 0 ? (
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
        /* --- DUAL PANE WORKSPACE ON DESKTOP / COMPACT CARDS ON MOBILE --- */
        <div className="space-y-4">
          
          {/* Mobile View: Render simple vertical cards as before */}
          <div className="block md:hidden space-y-4">
            {filteredBills.map((bill, index) => {
              const { dateStr, timeStr } = formatDateTime(bill.timestamp);
              const startTimeStr = formatTimeOnly(bill.startTime);
              const endTimeStr = formatTimeOnly(bill.endTime);
              const isBar = isBarBill(bill);

              if (isBar) {
                const primaryCustomer = bill.players?.[0] || { name: 'Walk-In Guest', whatsapp: '' };
                const paymentMethod = bill.shares?.[0]?.paymentMethod || 'Cash';
                const isKhata = paymentMethod === 'LEDGER' || bill.status === 'UNSETTLED';

                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 space-y-3 transition overflow-hidden ${
                      isDarkMode 
                        ? 'bg-slate-900/70 border-slate-800' 
                        : 'bg-white border-slate-200/90 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                          {bill.billNo}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                          isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          Bar & Cafe Order
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                          bill.status === 'SETTLED'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        }`}>
                          {bill.status === 'SETTLED' ? 'Settled' : 'Ledger'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {timeStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        <span>Cafe POS Sale</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        {bill.barItemsSummary?.length || 1} items
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Grand Total</div>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{bill.grandTotal.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getWhatsAppInvoiceLink(bill)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition shrink-0"
                          title="Share on WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setActiveMobileDrawerBill(bill)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Breakdown</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-4 space-y-3 transition overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200/90 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono font-black text-xs shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                        {bill.billNo}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border whitespace-nowrap overflow-hidden text-ellipsis ${
                        isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>
                        {bill.assetName}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border shrink-0 ${
                      bill.status === 'SETTLED'
                        ? isDarkMode 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isDarkMode 
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {bill.status === 'SETTLED' ? 'Settled' : 'Ledger'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{bill.durationMinutes}m ({startTimeStr} - {endTimeStr})</span>
                    </div>
                    <span className="text-slate-400 font-medium text-[10px]">
                      {timeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {bill.shares.map((share) => (
                        <div 
                          key={share.playerId}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black uppercase tracking-tighter ${
                            isDarkMode 
                              ? 'bg-slate-800 border-slate-900 text-slate-200' 
                              : 'bg-slate-100 border-white text-slate-800 shadow-2xs'
                          }`}
                          title={share.playerName}
                        >
                          {share.playerName.substring(0, 2)}
                        </div>
                      ))}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-2 font-semibold">
                        {bill.shares.length} Player{bill.shares.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-right text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                      {bill.gameSplitRule.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Grand Total</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{bill.grandTotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={getWhatsAppInvoiceLink(bill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition shrink-0"
                        title="Share on WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setActiveMobileDrawerBill(bill)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Breakdown</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop View: Master-Detail Split Double Column Workspace */}
          <div className="hidden md:grid grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Compact Scannable Bill Ledger Table (7 cols) */}
            <div className={`col-span-12 lg:col-span-7 rounded-2xl border overflow-hidden transition-colors ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="overflow-x-auto select-none">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase tracking-wider font-extrabold ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100/90 border-slate-200 text-slate-700'
                    }`}>
                      <th className="p-3">Bill ID / Date</th>
                      <th className="p-3">Game Station</th>
                      <th className="p-3">Players Stack</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                    {filteredBills.map((bill) => {
                      const isActive = activePcBill && activePcBill.id === bill.id;
                      const isBar = isBarBill(bill);
                      const { timeStr } = formatDateTime(bill.timestamp);
                      const numPlayers = bill.shares?.length || 0;

                      return (
                        <tr 
                          key={bill.id}
                          onClick={() => setFocusedPcBill(bill)}
                          className={`cursor-pointer transition-all duration-150 ${
                            isActive
                              ? isDarkMode
                                ? 'bg-indigo-500/10 text-white font-bold'
                                : 'bg-indigo-50/80 text-indigo-900 font-bold border-l-4 border-l-indigo-600'
                              : isDarkMode
                                ? 'hover:bg-slate-800/20 text-slate-300'
                                : 'hover:bg-slate-50/80 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-mono font-black text-indigo-500 dark:text-indigo-400">{bill.billNo}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{timeStr}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-extrabold flex items-center gap-1.5">
                              {isBar ? (
                                <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <Gamepad2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              )}
                              <span className="truncate max-w-[130px]">{isBar ? 'Cafe Quick POS' : bill.assetName}</span>
                            </div>
                            <div className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">
                              {isBar ? 'Cafe Counter' : `${bill.durationMinutes} mins`}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                              {bill.shares?.slice(0, 3).map((s) => (
                                <div 
                                  key={s.playerId} 
                                  className={`w-5 h-5 rounded-full border text-[8px] font-black flex items-center justify-center uppercase tracking-tighter shrink-0 ${
                                    isDarkMode ? 'bg-slate-800 border-slate-900 text-slate-200' : 'bg-slate-100 border-white text-slate-800'
                                  }`}
                                  title={s.playerName}
                                >
                                  {s.playerName.substring(0, 2)}
                                </div>
                              ))}
                              {numPlayers > 3 && (
                                <span className="text-[9px] text-slate-400 font-bold pl-1.5">+{numPlayers - 3}</span>
                              )}
                              {numPlayers === 0 && <span className="text-slate-400 italic">None</span>}
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-black text-sm">
                            ₹{bill.grandTotal.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                              bill.status === 'SETTLED'
                                ? isDarkMode
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                                : isDarkMode
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-amber-50 text-amber-900 border-amber-250'
                            }`}>
                              {bill.status === 'SETTLED' ? 'Settled' : 'Ledger'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Contextual Invoice Inspector Panel (5 cols) */}
            <div className="col-span-12 lg:col-span-5 select-none">
              {activePcBill ? (
                <div className={`rounded-2xl border p-5 space-y-5 transition-colors sticky top-6 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}>
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <Receipt className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
                          <span>Invoice Panel</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black uppercase border ${
                            activePcBill.status === 'SETTLED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {activePcBill.status === 'SETTLED' ? 'Paid' : 'Ledger'}
                          </span>
                        </h3>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>
                          {activePcBill.billNo} · {formatDateTime(activePcBill.timestamp).dateStr}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Asset & Session Box */}
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isBarBill(activePcBill) ? (
                          <Coffee className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Gamepad2 className="w-4 h-4 text-indigo-500" />
                        )}
                        <span className="font-black text-xs">
                          {isBarBill(activePcBill) ? 'Club Cafe POS Sale' : activePcBill.assetName}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700">
                        {isBarBill(activePcBill) ? 'Counter Sale' : activePcBill.category}
                      </span>
                    </div>

                    {!isBarBill(activePcBill) && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/40' : 'bg-white border-slate-200/80'}`}>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Duration</span>
                          <span className="font-extrabold">{activePcBill.durationMinutes} mins</span>
                        </div>
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/40' : 'bg-white border-slate-200/80'}`}>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Start</span>
                          <span className="font-mono font-bold text-[10px]">{formatTimeOnly(activePcBill.startTime)}</span>
                        </div>
                        <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/40' : 'bg-white border-slate-200/80'}`}>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">End</span>
                          <span className="font-mono font-bold text-[10px]">{formatTimeOnly(activePcBill.endTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial High-Level Totals */}
                  <div className="space-y-2 text-xs">
                    {!isBarBill(activePcBill) && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Game Session Cost:</span>
                          <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{activePcBill.totalGameCost.toFixed(2)}</span>
                        </div>
                        {getBillGameCostBreakdown(activePcBill) && (
                          <div className="flex justify-between items-center text-[10px] font-bold pl-2">
                            <span className={isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}>↳ Hourly Calculation:</span>
                            <span className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600 font-semibold'}`}>{getBillGameCostBreakdown(activePcBill)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cafe & Beverage Orders:</span>
                      <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{activePcBill.totalBarCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-250 dark:border-slate-800/80 font-black text-xs">
                      <span className="text-slate-800 dark:text-slate-200 uppercase tracking-wider font-extrabold">GRAND TOTAL AMOUNT:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-extrabold">₹{activePcBill.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Players Splits list */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Player Settlement Accounts</div>
                    <div className="space-y-3">
                      {activePcBill.shares.map((share) => {
                        const isLoserPays = activePcBill.gameSplitRule === '1v1_loser_pays' || activePcBill.gameSplitRule === '2v2_loser_pays';
                        const isLoser = isLoserPays && (activePcBill.losingPlayerIds.includes(share.playerId) || share.isLoser);
                        const isWinner = isLoserPays && (activePcBill.winningPlayerIds?.includes(share.playerId) || share.isWinner);
                        const isHost = activePcBill.singlePayerId === share.playerId || share.isHost;

                        // Calculate discount
                        const savedDiscount = (share.gameDiscountAmount || 0) + (share.barDiscountAmount || 0);
                        const calculatedDiscount = Math.max(0, (share.gameShare || 0) + (share.barShare || 0) - (share.totalShare || 0));
                        const displayDiscount = savedDiscount > 0 ? savedDiscount : calculatedDiscount;
                        
                        const numPlayers = activePcBill.players?.length || 2;
                        const playerIndividualShare = activePcBill.totalGameCost / numPlayers;
                        const discountPercent = share.gameDiscountPercent || (displayDiscount > 0 ? 100 : 0);

                        return (
                          <div 
                            key={share.playerId} 
                            className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                              isDarkMode ? 'bg-slate-950/20 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{share.playerName}</span>
                                {share.membershipBadge && (
                                  <span className="ml-2 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    ⭐ {share.membershipBadge}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-slate-400 text-[10px]">{share.paymentMethod}</span>
                            </div>

                            {/* Role badges */}
                            <div className="flex flex-wrap gap-1">
                              {isLoser && <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Loser (Pays)</span>}
                              {isWinner && <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Winner</span>}
                              {isHost && <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">Host</span>}
                              {!isLoser && !isWinner && !isHost && <span className="px-1.5 py-0.2 rounded text-[8px] font-semibold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700">Equal Share</span>}
                            </div>

                            {/* Share breakdown */}
                            <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Game Portion:</span>
                                <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{share.gameShare.toFixed(2)}</span>
                              </div>
                              {displayDiscount > 0 && (
                                <div className="space-y-0.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                                  <div className="flex justify-between items-center font-bold text-amber-500">
                                    <span>↳ VIP Waiver:</span>
                                    <span>-₹{displayDiscount.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium pl-3">
                                    {discountPercent}% off ₹{playerIndividualShare.toFixed(2)} share
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Cafe POS Portion:</span>
                                <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{share.barShare.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 font-black">
                                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>Net share due:</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-black">₹{share.totalShare.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attached CafePOS items */}
                  {activePcBill.barItemsSummary && activePcBill.barItemsSummary.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Itemized Cafe Inventory Orders</div>
                      <div className={`rounded-xl border p-3.5 space-y-2 text-xs divide-y ${
                        isDarkMode ? 'bg-slate-950/20 border-slate-850 divide-slate-800/60' : 'bg-slate-50 border-slate-150 divide-slate-200'
                      }`}>
                        {activePcBill.barItemsSummary.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 text-[11px]">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-250">{item.name}</div>
                              <div className="text-[9px] text-slate-400 font-mono">₹{item.price.toFixed(2)} × {item.quantity}</div>
                            </div>
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-350 font-black">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800/80 font-semibold">
                    <button
                      onClick={() => handleCopyBillText(activePcBill)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black transition border cursor-pointer flex-1 flex items-center justify-center gap-1.5 ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Summary</span>
                    </button>

                    <a
                      href={getWhatsAppInvoiceLink(activePcBill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl text-xs font-black transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Share</span>
                    </a>

                    <button
                      onClick={() => {
                        if (isBarBill(activePcBill)) {
                          setSelectedBarReceipt(activePcBill);
                        } else {
                          setSelectedBill(activePcBill);
                        }
                      }}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-black transition bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Invoice</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className={`rounded-2xl border p-12 text-center transition-colors ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200/90 text-slate-500 shadow-xs'
                }`}>
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Invoice Selected</h3>
                  <p className="text-[11px] mt-1 max-w-xs mx-auto">
                    Click on any row in the register table to view complete PvP calculation breakdowns, itemized orders, and printed receipts.
                  </p>
                </div>
              )}
            </div>

          </div>
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
      )
    )}
        </div>
      )}

      {/* 3. CLUB EXPENSES SUB-TAB VIEW */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          {/* SEARCH & CATEGORY FILTER TOOLBAR */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
          }`}>
            {/* Expense Category Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Categories', icon: '📋' },
                { id: 'RENT', label: 'Rent', icon: '🏠' },
                { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡' },
                { id: 'SALARY', label: 'Salaries', icon: '👥' },
                { id: 'INTERNET_SOFTWARE', label: 'Software/Wifi', icon: '🌐' },
                { id: 'BAR_PURCHASE', label: 'Bar Stock', icon: '🍺' },
                { id: 'MAINTENANCE', label: 'Maintenance', icon: '🎱' },
                { id: 'SUPPLIES', label: 'Supplies', icon: '📦' },
                { id: 'MISC', label: 'Misc', icon: '🛠️' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedExpenseCategoryFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition border flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    selectedExpenseCategoryFilter === cat.id
                      ? isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search Input & Period Date Filter */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search expenses by vendor, title, receipt #, or logged by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <div className={`p-1 rounded-xl border flex items-center shrink-0 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setDateFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      dateFilter === 'all'
                        ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-xs'
                        : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilter('today')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      dateFilter === 'today'
                        ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-xs'
                        : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilter('yesterday')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      dateFilter === 'yesterday'
                        ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-xs'
                        : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilter('week')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      dateFilter === 'week'
                        ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-xs'
                        : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EXPENSES REGISTER LIST */}
          {filteredExpenses.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base">No Operating Expenses Recorded</h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Keep track of rent, electricity, staff wages, bar inventory stock, and repairs against your daily club income.
              </p>
              <button
                onClick={() => setIsLogExpenseOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log First Expense</span>
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden shadow-xl ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Title / Vendor</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Receipt #</th>
                      <th className="p-3.5">Logged By</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {filteredExpenses.map((exp) => {
                      const badge = getExpenseCategoryBadge(exp.category);
                      const isVoided = exp.status === 'VOIDED';

                      return (
                        <tr 
                          key={exp.id}
                          className={`transition ${
                            isVoided 
                              ? isDarkMode ? 'bg-rose-950/10 opacity-60' : 'bg-rose-50/40 opacity-60'
                              : isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3.5 font-mono text-[11px] whitespace-nowrap font-bold">
                            {exp.expenseDate}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${badge.color}`}>
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold">
                            <div>{exp.title}</div>
                            {exp.notes && (
                              <div className={`text-[10px] font-normal mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {exp.notes}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                              exp.paymentMethod === 'CASH'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : exp.paymentMethod === 'UPI'
                                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {exp.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                            {exp.receiptNo ? (
                              <span className="font-bold">{exp.receiptNo}</span>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-[11px] whitespace-nowrap text-slate-400">
                            {exp.loggedByEmail ? exp.loggedByEmail.split('@')[0] : 'Staff'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {isVoided ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <span>VOIDED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>
                          <td className={`p-3.5 text-right font-mono text-sm font-black whitespace-nowrap ${
                            isVoided ? 'line-through text-slate-500' : 'text-rose-500'
                          }`}>
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {!isVoided && userRole === 'club_owner' && (
                              <button
                                onClick={() => setVoidConfirmExpense(exp)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
                                title="Void Expense Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4A. MODAL: LOG CLUB EXPENSE */}
      {isLogExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Log Club Expense</h3>
                  <p className="text-xs text-slate-400">Record an operational expense against club revenue</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogExpenseOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="RENT">🏠 Rent & Premises</option>
                  <option value="ELECTRICITY">⚡ Electricity & Water Bill</option>
                  <option value="SALARY">👥 Staff Salary & Wages</option>
                  <option value="INTERNET_SOFTWARE">🌐 Internet & Software Subscriptions</option>
                  <option value="BAR_PURCHASE">🍺 Bar & Snack Inventory Stock</option>
                  <option value="MAINTENANCE">🎱 Table / Console Maintenance & Chalks</option>
                  <option value="SUPPLIES">📦 Consumables & Cleaning Supplies</option>
                  <option value="MISC">🛠️ Miscellaneous Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Title / Vendor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October Rent / BESCOM Bill"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Expense Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 shrink-0" />
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Receipt / Voucher #</label>
                  <input
                    type="text"
                    placeholder="e.g. RCP-8839"
                    value={expReceiptNo}
                    onChange={(e) => setExpReceiptNo(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Notes / Description</label>
                  <input
                    type="text"
                    placeholder="Optional details"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogExpenseOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingExpense ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4B. MODAL: VOID EXPENSE CONFIRMATION */}
      {voidConfirmExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">Void Expense Entry</h3>
                <p className="text-xs text-slate-400">Date: {voidConfirmExpense.expenseDate}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to void <strong className="text-white">{voidConfirmExpense.title}</strong> worth <strong className="text-rose-400 font-mono">₹{voidConfirmExpense.amount}</strong>? This will remove it from P&L calculations.
            </p>

            <form onSubmit={handleVoidExpenseSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reason for Voiding *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplicate entry / Incorrect amount entered"
                  value={voidReasonText}
                  onChange={(e) => setVoidReasonText(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVoidConfirmExpense(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVoid || !voidReasonText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmittingVoid ? 'Voiding...' : 'Confirm Void'}
                </button>
              </div>
            </form>
          </div>
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

      {/* 4C. MOBILE BREAKDOWN DRAWER SHEET */}
      <AnimatePresence>
        {activeMobileDrawerBill && (
          <>
            {/* Dark Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMobileDrawerBill(null)}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end justify-center md:items-center p-0 md:p-4 animate-fade-in"
            >
              {/* Drawer Container */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full md:max-w-xl rounded-t-3xl md:rounded-2xl border flex flex-col max-h-[90vh] md:max-h-[85vh] shadow-2xl overflow-hidden ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Drawer Top Handle (Mobile only) */}
                <div className="md:hidden pt-2.5 pb-1 shrink-0">
                  <div className="w-12 h-1.5 rounded-full mx-auto bg-slate-700/40"></div>
                </div>

                {/* Drawer Header */}
                <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
                  isDarkMode ? 'border-slate-800/85 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      <Receipt className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm tracking-tight truncate flex items-center gap-2">
                        <span>Invoice Breakdown</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide border ${
                          activeMobileDrawerBill.status === 'SETTLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {activeMobileDrawerBill.status === 'SETTLED' ? 'Paid' : 'Ledger'}
                        </span>
                      </h3>
                      <p className={`text-[10px] truncate mt-0.5 font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activeMobileDrawerBill.billNo} • {formatDateTime(activeMobileDrawerBill.timestamp).dateStr} at {formatDateTime(activeMobileDrawerBill.timestamp).timeStr}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMobileDrawerBill(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
                  
                  {/* Station & Game Details Box */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {isBarBill(activeMobileDrawerBill) ? (
                          <Coffee className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        ) : (
                          <Gamepad2 className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        )}
                        <span className="font-black text-sm truncate">
                          {isBarBill(activeMobileDrawerBill) ? 'Club Cafe & Refreshments' : activeMobileDrawerBill.assetName}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                        isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-2xs'
                      }`}>
                        {isBarBill(activeMobileDrawerBill) ? 'Counter Sale' : activeMobileDrawerBill.category}
                      </span>
                    </div>

                    {!isBarBill(activeMobileDrawerBill) && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-0.5">
                        <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Duration</span>
                          <span className="font-bold">{activeMobileDrawerBill.durationMinutes} mins</span>
                        </div>
                        <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Start</span>
                          <span className="font-mono font-bold text-[10px]">{formatTimeOnly(activeMobileDrawerBill.startTime)}</span>
                        </div>
                        <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">End</span>
                          <span className="font-mono font-bold text-[10px]">{formatTimeOnly(activeMobileDrawerBill.endTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial High-Level Totals */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-950/30 border-slate-800/80' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger Breakdown</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                        isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        Split: {activeMobileDrawerBill.gameSplitRule.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {!isBarBill(activeMobileDrawerBill) && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Game Session Cost:</span>
                            <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{activeMobileDrawerBill.totalGameCost.toFixed(2)}</span>
                          </div>
                          {getBillGameCostBreakdown(activeMobileDrawerBill) && (
                            <div className="flex justify-between items-center text-[10px] font-bold pl-2">
                              <span className={isDarkMode ? 'text-indigo-305' : 'text-indigo-700'}>↳ Session Calculation:</span>
                              <span className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600 font-semibold'}`}>{getBillGameCostBreakdown(activeMobileDrawerBill)}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cafe & Beverage Orders:</span>
                        <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{activeMobileDrawerBill.totalBarCost.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800/80 font-black text-xs">
                        <span className="text-slate-800 dark:text-slate-200 uppercase tracking-wider font-extrabold">GRAND TOTAL AMOUNT:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-extrabold">₹{activeMobileDrawerBill.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Player Shares Splitting Engine Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-300">
                        Player Accounts Breakdown
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeMobileDrawerBill.shares.map((share) => {
                        const isLoserPays = activeMobileDrawerBill.gameSplitRule === '1v1_loser_pays' || activeMobileDrawerBill.gameSplitRule === '2v2_loser_pays';
                        const isLoser = isLoserPays && (activeMobileDrawerBill.losingPlayerIds.includes(share.playerId) || share.isLoser);
                        const isWinner = isLoserPays && (activeMobileDrawerBill.winningPlayerIds?.includes(share.playerId) || share.isWinner);
                        const isHost = activeMobileDrawerBill.singlePayerId === share.playerId || share.isHost;

                        // Calculate discount
                        const savedDiscount = (share.gameDiscountAmount || 0) + (share.barDiscountAmount || 0);
                        const calculatedDiscount = Math.max(0, (share.gameShare || 0) + (share.barShare || 0) - (share.totalShare || 0));
                        const displayDiscount = savedDiscount > 0 ? savedDiscount : calculatedDiscount;
                        
                        const numPlayers = activeMobileDrawerBill.players?.length || 2;
                        const playerIndividualShare = activeMobileDrawerBill.totalGameCost / numPlayers;
                        const discountPercent = share.gameDiscountPercent || (displayDiscount > 0 ? 100 : 0);

                        return (
                          <div 
                            key={share.playerId}
                            className={`p-4 rounded-2xl border space-y-2.5 transition ${
                              isDarkMode 
                                ? 'bg-slate-950/40 border-slate-800' 
                                : 'bg-slate-50 border-slate-200 shadow-2xs'
                            }`}
                          >
                            {/* Player Row Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className={`font-extrabold text-xs flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                  <span>{share.playerName}</span>
                                  {share.whatsapp && (
                                    <a
                                      href={getWhatsAppInvoiceLink(activeMobileDrawerBill, share.playerId)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition"
                                      title="Share personalized bill on WhatsApp"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                {share.whatsapp && (
                                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                    {share.whatsapp}
                                  </div>
                                )}
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wide ${
                                share.paymentMethod === 'Cash'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : share.paymentMethod === 'UPI'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {share.paymentMethod}
                              </span>
                            </div>

                            {/* Badges bar */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isLoser ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-rose-500/15 text-rose-400 border border-rose-500/25">
                                  Loser (Pays)
                                </span>
                              ) : isWinner ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                  Winner
                                </span>
                              ) : isHost ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-purple-500/15 text-purple-400 border border-purple-500/25">
                                  Host Payer
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/80">
                                  Equal Share
                                </span>
                              )}

                              {share.membershipBadge && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center gap-0.5">
                                  ⭐ {share.membershipBadge}
                                </span>
                              )}
                            </div>

                            {/* Share calculation */}
                            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Game Cost Portion:</span>
                                <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{share.gameShare.toFixed(2)}</span>
                              </div>

                              {displayDiscount > 0 && (
                                <div className="space-y-1 bg-amber-500/5 p-2 rounded-xl border border-amber-500/15">
                                  <div className="flex justify-between items-center">
                                    <span className="text-amber-500 font-extrabold flex items-center gap-1">
                                      <span>↳</span> VIP Member Waiver:
                                    </span>
                                    <span className="font-mono font-black text-amber-500">-₹{displayDiscount.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold pl-3 lowercase first-letter:uppercase leading-tight">
                                    {discountPercent}% of ₹{playerIndividualShare.toFixed(2)} individual share
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Cafe POS Portion:</span>
                                <span className={`font-mono font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>₹{share.barShare.toFixed(2)}</span>
                              </div>

                              <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 font-black text-xs">
                                <span className={`font-extrabold uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>NET DUE AMOUNT:</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-black">₹{share.totalShare.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attached CafePOS items details (if any) */}
                  {activeMobileDrawerBill.barItemsSummary && activeMobileDrawerBill.barItemsSummary.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-300">
                          Itemized Refreshments
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl border divide-y ${
                        isDarkMode ? 'bg-slate-950/20 border-slate-800 divide-slate-800/60' : 'bg-slate-50 border-slate-200 divide-slate-200'
                      }`}>
                        {activeMobileDrawerBill.barItemsSummary.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">₹{item.price.toFixed(2)} × {item.quantity}</div>
                            </div>
                            <span className="font-mono font-black text-slate-800 dark:text-slate-200">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Drawer Footer Actions (Sticky) */}
                <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
                  isDarkMode ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-150 bg-slate-50/90'
                }`}>
                  <button
                    onClick={() => {
                      const bill = activeMobileDrawerBill;
                      setActiveMobileDrawerBill(null);
                      handleCopyBillText(bill);
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                        : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      const bill = activeMobileDrawerBill;
                      setActiveMobileDrawerBill(null);
                      if (isBarBill(bill)) {
                        setSelectedBarReceipt(bill);
                      } else {
                        setSelectedBill(bill);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Bill</span>
                  </button>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4D. MOBILE CANCELLED SESSION BREAKDOWN DRAWER SHEET */}
      <AnimatePresence>
        {activeMobileDrawerCancelledSession && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMobileDrawerCancelledSession(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-50 md:hidden max-h-[85vh] flex flex-col overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
              }`}
            >
              {/* Top Drag Handle Bar */}
              <div className="w-full flex justify-center py-3 shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              {/* Close Drawer Button */}
              <button
                type="button"
                onClick={() => setActiveMobileDrawerCancelledSession(null)}
                className={`absolute top-4 right-4 p-2 rounded-full transition ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Drawer Scrollable Content */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Drawer Header Badge Block */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono font-black text-[10px] text-rose-500">VOIDED SESSION</div>
                    <h2 className="text-sm font-black tracking-tight">{activeMobileDrawerCancelledSession.assetName}</h2>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Cancelled on {formatDateTime(new Date(activeMobileDrawerCancelledSession.cancelledAt).toISOString()).dateStr} at {formatDateTime(new Date(activeMobileDrawerCancelledSession.cancelledAt).toISOString()).timeStr}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3">
                  {/* 1. Time & Duration Box */}
                  <div className={`p-3 rounded-xl border ${
                    isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Duration Played</span>
                    </div>
                    <div className="text-sm font-black">{activeMobileDrawerCancelledSession.durationFormatted}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatTimeOnly(activeMobileDrawerCancelledSession.startTime)} ➔ {formatTimeOnly(activeMobileDrawerCancelledSession.cancelledAt)} ({activeMobileDrawerCancelledSession.durationMinutes} mins)
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-405 mt-1">
                      Configured Rate: ₹{activeMobileDrawerCancelledSession.hourlyRate}/hr
                    </div>
                  </div>

                  {/* 2. Discarded Money Box */}
                  <div className={`p-3 rounded-xl border ${
                    isDarkMode ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50/60 border-rose-200/60'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Discarded Meter Value</span>
                    </div>
                    <div className="text-lg font-black font-mono text-rose-500 line-through">
                      ₹{activeMobileDrawerCancelledSession.discardedMeterAmount}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Zero Customer Debt
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">
                      Excluded from gross revenue
                    </div>
                  </div>

                  {/* 3. Returned Inventory Box */}
                  <div className={`p-3 rounded-xl border ${
                    isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span>Inventory Reversal</span>
                    </div>
                    {activeMobileDrawerCancelledSession.returnedStockSummary && activeMobileDrawerCancelledSession.returnedStockSummary.length > 0 ? (
                      <div className="space-y-1">
                        {activeMobileDrawerCancelledSession.returnedStockSummary.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>{s.quantity}x {s.name} returned to stock</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">No bar items attached</div>
                    )}
                  </div>

                  {/* 4. Tagged Players */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-400">Players:</span>
                      {activeMobileDrawerCancelledSession.taggedPlayers && activeMobileDrawerCancelledSession.taggedPlayers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {activeMobileDrawerCancelledSession.taggedPlayers.map((p: any) => (
                            <span key={p.id} className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 shrink-0">
                      Ledger Untouched
                    </span>
                  </div>

                  {/* 5. Cancellation Reason & Operator */}
                  <div className={`p-3 rounded-xl border space-y-1.5 ${
                    isDarkMode ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Reason for Cancellation</span>
                    </div>
                    <p className="text-xs italic font-medium">
                      "{activeMobileDrawerCancelledSession.cancellationReason || 'No specific reason provided'}"
                    </p>
                    <div className="text-[10px] pt-1.5 border-t border-rose-500/15 text-slate-400 font-bold">
                      Operator: <span className="text-rose-500">{activeMobileDrawerCancelledSession.cancelledBy || 'Staff'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions (Sticky) */}
              <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
                isDarkMode ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-150 bg-slate-50/90'
              }`}>
                <button
                  onClick={() => {
                    const session = activeMobileDrawerCancelledSession;
                    setActiveMobileDrawerCancelledSession(null);
                    handleCopyAuditRecord(session);
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                      : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Audit Log</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
