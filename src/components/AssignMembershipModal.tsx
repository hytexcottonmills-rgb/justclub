import React, { useState, useEffect } from 'react';
import { CustomerPlayer, MembershipPlan, PaymentMethod, CustomerMembership } from '../types';
import { getLocalDateString } from '../utils/billing';
import { formatWhatsAppDisplay } from '../utils/phone';
import { 
  X, 
  Crown, 
  Check, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Trash2,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerPlayer | null;
  plans: MembershipPlan[];
  onAssignMembership: (params: {
    customer: CustomerPlayer;
    plan: MembershipPlan;
    startDate: string;
    endDate: string;
    price: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  onCancelMembership: (customerId: string) => void;
  isDarkMode?: boolean;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    today.setDate(today.getDate() + days);
    return getLocalDateString(today);
  }
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

export const AssignMembershipModal: React.FC<AssignMembershipModalProps> = ({
  isOpen,
  onClose,
  customer,
  plans,
  onAssignMembership,
  onCancelMembership,
  isDarkMode = true,
}) => {
  if (!isOpen || !customer) return null;

  const todayStr = getLocalDateString();
  const activePlans = plans.filter(p => p.isActive);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (customer.membershipPlanId && activePlans.some(p => p.id === customer.membershipPlanId)) {
      return customer.membershipPlanId;
    }
    return activePlans[0]?.id || '';
  });

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');

  const currentPlan = plans.find(p => p.id === selectedPlanId) || activePlans[0];

  // Auto-calculate end date whenever plan or start date changes
  useEffect(() => {
    if (currentPlan) {
      setEndDate(addDays(startDate, currentPlan.durationDays));
      setCustomPrice(currentPlan.price);
    }
  }, [selectedPlanId, startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan) return;

    onAssignMembership({
      customer,
      plan: currentPlan,
      startDate,
      endDate: endDate || addDays(startDate, currentPlan.durationDays),
      price: customPrice,
      paymentMethod,
      notes,
    });
    onClose();
  };

  const hasExistingActive = customer.membershipStatus === 'ACTIVE' && customer.membershipPlanName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4.5 border-b flex items-start justify-between shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Assign Membership Plan
              </h2>
              <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select discount tier & payment mode for <strong className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>{customer.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Current Membership Status Banner */}
          {hasExistingActive ? (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
            }`}>
              <div className="space-y-0.5">
                <div className={`flex items-center gap-1.5 font-bold text-xs ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
                  <Crown className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Currently Active: {customer.membershipPlanName}</span>
                </div>
                <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {customer.membershipDiscountPercent}% Game Discount • Valid till {customer.membershipExpiresAt}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Cancel active membership for ${customer.name}?`)) {
                    onCancelMembership(customer.id);
                    onClose();
                  }
                }}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
              >
                Cancel Plan
              </button>
            </div>
          ) : null}

          {/* 1. Plan Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Select Membership Tier <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activePlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedPlanId === plan.id
                      ? isDarkMode 
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-indigo-50/90 border-indigo-500 text-slate-900 ring-2 ring-indigo-500/20'
                      : isDarkMode
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className={`text-xs font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.name}</span>
                    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border ${
                      isDarkMode 
                        ? 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30' 
                        : 'text-indigo-800 bg-indigo-100 border-indigo-300'
                    }`}>
                      {plan.gameDiscountPercent}% OFF
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-[11px] mt-2 pt-1.5 border-t ${
                    isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span className={`font-mono font-black text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="font-semibold">{plan.durationDays} Days</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {currentPlan && (
            /* Selected Plan Highlights */
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentPlan.gameDiscountPercent}% Game Share Discount</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Calculated automatically on every match checkout</span>
                </div>
              </div>
              <span className={`font-mono font-black text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                ₹{currentPlan.price}
              </span>
            </div>
          )}

          {/* 2. Validity Dates (Side-by-Side Grid with WebKit overflow boundary) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5 min-w-0">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full max-w-full min-w-0 box-border px-2.5 sm:px-3.5 py-2.5 text-[11px] sm:text-xs font-mono font-semibold rounded-2xl border outline-none transition ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                    : 'bg-slate-50/60 border-slate-200/90 text-slate-900 focus:bg-white focus:border-indigo-500 shadow-2xs'
                }`}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full max-w-full min-w-0 box-border px-2.5 sm:px-3.5 py-2.5 text-[11px] sm:text-xs font-mono font-semibold rounded-2xl border outline-none transition ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                    : 'bg-slate-50/60 border-slate-200/90 text-slate-900 focus:bg-white focus:border-indigo-500 shadow-2xs'
                }`}
              />
            </div>
          </div>

          {/* 4. Fee */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Membership Fee (₹)
            </label>
            <input
              type="number"
              min="0"
              required
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 text-xs font-mono font-black rounded-2xl border outline-none transition ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                  : 'bg-slate-50/60 border-slate-200/90 text-slate-900 focus:bg-white focus:border-indigo-500 shadow-2xs'
              }`}
            />
          </div>

          {/* 5. Payment Method */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Payment Collection Mode
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className={`w-full px-3.5 py-2.5 text-xs font-bold rounded-2xl border outline-none transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                  : 'bg-slate-50/60 border-slate-200/90 text-slate-900 focus:bg-white focus:border-indigo-500 shadow-2xs'
              }`}
            >
              <option value="Cash">Cash (Received at Desk)</option>
              <option value="UPI">UPI (QR / App Transfer)</option>
              <option value="Ledger">Debit to Khata / Ledger</option>
            </select>
          </div>

          {/* 6. Notes */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Remarks / Receipt Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in full via GPay at counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border outline-none transition ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                  : 'bg-slate-50/60 border-slate-200/90 text-slate-900 focus:bg-white focus:border-indigo-500 shadow-2xs'
              }`}
            />
          </div>

          {/* Bottom Summary Notice */}
          <div className={`p-3.5 rounded-2xl border text-[11px] flex items-center gap-2.5 ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Activating applies <strong className={isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}>{currentPlan?.gameDiscountPercent || 0}% discount</strong> immediately to {customer.name} across all 1v1, 2v2, LP & solo game checkouts until {endDate}.
            </span>
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200/80'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 text-xs font-bold rounded-2xl border transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Activate Membership</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
