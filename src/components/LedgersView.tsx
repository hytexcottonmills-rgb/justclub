import React, { useState } from 'react';
import { CustomerPlayer, PaymentMethod } from '../types';
import { generateWhatsAppReminderLink } from '../utils/billing';
import { UpiQrModal } from './UpiQrModal';
import { 
  Receipt, 
  Search, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  QrCode,
  X,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';

interface LedgersViewProps {
  customers: CustomerPlayer[];
  upiId: string;
  clubName: string;
  onSettleCustomerLedger: (customerId: string, amountCleared: number, method: PaymentMethod) => void;
  onAddNewCustomer: (name: string, whatsapp: string) => CustomerPlayer;
  isDarkMode?: boolean;
}

export const LedgersView: React.FC<LedgersViewProps> = ({
  customers,
  upiId,
  clubName,
  onSettleCustomerLedger,
  onAddNewCustomer,
  isDarkMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit' | 'clear'>('debit');

  // Settlement Drawer/Modal state
  const [settlingCustomer, setSettlingCustomer] = useState<CustomerPlayer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('UPI');

  // Add customer modal state
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');

  // UPI QR state
  const [qrCustomer, setQrCustomer] = useState<{ customer: CustomerPlayer; amount: number } | null>(null);

  // Compute summary metrics
  const totalDebitAmount = customers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);
  const totalCreditAmount = customers.reduce((acc, c) => c.ledgerBalance > 0 ? acc + c.ledgerBalance : acc, 0);
  const unpaidCount = customers.filter(c => c.ledgerBalance < 0).length;

  const filteredCustomers = customers.filter(c => {
    if (filterType === 'debit' && c.ledgerBalance >= 0) return false;
    if (filterType === 'credit' && c.ledgerBalance <= 0) return false;
    if (filterType === 'clear' && c.ledgerBalance !== 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.whatsapp.includes(q);
    }
    return true;
  });

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addPhone) return;
    onAddNewCustomer(addName, addPhone);
    setAddName('');
    setAddPhone('');
    setIsAddCustOpen(false);
  };

  const handleConfirmSettle = () => {
    if (!settlingCustomer || settleAmount <= 0) return;
    onSettleCustomerLedger(settlingCustomer.id, settleAmount, settleMethod);
    setSettlingCustomer(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Telemetry Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Receipt className="w-5 h-5 text-indigo-500" /> Customer Ledgers & Debt Recovery
          </h1>
          <p className={`text-xs mt-0.5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Track unpaid tabs, record settlements, and trigger zero-cost WhatsApp UPI reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer Profile
        </button>
      </div>

      {/* Overview Metric Spark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Total Outstanding Debts
            </span>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              ₹{totalDebitAmount.toLocaleString('en-IN')}
            </div>
            <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {unpaidCount} Pending Customer Accounts
            </span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Total Advance Credits
            </span>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              ₹{totalCreditAmount.toLocaleString('en-IN')}
            </div>
            <span className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Customer Advance Funds
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              WhatsApp Integration
            </span>
            <div className={`text-sm font-bold mt-1 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Zero MDR Fee Reminders
            </div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Direct wa.me + UPI links</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {(['debit', 'all', 'credit', 'clear'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isDarkMode
                    ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'debit' ? `Unpaid Debts (${unpaidCount})` : type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="p-4">Customer Details</th>
                <th className="p-4">WhatsApp Phone</th>
                <th className="p-4">Visits & LTV</th>
                <th className="p-4">Ledger Balance</th>
                <th className="p-4 text-right">Debt Recovery & Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${
              isDarkMode ? 'divide-slate-800/80' : 'divide-slate-200'
            }`}>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`p-8 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    No customer ledgers match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const isDebit = customer.ledgerBalance < 0;
                  const isCredit = customer.ledgerBalance > 0;
                  const absBalance = Math.abs(customer.ledgerBalance);

                  const waReminderUrl = generateWhatsAppReminderLink(
                    customer.name,
                    customer.whatsapp,
                    clubName,
                    absBalance,
                    upiId
                  );

                  return (
                    <tr key={customer.id} className={isDarkMode ? 'hover:bg-slate-800/40 transition' : 'hover:bg-slate-50 transition'}>
                      
                      <td className="p-4">
                        <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{customer.name}</div>
                        {customer.notes && (
                          <div className={`text-[11px] italic truncate max-w-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{customer.notes}</div>
                        )}
                      </td>

                      <td className={`p-4 font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        +{customer.whatsapp}
                      </td>

                      <td className="p-4">
                        <div className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{customer.totalVisits} Visits</div>
                        <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>LTV: ₹{customer.lifetimeValue.toLocaleString('en-IN')}</div>
                      </td>

                      <td className="p-4">
                        {isDebit ? (
                          <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg inline-block border ${
                            isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            Debit: -₹{absBalance.toLocaleString('en-IN')}
                          </span>
                        ) : isCredit ? (
                          <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg inline-block border ${
                            isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            Credit: +₹{absBalance.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg inline-block border ${
                            isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            Clear (₹0)
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isDebit && (
                            <>
                              {/* Send WhatsApp Reminder Link */}
                              <a
                                href={waReminderUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                                  isDarkMode
                                    ? 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                }`}
                                title="Open pre-filled WhatsApp link with UPI payment details"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Debt Reminder
                              </a>

                              {/* Show QR Code */}
                              <button
                                onClick={() => setQrCustomer({ customer, amount: absBalance })}
                                className={`p-1.5 rounded-xl border transition ${
                                  isDarkMode
                                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-300'
                                }`}
                                title="Display UPI QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Settle Debt Button */}
                          {isDebit && (
                            <button
                              onClick={() => {
                                setSettlingCustomer(customer);
                                setSettleAmount(absBalance);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs transition"
                            >
                              Settle ₹{absBalance}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTLE DEBT MODAL */}
      {settlingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md border rounded-2xl shadow-2xl p-6 space-y-4 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Record Ledger Debt Payment</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Customer: {settlingCustomer.name}</p>
              </div>
              <button
                onClick={() => setSettlingCustomer(null)}
                className={`p-1 rounded-lg ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Amount to Clear (₹)
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-bold font-mono border focus:outline-none focus:border-indigo-500 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-emerald-400'
                      : 'bg-slate-50 border-slate-300 text-emerald-600'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Payment Collection Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMethod('Cash')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      settleMethod === 'Cash'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-950 text-slate-400 border border-slate-800'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMethod('UPI')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      settleMethod === 'UPI'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-950 text-slate-400 border border-slate-800'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    UPI Payment
                  </button>
                </div>
              </div>
            </div>

            <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                onClick={() => setSettlingCustomer(null)}
                className={`px-4 py-2 text-xs font-medium rounded-xl ${
                  isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettle}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Confirm Payment & Update Ledger
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER PROFILE MODAL */}
      {isAddCustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md border rounded-2xl shadow-2xl p-6 space-y-4 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Register New Customer Profile</h3>
              <button onClick={() => setIsAddCustOpen(false)} className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajaganapathy"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>WhatsApp Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 919876543210"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-indigo-500 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsAddCustOpen(false)}
                  className={`px-4 py-2 text-xs font-medium rounded-xl ${
                    isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* UPI QR Modal Trigger */}
      {qrCustomer && (
        <UpiQrModal
          isOpen={Boolean(qrCustomer)}
          onClose={() => setQrCustomer(null)}
          amount={qrCustomer.amount}
          upiId={upiId}
          clubName={clubName}
          customerName={qrCustomer.customer.name}
          isDarkMode={isDarkMode}
          onConfirmPaid={() => {
            onSettleCustomerLedger(qrCustomer.customer.id, qrCustomer.amount, 'UPI');
            setQrCustomer(null);
          }}
        />
      )}
    </div>
  );
};
