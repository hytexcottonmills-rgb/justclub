import React, { useState, useMemo, useEffect } from 'react';
import { 
  CustomerPlayer, 
  PaymentMethod, 
  LedgerEntry, 
  BillRecord, 
  ClubProfile 
} from '../types';
import { PartyLedgerView } from './PartyLedgerView';
import { BillDetailModal } from './BillDetailModal';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  CreditCard, 
  Banknote, 
  FileText, 
  ChevronRight, 
  X, 
  Share2, 
  Sparkles,
  DollarSign
} from 'lucide-react';

interface LedgersViewProps {
  customers: CustomerPlayer[];
  ledgerEntries?: LedgerEntry[];
  bills?: BillRecord[];
  clubProfile?: ClubProfile;
  upiId?: string;
  clubName?: string;
  initialCustomerId?: string | null;
  onSettleCustomerLedger: (customerId: string, amountCleared: number, method: PaymentMethod, entryId?: string) => void;
  onAddNewCustomer: (name: string, whatsapp: string) => CustomerPlayer;
  isDarkMode?: boolean;
  isReadOnly?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type StatusFilter = 'all' | 'debit' | 'clear' | 'credit';

export const LedgersView: React.FC<LedgersViewProps> = ({
  customers,
  ledgerEntries = [],
  bills = [],
  clubProfile,
  upiId = 'cuesport@okaxis',
  clubName = 'CueMaster Club',
  initialCustomerId = null,
  onSettleCustomerLedger,
  onAddNewCustomer,
  isDarkMode = true,
  isReadOnly = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}) => {
  // Build safe club profile object if not fully provided
  const activeClubProfile: ClubProfile = useMemo(() => {
    if (clubProfile) return clubProfile;
    return {
      businessName: clubName,
      ownerName: 'Club Manager',
      contactPhone: '+91 98400 12345',
      whatsapp: '+91 98400 12345',
      address: 'Snooker & Gaming Lounge',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pin: '600001',
      upiId: upiId || 'cuesport@okaxis',
      totalRevenueThisMonth: 0,
      monthlyTarget: 100000,
      logoUrl: '',
      currencySymbol: '₹',
      saasTenantId: 'tenant_default',
      saasStatus: 'ACTIVE',
      monthlySubscriptionFee: 499,
      autoDebitDay: 1,
    };
  }, [clubProfile, clubName, upiId]);

  // Selected customer for full Statement / Khata view (Kannaku drill-down)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPlayer | null>(null);

  // If initialCustomerId is passed, automatically open their ledger
  useEffect(() => {
    if (initialCustomerId) {
      const found = customers.find(c => c.id === initialCustomerId);
      if (found) {
        setSelectedCustomer(found);
      }
    }
  }, [initialCustomerId, customers]);

  // Search & Status filters for Customer Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Quick Payment Modal state
  const [quickPayCustomer, setQuickPayCustomer] = useState<CustomerPlayer | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [quickPayMethod, setQuickPayMethod] = useState<PaymentMethod>('UPI');
  const [quickPayRef, setQuickPayRef] = useState('');

  // Add Customer Modal state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Modal to inspect a linked session bill directly from the ledger
  const [viewingBill, setViewingBill] = useState<BillRecord | null>(null);

  // Financial KPI calculations
  const totalReceivable = useMemo(() => {
    return customers.reduce((sum, c) => (c.ledgerBalance < 0 ? sum + Math.abs(c.ledgerBalance) : sum), 0);
  }, [customers]);

  const totalAdvance = useMemo(() => {
    return customers.reduce((sum, c) => (c.ledgerBalance > 0 ? sum + c.ledgerBalance : sum), 0);
  }, [customers]);

  const debtorsCount = useMemo(() => {
    return customers.filter(c => c.ledgerBalance < 0).length;
  }, [customers]);

  const settledCount = useMemo(() => {
    return customers.filter(c => c.ledgerBalance === 0).length;
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Status filter
      if (statusFilter === 'debit' && c.ledgerBalance >= 0) return false;
      if (statusFilter === 'clear' && c.ledgerBalance !== 0) return false;
      if (statusFilter === 'credit' && c.ledgerBalance <= 0) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.whatsapp.includes(q);
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [customers, statusFilter, searchQuery]);

  // Handle Quick Payment submit
  const handleConfirmQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayCustomer) return;
    const amt = parseFloat(quickPayAmount);
    if (!amt || amt <= 0) return;

    onSettleCustomerLedger(quickPayCustomer.id, amt, quickPayMethod, quickPayRef.trim() || undefined);
    setQuickPayCustomer(null);
  };

  // Handle Add Customer submit
  const handleConfirmAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const added = onAddNewCustomer(newCustName.trim(), newCustPhone.trim());
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    // Open their new ledger right away
    if (added) {
      setSelectedCustomer(added);
    }
  };

  // WhatsApp reminder generator
  const handleSendReminder = (c: CustomerPlayer) => {
    const rawPhone = c.whatsapp ? c.whatsapp.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const dueAmount = Math.abs(c.ledgerBalance);

    const message = 
      `*Payment Reminder from ${activeClubProfile.businessName}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Hello ${c.name},\n` +
      `Your current pending balance at our gaming club is *₹${dueAmount.toLocaleString('en-IN')}*.\n\n` +
      `💳 *Instant UPI Payment Link:*\n` +
      `upi://pay?pa=${encodeURIComponent(activeClubProfile.upiId)}&pn=${encodeURIComponent(activeClubProfile.businessName)}&am=${dueAmount}&cu=INR&tn=${encodeURIComponent(`Settlement ${c.name}`)}\n\n` +
      `Kindly clear the balance at your earliest convenience. Thank you!`;

    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // =========================================================================
  // IF A CUSTOMER IS SELECTED: RENDER THEIR STATEMENT / KHATA (PartyLedgerView)
  // =========================================================================
  if (selectedCustomer) {
    // Keep reference updated with fresh customer state
    const currentCust = customers.find(c => c.id === selectedCustomer.id) || selectedCustomer;

    return (
      <>
        <PartyLedgerView
          customer={currentCust}
          clubProfile={activeClubProfile}
          entries={ledgerEntries}
          bills={bills}
          onBack={() => setSelectedCustomer(null)}
          onSettleBalance={(cid, amt, method, ref) => {
            onSettleCustomerLedger(cid, amt, method, ref);
          }}
          onViewBill={(b) => setViewingBill(b)}
          isDarkMode={isDarkMode}
          isReadOnly={isReadOnly}
        />

        {/* Bill Detail Modal */}
        {viewingBill && (
          <BillDetailModal
            bill={viewingBill}
            clubProfile={activeClubProfile}
            isDarkMode={isDarkMode}
            onClose={() => setViewingBill(null)}
          />
        )}
      </>
    );
  }

  // =========================================================================
  // DEFAULT VIEW: CUSTOMER DIRECTORY & KHATA OVERVIEW (CustomerListView)
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & METRIC CARDS */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight">
                Customers & Khata Ledger
              </h1>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Track receivables, customer tabs, settlements, and print formal statements
              </p>
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* 2. FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Receivable */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Total Receivable (Dr)
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
            ₹{totalReceivable.toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {debtorsCount} customer(s) with pending dues
          </p>
        </div>

        {/* Total Advance */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Total Advance (Cr)
            </span>
            <div className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            ₹{totalAdvance.toLocaleString('en-IN')}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Prepaid deposits & account credits
          </p>
        </div>

        {/* Active Debtors */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Active Debtors
            </span>
            <div className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDarkMode ? 'text-amber-400' : 'text-amber-600'
          }`}>
            {debtorsCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Awaiting tab settlements
          </p>
        </div>

        {/* Settled / Clear */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              All Settled (Nil)
            </span>
            <div className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-2 ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {settledCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Zero pending balance
          </p>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER TOOLBAR */}
      <div className={`p-3 sm:p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            placeholder="Search customer name or phone..."
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

        {/* Status Filter Pills */}
        <div className={`p-1 rounded-xl border flex items-center text-xs w-full sm:w-auto overflow-x-auto ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('debit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs whitespace-nowrap cursor-pointer ${
              statusFilter === 'debit'
                ? 'bg-rose-600 text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Due Balance ({debtorsCount})
          </button>
          <button
            onClick={() => setStatusFilter('clear')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs whitespace-nowrap cursor-pointer ${
              statusFilter === 'clear'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Settled ({settledCount})
          </button>
          <button
            onClick={() => setStatusFilter('credit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs whitespace-nowrap cursor-pointer ${
              statusFilter === 'credit'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Advance ({customers.filter(c => c.ledgerBalance > 0).length})
          </button>
        </div>
      </div>

      {/* 4. CUSTOMER DIRECTORY LIST */}
      {filteredCustomers.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-50" />
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>No customers found</h3>
          <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredCustomers.map((customer) => {
            const hasDue = customer.ledgerBalance < 0;
            const hasAdvance = customer.ledgerBalance > 0;
            const isSettled = customer.ledgerBalance === 0;
            const dueAmount = Math.abs(customer.ledgerBalance);

            return (
              <div
                key={customer.id}
                className={`p-4 rounded-2xl border shadow-xs transition hover:shadow-md flex flex-col justify-between gap-3 ${
                  isDarkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top: Profile Identity & Balance Pill */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {customer.name}
                        </h3>
                        <div className={`flex items-center gap-2 text-xs mt-0.5 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <span className="font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {customer.whatsapp || 'No Phone'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Balance Pill */}
                    <div className="text-right shrink-0">
                      {hasDue ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border block ${
                          isDarkMode 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          ₹{dueAmount.toLocaleString('en-IN')} Due (DR)
                        </span>
                      ) : hasAdvance ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border block ${
                          isDarkMode 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          ₹{customer.ledgerBalance.toLocaleString('en-IN')} Advance (CR)
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border block ${
                          isDarkMode 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          ₹0 Settled (Clear)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visit Stats */}
                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                    isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span>Visits: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800 font-bold'}>{customer.totalVisits}</strong></span>
                    <span>Last Visited: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800 font-bold'}>{customer.lastVisitedDate || 'Recent'}</strong></span>
                  </div>
                </div>

                {/* Bottom: Fast Actions */}
                <div className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {hasDue && (
                      <button
                        onClick={() => handleSendReminder(customer)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isDarkMode
                            ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/20'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title="Send WhatsApp Reminder with UPI link"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isReadOnly && hasDue && (
                      <button
                        onClick={() => {
                          setQuickPayCustomer(customer);
                          setQuickPayAmount(dueAmount.toString());
                          setQuickPayMethod('UPI');
                          setQuickPayRef('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                        title="Receive payment from customer"
                      >
                        <Banknote className="w-3 h-3" />
                        <span>Pay</span>
                      </button>
                    )}
                  </div>

                  {/* Open Statement (Khata Drill-down) */}
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Statement</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Customers Button */}
      {hasMore && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            {isLoadingMore ? 'Loading Customers...' : 'Load More Customers'}
          </button>
        </div>
      )}

      {/* 5. QUICK PAYMENT MODAL */}
      {quickPayCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
            }`}>
              <div>
                <h3 className="text-sm font-bold">Receive Payment</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Clear dues for {quickPayCustomer.name}</p>
              </div>
              <button
                onClick={() => setQuickPayCustomer(null)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickPay} className="p-5 space-y-4">
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
                  value={quickPayAmount}
                  onChange={(e) => setQuickPayAmount(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono font-bold text-base outline-none transition ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                  }`}
                  placeholder="Enter settlement amount"
                />
                <div className={`flex items-center justify-between mt-1 text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span>Current Due:</span>
                  <span className={`font-mono font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                    ₹{Math.abs(quickPayCustomer.ledgerBalance).toLocaleString('en-IN')}
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
                    onClick={() => setQuickPayMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      quickPayMethod === 'UPI'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPayMethod('Cash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      quickPayMethod === 'Cash'
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
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  value={quickPayRef}
                  onChange={(e) => setQuickPayRef(e.target.value)}
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
                  onClick={() => setQuickPayCustomer(null)}
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

      {/* 6. ADD NEW CUSTOMER MODAL */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
            }`}>
              <h3 className="text-sm font-bold">Add New Customer</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddCustomer} className="p-5 space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                  }`}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none transition ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                  }`}
                  placeholder="e.g. +91 98400 12345"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Save & Open Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BILL DETAIL MODAL */}
      {viewingBill && (
        <BillDetailModal
          bill={viewingBill}
          clubProfile={activeClubProfile}
          isDarkMode={isDarkMode}
          onClose={() => setViewingBill(null)}
        />
      )}
    </div>
  );
};
