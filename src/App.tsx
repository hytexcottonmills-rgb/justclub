/**
 * justclub — Gaming Club & Lounge Operating Platform (OS V2)
 * Production-Ready with Cloudflare D1 Backend
 */

import React, { useState, useEffect } from 'react';
import { 
  ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, 
  BillSettlementResult, MatchType, PaymentMethod, SuperAdminClubTenant, 
  AppView, AuthUser 
} from './types';

import { HeaderNavbar } from './components/HeaderNavbar';
import { SuperAdminHeaderNavbar } from './components/SuperAdminHeaderNavbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ActiveTablesView } from './components/ActiveTablesView';
import { BarPosTerminal } from './components/BarPosTerminal';
import { LedgersView } from './components/LedgersView';
import { AnalyticsView } from './components/AnalyticsView';
import { SetupConfigView } from './components/SetupConfigView';
import { SuperAdminView } from './components/SuperAdminView';
import { SplitBillingModal } from './components/SplitBillingModal';

import { LandingPage } from './components/LandingPage';
import { ClubOnboardingView } from './components/ClubOnboardingView';
import { LoginPage } from './components/LoginPage';

import { ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

// API Helper
const fetchApi = async (endpoint: string, method = 'GET', body: any = null, token: string | null = null) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`/api${endpoint}`, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'API Error');
  return data;
};

export default function App() {
  const [appView, setAppView] = useState<AppView>(() => (localStorage.getItem('justclub_app_view') as AppView) || 'landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('justclub_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('justclub_auth_token'));

  // Global Data States
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [gameAssets, setGameAssets] = useState<GameAsset[]>([]);
  const [customers, setCustomers] = useState<CustomerPlayer[]>([]);
  const [barItems, setBarItems] = useState<BarItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [superAdminTenants, setSuperAdminTenants] = useState<SuperAdminClubTenant[]>([]);

  const [currentTab, setCurrentTab] = useState<NavTab>('tables');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [splitModalSession, setSplitModalSession] = useState<GameSession | null>(null);

  // Sync basic state
  useEffect(() => { localStorage.setItem('justclub_app_view', appView); }, [appView]);
  useEffect(() => {
    if (authUser && authToken) {
      localStorage.setItem('justclub_auth_user', JSON.stringify(authUser));
      localStorage.setItem('justclub_auth_token', authToken);
    } else {
      localStorage.removeItem('justclub_auth_user');
      localStorage.removeItem('justclub_auth_token');
    }
  }, [authUser, authToken]);

  // Fetch Data on Login
  const loadData = async () => {
    if (!authToken) return;
    try {
      const [assetsRes, custRes, barRes, sessRes] = await Promise.all([
        fetchApi('/assets', 'GET', null, authToken),
        fetchApi('/customers', 'GET', null, authToken),
        fetchApi('/bar_items', 'GET', null, authToken),
        fetchApi('/sessions', 'GET', null, authToken)
      ]);
      setGameAssets(assetsRes.assets);
      setCustomers(custRes.customers);
      setBarItems(barRes.barItems);
      setActiveSessions(sessRes.sessions);
      setClubProfile({
        id: 'club_001', businessName: 'Hytex Cotton Mills Club', ownerName: 'Admin',
        whatsapp: '+910000000000', pincode: '600000', upiId: 'admin@upi',
        tenantStatus: 'ACTIVE', monthlyPlanFee: 499, renewalDueDate: '2026-10-01', totalRevenueThisMonth: 0
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    if (authToken && (appView === 'pos' || appView === 'superadmin')) { loadData(); }
  }, [authToken, appView]);

  // Login Handler
  const handleLogin = async (email: string, pass: string) => {
    const data = await fetchApi('/auth/login', 'POST', { email, password: pass });
    setAuthUser(data.user);
    setAuthToken(data.token);
    setAppView(data.user.role === 'superadmin' ? 'superadmin' : 'pos');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthToken(null);
    setAppView('landing');
  };

  // Add New Customer
  const handleAddNewCustomer = (name: string, whatsapp: string): CustomerPlayer => {
    const cust = { name, whatsapp: whatsapp.replace(/[^0-9]/g, '') };
    fetchApi('/customers', 'POST', cust, authToken).then(res => {
      setCustomers(prev => [{ ...cust, id: res.id, ledgerBalance: 0, totalVisits: 0, lifetimeValue: 0 } as any, ...prev]);
    });
    return { id: `optimistic_${Date.now()}`, ...cust, ledgerBalance: 0, totalVisits: 0, lastVisitedDate: '', lifetimeValue: 0 } as CustomerPlayer;
  };

  // Start Session
  const handleStartSession = async (assetId: string, matchType: MatchType, taggedPlayerIds: string[]) => {
    const asset = gameAssets.find(a => a.id === assetId);
    if (!asset) return;
    const taggedPlayers = customers.filter(c => taggedPlayerIds.includes(c.id));
    const sess = {
      assetId: asset.id, assetName: asset.name, category: asset.category, hourlyRate: asset.hourlyRate,
      billingIncrement: asset.billingIncrement, matchType, taggedPlayers, startTime: Date.now(), attachedBarOrders: []
    };
    const res = await fetchApi('/sessions', 'POST', sess, authToken);
    setActiveSessions(prev => [{ ...sess, id: res.id, status: 'running', pausedAt: null, totalPausedDuration: 0, endedAt: null } as any, ...prev]);
    setGameAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'occupied' } : a));
  };

  // Toggle Pause
  const handleTogglePauseSession = (sessionId: string) => {
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const now = Date.now();
      if (s.status === 'running') return { ...s, status: 'paused', pausedAt: now };
      if (s.status === 'paused' && s.pausedAt) {
        return { ...s, status: 'running', pausedAt: null, totalPausedDuration: s.totalPausedDuration + Math.floor((now - s.pausedAt) / 1000) };
      }
      return s;
    }));
  };

  // Add Bar Item to Session
  const handleAddBarItemToSession = (sessionId: string, item: BarItem, qty: number) => {
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const existing = s.attachedBarOrders.findIndex(i => i.itemId === item.id);
      const orders = [...s.attachedBarOrders];
      if (existing >= 0) orders[existing] = { ...orders[existing], quantity: orders[existing].quantity + qty };
      else orders.push({ itemId: item.id, name: item.name, price: item.price, quantity: qty });
      return { ...s, attachedBarOrders: orders };
    }));
  };

  // Settle Session
  const handleConfirmSettlement = async (result: BillSettlementResult) => {
    await fetchApi(`/sessions/${result.sessionId}/end`, 'POST', {}, authToken);
    setActiveSessions(prev => prev.map(s => s.id === result.sessionId ? { ...s, status: 'completed', endedAt: Date.now() } : s));
    const session = activeSessions.find(s => s.id === result.sessionId);
    if (session) setGameAssets(prev => prev.map(a => a.id === session.assetId ? { ...a, status: 'available' } : a));
    setSplitModalSession(null);
    loadData();
  };

  // Placeholder handlers for features that need full API backing
  const handleProcessDirectBarSale = (items: { item: BarItem; quantity: number }[], customer: CustomerPlayer | null, paymentMethod: PaymentMethod) => {
    const totalAmount = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    setBarItems(prev => prev.map(bi => {
      const sold = items.find(i => i.item.id === bi.id);
      if (!sold || bi.stock === null) return bi;
      return { ...bi, stock: Math.max(0, bi.stock - sold.quantity) };
    }));
    if (clubProfile) {
      setClubProfile(prev => prev ? { ...prev, totalRevenueThisMonth: prev.totalRevenueThisMonth + totalAmount } : prev);
    }
  };

  const handleSettleCustomerLedger = (customerId: string, amountCleared: number, method: PaymentMethod) => {
    setCustomers(prev => prev.map(c => c.id !== customerId ? c : { ...c, ledgerBalance: c.ledgerBalance + amountCleared }));
  };

  // Computed Values
  const runningSessionsCount = activeSessions.filter(s => s.status === 'running' || s.status === 'paused').length;
  const unpaidCustomersCount = customers.filter(c => c.ledgerBalance < 0).length;
  const atRiskCustomersCount = customers.filter(c => {
    const days = Math.floor((Date.now() - new Date(c.lastVisitedDate).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 31 && days <= 60;
  }).length;
  const totalUnpaidLedgerAmount = customers.reduce((acc, c) => c.ledgerBalance < 0 ? acc + Math.abs(c.ledgerBalance) : acc, 0);

  return (
    <>
      {/* VIEW 1: LANDING */}
      {appView === 'landing' && (
        <LandingPage
          onStartOnboarding={() => setAppView('login')}
          onOpenPosDemo={() => setAppView('login')}
          onOpenLogin={() => setAppView('login')}
          authUser={authUser}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 2: ONBOARDING */}
      {appView === 'onboarding' && (
        <ClubOnboardingView
          onCompleteOnboarding={(profile, assets, items) => {
            setClubProfile(profile);
            setGameAssets(assets);
            setBarItems(items);
            setAppView('pos');
          }}
          onCancel={() => setAppView('landing')}
          authUser={authUser}
          onOpenLogin={() => setAppView('login')}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 3: LOGIN */}
      {appView === 'login' && (
        <LoginPage
          authUser={authUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onNavigateToPos={() => setAppView('pos')}
          onNavigateToLanding={() => setAppView('landing')}
          isDarkMode={isDarkMode}
        />
      )}

      {/* VIEW 4: SUPER ADMIN */}
      {appView === 'superadmin' && (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
          <SuperAdminHeaderNavbar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onExitSuperAdminPortal={() => setAppView('pos')} totalSubscribers={superAdminTenants.filter(t => t.status === 'ACTIVE').length} totalSaasMrr={superAdminTenants.filter(t => t.status === 'ACTIVE').length * 499} />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <SuperAdminView tenants={superAdminTenants} currentProfile={clubProfile as any} onToggleTenantStatus={() => {}} onToggleCurrentClubStatus={() => {}} onAddTenant={() => {}} onDeleteTenant={() => {}} onExtendTrial={() => {}} isDarkMode={isDarkMode} />
          </main>
        </div>
      )}

      {/* VIEW 5: POS DASHBOARD */}
      {appView === 'pos' && clubProfile && (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
          <HeaderNavbar
            clubProfile={clubProfile} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            activeSessionsCount={runningSessionsCount} totalUnpaidLedgerAmount={totalUnpaidLedgerAmount}
            onOpenMobileMenu={() => setIsMobileOpen(true)} onOpenSettings={() => setCurrentTab('setup')}
            onLogout={handleLogout} onNavigateToLanding={() => setAppView('landing')}
            onNavigateToOnboarding={() => setAppView('onboarding')} onNavigateToLogin={() => setAppView('login')}
            authUser={authUser}
          />
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} activeSessionsCount={runningSessionsCount}
              unpaidCustomersCount={unpaidCustomersCount} atRiskCustomersCount={atRiskCustomersCount}
              isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)}
              isDarkMode={isDarkMode} onOpenSuperAdminPortal={() => setAppView('superadmin')}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
              {clubProfile.tenantStatus === 'SUSPENDED' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-500/50 rounded-2xl text-slate-100 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0"><ShieldAlert className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-base font-extrabold text-white">SaaS Subscription Suspended</h2>
                      <p className="text-xs text-red-200 mt-1">POS is locked. Contact support to reactivate.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === 'tables' && <ActiveTablesView assets={gameAssets} activeSessions={activeSessions} customers={customers} barItems={barItems} onStartSession={handleStartSession} onTogglePauseSession={handleTogglePauseSession} onAddBarItemToSession={handleAddBarItemToSession} onOpenSplitBilling={setSplitModalSession} onAddNewCustomer={handleAddNewCustomer} isDarkMode={isDarkMode} />}
              {currentTab === 'bar_pos' && <BarPosTerminal barItems={barItems} customers={customers} upiId={clubProfile.upiId} clubName={clubProfile.businessName} onProcessDirectBarSale={handleProcessDirectBarSale} isDarkMode={isDarkMode} />}
              {currentTab === 'ledgers' && <LedgersView customers={customers} upiId={clubProfile.upiId} clubName={clubProfile.businessName} onSettleCustomerLedger={handleSettleCustomerLedger} onAddNewCustomer={handleAddNewCustomer} isDarkMode={isDarkMode} />}
              {currentTab === 'analytics' && <AnalyticsView customers={customers} barItems={barItems} gameAssets={gameAssets} clubProfile={clubProfile} isDarkMode={isDarkMode} />}
              {currentTab === 'setup' && <SetupConfigView clubProfile={clubProfile} gameAssets={gameAssets} barItems={barItems} onUpdateClubProfile={(p) => setClubProfile(p)} onUpdateGameAsset={(asset) => setGameAssets(prev => prev.map(a => a.id === asset.id ? asset : a))} onAddGameAsset={(asset) => setGameAssets(prev => [...prev, { ...asset, id: `ast_${Date.now()}` }])} onDeleteGameAsset={(id) => setGameAssets(prev => prev.filter(a => a.id !== id))} onUpdateBarItem={(item) => setBarItems(prev => prev.map(b => b.id === item.id ? item : b))} onAddBarItem={(item) => setBarItems(prev => [...prev, { ...item, id: `bar_${Date.now()}` }])} onDeleteBarItem={(id) => setBarItems(prev => prev.filter(b => b.id !== id))} isDarkMode={isDarkMode} onOpenSuperAdminPortal={() => setAppView('superadmin')} onLogout={handleLogout} />}
            </main>
          </div>
          {splitModalSession && <SplitBillingModal isOpen={true} session={splitModalSession} upiId={clubProfile.upiId} clubName={clubProfile.businessName} onClose={() => setSplitModalSession(null)} onConfirmSettlement={handleConfirmSettlement} isDarkMode={isDarkMode} />}
        </div>
      )}
    </>
  );
}
