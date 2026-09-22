import React, { useState, useMemo } from 'react';
import { SuperAdminClubTenant, ClubProfile, SubscriptionConfig, SubscriptionPlan } from '../types';
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
  ArrowLeft,
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
  Key,
  ChevronRight,
  X,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Settings,
  MessageSquare,
  HelpCircle,
  Shield,
  Fingerprint,
  FileText,
  Download,
  UserCheck,
  UserX,
  TrendingDown,
  Cpu,
  Wifi,
  Receipt,
  BarChart3,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Check,
  Megaphone,
  Printer,
  Trophy,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

interface SuperAdminViewProps {
  tenants: SuperAdminClubTenant[];
  currentProfile: ClubProfile;
  onToggleTenantStatus: (tenantId: string) => void;
  onToggleCurrentClubStatus: () => void;
  onAddTenant?: (tenant: Omit<SuperAdminClubTenant, 'id'>) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onExtendTrial?: (tenantId: string, days: number) => void;
  onImpersonateClub?: (tenantId: string) => void;
  onUpdateTenant?: (tenant: SuperAdminClubTenant) => void;
  subscriptionConfig: SubscriptionConfig;
  onUpdateSubscriptionConfig: (config: SubscriptionConfig) => void;
  isDarkMode?: boolean;
}

interface SupportTicket {
  id: string;
  clubName: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdDate: string;
  description?: string;
  messages?: { sender: string; text: string; timestamp: string }[];
}

const normalizeTenant = (t: any): SuperAdminClubTenant => ({
  id: t.id || `clb_${Math.random().toString(36).substring(2, 8)}`,
  businessName: t.businessName || 'Unnamed Club',
  ownerName: t.ownerName || 'Club Owner',
  whatsapp: t.whatsapp ? String(t.whatsapp).replace(/^\+?/, '') : '',
  city: t.city || 'India',
  status: (t.status === 'SUSPENDED' || t.tenantStatus === 'SUSPENDED') ? 'SUSPENDED' : 'ACTIVE',
  subscriptionDueDate: t.subscriptionDueDate || t.renewalDueDate || '2026-10-15',
  activeAssetsCount: Number(t.activeAssetsCount ?? t.activeTableCount ?? 4),
  monthlyRevenue: Number(t.monthlyRevenue ?? t.totalRevenueThisMonth ?? 499),
  pincode: t.pincode || '',
  lastSessionAt: t.lastSessionAt || null,
});

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tenants: initialTenants,
  currentProfile,
  onToggleTenantStatus,
  onToggleCurrentClubStatus,
  onAddTenant,
  onDeleteTenant,
  onExtendTrial,
  onImpersonateClub,
  onUpdateTenant,
  subscriptionConfig,
  onUpdateSubscriptionConfig,
  isDarkMode = true,
}) => {
  const [tenants, setTenants] = useState<SuperAdminClubTenant[]>(() => {
    return (Array.isArray(initialTenants) && initialTenants.length > 0 ? initialTenants : []).map(normalizeTenant);
  });

  React.useEffect(() => {
    if (Array.isArray(initialTenants)) {
      setTenants(initialTenants.map(normalizeTenant));
    }
  }, [initialTenants]);

  // Sidebar Tabs (Streamlined list requested by the user)
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'billing' | 'plans' | 'razorpay' | 'support' | 'alerts' | 'leaderboard' | 'churn'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsReports, setAnalyticsReports] = useState<any[]>([]);

  // Search, Sort and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'>('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'revenue_desc' | 'assets_desc' | 'due_date_asc'>('revenue_desc');

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');

  // Razorpay Transaction Orders
  const [razorpayTransactions, setRazorpayTransactions] = useState<any[]>([]);
  const [billingSearchQuery, setBillingSearchQuery] = useState('');

  // Razorpay Gateway Config State
  const [rzpEnvironment, setRzpEnvironment] = useState<'TEST' | 'PRODUCTION'>('TEST');
  const [rzpTestKeyId, setRzpTestKeyId] = useState('');
  const [rzpTestKeySecret, setRzpTestKeySecret] = useState('');
  const [rzpLiveKeyId, setRzpLiveKeyId] = useState('');
  const [rzpLiveKeySecret, setRzpLiveKeySecret] = useState('');
  const [rzpIsEnabled, setRzpIsEnabled] = useState(true);
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('');
  const [hasTestSecret, setHasTestSecret] = useState(false);
  const [hasLiveSecret, setHasLiveSecret] = useState(false);

  // Global trial period days setup
  const [trialPeriodDays, setTrialPeriodDays] = useState(15);

  // Overrides and Modals States
  const [selectedTenantForManage, setSelectedTenantForManage] = useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

  // Action feedback alert
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Form states for edits & onboarding
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editState, setEditState] = useState('');
  const [editPlanFee, setEditPlanFee] = useState<number>(499);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editDueDate, setEditDueDate] = useState('');
  const [extendDays, setExtendDays] = useState<number>(30);

  const [newClubName, setNewClubName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newPlanFee, setNewPlanFee] = useState<number>(499);

  // Premium automated invoice and exports states
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Promo Codes campaign management states
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(20);
  const [newPromoExpiry, setNewPromoExpiry] = useState('2026-12-31');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(50);

  // Global Announcement Broadcast Alerts states
  const [activeBroadcast, setActiveBroadcast] = useState<any | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'danger'>('info');

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, configRes, ticketsRes, ordersRes, subSettingsRes, promosRes, broadcastRes, analyticsRes] = await Promise.all([
        api.admin.getTenants(),
        api.razorpay.getConfig(),
        api.admin.getTickets(),
        api.admin.getRazorpayOrders(),
        api.admin.getSubscriptionSettings(),
        api.admin.getPromoCodes(),
        api.admin.getBroadcast(),
        api.admin.getAnalyticsReports().catch(() => ({ success: false, reports: [] }))
      ]);

      if (tenantsRes?.success && Array.isArray(tenantsRes.tenants)) {
        setTenants(tenantsRes.tenants.map(normalizeTenant));
      }
      if (analyticsRes?.success && Array.isArray(analyticsRes.reports)) {
        setAnalyticsReports(analyticsRes.reports);
      }
      if (configRes?.success && configRes.config) {
        setRzpEnvironment(configRes.config.environment || 'TEST');
        setRzpTestKeyId(configRes.config.testKeyId || '');
        setRzpLiveKeyId(configRes.config.liveKeyId || '');
        setRzpIsEnabled(Boolean(configRes.config.isEnabled));
        setHasTestSecret(Boolean(configRes.config.hasTestKeySecret));
        setHasLiveSecret(Boolean(configRes.config.hasLiveKeySecret));
        setRzpWebhookSecret(configRes.config.hasWebhookSecret ? '••••••••' : '');
      }
      if (ticketsRes?.success && Array.isArray(ticketsRes.tickets)) {
        setSupportTickets(ticketsRes.tickets.map(t => ({
          id: t.id,
          clubName: t.clubName || 'Club',
          subject: t.subject || 'Ticket Subject',
          priority: t.priority || 'MEDIUM',
          status: t.status || 'OPEN',
          createdDate: t.createdAt || new Date().toISOString(),
          description: t.description || ''
        })));
      }
      if (ordersRes?.success && Array.isArray(ordersRes.orders)) {
        setRazorpayTransactions(ordersRes.orders);
      }
      if (subSettingsRes?.success && subSettingsRes.trialPeriodDays) {
        setTrialPeriodDays(subSettingsRes.trialPeriodDays);
      }
      if (promosRes?.success && Array.isArray(promosRes.promoCodes)) {
        setPromoCodes(promosRes.promoCodes);
      }
      if (broadcastRes?.success) {
        setActiveBroadcast(broadcastRes.broadcast);
        if (broadcastRes.broadcast) {
          setBroadcastMessage(broadcastRes.broadcast.message || '');
          setBroadcastType(broadcastRes.broadcast.type || 'info');
        } else {
          setBroadcastMessage('');
        }
      }
    } catch (err) {
      console.error("Failed to fetch superadmin live data", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Filter & Sort Logic for Tenants List (includes pincode, city and state)
  const filteredTenants = useMemo(() => {
    return tenants
      .filter(t => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          t.businessName.toLowerCase().includes(query) ||
          t.ownerName.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.city.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'ALL' || 
          (statusFilter === 'ACTIVE' && t.status === 'ACTIVE') ||
          (statusFilter === 'SUSPENDED' && t.status === 'SUSPENDED') ||
          (statusFilter === 'EXPIRED' && new Date(t.subscriptionDueDate).getTime() < Date.now());

        const matchesCity = cityFilter === 'ALL' || t.city.toLowerCase() === cityFilter.toLowerCase();
        
        // Match pincode if provided
        const pin = pincodeFilter.trim();
        const matchesPincode = !pin || (t as any).pincode?.includes(pin) || t.city.includes(pin);

        return matchesSearch && matchesStatus && matchesCity && matchesPincode;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.businessName.localeCompare(b.businessName);
        if (sortBy === 'revenue_desc') return b.monthlyRevenue - a.monthlyRevenue;
        if (sortBy === 'assets_desc') return b.activeAssetsCount - a.activeAssetsCount;
        if (sortBy === 'due_date_asc') return new Date(a.subscriptionDueDate).getTime() - new Date(b.subscriptionDueDate).getTime();
        return 0;
      });
  }, [tenants, searchQuery, statusFilter, cityFilter, pincodeFilter, sortBy]);

  // City list options for filtering
  const uniqueCities = useMemo(() => {
    const cities = tenants.map(t => t.city).filter(Boolean);
    return Array.from(new Set(cities));
  }, [tenants]);

  // Financial Metrics (100% Calculated dynamically from DB models)
  const stats = useMemo(() => {
    const active = tenants.filter(t => t.status === 'ACTIVE');
    const suspended = tenants.filter(t => t.status === 'SUSPENDED');
    const expired = tenants.filter(t => new Date(t.subscriptionDueDate).getTime() < Date.now());

    const activeCount = active.length;
    const suspendedCount = suspended.length;
    const expiredCount = expired.length;

    // Summing active tenants' subscription fees for actual MRR
    const mrr = active.reduce((acc, curr) => acc + (curr.monthlyRevenue || 499), 0);
    const arr = mrr * 12;

    // Calculate actual churn rate = (suspended + expired) / total
    const totalTenants = tenants.length || 1;
    const churn = Math.round(((suspendedCount + expiredCount) / totalTenants) * 100);

    // Sum of successful Razorpay order revenue
    const totalOrdersPaid = razorpayTransactions
      .filter(tx => tx.status === 'PAID')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Tickets status
    const openTickets = supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const resolvedTickets = supportTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const totalTickets = supportTickets.length || 1;
    const ticketResolutionRate = Math.round((resolvedTickets / totalTickets) * 100);

    return {
      activeCount,
      suspendedCount,
      expiredCount,
      totalCount: tenants.length,
      mrr,
      arr,
      churn,
      totalOrdersPaid,
      openTickets,
      resolvedTickets,
      ticketResolutionRate
    };
  }, [tenants, razorpayTransactions, supportTickets]);

  // Leaderboard sorting
  const sortedLeaderboard = useMemo(() => {
    return [...analyticsReports].sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [analyticsReports]);

  // Churn filter
  const atRiskClubs = useMemo(() => {
    return [...analyticsReports]
      .filter(c => c.churnRiskScore >= 15)
      .sort((a, b) => b.churnRiskScore - a.churnRiskScore);
  }, [analyticsReports]);

  // Live Subscription Plan Tier Distribution
  const planTiers = useMemo(() => {
    const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
    const activeCount = activeTenants.length;

    let monthlyCount = 0;
    let quarterlyCount = 0;
    let yearlyCount = 0;

    const monthlyPlan = subscriptionConfig?.plans?.find(p => p.id === 'monthly') || { amount: 499, periodMonths: 1 };
    const quarterlyPlan = subscriptionConfig?.plans?.find(p => p.id === 'quarterly') || { amount: 1299, periodMonths: 3 };
    const yearlyPlan = subscriptionConfig?.plans?.find(p => p.id === 'yearly') || { amount: 4499, periodMonths: 12 };

    const monthlyRateM = Number(monthlyPlan.amount) / Number(monthlyPlan.periodMonths || 1);
    const monthlyRateQ = Number(quarterlyPlan.amount) / Number(quarterlyPlan.periodMonths || 3);
    const monthlyRateY = Number(yearlyPlan.amount) / Number(yearlyPlan.periodMonths || 12);

    activeTenants.forEach(t => {
      const rev = Number(t.monthlyRevenue || 499);
      const diffM = Math.abs(rev - monthlyRateM);
      const diffQ = Math.abs(rev - monthlyRateQ);
      const diffY = Math.abs(rev - monthlyRateY);

      const minDiff = Math.min(diffM, diffQ, diffY);
      if (minDiff === diffM) {
        monthlyCount++;
      } else if (minDiff === diffQ) {
        quarterlyCount++;
      } else {
        yearlyCount++;
      }
    });

    const total = activeCount || 1;
    const pctM = Math.round((monthlyCount / total) * 100);
    const pctQ = Math.round((quarterlyCount / total) * 100);
    const pctY = Math.round((yearlyCount / total) * 100);

    return [
      { name: `${monthlyPlan.name || 'Monthly'} (₹${monthlyPlan.amount})`, count: monthlyCount, color: 'bg-indigo-500', pct: pctM },
      { name: `${quarterlyPlan.name || '3-Month'} (₹${quarterlyPlan.amount})`, count: quarterlyCount, color: 'bg-emerald-500', pct: pctQ },
      { name: `${yearlyPlan.name || 'Yearly'} (₹${yearlyPlan.amount})`, count: yearlyCount, color: 'bg-amber-500', pct: pctY },
    ];
  }, [tenants, subscriptionConfig]);

  // Live 6-Month Revenue Trend Analytics
  const monthlyGrowthData = useMemo(() => {
    const months = [];
    const now = new Date();
    // Past 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      months.push({
        key: `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthName} ${year}`,
        revenue: 0
      });
    }

    // Aggregate real paid Razorpay transactions
    razorpayTransactions.forEach(tx => {
      if (tx.status?.toUpperCase() === 'PAID' && tx.timestamp) {
        try {
          const txDate = new Date(tx.timestamp);
          const txKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
          const match = months.find(m => m.key === txKey);
          if (match) {
            match.revenue += Number(tx.amount || 0);
          }
        } catch (e) {
          // Ignore parse errors for older test rows
        }
      }
    });

    // Generate SVG path coordinates
    const width = 600;
    const height = 150;
    const maxVal = Math.max(100, ...months.map(m => m.revenue));
    
    const points = months.map((m, idx) => {
      const x = (idx / (months.length - 1)) * width;
      // padding 25 at top, leaving 125 height range
      const y = height - 15 - ((m.revenue / maxVal) * 110);
      return { x, y, revenue: m.revenue };
    });

    let cubicPath = '';
    if (points.length > 0) {
      cubicPath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        cubicPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      }
    }

    const areaPath = points.length > 0
      ? `${cubicPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

    return {
      months,
      points,
      cubicPath,
      areaPath,
      maxVal
    };
  }, [razorpayTransactions]);

  // Dynamic Handlers
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.admin.toggleTenantStatus(id);
      if (res?.success) {
        setTenants(prev => prev.map(t => {
          if (t.id !== id) return t;
          return { ...t, status: res.newStatus as any };
        }));
        showAlert(`Status toggled to ${res.newStatus} for tenant ID ${id}`);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to toggle status');
    }
  };

  const handleOpenManageModal = (tenant: SuperAdminClubTenant) => {
    setSelectedTenantForManage(tenant);
    setEditBusinessName(tenant.businessName);
    setEditOwnerName(tenant.ownerName);
    setEditWhatsapp(tenant.whatsapp);
    setEditCity(tenant.city);
    setEditPlanFee(tenant.monthlyRevenue || 499);
    setEditStatus(tenant.status);
    setEditDueDate(tenant.subscriptionDueDate.split('T')[0]);
    setIsManageModalOpen(true);
  };

  const handleSaveTenantEdit = async () => {
    if (!selectedTenantForManage) return;
    try {
      const updatedObj = {
        ...selectedTenantForManage,
        businessName: editBusinessName,
        ownerName: editOwnerName,
        whatsapp: editWhatsapp,
        city: editCity,
        monthlyRevenue: editPlanFee,
        status: editStatus,
        subscriptionDueDate: editDueDate
      };
      
      const res = await api.admin.updateTenant(selectedTenantForManage.id, updatedObj);
      if (res?.success) {
        if (onUpdateTenant) onUpdateTenant(updatedObj);
        setTenants(prev => prev.map(t => t.id === selectedTenantForManage.id ? normalizeTenant(updatedObj) : t));
        setIsManageModalOpen(false);
        showAlert(`Successfully updated tenant info for ${editBusinessName}`);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to update tenant configuration');
    }
  };

  const handleCreateNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName || !newOwnerName) {
      showAlert('Business name and owner name are mandatory');
      return;
    }
    try {
      const payload = {
        businessName: newClubName,
        ownerName: newOwnerName,
        email: newEmail,
        whatsapp: newWhatsapp,
        city: newCity || 'Mumbai',
        pincode: newPincode,
        monthlyPlanFee: newPlanFee
      };

      const res = await api.admin.createTenant(payload);
      if (res?.success) {
        setIsAddTenantModalOpen(false);
        setNewClubName('');
        setNewOwnerName('');
        setNewEmail('');
        setNewWhatsapp('');
        setNewCity('');
        setNewPincode('');
        showAlert(`Successfully onboarded club "${payload.businessName}"`);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Onboarding process failed');
    }
  };

  const handleDeleteTenantAction = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this club tenant? All local data & owner accounts will be expunged.')) return;
    try {
      if (onDeleteTenant) await onDeleteTenant(id);
      setIsManageModalOpen(false);
      showAlert(`Club tenant permanently removed`);
      loadInitialData();
    } catch (err) {
      showAlert('Deletion failed');
    }
  };

  const handleExtendTrialAction = async () => {
    if (!selectedTenantForManage) return;
    try {
      if (onExtendTrial) {
        await onExtendTrial(selectedTenantForManage.id, extendDays);
        showAlert(`Extended subscription by ${extendDays} days`);
        setIsManageModalOpen(false);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Extension failed');
    }
  };

  const handleSaveRzpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        environment: rzpEnvironment,
        testKeyId: rzpTestKeyId,
        testKeySecret: rzpTestKeySecret,
        liveKeyId: rzpLiveKeyId,
        liveKeySecret: rzpLiveKeySecret,
        isEnabled: rzpIsEnabled,
        webhookSecret: rzpWebhookSecret === '••••••••' ? '' : rzpWebhookSecret
      };

      const res = await fetch('/api/razorpay/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json() as any;
      if (data?.success) {
        showAlert('Razorpay integration settings synchronized with production vault');
        loadInitialData();
      } else {
        showAlert(data?.error || 'Failed to sync keys');
      }
    } catch (err) {
      showAlert('API synchronisation failed');
    }
  };

  const handleUpdateTrialDays = async () => {
    try {
      const res = await api.admin.updateSubscriptionSettings(trialPeriodDays);
      if (res?.success) {
        showAlert(`Global free trial period updated to ${trialPeriodDays} days`);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to update trial settings');
    }
  };

  const handleUpdateTicket = async (id: string, nextStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    try {
      const res = await api.admin.updateTicketStatus(id, nextStatus);
      if (res?.success) {
        setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
        showAlert(`Ticket status changed to ${nextStatus}`);
        if (selectedTicket?.id === id) {
          setSelectedTicket(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      }
    } catch (err) {
      showAlert('Failed to update ticket status');
    }
  };

  const handleSendTicketReply = () => {
    if (!ticketReply.trim() || !selectedTicket) return;
    showAlert('Reply processed successfully');
    setTicketReply('');
  };

  // Export Transactions as CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Payment ID', 'Partner Club', 'Email', 'Phone', 'Plan Cycle', 'Paid At', 'Amount (INR)', 'Status'];
    const rows = razorpayTransactions.map(tx => [
      tx.orderId,
      tx.razorpayPaymentId || 'N/A',
      tx.tenantName,
      tx.customerEmail,
      tx.customerPhone,
      tx.planName,
      (tx.timestamp || '').split('T')[0],
      tx.amount,
      tx.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JustClub_Subscription_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Subscription transactions exported successfully as CSV');
  };

  // Promo Code handlers
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      showAlert('Promo code cannot be empty');
      return;
    }
    try {
      const res = await api.admin.createPromoCode({
        code: newPromoCode,
        discountPercent: newPromoDiscount,
        validUntil: newPromoExpiry,
        maxUses: newPromoMaxUses
      });
      if (res?.success) {
        setNewPromoCode('');
        showAlert(`Promo code "${newPromoCode.toUpperCase()}" created successfully!`);
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to create promo code');
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const res = await api.admin.deletePromoCode(id);
      if (res?.success) {
        showAlert('Promo code deleted successfully');
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to delete promo code');
    }
  };

  // Global Broadcast alert banner handlers
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showAlert('Broadcast message cannot be empty');
      return;
    }
    try {
      const res = await api.admin.setBroadcast({
        message: broadcastMessage,
        type: broadcastType,
        audience: 'ALL'
      });
      if (res?.success) {
        showAlert('Global system alert broadcast successfully published!');
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to publish broadcast');
    }
  };

  const handleClearBroadcast = async () => {
    try {
      const res = await api.admin.clearBroadcast();
      if (res?.success) {
        setBroadcastMessage('');
        showAlert('Global system alert broadcast cleared');
        loadInitialData();
      }
    } catch (err) {
      showAlert('Failed to clear broadcast');
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-full rounded-3xl overflow-hidden border ${
      isDarkMode ? 'bg-[#0b101c] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Dynamic Toast banner */}
      <AnimatePresence>
        {actionAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{actionAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Left Navigation Rail */}
      <aside className={`w-full md:w-64 flex flex-col justify-between p-5 border-b md:border-b-0 md:border-r shrink-0 ${
        isDarkMode ? 'bg-[#070b13] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide uppercase">JustClub</h1>
              <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">Super Admin</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'overview', label: 'SaaS Dashboard', icon: BarChart3 },
              { id: 'tenants', label: 'Tenant Management', icon: Building2 },
              { id: 'leaderboard', label: 'Utilization Rankings', icon: Trophy },
              { id: 'churn', label: 'Churn Prevention Radar', icon: ShieldAlert },
              { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
              { id: 'plans', label: 'Subscription Tiers', icon: Tag },
              { id: 'razorpay', label: 'Razorpay Integration', icon: Key },
              { id: 'support', label: 'Helpdesk Tickets', icon: MessageSquare },
              { id: 'alerts', label: 'System Alerts', icon: Megaphone },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
                      : isDarkMode 
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Platform Owner</p>
              <p className="text-[10px] text-slate-500 truncate">hytexcottonmills@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500 font-bold">Synchronising dynamic platform metrics...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW (SaaS Dashboard & Business Intelligence) */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Platform Dashboard</h2>
                    <p className="text-xs text-slate-500">Global platform health and operational MRR metrics</p>
                  </div>
                  <button 
                    onClick={loadInitialData}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shrink-0 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Sync Live Metrics
                  </button>
                </div>

                {/* Dashboard KPIs Card Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active MRR', val: `₹${stats.mrr.toLocaleString()}`, change: 'Live recurring plan sum', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
                    { label: 'Annualized ARR', val: `₹${stats.arr.toLocaleString()}`, change: 'Projected MRR × 12', icon: TrendingUp, color: 'text-indigo-400 bg-indigo-500/10' },
                    { label: 'Platform Tenants', val: stats.totalCount, change: `${stats.activeCount} Active • ${stats.suspendedCount} Suspended`, icon: Building2, color: 'text-sky-400 bg-sky-500/10' },
                    { label: 'Platform Churn Rate', val: `${stats.churn}%`, change: `${stats.expiredCount} expired / overdue`, icon: TrendingDown, color: stats.churn > 15 ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10' },
                  ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                      <div 
                        key={idx}
                        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                          isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
                          <span className="text-2xl font-black tracking-tight">{kpi.val}</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-1">{kpi.change}</span>
                        </div>
                        <div className={`p-3.5 rounded-2xl ${kpi.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Inline-SVG Responsive Charts for SaaS KPI Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Revenue Curve Sparkline */}
                  <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black">Monthly MRR Growth Analytics</h3>
                        <p className="text-[11px] text-slate-500">Interactive live operational revenue trends</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Monthly Interval
                      </span>
                    </div>

                    <div className="h-44 w-full flex items-end relative mt-4">
                      {/* Grid background curves */}
                      <svg className="absolute inset-0 w-full h-full" overflow="visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal guidelines */}
                        <line x1="0" y1="20" x2="100%" y2="20" stroke="#475569" strokeDasharray="4 4" strokeOpacity="0.2" />
                        <line x1="0" y1="70" x2="100%" y2="70" stroke="#475569" strokeDasharray="4 4" strokeOpacity="0.2" />
                        <line x1="0" y1="120" x2="100%" y2="120" stroke="#475569" strokeDasharray="4 4" strokeOpacity="0.2" />
                        
                        {/* Area Fill */}
                        {monthlyGrowthData.areaPath && (
                          <path 
                            d={monthlyGrowthData.areaPath} 
                            fill="url(#chartGrad)" 
                            className="w-full"
                          />
                        )}
                        {/* Cubic Line */}
                        {monthlyGrowthData.cubicPath && (
                          <path 
                            d={monthlyGrowthData.cubicPath} 
                            fill="none" 
                            stroke="#6366f1" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                          />
                        )}

                        {/* Interactive Nodes */}
                        {monthlyGrowthData.points.map((pt, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r="5" 
                              fill={idx === monthlyGrowthData.points.length - 1 ? "#10b981" : "#6366f1"} 
                              stroke={isDarkMode ? "#0e1626" : "#f8fafc"} 
                              strokeWidth="2" 
                            />
                            {/* Hover tooltip for exact values */}
                            <title>{`${monthlyGrowthData.months[idx].label}: ₹${pt.revenue.toLocaleString()}`}</title>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-slate-500 border-t border-slate-800/20 pt-3">
                      {monthlyGrowthData.months.map((m, idx) => (
                        <span key={idx} className="text-center">
                          {m.label}<br/>
                          <span className="text-indigo-400 font-extrabold">₹{m.revenue.toFixed(0)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Plan Tier Distribution Matrix */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h3 className="text-sm font-black">Subscription Tiers Distribution</h3>
                      <p className="text-[11px] text-slate-500">Live share of plans chosen by platform tenants</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      {planTiers.map((tier, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${tier.color}`} />
                              <span>{tier.name}</span>
                            </span>
                            <span className="text-slate-400">{tier.count} Clubs ({tier.pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full ${tier.color}`} style={{ width: `${tier.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-2xl text-[11px] mt-2">
                      <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
                      <p className="text-slate-400">Support resolution speed: <strong className="text-indigo-300">{stats.ticketResolutionRate}%</strong> of helpdesk tickets successfully resolved.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TENANTS (Advanced Tenant Management, Pincode filters, manual overrides, delete, extend trial, impersonation) */}
            {activeTab === 'tenants' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Partner Club Tenants</h2>
                    <p className="text-xs text-slate-500">Configure overrides, edit details, adjust trial periods, extend renewal dates, and impersonate dashboards</p>
                  </div>
                  <button
                    onClick={() => setIsAddTenantModalOpen(true)}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Tenant
                  </button>
                </div>

                {/* 🚨 CHURN RISK PREVENTATIVE RADAR BANNER */}
                {(() => {
                  const inactiveClubs = tenants.filter(t => {
                    const last = t.lastSessionAt ? new Date(t.lastSessionAt).getTime() : null;
                    if (!last) return true; // No session is also risk
                    const diffDays = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
                    return diffDays >= 7;
                  });

                  if (inactiveClubs.length > 0) {
                    return (
                      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 mt-1 md:mt-0">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-amber-400">Churn Prevention Radar: {inactiveClubs.length} Club(s) At Risk!</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              These clubs have not launched a pool/gaming timer in the past 7 days. Reach out proactively via WhatsApp to offer support.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-black text-[11px] flex-wrap">
                          {inactiveClubs.slice(0, 3).map((club, idx) => (
                            <a
                              key={idx}
                              href={`https://wa.me/${club.whatsapp ? club.whatsapp.replace(/^\+?/, '') : ''}?text=Hi%20${encodeURIComponent(club.ownerName)},%20this%20is%20JustClub%20Support.%20Just%20checking%20in%20to%20see%20if%20you%20need%2520any%20help%20setting%2520up%20your%20tables%20or%20billing%20POS!`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-white hover:bg-slate-850 flex items-center gap-1 transition"
                            >
                              Message {club.businessName}
                            </a>
                          ))}
                          {inactiveClubs.length > 3 && <span className="text-slate-500">+{inactiveClubs.length - 3} more</span>}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Complex Filter Controls Bar */}
                <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search query */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search club name or owner..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Filter by Pincode */}
                    <div className="relative">
                      <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter by Pincode..."
                        value={pincodeFilter}
                        onChange={e => setPincodeFilter(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Filter by City */}
                    <select
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="ALL">All Cities</option>
                      {uniqueCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* Filter by Status */}
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active Tiers</option>
                      <option value="SUSPENDED">Suspended Only</option>
                      <option value="EXPIRED">Subscription Overdue</option>
                    </select>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Sort</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className={`px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="revenue_desc">MRR: High to Low</option>
                      <option value="name_asc">Alphabetical (A-Z)</option>
                      <option value="assets_desc">Asset Count</option>
                      <option value="due_date_asc">Renewal Due Date</option>
                    </select>
                  </div>
                </div>

                {/* Tenants Table Grid */}
                <div className={`border rounded-3xl overflow-hidden ${
                  isDarkMode ? 'bg-[#0e1626]/40 border-slate-800/70' : 'bg-white border-slate-200'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-[11px] font-black tracking-wider uppercase border-b ${
                          isDarkMode ? 'bg-[#0e1626] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <th className="p-4 pl-6">Club Detail</th>
                          <th className="p-4">Owner Profile</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Pincode / State</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Monthly Fee</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {filteredTenants.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-slate-500 font-bold text-xs">
                              No partner club tenants match your filter queries.
                            </td>
                          </tr>
                        ) : (
                          filteredTenants.map(tenant => {
                            const isOverdue = new Date(tenant.subscriptionDueDate).getTime() < Date.now();
                            return (
                              <tr 
                                key={tenant.id} 
                                className={`text-xs hover:bg-indigo-500/5 transition-all ${
                                  isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="p-4 pl-6">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-sm">{tenant.businessName}</span>
                                      {(() => {
                                        const last = tenant.lastSessionAt ? new Date(tenant.lastSessionAt).getTime() : null;
                                        if (last) {
                                          const diff = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
                                          if (diff >= 7) {
                                            return (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 shrink-0">
                                                <AlertTriangle className="w-2.5 h-2.5" /> Inactive {diff}d
                                              </span>
                                            );
                                          }
                                        } else {
                                          return (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1 shrink-0">
                                              <AlertTriangle className="w-2.5 h-2.5" /> No Session
                                            </span>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    <span className="text-[10px] text-indigo-500 font-black tracking-wider uppercase">{tenant.id}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold">{tenant.ownerName}</td>
                                <td className="p-4 text-slate-400 font-medium">+{tenant.whatsapp}</td>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{tenant.city}</span>
                                    <span className="text-[10px] text-slate-500">{(tenant as any).pincode || '560001'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                                    isOverdue 
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {tenant.subscriptionDueDate.split('T')[0]}
                                  </span>
                                </td>
                                <td className="p-4 font-extrabold text-sm">₹{tenant.monthlyRevenue || 499}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    tenant.status === 'ACTIVE' 
                                      ? 'bg-emerald-500/20 text-emerald-400' 
                                      : 'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {tenant.status}
                                  </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* LIVE IMPERSONATE CLUB */}
                                    <button
                                      onClick={() => onImpersonateClub && onImpersonateClub(tenant.id)}
                                      title="Impersonate and view POS dashboard as this club owner"
                                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg transition-all"
                                    >
                                      <Crown className="w-4 h-4" />
                                    </button>

                                    {/* TOGGLE SUSPENSION */}
                                    <button
                                      onClick={() => handleToggleStatus(tenant.id)}
                                      title={tenant.status === 'ACTIVE' ? 'Suspend Tenant Access' : 'Activate Tenant Access'}
                                      className={`p-1.5 rounded-lg transition-all ${
                                        tenant.status === 'ACTIVE' 
                                          ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white' 
                                          : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950'
                                      }`}
                                    >
                                      {tenant.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                    </button>

                                    {/* EDIT DETAILS & MANUAL OVERRIDES */}
                                    <button
                                      onClick={() => handleOpenManageModal(tenant)}
                                      title="Manual Overrides & Edit Details"
                                      className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BILLING & INVOICES (Lists real Razorpay transaction history) */}
            {activeTab === 'billing' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Razorpay Transactions Log</h2>
                    <p className="text-xs text-slate-500">Live feed of subscription order receipts and gateway invoices</p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" /> Export CSV Ledger
                  </button>
                </div>

                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions by club, email or ID..."
                    value={billingSearchQuery}
                    onChange={e => setBillingSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDarkMode ? 'bg-[#0e1626] border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className={`border rounded-3xl overflow-hidden ${
                  isDarkMode ? 'bg-[#0e1626]/40 border-slate-800/70' : 'bg-white border-slate-200'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-[11px] font-black tracking-wider uppercase border-b ${
                          isDarkMode ? 'bg-[#0e1626] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <th className="p-4 pl-6">Order ID</th>
                          <th className="p-4">Partner Club</th>
                          <th className="p-4">Email / Phone</th>
                          <th className="p-4">Plan cycle</th>
                          <th className="p-4">Paid at</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {razorpayTransactions
                          .filter(tx => {
                            const query = billingSearchQuery.toLowerCase().trim();
                            return !query || 
                              tx.orderId.toLowerCase().includes(query) ||
                              tx.tenantName.toLowerCase().includes(query) ||
                              tx.customerEmail.toLowerCase().includes(query);
                          })
                          .length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-10 text-center text-slate-500 font-bold text-xs">
                                No verified transaction history found on-chain.
                              </td>
                            </tr>
                          ) : (
                            razorpayTransactions
                              .filter(tx => {
                                const query = billingSearchQuery.toLowerCase().trim();
                                return !query || 
                                  tx.orderId.toLowerCase().includes(query) ||
                                  tx.tenantName.toLowerCase().includes(query) ||
                                  tx.customerEmail.toLowerCase().includes(query);
                              })
                              .map((tx, idx) => (
                                <tr key={idx} className="text-xs hover:bg-slate-900/40">
                                  <td className="p-4 pl-6">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold">{tx.orderId}</span>
                                      <span className="text-[10px] text-slate-500">{tx.razorpayPaymentId || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 font-bold">{tx.tenantName}</td>
                                  <td className="p-4">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{tx.customerEmail || 'no-email@club.com'}</span>
                                      <span className="text-[10px] text-slate-500">{tx.customerPhone}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400">
                                      {tx.planName}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-400 font-medium">{(tx.timestamp || '').split('T')[0]}</td>
                                  <td className="p-4 text-right font-black text-sm text-indigo-400">₹{tx.amount}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      tx.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="p-4 pr-6 text-right">
                                    <button
                                      onClick={() => setSelectedInvoice(tx)}
                                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 ml-auto"
                                    >
                                      <Printer className="w-3 h-3" /> Invoice
                                    </button>
                                  </td>
                                </tr>
                              ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUBSCRIPTION TIERS (Configure dynamic trials & subscription pricing tiers) */}
            {activeTab === 'plans' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Platform Subscription Settings</h2>
                    <p className="text-xs text-slate-500">Configure default trials and adjust core subscription tiers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dynamic Trial Period Form */}
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-sm font-black flex items-center gap-2 text-indigo-400">
                      <Clock className="w-4 h-4" /> Global Free Trial Settings
                    </h3>
                    <p className="text-xs text-slate-500">Determines the number of active free trial days assigned to a new partner club on signup.</p>

                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={trialPeriodDays}
                        onChange={e => setTrialPeriodDays(Number(e.target.value))}
                        className={`w-32 px-4 py-2.5 rounded-xl text-xs border outline-none font-bold ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        onClick={handleUpdateTrialDays}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Subscription Plans Editor */}
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-sm font-black flex items-center gap-2 text-emerald-400">
                      <Sparkles className="w-4 h-4" /> Core Subscription Plan Structures
                    </h3>
                    <p className="text-xs text-slate-500">
                      Directly modify billing names, rates (INR), and marketing discount labels backed live by D1 database connections.
                    </p>

                    <div className="flex flex-col gap-4 mt-1">
                      {subscriptionConfig?.plans?.map((plan) => (
                        <div 
                          key={plan.id}
                          className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                            isDarkMode ? 'bg-[#070b13] border-slate-800/50' : 'bg-white border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                              {plan.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              {plan.periodMonths} {plan.periodMonths === 1 ? 'Month' : 'Months'} Period
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                              <input
                                type="text"
                                defaultValue={plan.name}
                                id={`plan_name_${plan.id}`}
                                className={`px-2.5 py-1.5 rounded-xl text-xs border outline-none font-bold ${
                                  isDarkMode ? 'bg-[#101827] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                              <input
                                type="number"
                                defaultValue={plan.amount}
                                id={`plan_amount_${plan.id}`}
                                className={`px-2.5 py-1.5 rounded-xl text-xs border outline-none font-bold ${
                                  isDarkMode ? 'bg-[#101827] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Badge / Discount</label>
                              <input
                                type="text"
                                defaultValue={plan.discountLabel}
                                id={`plan_label_${plan.id}`}
                                className={`px-2.5 py-1.5 rounded-xl text-xs border outline-none font-bold ${
                                  isDarkMode ? 'bg-[#101827] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                const nameInput = document.getElementById(`plan_name_${plan.id}`) as HTMLInputElement;
                                const amountInput = document.getElementById(`plan_amount_${plan.id}`) as HTMLInputElement;
                                const labelInput = document.getElementById(`plan_label_${plan.id}`) as HTMLInputElement;
                                if (nameInput && amountInput && labelInput) {
                                  try {
                                    const updatedPlan = {
                                      id: plan.id,
                                      name: nameInput.value,
                                      amount: Number(amountInput.value),
                                      periodMonths: plan.periodMonths,
                                      discountLabel: labelInput.value
                                    };
                                    const res = await api.subscription.updatePlan(updatedPlan);
                                    if (res?.success) {
                                      const updatedPlans = subscriptionConfig.plans.map(p => p.id === plan.id ? updatedPlan : p);
                                      onUpdateSubscriptionConfig?.({
                                        ...subscriptionConfig,
                                        plans: updatedPlans
                                      });
                                      showAlert(`Plan tier ${plan.id.toUpperCase()} successfully synchronized with Cloudflare D1`);
                                    } else {
                                      showAlert('Failed to synchronize plan tier settings');
                                    }
                                  } catch (e: any) {
                                    showAlert(`Sync error: ${e.message}`);
                                  }
                                }
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-xl shadow transition"
                            >
                              Update Tier Settings
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 🏷️ PROMO CODE & COUPON CAMPAIGN MANAGER */}
                <div className={`p-6 rounded-3xl border flex flex-col gap-6 mt-6 ${
                  isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/30 pb-4">
                    <div>
                      <h3 className="text-sm font-black flex items-center gap-2 text-indigo-400">
                        <Tag className="w-4 h-4" /> Promo Code & Coupon Campaigns
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Configure special discount coupon codes to offer on club subscription checkouts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Coupon Campaign Form */}
                    <form onSubmit={handleCreatePromo} className="flex flex-col gap-4">
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Create Coupon Campaign</h4>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Promo Coupon Code</label>
                        <input
                          type="text"
                          placeholder="FESTIVE30"
                          value={newPromoCode}
                          onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                          className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-bold ${
                            isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Discount (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={newPromoDiscount}
                            onChange={e => setNewPromoDiscount(Number(e.target.value))}
                            className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-bold ${
                              isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Max Redemptions</label>
                          <input
                            type="number"
                            min="1"
                            value={newPromoMaxUses}
                            onChange={e => setNewPromoMaxUses(Number(e.target.value))}
                            className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-bold ${
                              isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Expiry Date</label>
                        <input
                          type="date"
                          value={newPromoExpiry}
                          onChange={e => setNewPromoExpiry(e.target.value)}
                          className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                            isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                      >
                        Publish Promo Campaign
                      </button>
                    </form>

                    {/* Active Promo Codes List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Active Campaigns</h4>
                      
                      <div className={`border rounded-2xl overflow-hidden ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800/60' : 'bg-white border-slate-200'
                      }`}>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                                isDarkMode ? 'bg-[#0e1626] text-slate-400 border-slate-800/80' : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                <th className="p-3 pl-4">Coupon Code</th>
                                <th className="p-3">Discount</th>
                                <th className="p-3">Redemptions</th>
                                <th className="p-3">Expiry</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 pr-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/20">
                              {promoCodes.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold text-xs">
                                    No discount coupon campaigns have been declared yet.
                                  </td>
                                </tr>
                              ) : (
                                promoCodes.map((promo, idx) => {
                                  const isExpired = new Date(promo.validUntil).getTime() < Date.now();
                                  const isFullyUsed = promo.maxUses && promo.usesCount >= promo.maxUses;
                                  const isActive = !isExpired && !isFullyUsed;
                                  return (
                                    <tr key={idx} className="hover:bg-slate-900/20">
                                      <td className="p-3 pl-4 font-black text-indigo-400 tracking-wider">
                                        {promo.code.toUpperCase()}
                                      </td>
                                      <td className="p-3 font-extrabold text-slate-200">
                                        {promo.discountPercent}% Off
                                      </td>
                                      <td className="p-3 text-slate-400 font-bold">
                                        {promo.usesCount} / {promo.maxUses || '∞'}
                                      </td>
                                      <td className="p-3 text-slate-400 font-medium">
                                        {promo.validUntil.split('T')[0]}
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                          isActive 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : isExpired 
                                              ? 'bg-rose-500/10 text-rose-400' 
                                              : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                          {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'DEPLETED'}
                                        </span>
                                      </td>
                                      <td className="p-3 pr-4 text-right">
                                        <button
                                          onClick={() => handleDeletePromo(promo.id)}
                                          className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                                          title="Revoke Campaign"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: RAZORPAY GATEWAY CONFIG (Set API Keys and environment toggles) */}
            {activeTab === 'razorpay' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Razorpay Gateway Integration</h2>
                    <p className="text-xs text-slate-500">Manage API keys, toggle between Sandbox Test & Live Production, and configure webhooks</p>
                  </div>
                </div>

                <form onSubmit={handleSaveRzpConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Environment Controls */}
                    <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                      isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className="text-sm font-black flex items-center gap-2 text-indigo-400">
                        <Settings className="w-4 h-4" /> Gateway Environment Settings
                      </h3>

                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="env-test"
                            name="rzpEnv"
                            checked={rzpEnvironment === 'TEST'}
                            onChange={() => setRzpEnvironment('TEST')}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="env-test" className="text-xs font-bold cursor-pointer">Sandbox (Test Mode)</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="env-prod"
                            name="rzpEnv"
                            checked={rzpEnvironment === 'PRODUCTION'}
                            onChange={() => setRzpEnvironment('PRODUCTION')}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="env-prod" className="text-xs font-bold cursor-pointer text-amber-400">Production (Live Payments Mode)</label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800/30 pt-4 mt-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold">Enable Platform Payments</span>
                          <span className="text-[10px] text-slate-500">Toggle whether clients can pay renewal fees online</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRzpIsEnabled(!rzpIsEnabled)}
                          className={`p-1.5 rounded-lg transition-all ${
                            rzpIsEnabled ? 'text-indigo-400' : 'text-slate-500'
                          }`}
                        >
                          {rzpIsEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                      </div>
                    </div>

                    {/* API Keys Credentials */}
                    <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                      isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className="text-sm font-black flex items-center gap-2 text-emerald-400">
                        <Lock className="w-4 h-4" /> Razorpay Integration API Credentials
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {/* Test Keys */}
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] text-indigo-400 font-extrabold uppercase">Sandbox (Test Environment)</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-slate-500 font-bold">Key ID</label>
                            <input
                              type="text"
                              value={rzpTestKeyId}
                              onChange={e => setRzpTestKeyId(e.target.value)}
                              placeholder="rzp_test_..."
                              className={`px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                                isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-slate-500 font-bold">Key Secret</label>
                            <input
                              type="password"
                              value={rzpTestKeySecret}
                              onChange={e => setRzpTestKeySecret(e.target.value)}
                              placeholder={hasTestSecret ? '••••••••' : 'Enter Secret Key'}
                              className={`px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                                isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Live Keys */}
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] text-amber-400 font-extrabold uppercase">Production (Live Environment)</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-slate-500 font-bold">Key ID</label>
                            <input
                              type="text"
                              value={rzpLiveKeyId}
                              onChange={e => setRzpLiveKeyId(e.target.value)}
                              placeholder="rzp_live_..."
                              className={`px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                                isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-slate-500 font-bold">Key Secret</label>
                            <input
                              type="password"
                              value={rzpLiveKeySecret}
                              onChange={e => setRzpLiveKeySecret(e.target.value)}
                              placeholder={hasLiveSecret ? '••••••••' : 'Enter Secret Key'}
                              className={`px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                                isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Webhook Endpoint Secret */}
                      <div className="flex flex-col gap-1 border-t border-slate-800/30 pt-4 mt-2">
                        <label className="text-xs font-bold">Webhook Signature Secret</label>
                        <p className="text-[11px] text-slate-500 mb-2">Required for secure instant payment status synchronization with Razorpay callbacks.</p>
                        <input
                          type="password"
                          value={rzpWebhookSecret}
                          onChange={e => setRzpWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                          className={`max-w-md px-3.5 py-2 rounded-xl text-xs border outline-none font-medium ${
                            isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl transition scale-100 hover:scale-[1.01] flex items-center justify-center gap-1.5 self-start cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save Integration Keys
                    </button>
                  </div>

                  {/* Sidebar Help Column */}
                  <div className="flex flex-col gap-4">
                    <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                      isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h4 className="text-xs font-black uppercase text-indigo-400">Webhook Sync Guide</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        To enable fully automated, instant subscription renewals, add this webhook callback endpoint to your Razorpay Developer Dashboard:
                      </p>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl select-all font-mono text-[10px] text-indigo-400 break-all">
                        {window.location.origin}/api/razorpay/webhook
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Configure the webhook to trigger on the <code className="text-amber-400 font-mono">payment.captured</code> event.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6: SUPPORT TICKETS HELP DESK */}
            {activeTab === 'support' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Platform Helpdesk Queue</h2>
                    <p className="text-xs text-slate-500">Manage support tickets and adjust resolution status logs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Tickets Queue Feed List */}
                  <div className="lg:col-span-2 flex flex-col gap-3">
                    {supportTickets.length === 0 ? (
                      <div className={`p-10 text-center rounded-3xl border text-slate-500 font-bold text-xs ${
                        isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                      }`}>
                        No complaints filed by partner club managers.
                      </div>
                    ) : (
                      supportTickets.map(tkt => {
                        const active = selectedTicket?.id === tkt.id;
                        return (
                          <div
                            key={tkt.id}
                            onClick={() => setSelectedTicket(tkt)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              active 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white scale-[1.01]' 
                                : isDarkMode 
                                  ? 'bg-[#0e1626] border-slate-800 hover:border-slate-700' 
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  tkt.priority === 'HIGH' || tkt.priority === 'URGENT' 
                                    ? 'bg-rose-500/20 text-rose-400' 
                                    : 'bg-slate-500/20 text-slate-400'
                                }`}>
                                  {tkt.priority}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold">{tkt.id}</span>
                              </div>
                              <h3 className="text-xs font-black">{tkt.subject}</h3>
                              <p className="text-[10px] text-slate-400">{tkt.clubName} • {tkt.createdDate.split('T')[0]}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                tkt.status === 'OPEN' 
                                  ? 'bg-rose-500/20 text-rose-400' 
                                  : tkt.status === 'IN_PROGRESS' 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {tkt.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Actions / Detail Pane */}
                  <div className="flex flex-col gap-4">
                    {selectedTicket ? (
                      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                        isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-500">Ticket Workspace</h4>
                            <h3 className="text-sm font-black mt-1">{selectedTicket.subject}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{selectedTicket.clubName}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedTicket(null)}
                            className="p-1 rounded-lg text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-3 bg-slate-950/40 border border-slate-800/50 rounded-2xl text-[11px] text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                          <strong>Description:</strong> {selectedTicket.description || 'No description provided'}
                        </div>

                        {/* Status override pipeline */}
                        <div className="flex flex-col gap-1.5 border-t border-slate-800/30 pt-4">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase">Update Status</label>
                          <div className="flex gap-1.5">
                            {(['IN_PROGRESS', 'RESOLVED', 'CLOSED'] as any[]).map(st => (
                              <button
                                key={st}
                                onClick={() => handleUpdateTicket(selectedTicket.id, st)}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                  selectedTicket.status === st 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fast Response form */}
                        <div className="flex flex-col gap-2 border-t border-slate-800/30 pt-4">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase">Send Response</label>
                          <textarea
                            value={ticketReply}
                            onChange={e => setTicketReply(e.target.value)}
                            placeholder="Draft ticket resolution response..."
                            className={`w-full h-16 p-3 rounded-2xl text-[11px] outline-none border focus:border-indigo-500 font-medium ${
                              isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                          <button
                            onClick={handleSendTicketReply}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-1.5 transition"
                          >
                            <Send className="w-3.5 h-3.5" /> Dispatch Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-3xl border text-center text-[11px] text-slate-500 font-bold ${
                        isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                      }`}>
                        Select a support ticket from the helpdesk queue to execute resolution updates or reply logs.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: SCHEDULED SYSTEM ALERTS & MAINTENANCE BROADCASTS */}
            {activeTab === 'alerts' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">System Broadcasts & Maintenance Banners</h2>
                    <p className="text-xs text-slate-500 font-medium">Configure global top-bar alerts and scheduled maintenance banners visible to all partner clubs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Creation Form */}
                  <div className={`p-6 rounded-3xl border flex flex-col gap-5 lg:col-span-2 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="text-sm font-black flex items-center gap-2 text-indigo-400">
                      <Megaphone className="w-4 h-4" /> Publish Platform Broadcast
                    </h3>

                    <form onSubmit={handlePublishBroadcast} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Broadcast Notification Message</label>
                        <textarea
                          value={broadcastMessage}
                          onChange={e => setBroadcastMessage(e.target.value)}
                          placeholder="Example: Scheduled Server Maintenance today at 02:00 AM IST. Live POS timers will continue working offline."
                          rows={3}
                          className={`w-full p-3.5 rounded-2xl text-xs outline-none border focus:border-indigo-500 font-medium ${
                            isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase">Alert Type / Tone</label>
                          <select
                            value={broadcastType}
                            onChange={e => setBroadcastType(e.target.value as any)}
                            className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-bold ${
                              isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="info">Information (Indigo Theme)</option>
                            <option value="warning">System Warning (Amber Theme)</option>
                            <option value="danger">Urgent Downtime (Rose Theme)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase">Target Audience</label>
                          <select
                            disabled
                            className={`px-3 py-2.5 rounded-xl text-xs border outline-none font-bold opacity-60 ${
                              isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="ALL">All Partner Clubs (Default)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                        >
                          Publish Alert Banner
                        </button>
                        {activeBroadcast && (
                          <button
                            type="button"
                            onClick={handleClearBroadcast}
                            className="px-5 py-3 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-extrabold text-xs rounded-2xl transition cursor-pointer border border-rose-500/20"
                          >
                            Revoke Active Alert
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Live Simulation Preview */}
                  <div className="flex flex-col gap-4">
                    <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${
                      isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Live Banner Simulation</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        This is a live visual simulation of how the broadcast will look at the top of each partner club's POS dashboard:
                      </p>

                      <div className="border border-dashed border-slate-700/50 p-4 rounded-2xl">
                        {broadcastMessage.trim() ? (
                          <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-[11px] leading-relaxed ${
                            broadcastType === 'danger'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                              : broadcastType === 'warning'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                          }`}>
                            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">
                                {broadcastType === 'danger' ? 'System Downtime Notification' : broadcastType === 'warning' ? 'Platform Advisory' : 'JustClub Network Broadcast'}
                              </strong>
                              <span>{broadcastMessage}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-[11px] text-slate-500 font-bold">
                            No active alert currently being simulation typed.
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-audience distribution complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8:🏆 PARTNER UTILIZATION RANKINGS & PERFORMANCE LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black">Partner Utilization & Performance Leaderboards</h2>
                    <p className="text-xs text-slate-500">Live rankings calculated directly from D1 game session logs and bills billing history</p>
                  </div>
                  <button 
                    onClick={loadInitialData}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
                      isDarkMode ? 'bg-[#0e1626] border border-slate-800 text-indigo-400 hover:text-indigo-300' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" /> Reload Rankings
                  </button>
                </div>

                {/* Top 3 Podium Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedLeaderboard.slice(0, 3).map((club, idx) => {
                    const colors = [
                      { badge: 'text-amber-400 bg-amber-400/10 border-amber-500/30', card: 'border-amber-500/30 bg-amber-500/5', icon: 'text-amber-400', rank: '1st Gold' },
                      { badge: 'text-slate-300 bg-slate-300/10 border-slate-400/30', card: 'border-slate-500/20 bg-slate-500/5', icon: 'text-slate-300', rank: '2nd Silver' },
                      { badge: 'text-amber-600 bg-amber-600/10 border-amber-700/30', card: 'border-amber-700/20 bg-amber-700/5', icon: 'text-amber-600', rank: '3rd Bronze' }
                    ][idx] || { badge: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30', card: 'border-indigo-500/20 bg-indigo-500/5', icon: 'text-indigo-400', rank: `${idx + 1}th` };

                    return (
                      <div 
                        key={club.id} 
                        className={`p-6 rounded-3xl border flex flex-col items-center text-center gap-3 relative overflow-hidden ${
                          isDarkMode ? colors.card : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="absolute top-4 right-4">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border ${colors.badge}`}>
                            {colors.rank}
                          </span>
                        </div>

                        <div className={`p-4 rounded-full bg-slate-500/10 border border-slate-500/20 ${colors.icon} mt-3`}>
                          <Trophy className="w-8 h-8" />
                        </div>

                        <div className="mt-2">
                          <h4 className="font-extrabold text-sm">{club.businessName}</h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">Owner: {club.ownerName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-slate-800/30 pt-4 text-left">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase">Monthly Sales</span>
                            <span className="text-xs font-black text-indigo-400">₹{club.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase">Table Usage</span>
                            <span className="text-xs font-black text-emerald-400">{club.totalHours} Hrs</span>
                          </div>
                        </div>

                        <div className="w-full mt-1.5">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 mb-1">
                            <span>Estimated Occupancy</span>
                            <span className="text-indigo-300">{club.occupancyRate}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${club.occupancyRate}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Complete Platform Directory Standings */}
                <div className={`p-6 rounded-3xl border ${
                  isDarkMode ? 'bg-[#0e1626] border-slate-800/70' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className="text-sm font-black flex items-center gap-2 mb-4 text-indigo-400">
                    <Award className="w-4.5 h-4.5" /> Full Operational Leaderboard standings
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/40 text-[10px] uppercase font-extrabold text-slate-400">
                          <th className="pb-3 pl-2">Rank</th>
                          <th className="pb-3">Club Info</th>
                          <th className="pb-3 text-center">Active Assets</th>
                          <th className="pb-3 text-center">Total Sessions</th>
                          <th className="pb-3 text-center">Played Time</th>
                          <th className="pb-3 text-center">Canteen Revenue</th>
                          <th className="pb-3 text-right pr-2">Total Billings (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/20">
                        {sortedLeaderboard.map((club, index) => (
                          <tr key={club.id} className={`text-xs hover:bg-slate-500/5 transition ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            <td className="py-3.5 pl-2 font-black text-indigo-400 text-sm">
                              #{index + 1}
                            </td>
                            <td className="py-3.5">
                              <div>
                                <span className={`font-extrabold block ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{club.businessName}</span>
                                <span className="text-[10px] text-slate-500 font-bold block">{club.ownerName} • {club.whatsapp}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-400">
                              {club.activeTableCount} Tables
                            </td>
                            <td className="py-3.5 text-center font-extrabold text-slate-300">
                              {club.sessionCount}
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black">
                                {club.totalHours} Hours
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-400">
                              ₹{club.totalBar.toLocaleString()}
                            </td>
                            <td className="py-3.5 text-right font-black text-indigo-300 pr-2">
                              ₹{club.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9:🚨 CHURN PREVENTION RADAR */}
            {activeTab === 'churn' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-rose-400">Churn Prevention & Retention Console</h2>
                    <p className="text-xs text-slate-500">Live platform retention monitoring flagging trial and subscription accounts with high risk coordinates</p>
                  </div>
                  <button 
                    onClick={loadInitialData}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
                      isDarkMode ? 'bg-[#0e1626] border border-slate-800 text-indigo-400 hover:text-indigo-300' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" /> Re-Scan Risk Indexes
                  </button>
                </div>

                {/* Risk Breakdown Statistics banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">At-Risk Venues detected</span>
                      <h4 className="text-xl font-black text-rose-400">{atRiskClubs.length} Clubs</h4>
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Trial Accounts Expiring</span>
                      <h4 className="text-xl font-black text-amber-400">
                        {analyticsReports.filter(c => c.status === 'TRIAL' && c.daysRemaining <= 5).length} Clubs
                      </h4>
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                    isDarkMode ? 'bg-[#0e1626] border-slate-800/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="p-3 bg-slate-500/10 text-slate-400 rounded-2xl">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Inactive &gt; 5 Days</span>
                      <h4 className="text-xl font-black text-slate-300">
                        {analyticsReports.filter(c => c.daysInactive >= 5).length} Clubs
                      </h4>
                    </div>
                  </div>
                </div>

                {/* At-Risk lists */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-black flex items-center gap-2 text-rose-400 pl-1">
                    <ShieldAlert className="w-4.5 h-4.5" /> High Risk Priority Attention List
                  </h3>

                  {atRiskClubs.length === 0 ? (
                    <div className="p-12 border border-dashed border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      <h4 className="font-extrabold text-sm text-slate-300">Platform Engagement is 100% Stable</h4>
                      <p className="text-xs text-slate-500 max-w-sm">No partner clubs meet the risk criteria today. Table bookings, game sessions, and billing synchronizations are optimal.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {atRiskClubs.map((club) => {
                        const riskLevel = club.churnRiskScore >= 60 ? 'HIGH RISK' : club.churnRiskScore >= 35 ? 'MEDIUM RISK' : 'LOW RISK';
                        const riskBg = club.churnRiskScore >= 60 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : club.churnRiskScore >= 35 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                        return (
                          <div 
                            key={club.id} 
                            className={`p-5 rounded-3xl border flex flex-col gap-4 relative overflow-hidden ${
                              isDarkMode ? 'bg-[#0e1626]/80 border-slate-800/80 hover:border-slate-700/80' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="absolute top-5 right-5">
                              <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase border ${riskBg}`}>
                                {riskLevel} ({club.churnRiskScore}%)
                              </span>
                            </div>

                            <div>
                              <h4 className="font-extrabold text-sm">{club.businessName}</h4>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5">Owner: {club.ownerName} • {club.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {club.riskFactors.map((f: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-rose-500/5 text-rose-400/80 border border-rose-500/10 rounded-lg text-[9px] font-bold">
                                  {f}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/30 text-left">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Inactivity</span>
                                <span className="text-xs font-black text-rose-400">{club.daysInactive >= 999 ? 'Never active' : `${club.daysInactive} Days`}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Renewal Due</span>
                                <span className="text-xs font-black text-slate-300">{club.renewalDueDate}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Table Rate</span>
                                <span className="text-xs font-black text-indigo-400">{club.occupancyRate}% Occ</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 mt-1">
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await api.admin.extendTrial(club.id, 15);
                                    if (res?.success) {
                                      showAlert(`🎁 Successfully extended cycle for ${club.businessName} by 15 days`);
                                      loadInitialData();
                                    } else {
                                      showAlert('Failed to extend subscription cycle');
                                    }
                                  } catch (e) {
                                    showAlert('Failed to connect to subscription extension API');
                                  }
                                }}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-xl transition shadow cursor-pointer"
                              >
                                🎁 Grant +15 Days Cycle
                              </button>

                              <button
                                onClick={async () => {
                                  try {
                                    const res = await api.admin.createRetainerTicket(club.id);
                                    if (res?.success) {
                                      showAlert(`📞 Support retainer ticket ${res.ticketId} successfully queued`);
                                      loadInitialData();
                                    } else {
                                      showAlert('Failed to queue priority retainer task');
                                    }
                                  } catch (e) {
                                    showAlert('Error connecting to priority helpdesk queue');
                                  }
                                }}
                                className="flex-1 py-2 bg-[#122244] hover:bg-[#1a2d58] border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] rounded-xl transition cursor-pointer"
                              >
                                📞 Open Retainer Task
                              </button>

                              <a
                                href={`https://wa.me/91${club.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center rounded-xl transition shadow"
                                title="Open Whatsapp Chat"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.022-.015-.072-.108-.314-.23c-.243-.122-1.437-.709-1.658-.79-.22-.081-.381-.122-.541.122-.16.242-.62.783-.759.943-.14.16-.28.18-.522.058-.243-.122-.973-.359-1.854-1.144-.685-.611-1.147-1.367-1.282-1.597-.136-.23-.015-.354.107-.476.11-.11.243-.284.364-.426.122-.142.162-.243.243-.405.082-.162.04-.303-.02-.426-.06-.122-.541-1.3-.742-1.785-.196-.472-.397-.409-.54-.417-.14-.007-.3-.007-.461-.007-.162 0-.425.061-.648.304-.223.243-.85.83-0.85 2.025 0 1.194.869 2.348 1.01 2.509.141.162 1.708 2.607 4.137 3.654.577.249 1.028.397 1.378.508.58.185 1.107.159 1.52.097.46-.069 1.437-.587 1.638-1.154.201-.567.201-1.054.14-1.154-.061-.101-.223-.162-.465-.282zm-5.411 7.218h-.004c-1.86 0-3.685-.5-5.286-1.442l-.379-.225-3.922 1.028 1.047-3.821-.247-.393c-.983-1.564-1.503-3.376-1.503-5.26 0-5.462 4.444-9.907 9.914-9.907 2.651 0 5.143 1.031 7.018 2.909 1.875 1.878 2.906 4.372 2.906 7.002 0 5.464-4.444 9.909-9.914 9.909z" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ADD NEW TENANT (ONBOARDING) */}
      <AnimatePresence>
        {isAddTenantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTenantModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className={`relative max-w-lg w-full p-6 rounded-3xl shadow-2xl border flex flex-col gap-4 overflow-hidden z-10 ${
                isDarkMode ? 'bg-[#0e1626] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                <h3 className="font-black text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Onboard Club Tenant
                </h3>
                <button onClick={() => setIsAddTenantModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewTenant} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Imperial Snooker Club"
                      value={newClubName}
                      onChange={e => setNewClubName(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newOwnerName}
                      onChange={e => setNewOwnerName(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="owner@gmail.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">WhatsApp Contact</label>
                    <input
                      type="tel"
                      placeholder="919876543210"
                      value={newWhatsapp}
                      onChange={e => setNewWhatsapp(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">City</label>
                    <input
                      type="text"
                      placeholder="Chennai"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">Pincode</label>
                    <input
                      type="text"
                      placeholder="600001"
                      value={newPincode}
                      onChange={e => setNewPincode(e.target.value)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-extrabold uppercase">Monthly Fee (₹)</label>
                    <input
                      type="number"
                      value={newPlanFee}
                      onChange={e => setNewPlanFee(Number(e.target.value))}
                      className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none font-semibold ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  Onboard Tenant Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TENANT MANUAL OVERRIDES (Edit, Extend Subscription, Delete, Change subscription tier) */}
      <AnimatePresence>
        {isManageModalOpen && selectedTenantForManage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsManageModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className={`relative max-w-xl w-full p-6 rounded-3xl shadow-2xl border flex flex-col gap-4 overflow-hidden z-10 ${
                isDarkMode ? 'bg-[#0e1626] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                <div className="flex flex-col">
                  <h3 className="font-black text-base flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" /> Tenant Controls & Overrides
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{selectedTenantForManage.businessName} ({selectedTenantForManage.id})</span>
                </div>
                <button onClick={() => setIsManageModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto flex flex-col gap-5 pr-1">
                {/* 1. Edit Details Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">1. Update Core Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Business Name</label>
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={e => setEditBusinessName(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Owner Name</label>
                      <input
                        type="text"
                        value={editOwnerName}
                        onChange={e => setEditOwnerName(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">WhatsApp Contact</label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={e => setEditWhatsapp(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={e => setEditCity(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Plan Fee (₹)</label>
                      <input
                        type="number"
                        value={editPlanFee}
                        onChange={e => setEditPlanFee(Number(e.target.value))}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Manual subscription tier change override */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Subscription Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="ACTIVE">Active Tier</option>
                        <option value="SUSPENDED">Suspended (Locked)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Renewal Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={e => setEditDueDate(e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium ${
                          isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTenantEdit}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

                {/* 2. Extend Subscription Section */}
                <div className="flex flex-col gap-3 border-t border-slate-800/30 pt-4">
                  <h4 className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">2. Manual Subscription Extension</h4>
                  <p className="text-[11px] text-slate-400">Adds an override to their renewal due date. Automatically moves status to Active.</p>
                  <div className="flex items-center gap-3">
                    <select
                      value={extendDays}
                      onChange={e => setExtendDays(Number(e.target.value))}
                      className={`px-3 py-2 rounded-xl text-xs border outline-none ${
                        isDarkMode ? 'bg-[#070b13] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value={15}>15 Days Override</option>
                      <option value={30}>30 Days Override</option>
                      <option value={90}>90 Days (3 Months)</option>
                      <option value={180}>180 Days (6 Months)</option>
                    </select>
                    <button
                      onClick={handleExtendTrialAction}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Apply Extension
                    </button>
                  </div>
                </div>

                {/* 3. Delete Tenant Section */}
                <div className="flex flex-col gap-3 border-t border-slate-800/30 pt-4 pb-2">
                  <h4 className="text-[10px] text-rose-400 font-black tracking-widest uppercase">3. Danger Zone</h4>
                  <p className="text-[11px] text-slate-400">Permanently delete this club tenant profile, associated asset catalogs, cafe POS records, and accounts.</p>
                  <button
                    onClick={() => handleDeleteTenantAction(selectedTenantForManage.id)}
                    className="py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-extrabold text-xs rounded-xl transition cursor-pointer self-start px-5"
                  >
                    Permanently Delete Tenant
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PREMIUM AUTOMATED TAX INVOICE & RECEIPT */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative max-w-2xl w-full p-8 rounded-3xl shadow-2xl bg-white text-slate-900 border border-slate-200 overflow-hidden z-10 flex flex-col gap-6"
              id="printable-tax-invoice"
            >
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h3 className="font-black text-2xl tracking-tight text-slate-950">JUSTCLUB</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise SaaS Table Management</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    Hytex Cotton Mills Premises,<br />
                    12/A Industrial Area, South Sector,<br />
                    Bengaluru, KA - 560001
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase">
                    TAX INVOICE
                  </span>
                  <p className="text-xs font-black text-slate-900 mt-3">Invoice #: INV-{selectedInvoice.orderId.split('_')[1] || selectedInvoice.orderId.substring(6)}</p>
                  <p className="text-xs text-slate-500 mt-1">Date: {(selectedInvoice.timestamp || '').split('T')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-5">
                <div>
                  <h4 className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider mb-1.5">Billed To:</h4>
                  <p className="font-black text-sm text-slate-950">{selectedInvoice.tenantName}</p>
                  <p className="text-slate-600 font-medium mt-1">{selectedInvoice.customerEmail}</p>
                  <p className="text-slate-500 mt-0.5 font-medium">+{selectedInvoice.customerPhone}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider mb-1.5">Payment Details:</h4>
                  <p className="font-bold text-slate-800">Gateway: Razorpay Enterprise</p>
                  <p className="text-slate-600 font-medium mt-1">Payment ID: {selectedInvoice.razorpayPaymentId || 'N/A'}</p>
                  <p className="text-slate-500 mt-0.5 font-medium">Status: SUCCESSFUL (PAID)</p>
                </div>
              </div>

              <div className="flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3.5">
                        <p className="font-bold text-slate-900">JustClub POS Subscription</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Cycle: {selectedInvoice.planName}</p>
                      </td>
                      <td className="py-3.5 text-center font-bold">1</td>
                      <td className="py-3.5 text-right font-medium">₹{Math.round(selectedInvoice.amount / 1.18)}</td>
                      <td className="py-3.5 text-right font-bold text-slate-950">₹{Math.round(selectedInvoice.amount / 1.18)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-5 flex flex-col gap-2 text-xs ml-auto w-64">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Subtotal (Excl. Tax)</span>
                  <span>₹{Math.round(selectedInvoice.amount / 1.18)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>GST (18% Integrated IGST)</span>
                  <span>₹{selectedInvoice.amount - Math.round(selectedInvoice.amount / 1.18)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-950 border-t border-slate-100 pt-2">
                  <span>Grand Total (Paid)</span>
                  <span>₹{selectedInvoice.amount}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-3">
                <p className="text-[10px] text-slate-400 font-medium">
                  This is a computer-generated tax invoice requiring no signature. Powered by JustClub Billing Engine.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const printContent = document.getElementById('printable-tax-invoice')?.innerHTML;
                      const originalContent = document.body.innerHTML;
                      if (printContent) {
                        document.body.innerHTML = printContent;
                        window.print();
                        document.body.innerHTML = originalContent;
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs transition cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
