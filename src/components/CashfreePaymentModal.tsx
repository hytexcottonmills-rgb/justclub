import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Building2, 
  Printer, 
  Download, 
  Tag, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ClubProfile, CashfreePaymentOrder, SubscriptionConfig } from '../types';
import { JustClubIcon, JustClubLogo } from './JustClubLogo';
import { printDocumentElement } from '../utils/pdfExport';

interface CashfreePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubProfile: ClubProfile;
  selectedPlanCycle: 'monthly' | 'quarterly' | 'yearly';
  onPaymentSuccess: (paidOrder: CashfreePaymentOrder) => void;
  subscriptionConfig: SubscriptionConfig;
  isDarkMode?: boolean;
}

export const CashfreePaymentModal: React.FC<CashfreePaymentModalProps> = ({
  isOpen,
  onClose,
  clubProfile,
  selectedPlanCycle,
  onPaymentSuccess,
  subscriptionConfig,
  isDarkMode = true,
}) => {
  if (!isOpen) return null;

  // Derive current plan details dynamically from admin configurations
  const configPlan = subscriptionConfig.plans.find(p => p.id === selectedPlanCycle);
  const currentPlan = {
    id: selectedPlanCycle,
    name: configPlan?.name || (selectedPlanCycle === 'monthly' ? 'Monthly Plan' : selectedPlanCycle === 'quarterly' ? '3-Month Plan' : 'Yearly Plan'),
    amount: configPlan?.amount ?? (selectedPlanCycle === 'monthly' ? 499 : selectedPlanCycle === 'quarterly' ? 1299 : 4499),
    period: configPlan ? (configPlan.periodMonths === 1 ? '1 Month' : `${configPlan.periodMonths} Months`) : (selectedPlanCycle === 'monthly' ? '1 Month' : selectedPlanCycle === 'quarterly' ? '3 Months' : '12 Months'),
    discountLabel: configPlan?.discountLabel || (selectedPlanCycle === 'monthly' ? 'Standard' : selectedPlanCycle === 'quarterly' ? 'Save 13%' : 'Save 25% (2 Mo Free)'),
  };

  // Form State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [customerEmail, setCustomerEmail] = useState('owner@' + clubProfile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.in');
  const [customerPhone, setCustomerPhone] = useState(clubProfile.whatsapp || '9876543210');

  // Checkout Step State: 'select' -> 'processing' -> 'success'
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'processing' | 'success'>('select');
  const [completedOrder, setCompletedOrder] = useState<CashfreePaymentOrder | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Discount Calculation
  const discountAmount = appliedPromo 
    ? Math.round((currentPlan.amount * appliedPromo.discountPercent) / 100)
    : 0;
  
  const finalPayableAmount = Math.max(0, currentPlan.amount - discountAmount);

  // Apply Coupon Code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'JUSTCLUB50') {
      setAppliedPromo({ code: 'JUSTCLUB50', discountPercent: 50 });
    } else if (code === 'EARLYBIRD20') {
      setAppliedPromo({ code: 'EARLYBIRD20', discountPercent: 20 });
    } else if (code === 'FREEMONTH') {
      setAppliedPromo({ code: 'FREEMONTH', discountPercent: 100 });
    } else {
      setPromoError('Invalid or expired coupon code. Try JUSTCLUB50 or EARLYBIRD20');
    }
  };

  // Initiate Cashfree Payment
  const handleInitiateCashfreePayment = async () => {
    setIsApiLoading(true);
    setErrorMessage(null);
    setCheckoutStep('processing');

    try {
      // 1. Call Backend to create order
      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: currentPlan.id,
          planName: currentPlan.name,
          amount: finalPayableAmount,
          customerName: clubProfile.ownerName,
          customerEmail,
          customerPhone,
          tenantId: clubProfile.id,
          tenantName: clubProfile.businessName,
          promoCode: appliedPromo?.code || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize Cashfree payment order.');
      }

      const { order, paymentSessionId } = data;

      // 2. Simulate or execute Cashfree JS SDK verification flow
      setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/cashfree/verify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.orderId,
              cfPaymentId: `cf_pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
              paymentMethod: paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'card' ? 'Visa / MasterCard Credit Card' : 'Net Banking (HDFC / ICICI)',
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success && verifyData.order) {
            const paidOrder: CashfreePaymentOrder = {
              ...verifyData.order,
              orderAmount: finalPayableAmount,
              planName: currentPlan.name,
              planCycle: currentPlan.id as any,
              customerEmail,
              customerPhone,
              discountApplied: discountAmount,
              promoCode: appliedPromo?.code,
            };

            setCompletedOrder(paidOrder);
            setCheckoutStep('success');
            onPaymentSuccess(paidOrder);
          } else {
            throw new Error('Payment verification failed.');
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Payment processing error');
          setCheckoutStep('select');
        } finally {
          setIsApiLoading(false);
        }
      }, 2000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to Cashfree payment gateway server');
      setCheckoutStep('select');
      setIsApiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-teal-950/40 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JustClubIcon size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Cashfree Payment Gateway</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  256-Bit SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400">Instant subscription activation for {clubProfile.businessName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- STEP 1: PAYMENT SELECTION & PROMO CODE --- */}
        {checkoutStep === 'select' && (
          <div className="p-6 space-y-5">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Selected SaaS Plan</div>
                <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
                  <span>{currentPlan.name}</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {currentPlan.discountLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{subscriptionConfig.trialPeriodDays}-Day Free Trial included • Renews in {currentPlan.period}</div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ₹{finalPayableAmount.toLocaleString('en-IN')}
                </div>
                {discountAmount > 0 && (
                  <div className="text-[11px] font-mono line-through text-slate-500">
                    ₹{currentPlan.amount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Promo Code Input Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Apply Promo Code / Coupon
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. JUSTCLUB50)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white uppercase focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Coupon "{appliedPromo.code}" Applied ({appliedPromo.discountPercent}% OFF, Saved ₹{discountAmount})
                </div>
              )}

              {promoError && (
                <div className="text-xs text-red-400 font-medium mt-1">{promoError}</div>
              )}
            </form>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Cashfree Payment Method</label>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">UPI Instant (GPay / PhonePe)</div>
                    <div className="text-[10px] text-slate-400">Zero MDR Fee</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Debit / Credit Cards</div>
                    <div className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Billing Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Receipt Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Receipt WhatsApp</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInitiateCashfreePayment}
                disabled={isApiLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xl transition flex items-center gap-2"
              >
                <span>Pay ₹{finalPayableAmount.toLocaleString('en-IN')} via Cashfree</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 2: PROCESSING STATE --- */}
        {checkoutStep === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-lg font-black text-white">Contacting Cashfree PG Gateway...</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Connecting to Cashfree Secure Checkout API. Please do not close or refresh this window.
            </p>
          </div>
        )}

        {/* --- STEP 3: PAYMENT SUCCESS RECEIPT & TAX INVOICE --- */}
        {checkoutStep === 'success' && completedOrder && (
          <div className="p-6 space-y-5 animate-in zoom-in-95">
            
            {/* Success Banner */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-white">Subscription Payment Successful!</h4>
              <p className="text-xs text-emerald-300 font-semibold">
                Your POS tenant "{clubProfile.businessName}" is now fully ACTIVE.
              </p>
            </div>

            {/* Tax Invoice Box */}
            <div id="cashfree-tax-receipt" className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <span>Receipt #: {completedOrder.orderId}</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan Description:</span>
                  <span className="font-bold text-white">{completedOrder.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Gateway ID:</span>
                  <span className="font-mono text-indigo-400 font-bold">{completedOrder.cfPaymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-bold text-slate-200">{completedOrder.paymentMethod}</span>
                </div>
                {completedOrder.promoCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Promo Code Discount:</span>
                    <span className="font-bold text-emerald-400">-₹{completedOrder.discountApplied} ({completedOrder.promoCode})</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
                  <span className="text-white">Total Amount Paid:</span>
                  <span className="font-mono text-emerald-400">₹{completedOrder.orderAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Print / Done CTA */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => printDocumentElement('cashfree-tax-receipt')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Tax Receipt
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                Done & Return to POS
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
