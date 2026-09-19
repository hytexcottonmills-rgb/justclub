import React, { useState } from 'react';
import { X, Printer, Download, Receipt, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { ClubProfile, ClubExpense, ExpenseCategory } from '../types';
import { downloadInvoiceAsPdf, printDocumentElement } from '../utils/pdfExport';

interface ProfitLossPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubProfile: ClubProfile;
  startDate: string;
  endDate: string;
  daysCount: number;
  grossRevenue: number;
  billiardsRev: number;
  ps5Rev: number;
  barSalesRev: number;
  cogsTotal: number;
  filteredExpenses: ClubExpense[];
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  isDarkMode?: boolean;
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: '🏠 Rent & Premises',
  ELECTRICITY: '⚡ Electricity & Water',
  SALARY: '👥 Staff Salaries & Wages',
  INTERNET_SOFTWARE: '🌐 Internet & Subscriptions',
  BAR_PURCHASE: '🍺 Bar Stock Purchases',
  MAINTENANCE: '🎱 Equipment Maintenance',
  SUPPLIES: '📦 Consumables & Supplies',
  MISC: '🛠️ Miscellaneous'
};

export const ProfitLossPrintModal: React.FC<ProfitLossPrintModalProps> = ({
  isOpen,
  onClose,
  clubProfile,
  startDate,
  endDate,
  daysCount,
  grossRevenue,
  billiardsRev,
  ps5Rev,
  barSalesRev,
  cogsTotal,
  filteredExpenses,
  totalExpenses,
  netProfit,
  profitMargin,
  isDarkMode = true
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handlePrint = async () => {
    await printDocumentElement('printable-pnl');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const fileName = `PnL_Statement_${startDate}_to_${endDate}.pdf`;
    await downloadInvoiceAsPdf('printable-pnl', fileName);
    setIsDownloadingPdf(false);
  };

  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const grossProfit = grossRevenue - cogsTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Top Bar */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Profit & Loss Statement</h3>
              <p className="text-[11px] text-slate-400">Financial Audit Report for {daysCount} Days ({startDate} to {endDate})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> {isDownloadingPdf ? 'Exporting...' : 'PDF'}
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800 border-slate-800 text-slate-400' : 'hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content / Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div id="printable-pnl" className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 font-sans max-w-2xl mx-auto space-y-6">
            
            {/* P&L Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {clubProfile.businessName || 'JustClub Gaming Lounge'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {clubProfile.tagline || 'Snooker, Billiards & Gaming Hub'}
                </p>
                {clubProfile.phone && <p className="text-[11px] text-slate-500">Phone: {clubProfile.phone}</p>}
                {clubProfile.upiId && <p className="text-[11px] text-slate-500 font-mono">UPI ID: {clubProfile.upiId}</p>}
              </div>

              <div className="sm:text-right">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-md">
                  Profit & Loss Statement
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1.5">
                  Period: {startDate} to {endDate}
                </p>
                <p className="text-[11px] text-slate-500">
                  Duration: {daysCount} Days
                </p>
              </div>
            </div>

            {/* SECTION 1: GROSS REVENUE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">1. Gross Revenue</h2>
                <span className="text-xs font-black font-mono text-slate-900">Amount (₹)</span>
              </div>
              <div className="space-y-1 text-xs text-slate-700 pl-2">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span>Billiards & Snooker Table Billing</span>
                  <span className="font-mono">₹{billiardsRev.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span>PS5 & Console Gaming Billing</span>
                  <span className="font-mono">₹{ps5Rev.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span>Cafe, Beverages & Hookah Sales</span>
                  <span className="font-mono">₹{barSalesRev.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 border-t border-slate-300 bg-slate-50 px-2 rounded">
                  <span>Total Gross Sales (A)</span>
                  <span className="font-mono text-sm">₹{grossRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: COST OF GOODS SOLD (COGS) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">2. Direct Cost of Goods Sold (COGS)</h2>
              </div>
              <div className="space-y-1 text-xs text-slate-700 pl-2">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span>Bar Inventory & Beverage Procurement Cost</span>
                  <span className="font-mono text-amber-700">₹{cogsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 border-t border-slate-300 bg-slate-50 px-2 rounded">
                  <span>Gross Profit (A - COGS)</span>
                  <span className="font-mono text-sm">₹{grossProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: OPERATING EXPENSES */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">3. Operating Expenses</h2>
                <span className="text-xs font-black font-mono text-slate-900">Amount (₹)</span>
              </div>
              
              {Object.keys(expensesByCategory).length === 0 ? (
                <p className="text-xs italic text-slate-500 pl-2">No operating expenses logged for this date range.</p>
              ) : (
                <div className="space-y-1 text-xs text-slate-700 pl-2">
                  {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(cat => {
                    const amt = expensesByCategory[cat];
                    if (!amt) return null;
                    return (
                      <div key={cat} className="flex justify-between py-0.5 border-b border-slate-100">
                        <span>{CATEGORY_LABELS[cat]}</span>
                        <span className="font-mono">₹{amt.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between py-1 font-extrabold text-slate-900 border-t border-slate-300 bg-slate-50 px-2 rounded text-xs">
                <span>Total Operating Expenses (B)</span>
                <span className="font-mono text-sm text-red-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* SUMMARY NET PROFIT BOX */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Net Operating Profit</p>
                <h3 className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-emerald-400">
                  ₹{netProfit.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Calculation: Gross Sales (₹{grossRevenue.toLocaleString('en-IN')}) - COGS (₹{cogsTotal.toLocaleString('en-IN')}) - Expenses (₹{totalExpenses.toLocaleString('en-IN')})
                </p>
              </div>

              <div className="text-right border-l border-slate-700 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Profit Margin</span>
                <span className="text-lg font-black font-mono text-emerald-300">{profitMargin}%</span>
              </div>
            </div>

            {/* Footnote */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Generated via JustClub POS Ledger Engine</span>
              <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
