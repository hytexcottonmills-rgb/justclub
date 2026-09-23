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
import { getLocalDateString } from '../utils/billing';

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

  // Filter bills by selected time period
  const filterBillsByPeriod = (allBills: BillRecord[]) => {
    const now = new Date();
    if (period === 'daily') {
      const today = getLocalDateString(now);
      return allBills.filter(b => (b.timestamp || b.endTime || '').startsWith(today));
    }
    if (period === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return allBills.filter(b => new Date(b.timestamp || b.endTime || 0) >= sevenDaysAgo);
    }
    if (period === 'monthly') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return allBills.filter(b => new Date(b.timestamp || b.endTime || 0) >= thirtyDaysAgo);
    }
    if (period === 'ytd') {
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return allBills.filter(b => new Date(b.timestamp || b.endTime || 0) >= jan1);
    }
    if (period === 'custom') {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate + 'T23:59:59').getTime();
      return allBills.filter(b => {
        const t = new Date(b.timestamp || b.endTime || 0).getTime();
        return t >= start && t <= end;
      });
    }
    return allBills;
  };

  const filteredBills = filterBillsByPeriod(bills);

  // Real data calculations
  const realGameRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalGameCost) || 0), 0);
  const realBarRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalBarCost) || 0), 0);

  // Filter expenses by period
  const filterExpensesByPeriod = (allExpenses: ClubExpense[]) => {
    const now = new Date();
    if (period === 'daily') {
      const today = getLocalDateString(now);
      return allExpenses.filter(e => e.expenseDate.startsWith(today));
    }
    if (period === 'weekly') {
      const sevenDaysAgoStr = getLocalDateString(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      return allExpenses.filter(e => e.expenseDate >= sevenDaysAgoStr);
    }
    if (period === 'monthly') {
      const thirtyDaysAgoStr = getLocalDateString(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      return allExpenses.filter(e => e.expenseDate >= thirtyDaysAgoStr);
    }
    if (period === 'ytd') {
      const jan1Str = `${now.getFullYear()}-01-01`;
      return allExpenses.filter(e => e.expenseDate >= jan1Str);
    }
    if (period === 'custom') {
      return allExpenses.filter(e => e.expenseDate >= startDate && e.expenseDate <= endDate);
    }
    return allExpenses;
  };

  const filteredExpensesAll = filterExpensesByPeriod(expenses);
  const filteredExpenses = filteredExpensesAll.filter(e => e.status === 'ACTIVE');
  
  // Calculate logged Bar Stock Purchases from Expenses tab
  const barPurchaseExpenseTotal = filteredExpenses
    .filter(e => e.category === 'BAR_PURCHASE')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Compute itemized COGS from bar item sales
  let itemizedCogs = 0;
  filteredBills.forEach(b => {
    (b.barItemsSummary || []).forEach(item => {
      const catalogItem = barItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      const itemCost = catalogItem ? catalogItem.costPrice : item.price * 0.4;
      itemizedCogs += itemCost * item.quantity;
    });
  });

  const totalGameRevenue = realGameRev;
  const totalBarRevenue = realBarRev;
  const grossRevenue = totalGameRevenue + totalBarRevenue;

  // Use logged BAR_PURCHASE expenses as COGS if logged; otherwise fall back to itemized menu sales cost
  const cogsTotal = barPurchaseExpenseTotal > 0 ? barPurchaseExpenseTotal : Math.round(itemizedCogs);
  
  // Total operating expenses (excluding BAR_PURCHASE if it's already counted in COGS)
  const operatingExpenses = filteredExpenses
    .filter(e => e.category !== (barPurchaseExpenseTotal > 0 ? 'BAR_PURCHASE' : ''))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Wired Net Profit Calculation
  const netProfit = grossRevenue - (barPurchaseExpenseTotal > 0 ? barPurchaseExpenseTotal : cogsTotal) - operatingExpenses;
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  // Real Customer Debts
  const realCustomerDebt = customers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);
  const ledgerOutstanding = realCustomerDebt;

  // Payment channel collections
  let upiCollection = 0;
  let cashCollection = 0;

  filteredBills.forEach(b => {
    (b.shares || []).forEach(s => {
      if (s.paymentMethod === 'UPI') upiCollection += s.totalShare;
      else if (s.paymentMethod === 'Cash' || s.paymentMethod === 'Card') cashCollection += s.totalShare;
    });
  });

  const upiSharePct = grossRevenue > 0 ? Math.round((upiCollection / grossRevenue) * 100) : 0;
  const cashSharePct = grossRevenue > 0 ? Math.round((cashCollection / grossRevenue) * 100) : 0;
  const outstandingPct = grossRevenue > 0 ? Math.round((ledgerOutstanding / grossRevenue) * 100) : 0;

  // Category splits
  let billiardsRev = 0;
  let ps5Rev = 0;
  filteredBills.forEach(b => {
    const cat = (b.category || b.gameType || '').toLowerCase();
    if (cat.includes('ps') || cat.includes('playstation') || cat.includes('console')) {
      ps5Rev += Number(b.totalGameCost) || 0;
    } else {
      billiardsRev += Number(b.totalGameCost) || 0;
    }
  });
  const barSalesRev = totalBarRevenue;

  // Expenses grouped by category
  const expensesByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

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
          id="analytics-tab-expenses"
          onClick={() => setActiveSubTab('expenses')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'expenses'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Club Expenses ({filteredExpenses.length})
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
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Billiards & Snooker Tables
                    </span>
                    <span className="font-mono">₹{billiardsRev.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${grossRevenue > 0 ? Math.round((billiardsRev / grossRevenue) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> PS5 & Console Stations
                    </span>
                    <span className="font-mono">₹{ps5Rev.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${grossRevenue > 0 ? Math.round((ps5Rev / grossRevenue) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cafe, Beverages & Hookah
                    </span>
                    <span className="font-mono">₹{barSalesRev.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${grossRevenue > 0 ? Math.round((barSalesRev / grossRevenue) * 100) : 0}%` }}
                    />
                  </div>
                </div>
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
                <div className="py-8 text-center space-y-2">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No active expenses logged for this period.
                  </p>
                  <button
                    onClick={() => {
                      setActiveSubTab('expenses');
                      setIsLogExpenseOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log First Expense
                  </button>
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

      {/* SUB-TAB 2: CLUB EXPENSES MANAGEMENT */}
      {activeSubTab === 'expenses' && (
        <div id="analytics-panel-expenses" className="space-y-6">
          
          {/* Top Bar Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" /> Operational Club Expenses Log
              </h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Record rent, electricity bills, staff salaries, equipment maintenance, and stock purchases. Voiding requires owner permissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLogExpenseOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Log New Expense
              </button>
            </div>
          </div>

          {/* Category Quick Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).slice(0, 4).map(cat => {
              const amt = expensesByCategory[cat] || 0;
              const info = CATEGORY_LABELS[cat];
              return (
                <div key={cat} className={`p-3.5 rounded-2xl border ${cardBg}`}>
                  <span className="text-lg block">{info.icon}</span>
                  <span className="text-[11px] font-bold text-slate-400 block mt-1">{info.label}</span>
                  <div className="text-base font-black font-mono mt-0.5">₹{amt.toLocaleString('en-IN')}</div>
                </div>
              );
            })}
          </div>

          {/* Expenses Container: Responsive Dual Layout */}
          <div id="analytics-expenses-log" className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-500" /> Expenses Register ({filteredExpensesAll.length})
              </h3>
              <span className="text-xs font-mono font-bold text-red-500">Active Total: ₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>

            {/* 1. MOBILE CARD VIEW (< 640px) */}
            <div className="block sm:hidden p-3 space-y-3">
              {filteredExpensesAll.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic text-xs">
                  No club expenses logged for the selected period ({period}).
                </div>
              ) : (
                filteredExpensesAll.map(exp => {
                  const isVoided = exp.status === 'VOIDED';
                  const info = CATEGORY_LABELS[exp.category] || { label: exp.category, icon: '📄', color: 'bg-slate-500' };

                  return (
                    <div
                      key={exp.id}
                      className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                        isVoided 
                          ? 'opacity-50 bg-red-500/5 border-red-500/20' 
                          : isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{info.icon}</span>
                            <span className="text-xs font-bold">{info.label}</span>
                          </div>
                          <h4 className={`text-sm font-black mt-1 ${isVoided ? 'line-through text-slate-500' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {exp.title}
                          </h4>
                          {exp.receiptNo && (
                            <span className="text-[10px] font-mono text-slate-400 block">Ref: {exp.receiptNo}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-mono font-black block ${isVoided ? 'line-through text-slate-500' : 'text-red-500'}`}>
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{exp.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/40 text-slate-400">
                        <span>📅 {exp.expenseDate}</span>
                        <span>👤 {exp.loggedByEmail || 'Staff'}</span>
                      </div>

                      {/* Mobile Void Button */}
                      <div className="pt-1">
                        {isVoided ? (
                          <div className="w-full text-center py-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                            VOIDED ({exp.voidReason || 'No reason'})
                          </div>
                        ) : isOwnerOrSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setVoidConfirmExpense(exp);
                              setVoidReasonInput('');
                            }}
                            className="w-full py-2 text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-xl transition border border-red-500/20"
                          >
                            Void / Cancel Expense
                          </button>
                        ) : (
                          <div className="text-right text-[11px] font-bold text-emerald-500">ACTIVE</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. DESKTOP / TABLET TABLE VIEW (≥ 640px) */}
            <div className="hidden sm:block overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <th className="p-3.5 whitespace-nowrap">Date</th>
                    <th className="p-3.5 whitespace-nowrap">Category</th>
                    <th className="p-3.5 whitespace-nowrap">Title & Vendor</th>
                    <th className="p-3.5 whitespace-nowrap">Payment</th>
                    <th className="p-3.5 whitespace-nowrap">Logged By</th>
                    <th className="p-3.5 whitespace-nowrap">Amount (₹)</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Status / Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {filteredExpensesAll.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                        No club expenses logged for the selected period ({period}).
                      </td>
                    </tr>
                  ) : (
                    filteredExpensesAll.map(exp => {
                      const isVoided = exp.status === 'VOIDED';
                      const info = CATEGORY_LABELS[exp.category] || { label: exp.category, icon: '📄', color: 'bg-slate-500' };

                      return (
                        <tr key={exp.id} className={`transition ${
                          isVoided 
                            ? 'opacity-50 bg-red-500/5' 
                            : isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}>
                          <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">{exp.expenseDate}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20 font-bold text-[11px]">
                              <span>{info.icon}</span> {info.label}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold">
                            <span className={isVoided ? 'line-through' : ''}>{exp.title}</span>
                            {exp.receiptNo && (
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">Ref: {exp.receiptNo}</span>
                            )}
                            {exp.notes && (
                              <span className="block text-[10px] text-slate-400 font-normal italic">{exp.notes}</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] uppercase whitespace-nowrap">{exp.paymentMethod}</td>
                          <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{exp.loggedByEmail || 'Staff'}</td>
                          <td className={`p-3.5 font-mono font-black whitespace-nowrap ${isVoided ? 'line-through text-slate-400' : 'text-red-500'}`}>
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {isVoided ? (
                              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20" title={`Reason: ${exp.voidReason}`}>
                                <AlertCircle className="w-3 h-3" /> VOIDED ({exp.voidReason || 'No reason'})
                              </div>
                            ) : (
                              isOwnerOrSuperAdmin ? (
                                <button
                                  onClick={() => {
                                    setVoidConfirmExpense(exp);
                                    setVoidReasonInput('');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg transition border border-red-500/20 cursor-pointer"
                                >
                                  Void
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: CUSTOMER RETENTION & CHURN DASHBOARD */}
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
        startDate={startDate}
        endDate={endDate}
        daysCount={daysCount}
        grossRevenue={grossRevenue}
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

      {/* MODAL 2: LOG EXPENSE DIALOG */}
      {isLogExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Log Club Expense</h3>
                  <p className="text-xs text-slate-400">Record an operational expense against club revenue</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogExpenseOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
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
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="RENT">🏠 Rent & Premises</option>
                  <option value="ELECTRICITY">⚡ Electricity & Water Bill</option>
                  <option value="SALARY">👥 Staff Salary & Wages</option>
                  <option value="INTERNET_SOFTWARE">🌐 Internet & POS Subscriptions</option>
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
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
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
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 ${
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
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 ${
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
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Receipt / Ref No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. REC-9921 / Transaction ID"
                  value={expReceiptNo}
                  onChange={(e) => setExpReceiptNo(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid to landlord Mr. Ramesh via UPI"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VOID EXPENSE CONFIRMATION DIALOG */}
      {voidConfirmExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Void Expense Entry</h3>
                <p className="text-xs text-slate-400">Financial Audit Corrective Action</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-1">
              <p className="font-bold text-white">{voidConfirmExpense.title}</p>
              <p className="font-mono text-red-400">Amount: ₹{voidConfirmExpense.amount.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-slate-300">Date: {voidConfirmExpense.expenseDate}</p>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-300 block mb-1">Reason for Voiding *</label>
              <input
                type="text"
                required
                placeholder="e.g. Duplicate entry / Wrong amount logged"
                value={voidReasonInput}
                onChange={(e) => setVoidReasonInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-red-500 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setVoidConfirmExpense(null);
                  setVoidReasonInput('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!voidReasonInput.trim()}
                onClick={handleConfirmVoidExpense}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
