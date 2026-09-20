import React, { useState } from 'react';
import { ClubProfile, GameAsset, BarItem, AssetCategory, BillingIncrement, BillingBasis, RazorpayPaymentOrder, SubscriptionConfig } from '../types';
import { UpiQrModal } from './UpiQrModal';
import { RazorpayPaymentModal } from './RazorpayPaymentModal';
import { BrandAssetSpecModal } from './BrandAssetSpecModal';
import { 
  Settings, 
  Gamepad2, 
  Martini, 
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
  Layers,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';

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
  subscriptionConfig: SubscriptionConfig;
  isDarkMode?: boolean;
  onOpenSuperAdminPortal?: () => void;
  onLogout?: () => void;
  isReadOnly?: boolean;
  onLoadMoreAssets?: () => void;
  hasMoreAssets?: boolean;
  isLoadingMoreAssets?: boolean;
  onLoadMoreBarItems?: () => void;
  hasMoreBarItems?: boolean;
  isLoadingMoreBarItems?: boolean;
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
  subscriptionConfig,
  isDarkMode = true,
  onOpenSuperAdminPortal,
  onLogout,
  isReadOnly = false,
  onLoadMoreAssets,
  hasMoreAssets = false,
  isLoadingMoreAssets = false,
  onLoadMoreBarItems,
  hasMoreBarItems = false,
  isLoadingMoreBarItems = false,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'assets' | 'bar' | 'support'>('profile');
  const [renewNotice, setRenewNotice] = useState<string | null>(null);
  const [selectedPlanCycle, setSelectedPlanCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  // Support Helpdesk Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Help');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState<string | null>(null);
  const [ticketErrorMessage, setTicketErrorMessage] = useState<string | null>(null);

  // Club Profile Form State
  const [profileForm, setProfileForm] = useState<ClubProfile>(clubProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Asset Form State
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('Billiards');
  const [newAssetRate, setNewAssetRate] = useState<number>(300);
  const [newAssetIncrement, setNewAssetIncrement] = useState<BillingIncrement>('exact');
  const [newAssetBillingBasis, setNewAssetBillingBasis] = useState<BillingBasis>('PER_TABLE');

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

  // Razorpay Payment Gateway Checkout Modal State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [rzpSelectedPlanCycle, setRzpSelectedPlanCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      setTicketErrorMessage('Please fill in both the subject and the description.');
      return;
    }

    setIsSubmittingTicket(true);
    setTicketSuccessMessage(null);
    setTicketErrorMessage(null);

    try {
      const res = await api.support.createTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        description: ticketDescription.trim()
      });

      if (res && res.success) {
        setTicketSuccessMessage(`Ticket #${res.id || 'SUBMITTED'} opened successfully. Our admin team will contact you shortly.`);
        setTicketSubject('');
        setTicketDescription('');
      } else {
        setTicketErrorMessage('Failed to submit support ticket.');
      }
    } catch (err: any) {
      setTicketErrorMessage(err.message || 'Error occurred while contacting customer support.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

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
      billingBasis: newAssetBillingBasis,
      status: 'available',
    });
    setNewAssetName('');
    setNewAssetBillingBasis('PER_TABLE');
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

  const handleOpenRazorpayCheckout = (planCycle: 'monthly' | 'quarterly' | 'yearly') => {
    setRzpSelectedPlanCycle(planCycle);
    setIsRazorpayModalOpen(true);
  };

  const handleRazorpayPaymentSuccess = (paidOrder: RazorpayPaymentOrder) => {
    const daysToAdd = paidOrder.planCycle === 'yearly' ? 365 : paidOrder.planCycle === 'quarterly' ? 90 : 30;
    const newDueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onUpdateClubProfile({ 
      ...clubProfile, 
      tenantStatus: 'ACTIVE',
      renewalDueDate: newDueDate,
    });

    setRenewNotice(`Razorpay Subscription Payment Verified (${paidOrder.razorpayPaymentId})! Status ACTIVE until ${newDueDate}.`);
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
          <Martini className="w-4 h-4" /> Bar & Snack Catalog ({barItems.length})
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'support'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" /> Help & Support Ticket
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
                  disabled={isReadOnly}
                  className={`px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 transition ${
                    isReadOnly
                      ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                  }`}
                  title={isReadOnly ? 'POS is in Read-Only mode' : ''}
                >
                  <Save className="w-4 h-4" /> Save Club Configuration
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Profile Account Logout */}
          <div className="space-y-4">
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
                    : clubProfile.tenantStatus === 'EXPIRED'
                    ? 'Your subscription or free trial has expired. Subscribe below to restore POS write access.'
                    : clubProfile.renewalDueDate
                    ? `Trial/Subscription active until ${clubProfile.renewalDueDate}. All POS modules & split billing unlocked.`
                    : `${subscriptionConfig.trialPeriodDays}-Day Free Trial active. All POS modules & split billing unlocked.`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded font-mono ${
                isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Next Renewal: {clubProfile.renewalDueDate || 'Oct 1, 2026'}
              </span>
            </div>
          </div>

          {renewNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              {renewNotice}
            </div>
          )}

          {/* DYNAMIC PLANS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {subscriptionConfig.plans.map((p) => {
              const isYearly = p.id === 'yearly';
              const isQuarterly = p.id === 'quarterly';
              const monthlyEquivalent = Math.round(p.amount / p.periodMonths);
              
              const containerClass = isDarkMode
                ? isQuarterly
                  ? 'bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/60 ring-1 ring-indigo-500/30'
                  : isYearly
                    ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/50 hover:border-purple-400/80 shadow-xl'
                    : 'bg-slate-900 border border-slate-700/80 hover:border-slate-600 shadow-xl'
                : isQuarterly
                  ? 'bg-indigo-50/40 border-2 border-indigo-600 shadow-md'
                  : isYearly
                    ? 'bg-purple-50/30 border border-purple-300 hover:border-purple-400 shadow-sm'
                    : 'bg-white border border-slate-300 hover:border-slate-400 shadow-sm';

              const badgeColor = isQuarterly
                ? 'bg-indigo-600 text-white'
                : isYearly
                  ? 'bg-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-700 text-white';

              const titleColor = isQuarterly
                ? isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                : isYearly
                  ? isDarkMode ? 'text-purple-400' : 'text-purple-700'
                  : isDarkMode ? 'text-slate-300' : 'text-slate-700';

              const buttonClass = isQuarterly
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/30 border-transparent'
                : isYearly
                  ? isDarkMode
                    ? 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 font-bold'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-extrabold'
                  : isDarkMode
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold';

              return (
                <div 
                  key={p.id} 
                  className={`p-6 rounded-2xl flex flex-col justify-between relative transition ${containerClass}`}
                >
                  {p.discountLabel && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md z-10 ${badgeColor}`}>
                      {p.discountLabel}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>
                        {p.name}
                      </span>
                    </div>

                    {/* Price Header with High-Contrast Typography */}
                    <div className="mb-1 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                        isDarkMode ? 'text-white' : 'text-slate-950'
                      }`}>
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs font-semibold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        / {p.periodMonths} {p.periodMonths === 1 ? 'month' : 'months'}
                      </span>
                    </div>

                    {/* Per-month breakdown */}
                    {p.periodMonths > 1 && (
                      <div className={`text-xs font-mono mb-3 font-bold ${
                        isQuarterly 
                          ? isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
                          : isYearly 
                            ? isDarkMode ? 'text-purple-300' : 'text-purple-700'
                            : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        (~₹{monthlyEquivalent}/mo)
                      </div>
                    )}

                    {/* Free Trial Badge */}
                    <div className={`mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      isDarkMode 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                        : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                    }`}>
                      <Gift className="w-3.5 h-3.5 shrink-0" /> Includes {subscriptionConfig.trialPeriodDays}-Day Free Trial
                    </div>

                    {/* Feature Checklist */}
                    <ul className={`space-y-2.5 text-xs border-t pt-4 mb-6 ${
                      isDarkMode 
                        ? isQuarterly ? 'text-slate-200 border-indigo-500/30' : isYearly ? 'text-slate-200 border-purple-500/20' : 'text-slate-200 border-slate-800' 
                        : 'text-slate-800 font-medium border-slate-200'
                    }`}>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> 
                        <span>{subscriptionConfig.trialPeriodDays} Days Free Trial (₹0 today)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> 
                        <span>Billed every {p.periodMonths} {p.periodMonths === 1 ? 'Month' : 'Months'} (₹{p.amount.toLocaleString('en-IN')})</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> 
                        <span>Full Automated Split Billing & Ledger</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} /> 
                        <span>Premium WhatsApp & Call Support</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenRazorpayCheckout(p.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer ${buttonClass}`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" /> 
                    <span>Pay ₹{p.amount.toLocaleString('en-IN')} via Razorpay</span>
                  </button>
                </div>
              );
            })}
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
              onClick={() => !isReadOnly && setIsAddingAsset(true)}
              disabled={isReadOnly}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition ${
                isReadOnly
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
              title={isReadOnly ? 'POS is in Read-Only mode' : ''}
            >
              <Plus className="w-4 h-4" /> Add Game Asset
            </button>
          </div>

          {/* New Asset Form */}
          {isAddingAsset && (
            <form onSubmit={handleCreateAsset} className={`p-5 border rounded-2xl space-y-4 text-xs ${
              isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Gamepad2 className="w-4 h-4 text-indigo-400" /> Add New Table or Gaming Console
                </h3>
                <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configures hourly rates and billing rules for active play sessions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Field 1: Asset Name */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Table / Asset Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 - Snooker"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                    required
                  />
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Display label on Arena dashboard</p>
                </div>

                {/* Field 2: Game Category */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Game Category
                  </label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
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
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Filter tag in session view</p>
                </div>

                {/* Field 3: Hourly Rate */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Hourly Rental Rate <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                    <input
                      type="number"
                      placeholder="300"
                      value={newAssetRate || ''}
                      onChange={(e) => setNewAssetRate(Number(e.target.value))}
                      className={`w-full rounded-xl pl-7 pr-10 py-2 font-mono font-bold border ${inputBg}`}
                      required
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ hour</span>
                  </div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Price per 60 minutes played</p>
                </div>

                {/* Field 4: Billing Increment */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Time Billing Method
                  </label>
                  <select
                    value={newAssetIncrement}
                    onChange={(e) => setNewAssetIncrement(e.target.value as BillingIncrement)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                  >
                    <option value="exact">Exact Minutes Billing (Per Sec/Min)</option>
                    <option value="15min">15-Minute Block Rounding</option>
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {newAssetIncrement === 'exact' ? 'Calculates exact elapsed minutes' : 'Rounds duration up to nearest 15m'}
                  </p>
                </div>

                {/* Field 5: Billing Basis */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Billing Basis
                  </label>
                  <select
                    value={newAssetBillingBasis}
                    onChange={(e) => setNewAssetBillingBasis(e.target.value as BillingBasis)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                  >
                    <option value="PER_TABLE">Per Table (Flat hourly rate)</option>
                    <option value="PER_PERSON">Per Person (Rate × Players)</option>
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {newAssetBillingBasis === 'PER_PERSON' ? 'Multiplies rate by number of players' : 'Flat rate for table regardless of players'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsAddingAsset(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Table / Console Asset
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
                  <th className="p-4">Billing Basis</th>
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
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                        asset.billingBasis === 'PER_PERSON'
                          ? isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          : isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {asset.billingBasis === 'PER_PERSON' ? 'Per Person' : 'Per Table'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => !isReadOnly && onDeleteGameAsset(asset.id)}
                        disabled={isReadOnly}
                        className={`p-1.5 rounded-lg transition ${
                          isReadOnly
                            ? 'opacity-30 cursor-not-allowed text-slate-600'
                            : 'text-slate-400 hover:text-red-500 hover:bg-slate-800/50'
                        }`}
                        title={isReadOnly ? 'POS is in Read-Only mode' : 'Delete Asset'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreAssets && onLoadMoreAssets && (
            <div className="mt-4 text-center">
              <button
                onClick={onLoadMoreAssets}
                disabled={isLoadingMoreAssets}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm border ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                {isLoadingMoreAssets ? 'Loading Assets...' : 'Load More Assets'}
              </button>
            </div>
          )}
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
              onClick={() => !isReadOnly && setIsAddingBarItem(true)}
              disabled={isReadOnly}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition ${
                isReadOnly
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850 shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
              title={isReadOnly ? 'POS is in Read-Only mode' : ''}
            >
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>
          </div>

          {/* New Bar Item Form */}
          {isAddingBarItem && (
            <form onSubmit={handleCreateBarItem} className={`p-5 border rounded-2xl space-y-4 text-xs ${
              isDarkMode ? 'bg-slate-950 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Martini className="w-4 h-4 text-orange-400" /> Add New Cafe / Bar Menu Item
                </h3>
                <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Adds menu item for quick bar sale orders and session add-on tabs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Field 1: Item Name */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cold Coffee / French Fries"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                    required
                  />
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Printed on customer bill receipts</p>
                </div>

                {/* Field 2: Category */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Menu Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className={`w-full rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Lounge / Hookah">Lounge / Hookah</option>
                    <option value="Combos">Combos</option>
                  </select>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Group on Bar POS quick register</p>
                </div>

                {/* Field 3: Selling Price */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Selling Price (Tax-Inclusive) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                    <input
                      type="number"
                      placeholder="150"
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className={`w-full rounded-xl pl-7 pr-3 py-2 font-mono font-bold border ${inputBg}`}
                      required
                    />
                  </div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Final bill price per portion</p>
                </div>

                {/* Field 4: Stock Quantity */}
                <div className="space-y-1.5">
                  <label className={`block font-semibold text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Current Stock Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="50"
                      value={newItemStock || ''}
                      onChange={(e) => setNewItemStock(Number(e.target.value))}
                      className={`w-full rounded-xl pl-3 pr-12 py-2 font-mono font-bold border ${inputBg}`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Units</span>
                  </div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Inventory balance (auto-decrements)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsAddingBarItem(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Menu Item
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
                        onClick={() => !isReadOnly && onDeleteBarItem(item.id)}
                        disabled={isReadOnly}
                        className={`p-1.5 rounded-lg transition ${
                          isReadOnly
                            ? 'opacity-30 cursor-not-allowed text-slate-600'
                            : 'text-slate-400 hover:text-red-500 hover:bg-slate-800/50'
                        }`}
                        title={isReadOnly ? 'POS is in Read-Only mode' : 'Delete Item'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreBarItems && onLoadMoreBarItems && (
            <div className="mt-4 text-center">
              <button
                onClick={onLoadMoreBarItems}
                disabled={isLoadingMoreBarItems}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm border ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                {isLoadingMoreBarItems ? 'Loading Bar Items...' : 'Load More Bar Items'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HELP & SUPPORT */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-xl space-y-6 ${cardBg}`}>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>JustClub Customer Helpdesk</span>
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Having issues with live timers, split billing, or UPI settings? Raise a formal ticket below.
              </p>
            </div>

            {ticketSuccessMessage && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{ticketSuccessMessage}</span>
              </div>
            )}

            {ticketErrorMessage && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
                {ticketErrorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Ticket Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                  >
                    <option value="Billing / Renewal">Billing / Renewal</option>
                    <option value="Live Table Timers">Live Table Timers</option>
                    <option value="WhatsApp / UPI QR">WhatsApp / UPI QR</option>
                    <option value="Customer Ledger & CRM">Customer Ledger & CRM</option>
                    <option value="Other Hardware / PC / VR">Other Hardware / PC / VR</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Urgency Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e: any) => setTicketPriority(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                  >
                    <option value="LOW">Low (General Inquiry)</option>
                    <option value="MEDIUM">Medium (Minor Glitch)</option>
                    <option value="HIGH">High (Impacts Billing)</option>
                    <option value="URGENT">Urgent (Platform Down)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ticket Subject / Summary
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g., Table 4 timer keeps resetting when paused..."
                  className={`w-full p-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Describe Your Problem
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Include details about what happened, steps to reproduce, or transaction references if it is a payment issue..."
                  rows={4}
                  className={`w-full p-3 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTicket ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Live Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className={`rounded-2xl p-6 border shadow-xl ${cardBg}`}>
              <h3 className={`font-bold text-sm mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Instant Emergency Support
              </h3>
              <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                For urgent immediate assistance, please directly WhatsApp our central technical desk or scan our help desk ticket line.
              </p>
              <a
                href="https://wa.me/919999999999?text=Hello+JustClub+Support"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
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

      {/* Razorpay Payment Modal */}
      {isRazorpayModalOpen && (
        <RazorpayPaymentModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          clubProfile={clubProfile}
          selectedPlanCycle={rzpSelectedPlanCycle}
          onPaymentSuccess={handleRazorpayPaymentSuccess}
          subscriptionConfig={subscriptionConfig}
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
