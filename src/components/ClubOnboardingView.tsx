import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  QrCode, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Coffee,
  Tv,
  MapPin,
  Gamepad2,
  Zap,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClubProfile, GameAsset, BarItem, AuthUser, BillingBasis, AssetCategory } from '../types';
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

interface PresetBundle {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  items: Omit<GameAsset, 'id'>[];
}

const PRESET_BUNDLES: PresetBundle[] = [
  {
    id: 'snooker_pool',
    name: 'Snooker & Pool Club',
    badge: 'Most Popular',
    icon: '🎱',
    description: '2 Tournament Snooker tables + 2 9ft Pool tables with exact-minute clock billing.',
    items: [
      { name: 'Table 1 - Rasson 9ft Tournament Pool', category: 'Billiards', hourlyRate: 240, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Table 2 - 9ft American Pool', category: 'Billiards', hourlyRate: 240, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Table 3 - Star 12ft Snooker Championship', category: 'Billiards', hourlyRate: 320, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Table 4 - Star 12ft Snooker Pro', category: 'Billiards', hourlyRate: 320, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
    ],
  },
  {
    id: 'console_lounge',
    name: 'PlayStation & Console Lounge',
    badge: 'Gamers Choice',
    icon: '🎮',
    description: '3 PS5 4K OLED stations + 1 PS5 4-Player party booth with per-controller support.',
    items: [
      { name: 'PS5 Station 1 - 4K OLED (FC 25)', category: 'PS5', hourlyRate: 180, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'PS5 Station 2 - 4K OLED (Tekken 8)', category: 'PS5', hourlyRate: 180, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'PS5 Station 3 - Racing Rig (Gran Turismo)', category: 'PS5', hourlyRate: 220, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'PS5 VIP Booth - 4-Player Party', category: 'PS5', hourlyRate: 280, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
    ],
  },
  {
    id: 'hybrid_lounge',
    name: 'Hybrid Multi-Game Arena',
    badge: 'All-in-One',
    icon: '⚡',
    description: 'Snooker + PS5 + Table Tennis + Foosball for diverse high-occupancy club traffic.',
    items: [
      { name: 'Table 1 - Star Snooker 12ft', category: 'Billiards', hourlyRate: 300, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Table 2 - 9ft Tournament Pool', category: 'Billiards', hourlyRate: 220, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Console Booth 1 - PS5 4K OLED', category: 'PS5', hourlyRate: 180, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Table Tennis Arena 1 (Stiga)', category: 'Table Tennis', hourlyRate: 160, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Tornado Foosball Match Table', category: 'Foosball', hourlyRate: 140, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
    ],
  },
  {
    id: 'pc_esports',
    name: 'PC Esports Battle Arena',
    badge: 'Esports Tier',
    icon: '🖥️',
    description: 'High-refresh RTX 4080 battle rigs with per-hour PC seat billing.',
    items: [
      { name: 'Battle Station 01 (RTX 4080 / 240Hz)', category: 'PC Gaming', hourlyRate: 120, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Battle Station 02 (RTX 4080 / 240Hz)', category: 'PC Gaming', hourlyRate: 120, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Battle Station 03 (RTX 4080 / 240Hz)', category: 'PC Gaming', hourlyRate: 120, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
      { name: 'Battle Station 04 (RTX 4080 / 240Hz)', category: 'PC Gaming', hourlyRate: 120, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
    ],
  },
];

// Fast Postal PIN Code prefix lookup table for instant 0ms auto-detection across India
const PINCODE_PREFIX_MAP: Record<string, string> = {
  '110': 'New Delhi, Delhi',
  '121': 'Faridabad, Haryana',
  '122': 'Gurugram, Haryana',
  '141': 'Ludhiana, Punjab',
  '160': 'Chandigarh',
  '201': 'Noida, Uttar Pradesh',
  '226': 'Lucknow, Uttar Pradesh',
  '208': 'Kanpur, Uttar Pradesh',
  '302': 'Jaipur, Rajasthan',
  '342': 'Jodhpur, Rajasthan',
  '380': 'Ahmedabad, Gujarat',
  '395': 'Surat, Gujarat',
  '390': 'Vadodara, Gujarat',
  '400': 'Mumbai, Maharashtra',
  '411': 'Pune, Maharashtra',
  '440': 'Nagpur, Maharashtra',
  '452': 'Indore, Madhya Pradesh',
  '462': 'Bhopal, Madhya Pradesh',
  '500': 'Hyderabad, Telangana',
  '530': 'Visakhapatnam, Andhra Pradesh',
  '520': 'Vijayawada, Andhra Pradesh',
  '560': 'Bengaluru, Karnataka',
  '570': 'Mysuru, Karnataka',
  '575': 'Mangaluru, Karnataka',
  '580': 'Hubballi-Dharwad, Karnataka',
  '600': 'Chennai, Tamil Nadu',
  '641': 'Coimbatore, Tamil Nadu',
  '625': 'Madurai, Tamil Nadu',
  '620': 'Tiruchirappalli, Tamil Nadu',
  '636': 'Salem, Tamil Nadu',
  '682': 'Kochi, Kerala',
  '695': 'Thiruvananthapuram, Kerala',
  '673': 'Kozhikode, Kerala',
  '700': 'Kolkata, West Bengal',
  '751': 'Bhubaneswar, Odisha',
  '781': 'Guwahati, Assam',
  '800': 'Patna, Bihar',
  '834': 'Ranchi, Jharkhand',
};

const resolveCityFromPincode = (pin: string): string => {
  const clean = pin.replace(/[^0-9]/g, '');
  if (clean.length >= 3) {
    const prefix3 = clean.substring(0, 3);
    if (PINCODE_PREFIX_MAP[prefix3]) {
      return PINCODE_PREFIX_MAP[prefix3];
    }
  }
  if (clean.length >= 2) {
    const prefix2 = clean.substring(0, 2);
    if (prefix2 === '11') return 'New Delhi, Delhi';
    if (prefix2 === '40') return 'Mumbai Region, Maharashtra';
    if (prefix2 === '56') return 'Bengaluru Region, Karnataka';
    if (prefix2 === '60') return 'Chennai Region, Tamil Nadu';
    if (prefix2 === '70') return 'Kolkata Region, West Bengal';
  }
  return '';
};

export const ClubOnboardingView: React.FC<ClubOnboardingViewProps> = ({
  onCompleteOnboarding,
  onCancel,
  authUser,
  onOpenLogin,
  isDarkMode = true,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 State: Club Identity
  const [businessName, setBusinessName] = useState('Apex Cue & Gaming Lounge');
  const [ownerName, setOwnerName] = useState(authUser?.name || 'Rahul Sharma');
  const [whatsapp, setWhatsapp] = useState('9876543210');
  const [upiId, setUpiId] = useState('apexclub@upi');
  const [pincode, setPincode] = useState('560001');
  const [city, setCity] = useState('Bengaluru, Karnataka');
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [isCustomCityOpen, setIsCustomCityOpen] = useState(false);

  // Auto-resolve city whenever 6-digit pincode is typed
  const handlePincodeChange = (rawPin: string) => {
    const cleanPin = rawPin.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(cleanPin);

    if (cleanPin.length === 6) {
      // 1. Instant 0ms offline prefix detection
      const instantCity = resolveCityFromPincode(cleanPin);
      if (instantCity) {
        setCity(instantCity);
      }

      // 2. Fetch official India Post API for exact locality name
      setIsResolvingPin(true);
      fetch(`https://api.postalpincode.in/pincode/${cleanPin}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const detected = `${po.District || po.Name}, ${po.State}`;
            setCity(detected);
          }
        })
        .catch(() => {
          // If offline or network blocked, fallback to instantCity
        })
        .finally(() => {
          setIsResolvingPin(false);
        });
    }
  };

  const isStep1Valid = businessName.trim().length > 0 
    && ownerName.trim().length > 0 
    && whatsapp.replace(/[^0-9]/g, '').length === 10 
    && upiId.trim().length > 3
    && pincode.replace(/[^0-9]/g, '').length === 6;

  // Step 2 State: Table Assets (Default to Hybrid Bundle so POS is never empty!)
  const [assets, setAssets] = useState<Omit<GameAsset, 'id'>[]>(PRESET_BUNDLES[0].items);
  const [activeBundleId, setActiveBundleId] = useState<string>('snooker_pool');

  const applyPresetBundle = (bundle: PresetBundle) => {
    setActiveBundleId(bundle.id);
    setAssets([...bundle.items]);
  };

  // Step 3 State: Bar Snack Menu
  const barPresetCatalog: BarItem[] = [
    { id: 'b1', name: 'Red Bull Energy Can (250ml)', category: 'Beverages', price: 125, stock: 48 },
    { id: 'b2', name: 'Iced Cold Brew Coffee', category: 'Beverages', price: 90, stock: 30 },
    { id: 'b3', name: 'Coca-Cola Can (330ml)', category: 'Beverages', price: 40, stock: 50 },
    { id: 'b4', name: 'Mineral Water Bottle (1L)', category: 'Beverages', price: 20, stock: 100 },
    { id: 'b5', name: 'Lays Magic Masala (Large)', category: 'Snacks', price: 30, stock: 60 },
    { id: 'b6', name: 'Peri Peri Crispy Fries', category: 'Snacks', price: 120, stock: 40 },
    { id: 'b7', name: 'Loaded Cheese Nachos', category: 'Snacks', price: 160, stock: 35 },
    { id: 'b8', name: 'Gamer Fuel Combo (Red Bull + Fries)', category: 'Combos', price: 220, stock: 25 },
    { id: 'b9', name: 'Premium Herbal Hookah Session', category: 'Lounge / Hookah', price: 450, stock: 15 },
  ];

  // Default pre-select top 6 items
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(
    new Set(['b1', 'b2', 'b3', 'b4', 'b5', 'b6'])
  );

  const selectedBarPresets = barPresetCatalog.filter(item => selectedPresetIds.has(item.id));

  const toggleBarPreset = (id: string) => {
    setSelectedPresetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllBarPresets = () => {
    if (selectedPresetIds.size === barPresetCatalog.length) {
      setSelectedPresetIds(new Set(['b1', 'b4']));
    } else {
      setSelectedPresetIds(new Set(barPresetCatalog.map(i => i.id)));
    }
  };

  // Custom Asset State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('Billiards');
  const [newAssetRate, setNewAssetRate] = useState(200);
  const [newAssetBillingBasis, setNewAssetBillingBasis] = useState<BillingBasis>('PER_TABLE');

  const handleAddCustomAsset = () => {
    if (!newAssetName.trim()) return;
    setAssets(prev => [
      ...prev,
      {
        name: newAssetName.trim(),
        category: newAssetCategory,
        hourlyRate: Number(newAssetRate) || 150,
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
      businessName: businessName.trim() || 'Apex Cue & Gaming Lounge',
      ownerName: ownerName.trim() || authUser?.name || 'Club Owner',
      whatsapp: whatsapp.replace(/[^0-9]/g, '') || '9876543210',
      pincode: pincode.trim() || '560001',
      upiId: upiId.trim() || 'apexclub@upi',
      tenantStatus: 'ACTIVE',
      monthlyPlanFee: 499,
      renewalDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalRevenueThisMonth: 0,
    };

    const finalAssets: GameAsset[] = (assets.length > 0 ? assets : PRESET_BUNDLES[0].items).map((a, idx) => ({
      ...a,
      id: `ast_onb_${Date.now()}_${idx}`,
    }));

    const finalBarItems: BarItem[] = selectedBarPresets.length > 0 ? selectedBarPresets : barPresetCatalog.slice(0, 4);

    localStorage.setItem('justclub_onboarding_completed', 'true');
    onCompleteOnboarding(finalProfile, finalAssets, finalBarItems);
  };

  return (
    <div className={`min-h-screen font-sans p-3 sm:p-6 lg:p-12 pt-safe pb-safe flex flex-col items-center justify-center transition-colors duration-200 ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Top Header Step Indicator */}
      <div className="w-full max-w-3xl mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <JustClubIcon size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Club Setup Wizard
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready in 60s
                </span>
              </div>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Step {step} of 5 — {
                  step === 1 ? 'Club Identity & UPI Receiver' :
                  step === 2 ? 'Gaming Tables & Station Presets' :
                  step === 3 ? 'Bar & Snacks Menu Setup' :
                  step === 4 ? 'Admin SSO Account Linking' :
                  'Grand Opening Review'
                }
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800/60' 
                : 'text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-200/50'
            }`}
          >
            Back to Home
          </button>
        </div>

        {/* Step Tabs & Progress Bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-bold">
            {[
              { num: 1, label: 'Club Info' },
              { num: 2, label: 'Game Tables' },
              { num: 3, label: 'Bar & Snacks' },
              { num: 4, label: 'Admin Link' },
              { num: 5, label: 'Launch' },
            ].map(s => (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num === 1 || isStep1Valid) setStep(s.num as any);
                }}
                className={`py-1.5 px-1 rounded-lg border transition text-center truncate ${
                  step === s.num
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : step > s.num
                    ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <span>{s.num}. {s.label}</span>
              </button>
            ))}
          </div>

          <div className={`w-full h-1.5 rounded-full overflow-hidden border transition-colors ${
            isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-200 border-slate-300/50'
          }`}>
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Container Card */}
      <div className={`w-full max-w-3xl p-5 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>

        {/* --- STEP 1: CLUB IDENTITY --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h2 className={`text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Club Identity & UPI Receiver
                </h2>
              </div>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Set up your club name, manager contact, and direct UPI ID. Customers pay directly to your account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Club / Venue Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Imperial Cue Lounge"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {!businessName.trim() && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">Club name is required</p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Owner / Manager Name *
                </label>
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
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  WhatsApp Contact Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {whatsapp.replace(/[^0-9]/g, '').length !== 10 && (
                  <p className="text-[10px] text-red-400 mt-1 font-medium">
                    10-digit mobile number required
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  UPI ID for Direct Player Payments *
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourclub@upi or phone@okaxis"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>0% commission • 100% direct settlement to bank</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-xs font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Venue Postal PIN Code *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit PIN code (e.g. 560001, 641001, 400001)"
                    maxLength={6}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {isResolvingPin && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Auto-detected City Display Badge */}
                {pincode.length === 6 && (
                  <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                    isDarkMode ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold shrink-0">📍 Detected Location:</span>
                      {isCustomCityOpen ? (
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Edit locality / city"
                          className={`px-2 py-0.5 rounded text-xs border font-semibold ${
                            isDarkMode ? 'bg-slate-900 border-indigo-400 text-white' : 'bg-white border-indigo-400 text-slate-900'
                          }`}
                        />
                      ) : (
                        <span className="font-bold truncate">{city || 'Auto-detecting...'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomCityOpen(!isCustomCityOpen)}
                      className="text-[10px] font-bold text-indigo-400 hover:underline shrink-0"
                    >
                      {isCustomCityOpen ? 'Done' : 'Edit'}
                    </button>
                  </div>
                )}

                {pincode.length < 6 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter your 6-digit postal code to auto-locate your club's city & district.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: TABLES & ASSETS SETUP --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
                <h2 className={`text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Configure Gaming Stations & Rates
                </h2>
              </div>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select a 1-click starter template below or add custom tables to immediately populate your POS floor.
              </p>
            </div>

            {/* Quick 1-Click Preset Bundles */}
            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                ⚡ 1-Click Starter Templates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_BUNDLES.map(bundle => {
                  const isSelected = activeBundleId === bundle.id;
                  return (
                    <button
                      key={bundle.id}
                      type="button"
                      onClick={() => applyPresetBundle(bundle)}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                            : 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-extrabold text-xs flex items-center gap-1.5">
                            <span>{bundle.icon}</span>
                            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{bundle.name}</span>
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : isDarkMode
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {bundle.badge}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {bundle.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-dashed flex items-center justify-between text-[10px] font-bold border-slate-700/40">
                        <span className="text-indigo-400">{bundle.items.length} Pre-configured Stations</span>
                        {isSelected && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Configured Assets List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your Configured Stations ({assets.length})
                </label>
                <span className="text-[11px] text-slate-400">Exact clock billing enabled</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {assets.map((asset, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {asset.name}
                        </div>
                        <div className={`text-[10px] flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{asset.category}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-emerald-400">₹{asset.hourlyRate}/hr</span>
                          {asset.billingBasis === 'PER_PERSON' && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Per Person
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAsset(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Remove station"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Station Bar */}
            <div className={`p-4 rounded-2xl border border-dashed space-y-3 transition ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/60 border-slate-300'
            }`}>
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Another Custom Table / Station
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. VIP Snooker #2"
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
                  <option value="PS5">PlayStation / Xbox Consoles</option>
                  <option value="PC Gaming">PC Gaming Battle Station</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="VR">VR Pod / Motion Station</option>
                  <option value="Foosball">Foosball Table</option>
                  <option value="Air Hockey">Air Hockey Table</option>
                  <option value="Darts">Darts Lane</option>
                  <option value="Karaoke">Karaoke Booth</option>
                  <option value="Board Games">Board Games Lounge</option>
                </select>

                <select
                  value={newAssetBillingBasis}
                  onChange={(e) => setNewAssetBillingBasis(e.target.value as BillingBasis)}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="PER_TABLE">Flat Table Rate</option>
                  <option value="PER_PERSON">Per Person (Rate × Players)</option>
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newAssetRate}
                    onChange={(e) => setNewAssetRate(Number(e.target.value))}
                    placeholder="Rate ₹/hr"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAsset}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shrink-0 transition shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: BAR & SNACK MENU --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Coffee className="w-5 h-5 text-indigo-400" />
                  <h2 className={`text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Starter Bar & Snack Catalog
                  </h2>
                </div>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Pre-load popular beverages and snacks. You can attach these directly to gaming sessions or sell standalone.
                </p>
              </div>

              <button
                type="button"
                onClick={selectAllBarPresets}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition ${
                  selectedPresetIds.size === barPresetCatalog.length
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {selectedPresetIds.size === barPresetCatalog.length ? 'Clear All' : 'Select All Items'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {barPresetCatalog.map((item) => {
                const isChecked = selectedPresetIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleBarPreset(item.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                      isChecked
                        ? isDarkMode ? 'bg-indigo-600/15 border-indigo-500 shadow-md' : 'bg-indigo-50 border-indigo-500 shadow-sm'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600'
                          : isDarkMode ? 'border-slate-600' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.category} • Stock: {item.stock}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-mono font-black shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
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
              <h2 className={`text-xl font-black mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Link Primary Owner Account
              </h2>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sign in with Google to secure your club records, bill audits, and cloud persistence.
              </p>
            </div>

            {authUser ? (
              <div className={`p-4 rounded-2xl border max-w-sm mx-auto flex items-center gap-3 transition ${
                isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                {authUser.picture ? (
                  <img src={authUser.picture} alt={authUser.name} className="w-10 h-10 rounded-full ring-2 ring-emerald-500 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {authUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left min-w-0">
                  <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{authUser.name}</div>
                  <div className={`text-[11px] truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{authUser.email}</div>
                  <span className={`text-[9px] font-extrabold uppercase ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>✓ Google SSO Connected</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-xl transition inline-flex items-center justify-center gap-3 cursor-pointer ${
                    isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Authenticate with Google</span>
                </button>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Or you can proceed directly to preview your POS floor now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 5: REVIEW & GRAND OPENING LAUNCH --- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className={`text-2xl font-black mb-1 tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Your Club OS is Ready!
              </h2>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your club tables, bar inventory, and direct UPI payment gateway have been configured. Launching will immediately open your active floor.
              </p>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 text-xs transition-colors ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex justify-between py-1.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Club Name:</span>
                <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{businessName}</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Manager & City:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ownerName} ({city})</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>UPI Direct QR ID:</span>
                <span className={`font-mono font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{upiId}</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Active Gaming Stations:</span>
                <span className="font-bold text-emerald-400">{assets.length} Ready to Meter Time</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Bar & Snack Menu:</span>
                <span className="font-bold text-indigo-400">{selectedBarPresets.length} Items In-Stock</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons (Back / Continue / Launch) */}
        <div className={`mt-8 pt-4 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${
                isDarkMode 
                  ? 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60' 
                  : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              disabled={step === 1 && !isStep1Valid}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Continue</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live POS Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
