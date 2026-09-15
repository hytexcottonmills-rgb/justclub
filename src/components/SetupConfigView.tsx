import React, { useState } from 'react';
import { ClubProfile, GameAsset, BarItem, AssetCategory, BillingIncrement, CashfreePaymentOrder } from '../types';
import { UpiQrModal } from './UpiQrModal';
import { CashfreePaymentModal } from './CashfreePaymentModal';
import { BrandAssetSpecModal } from './BrandAssetSpecModal';
import { 
  Settings, 
  Gamepad2, 
  ShoppingBag, 
  QrCode, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Building2, 
  Crown,
  ShieldCheck,
  RefreshCw,
  LogOut,
  User,
  Sparkles,
  Gift,
  CreditCard,
  Download,
  Image as ImageIcon,
  Share2,
  Layers
} from 'lucide-react';

interface SetupConfigViewProps {
  clubProfile: ClubProfile;
  gameAssets: GameAsset[];
  barItems: BarItem[];
  onUpdateClubProfile: (updated: ClubProfile) => void;
  onUpdateGameAsset: (asset: GameAsset) => void;
  onAddGameAsset: (asset: Omit<GameAsset, 'id'>) => void;
  onDeleteGameAsset: (id: string) => void;
  onUpdateBarItem: (item: BarItem) => void;
  onAddBarItem: (item: Omit<BarItem, 'id'>) => void;
  onDeleteBarItem: (id: string) => void;
  isDarkMode?: boolean;
  onOpenSuperAdminPortal?: () => void;
  onLogout?: () => void;
}

export const SetupConfigView: React.FC<SetupConfigViewProps> = ({
  clubProfile,
  gameAssets,
  barItems,
  onUpdateClubProfile,
  onUpdateGameAsset,
  onAddGameAsset,
  onDeleteGameAsset,
  onUpdateBarItem,
  onAddBarItem,
  onDeleteBarItem,
  isDarkMode = true,
  onOpenSuperAdminPortal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'assets' | 'bar'>('profile');
  const [renewNotice, setRenewNotice] = useState<string | null>(null);
  const [selectedPlanCycle, setSelectedPlanCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  // Club Profile Form State
  const [profileForm, setProfileForm] = useState<ClubProfile>(clubProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Asset Form State
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('Billiards');
  const [newAssetRate, setNewAssetRate] = useState<number>(300);
  const [newAssetIncrement, setNewAssetIncrement] = useState<BillingIncrement>('exact');

  // New Bar Item Form State
  const [isAddingBarItem, setIsAddingBarItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Beverages' | 'Snacks' | 'Lounge / Hookah' | 'Combos'>('Beverages');
  const [newItemPrice, setNewItemPrice] = useState<number>(150);
  const [newItemStock, setNewItemStock] = useState<number>(50);

  // Test QR Modal State
  const [isTestQrOpen, setIsTestQrOpen] = useState(false);

  // Brand Asset Specification Display Modal
  const [isBrandSpecModalOpen, setIsBrandSpecModalOpen] = useState(false);

  // Cashfree Payment Gateway Checkout Modal State
  const [isCashfreeModalOpen, setIsCashfreeModalOpen] = useState(false);
  const [cfSelectedPlanCycle, setCfSelectedPlanCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClubProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName) return;
    onAddGameAsset({
      name: newAssetName,
      category: newAssetCategory,
      hourlyRate: newAssetRate,
      billingIncrement: newAssetIncrement,
      status: 'available',
    });
    setNewAssetName('');
    setIsAddingAsset(false);
  };

  const handleCreateBarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    onAddBarItem({
      name: newItemName,
      category: newItemCategory,
      price: newItemPrice,
      stock: newItemStock,
    });
    setNewItemName('');
    setIsAddingBarItem(false);
  };

  const handleOpenCashfreeCheckout = (planCycle: 'monthly' | 'quarterly' | 'yearly') => {
    setCfSelectedPlanCycle(planCycle);
    setIsCashfreeModalOpen(true);
  };

  const handleCashfreePaymentSuccess = (paidOrder: CashfreePaymentOrder) => {
    const daysToAdd = paidOrder.planCycle === 'yearly' ? 365 : paidOrder.planCycle === 'quarterly' ? 90 : 30;
    const newDueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onUpdateClubProfile({ 
      ...clubProfile, 
      tenantStatus: 'ACTIVE',
      renewalDueDate: newDueDate,
    });

    setRenewNotice(`Cashfree Subscription Payment Verified (${paidOrder.cfPaymentId})! Status ACTIVE until ${newDueDate}.`);
    setTimeout(() => setRenewNotice(null), 8000);
  };

  // Theme helper classes
  const cardBg = isDarkMode 
    ? 'bg-slate-900 border-slate-800 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const inputBg = isDarkMode 
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500';

  const labelColor = isDarkMode ? 'text-slate-400' : 'text-slate-700';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <Settings className="w-5 h-5 text-indigo-500" /> Club Tenant Setup & Catalog Configuration
        </h1>
        <p className={`text-xs mt-0.5 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Configure business details, UPI payment parameters, hourly game rates, and cafe inventory.
        </p>
      </div>

      {/* Tabs Row */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> Club Profile & UPI
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'subscription'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" /> Subscription Plans (3 Options)
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'assets'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Game Assets ({gameAssets.length})
        </button>

        <button
          onClick={() => setActiveTab('bar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'bar'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Bar & Snack Catalog ({barItems.length})
        </button>
      </div>

      {/* TAB 1: CLUB PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-xl space-y-4 ${cardBg}`}>
            <h2 className={`text-base font-bold pb-3 border-b flex items-center justify-between ${
              isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              <span>Club & Owner Configuration</span>
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved Successfully!
                </span>
              )}
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Business Name</label>
                  <input
                    type="text"
                    value={profileForm.businessName}
                    onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Owner Name</label>
                  <input
                    type="text"
                    value={profileForm.ownerName}
                    onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>WhatsApp Business Number</label>
                  <input
                    type="text"
                    value={profileForm.whatsapp}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${inputBg}`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Pincode</label>
                  <input
                    type="text"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${inputBg}`}
                    required
                  />
                </div>
              </div>

              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <label className={`font-bold block mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Club UPI Virtual Payment Address (VPA for Dynamic QR)
                </label>
                <input
                  type="text"
                  placeholder="e.g. apexcueclub@okaxis"
                  value={profileForm.upiId}
                  onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-mono font-bold border ${inputBg}`}
                  required
                />
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  All customer payments go directly to this UPI ID with zero gateway MDR fees.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" /> Save Club Configuration
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: QR Preview & Profile Account Logout */}
          <div className="space-y-4">
            <div className={`rounded-2xl p-6 border shadow-xl text-center space-y-4 flex flex-col items-center justify-center ${cardBg}`}>
              <div className={`p-3 rounded-2xl ${
                isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Dynamic UPI QR Preview
                </h3>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Generates instant QR code for customer walk-in checkout.
                </p>
              </div>

              <button
                onClick={() => setIsTestQrOpen(true)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700' 
                    : 'bg-slate-50 hover:bg-slate-100 text-indigo-600 border-slate-200'
                }`}
              >
                Test Live QR Code (₹500)
              </button>
            </div>



            {/* Profile Account & Logout Card */}
            <div className={`rounded-2xl p-5 border shadow-xl space-y-3 ${cardBg}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {clubProfile.ownerName ? clubProfile.ownerName.slice(0, 2).toUpperCase() : 'RS'}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {clubProfile.ownerName}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {clubProfile.businessName}
                  </p>
                </div>
              </div>

              <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
              }`}>
                <span>Role: <strong className="text-indigo-600 dark:text-indigo-400">Club Owner / Admin</strong></span>
                <span className="font-mono text-[10px]">+{clubProfile.whatsapp}</span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full mt-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of justclub</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THREE SUBSCRIPTION PLANS (MONTHLY, QUARTERLY, YEARLY) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            clubProfile.tenantStatus === 'SUSPENDED'
              ? isDarkMode ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
              : isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-extrabold text-sm">
                  Tenant Status: <span className="uppercase font-mono">{clubProfile.tenantStatus}</span>
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {clubProfile.tenantStatus === 'SUSPENDED'
                    ? 'Subscription payment required to unlock POS table entry.'
                    : '15-Day Free Trial active. All POS modules & split billing unlocked.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded font-mono ${
                isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Next Renewal: Oct 1, 2026
              </span>
            </div>
          </div>

          {renewNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              {renewNotice}
            </div>
          )}

          {/* 3 PLANS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PLAN 1: MONTHLY */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Monthly Plan</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Standard
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-3xl font-black font-mono">₹499</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-4 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Includes 15-Day Free Trial
                </div>

                <ul className={`space-y-2 text-xs border-t pt-3 mb-6 ${
                  isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-600 border-slate-100'
                }`}>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 15 Days Free Trial (₹0 today)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Billed Monthly (₹499/mo)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Game Tables & PS5</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Automated Split Billing</li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenCashfreeCheckout('monthly')}
                className={`w-full py-2.5 px-4 rounded-xl border font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'border-emerald-500/40 hover:bg-emerald-600/10 text-emerald-300'
                    : 'border-emerald-600 hover:bg-emerald-50 text-emerald-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" /> Pay ₹499 via Cashfree
              </button>
            </div>

            {/* PLAN 2: QUARTERLY (HIGHLIGHTED) */}
            <div className={`p-6 rounded-2xl border-2 border-indigo-500 flex flex-col justify-between relative shadow-xl ${
              isDarkMode ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 text-white' : 'bg-indigo-50/50 border-indigo-500 text-slate-900'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                Save 13% • Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">3-Month Plan</span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Save ₹198
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-black font-mono">₹1,299</span>
                  <span className="text-xs text-slate-400"> / 3 months</span>
                </div>
                <div className={`text-xs font-mono mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-650 font-bold'}`}>
                  (~<strong>₹433/mo</strong>)
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-4 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Includes 15-Day Free Trial
                </div>

                <ul className={`space-y-2 text-xs border-t pt-3 mb-6 ${
                  isDarkMode ? 'text-slate-200 border-indigo-500/20' : 'text-slate-700 border-indigo-200'
                }`}>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> 15 Days Free Trial (₹0 today)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Billed Every 3 Months (₹1,299)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> 13% Discount vs Monthly</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Priority WhatsApp Support</li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenCashfreeCheckout('quarterly')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-slate-950" /> Pay ₹1,299 via Cashfree
              </button>
            </div>

            {/* PLAN 3: YEARLY (MAX DISCOUNT) */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative ${
              isDarkMode ? 'bg-slate-900 border-purple-500/40 text-white' : 'bg-white border-purple-200 text-slate-900'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                Save 25% • 2 Months Free
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Yearly Plan (12 Months)</span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Save ₹1,489
                  </span>
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-black font-mono">₹4,499</span>
                  <span className="text-xs text-slate-400"> / year</span>
                </div>
                <div className={`text-xs font-mono mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700 font-bold'}`}>
                  (~<strong>₹375/mo</strong>)
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mb-4 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Includes 15-Day Free Trial
                </div>

                <ul className={`space-y-2 text-xs border-t pt-3 mb-6 ${
                  isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-600 border-slate-100'
                }`}>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> 15 Days Free Trial (₹0 today)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Billed Annually (₹4,499/yr)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Save ₹1,489 (2 Months Free)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Printed UPI QR Acrylic Stands</li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenCashfreeCheckout('yearly')}
                className={`w-full py-2.5 px-4 rounded-xl border font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'border-emerald-500/40 hover:bg-emerald-600/10 text-emerald-300'
                    : 'border-emerald-600 hover:bg-emerald-50 text-emerald-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" /> Pay ₹4,499 via Cashfree
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: GAME ASSETS & RATES */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Configured Tables & Consoles
            </h2>
            <button
              onClick={() => setIsAddingAsset(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Game Asset
            </button>
          </div>

          {/* New Asset Form */}
          {isAddingAsset && (
            <form onSubmit={handleCreateAsset} className={`p-4 border rounded-2xl space-y-3 text-xs ${
              isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
            }`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add New Game Asset</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Asset Name (e.g. Table 4 - Snooker)"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className={`rounded-xl px-3 py-2 border ${inputBg}`}
                  required
                />
                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                  className={`rounded-xl px-3 py-2 border ${inputBg}`}
                >
                  <option value="Billiards">Billiards / Snooker</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="PS5">PlayStation / Xbox Consoles</option>
                  <option value="PC Gaming">PC Gaming Rigs</option>
                  <option value="VR">VR Pod / Station</option>
                  <option value="Foosball">Foosball Table</option>
                  <option value="Air Hockey">Air Hockey Table</option>
                  <option value="Darts">Darts Lane</option>
                  <option value="Karaoke">Karaoke Suite</option>
                  <option value="Board Games">Board Game Lounge</option>
                </select>
                <input
                  type="number"
                  placeholder="Hourly Rate (₹)"
                  value={newAssetRate}
                  onChange={(e) => setNewAssetRate(Number(e.target.value))}
                  className={`rounded-xl px-3 py-2 font-mono border ${inputBg}`}
                  required
                />
                <select
                  value={newAssetIncrement}
                  onChange={(e) => setNewAssetIncrement(e.target.value as BillingIncrement)}
                  className={`rounded-xl px-3 py-2 border ${inputBg}`}
                >
                  <option value="exact">Exact Minutes Billing</option>
                  <option value="15min">15-Min Block Rounding</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAsset(false)}
                  className={`px-3 py-1.5 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Asset
                </button>
              </div>
            </form>
          )}

          {/* Assets Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="p-4">Asset Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Hourly Rate</th>
                  <th className="p-4">Billing Increment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                {gameAssets.map(asset => (
                  <tr key={asset.id} className={`transition ${
                    isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`p-4 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{asset.name}</td>
                    <td className={`p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{asset.category}</td>
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{asset.hourlyRate}/hr</td>
                    <td className={`p-4 font-mono ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{asset.billingIncrement}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteGameAsset(asset.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BAR & SNACK CATALOG */}
      {activeTab === 'bar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Bar Inventory & Food Menu
            </h2>
            <button
              onClick={() => setIsAddingBarItem(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>
          </div>

          {/* New Bar Item Form */}
          {isAddingBarItem && (
            <form onSubmit={handleCreateBarItem} className={`p-4 border rounded-2xl space-y-3 text-xs ${
              isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
            }`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add New Cafe/Bar Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Cold Coffee)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={`rounded-xl px-3 py-2 border ${inputBg}`}
                  required
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className={`rounded-xl px-3 py-2 border ${inputBg}`}
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Lounge / Hookah">Lounge / Hookah</option>
                  <option value="Combos">Combos</option>
                </select>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className={`rounded-xl px-3 py-2 font-mono border ${inputBg}`}
                  required
                />
                <input
                  type="number"
                  placeholder="Initial Stock Count"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(Number(e.target.value))}
                  className={`rounded-xl px-3 py-2 font-mono border ${inputBg}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingBarItem(false)}
                  className={`px-3 py-1.5 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          )}

          {/* Bar Items Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Selling Price (Tax-Inclusive)</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                {barItems.map(item => (
                  <tr key={item.id} className={`transition ${
                    isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`p-4 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                    <td className={`p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.category}</td>
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{item.price}</td>
                    <td className={`p-4 font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.stock !== null ? `${item.stock} Units` : 'Unlimited'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteBarItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test QR Modal */}
      {isTestQrOpen && (
        <UpiQrModal
          isOpen={isTestQrOpen}
          onClose={() => setIsTestQrOpen(false)}
          amount={500}
          upiId={profileForm.upiId}
          clubName={profileForm.businessName}
        />
      )}

      {/* Cashfree Payment Modal */}
      {isCashfreeModalOpen && (
        <CashfreePaymentModal
          isOpen={isCashfreeModalOpen}
          onClose={() => setIsCashfreeModalOpen(false)}
          clubProfile={clubProfile}
          selectedPlanCycle={cfSelectedPlanCycle}
          onPaymentSuccess={handleCashfreePaymentSuccess}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Brand Asset Specification Modal */}
      <BrandAssetSpecModal
        isOpen={isBrandSpecModalOpen}
        onClose={() => setIsBrandSpecModalOpen(false)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
