import React, { useState, useEffect } from 'react';
import { CustomerPlayer, BarItem, GameAsset, ClubProfile, BillRecord, LedgerEntry, ClubExpense, ExpenseCategory } from '../types';
import { RetentionDashboard } from './RetentionDashboard';
import { ProfitLossPrintModal } from './ProfitLossPrintModal';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  CreditCard, 
  Users, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  Wallet,
  Receipt,
  Plus,
  Trash2,
  AlertCircle,
  Printer,
  FileText,
  X,
  Check,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { getLocalDateString, isDateInPeriod } from '../utils/billing';

interface AnalyticsViewProps {
  customers: CustomerPlayer[];
  barItems: BarItem[];
  gameAssets: GameAsset[];
  clubProfile: ClubProfile;
  bills?: BillRecord[];
  ledgerEntries?: LedgerEntry[];
  expenses?: ClubExpense[];
  onLogExpense?: (expense: Omit<ClubExpense, 'id' | 'createdAt' | 'status' | 'loggedByEmail'>) => void;
  onVoidExpense?: (id: string, reason: string) => void;
  userRole?: string;
  isDarkMode?: boolean;
}

const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  RENT: { label: 'Rent & Premises', icon: '🏠', color: 'bg-blue-500' },
  ELECTRICITY: { label: 'Electricity & Water', icon: '⚡', color: 'bg-amber-500' },
  SALARY: { label: 'Staff Salaries', icon: '👥', color: 'bg-indigo-500' },
  INTERNET_SOFTWARE: { label: 'Internet & Software', icon: '🌐', color: 'bg-cyan-500' },
  BAR_PURCHASE: { label: 'Bar & Stock Purchases', icon: '🍺', color: 'bg-emerald-500' },
  MAINTENANCE: { label: 'Equipment Maintenance', icon: '🎱', color: 'bg-purple-500' },
  SUPPLIES: { label: 'Consumables & Supplies', icon: '📦', color: 'bg-orange-500' },
  MISC: { label: 'Miscellaneous', icon: '🛠️', color: 'bg-slate-500' }
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  customers,
  barItems,
  gameAssets,
  clubProfile,
  bills = [],
  ledgerEntries = [],
  expenses = [],
  onLogExpense,
  onVoidExpense,
  userRole = 'club_owner',
  isDarkMode = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'expenses' | 'retention'>('revenue');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'ytd' | 'custom'>('daily');

  // Support automated navigation from POS Onboarding Guide
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && ['revenue', 'expenses', 'retention'].includes(e.detail)) {
        setActiveSubTab(e.detail);
      }
    };
    window.addEventListener('justclub_switch_analytics_tab', handler);
    return () => window.removeEventListener('justclub_switch_analytics_tab', handler);
  }, []);
  
  // Custom date picker state
  const todayStr = getLocalDateString();
  const firstOfMonthStr = getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Print P&L Modal State
  const [isPnlPrintOpen, setIsPnlPrintOpen] = useState(false);

  // Log Expense Modal State
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('RENT');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');
  const [expReceiptNo, setExpReceiptNo] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [expDate, setExpDate] = useState(todayStr);

  // Void Expense Modal State
  const [voidConfirmExpense, setVoidConfirmExpense] = useState<ClubExpense | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState('');

  // Compute days multiplier dynamically
  const getDaysCount = () => {
    if (period === 'daily') return 1;
    if (period === 'weekly') return 7;
    if (period === 'monthly') return 30;
    if (period === 'ytd') {
      const jan1 = new Date(new Date().getFullYear(), 0, 1).getTime();
      const now = new Date().getTime();
      return Math.max(1, Math.floor((now - jan1) / (1000 * 60 * 60 * 24)));
    }
    if (period === 'custom') {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const diffDays = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, diffDays);
    }
    return 1;
  };

  const daysCount = getDaysCount();

  // Filter bills by selected time period using timezone-safe calendar boundaries
  const filterBillsByPeriod = (allBills: BillRecord[]) => {
    return allBills.filter(b => isDateInPeriod(b.timestamp || b.endTime || b.startTime, period, startDate, endDate));
  };

  const filteredBills = filterBillsByPeriod(bills);

  // Real data calculations from tenant bills
  const realGameRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalGameCost) || 0), 0);
  const realBarRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalBarCost) || 0), 0);
  const realDiscounts = filteredBills.reduce((acc, b) => acc + (Number(b.discount) || 0), 0);
  
  // Gross Sales (Total Revenue) directly from tenant bills in D1
  const grossRevenue = filteredBills.reduce((acc, b) => {
    const total = Number(b.grandTotal);
    if (Number.isFinite(total)) return acc + total;
    const computed = (Number(b.totalGameCost) || 0) + (Number(b.totalBarCost) || 0) - (Number(b.discount) || 0);
    return acc + Math.max(0, computed);
  }, 0);

  // Filter expenses by period using timezone-safe calendar boundaries
  const filterExpensesByPeriod = (allExpenses: ClubExpense[]) => {
    return allExpenses.filter(e => isDateInPeriod(e.expenseDate, period, startDate, endDate));
  };

  const filteredExpensesAll = filterExpensesByPeriod(expenses);
  const filteredExpenses = filteredExpensesAll.filter(e => e.status === 'ACTIVE');
  
  // Calculate logged Bar Stock Purchases from Expenses tab
  const barPurchaseExpenseTotal = filteredExpenses
    .filter(e => e.category === 'BAR_PURCHASE')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Compute itemized COGS from bar item sales fallback
  let itemizedCogs = 0;
  filteredBills.forEach(b => {
    (b.barItemsSummary || []).forEach(item => {
      const catalogItem = barItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      const itemCost = catalogItem && typeof catalogItem.costPrice === 'number' ? catalogItem.costPrice : item.price * 0.4;
      itemizedCogs += itemCost * item.quantity;
    });
  });

  // Use logged BAR_PURCHASE expenses as COGS if logged; otherwise fall back to itemized menu sales cost
  const cogsTotal = barPurchaseExpenseTotal > 0 ? barPurchaseExpenseTotal : Math.round(itemizedCogs);
  
  // Total operating expenses (excluding BAR_PURCHASE if it's already counted in COGS)
  const operatingExpenses = filteredExpenses
    .filter(e => e.category !== (barPurchaseExpenseTotal > 0 ? 'BAR_PURCHASE' : ''))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Dynamic Net Profit & Margin
  const netProfit = grossRevenue - cogsTotal - operatingExpenses;
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  // Real Customer Debts
  const realCustomerDebt = customers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);
  const ledgerOutstanding = realCustomerDebt;

  // Payment channel collections (Both direct bills + Player Khata settlements)
  let upiCollection = 0;
  let cashCollection = 0;

  // 1. Direct bills payments in selected period
  filteredBills.forEach(b => {
    if (b.shares && b.shares.length > 0) {
      b.shares.forEach(s => {
        const method = (s.paymentMethod || '').toUpperCase();
        const shareAmt = Number(s.totalShare) || 0;
        if (method === 'UPI') upiCollection += shareAmt;
        else if (method === 'CASH') cashCollection += shareAmt;
      });
    } else {
      const method = (b.paymentMethod || '').toUpperCase();
      const grandAmt = Number(b.grandTotal) || 0;
      if (method === 'UPI') upiCollection += grandAmt;
      else if (method === 'CASH') cashCollection += grandAmt;
    }
  });

  // 2. Player Khata (Ledger) payments/settlements received in selected period
  (ledgerEntries || []).forEach(e => {
    const isCredit = e.type === 'CREDIT_PAYMENT' || e.type === 'CREDIT' || (e.type === 'ADJUSTMENT' && Number(e.amount) > 0 && e.status === 'SETTLED');
    if (!isCredit) return;
    const dateStr = e.settledAt || e.timestamp;
    if (!isDateInPeriod(dateStr, period, startDate, endDate)) return;

    const method = (e.settledMethod || e.paymentMethod || '').toUpperCase();
    const payAmt = Math.abs(Number(e.amount)) || 0;
    if (method === 'UPI') {
      upiCollection += payAmt;
    } else if (method === 'CASH') {
      cashCollection += payAmt;
    }
  });

  const totalCollected = upiCollection + cashCollection;
  const collectionBase = grossRevenue > 0 ? grossRevenue : (totalCollected > 0 ? totalCollected : 1);
  const upiSharePct = Math.round((upiCollection / collectionBase) * 100);
  const cashSharePct = Math.round((cashCollection / collectionBase) * 100);
  const outstandingPct = grossRevenue > 0 ? Math.round((ledgerOutstanding / grossRevenue) * 100) : 0;

  // --- Dynamic Revenue Stream Architecture ---
  const assetCategoryMap = new Map<string, string>();
  gameAssets.forEach(a => {
    if (a.id && a.category) assetCategoryMap.set(a.id, a.category);
  });

  // Helper to test if a category is F&B/Cafe rather than a game station
  const isFnbCategory = (cat?: string | null) => {
    if (!cat) return false;
    const lower = cat.toLowerCase().trim();
    return (
      lower === 'bar' ||
      lower === 'cafe' ||
      lower === 'f&b' ||
      lower.includes('cafe') ||
      lower.includes('beverage') ||
      lower.includes('food') ||
      lower.includes('snack') ||
      lower.includes('drink') ||
      lower.includes('kitchen') ||
      lower.includes('f&b') ||
      lower.includes('canteen')
    );
  };

  // Collect configured game categories from tenant gameAssets (strictly excluding F&B/Cafe)
  const configuredCategories: string[] = Array.from(
    new Set(gameAssets.map(a => a.category).filter(c => Boolean(c) && !isFnbCategory(c)))
  ) as string[];
  
  // Collect any additional game categories present in actual bills
  const billedGameCategories = new Set<string>();
  filteredBills.forEach(b => {
    const cat = b.category || (b.assetId ? assetCategoryMap.get(b.assetId) : null) || b.gameType;
    if (cat && !isFnbCategory(cat)) {
      billedGameCategories.add(cat);
    }
  });

  // Unique list of all game categories for this tenant
  const uniqueCategories: string[] = Array.from(new Set([...configuredCategories, ...Array.from(billedGameCategories)]));
  if (uniqueCategories.length === 0) {
    uniqueCategories.push('Billiards');
  }

  // Aggregate game costs per category
  const gameStreamRevenues: Record<string, number> = {};
  uniqueCategories.forEach((cat: string) => {
    gameStreamRevenues[cat] = 0;
  });

  filteredBills.forEach(b => {
    const cat: string = (b.category || (b.assetId ? assetCategoryMap.get(b.assetId) : null) || b.gameType || uniqueCategories[0] || 'Billiards') as string;
    if (isFnbCategory(cat)) return;
    const gameCost = Number(b.totalGameCost) || 0;
    if (gameStreamRevenues[cat] === undefined) {
      gameStreamRevenues[cat] = 0;
    }
    gameStreamRevenues[cat] += gameCost;
  });

  // Deterministic stream color palette
  const STREAM_PALETTE = [
    { bg: 'bg-indigo-500', text: 'text-indigo-500', dot: 'bg-indigo-500' },
    { bg: 'bg-purple-500', text: 'text-purple-500', dot: 'bg-purple-500' },
    { bg: 'bg-cyan-500', text: 'text-cyan-500', dot: 'bg-cyan-500' },
    { bg: 'bg-rose-500', text: 'text-rose-500', dot: 'bg-rose-500' },
    { bg: 'bg-emerald-500', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    { bg: 'bg-blue-500', text: 'text-blue-500', dot: 'bg-blue-500' },
    { bg: 'bg-orange-500', text: 'text-orange-500', dot: 'bg-orange-500' },
    { bg: 'bg-teal-500', text: 'text-teal-500', dot: 'bg-teal-500' }
  ];

  const getStreamColor = (catName: string, index: number) => {
    const lower = catName.toLowerCase();
    if (lower.includes('billiards') || lower.includes('snooker') || lower.includes('pool')) {
      return { bg: 'bg-indigo-500', text: 'text-indigo-500', dot: 'bg-indigo-500' };
    }
    if (lower.includes('ps') || lower.includes('console') || lower.includes('playstation') || lower.includes('pc')) {
      return { bg: 'bg-purple-500', text: 'text-purple-500', dot: 'bg-purple-500' };
    }
    if (lower.includes('tennis') || lower.includes('foosball') || lower.includes('hockey') || lower.includes('darts')) {
      return { bg: 'bg-cyan-500', text: 'text-cyan-500', dot: 'bg-cyan-500' };
    }
    if (lower.includes('vr') || lower.includes('simulator') || lower.includes('racing')) {
      return { bg: 'bg-rose-500', text: 'text-rose-500', dot: 'bg-rose-500' };
    }
    return STREAM_PALETTE[index % STREAM_PALETTE.length];
  };

  // Build unified dynamic stream array
  interface DynamicStreamItem {
    id: string;
    name: string;
    amount: number;
    percent: number;
    color: { bg: string; text: string; dot: string };
  }

  const dynamicRevenueStreams: DynamicStreamItem[] = [];

  // 1. Add Game Streams
  Object.entries(gameStreamRevenues).forEach(([cat, amount], idx) => {
    const pct = grossRevenue > 0 ? Math.round((amount / grossRevenue) * 100) : 0;
    dynamicRevenueStreams.push({
      id: `stream_${cat}`,
      name: `${cat} Game Billing`,
      amount,
      percent: pct,
      color: getStreamColor(cat, idx)
    });
  });

  // 2. Add Cafe & Bar Sales Stream
  const cafeStreamPct = grossRevenue > 0 ? Math.round((realBarRev / grossRevenue) * 100) : 0;
  dynamicRevenueStreams.push({
    id: 'stream_cafe_bar',
    name: 'Cafe & Quick Sales',
    amount: realBarRev,
    percent: cafeStreamPct,
    color: { bg: 'bg-amber-500', text: 'text-amber-500', dot: 'bg-amber-500' }
  });

  // Legacy fallback values for print modal compatibility
  const billiardsRev = gameStreamRevenues['Billiards'] || 0;
  const ps5Rev = gameStreamRevenues['PS5'] || 0;
  const barSalesRev = realBarRev;

  // Expenses grouped by category
  const expensesByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // Compute effective date range for P&L Print Modal
  const getEffectiveDateRange = () => {
    const now = new Date();
    const today = getLocalDateString(now);
    if (period === 'daily') {
      return { start: today, end: today };
    }
    if (period === 'weekly') {
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      return { start: getLocalDateString(past), end: today };
    }
    if (period === 'monthly') {
      const past = new Date(now);
      past.setDate(now.getDate() - 29);
      return { start: getLocalDateString(past), end: today };
    }
    if (period === 'ytd') {
      return { start: `${now.getFullYear()}-01-01`, end: today };
    }
    if (period === 'custom') {
      return { start: startDate, end: endDate };
    }
    return { start: today, end: today };
  };

  const effectiveDateRange = getEffectiveDateRange();

  // Styling helpers
  const cardBg = isDarkMode 
    ? 'bg-slate-900 border-slate-800 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expAmount);
    if (!expTitle.trim() || isNaN(amt) || amt <= 0) return;

    if (onLogExpense) {
      onLogExpense({
        category: expCategory,
        title: expTitle.trim(),
        amount: amt,
        paymentMethod: expPaymentMethod,
        receiptNo: expReceiptNo.trim() || undefined,
        notes: expNotes.trim() || undefined,
        expenseDate: expDate || todayStr
      });
    }

    // Reset form & close
    setExpTitle('');
    setExpAmount('');
    setExpReceiptNo('');
    setExpNotes('');
    setIsLogExpenseOpen(false);
  };

  const handleConfirmVoidExpense = () => {
    if (!voidConfirmExpense || !voidReasonInput.trim()) return;
    if (onVoidExpense) {
      onVoidExpense(voidConfirmExpense.id, voidReasonInput.trim());
    }
    setVoidConfirmExpense(null);
    setVoidReasonInput('');
  };

  const isOwnerOrSuperAdmin = userRole === 'club_owner' || userRole === 'superadmin';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Business Analytics & Operational Expenses
          </h1>
          <p className={`text-xs mt-0.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Track earnings, cost of goods sold, logged club operating expenses, net profit, and customer retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPnlPrintOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print P&L Statement
          </button>
        </div>
      </div>

      {/* Main Sub-Tabs */}
      <div id="analytics-subtabs-nav" className={`flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none flex-nowrap ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          id="analytics-tab-revenue"
          onClick={() => setActiveSubTab('revenue')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'revenue'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Revenue & Profit Reports
        </button>

        <button
          id="analytics-tab-retention"
          onClick={() => setActiveSubTab('retention')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'retention'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Customer Retention & Churn
        </button>
      </div>

      {/* Global Time Period Selector Bar */}
      {activeSubTab !== 'retention' && (
        <div className={`p-3 rounded-2xl border space-y-3 ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Period:</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-mono text-[11px] font-extrabold border border-indigo-500/20">
                {daysCount} {daysCount === 1 ? 'Day' : 'Days'} Total
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -my-1 w-full sm:w-auto">
              {[
                { id: 'daily', label: 'Today' },
                { id: 'weekly', label: 'Last 7 Days' },
                { id: 'monthly', label: 'This Month (30D)' },
                { id: 'ytd', label: 'Year-To-Date (YTD)' },
                { id: 'custom', label: 'Custom Range 📅' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setPeriod(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 whitespace-nowrap cursor-pointer ${
                    period === t.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80'
                        : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {period === 'custom' && (
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-3 text-xs font-semibold ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-400 font-bold shrink-0">Start:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full sm:w-auto px-3 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-400 font-bold shrink-0">End:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full sm:w-auto px-3 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="text-[11px] text-indigo-500 font-mono font-medium">
                Filtered: {startDate} to {endDate}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 1: REVENUE & PROFIT REPORTS */}
      {activeSubTab === 'revenue' && (
        <div id="analytics-panel-revenue" className="space-y-6">
          
          {/* KPI Summary Grid - 4 Cards Grid */}
          <div id="analytics-revenue-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* KPI 1: Gross Sales */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Gross Sales</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-base sm:text-xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  ₹{grossRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  <ArrowUpRight className="w-3 h-3 shrink-0" /> Total revenue
                </div>
              </div>
            </div>

            {/* KPI 2: COGS (Bar Item Cost) */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>COGS (Stock)</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                  ₹{cogsTotal.toLocaleString('en-IN')}
                </div>
                <p className={`text-[10px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {barPurchaseExpenseTotal > 0 ? 'Logged stock purchases' : 'Bar catalog cost'}
                </p>
              </div>
            </div>

            {/* KPI 3: Total Expenses */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Club Expenses</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-xl font-black font-mono text-red-600 dark:text-red-400">
                  ₹{(barPurchaseExpenseTotal > 0 ? operatingExpenses : totalExpenses).toLocaleString('en-IN')}
                </div>
                <p className={`text-[10px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {barPurchaseExpenseTotal > 0 ? 'Rent, bills & overheads' : 'Rent, bills & salaries'}
                </p>
              </div>
            </div>

            {/* KPI 4: Wired Net Profit */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Net Profit</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1 flex-wrap">
                  <span>₹{netProfit.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30">
                    {profitMargin}%
                  </span>
                </div>
                <p className={`text-[10px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sales - COGS - Expenses
                </p>
              </div>
            </div>

          </div>

          {/* Middle Row: Revenue Breakdown & Expenses Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Breakdown */}
            <div id="analytics-revenue-breakdown" className={`p-6 rounded-2xl border shadow-xl space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Revenue Stream Breakdown
                </h3>
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>₹{grossRevenue.toLocaleString('en-IN')} Total</span>
              </div>

              <div className="space-y-4 text-xs">
                {dynamicRevenueStreams.map(stream => (
                  <div key={stream.id} className="space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stream.color.dot}`} /> {stream.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">₹{stream.amount.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({stream.percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${stream.color.bg} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${Math.min(100, Math.max(0, stream.percent))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Expense Category Breakdown */}
            <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-500" /> Operating Expense Breakdown
                </h3>
                <span className="text-xs font-mono font-bold text-red-500">
                  ₹{(barPurchaseExpenseTotal > 0 ? operatingExpenses : totalExpenses).toLocaleString('en-IN')} Total
                </span>
              </div>

              {Object.keys(expensesByCategory).length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No active expenses logged for this period.
                  </p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Record rent, bills & wages under Bills & Outflows.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(cat => {
                    const amt = expensesByCategory[cat] || 0;
                    if (amt <= 0) return null;
                    const isBarStockCat = cat === 'BAR_PURCHASE' && barPurchaseExpenseTotal > 0;
                    const baseTotal = barPurchaseExpenseTotal > 0 ? operatingExpenses : totalExpenses;
                    const pct = baseTotal > 0 && !isBarStockCat ? Math.round((amt / baseTotal) * 100) : 0;
                    const info = CATEGORY_LABELS[cat];

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            <span>{info.icon}</span> {info.label}
                            {isBarStockCat && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 font-normal">
                                Tracked in COGS above
                              </span>
                            )}
                          </span>
                          <span className={`font-mono ${isBarStockCat ? 'text-amber-500' : 'text-red-400'}`}>
                            ₹{amt.toLocaleString('en-IN')} {!isBarStockCat && `(${pct}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`${isBarStockCat ? 'bg-amber-500' : info.color} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${isBarStockCat ? 100 : pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Payment Method Distribution */}
          <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Payment Collection Channels
              </h3>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>Zero MDR Gateway</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Dynamic UPI QR</span>
                <div className="text-lg font-black font-mono">₹{upiCollection.toLocaleString('en-IN')}</div>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{upiSharePct}% of Total Revenue</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">Cash Payments</span>
                <div className="text-lg font-black font-mono">₹{cashCollection.toLocaleString('en-IN')}</div>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{cashSharePct}% of Total Revenue</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Unpaid Debts</span>
                <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">₹{ledgerOutstanding.toLocaleString('en-IN')}</div>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{outstandingPct}% Outstanding</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: CUSTOMER RETENTION & CHURN DASHBOARD */}
      {activeSubTab === 'retention' && (
        <div id="analytics-panel-retention" className="space-y-6">
          <RetentionDashboard
            customers={customers}
            clubName={clubProfile.businessName}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* MODAL 1: PRINT P&L STATEMENT */}
      <ProfitLossPrintModal
        isOpen={isPnlPrintOpen}
        onClose={() => setIsPnlPrintOpen(false)}
        clubProfile={clubProfile}
        startDate={effectiveDateRange.start}
        endDate={effectiveDateRange.end}
        daysCount={daysCount}
        grossRevenue={grossRevenue}
        revenueStreams={dynamicRevenueStreams.map(s => ({ name: s.name, amount: s.amount }))}
        billiardsRev={billiardsRev}
        ps5Rev={ps5Rev}
        barSalesRev={barSalesRev}
        cogsTotal={cogsTotal}
        filteredExpenses={filteredExpenses}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        profitMargin={profitMargin}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
