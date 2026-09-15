/**
 * justclub — Gaming Club & Lounge Operating Platform (OS V2)
 * Designed in Stripe Dashboard Aesthetics (Dark & Light themes)
 */

import React, { useState, useEffect } from 'react';
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
  AuthUser
} from './types';
import { 
  initialClubProfile, 
  initialGameAssets, 
  initialCustomers, 
  initialBarItems, 
  initialGameSessions, 
  initialSuperAdminTenants 
} from './data/initialData';

import { HeaderNavbar } from './components/HeaderNavbar';
import { SuperAdminHeaderNavbar } from './components/SuperAdminHeaderNavbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ActiveTablesView } from './components/ActiveTablesView';
import { BarPosTerminal } from './components/BarPosTerminal';
import { LedgersView } from './components/LedgersView';
import { RetentionDashboard } from './components/RetentionDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { SetupConfigView } from './components/SetupConfigView';
import { SuperAdminView } from './components/SuperAdminView';
import { SplitBillingModal } from './components/SplitBillingModal';

// New Landing, Onboarding, and Login Views
import { LandingPage } from './components/LandingPage';
import { ClubOnboardingView } from './components/ClubOnboardingView';
import { LoginPage } from './components/LoginPage';
import { GoogleOneTapPrompt } from './components/GoogleOneTapPrompt';

import { ShieldAlert, RefreshCw, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    const saved = localStorage.getItem('club_pos_profile');
    return saved ? JSON.parse(saved) : initialClubProfile;
  });

  const [gameAssets, setGameAssets] = useState<GameAsset[]>(() => {
    const saved = localStorage.getItem('club_pos_assets');
    return saved ? JSON.parse(saved) : initialGameAssets;
  });

  const [customers, setCustomers] = useState<CustomerPlayer[]>(() => {
    const saved = localStorage.getItem('club_pos_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [barItems, setBarItems] = useState<BarItem[]>(() => {
    const saved = localStorage.getItem('club_pos_bar');
    return saved ? JSON.parse(saved) : initialBarItems;
  });

  const [activeSessions, setActiveSessions] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('club_pos_sessions');
    return saved ? JSON.parse(saved) : initialGameSessions;
  });

  const [superAdminTenants, setSuperAdminTenants] = useState<SuperAdminClubTenant[]>(() => {
    const saved = localStorage.getItem('club_pos_tenants');
    return saved ? JSON.parse(saved) : initialSuperAdminTenants;
  });

  // UI View Navigation State inside POS
  const [currentTab, setCurrentTab] = useState<NavTab>('tables');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active Split Billing Modal Session
  const [splitModalSession, setSplitModalSession] = useState<GameSession | null>(null);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('justclub_app_view', appView);
  }, [appView]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('justclub_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('justclub_auth_user');
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('club_pos_profile', JSON.stringify(clubProfile));
  }, [clubProfile]);

  useEffect(() => {
    localStorage.setItem('club_pos_assets', JSON.stringify(gameAssets));
  }, [gameAssets]);

  useEffect(() => {
    localStorage.setItem('club_pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('club_pos_bar', JSON.stringify(barItems));
  }, [barItems]);

  useEffect(() => {
    localStorage.setItem('club_pos_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem('club_pos_tenants', JSON.stringify(superAdminTenants));
  }, [superAdminTenants]);

  // Check URL parameters or hash on initial load for direct portal access
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get('portal') === 'superadmin' || 
      searchParams.get('portal') === 'admin' ||
      window.location.hash === '#admin' || 
      window.location.hash === '#superadmin'
    ) {
      setAppView('superadmin');
    }
  }, []);

  // --- GOOGLE AUTH HANDLERS ---
  const handleGoogleLogin = (partialUser: Partial<AuthUser>) => {
    const fullUser: AuthUser = {
      id: partialUser.id || `usr_g_${Date.now()}`,
      name: partialUser.name || 'Rahul Sharma',
      email: partialUser.email || 'rahul.sharma@gmail.com',
      picture: partialUser.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: partialUser.role || 'club_owner',
      loginProvider: partialUser.loginProvider || 'google_one_tap',
      loggedInAt: new Date().toISOString(),
    };
    setAuthUser(fullUser);

    // Sync user details to active club profile if owner
    setClubProfile(prev => ({
      ...prev,
      ownerName: fullUser.name,
    }));

    if (fullUser.role === 'superadmin') {
      setAppView('superadmin');
    }
  };

  const handleGoogleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your Google account?')) {
      setAuthUser(null);
    }
  };

  const handlePOSLogout = () => {
    if (window.confirm('Are you sure you want to exit the POS session?')) {
      setAppView('landing');
      setCurrentTab('tables');
    }
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
      lastVisitedDate: new Date().toISOString().split('T')[0],
      lifetimeValue: 0,
    };
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
      matchType,
      taggedPlayers,
      startTime: Date.now(),
      pausedAt: null,
      totalPausedDuration: 0,
      attachedBarOrders: [],
      status: 'running',
      endedAt: null,
    };

    setActiveSessions(prev => [newSession, ...prev]);

    // Update asset status to occupied
    setGameAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'occupied' } : a));
  };

  // 3. Pause / Resume Session
  const handleTogglePauseSession = (sessionId: string) => {
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
        updatedOrders.push({
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
        });
      }

      return { ...s, attachedBarOrders: updatedOrders };
    }));
  };

  // 5. Complete & Settle Session (Split Billing Engine result)
  const handleConfirmSettlement = (result: BillSettlementResult) => {
    // A. Update customer ledgers & LTV
    setCustomers(prev => prev.map(cust => {
      const share = result.shares.find(sh => sh.playerId === cust.id);
      if (!share) return cust;

      let newLedger = cust.ledgerBalance;
      if (share.paymentMethod === 'Ledger') {
        newLedger -= share.totalShare; // Add to debit (negative)
      }

      return {
        ...cust,
        ledgerBalance: newLedger,
        totalVisits: cust.totalVisits + 1,
        lastVisitedDate: new Date().toISOString().split('T')[0],
        lifetimeValue: cust.lifetimeValue + share.totalShare,
      };
    }));

    // B. Mark session as completed
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== result.sessionId) return s;
      return {
        ...s,
        status: 'completed',
        endedAt: Date.now(),
      };
    }));

    // C. Reset asset status to available
    const targetSession = activeSessions.find(s => s.id === result.sessionId);
    if (targetSession) {
      setGameAssets(prev => prev.map(a => a.id === targetSession.assetId ? { ...a, status: 'available' } : a));
    }

    // D. Update revenue
    setClubProfile(prev => ({
      ...prev,
      totalRevenueThisMonth: prev.totalRevenueThisMonth + result.grandTotal,
    }));

    setSplitModalSession(null);
  };

  // 6. Process Direct Standalone Bar Sale
  const handleProcessDirectBarSale = (
    items: { item: BarItem; quantity: number }[],
    customer: CustomerPlayer | null,
    paymentMethod: PaymentMethod
  ) => {
    const totalAmount = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

    // Decrement stock
    setBarItems(prev => prev.map(bi => {
      const sold = items.find(i => i.item.id === bi.id);
      if (!sold || bi.stock === null) return bi;
      return { ...bi, stock: Math.max(0, bi.stock - sold.quantity) };
    }));

    // Update customer if tagged
    if (customer) {
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
          lastVisitedDate: new Date().toISOString().split('T')[0],
          lifetimeValue: c.lifetimeValue + totalAmount,
        };
      }));
    }

    setClubProfile(prev => ({
      ...prev,
      totalRevenueThisMonth: prev.totalRevenueThisMonth + totalAmount,
    }));
  };

  // 7. Settle Customer Ledger Debt
  const handleSettleCustomerLedger = (customerId: string, amountCleared: number, method: PaymentMethod) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        ledgerBalance: c.ledgerBalance + amountCleared, // Reduces debit
      };
    }));
  };

  // 8. Super Admin Tenant Status Switcher
  const handleToggleTenantStatus = (tenantId: string) => {
    setSuperAdminTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      
      // If updating current demo club
      if (tenantId === clubProfile.id) {
        setClubProfile(cp => ({ ...cp, tenantStatus: nextStatus }));
      }

      return { ...t, status: nextStatus };
    }));
  };

  const handleToggleCurrentClubStatus = () => {
    const nextStatus = clubProfile.tenantStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setClubProfile(prev => ({ ...prev, tenantStatus: nextStatus }));
    setSuperAdminTenants(prev => prev.map(t => t.id === clubProfile.id ? { ...t, status: nextStatus } : t));
  };

  const handleAddTenant = (tenant: Omit<SuperAdminClubTenant, 'id'>) => {
    const newTenantObj: SuperAdminClubTenant = {
      ...tenant,
      id: `clb_${Date.now().toString().slice(-4)}`,
    };
    setSuperAdminTenants(prev => [newTenantObj, ...prev]);
  };

  const handleDeleteTenant = (tenantId: string) => {
    setSuperAdminTenants(prev => prev.filter(t => t.id !== tenantId));
  };

  const handleExtendTrial = (tenantId: string, days: number) => {
    setSuperAdminTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      return { ...t, status: 'ACTIVE', subscriptionDueDate: '2026-10-30' };
    }));
  };

  // Calculations for sidebar badges
  const runningSessionsCount = activeSessions.filter(s => s.status === 'running' || s.status === 'paused').length;
  const unpaidCustomersCount = customers.filter(c => c.ledgerBalance < 0).length;
  const atRiskCustomersCount = customers.filter(c => {
    const days = Math.floor((Date.now() - new Date(c.lastVisitedDate).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 31 && days <= 60;
  }).length;
  const totalUnpaidLedgerAmount = customers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);

  const isSuspended = clubProfile.tenantStatus === 'SUSPENDED';

  // --- RENDER ROUTING ENGINE ---

  return (
    <>
      {/* Global Google One Tap Prompt Widget (shows when logged out) */}
      <GoogleOneTapPrompt
        authUser={authUser}
        onGoogleLogin={handleGoogleLogin}
        isDarkMode={isDarkMode}
      />

      {/* VIEW 1: PRODUCT LANDING PAGE */}
      {appView === 'landing' && (
        <LandingPage
          onStartOnboarding={() => setAppView('onboarding')}
          onOpenPosDemo={() => setAppView('pos')}
          onOpenLogin={() => setAppView('login')}
          authUser={authUser}
          onLogout={handleGoogleLogout}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 2: CLUB ONBOARDING WIZARD */}
      {appView === 'onboarding' && (
        <ClubOnboardingView
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setAppView('landing')}
          authUser={authUser}
          onOpenLogin={() => setAppView('login')}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 3: LOGIN PAGE (GOOGLE ONE TAP & SSO) */}
      {appView === 'login' && (
        <LoginPage
          authUser={authUser}
          onGoogleLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
          onNavigateToPos={() => setAppView('pos')}
          onNavigateToLanding={() => setAppView('landing')}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 4: SUPER ADMIN SAAS PORTAL */}
      {appView === 'superadmin' && (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
          isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
        }`}>
          <SuperAdminHeaderNavbar
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onExitSuperAdminPortal={() => setAppView('pos')}
            totalSubscribers={superAdminTenants.filter(t => t.status === 'ACTIVE').length}
            totalSaasMrr={superAdminTenants.filter(t => t.status === 'ACTIVE').length * 499}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <SuperAdminView
              tenants={superAdminTenants}
              currentProfile={clubProfile}
              onToggleTenantStatus={handleToggleTenantStatus}
              onToggleCurrentClubStatus={handleToggleCurrentClubStatus}
              onAddTenant={handleAddTenant}
              onDeleteTenant={handleDeleteTenant}
              onExtendTrial={handleExtendTrial}
              isDarkMode={isDarkMode}
            />
          </main>
        </div>
      )}

      {/* VIEW 5: CLIENT POS OPERATIONAL DASHBOARD */}
      {appView === 'pos' && (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
          isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'
        }`}>
          
          {/* Top Header Navbar */}
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
            onNavigateToLogin={() => setAppView('login')}
            authUser={authUser}
          />

          {/* Main Body Layout with Sidebar + Main View Panel */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            
            {/* Navigation Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              activeSessionsCount={runningSessionsCount}
              unpaidCustomersCount={unpaidCustomersCount}
              atRiskCustomersCount={atRiskCustomersCount}
              isMobileOpen={isMobileOpen}
              onCloseMobile={() => setIsMobileOpen(false)}
              isDarkMode={isDarkMode}
              onOpenSuperAdminPortal={() => setAppView('superadmin')}
            />

            {/* Main Content View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
              
              {/* SUSPENDED TENANT LOCKOUT BANNER */}
              {isSuspended && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-500/50 rounded-2xl text-slate-100 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-white">
                          SaaS Subscription Suspended (₹499/mo Overdue)
                        </h2>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-red-500 text-white">
                          POS Locked
                        </span>
                      </div>
                      <p className="text-xs text-red-200 mt-1 max-w-xl">
                        Tenant status is set to SUSPENDED. New session entry and POS sales are locked. All customer ledgers & historic data are safely retained.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentTab('setup')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition shrink-0"
                    >
                      <Sparkles className="w-4 h-4" /> Pay with Cashfree
                    </button>
                    <button
                      onClick={handleToggleCurrentClubStatus}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                      title="Toggle status for testing"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Toggle
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 1: ACTIVE GAME TABLES */}
              {currentTab === 'tables' && (
                <ActiveTablesView
                  assets={gameAssets}
                  activeSessions={activeSessions}
                  customers={customers}
                  barItems={barItems}
                  onStartSession={handleStartSession}
                  onTogglePauseSession={handleTogglePauseSession}
                  onAddBarItemToSession={handleAddBarItemToSession}
                  onOpenSplitBilling={(session) => setSplitModalSession(session)}
                  onAddNewCustomer={handleAddNewCustomer}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* TAB 2: STANDALONE BAR POS */}
              {currentTab === 'bar_pos' && (
                <BarPosTerminal
                  barItems={barItems}
                  customers={customers}
                  upiId={clubProfile.upiId}
                  clubName={clubProfile.businessName}
                  onProcessDirectBarSale={handleProcessDirectBarSale}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* TAB 3: LEDGERS & DEBTS */}
              {currentTab === 'ledgers' && (
                <LedgersView
                  customers={customers}
                  upiId={clubProfile.upiId}
                  clubName={clubProfile.businessName}
                  onSettleCustomerLedger={handleSettleCustomerLedger}
                  onAddNewCustomer={handleAddNewCustomer}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* TAB 4: ANALYTICS, REVENUE REPORTS & RETENTION */}
              {currentTab === 'analytics' && (
                <AnalyticsView
                  customers={customers}
                  barItems={barItems}
                  gameAssets={gameAssets}
                  clubProfile={clubProfile}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* TAB 5: SETUP & CATALOG CONFIG */}
              {currentTab === 'setup' && (
                <SetupConfigView
                  clubProfile={clubProfile}
                  gameAssets={gameAssets}
                  barItems={barItems}
                  onUpdateClubProfile={(updated) => setClubProfile(updated)}
                  onUpdateGameAsset={(asset) => setGameAssets(prev => prev.map(a => a.id === asset.id ? asset : a))}
                  onAddGameAsset={(asset) => setGameAssets(prev => [...prev, { ...asset, id: `ast_${Date.now()}` }])}
                  onDeleteGameAsset={(id) => setGameAssets(prev => prev.filter(a => a.id !== id))}
                  onUpdateBarItem={(item) => setBarItems(prev => prev.map(b => b.id === item.id ? item : b))}
                  onAddBarItem={(item) => setBarItems(prev => [...prev, { ...item, id: `bar_${Date.now()}` }])}
                  onDeleteBarItem={(id) => setBarItems(prev => prev.filter(b => b.id !== id))}
                  isDarkMode={isDarkMode}
                  onOpenSuperAdminPortal={() => setAppView('superadmin')}
                  onLogout={handlePOSLogout}
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
        </div>
      )}
    </>
  );
}
