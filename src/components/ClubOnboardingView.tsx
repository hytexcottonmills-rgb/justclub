import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  QrCode, 
  Clock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Coffee,
  Tv,
  MapPin
} from 'lucide-react';
import { ClubProfile, GameAsset, BarItem, AuthUser, BillingBasis } from '../types';
import { JustClubLogo, JustClubIcon } from './JustClubLogo';

interface ClubOnboardingViewProps {
  onCompleteOnboarding: (
    profile: ClubProfile, 
    assets: GameAsset[], 
    barItems: BarItem[]
  ) => void;
  onCancel: () => void;
  authUser: AuthUser | null;
  onOpenLogin: () => void;
  isDarkMode?: boolean;
}

export const ClubOnboardingView: React.FC<ClubOnboardingViewProps> = ({
  onCompleteOnboarding,
  onCancel,
  authUser,
  onOpenLogin,
  isDarkMode = true,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 State: Club Identity
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(authUser?.name || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const isStep1Valid = businessName.trim().length > 0 
    && ownerName.trim().length > 0 
    && whatsapp.replace(/[^0-9]/g, '').length === 10 
    && upiId.trim().length > 3;

  // Step 2 State: Table Assets
  const [assets, setAssets] = useState<Omit<GameAsset, 'id'>[]>([]);

  // Step 3 State: Bar Snack Menu
  const barPresetCatalog: BarItem[] = [
    { id: 'b1', name: 'Red Bull Energy Can (250ml)', category: 'Beverages', price: 120, stock: 48 },
    { id: 'b2', name: 'Iced Cold Coffee', category: 'Beverages', price: 90, stock: 30 },
    { id: 'b3', name: 'Lays Magic Masala (Large)', category: 'Snacks', price: 30, stock: 60 },
    { id: 'b4', name: 'Mineral Water Bottle (1L)', category: 'Beverages', price: 20, stock: 100 },
    { id: 'b5', name: 'Premium Herbal Hookah Session', category: 'Lounge / Hookah', price: 450, stock: 15 },
  ];
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());
  const selectedBarPresets = barPresetCatalog.filter(item => selectedPresetIds.has(item.id));

  const toggleBarPreset = (id: string) => {
    setSelectedPresetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<'Billiards' | 'PS5' | 'VR' | 'Table Tennis'>('Billiards');
  const [newAssetRate, setNewAssetRate] = useState(180);
  const [newAssetBillingBasis, setNewAssetBillingBasis] = useState<BillingBasis>('PER_TABLE');

  const handleAddCustomAsset = () => {
    if (!newAssetName.trim()) return;
    setAssets(prev => [
      ...prev,
      {
        name: newAssetName.trim(),
        category: newAssetCategory,
        hourlyRate: newAssetRate,
        billingIncrement: 'exact',
        billingBasis: newAssetBillingBasis,
        status: 'available',
      },
    ]);
    setNewAssetName('');
    setNewAssetBillingBasis('PER_TABLE');
  };

  const handleRemoveAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    const finalProfile: ClubProfile = {
      id: `club_${Date.now()}`,
      businessName: businessName.trim(),
      ownerName: ownerName.trim() || authUser?.name || '',
      whatsapp: whatsapp.replace(/[^0-9]/g, ''),
      pincode: pincode.trim(),
      upiId: upiId.trim(),
      tenantStatus: 'ACTIVE',
      monthlyPlanFee: 499,
      renewalDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalRevenueThisMonth: 0,
    };

    const finalAssets: GameAsset[] = assets.map((a, idx) => ({
      ...a,
      id: `ast_onb_${Date.now()}_${idx}`,
    }));

    onCompleteOnboarding(finalProfile, finalAssets, selectedBarPresets);
    if (!authUser) {
      onOpenLogin();
    }
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-6 lg:p-12 pt-safe pb-safe flex flex-col items-center justify-center transition-colors duration-200 ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Top Header Step Indicator */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <JustClubIcon size="md" />
            <div>
              <h1 className={`text-xl font-extrabold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Club Onboarding Wizard</h1>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Step {step} of 5 — Setup your Snooker & Gaming POS</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800/40' 
                : 'text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-200/50'
            }`}
          >
            Exit Setup
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border transition-colors ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-200 border-slate-300/50'
        }`}>
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Container Card */}
      <div className={`w-full max-w-3xl p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>

        {/* --- STEP 1: CLUB IDENTITY --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h2 className={`text-lg font-extrabold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Club Details & Identity</h2>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Basic contact and payment receiving information for your venue.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Business / Club Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Imperial Snooker Club"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {!businessName.trim() && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">Business name is required</p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Owner / Manager Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {!ownerName.trim() && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">Owner name is required</p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>WhatsApp Contact Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {whatsapp.replace(/[^0-9]/g, '').length !== 10 && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">
                    {whatsapp.trim() ? 'WhatsApp number must be exactly 10 digits' : 'WhatsApp number is required (10 digits)'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>UPI ID for Direct Player Payments *</label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourclub@upi"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {upiId.trim().length <= 3 && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">
                    {upiId.trim() ? 'UPI ID must be at least 4 characters' : 'UPI ID is required (e.g. club@upi)'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>City / Region</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400001"
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: TABLES & ASSETS SETUP --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h2 className={`text-lg font-extrabold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Configure Game Tables & Consoles</h2>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Set hourly pricing for Snooker tables, Pool tables, and Gaming Consoles.</p>
            </div>

            {/* Existing Asset List */}
            <div className="space-y-2.5">
              {assets.length === 0 ? (
                <div className={`p-6 rounded-xl border border-dashed text-center ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}>
                  <p className="text-xs font-bold">No tables or consoles added yet.</p>
                  <p className="text-[11px] mt-0.5 opacity-80">Use the form below to add your venue's gaming tables or consoles.</p>
                </div>
              ) : (
                assets.map((asset, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{asset.name}</div>
                        <div className={`text-[10px] flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{asset.category} • ₹{asset.hourlyRate}/hour</span>
                          {asset.billingBasis === 'PER_PERSON' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Per Person
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAsset(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Asset Box */}
            <div className={`p-4 rounded-2xl border border-dashed space-y-3 transition ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/60 border-slate-300'
            }`}>
              <div className="text-xs font-bold text-indigo-500 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Another Table or Console
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Snooker Table #1"
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />

                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Billiards">Billiards / Snooker</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="PS5">PlayStation / Xbox Consoles</option>
                  <option value="PC Gaming">PC Gaming Rigs</option>
                  <option value="VR">VR Pod / Station</option>
                  <option value="Foosball">Foosball Table</option>
                  <option value="Air Hockey">Air Hockey Table</option>
                  <option value="Darts">Darts Lane</option>
                  <option value="Karaoke">Karaoke Room</option>
                  <option value="Board Games">Board Game Lounge</option>
                </select>

                <select
                  value={newAssetBillingBasis}
                  onChange={(e) => setNewAssetBillingBasis(e.target.value as BillingBasis)}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="PER_TABLE">Per Table (Flat rate)</option>
                  <option value="PER_PERSON">Per Person (Rate × Players)</option>
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newAssetRate}
                    onChange={(e) => setNewAssetRate(Number(e.target.value))}
                    placeholder="Hourly ₹"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={handleAddCustomAsset}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {newAssetBillingBasis === 'PER_PERSON' 
                  ? 'Multiplies rate by number of players' 
                  : 'Flat rate for table regardless of players'}
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 3: BAR & SNACK MENU --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <h2 className={`text-lg font-extrabold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Select Starter Bar & Snack Items</h2>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tap to select which starter items to pre-load into your snack menu — you can also add your own later.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {barPresetCatalog.map((item) => {
                const isChecked = selectedPresetIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleBarPreset(item.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                      isChecked
                        ? isDarkMode ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-indigo-50 border-indigo-400'
                        : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600'
                          : isDarkMode ? 'border-slate-600' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.category}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-mono font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ₹{item.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP 4: GOOGLE ONE-TAP AUTH SYNC --- */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h2 className={`text-xl font-extrabold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sync Primary Admin Account</h2>
              <p className={`text-xs max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Connect your Google Account for Google One Tap SSO authentication across your club terminals.
              </p>
            </div>

            {authUser ? (
              <div className={`p-4 rounded-2xl border max-w-sm mx-auto flex items-center gap-3 transition ${
                isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                {authUser.picture ? (
                  <img src={authUser.picture} alt={authUser.name} className="w-10 h-10 rounded-full ring-2 ring-emerald-500" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {authUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left min-w-0">
                  <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{authUser.name}</div>
                  <div className={`text-[11px] truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{authUser.email}</div>
                  <span className={`text-[9px] font-bold uppercase ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Google One-Tap Linked</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2 ${
                    isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
                <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sign in with Google to launch your club dashboard</div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 5: REVIEW & LAUNCH --- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className={`text-xl font-extrabold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Your Club POS is Ready!</h2>
              <p className={`text-xs max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Review your configuration below and click Launch to start managing live table timers and split billing.
              </p>
            </div>

            {!authUser && (
              <div className={`p-4 rounded-2xl border text-center ${
                isDarkMode ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}>
                <p className="text-xs font-bold">Sign in with Google to launch your club dashboard</p>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Authentication is required to secure your club's transactions and live POS.
                </p>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2"
                >
                  <span>Authenticate with Google</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className={`p-4 rounded-2xl border space-y-3 text-xs transition-colors ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Club Name:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{businessName}</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Owner & Admin:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ownerName} ({whatsapp})</span>
              </div>
              <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>UPI Receiving ID:</span>
                <span className={`font-mono font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{upiId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Total Configured Assets:</span>
                <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{assets.length} Gaming Tables/Consoles</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons (Back / Next / Finish) */}
        <div className={`mt-8 pt-4 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${
                isDarkMode 
                  ? 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/40' 
                  : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              disabled={step === 1 && !isStep1Valid}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-xl transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Launch Club POS Terminal</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
