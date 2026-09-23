import React, { useState, useMemo, useEffect } from 'react';
import { ClubProfile, GameAsset, BarItem, AssetCategory, BillingIncrement, BillingBasis, RazorpayPaymentOrder, SubscriptionConfig } from '../types';
import { getClubSlug } from '../utils/payToken';
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
  MessageSquare,
  AlertTriangle,
  XCircle,
  Edit3,
  Lock
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
  daysRemaining?: number | null;
  isViewOnly?: boolean;
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
  daysRemaining,
  isViewOnly,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'assets' | 'bar' | 'support'>('profile');
  const [renewNotice, setRenewNotice] = useState<string | null>(null);
  const [selectedPlanCycle, setSelectedPlanCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  // Support automated navigation from POS Onboarding Guide
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && ['profile', 'subscription', 'assets', 'bar', 'support'].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('justclub_switch_setup_tab', handler);
    return () => window.removeEventListener('justclub_switch_setup_tab', handler);
  }, []);

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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

  // Delete Confirmation States for Mobile / Desktop Safety
  const [assetToDelete, setAssetToDelete] = useState<GameAsset | null>(null);
  const [barItemToDelete, setBarItemToDelete] = useState<BarItem | null>(null);

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

  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugSuccess, setSlugSuccess] = useState<string | null>(null);
  const [isSavingSlug, setIsSavingSlug] = useState(false);

  const handleSaveSlug = async () => {
    setSlugError(null);
    setSlugSuccess(null);
    const slugToSave = (profileForm.paymentSlug || '').toLowerCase().trim();

    if (!slugToSave) {
      setSlugError('Please enter a payment slug before saving.');
      return;
    }

    setIsSavingSlug(true);
    try {
      const res = await api.club.setPaymentSlug(slugToSave);
      if (res && res.success) {
        const updated = { ...profileForm, paymentSlug: res.slug || slugToSave };
        setProfileForm(updated);
        onUpdateClubProfile(updated);
        setSlugSuccess(`Slug 'justclub.in/p/${res.slug || slugToSave}' saved successfully!`);
        setTimeout(() => setSlugSuccess(null), 4000);
      } else {
        setSlugError(res.error || 'Failed to set payment slug. It may be taken or invalid.');
      }
    } catch (err: any) {
      setSlugError(err.message || 'Error saving payment slug to server.');
    } finally {
      setIsSavingSlug(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProfile) return;

    const slugToSave = (profileForm.paymentSlug || '').toLowerCase().trim();
    const slugChanged = slugToSave !== (clubProfile.paymentSlug || '');

    if (slugChanged && slugToSave) {
      // Don't commit the profile (with the new slug) to local state until the slug is actually confirmed saved server-side.
      const profileWithoutNewSlug = { ...profileForm, paymentSlug: clubProfile.paymentSlug };
      onUpdateClubProfile(profileWithoutNewSlug);
      await handleSaveSlug(); // handleSaveSlug already correctly calls onUpdateClubProfile itself, only on confirmed success
    } else {
      onUpdateClubProfile(profileForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsEditingProfile(false);
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

  const disabledInputBg = isDarkMode
    ? 'bg-slate-950/80 border-slate-800/80 text-slate-300 opacity-80 cursor-not-allowed'
    : 'bg-slate-100 border-slate-250 text-slate-800 opacity-90 cursor-not-allowed';

  const labelColor = isDarkMode ? 'text-slate-400' : 'text-slate-700';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

      {/* Tabs Row */}
      <div id="setup-tabs-nav" className={`flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          id="setup-tab-profile"
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
          id="setup-tab-subscription"
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
          id="setup-tab-assets"
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
          id="setup-tab-bar"
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
          id="setup-tab-support"
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
        <div id="setup-panel-profile" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-xl space-y-4 ${cardBg}`}>
            <h2 className={`text-base font-bold pb-3 border-b flex items-center justify-between gap-2 ${
              isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span>Club & Owner Configuration</span>
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Saved Successfully!
                  </span>
                )}
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingProfile) {
                      setProfileForm(clubProfile);
                      setSlugError(null);
                      setSlugSuccess(null);
                      setIsEditingProfile(false);
                    } else {
                      setIsEditingProfile(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                    isEditingProfile
                      ? isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : isDarkMode
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-900/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm'
                  }`}
                >
                  {isEditingProfile ? (
                    <>
                      <XCircle className={`w-3.5 h-3.5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              )}
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Business Name</label>
                  <input
                    type="text"
                    value={profileForm.businessName}
                    disabled={!isEditingProfile || isReadOnly}
                    onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Owner Name</label>
                  <input
                    type="text"
                    value={profileForm.ownerName}
                    disabled={!isEditingProfile || isReadOnly}
                    onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>WhatsApp Business Number</label>
                  <input
                    type="text"
                    value={profileForm.whatsapp}
                    disabled={!isEditingProfile || isReadOnly}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${
                      !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelColor} font-semibold block mb-1`}>Pincode</label>
                  <input
                    type="text"
                    value={profileForm.pincode}
                    disabled={!isEditingProfile || isReadOnly}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${
                      !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                    }`}
                    required
                  />
                </div>
              </div>

              <div className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Club UPI VPA (Payee Address)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. apexcueclub@okaxis"
                    value={profileForm.upiId}
                    disabled={!isEditingProfile || isReadOnly}
                    onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono font-bold border ${
                      !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                    }`}
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct settlements into your bank account with zero MDR fees.
                  </p>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Payment Link Short Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center flex-1">
                      <span className={`px-2.5 py-2 text-xs font-mono border border-r-0 rounded-l-xl select-none ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-slate-400' 
                          : !isEditingProfile 
                            ? 'bg-slate-200 border-slate-300 text-slate-600' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        justclub.in/p/
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. apexcue"
                        value={profileForm.paymentSlug || ''}
                        disabled={!isEditingProfile || isReadOnly}
                        onChange={(e) => {
                          setSlugError(null);
                          setSlugSuccess(null);
                          setProfileForm({ 
                            ...profileForm, 
                            paymentSlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') 
                          });
                        }}
                        className={`w-full rounded-r-xl px-3 py-2 text-xs font-mono font-bold border ${
                          !isEditingProfile || isReadOnly ? disabledInputBg : inputBg
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!isEditingProfile || isReadOnly || isSavingSlug}
                      onClick={handleSaveSlug}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        !isEditingProfile || isReadOnly
                          ? isDarkMode
                            ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSavingSlug ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Slug</span>
                    </button>
                  </div>

                  {slugError && (
                    <div className={`mt-2 p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 ${
                      isDarkMode
                        ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{slugError}</span>
                    </div>
                  )}

                  {slugSuccess && (
                    <div className={`mt-2 p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 ${
                      isDarkMode
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{slugSuccess}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Shareable custom short link for WhatsApp reminders:{' '}
                    {profileForm.paymentSlug && profileForm.paymentSlug.trim() ? (
                      <code className={`font-mono font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        https://justclub.in/p/{profileForm.paymentSlug.trim()}/2900
                      </code>
                    ) : (
                      <span className="text-slate-400 italic">
                        (Not set — automatically falls back to secure token links)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className={`pt-4 flex items-center justify-between border-t ${
                isDarkMode ? 'border-slate-800/60' : 'border-slate-100'
              }`}>
                {!isEditingProfile ? (
                  <div className={`text-[11px] flex items-center gap-1.5 italic ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Lock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>Click the <strong>Edit</strong> button at the top right corner to unlock configuration.</span>
                  </div>
                ) : (
                  <div className={`text-[11px] flex items-center gap-1.5 font-semibold ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editing active — click Save when finished.</span>
                  </div>
                )}

                {isEditingProfile && (
                  <button
                    type="submit"
                    disabled={isReadOnly}
                    className={`px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 transition ${
                      isReadOnly
                        ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-850'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer'
                    }`}
                    title={isReadOnly ? 'POS is in Read-Only mode' : ''}
                  >
                    <Save className="w-4 h-4" /> Save Club Configuration
                  </button>
                )}
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
        <div id="setup-panel-subscription" className="space-y-6">
          
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
                    : clubProfile.renewalDueDate && typeof daysRemaining === 'number'
                    ? `Active — ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining (renews ${clubProfile.renewalDueDate}). All POS modules & split billing unlocked.`
                    : clubProfile.renewalDueDate
                    ? `Active until ${clubProfile.renewalDueDate}. All POS modules & split billing unlocked.`
                    : 'Active — no expiry date set on this account. All POS modules & split billing unlocked.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {clubProfile.renewalDueDate ? (
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded font-mono ${
                  isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Next Renewal: {clubProfile.renewalDueDate}
                </span>
              ) : (
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded font-mono ${
                  isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  No Expiry Date
                </span>
              )}
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
        <div id="setup-panel-assets" className="space-y-4">
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

          {/* Game Assets Container: Responsive Dual Layout (Cards on Mobile, Table on Desktop) */}
          {/* 1. MOBILE CARD VIEW (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {gameAssets.map(asset => (
              <div
                key={asset.id}
                className={`p-4 rounded-2xl border shadow-sm space-y-3 transition ${cardBg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {asset.name}
                      </h3>
                      <span className={`inline-block text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {asset.category}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ₹{asset.hourlyRate}/hr
                  </span>
                </div>

                {/* Badges: Increment & Basis */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    isDarkMode ? 'bg-slate-800 text-indigo-300 border-slate-700' : 'bg-slate-100 text-indigo-700 border-slate-200'
                  }`}>
                    ⏱️ {asset.billingIncrement === 'exact' ? 'Exact Minutes' : '15m Rounding'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    asset.billingBasis === 'PER_PERSON'
                      ? isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    👥 {asset.billingBasis === 'PER_PERSON' ? 'Per Person' : 'Per Table'}
                  </span>
                </div>

                {/* Mobile Action Buttons (Full-Width Touch Target) */}
                <div className="pt-2 border-t border-slate-800/60 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && setAssetToDelete(asset)}
                    disabled={isReadOnly}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      isReadOnly
                        ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600'
                        : 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Table / Asset</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 2. DESKTOP / TABLET TABLE VIEW (≥ 640px) */}
          <div className={`hidden sm:block rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <th className="p-4 whitespace-nowrap">Asset Name</th>
                    <th className="p-4 whitespace-nowrap">Category</th>
                    <th className="p-4 whitespace-nowrap">Hourly Rate</th>
                    <th className="p-4 whitespace-nowrap">Billing Increment</th>
                    <th className="p-4 whitespace-nowrap">Billing Basis</th>
                    <th className="p-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {gameAssets.map(asset => (
                    <tr key={asset.id} className={`transition ${
                      isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}>
                      <td className={`p-4 font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{asset.name}</td>
                      <td className={`p-4 whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{asset.category}</td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">₹{asset.hourlyRate}/hr</td>
                      <td className={`p-4 font-mono whitespace-nowrap ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{asset.billingIncrement}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                          asset.billingBasis === 'PER_PERSON'
                            ? isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            : isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {asset.billingBasis === 'PER_PERSON' ? 'Per Person' : 'Per Table'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => !isReadOnly && setAssetToDelete(asset)}
                          disabled={isReadOnly}
                          className={`p-2 rounded-lg transition ${
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
        <div id="setup-panel-bar" className="space-y-4">
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

          {/* Replenishment Alert Banner if any items are at or below 5 units */}
          {barItems.some(i => i.stock !== null && i.stock <= 5) && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isDarkMode ? 'bg-amber-950/25 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Replenishment Notice:</strong>{' '}
                  {barItems.filter(i => i.stock !== null && i.stock <= 5).length} item(s) need restocking (5 or fewer units remaining).
                </span>
              </div>
            </div>
          )}

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

          {/* Bar Items Container: Responsive Dual Layout (Cards on Mobile, Table on Desktop) */}
          {/* 1. MOBILE CARD VIEW (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {barItems.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border shadow-sm space-y-3 transition ${cardBg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <Martini className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </h3>
                      <span className={`inline-block text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ₹{item.price}
                  </span>
                </div>

                {/* Stock Level Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-[11px] text-slate-400">Inventory:</span>
                  {item.stock === null ? (
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] ${
                      isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      Unlimited Stock
                    </span>
                  ) : item.stock <= 0 ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                      isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      0 Units • Out of Stock
                    </span>
                  ) : item.stock <= 5 ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                      isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {item.stock} {item.stock === 1 ? 'Unit' : 'Units'} • Low Stock
                    </span>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${
                      isDarkMode ? 'bg-slate-800 text-emerald-300 border-slate-700' : 'bg-slate-100 text-emerald-700 border-slate-200'
                    }`}>
                      {item.stock} Units Available
                    </span>
                  )}
                </div>

                {/* Mobile Action Buttons (Full-Width Touch Target) */}
                <div className="pt-2 border-t border-slate-800/60 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && setBarItemToDelete(item)}
                    disabled={isReadOnly}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      isReadOnly
                        ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-600'
                        : 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Menu Item</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 2. DESKTOP / TABLET TABLE VIEW (≥ 640px) */}
          <div className={`hidden sm:block rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <th className="p-4 whitespace-nowrap">Item Name</th>
                    <th className="p-4 whitespace-nowrap">Category</th>
                    <th className="p-4 whitespace-nowrap">Selling Price (Tax-Inclusive)</th>
                    <th className="p-4 whitespace-nowrap">Stock Level</th>
                    <th className="p-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                  {barItems.map(item => (
                    <tr key={item.id} className={`transition ${
                      isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}>
                      <td className={`p-4 font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                      <td className={`p-4 whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.category}</td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">₹{item.price}</td>
                      <td className="p-4 font-mono whitespace-nowrap">
                        {item.stock === null ? (
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Unlimited</span>
                        ) : item.stock <= 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isDarkMode
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            0 Units • Out of Stock
                          </span>
                        ) : item.stock <= 5 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isDarkMode
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {item.stock} {item.stock === 1 ? 'Unit' : 'Units'} • Low Stock
                          </span>
                        ) : (
                          <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {item.stock} Units
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => !isReadOnly && setBarItemToDelete(item)}
                          disabled={isReadOnly}
                          className={`p-2 rounded-lg transition ${
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
        <div id="setup-panel-support" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Delete Game Asset Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${cardBg}`}>
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Delete Game Asset?
                </h3>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Are you sure you want to delete <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{assetToDelete.name}</strong>? This will remove the table card from live arena sessions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (assetToDelete) {
                    onDeleteGameAsset(assetToDelete.id);
                    setAssetToDelete(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Bar Item Confirmation Modal */}
      {barItemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${cardBg}`}>
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Delete Menu Item?
                </h3>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Are you sure you want to delete <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{barItemToDelete.name}</strong>? This will remove it from the snack catalog and quick-add session menus.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setBarItemToDelete(null)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (barItemToDelete) {
                    onDeleteBarItem(barItemToDelete.id);
                    setBarItemToDelete(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
