import React, { useState } from 'react';
import { CustomerPlayer, BarItem, GameAsset, ClubProfile, BillRecord, LedgerEntry } from '../types';
import { RetentionDashboard } from './RetentionDashboard';
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
  Wallet
} from 'lucide-react';

interface AnalyticsViewProps {
  customers: CustomerPlayer[];
  barItems: BarItem[];
  gameAssets: GameAsset[];
  clubProfile: ClubProfile;
  bills?: BillRecord[];
  ledgerEntries?: LedgerEntry[];
  isDarkMode?: boolean;
}

import { getLocalDateString } from '../utils/billing';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  customers,
  barItems,
  gameAssets,
  clubProfile,
  bills = [],
  ledgerEntries = [],
  isDarkMode = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'retention'>('revenue');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'ytd' | 'custom'>('daily');
  
  // Custom date picker state
  const todayStr = getLocalDateString();
  const firstOfMonthStr = getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

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
  const hasRealBills = filteredBills.length > 0;

  const realGameRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalGameCost) || 0), 0);
  const realBarRev = filteredBills.reduce((acc, b) => acc + (Number(b.totalBarCost) || 0), 0);

  // Compute real COGS from bar item summaries if available
  let calculatedCogs = 0;
  filteredBills.forEach(b => {
    (b.barItemsSummary || []).forEach(item => {
      const catalogItem = barItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      const itemCost = catalogItem ? catalogItem.costPrice : item.price * 0.4;
      calculatedCogs += itemCost * item.quantity;
    });
  });

  const totalGameRevenue = realGameRev;
  const totalBarRevenue = realBarRev;
  const grossRevenue = totalGameRevenue + totalBarRevenue;
  
  const cogsTotal = Math.round(calculatedCogs);

  const netProfit = grossRevenue - cogsTotal;
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

  // Styling helpers
  const cardBg = isDarkMode 
    ? 'bg-slate-900 border-slate-800 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Business Analytics & Revenue Insights
          </h1>
          <p className={`text-xs mt-0.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Track earnings, cost of goods sold, profit margins, payment breakdowns, and customer retention.
          </p>
        </div>
      </div>

      {/* Main Sub-Tabs - Slideable on mobile */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none flex-nowrap ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap ${
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
          onClick={() => setActiveSubTab('retention')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap ${
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

      {/* SUB-TAB 1: REVENUE & PROFIT REPORTS */}
      {activeSubTab === 'revenue' && (
        <div className="space-y-6">
          
          {/* Time Period Selector Bar */}
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

              {/* Slideable filter row for mobile and desktop */}
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

            {/* Custom Range Date Pickers (Shown when custom period selected) */}
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

          {/* KPI Summary Grid - 2x2 on Mobile like Khata Ledger */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* KPI 1: Gross Revenue */}
            <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Gross Sales</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className={`text-lg sm:text-2xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  ₹{grossRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> +14.2% vs prev
                </div>
              </div>
            </div>

            {/* KPI 2: Cost of Goods & Overhead */}
            <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>COGS (Cost)</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-lg sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  ₹{cogsTotal.toLocaleString('en-IN')}
                </div>
                <p className={`text-[10px] sm:text-[11px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Snack & power overhead
                </p>
              </div>
            </div>

            {/* KPI 3: Net Profit & Margin */}
            <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Net Profit</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-lg sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5 flex-wrap">
                  <span>₹{netProfit.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] sm:text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30 whitespace-nowrap">
                    {profitMargin}%
                  </span>
                </div>
                <p className={`text-[10px] sm:text-[11px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Gaming lounge model
                </p>
              </div>
            </div>

            {/* KPI 4: Digital UPI Ratio */}
            <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className={`font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>UPI Share</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-lg sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  74% Digital
                </div>
                <p className={`text-[10px] sm:text-[11px] font-medium mt-0.5 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ₹{upiCollection.toLocaleString('en-IN')} via QR
                </p>
              </div>
            </div>

          </div>

          {/* Middle Row: Revenue Breakdown & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Breakdown */}
            <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-500" /> Revenue Stream Breakdown
                </h3>
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>₹{grossRevenue.toLocaleString('en-IN')} Total</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Stream 1: Billiards */}
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
                      style={{ width: `${Math.round((billiardsRev / grossRevenue) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stream 2: PS5 & Consoles */}
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
                      style={{ width: `${Math.round((ps5Rev / grossRevenue) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stream 3: Cafe & Bar POS */}
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
                      style={{ width: `${Math.round((barSalesRev / grossRevenue) * 100)}%` }}
                    />
                  </div>
                </div>
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
                
                {/* UPI Card */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Dynamic UPI QR</span>
                  <div className="text-lg font-black font-mono">₹{upiCollection.toLocaleString('en-IN')}</div>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>74% of Total Revenue</span>
                </div>

                {/* Cash Card */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">Cash Payments</span>
                  <div className="text-lg font-black font-mono">₹{cashCollection.toLocaleString('en-IN')}</div>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>20% of Total Revenue</span>
                </div>

                {/* Ledger Outstanding */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Unpaid Debts</span>
                  <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">₹{ledgerOutstanding.toLocaleString('en-IN')}</div>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>6% Outstanding</span>
                </div>

              </div>

              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800 font-medium'
              }`}>
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Dynamic UPI payments go directly to club VPA with zero transaction fees.</span>
              </div>
            </div>

          </div>

          {/* Top Selling Bar Items & Margins Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" /> Catalog Inventory Profitability
              </h3>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>Selling Price vs. COGS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Estimated COGS</th>
                    <th className="p-4">Profit / Item</th>
                    <th className="p-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {barItems.map(item => {
                    const estimatedCogs = item.costPrice || Math.round(item.price * 0.35);
                    const itemProfit = item.price - estimatedCogs;
                    const margin = Math.round((itemProfit / item.price) * 100);

                    return (
                      <tr key={item.id} className={`transition ${
                        isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}>
                        <td className="p-4 font-bold">{item.name}</td>
                        <td className={`p-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.category}</td>
                        <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{item.price}</td>
                        <td className="p-4 font-mono text-amber-500">₹{estimatedCogs}</td>
                        <td className="p-4 font-mono font-bold text-indigo-500">₹{itemProfit}</td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: CUSTOMER RETENTION & CHURN DASHBOARD */}
      {activeSubTab === 'retention' && (
        <RetentionDashboard
          customers={customers}
          clubName={clubProfile.businessName}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
};
