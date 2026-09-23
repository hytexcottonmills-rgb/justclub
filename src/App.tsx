/**
 * justclub — Gaming Club & Lounge Operating Platform (OS V2)
 * Designed in Stripe Dashboard Aesthetics (Dark & Light themes)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ClubProfile, 
  GameAsset, 
  CustomerPlayer, 
  BarItem, 
  GameSession, 
  BillSettlementResult,
  MatchType,
  PaymentMethod,
  SuperAdminClubTenant,
  AppView,
  AuthUser,
  SubscriptionConfig,
  SubscriptionPlan,
  LedgerEntry,
  BillRecord,
  BillPlayerShare,
  ClubExpense
} from './types';
import { 
  initialClubProfile, 
  initialGameAssets, 
  initialCustomers, 
  initialBarItems, 
  initialGameSessions, 
  initialSuperAdminTenants,
  initialLedgerEntries,
  initialBills
} from './data/initialData';

import { HeaderNavbar } from './components/HeaderNavbar';
import { SuperAdminHeaderNavbar } from './components/SuperAdminHeaderNavbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ActiveTablesView } from './components/ActiveTablesView';
import { BillsView } from './components/BillsView';
import { BarPosTerminal } from './components/BarPosTerminal';
import { LedgersView } from './components/LedgersView';
import { RetentionDashboard } from './components/RetentionDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { SetupConfigView } from './components/SetupConfigView';
import { SuperAdminView } from './components/SuperAdminView';
import { SplitBillingModal } from './components/SplitBillingModal';
import { LogoutModal } from './components/LogoutModal';
import { SessionReminderAlertModal } from './components/SessionReminderAlertModal';
import { PWAInstallModal } from './components/PWAInstallModal';

// New Landing, Onboarding, and Login Views
import { LandingPage } from './components/LandingPage';
import { ClubOnboardingView } from './components/ClubOnboardingView';
import { LoginPage } from './components/LoginPage';
import { GoogleOneTapPrompt } from './components/GoogleOneTapPrompt';
import { BrandAssetsView } from './components/BrandAssetsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SuperAdminGuard } from './components/SuperAdminGuard';
import { UpiPayRedirectPage } from './components/UpiPayRedirectPage';
import { api, getAuthToken, setAuthToken, getPendingMutationCount, flushPendingMutations } from './services/api';

import { ShieldAlert, RefreshCw, Crown, Sparkles, Receipt, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocalDateString } from './utils/billing';

// Utility functions for clean standardized sequential voucher / reference numbers
const getNextBillNumber = (existingBills: BillRecord[], existingLedger: LedgerEntry[]): string => {
  let maxNum = 0;
  const allRefs = [
    ...existingBills.map(b => b.billNo),
    ...existingBills.map(b => b.voucherNo || ''),
    ...existingLedger.map(l => l.voucherNo || '')
  ];
  allRefs.forEach(ref => {
    const match = ref.match(/BILL-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum && n < 100000) maxNum = n;
    }
  });
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  return `BILL-${String(nextNum).padStart(3, '0')}`;
};

const getNextPaymentNumber = (existingLedger: LedgerEntry[]): string => {
  let maxNum = 0;
  existingLedger.forEach(l => {
    const match = (l.voucherNo || '').match(/PAYMENT-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum && n < 100000) maxNum = n;
    }
  });
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  return `PAYMENT-${String(nextNum).padStart(3, '0')}`;
};

const getNextBarBillNumber = (existingBills: BillRecord[], existingLedger: LedgerEntry[]): string => {
  let maxNum = 0;
  const allRefs = [
    ...existingBills.map(b => b.billNo),
    ...existingBills.map(b => b.voucherNo || ''),
    ...existingLedger.map(l => l.voucherNo || '')
  ];
  allRefs.forEach(ref => {
    const match = ref.match(/BAR-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum && n < 100000) maxNum = n;
    }
  });
  const nextNum = maxNum > 0 ? maxNum + 1 : 1;
  return `BAR-${String(nextNum).padStart(3, '0')}`;
};

// Utility helper to namespace localStorage keys to prevent cross-account leakage
const getScopedKey = (baseKey: string, userId?: string | null): string => {
  return userId ? `${baseKey}:${userId}` : `${baseKey}:anon`;
};

const cleanupLegacyAndNonMatchingKeys = (activeUserId?: string | null) => {
  const baseKeys = [
    'club_pos_profile',
    'club_pos_tenants',
    'club_pos_assets',
    'club_pos_customers',
    'club_pos_bar',
    'club_pos_sessions',
    'club_pos_bills',
    'club_pos_ledger_entries',
    'club_pos_expenses'
  ];
  // Remove legacy unscoped keys
  baseKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });

  // Remove keys for other users
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && baseKeys.some(bk => key.startsWith(`${bk}:`))) {
        if (activeUserId) {
          if (!key.endsWith(`:${activeUserId}`)) {
            keysToRemove.push(key);
          }
        } else {
          if (!key.endsWith(':anon')) {
            keysToRemove.push(key);
          }
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Storage cleanup error", e);
  }
};

export default function App() {
  // --- STATE WITH LOCALSTORAGE PERSISTENCE ---

  // Top-level Navigation View ('landing' | 'onboarding' | 'login' | 'pos' | 'superadmin')
  const [appView, setAppView] = useState<AppView>(() => {
    const savedView = localStorage.getItem('justclub_app_view');
    return (savedView as AppView) || 'landing';
  });

  // Google One-Tap Authenticated User State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('justclub_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [clubProfile, setClubProfile] = useState<ClubProfile>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_profile', uId));
    return saved ? JSON.parse(saved) : initialClubProfile;
  });

  const [gameAssets, setGameAssets] = useState<GameAsset[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_assets', uId));
    return saved ? JSON.parse(saved) : initialGameAssets;
  });

  const [customers, setCustomers] = useState<CustomerPlayer[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_customers', uId));
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [barItems, setBarItems] = useState<BarItem[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_bar', uId));
    return saved ? JSON.parse(saved) : initialBarItems;
  });

  const [activeSessions, setActiveSessions] = useState<GameSession[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_sessions', uId));
    return saved ? JSON.parse(saved) : initialGameSessions;
  });

  const [superAdminTenants, setSuperAdminTenants] = useState<SuperAdminClubTenant[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_tenants', uId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialSuperAdminTenants;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_ledger_entries', uId));
    return saved ? JSON.parse(saved) : initialLedgerEntries;
  });

  // Bills and Invoices Hub History
  const [bills, setBills] = useState<BillRecord[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_bills', uId));
    return saved ? JSON.parse(saved) : initialBills;
  });

  // Operational Expenses
  const [expenses, setExpenses] = useState<ClubExpense[]>(() => {
    const savedUserStr = localStorage.getItem('justclub_auth_user');
    const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
    const saved = localStorage.getItem(getScopedKey('club_pos_expenses', uId));
    return saved ? JSON.parse(saved) : [];
  });

  const handleLogExpense = async (expenseData: Omit<ClubExpense, 'id' | 'createdAt' | 'status' | 'loggedByEmail'>) => {
    const newId = `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newExpense: ClubExpense = {
      ...expenseData,
      id: newId,
      status: 'ACTIVE',
      loggedByEmail: authUser?.email || 'owner@club.pos',
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    try {
      await api.expenses.create(newExpense);
    } catch (e) {
      console.warn('Failed to save expense to server, saved locally', e);
      setOfflineMode(true);
    }
  };

  const handleVoidExpense = async (id: string, reason: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'VOIDED', voidReason: reason } : e));
    try {
      await api.expenses.void(id, reason);
    } catch (e) {
      console.warn('Failed to void expense on server, saved locally', e);
      setOfflineMode(true);
    }
  };

  const [subscriptionConfig, setSubscriptionConfig] = useState<SubscriptionConfig>(() => {
    const saved = localStorage.getItem('justclub_subscription_config');
    if (saved) return JSON.parse(saved);
    return {
      trialPeriodDays: 15,
      plans: [
        { id: 'monthly', name: 'Monthly Plan', amount: 499, periodMonths: 1, discountLabel: 'Standard' },
        { id: 'quarterly', name: '3-Month Plan', amount: 1299, periodMonths: 3, discountLabel: 'Save 13%' },
        { id: 'yearly', name: 'Yearly Plan', amount: 4499, periodMonths: 12, discountLabel: 'Save 25% (2 Mo Free)' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('justclub_subscription_config', JSON.stringify(subscriptionConfig));
  }, [subscriptionConfig]);

  // UI View Navigation State inside POS
  const [currentTab, setCurrentTab] = useState<NavTab>('tables');
  const [selectedLedgerCustomerId, setSelectedLedgerCustomerId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('justclub_is_dark_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSuperAdminUnauthorized = useCallback(() => {
    setAppView('landing');
    setIsLoginModalOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('justclub_is_dark_mode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Active Split Billing Modal Session
  const [splitModalSession, setSplitModalSession] = useState<GameSession | null>(null);

  // Settlement completion toast notification
  const [ledgerNotification, setLedgerNotification] = useState<{ message: string; subtext?: string } | null>(null);

  useEffect(() => {
    if (ledgerNotification) {
      const timer = setTimeout(() => {
        setLedgerNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [ledgerNotification]);

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return localStorage.getItem('justclub_is_impersonating') === 'true';
  });
  const [backupClubProfile, setBackupClubProfile] = useState<ClubProfile | null>(() => {
    const saved = localStorage.getItem('justclub_backup_club_profile');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('justclub_is_impersonating', String(isImpersonating));
  }, [isImpersonating]);

  useEffect(() => {
    if (backupClubProfile) {
      localStorage.setItem('justclub_backup_club_profile', JSON.stringify(backupClubProfile));
    } else {
      localStorage.removeItem('justclub_backup_club_profile');
    }
  }, [backupClubProfile]);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('justclub_app_view', appView);
  }, [appView]);

  // Require real Google auth before reaching POS or superadmin
  useEffect(() => {
    if ((appView === 'pos' || appView === 'superadmin') && !authUser) {
      setAppView('landing');
      setIsLoginModalOpen(true);
    }
  }, [appView, authUser]);

  // Pending onboarding data if user finishes wizard before authenticating with Google (persisted in sessionStorage)
  const [pendingOnboarding, setPendingOnboarding] = useState<{
    profile: ClubProfile;
    assets: GameAsset[];
    barItems: BarItem[];
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('justclub_pending_onboarding');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (pendingOnboarding) {
        sessionStorage.setItem('justclub_pending_onboarding', JSON.stringify(pendingOnboarding));
      } else {
        sessionStorage.removeItem('justclub_pending_onboarding');
      }
    } catch {}
  }, [pendingOnboarding]);

  // --- PERSISTENT STORAGE HYDRATION GATE ---
  const [isHydrated, setIsHydrated] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('justclub_auth_user', JSON.stringify(authUser));
      cleanupLegacyAndNonMatchingKeys(authUser.id);

      // Load newly logged-in user's data from localStorage to prevent leaked state from previous user
      const uId = authUser.id;

      const savedProfile = localStorage.getItem(getScopedKey('club_pos_profile', uId));
      setClubProfile(savedProfile ? JSON.parse(savedProfile) : initialClubProfile);

      const savedAssets = localStorage.getItem(getScopedKey('club_pos_assets', uId));
      setGameAssets(savedAssets ? JSON.parse(savedAssets) : initialGameAssets);

      const savedCustomers = localStorage.getItem(getScopedKey('club_pos_customers', uId));
      setCustomers(savedCustomers ? JSON.parse(savedCustomers) : initialCustomers);

      const savedBar = localStorage.getItem(getScopedKey('club_pos_bar', uId));
      setBarItems(savedBar ? JSON.parse(savedBar) : initialBarItems);

      const savedSessions = localStorage.getItem(getScopedKey('club_pos_sessions', uId));
      setActiveSessions(savedSessions ? JSON.parse(savedSessions) : initialGameSessions);

      const savedTenants = localStorage.getItem(getScopedKey('club_pos_tenants', uId));
      setSuperAdminTenants(savedTenants ? JSON.parse(savedTenants) : initialSuperAdminTenants);

      const savedBills = localStorage.getItem(getScopedKey('club_pos_bills', uId));
      setBills(savedBills ? JSON.parse(savedBills) : initialBills);

      const savedLedger = localStorage.getItem(getScopedKey('club_pos_ledger_entries', uId));
      setLedgerEntries(savedLedger ? JSON.parse(savedLedger) : initialLedgerEntries);

      const savedExpenses = localStorage.getItem(getScopedKey('club_pos_expenses', uId));
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);

      setIsHydrated(true); // Now we are populated with the new user's locally saved data
    } else {
      localStorage.removeItem('justclub_auth_user');
      cleanupLegacyAndNonMatchingKeys(null);

      // Reset all states to initial values to prevent leakage on logout
      setClubProfile(initialClubProfile);
      setGameAssets(initialGameAssets);
      setCustomers(initialCustomers);
      setBarItems(initialBarItems);
      setActiveSessions(initialGameSessions);
      setSuperAdminTenants(initialSuperAdminTenants);
      setBills(initialBills);
      setLedgerEntries(initialLedgerEntries);
      setExpenses([]);

      setIsHydrated(false); // Do not write anything since user is logged out
    }
  }, [authUser]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_profile', authUser.id), JSON.stringify(clubProfile));
  }, [clubProfile, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_assets', authUser.id), JSON.stringify(gameAssets));
  }, [gameAssets, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_customers', authUser.id), JSON.stringify(customers));
  }, [customers, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_bar', authUser.id), JSON.stringify(barItems));
  }, [barItems, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_sessions', authUser.id), JSON.stringify(activeSessions));
  }, [activeSessions, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_tenants', authUser.id), JSON.stringify(superAdminTenants));
  }, [superAdminTenants, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_bills', authUser.id), JSON.stringify(bills));
  }, [bills, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_ledger_entries', authUser.id), JSON.stringify(ledgerEntries));
  }, [ledgerEntries, isHydrated, authUser?.id]);

  useEffect(() => {
    if (!isHydrated || !authUser?.id) return;
    localStorage.setItem(getScopedKey('club_pos_expenses', authUser.id), JSON.stringify(expenses));
  }, [expenses, isHydrated, authUser?.id]);

  // --- SELF-HEALING RECONCILIATION: RECONSTRUCT MISSING BILLS FROM LEDGER ENTRIES ---
  useEffect(() => {
    if (!ledgerEntries || ledgerEntries.length === 0) return;

    const existingBillKeys = new Set<string>();
    bills.forEach(b => {
      if (b.billNo) existingBillKeys.add(String(b.billNo).toUpperCase());
      if (b.voucherNo) existingBillKeys.add(String(b.voucherNo).toUpperCase());
      if (b.id) existingBillKeys.add(b.id);
    });

    const missingGroups = new Map<string, LedgerEntry[]>();
    ledgerEntries.forEach(entry => {
      const vNo = String(entry.voucherNo || '').trim().toUpperCase();
      if (!vNo) return;
      if (!vNo.startsWith('BILL-') && !vNo.startsWith('BAR-') && !vNo.startsWith('VCH-') && !vNo.startsWith('LED-')) return;
      if (existingBillKeys.has(vNo)) return;

      if (!missingGroups.has(vNo)) {
        missingGroups.set(vNo, []);
      }
      missingGroups.get(vNo)!.push(entry);
    });

    if (missingGroups.size === 0) return;

    const synthesized: BillRecord[] = [];
    missingGroups.forEach((entries, vNo) => {
      const first = entries[0];
      const isBar = vNo.startsWith('BAR-') || first.type === 'DEBIT_BAR';

      const playersMap = new Map<string, { id: string; name: string; whatsapp?: string }>();
      const sharesList: BillPlayerShare[] = [];
      let calcTotalGameCost = 0;
      let calcTotalBarCost = 0;
      let grandTotal = 0;

      entries.forEach(e => {
        const pId = e.customerId || `cust_anon_${Math.random().toString(36).substring(2, 6)}`;
        const pName = e.customerName || 'Walk-in Customer';
        if (!playersMap.has(pId)) {
          playersMap.set(pId, { id: pId, name: pName, whatsapp: e.customerPhone || '' });
        }

        const gShare = Number(e.gameShare) || (e.type === 'DEBIT_SESSION' ? Number(e.amount) : 0);
        const bShare = Number(e.barShare) || (e.type === 'DEBIT_BAR' ? Number(e.amount) : 0);
        const totShare = Number(e.amount) || (gShare + bShare);

        if (e.type === 'DEBIT_SESSION' || e.type === 'DEBIT_BAR') {
          calcTotalGameCost += Number(e.totalGameCost) || gShare;
          calcTotalBarCost += Number(e.totalBarCost) || bShare;
          grandTotal += totShare;

          sharesList.push({
            playerId: pId,
            playerName: pName,
            whatsapp: e.customerPhone || '',
            gameShare: gShare,
            barShare: bShare,
            totalShare: totShare,
            paymentMethod: e.paymentMethod || 'Ledger',
            isSettled: e.status === 'SETTLED' || e.paymentMethod !== 'Ledger',
            isLoser: Boolean(e.isLoser),
            notes: e.description || e.notes || ''
          });
        }
      });

      const parsedBarItems = first.barItemsSummary 
        ? (typeof first.barItemsSummary === 'string' ? JSON.parse(first.barItemsSummary) : first.barItemsSummary) 
        : [];

      const synBill: BillRecord = {
        id: `syn_bill_${vNo}_${Date.now()}`,
        billNo: vNo,
        voucherNo: vNo,
        sessionId: first.sessionId || `sess_syn_${vNo}`,
        assetId: undefined,
        assetName: first.assetName || (isBar ? 'Bar & Cafe POS' : 'Game Table'),
        category: first.assetCategory || (isBar ? 'Bar POS' : 'Snooker'),
        gameType: first.assetName || (isBar ? 'Quick Cafe Sale' : 'Snooker Match'),
        matchType: first.matchType || '1v1',
        hourlyRate: Number(first.hourlyRate) || 0,
        billingIncrement: 'exact',
        billingBasis: 'PER_TABLE',
        startTime: first.timestamp || new Date().toISOString(),
        endTime: first.timestamp || new Date().toISOString(),
        durationMinutes: Number(first.durationMinutes) || 0,
        totalPausedDuration: 0,
        totalGameCost: calcTotalGameCost,
        totalBarCost: calcTotalBarCost,
        discount: 0,
        grandTotal: grandTotal || (calcTotalGameCost + calcTotalBarCost),
        roundOffAmount: 0,
        players: Array.from(playersMap.values()),
        gameSplitRule: (first.splitRule as any) || (isBar ? 'quick_bar_sale' : '1v1_equal'),
        barSplitRule: (first.barSplitRule as any) || 'equal_share',
        losingPlayerIds: entries.filter(e => e.isLoser).map(e => e.customerId),
        winningPlayerIds: [],
        singlePayerId: undefined,
        customBarSplitPlayerIds: [],
        shares: sharesList.length > 0 ? sharesList : [{
          playerId: first.customerId || 'cust_walkin',
          playerName: first.customerName || 'Walk-in Customer',
          whatsapp: first.customerPhone || '',
          gameShare: calcTotalGameCost,
          barShare: calcTotalBarCost,
          totalShare: grandTotal,
          paymentMethod: first.paymentMethod || 'Ledger',
          isSettled: first.paymentMethod !== 'Ledger',
          notes: first.description || ''
        }],
        barItemsSummary: parsedBarItems,
        status: sharesList.every(s => s.isSettled) ? 'SETTLED' : 'UNSETTLED',
        timestamp: first.timestamp || new Date().toISOString(),
        notes: `Restored from ledger transaction ${vNo}`
      };

      synthesized.push(synBill);
    });

    if (synthesized.length > 0) {
      setBills(prev => {
        const merged = [...synthesized, ...prev];
        const unique = new Map<string, BillRecord>();
        merged.forEach(b => {
          if (!unique.has(b.billNo)) unique.set(b.billNo, b);
        });
        return Array.from(unique.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });
    }
  }, [ledgerEntries, bills]);

  // --- OFFLINE AND SYNC STATUS ---
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingMutationCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);

  const triggerOfflineToast = (msg: string) => {
    setOfflineToast(msg);
    setTimeout(() => setOfflineToast(null), 5000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await fetchAndPopulateAllData();
      triggerOfflineToast("☁️ Synced with cloud successfully!");
    } catch {
      triggerOfflineToast("⚠️ Local cache up to date.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync queue flush triggers: online event & interval
  useEffect(() => {
    const handleOnline = () => {
      flushPendingMutations(count => setPendingSyncCount(count));
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    if (pendingSyncCount <= 0) return;
    const interval = setInterval(() => {
      flushPendingMutations(count => setPendingSyncCount(count));
    }, 20000);
    return () => clearInterval(interval);
  }, [pendingSyncCount]);

  const fetchAndPopulateAllData = async () => {
    try {
      await flushPendingMutations(count => setPendingSyncCount(count));
      
      const results = await Promise.allSettled([
        api.club.getProfile(),
        api.assets.getAll(20, 0),
        api.customers.getAll(20, 0),
        api.bar.getAll(20, 0),
        api.sessions.getAllActive(),
        api.bills.getAll(),
        api.ledger.getAll(),
        api.admin.getTenants(),
        api.expenses.getAll(undefined, undefined),
        api.subscription.getConfig()
      ]);

      const [clubRes, assetsRes, customersRes, barRes, sessionsRes, billsRes, ledgerRes, tenantsRes, expensesRes, subRes] = results;

      // Only enter offline mode if there is a real network transport failure
      const isNetworkDisconnected = !navigator.onLine || results.some(r => {
        if (r.status === 'rejected') {
          const msg = String(r.reason?.message || r.reason || '').toLowerCase();
          const isLogicalApiError = msg.includes('subscription_required') || msg.includes('tenant_suspended') || msg.includes('http 402') || msg.includes('http 401') || msg.includes('http 403');
          const isNetworkError = msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network request failed') || r.reason instanceof TypeError;
          return isNetworkError && !isLogicalApiError;
        }
        return false;
      });

      if (isNetworkDisconnected) {
        setOfflineMode(true);
        triggerOfflineToast("Offline Mode — Network unavailable. Using cached local data.");
      } else {
        setOfflineMode(false);
      }

      if (clubRes.status === 'fulfilled' && clubRes.value?.success && clubRes.value?.profile) {
        setClubProfile(clubRes.value.profile);
        if (clubRes.value.isViewOnly !== undefined) setIsViewOnly(Boolean(clubRes.value.isViewOnly));
        if (clubRes.value.daysRemaining !== undefined) setDaysRemaining(clubRes.value.daysRemaining);
      }
      if (assetsRes.status === 'fulfilled' && assetsRes.value?.success && assetsRes.value?.assets) {
        setGameAssets(assetsRes.value.assets);
      }
      if (customersRes.status === 'fulfilled' && customersRes.value?.success && customersRes.value?.customers) {
        setCustomers(customersRes.value.customers);
      }
      if (barRes.status === 'fulfilled' && barRes.value?.success && barRes.value?.barItems) {
        setBarItems(barRes.value.barItems);
      }
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.success && sessionsRes.value?.sessions) {
        setActiveSessions(sessionsRes.value.sessions);
      }
      if (billsRes.status === 'fulfilled' && billsRes.value?.success && billsRes.value?.bills) {
        setBills(billsRes.value.bills);
      }
      if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.success && ledgerRes.value?.ledgerEntries) {
        setLedgerEntries(ledgerRes.value.ledgerEntries);
      }
      if (expensesRes.status === 'fulfilled' && expensesRes.value?.success && Array.isArray(expensesRes.value?.expenses)) {
        setExpenses(expensesRes.value.expenses);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.success && Array.isArray(tenantsRes.value?.tenants)) {
        setSuperAdminTenants(tenantsRes.value.tenants);
      }
      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setSubscriptionConfig({
          trialPeriodDays: subRes.value.trialPeriodDays,
          plans: subRes.value.plans
        });
      }
    } catch (err) {
      console.warn("Unexpected error in fetchAndPopulateAllData:", err);
      if (!navigator.onLine) {
        setOfflineMode(true);
        triggerOfflineToast("Offline Mode — Network unavailable.");
      }
    } finally {
      setIsHydrated(true);
    }
  };

  // --- PAGINATION & LOAD MORE HANDLERS ---
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [isLoadingMoreCustomers, setIsLoadingMoreCustomers] = useState(false);

  const [hasMoreAssets, setHasMoreAssets] = useState(true);
  const [isLoadingMoreAssets, setIsLoadingMoreAssets] = useState(false);

  const [hasMoreBarItems, setHasMoreBarItems] = useState(true);
  const [isLoadingMoreBarItems, setIsLoadingMoreBarItems] = useState(false);

  const handleLoadMoreCustomers = async () => {
    if (isLoadingMoreCustomers) return;
    setIsLoadingMoreCustomers(true);
    try {
      const limit = 20;
      const offset = customers.length;
      const res = await api.customers.getAll(limit, offset);
      if (res && res.success && res.customers) {
        if (res.customers.length < limit) setHasMoreCustomers(false);
        setCustomers(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newItems = res.customers.filter((c: any) => !existingIds.has(c.id));
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.warn("Failed to load more customers", err);
    } finally {
      setIsLoadingMoreCustomers(false);
    }
  };

  const handleLoadMoreAssets = async () => {
    if (isLoadingMoreAssets) return;
    setIsLoadingMoreAssets(true);
    try {
      const limit = 20;
      const offset = gameAssets.length;
      const res = await api.assets.getAll(limit, offset);
      if (res && res.success && res.assets) {
        if (res.assets.length < limit) setHasMoreAssets(false);
        setGameAssets(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newItems = res.assets.filter((a: any) => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.warn("Failed to load more assets", err);
    } finally {
      setIsLoadingMoreAssets(false);
    }
  };

  const handleLoadMoreBarItems = async () => {
    if (isLoadingMoreBarItems) return;
    setIsLoadingMoreBarItems(true);
    try {
      const limit = 20;
      const offset = barItems.length;
      const res = await api.bar.getAll(limit, offset);
      if (res && res.success && res.barItems) {
        if (res.barItems.length < limit) setHasMoreBarItems(false);
        setBarItems(prev => {
          const existingIds = new Set(prev.map(b => b.id));
          const newItems = res.barItems.filter((b: any) => !existingIds.has(b.id));
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.warn("Failed to load more bar items", err);
    } finally {
      setIsLoadingMoreBarItems(false);
    }
  };

  useEffect(() => {
    if (authUser && authUser.role !== 'superadmin') {
      fetchAndPopulateAllData();
    }
  }, [authUser]);

  // Verify existing session token on startup
  useEffect(() => {
    async function verifyToken() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.auth.verify();
          if (res && res.success && res.user) {
            const verifiedUser: AuthUser = {
              id: res.user.id,
              name: res.user.fullName || res.user.name || res.user.email.split('@')[0],
              email: res.user.email,
              picture: res.user.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: res.user.role || 'club_owner',
              loginProvider: 'google',
              loggedInAt: new Date().toISOString(),
            };
            setAuthUser(verifiedUser);
            if (verifiedUser.role === 'superadmin') {
              setAppView('superadmin');
            } else {
              setAppView('pos');
            }
          } else {
            setAuthToken(null);
            setAuthUser(null);
          }
        } catch (e) {
          console.error("Token verification failed on startup", e);
        }
      }
    }
    verifyToken();

    // Check if brand asset page has been explicitly hash-routed
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get('view') === 'brand' ||
      searchParams.get('portal') === 'brand' ||
      window.location.hash === '#brand' ||
      window.location.hash === '#specs'
    ) {
      setAppView('brand');
    }
  }, []);

  // --- GOOGLE AUTH HANDLERS ---
  const handleGoogleLogin = async (credential: string) => {
    try {
      const res = await api.auth.googleLogin(credential);
      if (res && res.success && res.token) {
        setAuthToken(res.token);
        const fullUser: AuthUser = {
          id: res.user.id,
          name: res.user.fullName || res.user.name || res.user.email.split('@')[0],
          email: res.user.email,
          picture: res.user.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: res.user.role || 'club_owner',
          loginProvider: 'google_one_tap',
          loggedInAt: new Date().toISOString(),
        };
        setAuthUser(fullUser);

        // Sync user details to active club profile if owner
        setClubProfile(prev => ({
          ...prev,
          ownerName: fullUser.name,
        }));

        // If there was pending onboarding configuration, apply it now
        if (pendingOnboarding) {
          setClubProfile(pendingOnboarding.profile);
          setGameAssets(pendingOnboarding.assets);
          setBarItems(pendingOnboarding.barItems);
          setPendingOnboarding(null);
        }

        if (fullUser.role === 'superadmin') {
          setAppView('superadmin');
        } else {
          setAppView('pos');
          setCurrentTab('tables');
        }
      } else {
        throw new Error('Google Sign-In failed');
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      throw new Error(err.message || 'Google Sign-In verification failed.');
    }
  };

  const handleGoogleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handlePOSLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    cleanupLegacyAndNonMatchingKeys(null);
    setIsLogoutModalOpen(false);
    setAuthToken(null);
    setAuthUser(null);
    setAppView('landing');
    setCurrentTab('tables');
  };

  // --- ONBOARDING COMPLETION HANDLER ---
  const handleCompleteOnboarding = (
    newProfile: ClubProfile, 
    newAssets: GameAsset[], 
    newBarItems: BarItem[]
  ) => {
    setClubProfile(newProfile);
    setGameAssets(newAssets);
    setBarItems(newBarItems);

    if (!authUser) {
      setPendingOnboarding({
        profile: newProfile,
        assets: newAssets,
        barItems: newBarItems,
      });
      setIsLoginModalOpen(true);
      return;
    }

    setAppView('pos');
    setCurrentTab('tables');
  };

  // --- HANDLER FUNCTIONS FOR POS SYSTEM ---

  // 1. Add New Customer
  const handleAddNewCustomer = (name: string, whatsapp: string): CustomerPlayer => {
    const newCust: CustomerPlayer = {
      id: `cust_${Date.now()}`,
      name,
      whatsapp: whatsapp.replace(/[^0-9]/g, ''),
      ledgerBalance: 0,
      totalVisits: 1,
      lastVisitedDate: getLocalDateString(),
      lifetimeValue: 0,
    };
    // Backend API Call (async background)
    api.customers.create(newCust).catch(err => {
      console.warn("Create customer API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });

    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  // 2. Start Game Session Timer
  const handleStartSession = (assetId: string, matchType: MatchType, taggedPlayerIds: string[]) => {
    const asset = gameAssets.find(a => a.id === assetId);
    if (!asset) return;

    const taggedPlayers = customers.filter(c => taggedPlayerIds.includes(c.id));
    
    const newSession: GameSession = {
      id: `sess_${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      category: asset.category,
      hourlyRate: asset.hourlyRate,
      billingIncrement: asset.billingIncrement,
      billingBasis: asset.billingBasis || 'PER_TABLE',
      matchType,
      taggedPlayers,
      startTime: Date.now(),
      pausedAt: null,
      totalPausedDuration: 0,
      attachedBarOrders: [],
      status: 'running',
      endedAt: null,
    };

    // Backend API Call (async background)
    api.sessions.start(newSession).then(res => {
      if ((res as any)?.queued) {
        setPendingSyncCount(getPendingMutationCount());
      }
    }).catch(err => {
      console.warn("Start session API failed", err);
      setOfflineMode(true);
      setPendingSyncCount(getPendingMutationCount());
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });

    setActiveSessions(prev => [newSession, ...prev]);

    // Update asset status to occupied
    setGameAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'occupied' } : a));
  };

  // 3. Pause / Resume Session
  const handleTogglePauseSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const isCurrentlyRunning = session.status === 'running';
    const apiCall = isCurrentlyRunning ? api.sessions.pause(sessionId) : api.sessions.resume(sessionId);

    apiCall.then(res => {
      if ((res as any)?.queued) {
        setPendingSyncCount(getPendingMutationCount());
      }
    }).catch(err => {
      console.warn("Pause/Resume session API failed", err);
      setOfflineMode(true);
      setPendingSyncCount(getPendingMutationCount());
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });

    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;

      const now = Date.now();
      if (s.status === 'running') {
        return { ...s, status: 'paused', pausedAt: now };
      } else if (s.status === 'paused' && s.pausedAt) {
        const pausedSecs = Math.floor((now - s.pausedAt) / 1000);
        return {
          ...s,
          status: 'running',
          pausedAt: null,
          totalPausedDuration: s.totalPausedDuration + pausedSecs,
        };
      }
      return s;
    }));
  };

  // 4. Append Bar Snack to Session
  const handleAddBarItemToSession = (sessionId: string, item: BarItem, qty: number) => {
    if (qty <= 0) return;
    if (item.stock !== null && item.stock < qty) {
      triggerOfflineToast?.(`Insufficient stock: Only ${item.stock} available`);
      return;
    }

    const order = {
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
    };

    api.sessions.addBarOrder(sessionId, order).then(res => {
      if ((res as any)?.queued) {
        setPendingSyncCount(getPendingMutationCount());
      }
    }).catch(err => {
      console.warn("Add bar order API failed", err);
      setOfflineMode(true);
      setPendingSyncCount(getPendingMutationCount());
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });

    // Sync stock decrement to backend
    api.bar.updateStock(item.id, -qty).catch(err => {
      console.warn("Update stock API failed", err);
    });

    // Decrement stock in local state
    setBarItems(prev => prev.map(bi => {
      if (bi.id !== item.id || bi.stock === null) return bi;
      return { ...bi, stock: Math.max(0, bi.stock - qty) };
    }));

    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;

      const existingIndex = s.attachedBarOrders.findIndex(i => i.itemId === item.id);
      let updatedOrders = [...s.attachedBarOrders];

      if (existingIndex >= 0) {
        updatedOrders[existingIndex] = {
          ...updatedOrders[existingIndex],
          quantity: updatedOrders[existingIndex].quantity + qty,
        };
      } else {
        updatedOrders.push(order);
      }

      return { ...s, attachedBarOrders: updatedOrders };
    }));
  };

  // 4b. Session Reminder State & Handlers
  const [ringingReminderSession, setRingingReminderSession] = useState<GameSession | null>(null);

  const handleSetSessionReminder = (sessionId: string, minutes: number | null) => {
    const now = Date.now();
    api.sessions.setReminder(sessionId, minutes).catch(err => {
      console.warn("Failed to sync reminder to backend", err);
    });
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      if (minutes === null || minutes <= 0) {
        return {
          ...s,
          reminderMinutes: null,
          reminderSetAt: null,
          reminderTargetTime: null,
          reminderRung: false,
        };
      }
      const targetMs = now + (minutes * 60 * 1000);
      return {
        ...s,
        reminderMinutes: minutes,
        reminderSetAt: now,
        reminderTargetTime: targetMs,
        reminderRung: false,
      };
    }));
  };

  const handleExtendSessionReminder = (sessionId: string, extraMinutes: number) => {
    const now = Date.now();
    const targetSession = activeSessions.find(s => s.id === sessionId);
    const existingMins = targetSession?.reminderMinutes || 0;
    const newMins = existingMins + extraMinutes;
    api.sessions.setReminder(sessionId, newMins).catch(err => {
      console.warn("Failed to sync extended reminder to backend", err);
    });
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const targetMs = now + (extraMinutes * 60 * 1000);
      return {
        ...s,
        reminderMinutes: newMins,
        reminderSetAt: now,
        reminderTargetTime: targetMs,
        reminderRung: false,
      };
    }));
  };

  // Continuous background checker for session reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveSessions(prevSessions => {
        let updated = false;
        const nextSessions = prevSessions.map(session => {
          if (
            session.status === 'running' &&
            session.reminderTargetTime &&
            !session.reminderRung &&
            now >= session.reminderTargetTime
          ) {
            updated = true;
            setRingingReminderSession(session);
            return { ...session, reminderRung: true };
          }
          return session;
        });
        return updated ? nextSessions : prevSessions;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 5. Complete & Settle Session (Ledger-First Split Billing Engine result)
  const handleConfirmSettlement = (result: BillSettlementResult) => {
    // A. Update customer ledgers & LTV (Push all player shares directly to their ledger balance)
    setCustomers(prev => prev.map(cust => {
      const share = result.shares.find(sh => sh.playerId === cust.id);
      if (!share) return cust;

      api.customers.updateLedger(cust.id, -share.totalShare, 'Session settlement').catch(err => console.warn("Sync customer ledger balance failed", err));
      api.customers.recordVisit(cust.id, share.totalShare, getLocalDateString()).catch(err => console.warn("Sync customer visit/LTV failed", err));

      // In Ledger-First architecture, 100% of share is posted to the customer's ledger
      const newLedger = cust.ledgerBalance - share.totalShare;

      return {
        ...cust,
        ledgerBalance: newLedger,
        totalVisits: cust.totalVisits + 1,
        lastVisitedDate: getLocalDateString(),
        lifetimeValue: cust.lifetimeValue + share.totalShare,
      };
    }));

    // B. Create persistent detailed LedgerEntry records for every player's split share
    const targetSession = activeSessions.find(s => s.id === result.sessionId);
    const billNumber = getNextBillNumber(bills, ledgerEntries);
    const vchNum = billNumber;

    const newLedgerEntries: LedgerEntry[] = result.shares.map((share, idx) => {
      const isLoser = result.losingPlayerIds.includes(share.playerId);
      const coPlayers = result.shares.filter(s => s.playerId !== share.playerId).map(s => s.playerName);

      return {
        id: `led_${Date.now()}_${share.playerId}_${idx}_${Math.floor(Math.random() * 1000)}`,
        voucherNo: vchNum,
        customerId: share.playerId,
        customerName: share.playerName,
        customerPhone: share.whatsapp,
        type: 'DEBIT_SESSION',
        amount: share.totalShare,
        sessionId: result.sessionId,
        assetName: result.assetName,
        assetCategory: targetSession?.category,
        description: `${result.assetName} • ${result.gameSplitRule.replace(/_/g, ' ').toUpperCase()}${isLoser ? ' (Lost Match)' : ''}`,
        paymentMethod: share.paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'PENDING',
        gameShare: share.gameCostShare,
        totalGameCost: result.totalGameCost,
        durationMinutes: result.durationMinutes,
        hourlyRate: targetSession?.hourlyRate,
        matchType: targetSession?.matchType,
        barShare: share.barCostShare,
        totalBarCost: result.totalBarCost,
        barItemsSummary: targetSession?.attachedBarOrders?.map(o => ({
          name: o.name,
          quantity: o.quantity,
          price: o.price
        })) || [],
        splitRule: result.gameSplitRule,
        barSplitRule: result.barSplitRule,
        isLoser,
        coPlayers,
        notes: isLoser ? 'Charged per game loser rules' : 'Standard session ledger debit',
      };
    });
    setLedgerEntries(prev => [...newLedgerEntries, ...prev]);

    // Generate comprehensive BillRecord for the Bills Hub
    const winningPlayerIds = result.losingPlayerIds && result.losingPlayerIds.length > 0
      ? result.shares.filter(s => !result.losingPlayerIds.includes(s.playerId)).map(s => s.playerId)
      : [];

    const newBill: BillRecord = {
      id: `bill_${Date.now()}`,
      billNo: billNumber,
      voucherNo: vchNum,
      sessionId: result.sessionId,
      assetId: targetSession?.assetId,
      assetName: result.assetName,
      category: targetSession?.category || 'General',
      gameType: targetSession?.assetName || result.assetName,
      matchType: targetSession?.matchType || '1v1',
      hourlyRate: targetSession?.hourlyRate || 0,
      billingIncrement: targetSession?.billingIncrement || 'exact',
      billingBasis: targetSession?.billingBasis || 'PER_TABLE',
      startTime: targetSession?.startTime 
        ? new Date(targetSession.startTime).toISOString() 
        : new Date(Date.now() - result.durationMinutes * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: result.durationMinutes,
      totalPausedDuration: targetSession?.totalPausedDuration || 0,
      totalGameCost: result.totalGameCost,
      totalBarCost: result.totalBarCost,
      discount: 0,
      grandTotal: result.grandTotal,
      roundOffAmount: result.roundOffAmount ?? 0,
      players: result.shares.map(s => ({
        id: s.playerId,
        name: s.playerName,
        whatsapp: s.whatsapp,
      })),
      gameSplitRule: result.gameSplitRule,
      barSplitRule: result.barSplitRule,
      losingPlayerIds: result.losingPlayerIds || [],
      winningPlayerIds,
      singlePayerId: result.singlePayerId,
      customBarSplitPlayerIds: result.customBarSplitPlayerIds,
      shares: result.shares.map(s => {
        const isLoser = result.losingPlayerIds?.includes(s.playerId);
        const isWinner = winningPlayerIds.includes(s.playerId);
        const isHost = result.singlePayerId === s.playerId;
        return {
          playerId: s.playerId,
          playerName: s.playerName,
          whatsapp: s.whatsapp,
          gameShare: s.gameCostShare,
          barShare: s.barCostShare,
          totalShare: s.totalShare,
          paymentMethod: s.paymentMethod,
          isSettled: s.paymentMethod !== 'Ledger',
          isLoser,
          isWinner,
          isHost,
          notes: s.notes,
        };
      }),
      barItemsSummary: targetSession?.attachedBarOrders?.map(o => ({
        name: o.name,
        quantity: o.quantity,
        price: o.price,
      })) || [],
      status: result.shares.every(s => s.paymentMethod !== 'Ledger') ? 'SETTLED' : 'UNSETTLED',
      timestamp: new Date().toISOString(),
      notes: `Settled via ${result.gameSplitRule.replace(/_/g, ' ')}`,
    };

    setBills(prev => [newBill, ...prev]);

    // C. Mark session as completed
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== result.sessionId) return s;
      return {
        ...s,
        status: 'completed',
        endedAt: Date.now(),
      };
    }));

    // D. Reset asset status to available
    if (targetSession) {
      setGameAssets(prev => prev.map(a => a.id === targetSession.assetId ? { ...a, status: 'available' } : a));
    }

    // E. Update club revenue telemetry
    setClubProfile(prev => ({
      ...prev,
      totalRevenueThisMonth: prev.totalRevenueThisMonth + result.grandTotal,
    }));

    setSplitModalSession(null);

    // Backend API Calls (async background with offline queueing support)
    api.bills.create(newBill).catch(err => {
      console.warn("Save bill API failed", err);
    });

    newLedgerEntries.forEach(entry => {
      api.ledger.create(entry).catch(err => {
        console.warn("Save ledger entry API failed", err);
      });
    });

    api.sessions.end(result.sessionId, result).then(res => {
      if ((res as any)?.queued) {
        const count = getPendingMutationCount();
        setPendingSyncCount(count);
        setLedgerNotification({
          message: `Bill saved locally — will sync automatically once you're back online (${count} pending)`,
          subtext: `${result.shares.length} player shares recorded locally for settlement.`,
        });
      } else {
        setLedgerNotification({
          message: `Table Released: ₹${result.grandTotal} Posted to Ledgers!`,
          subtext: `${result.shares.length} player shares debited into customer ledger accounts for unified settlement.`,
        });
      }
    }).catch(err => {
      console.warn("End session API failed", err);
      setOfflineMode(true);
      const count = getPendingMutationCount();
      setPendingSyncCount(count);
      setLedgerNotification({
        message: `Bill saved locally — will sync automatically once you're back online (${count} pending)`,
        subtext: `${result.shares.length} player shares recorded locally for settlement.`,
      });
    });
  };

  // 6. Process Direct Standalone Bar Sale
  const handleProcessDirectBarSale = (
    items: { item: BarItem; quantity: number }[],
    customer: CustomerPlayer | null,
    paymentMethod: PaymentMethod
  ) => {
    const totalAmount = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const barBillNum = getNextBarBillNumber(bills, ledgerEntries);

    // Backend API Calls (async background)
    items.forEach(sold => {
      api.bar.updateStock(sold.item.id, -sold.quantity).catch(err => {
        console.warn("Update stock API failed", err);
      });
    });

    if (customer && paymentMethod === 'Ledger') {
      api.customers.updateLedger(customer.id, -totalAmount, 'Counter Café sale added to tab').catch(err => {
        console.warn("Update ledger API failed", err);
        setOfflineMode(true);
        triggerOfflineToast("Offline Mode — Changes saved locally only");
      });
    }

    // Decrement stock
    setBarItems(prev => prev.map(bi => {
      const sold = items.find(i => i.item.id === bi.id);
      if (!sold || bi.stock === null) return bi;
      return { ...bi, stock: Math.max(0, bi.stock - sold.quantity) };
    }));

    // ALWAYS generate an official bill in Bills section
    const isSettled = paymentMethod !== 'Ledger';
    const newBarBill: BillRecord = {
      id: `bill_bar_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      billNo: barBillNum,
      voucherNo: barBillNum,
      sessionId: `pos_bar_${Date.now()}`,
      assetName: 'Bar / Cafe Counter',
      category: 'Cafe & Beverages',
      gameType: 'Bar Quick Sale',
      matchType: 'Direct Sale',
      hourlyRate: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: 0,
      totalGameCost: 0,
      totalBarCost: totalAmount,
      grandTotal: totalAmount,
      players: customer ? [{ id: customer.id, name: customer.name, whatsapp: customer.whatsapp }] : [],
      gameSplitRule: 'standard',
      barSplitRule: 'single_payer',
      losingPlayerIds: [],
      shares: customer ? [{
        playerId: customer.id,
        playerName: customer.name,
        whatsapp: customer.whatsapp,
        gameShare: 0,
        barShare: totalAmount,
        totalShare: totalAmount,
        paymentMethod: paymentMethod,
        isSettled: isSettled,
      }] : [{
        playerId: 'walkin',
        playerName: 'Walk-In Guest',
        gameShare: 0,
        barShare: totalAmount,
        totalShare: totalAmount,
        paymentMethod: paymentMethod,
        isSettled: true,
      }],
      barItemsSummary: items.map(i => ({
        name: i.item.name,
        quantity: i.quantity,
        price: i.item.price
      })),
      status: isSettled ? 'SETTLED' : 'UNSETTLED',
      timestamp: new Date().toISOString(),
      notes: customer ? `Direct Bar Sale for ${customer.name}` : 'Direct Bar Walk-In Sale',
    };
    setBills(prev => [newBarBill, ...prev]);

    // Backend API Calls (async background with offline queueing support)
    api.bills.create(newBarBill).catch(err => {
      console.warn("Save bar bill API failed", err);
    });

    // Handle Customer Ledger Logging (if customer is tagged)
    if (customer) {
      api.customers.recordVisit(customer.id, totalAmount, getLocalDateString()).catch(err => console.warn("Sync customer visit/LTV failed", err));

      setCustomers(prev => prev.map(c => {
        if (c.id !== customer.id) return c;
        let newLedger = c.ledgerBalance;
        if (paymentMethod === 'Ledger') {
          newLedger -= totalAmount;
        }
        return {
          ...c,
          ledgerBalance: newLedger,
          totalVisits: c.totalVisits + 1,
          lastVisitedDate: getLocalDateString(),
          lifetimeValue: c.lifetimeValue + totalAmount,
        };
      }));

      if (paymentMethod === 'Ledger') {
        // PUSH TO LEDGER (DEBIT ONLY)
        const barDebitEntry: LedgerEntry = {
          id: `led_bar_deb_${Date.now()}_${customer.id}`,
          voucherNo: barBillNum,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.whatsapp,
          type: 'DEBIT_BAR',
          amount: totalAmount,
          description: `Cafe & Bar Order (${items.map(i => `${i.item.name} x${i.quantity}`).join(', ')})`,
          paymentMethod: 'Ledger',
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          barShare: totalAmount,
          totalBarCost: totalAmount,
          barItemsSummary: items.map(i => ({
            name: i.item.name,
            quantity: i.quantity,
            price: i.item.price
          })),
          notes: 'Direct counter F&B order added to tab'
        };
        setLedgerEntries(prev => [barDebitEntry, ...prev]);
        api.ledger.create(barDebitEntry).catch(err => console.warn("Save ledger entry API failed", err));

        setLedgerNotification({
          message: `Bar Sale ${barBillNum} Added to Tab: ₹${totalAmount}`,
          subtext: `Charged ₹${totalAmount} to ${customer.name}'s customer ledger tab.`,
        });
      } else {
        // CASH / UPI SALE (BOTH DEBIT + CREDIT POSTING IN LEDGER FOR COMPLETE AUDIT HISTORY)
        const barDebitEntry: LedgerEntry = {
          id: `led_bar_deb_${Date.now()}_${customer.id}`,
          voucherNo: barBillNum,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.whatsapp,
          type: 'DEBIT_BAR',
          amount: totalAmount,
          description: `Cafe & Bar Order (${items.map(i => `${i.item.name} x${i.quantity}`).join(', ')})`,
          paymentMethod: paymentMethod,
          timestamp: new Date().toISOString(),
          status: 'SETTLED',
          barShare: totalAmount,
          totalBarCost: totalAmount,
          barItemsSummary: items.map(i => ({
            name: i.item.name,
            quantity: i.quantity,
            price: i.item.price
          })),
          notes: `Direct counter F&B order paid via ${paymentMethod}`
        };

        const barCreditEntry: LedgerEntry = {
          id: `led_bar_cred_${Date.now()}_${customer.id}`,
          voucherNo: barBillNum,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.whatsapp,
          type: 'CREDIT_PAYMENT',
          amount: totalAmount,
          description: `Payment for ${barBillNum} via ${paymentMethod}`,
          paymentMethod: paymentMethod,
          timestamp: new Date().toISOString(),
          status: 'SETTLED',
          notes: `Immediate ${paymentMethod} settlement for direct bar order ${barBillNum}`
        };

        setLedgerEntries(prev => [barCreditEntry, barDebitEntry, ...prev]);
        api.ledger.create(barDebitEntry).catch(err => console.warn("Save ledger entry API failed", err));
        api.ledger.create(barCreditEntry).catch(err => console.warn("Save ledger entry API failed", err));

        setLedgerNotification({
          message: `Bar Sale ${barBillNum} Settled via ${paymentMethod}`,
          subtext: `₹${totalAmount} paid by ${customer.name}. Invoice ${barBillNum} created & posted to ledger.`,
        });
      }
    } else {
      // WALK-IN GUEST
      setLedgerNotification({
        message: `Walk-In Bar Sale ${barBillNum} Completed: ₹${totalAmount}`,
        subtext: `Invoice ${barBillNum} created in Bills section. Settled via ${paymentMethod}.`,
      });
    }

    setClubProfile(prev => ({
      ...prev,
      totalRevenueThisMonth: prev.totalRevenueThisMonth + totalAmount,
    }));
  };

  // 7. Settle Customer Ledger Debt & Post Credit Entry
  const handleSettleCustomerLedger = (
    customerId: string, 
    amountCleared: number, 
    method: PaymentMethod,
    entryId?: string
  ) => {
    const targetCust = customers.find(c => c.id === customerId);

    // Backend API Call (async background)
    api.customers.updateLedger(customerId, amountCleared, `Settled debt via ${method}`).catch(err => {
      console.warn("Update customer ledger API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    const txnRef = `${method.toUpperCase()}-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentVchNo = getNextPaymentNumber(ledgerEntries);

    // Identify pending vouchers / bills being cleared
    const settledVouchers: string[] = [];
    let remAmount = amountCleared;
    ledgerEntries.forEach(entry => {
      if (entry.customerId === customerId && entry.status === 'PENDING' && entry.type.startsWith('DEBIT')) {
        if (entryId && entry.id === entryId) {
          if (entry.voucherNo && !settledVouchers.includes(entry.voucherNo)) {
            settledVouchers.push(entry.voucherNo);
          }
        } else if (!entryId && remAmount >= entry.amount) {
          remAmount -= entry.amount;
          if (entry.voucherNo && !settledVouchers.includes(entry.voucherNo)) {
            settledVouchers.push(entry.voucherNo);
          }
        }
      }
    });

    const billRefNote = settledVouchers.length > 0
      ? `Settled against ${settledVouchers.join(', ')}`
      : 'Customer ledger account payment';

    // Update customer balance (reduces debit / increases credit)
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        ledgerBalance: c.ledgerBalance + amountCleared,
      };
    }));

    // Create a CREDIT_PAYMENT record in ledgerEntries
    const creditEntry: LedgerEntry = {
      id: `led_pay_${Date.now()}_${customerId}`,
      voucherNo: paymentVchNo,
      customerId,
      customerName: targetCust ? targetCust.name : 'Customer',
      customerPhone: targetCust?.whatsapp,
      type: 'CREDIT_PAYMENT',
      amount: amountCleared,
      description: `Payment received via ${method} (${txnRef}) • ${billRefNote}`,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
      status: 'SETTLED',
      settledAt: new Date().toISOString(),
      settledMethod: method,
      settlementRef: txnRef,
      notes: `${billRefNote} at billing desk`,
    };

    api.ledger.create(creditEntry).catch(err => console.warn("Save payment ledger entry API failed", err));

    // Update matching pending debit entries to SETTLED
    setLedgerEntries(prev => {
      let remainingAmountToSettle = amountCleared;
      const updated = prev.map(entry => {
        if (entry.customerId === customerId && entry.status === 'PENDING' && entry.type.startsWith('DEBIT')) {
          if (entryId && entry.id === entryId) {
            api.ledger.settleEntry(entry.id, method, paymentVchNo).catch(err => console.warn("Sync settled ledger entry failed", err));
            return { 
              ...entry, 
              status: 'SETTLED' as const, 
              settledAt: new Date().toISOString(), 
              settledMethod: method,
              settlementRef: paymentVchNo,
              notes: `${entry.notes || ''} (Cleared via ${paymentVchNo})`.trim()
            };
          } else if (!entryId && remainingAmountToSettle >= entry.amount) {
            remainingAmountToSettle -= entry.amount;
            api.ledger.settleEntry(entry.id, method, paymentVchNo).catch(err => console.warn("Sync settled ledger entry failed", err));
            return { 
              ...entry, 
              status: 'SETTLED' as const, 
              settledAt: new Date().toISOString(), 
              settledMethod: method,
              settlementRef: paymentVchNo,
              notes: `${entry.notes || ''} (Cleared via ${paymentVchNo})`.trim()
            };
          }
        }
        return entry;
      });
      return [creditEntry, ...updated];
    });

    // Update status in Bills list if all referenced shares are settled
    if (settledVouchers.length > 0) {
      setBills(prev => prev.map(b => {
        if (settledVouchers.includes(b.billNo) || (b.voucherNo && settledVouchers.includes(b.voucherNo))) {
          api.bills.settle(b.id).catch(err => console.warn("Sync settled bill failed", err));
          return { ...b, status: 'SETTLED' as const };
        }
        return b;
      }));
    }
  };

  const handleUpdateClubProfile = (updated: ClubProfile) => {
    api.club.updateProfile(updated).catch(err => {
      console.warn("Update profile API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setClubProfile(updated);
  };

  const handleUpdateGameAsset = (asset: GameAsset) => {
    api.assets.update(asset.id, asset).catch(err => {
      console.warn("Update asset API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setGameAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };

  const handleAddGameAsset = (asset: Omit<GameAsset, 'id'>) => {
    const id = `ast_${Date.now()}`;
    const newAsset = { ...asset, id };
    api.assets.create(newAsset).catch(err => {
      console.warn("Create asset API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setGameAssets(prev => [...prev, newAsset]);
  };

  const handleDeleteGameAsset = (id: string) => {
    api.assets.delete(id).catch(err => {
      console.warn("Delete asset API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setGameAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateBarItem = (item: BarItem) => {
    api.bar.update(item.id, item).catch(err => {
      console.warn("Update bar item API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setBarItems(prev => prev.map(b => b.id === item.id ? item : b));
  };

  const handleAddBarItem = (item: Omit<BarItem, 'id'>) => {
    const id = `bar_${Date.now()}`;
    const newItem = { ...item, id };
    api.bar.create(newItem).catch(err => {
      console.warn("Create bar item API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setBarItems(prev => [...prev, newItem]);
  };

  const handleDeleteBarItem = (id: string) => {
    api.bar.delete(id).catch(err => {
      console.warn("Delete bar item API failed", err);
      setOfflineMode(true);
      triggerOfflineToast("Offline Mode — Changes saved locally only");
    });
    setBarItems(prev => prev.filter(b => b.id !== id));
  };

  // 8. Super Admin Tenant Status Switcher
  const handleToggleTenantStatus = async (tenantId: string) => {
    // optimistic local update
    setSuperAdminTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      
      // If updating current demo club
      if (tenantId === clubProfile.id) {
        setClubProfile(cp => ({ ...cp, tenantStatus: nextStatus }));
      }

      return { ...t, status: nextStatus };
    }));

    try {
      const res = await api.admin.toggleTenantStatus(tenantId);
      if (res?.success && res.newStatus) {
        setSuperAdminTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: res.newStatus } : t));
      }
    } catch (err) {
      console.warn('Failed to toggle tenant status', err);
    }
  };

  const handleToggleCurrentClubStatus = () => {
    const nextStatus = clubProfile.tenantStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setClubProfile(prev => ({ ...prev, tenantStatus: nextStatus }));
    setSuperAdminTenants(prev => prev.map(t => t.id === clubProfile.id ? { ...t, status: nextStatus } : t));
  };

  const handleAddTenant = async (tenant: Omit<SuperAdminClubTenant, 'id'>) => {
    try {
      const res = await api.admin.createTenant(tenant);
      if (res?.success && res.tenantId) {
        const newTenantObj: SuperAdminClubTenant = {
          ...tenant,
          id: res.tenantId,
        };
        setSuperAdminTenants(prev => [newTenantObj, ...prev]);
      }
    } catch (err) {
      console.warn('Failed to add tenant', err);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      const res = await api.admin.deleteTenant(tenantId);
      if (res?.success) {
        setSuperAdminTenants(prev => prev.filter(t => t.id !== tenantId));
      }
    } catch (err) {
      console.warn('Failed to delete tenant', err);
    }
  };

  const handleExtendTrial = async (tenantId: string, days: number) => {
    try {
      const res = await api.admin.extendTrial(tenantId, days);
      if (res?.success && res.newRenewalDueDate) {
        setSuperAdminTenants(prev => prev.map(t => {
          if (t.id !== tenantId) return t;
          return { ...t, status: 'ACTIVE', subscriptionDueDate: res.newRenewalDueDate };
        }));
      }
    } catch (err) {
      console.warn('Failed to extend trial', err);
    }
  };

  const handleImpersonateClub = async (tenantId: string) => {
    const tenant = superAdminTenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Save current club profile to backup
    setBackupClubProfile(clubProfile);
    
    // Create temporary club profile for POS
    const impersonatedProfile: ClubProfile = {
      id: tenant.id,
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      whatsapp: tenant.whatsapp,
      city: tenant.city,
      tenantStatus: tenant.status,
      subscriptionDueDate: tenant.subscriptionDueDate,
      totalRevenueThisMonth: tenant.monthlyRevenue,
      logoUrl: '',
      upiId: `${tenant.id.toLowerCase()}@paytm`,
      pincode: '560001',
      monthlyPlanFee: 499,
      renewalDueDate: tenant.subscriptionDueDate,
    };

    localStorage.setItem('justclub_impersonate_club_id', tenant.id);
    setClubProfile(impersonatedProfile);
    setIsImpersonating(true);
    setAppView('pos');
    setCurrentTab('tables'); // start on tables

    // Refresh all POS data with the impersonated tenant's actual DB rows
    await fetchAndPopulateAllData();
  };

  const handleStopImpersonating = async () => {
    localStorage.removeItem('justclub_impersonate_club_id');
    if (backupClubProfile) {
      setClubProfile(backupClubProfile);
      setBackupClubProfile(null);
    }
    setIsImpersonating(false);
    setAppView('superadmin');

    // Restore POS data with the default showcase club's actual DB rows
    await fetchAndPopulateAllData();
  };

  const handleUpdateTenant = async (updated: SuperAdminClubTenant) => {
    setSuperAdminTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (clubProfile.id === updated.id) {
      setClubProfile(prev => ({
        ...prev,
        businessName: updated.businessName,
        ownerName: updated.ownerName,
        whatsapp: updated.whatsapp,
        city: updated.city,
        tenantStatus: updated.status,
        subscriptionDueDate: updated.subscriptionDueDate,
        totalRevenueThisMonth: updated.monthlyRevenue,
      }));
    }
    try {
      await api.admin.updateTenant(updated.id, updated);
    } catch (err) {
      console.warn('Failed to update tenant', err);
    }
  };

  // Derived customer list with live ledgerBalance calculated directly from ledgerEntries
  const effectiveCustomers = useMemo(() => {
    const balanceMap: Record<string, number> = {};

    (ledgerEntries || []).forEach(entry => {
      if (!entry.customerId) return;
      const isDebit = entry.type === 'DEBIT_SESSION' || entry.type === 'DEBIT_BAR';
      const amount = Number(entry.amount) || 0;
      if (!balanceMap[entry.customerId]) {
        balanceMap[entry.customerId] = 0;
      }
      if (isDebit) {
        balanceMap[entry.customerId] -= amount; // negative = debit/due
      } else {
        balanceMap[entry.customerId] += amount; // positive = credit/advance
      }
    });

    return customers.map(c => {
      const hasEntries = (ledgerEntries || []).some(e => e.customerId === c.id);
      const effectiveLedgerBalance = hasEntries ? (balanceMap[c.id] || 0) : (c.ledgerBalance || 0);

      return {
        ...c,
        ledgerBalance: effectiveLedgerBalance
      };
    });
  }, [customers, ledgerEntries]);

  // Calculations for sidebar badges
  const runningSessionsCount = activeSessions.filter(s => s.status === 'running' || s.status === 'paused').length;
  const unpaidCustomersCount = effectiveCustomers.filter(c => c.ledgerBalance < 0).length;
  const atRiskCustomersCount = effectiveCustomers.filter(c => {
    const days = Math.floor((Date.now() - new Date(c.lastVisitedDate).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 31 && days <= 60;
  }).length;
  const totalUnpaidLedgerAmount = effectiveCustomers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);

  const isSuspended = clubProfile.tenantStatus === 'SUSPENDED';
  const isReadOnly = isSuspended || isViewOnly;

  // --- RENDER ROUTING ENGINE ---
  if (window.location.pathname.startsWith('/pay') || window.location.pathname.startsWith('/p/')) {
    return <UpiPayRedirectPage />;
  }

  return (
    <>
      {/* Global Google One Tap Prompt Widget (shows when logged out) */}
      <GoogleOneTapPrompt
        authUser={authUser}
        onGoogleLogin={handleGoogleLogin}
        isDarkMode={isDarkMode}
      />

      {/* GLOBAL LOGIN POPUP MODAL */}
      <LoginPage
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        authUser={authUser}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onNavigateToPos={() => {
          if (authUser) {
            setAppView('pos');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        isDarkMode={isDarkMode}
      />

      {/* VIEW 1: PRODUCT LANDING PAGE */}
      {appView === 'landing' && (
        <LandingPage
          onStartOnboarding={() => setAppView('onboarding')}
          onOpenPosDemo={() => {
            if (authUser) {
              setAppView('pos');
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          authUser={authUser}
          onLogout={handleGoogleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}

      {/* VIEW 2: CLUB ONBOARDING WIZARD */}
      {appView === 'onboarding' && (
        <ClubOnboardingView
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setAppView('landing')}
          authUser={authUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 4: SUPER ADMIN SAAS PORTAL */}
      {appView === 'superadmin' && (
        <SuperAdminGuard authUser={authUser} onUnauthorized={handleSuperAdminUnauthorized}>
          <div className={`h-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
            isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
          }`}>
            <div className="shrink-0">
              <SuperAdminHeaderNavbar
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                onExitSuperAdminPortal={() => setAppView('pos')}
                totalSubscribers={superAdminTenants.filter(t => t.status === 'ACTIVE').length}
                totalSaasMrr={superAdminTenants.filter(t => t.status === 'ACTIVE').reduce((acc, curr) => acc + (curr.monthlyPlanFee || 499), 0)}
              />
            </div>

            <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 overflow-hidden min-h-0 flex flex-col">
              <SuperAdminView
                tenants={superAdminTenants}
                currentProfile={clubProfile}
                onToggleTenantStatus={handleToggleTenantStatus}
                onToggleCurrentClubStatus={handleToggleCurrentClubStatus}
                onAddTenant={handleAddTenant}
                onDeleteTenant={handleDeleteTenant}
                onExtendTrial={handleExtendTrial}
                onImpersonateClub={handleImpersonateClub}
                onUpdateTenant={handleUpdateTenant}
                subscriptionConfig={subscriptionConfig}
                onUpdateSubscriptionConfig={setSubscriptionConfig}
                isDarkMode={isDarkMode}
                onTenantsUpdated={setSuperAdminTenants}
              />
            </main>
          </div>
        </SuperAdminGuard>
      )}

      {/* VIEW 5: BRAND ASSETS & TECHNICAL SPECIFICATION DISPLAY PAGE */}
      {appView === 'brand' && (
        <BrandAssetsView
          onBack={() => setAppView('pos')}
          onNavigateToPOS={() => setAppView('pos')}
        />
      )}

      {/* VIEW 6: CLIENT POS OPERATIONAL DASHBOARD */}
      {appView === 'pos' && (
        <div className={`h-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
          isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
        }`}>
          
          {/* IMPERSONATION INDICATOR BANNER */}
          {isImpersonating && (
            <div className="shrink-0 bg-amber-500 text-slate-950 font-bold text-center py-2 px-4 flex items-center justify-center gap-3 text-xs sm:text-sm animate-pulse shadow-md z-50">
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-slate-950 shrink-0" />
                <span>⚠️ IMPERSONATING MODE: Managing POS for <strong>{clubProfile.businessName}</strong> (Owner: {clubProfile.ownerName})</span>
              </span>
              <button
                onClick={handleStopImpersonating}
                className="bg-slate-950 text-white hover:bg-slate-900 px-3 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase transition shadow-md shrink-0 ml-2"
              >
                Stop Impersonating
              </button>
            </div>
          )}

          {/* Top Header Navbar */}
          <div className="shrink-0">
            <HeaderNavbar
              clubProfile={clubProfile}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              activeSessionsCount={runningSessionsCount}
              totalUnpaidLedgerAmount={totalUnpaidLedgerAmount}
              onOpenMobileMenu={() => setIsMobileOpen(true)}
              onOpenSettings={() => setCurrentTab('setup')}
              onLogout={handlePOSLogout}
              onNavigateToLanding={() => setAppView('landing')}
              onNavigateToOnboarding={() => setAppView('onboarding')}
              onNavigateToLogin={() => setIsLoginModalOpen(true)}
              onNavigateToBrand={() => setAppView('brand')}
              authUser={authUser}
              isSyncing={isSyncing}
              onSyncNow={handleManualSync}
              offlineMode={offlineMode}
              onOpenPWAInstallModal={() => setIsPWAInstallModalOpen(true)}
            />
          </div>

          {/* Main Body Layout with Sidebar + Main View Panel */}
          <div className="flex-1 flex max-w-[1720px] w-full mx-auto overflow-hidden min-h-0">
            
            {/* Navigation Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              activeSessionsCount={runningSessionsCount}
              unpaidCustomersCount={unpaidCustomersCount}
              atRiskCustomersCount={atRiskCustomersCount}
              billsCount={bills.length}
              isMobileOpen={isMobileOpen}
              onCloseMobile={() => setIsMobileOpen(false)}
              isDarkMode={isDarkMode}
            />

            {/* Main Content View Container */}
            <main className="flex-1 p-3 sm:p-5 lg:p-6 2xl:p-8 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8 h-full">
              
              {/* SUSPENDED TENANT LOCKOUT BANNER */}
              {isSuspended && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-5 border rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-red-500/50 text-slate-100' 
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-red-950'}`}>
                          SaaS Subscription Suspended (₹499/mo Overdue)
                        </h2>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-red-600 text-white">
                          POS Locked
                        </span>
                      </div>
                      <p className={`text-xs mt-1 max-w-xl ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                        Tenant status is set to SUSPENDED. New session entry and POS sales are locked. All customer ledgers & historic data are safely retained.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentTab('setup')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Pay with Razorpay
                    </button>
                    <button
                      onClick={handleToggleCurrentClubStatus}
                      className={`px-3 py-2 text-xs rounded-xl border flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Toggle status for testing"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Toggle
                    </button>
                  </div>
                </motion.div>
              )}

              {/* EXPIRED / VIEW ONLY SUBSCRIPTION BANNER */}
              {isViewOnly && !isSuspended && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-5 border rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/50 text-slate-100' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>
                          Free Trial Ended (View-Only Mode)
                        </h2>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500 text-slate-950">
                          Subscribe to Unlock
                        </span>
                      </div>
                      <p className={`text-xs mt-1 max-w-xl ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                        Your free trial or subscription has ended — subscribe to keep using JustClub POS and creating/modifying sessions and items.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentTab('setup')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Subscribe Now
                    </button>
                  </div>
                </motion.div>
              )}

              {/* OFFLINE MODE BANNER */}
              {offlineMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 border rounded-2xl shadow-xl flex items-center justify-between gap-4 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-indigo-500/40 text-slate-100' 
                      : 'bg-indigo-50/80 border-indigo-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${isDarkMode ? 'text-indigo-300' : 'text-indigo-950'}`}>Offline-First Mode Enabled</h4>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>We could not reach the JustClub database. Changes are saved locally and will sync when connection returns.</p>
                    </div>
                  </div>

                  {pendingSyncCount > 0 && (
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${
                      isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    }`}>
                      {pendingSyncCount} {pendingSyncCount === 1 ? 'change' : 'changes'} pending sync
                    </span>
                  )}
                </motion.div>
              )}

              {/* TAB 1: ACTIVE GAME TABLES */}
              {currentTab === 'tables' && (
                <ActiveTablesView
                  assets={gameAssets}
                  activeSessions={activeSessions}
                  customers={effectiveCustomers}
                  barItems={barItems}
                  onStartSession={handleStartSession}
                  onTogglePauseSession={handleTogglePauseSession}
                  onAddBarItemToSession={handleAddBarItemToSession}
                  onOpenSplitBilling={(session) => setSplitModalSession(session)}
                  onAddNewCustomer={handleAddNewCustomer}
                  onSetSessionReminder={handleSetSessionReminder}
                  isDarkMode={isDarkMode}
                  isReadOnly={isReadOnly}
                />
              )}

              {/* TAB 2: BILLS & INVOICES HUB (Dedicated Audit Repository) */}
              {currentTab === 'bills' && (
                <BillsView
                  bills={bills}
                  clubProfile={clubProfile}
                  isDarkMode={isDarkMode}
                  gameAssets={gameAssets}
                  onNavigateToLedger={(customerId) => {
                    setSelectedLedgerCustomerId(customerId);
                    setCurrentTab('ledgers');
                  }}
                />
              )}

              {/* TAB 3: STANDALONE BAR POS */}
              {currentTab === 'bar_pos' && (
                <BarPosTerminal
                  barItems={barItems}
                  customers={effectiveCustomers}
                  upiId={clubProfile.upiId}
                  clubName={clubProfile.businessName}
                  onProcessDirectBarSale={handleProcessDirectBarSale}
                  onAddNewCustomer={handleAddNewCustomer}
                  isDarkMode={isDarkMode}
                  isReadOnly={isReadOnly}
                  onLoadMoreBarItems={handleLoadMoreBarItems}
                  hasMoreBarItems={hasMoreBarItems}
                  isLoadingMoreBarItems={isLoadingMoreBarItems}
                />
              )}

              {/* TAB 4: LEDGERS & DEBTS (Customer Accounts & Statements) */}
              {currentTab === 'ledgers' && (
                <LedgersView
                  customers={effectiveCustomers}
                  ledgerEntries={ledgerEntries}
                  bills={bills}
                  clubProfile={clubProfile}
                  upiId={clubProfile.upiId}
                  clubName={clubProfile.businessName}
                  initialCustomerId={selectedLedgerCustomerId}
                  onSettleCustomerLedger={handleSettleCustomerLedger}
                  onAddNewCustomer={handleAddNewCustomer}
                  isDarkMode={isDarkMode}
                  isReadOnly={isReadOnly}
                  onLoadMore={handleLoadMoreCustomers}
                  hasMore={hasMoreCustomers}
                  isLoadingMore={isLoadingMoreCustomers}
                />
              )}

              {/* TAB 4: ANALYTICS, REVENUE REPORTS & RETENTION */}
              {currentTab === 'analytics' && (
                <AnalyticsView
                  customers={effectiveCustomers}
                  barItems={barItems}
                  gameAssets={gameAssets}
                  clubProfile={clubProfile}
                  bills={bills}
                  ledgerEntries={ledgerEntries}
                  expenses={expenses}
                  onLogExpense={handleLogExpense}
                  onVoidExpense={handleVoidExpense}
                  userRole={authUser?.role || 'club_owner'}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* TAB 5: SETUP & CATALOG CONFIG */}
              {currentTab === 'setup' && (
                <SetupConfigView
                  clubProfile={clubProfile}
                  gameAssets={gameAssets}
                  barItems={barItems}
                  onUpdateClubProfile={handleUpdateClubProfile}
                  onUpdateGameAsset={handleUpdateGameAsset}
                  onAddGameAsset={handleAddGameAsset}
                  onDeleteGameAsset={handleDeleteGameAsset}
                  onUpdateBarItem={handleUpdateBarItem}
                  onAddBarItem={handleAddBarItem}
                  onDeleteBarItem={handleDeleteBarItem}
                  subscriptionConfig={subscriptionConfig}
                  isDarkMode={isDarkMode}
                  onLogout={handlePOSLogout}
                  isReadOnly={isReadOnly}
                  onLoadMoreAssets={handleLoadMoreAssets}
                  hasMoreAssets={hasMoreAssets}
                  isLoadingMoreAssets={isLoadingMoreAssets}
                  onLoadMoreBarItems={handleLoadMoreBarItems}
                  hasMoreBarItems={hasMoreBarItems}
                  isLoadingMoreBarItems={isLoadingMoreBarItems}
                  daysRemaining={daysRemaining}
                  isViewOnly={isViewOnly}
                />
              )}

            </main>
          </div>

          {/* SPLIT BILLING ENGINE MODAL */}
          {splitModalSession && (
            <SplitBillingModal
              isOpen={Boolean(splitModalSession)}
              session={splitModalSession}
              upiId={clubProfile.upiId}
              clubName={clubProfile.businessName}
              onClose={() => setSplitModalSession(null)}
              onConfirmSettlement={handleConfirmSettlement}
              isDarkMode={isDarkMode}
            />
          )}

          {/* FLOATING LEDGER-FIRST CONFIRMATION TOAST */}
          <AnimatePresence>
            {ledgerNotification && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-3 right-3 md:left-auto md:right-5 md:bottom-5 z-30 max-w-md border p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/95 border-indigo-500/40 text-white' 
                    : 'bg-white/95 border-indigo-200 text-slate-900 shadow-indigo-500/10'
                }`}
              >
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {ledgerNotification.message}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {ledgerNotification.subtext}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setCurrentTab('bills');
                      setLedgerNotification(null);
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    View Bill ➔
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('ledgers');
                      setLedgerNotification(null);
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Players
                  </button>
                </div>
                <button
                  onClick={() => setLedgerNotification(null)}
                  className={`p-1 rounded-lg transition ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GLOBAL PWA OFFLINE CONNECTIVITY INDICATOR */}
          <OfflineIndicator />

          {/* PERSISTENT PENDING SYNC COUNT INDICATOR */}
          {pendingSyncCount > 0 && (
            <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-3 md:right-4 md:bottom-4 z-30 flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold shadow-2xl border border-indigo-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>{pendingSyncCount} {pendingSyncCount === 1 ? 'change' : 'changes'} pending sync</span>
            </div>
          )}
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        user={authUser}
        clubName={clubProfile?.businessName}
        isDarkMode={isDarkMode}
      />

      {/* SESSION REMINDER RINGING ALERT MODAL */}
      {ringingReminderSession && (
        <SessionReminderAlertModal
          session={ringingReminderSession}
          onClose={() => setRingingReminderSession(null)}
          onExtendReminder={handleExtendSessionReminder}
          onOpenSplitBilling={(session) => {
            setRingingReminderSession(null);
            setSplitModalSession(session);
          }}
          isDarkMode={isDarkMode}
        />
      )}
      {/* PWA INSTALL GUIDE & DEVICE APP MODAL */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        isDarkMode={isDarkMode}
        appName={clubProfile?.businessName || 'JustClub'}
      />
    </>
  );
}
