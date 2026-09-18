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
  Tag, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { ClubProfile, RazorpayPaymentOrder, SubscriptionConfig } from '../types';
import { JustClubIcon } from './JustClubLogo';
import { printDocumentElement } from '../utils/pdfExport';
import { getAuthToken } from '../services/api';

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubProfile: ClubProfile;
  selectedPlanCycle: 'monthly' | 'quarterly' | 'yearly';
  onPaymentSuccess: (paidOrder: RazorpayPaymentOrder) => void;
  subscriptionConfig: SubscriptionConfig;
  isDarkMode?: boolean;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  clubProfile,
  selectedPlanCycle,
  onPaymentSuccess,
  subscriptionConfig,
  isDarkMode = true,
}) => {
  if (!isOpen) return null;

  const configPlan = subscriptionConfig.plans.find(p => p.id === selectedPlanCycle);
  const currentPlan = {
    id: selectedPlanCycle,
    name: configPlan?.name || (selectedPlanCycle === 'monthly' ? 'Monthly Plan' : selectedPlanCycle === 'quarterly' ? '3-Month Plan' : 'Yearly Plan'),
    amount: configPlan?.amount ?? (selectedPlanCycle === 'monthly' ? 499 : selectedPlanCycle === 'quarterly' ? 1299 : 4499),
    period: configPlan ? (configPlan.periodMonths === 1 ? '1 Month' : `${configPlan.periodMonths} Months`) : (selectedPlanCycle === 'monthly' ? '1 Month' : selectedPlanCycle === 'quarterly' ? '3 Months' : '12 Months'),
    discountLabel: configPlan?.discountLabel || (selectedPlanCycle === 'monthly' ? 'Standard' : selectedPlanCycle === 'quarterly' ? 'Save 13%' : 'Save 25% (2 Mo Free)'),
  };

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [customerEmail, setCustomerEmail] = useState('owner@' + clubProfile.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.in');
  const [customerPhone, setCustomerPhone] = useState(clubProfile.whatsapp || '9876543210');

  const [checkoutStep, setCheckoutStep] = useState<'select' | 'processing' | 'success'>('select');
  const [completedOrder, setCompletedOrder] = useState<RazorpayPaymentOrder | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const discountAmount = appliedPromo 
    ? Math.round((currentPlan.amount * appliedPromo.discountPercent) / 100)
    : 0;
  
  const finalPayableAmount = Math.max(0, currentPlan.amount - discountAmount);

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

  const handleInitiateRazorpayPayment = async () => {
    setIsApiLoading(true);
    setErrorMessage(null);
    setCheckoutStep('processing');

    try {
      // 1. Call Backend to create Razorpay order (amount in paise, minimum 100 paise)
      const amountInPaise = Math.max(100, Math.round(finalPayableAmount * 100));
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
        },
        body: JSON.stringify({
          planId: currentPlan.id,
          planName: currentPlan.name,
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${clubProfile.id}_${Date.now()}`,
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
        throw new Error(data.error || 'Failed to initialize Razorpay payment order.');
      }

      const activeOrderId = data.order_id || data.orderId;
      const orderAmount = data.amount || amountInPaise;
      const orderCurrency = data.currency || 'INR';
      const keyId = data.keyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string);
      if (!keyId) {
        throw new Error('Razorpay Key ID is not configured. Please contact support.');
      }

      // 2. Load Razorpay JS SDK if not already loaded
      const sdkLoaded = (window as any).Razorpay ? true : await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!sdkLoaded || !(window as any).Razorpay) {
        throw new Error('Failed to load Razorpay checkout SDK. Please check your internet connection.');
      }

      // 3. Open Razorpay Standard Checkout Modal
      await new Promise((resolve, reject) => {
        const options = {
          key: keyId,
          amount: orderAmount,
          currency: orderCurrency,
          name: 'JustCLUB SaaS',
          description: `Subscription: ${currentPlan.name} for ${clubProfile.businessName}`,
          image: '/favicon.svg',
          order_id: activeOrderId,
          handler: async function (paymentResponse: any) {
            try {
              // 4. Send razorpay_payment_id, razorpay_order_id, razorpay_signature to verify endpoint
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
                },
                body: JSON.stringify({
                  order_id: activeOrderId,
                  orderId: activeOrderId,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  paymentId: paymentResponse.razorpay_payment_id,
                  signature: paymentResponse.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                const paidOrder: RazorpayPaymentOrder = {
                  orderId: activeOrderId,
                  orderAmount: finalPayableAmount,
                  orderCurrency: 'INR',
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  paymentStatus: 'PAID',
                  planName: currentPlan.name,
                  planCycle: currentPlan.id as any,
                  tenantId: clubProfile.id,
                  tenantName: clubProfile.businessName,
                  customerName: clubProfile.ownerName,
                  customerEmail,
                  customerPhone,
                  createdAt: new Date().toISOString(),
                  paymentMethod: 'Razorpay Secure Checkout (UPI / Cards / NetBanking)',
                  discountApplied: discountAmount,
                  promoCode: appliedPromo?.code,
                };
                setCompletedOrder(paidOrder);
                setCheckoutStep('success');
                onPaymentSuccess(paidOrder);
                resolve(true);
              } else {
                reject(new Error(verifyData.error || 'Payment signature verification failed. Signature mismatch.'));
              }
            } catch (err: any) {
              reject(err);
            }
          },
          prefill: {
            name: clubProfile.ownerName,
            email: customerEmail,
            contact: customerPhone,
          },
          notes: {
            tenantId: clubProfile.id,
            planName: currentPlan.name,
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Checkout cancelled by user.'));
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (failRes: any) {
          const failMsg = failRes.error?.description || failRes.error?.reason || 'Payment failed with bank / payment gateway.';
          reject(new Error(failMsg));
        });
        rzp.open();
      });

    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to Razorpay payment gateway');
      setCheckoutStep('select');
    } finally {
      setIsApiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JustClubIcon size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Razorpay Secure Checkout</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PCI-DSS Level 1
                </span>
              </div>
              <p className="text-xs text-slate-400">Verified Merchant: Rajaganapathy Kamalakannan ({clubProfile.businessName})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- STEP 1: SELECT & PAY --- */}
        {checkoutStep === 'select' && (
          <div className="p-6 space-y-5">
            
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
                <div className="text-[11px] text-slate-400 mt-1">Compliant with RBI Payment Aggregator Guidelines</div>
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
                <label className="text-slate-400 font-semibold block mb-1">Receipt WhatsApp / Phone</label>
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
                onClick={handleInitiateRazorpayPayment}
                disabled={isApiLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-xl transition flex items-center gap-2 cursor-pointer"
              >
                <span>Pay ₹{finalPayableAmount.toLocaleString('en-IN')} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 2: PROCESSING STATE --- */}
        {checkoutStep === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-lg font-black text-white">Opening Razorpay Secure Checkout...</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please complete payment via UPI, Credit Card, or Net Banking in the Razorpay popup.
            </p>
          </div>
        )}

        {/* --- STEP 3: SUCCESS & TAX INVOICE --- */}
        {checkoutStep === 'success' && completedOrder && (
          <div className="p-6 space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-white">Payment Successful & Verified!</h4>
              <p className="text-xs text-emerald-300 font-semibold">
                Workspace "{clubProfile.businessName}" subscription is active.
              </p>
            </div>

            <div id="razorpay-tax-receipt" className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <span>Order ID: {completedOrder.orderId}</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan Description:</span>
                  <span className="font-bold text-white">{completedOrder.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <span className="font-mono text-indigo-400 font-bold">{completedOrder.razorpayPaymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant Name:</span>
                  <span className="font-bold text-slate-200">Rajaganapathy Kamalakannan</span>
                </div>
                {completedOrder.promoCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Promo Discount:</span>
                    <span className="font-bold text-emerald-400">-₹{completedOrder.discountApplied} ({completedOrder.promoCode})</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
                  <span className="text-white">Total Amount Paid:</span>
                  <span className="font-mono text-emerald-400">₹{completedOrder.orderAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => printDocumentElement('razorpay-tax-receipt')}
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
