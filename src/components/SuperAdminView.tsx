import React, { useState } from 'react';
import { SuperAdminClubTenant, ClubProfile } from '../types';
import { 
  Crown, 
  ShieldAlert, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Send,
  Bell,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Tag,
  Users,
  Database,
  Server,
  Key,
  ChevronRight,
  X,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JustClubLogo, JustClubIcon } from './JustClubLogo';

interface SuperAdminViewProps {
  tenants: SuperAdminClubTenant[];
  currentProfile: ClubProfile;
  onToggleTenantStatus: (tenantId: string) => void;
  onToggleCurrentClubStatus: () => void;
  onAddTenant?: (tenant: Omit<SuperAdminClubTenant, 'id'>) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onExtendTrial?: (tenantId: string, days: number) => void;
  onLogManualPayment?: (tenantId: string, planName: string, amount: number) => void;
  isDarkMode?: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validUntil: string;
  usesCount: number;
  maxUses: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetTenant: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tenants: initialTenants,
  currentProfile,
  onToggleTenantStatus,
  onToggleCurrentClubStatus,
  onAddTenant,
  onDeleteTenant,
  onExtendTrial,
  onLogManualPayment,
  isDarkMode = true,
}) => {
  // Local state to support rich actions
  const [tenants, setTenants] = useState<SuperAdminClubTenant[]>(initialTenants);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'plans' | 'cashfree' | 'broadcast' | 'logs'>('overview');
  
  // Cashfree Payment Gateway Super Admin Config State
  const [cfEnvironment, setCfEnvironment] = useState<'TEST' | 'PRODUCTION'>('TEST');
  const [cfTestAppId, setCfTestAppId] = useState('TEST1029384756');
  const [cfTestSecretKey, setCfTestSecretKey] = useState('cfsk_ma_test_sample_secret_key');
  const [cfLiveAppId, setCfLiveAppId] = useState('');
  const [cfLiveSecretKey, setCfLiveSecretKey] = useState('');
  const [cfIsEnabled, setCfIsEnabled] = useState(true);
  const [cfWebhookSecret, setCfWebhookSecret] = useState('cf_wh_sec_sample_key_99');
  
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [cfTestTesting, setCfTestTesting] = useState(false);
  const [cfTestResult, setCfTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Simulated live Cashfree subscription transactions
  const [cashfreeTransactions, setCashfreeTransactions] = useState([
    {
      orderId: 'order_cf_992182',
      tenantName: 'Imperial Snooker & Pool Hub',
      planName: '3-Month Plan',
      amount: 1299,
      status: 'PAID',
      method: 'UPI (GPay)',
      timestamp: '2026-09-15 14:30:12',
      cfPaymentId: 'cf_pay_9018274',
    },
    {
      orderId: 'order_cf_884102',
      tenantName: 'Velocity VR Arena',
      planName: 'Yearly Plan',
      amount: 4499,
      status: 'PAID',
      method: 'Credit Card (HDFC)',
      timestamp: '2026-09-14 11:20:45',
      cfPaymentId: 'cf_pay_7726310',
    },
    {
      orderId: 'order_cf_771029',
      tenantName: 'Apex Cue Club',
      planName: 'Monthly Plan',
      amount: 499,
      status: 'PAID',
      method: 'Net Banking (ICICI)',
      timestamp: '2026-09-12 18:05:00',
      cfPaymentId: 'cf_pay_6619023',
    },
  ]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  
  // Modals & Action States
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newCity, setNewCity] = useState('');

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: 'pc_1', code: 'JUSTCLUB50', discountPercent: 50, validUntil: '2026-12-31', usesCount: 14, maxUses: 100 },
    { id: 'pc_2', code: 'EARLYBIRD20', discountPercent: 20, validUntil: '2026-10-15', usesCount: 42, maxUses: 50 },
    { id: 'pc_3', code: 'FREEMONTH', discountPercent: 100, validUntil: '2026-09-30', usesCount: 8, maxUses: 20 },
  ]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(20);

  // Global Broadcast Message State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(
    '⚡ System Maintenance Notice: Scheduled database optimization tonight at 02:00 AM IST. All POS data is backed up.'
  );

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log_101',
      timestamp: '2026-09-15 14:22:10',
      adminEmail: 'superadmin@justclub.in',
      action: 'Tenant Reactivation',
      targetTenant: 'Imperial Snooker Lounge',
      severity: 'success',
    },
    {
      id: 'log_102',
      timestamp: '2026-09-15 12:05:40',
      adminEmail: 'superadmin@justclub.in',
      action: '15-Day Trial Extension Granted',
      targetTenant: 'Apex Cue Club',
      severity: 'info',
    },
    {
      id: 'log_103',
      timestamp: '2026-09-15 09:15:02',
      adminEmail: 'system-bot',
      action: 'Automatic Subscription Expiry Warning Sent',
      targetTenant: 'Velocity VR Arena',
      severity: 'warning',
    },
  ]);

  // Action feedback alert
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Metrics Calculations
  const activeTenantsCount = tenants.filter(t => t.status === 'ACTIVE').length;
  const totalSubRevenue = activeTenantsCount * 499; // Base MRR ₹499
  const arrProjection = totalSubRevenue * 12;
  const totalClubsRevenue = tenants.reduce((acc, t) => acc + t.monthlyRevenue, 0);
  const totalAssetsCount = tenants.reduce((acc, t) => acc + t.activeAssetsCount, 0);

  // Filtered Tenants List
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleToggleTenant = (id: string) => {
    onToggleTenantStatus(id);
    setTenants(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      return { ...t, status: nextStatus };
    }));
    
    const target = tenants.find(t => t.id === id);
    showAlert(`Tenant status for "${target?.businessName || id}" updated.`);

    // Log to Audit Log
    setAuditLogs(prev => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        adminEmail: 'superadmin@justclub.in',
        action: target?.status === 'ACTIVE' ? 'Tenant Suspended' : 'Tenant Activated',
        targetTenant: target?.businessName || id,
        severity: target?.status === 'ACTIVE' ? 'warning' : 'success',
      },
      ...prev,
    ]);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName || !newOwnerName) return;

    const newTenant: SuperAdminClubTenant = {
      id: `clb_${Date.now().toString().slice(-4)}`,
      businessName: newClubName,
      ownerName: newOwnerName,
      whatsapp: newWhatsapp || '9876543210',
      city: newCity || 'Mumbai',
      status: 'ACTIVE',
      subscriptionDueDate: '2026-10-15',
      activeAssetsCount: 4,
      monthlyRevenue: 25000,
    };

    setTenants(prev => [newTenant, ...prev]);
    if (onAddTenant) onAddTenant(newTenant);
    
    setNewClubName('');
    setNewOwnerName('');
    setNewWhatsapp('');
    setNewCity('');
    setIsAddTenantModalOpen(false);
    showAlert(`Successfully onboarded "${newTenant.businessName}"!`);
  };

  const handleExtendTrialAction = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      return { ...t, status: 'ACTIVE', subscriptionDueDate: '2026-10-30' };
    }));
    if (onExtendTrial) onExtendTrial(tenantId, 15);
    const target = tenants.find(t => t.id === tenantId);
    showAlert(`Granted +15 Days Free Trial to ${target?.businessName}!`);
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    const codeObj: PromoCode = {
      id: `pc_${Date.now()}`,
      code: newPromoCode.toUpperCase(),
      discountPercent: newPromoDiscount,
      validUntil: '2026-12-31',
      usesCount: 0,
      maxUses: 50,
    };
    setPromoCodes(prev => [codeObj, ...prev]);
    setNewPromoCode('');
    showAlert(`Promo code "${codeObj.code}" (${newPromoDiscount}% OFF) created!`);
  };

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setActiveBroadcast(broadcastMessage);
    setBroadcastMessage('');
    showAlert('Broadcast announcement published live to all Club POS terminals!');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SAAS MASTER HERO BANNER */}
      <div className={`p-6 border rounded-3xl shadow-2xl relative overflow-hidden ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-purple-500/30'
          : 'bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 border-purple-300 text-white'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <JustClubIcon size="xl" className="mt-1 shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md">
                  <Crown className="w-3.5 h-3.5" /> Super Admin Control Hub
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.4 Production Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>justclub SaaS Multi-Tenant Engine</span>
              </h1>
              <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                Master control panel for onboarding gaming clubs across India, managing subscription cycles (Monthly ₹499, Quarterly ₹1,299, Yearly ₹4,499), remote tenant locks, and global announcements.
              </p>
            </div>
          </div>

          {/* Quick Metrics KPI Box */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total SaaS MRR</span>
              <div className="text-xl font-black font-mono text-emerald-400">
                ₹{totalSubRevenue.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ARR Projection</span>
              <div className="text-xl font-black font-mono text-indigo-400">
                ₹{arrProjection.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionAlert && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Broadcast Notice */}
      {activeBroadcast && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-semibold">Live POS Broadcast: <span className="font-normal">{activeBroadcast}</span></span>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="text-xs underline hover:no-underline text-amber-400 font-bold shrink-0"
          >
            Clear Broadcast
          </button>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Telemetry & Overview
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'tenants'
              ? 'bg-purple-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> Club Tenant Directory ({tenants.length})
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'plans'
              ? 'bg-purple-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-400" /> Subscription Tiers & Promos
        </button>

        <button
          onClick={() => setActiveTab('cashfree')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'cashfree'
              ? 'bg-emerald-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" /> Cashfree Gateway Setup
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-purple-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4" /> Global Broadcast Engine
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" /> Audit & System Logs
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & SYSTEM TELEMETRY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className={`p-5 rounded-2xl border shadow-lg ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Active Tenant Clubs</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-mono mb-1">{activeTenantsCount} / {tenants.length}</div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 100% Platform Uptime
              </div>
            </div>

            {/* Card 2 */}
            <div className={`p-5 rounded-2xl border shadow-lg ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Total SaaS MRR</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono mb-1">
                ₹{totalSubRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Billed automatically every month</div>
            </div>

            {/* Card 3 */}
            <div className={`p-5 rounded-2xl border shadow-lg ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Total Club Turnovers</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-indigo-400 font-mono mb-1">
                ₹{totalClubsRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400">Processed across all tenant POS</div>
            </div>

            {/* Card 4 */}
            <div className={`p-5 rounded-2xl border shadow-lg ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Managed Game Assets</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono mb-1">{totalAssetsCount}</div>
              <div className="text-[11px] text-slate-400">Active Billiards, PS5, PC & VR tables</div>
            </div>
          </div>

          {/* System Telemetry & Quick Tenant Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Health Panel */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}>
              <h2 className="text-base font-bold flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Platform Services Telemetry Status
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">● Operational</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Nginx Reverse Proxy Gateway</div>
                    <div className="text-[10px] text-slate-400">Port 3000 Ingress Routing</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">2 ms</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">WhatsApp Webhook Gateway</div>
                    <div className="text-[10px] text-slate-400">Dynamic UPI Receipt Delivery</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">99.9%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Isolated Tenant Storage Engine</div>
                    <div className="text-[10px] text-slate-400">JSON Ledger & Audit Logs</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Encrypted</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Multi-Tenant Billing Microservice</div>
                    <div className="text-[10px] text-slate-400">1v1, 2v2 Split Billing Engine</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Active</span>
                </div>
              </div>
            </div>

            {/* Live Demo Tenant Status Switcher */}
            <div className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}>
              <h2 className="text-base font-bold pb-3 border-b border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" /> Demo Club Lock Simulation
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate suspending your current active demo club (<strong>{currentProfile.businessName}</strong>) to test the locked POS banner.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="text-slate-400">Current Status:</div>
                <div className={`font-mono font-bold text-sm ${
                  currentProfile.tenantStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {currentProfile.tenantStatus}
                </div>
              </div>

              <button
                onClick={onToggleCurrentClubStatus}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  currentProfile.tenantStatus === 'ACTIVE'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {currentProfile.tenantStatus === 'ACTIVE' ? 'Simulate Failure (SUSPEND POS)' : 'Reactivate Tenant (ACTIVE)'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CLUB TENANT DIRECTORY & MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search + Filters + Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search club name, owner, city, or ID..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white'
                      : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}

              <button
                onClick={() => setIsAddTenantModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Onboard New Club
              </button>
            </div>
          </div>

          {/* Tenants Table */}
          <div className={`border rounded-2xl overflow-hidden shadow-xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <th className="p-4">Club Name & City</th>
                    <th className="p-4">Owner & Phone</th>
                    <th className="p-4">Assets Count</th>
                    <th className="p-4">Monthly POS Turnover</th>
                    <th className="p-4">Status & Renewal</th>
                    <th className="p-4 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                  {filteredTenants.length > 0 ? (
                    filteredTenants.map(tenant => {
                      const isSuspended = tenant.status === 'SUSPENDED';
                      return (
                        <tr key={tenant.id} className={`transition ${
                          isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}>
                          <td className="p-4">
                            <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tenant.businessName}</div>
                            <div className="text-[11px] text-slate-400">{tenant.city} • ID: {tenant.id}</div>
                          </td>

                          <td className="p-4">
                            <div className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{tenant.ownerName}</div>
                            <div className="font-mono text-[11px] text-slate-400">+{tenant.whatsapp}</div>
                          </td>

                          <td className="p-4 font-mono font-bold text-indigo-400">
                            {tenant.activeAssetsCount} Tables/Consoles
                          </td>

                          <td className="p-4 font-mono text-emerald-400 font-bold">
                            ₹{tenant.monthlyRevenue.toLocaleString('en-IN')}
                          </td>

                          <td className="p-4">
                            {isSuspended ? (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> SUSPENDED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE (₹499/mo)
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500 mt-1">Due: {tenant.subscriptionDueDate}</div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Extend Trial */}
                              <button
                                onClick={() => handleExtendTrialAction(tenant.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
                                title="Grant +15 Days Free Trial"
                              >
                                +15d Trial
                              </button>

                              {/* Toggle Suspend/Active */}
                              <button
                                onClick={() => handleToggleTenant(tenant.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {isSuspended ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        No clubs found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SUBSCRIPTION TIERS & PROMO CODES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          
          {/* Active 3 Subscription Tiers Cards */}
          <div>
            <h2 className="text-base font-bold text-white mb-3">Managed Platform Subscription Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Monthly Tier */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase">Tier 1 • Monthly</span>
                <div className="text-3xl font-black text-white font-mono">₹499 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-400">Standard flexible monthly billing with 15-day free trial.</p>
                <div className="text-[11px] font-mono text-emerald-400 font-bold">Active Subscribers: 82 Clubs</div>
              </div>

              {/* Quarterly Tier */}
              <div className="p-6 rounded-2xl bg-slate-900 border-2 border-indigo-500 space-y-3 relative shadow-xl">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full">
                  13% Discount
                </span>
                <span className="text-xs font-extrabold text-indigo-400 uppercase">Tier 2 • 3-Month Plan</span>
                <div className="text-3xl font-black text-white font-mono">₹1,299 <span className="text-xs font-normal text-slate-400">/ 3 mo</span></div>
                <p className="text-xs text-slate-400">Quarterly billing with ₹198 savings per quarter.</p>
                <div className="text-[11px] font-mono text-indigo-400 font-bold">Active Subscribers: 48 Clubs</div>
              </div>

              {/* Yearly Tier */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white text-[9px] font-black uppercase rounded-full">
                  25% Discount
                </span>
                <span className="text-xs font-extrabold text-purple-400 uppercase">Tier 3 • Yearly Plan</span>
                <div className="text-3xl font-black text-white font-mono">₹4,499 <span className="text-xs font-normal text-slate-400">/ yr</span></div>
                <p className="text-xs text-slate-400">Annual billing with 2 months free (₹1,489 savings).</p>
                <div className="text-[11px] font-mono text-purple-400 font-bold">Active Subscribers: 24 Clubs</div>
              </div>

            </div>
          </div>

          {/* Promo Code Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Promo Code Form */}
            <form onSubmit={handleCreatePromoCode} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" /> Create Custom Promo Code
              </h3>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Coupon Code Name</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER50"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  placeholder="20"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                Publish Coupon Code
              </button>
            </form>

            {/* Active Promo Codes List */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm">Active Marketing Coupons</h3>
              <div className="space-y-3">
                {promoCodes.map(pc => (
                  <div key={pc.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                        {pc.code}
                      </span>
                      <div>
                        <div className="font-bold text-white">{pc.discountPercent}% OFF Entire Subscription</div>
                        <div className="text-[10px] text-slate-400">Valid until {pc.validUntil}</div>
                      </div>
                    </div>

                    <div className="font-mono text-slate-400 text-xs">
                      {pc.usesCount} / {pc.maxUses} Redeemed
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3.5: CASHFREE PAYMENT GATEWAY CONFIGURATION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cashfree' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    Cashfree Payment Gateway Integration
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      V3 API Compliant
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Configure Sandbox & Production App Credentials for Client Subscription Payments</p>
                </div>
              </div>

              {/* Enable / Disable Gateway Toggle */}
              <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Gateway Status</span>
                <button
                  type="button"
                  onClick={() => {
                    setCfIsEnabled(!cfIsEnabled);
                    showAlert(`Cashfree Gateway ${!cfIsEnabled ? 'Enabled' : 'Disabled'}`);
                  }}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-lg transition ${
                    cfIsEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {cfIsEnabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-red-400" />}
                  <span>{cfIsEnabled ? 'ACTIVE' : 'DISABLED'}</span>
                </button>
              </div>
            </div>

            {/* Test / Production Mode Selector */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> API Target Environment
                </div>
                <div className="text-[11px] text-slate-400">Switch between Cashfree Test Sandbox and Live Production endpoints.</div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setCfEnvironment('TEST')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cfEnvironment === 'TEST'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  TEST (Sandbox)
                </button>

                <button
                  type="button"
                  onClick={() => setCfEnvironment('PRODUCTION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cfEnvironment === 'PRODUCTION'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PRODUCTION (Live)
                </button>
              </div>
            </div>

            {/* Credentials Forms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Test Credentials Box */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                cfEnvironment === 'TEST' ? 'bg-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5' : 'bg-slate-950/60 border-slate-800 opacity-80'
              }`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="font-extrabold text-sm text-white">Sandbox / Test Credentials</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">sandbox.cashfree.com</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Test Client App ID *</label>
                    <input
                      type="text"
                      value={cfTestAppId}
                      onChange={(e) => setCfTestAppId(e.target.value)}
                      placeholder="e.g. TEST1029384756..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Test Secret Key *</label>
                    <div className="relative">
                      <input
                        type={showTestSecret ? 'text' : 'password'}
                        value={cfTestSecretKey}
                        onChange={(e) => setCfTestSecretKey(e.target.value)}
                        placeholder="cfsk_ma_test_..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTestSecret(!showTestSecret)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showTestSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Credentials Box */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                cfEnvironment === 'PRODUCTION' ? 'bg-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/60 border-slate-800 opacity-80'
              }`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h3 className="font-extrabold text-sm text-white">Production / Live Credentials</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">api.cashfree.com</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Live Client App ID *</label>
                    <input
                      type="text"
                      value={cfLiveAppId}
                      onChange={(e) => setCfLiveAppId(e.target.value)}
                      placeholder="e.g. 284710293847..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Live Secret Key *</label>
                    <div className="relative">
                      <input
                        type={showLiveSecret ? 'text' : 'password'}
                        value={cfLiveSecretKey}
                        onChange={(e) => setCfLiveSecretKey(e.target.value)}
                        placeholder="cfsk_ma_prod_..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLiveSecret(!showLiveSecret)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showLiveSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Webhook Secret & Action Controls */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-slate-300">Cashfree Webhook Endpoint & Secret</label>
                <div className="text-[11px] font-mono text-indigo-400 font-semibold truncate">
                  POST https://justclub.in/api/cashfree/webhook
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  disabled={cfTestTesting}
                  onClick={async () => {
                    setCfTestTesting(true);
                    setCfTestResult(null);
                    try {
                      const res = await fetch('/api/cashfree/test-connection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          environment: cfEnvironment,
                          appId: cfEnvironment === 'PRODUCTION' ? cfLiveAppId : cfTestAppId,
                          secretKey: cfEnvironment === 'PRODUCTION' ? cfLiveSecretKey : cfTestSecretKey,
                        }),
                      });
                      const data = await res.json();
                      setCfTestResult(data);
                      if (data.success) {
                        showAlert(data.message);
                      } else {
                        showAlert(`Connection failed: ${data.error}`);
                      }
                    } catch (e: any) {
                      setCfTestResult({ success: false, message: e.message });
                    } finally {
                      setCfTestTesting(false);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cfTestTesting ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/cashfree/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          environment: cfEnvironment,
                          testAppId: cfTestAppId,
                          testSecretKey: cfTestSecretKey,
                          liveAppId: cfLiveAppId,
                          liveSecretKey: cfLiveSecretKey,
                          isEnabled: cfIsEnabled,
                          webhookSecret: cfWebhookSecret,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        showAlert('Cashfree credentials saved & updated on full-stack server!');
                      }
                    } catch (e) {
                      showAlert('Saved locally to admin session state.');
                    }
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                >
                  Save Configuration
                </button>
              </div>
            </div>

            {/* Test Connection Output Feedback */}
            {cfTestResult && (
              <div className={`p-3.5 rounded-xl text-xs border flex items-center justify-between font-semibold ${
                cfTestResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cfTestResult.message}</span>
                </div>
                {cfTestResult.latencyMs && (
                  <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded">
                    Latency: {cfTestResult.latencyMs}ms
                  </span>
                )}
              </div>
            )}

            {/* Live Cashfree Payment Orders Ledger */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Recent Cashfree Subscription Orders
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Cashfree Order ID</th>
                      <th className="p-3">Club Tenant</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {cashfreeTransactions.map((tx) => (
                      <tr key={tx.orderId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-400 font-bold">{tx.orderId}</td>
                        <td className="p-3 font-bold text-white">{tx.tenantName}</td>
                        <td className="p-3">{tx.planName}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">₹{tx.amount}</td>
                        <td className="p-3 text-slate-400">{tx.method}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: GLOBAL BROADCAST ENGINE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'broadcast' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" /> Push Real-Time Broadcast Message
            </h2>
            <p className="text-xs text-slate-400">
              Publish an urgent notification banner that will appear instantly at the top of every Club Owner's POS terminal in India.
            </p>

            <form onSubmit={handlePublishBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Broadcast Announcement Text</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. ⚡ New Feature Live: You can now bill Foosball and Karaoke rooms directly from the POS!"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Push Announcement Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: AUDIT LOGS & TELEMETRY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" /> System Audit Trail & Telemetry Logs
            </h2>

            <div className="space-y-2 font-mono text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      log.severity === 'success' ? 'bg-emerald-400' : log.severity === 'warning' ? 'bg-amber-400' : 'bg-indigo-400'
                    }`} />
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className="text-white font-bold">{log.action}</span>
                    <span className="text-indigo-400">[{log.targetTenant}]</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.adminEmail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW TENANT MODAL */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Onboard New Club Tenant</h3>
              <button onClick={() => setIsAddTenantModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Club / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Cue Lounge"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Onboard Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
