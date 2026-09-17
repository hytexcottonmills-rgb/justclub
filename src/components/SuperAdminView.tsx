import React, { useState } from 'react';
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
  Layers,
  Radio,
  Terminal,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JustClubLogo, JustClubIcon } from './JustClubLogo';
import { api } from '../services/api';

interface SuperAdminViewProps {
  tenants: SuperAdminClubTenant[];
  currentProfile: ClubProfile;
  onToggleTenantStatus: (tenantId: string) => void;
  onToggleCurrentClubStatus: () => void;
  onAddTenant?: (tenant: Omit<SuperAdminClubTenant, 'id'>) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onExtendTrial?: (tenantId: string, days: number) => void;
  onLogManualPayment?: (tenantId: string, planName: string, amount: number) => void;
  onImpersonateClub?: (tenantId: string) => void;
  onUpdateTenant?: (tenant: SuperAdminClubTenant) => void;
  subscriptionConfig: SubscriptionConfig;
  onUpdateSubscriptionConfig: (config: SubscriptionConfig) => void;
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

interface SupportTicket {
  id: string;
  clubName: string;
  ownerName: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdDate: string;
  assignedAdmin: string;
  messages: { sender: string; text: string; timestamp: string }[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Platform Owner' | 'Platform Admin' | 'Finance Admin' | 'Support Admin' | 'Analyst';
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
  permissions: string[];
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
  onImpersonateClub,
  onUpdateTenant,
  subscriptionConfig,
  onUpdateSubscriptionConfig,
  isDarkMode = true,
}) => {
  // Local state to support rich actions
  const [tenants, setTenants] = useState<SuperAdminClubTenant[]>(initialTenants);

  // Sync prop changes
  React.useEffect(() => {
    setTenants(initialTenants);
  }, [initialTenants]);

  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'usage' | 'billing' | 'plans' | 'cashfree' | 'broadcast' | 'support' | 'rbac' | 'telemetry' | 'logs'>('overview');
  const [focusedClubId, setFocusedClubId] = useState<string | null>(null);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt_201',
      clubName: 'Imperial Snooker & Pool Hub',
      ownerName: 'Vikram Singh',
      subject: 'Custom table pricing logic issues',
      priority: 'HIGH',
      status: 'OPEN',
      createdDate: '2026-09-15 11:20:15',
      assignedAdmin: 'superadmin@justclub.in',
      messages: [
        { sender: 'Vikram Singh', text: 'Hi, I want to set different hourly rates for weekends after 8 PM, but the current billing setup seems to ignore weekend surges.', timestamp: '2026-09-15 11:20:15' }
      ]
    },
    {
      id: 'tkt_202',
      clubName: 'Velocity VR Arena',
      ownerName: 'Samantha Dmello',
      subject: 'Requesting manual Cashfree billing cycle sync',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdDate: '2026-09-14 09:40:00',
      assignedAdmin: 'finance@justclub.in',
      messages: [
        { sender: 'Samantha Dmello', text: 'Our yearly subscription was renewed yesterday on Cashfree but the POS dashboard still shows renewing in 1 day.', timestamp: '2026-09-14 09:40:00' },
        { sender: 'finance@justclub.in', text: 'Hi Samantha, checking the Cashfree webhook callback. We are matching the UPI transaction. It will be automated shortly.', timestamp: '2026-09-14 10:15:30' }
      ]
    },
    {
      id: 'tkt_203',
      clubName: 'Apex Cue Club',
      ownerName: 'Rohan Sharma',
      subject: 'Feature request: thermal receipt printing over Bluetooth',
      priority: 'LOW',
      status: 'RESOLVED',
      createdDate: '2026-09-12 14:10:22',
      assignedAdmin: 'support@justclub.in',
      messages: [
        { sender: 'Rohan Sharma', text: 'Can we connect standard Bluetooth 58mm thermal printers to print daily settlement sheets?', timestamp: '2026-09-12 14:10:22' },
        { sender: 'support@justclub.in', text: 'Yes, Rohan! You can print standard sheets from browser direct print options. Choose 58mm roll layout in chrome print preview.', timestamp: '2026-09-12 16:30:10' }
      ]
    }
  ]);

  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newTicketClub, setNewTicketClub] = useState('');

  // Admin Users & Roles State (RBAC)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: 'adm_1',
      name: 'Aditya Vardhan (Owner)',
      email: 'superadmin@justclub.in',
      role: 'Platform Owner',
      status: 'ACTIVE',
      lastActive: 'Active Now',
      permissions: ['clubs.view', 'clubs.create', 'clubs.edit', 'clubs.suspend', 'subscriptions.view', 'subscriptions.edit', 'payments.view', 'payments.refund', 'plans.view', 'plans.create', 'plans.edit', 'analytics.view', 'support.view', 'support.manage', 'broadcasts.create', 'audit_logs.view', 'system_settings.manage']
    },
    {
      id: 'adm_2',
      name: 'Pooja Nair',
      email: 'finance@justclub.in',
      role: 'Finance Admin',
      status: 'ACTIVE',
      lastActive: '12 mins ago',
      permissions: ['clubs.view', 'subscriptions.view', 'payments.view', 'payments.refund', 'plans.view', 'analytics.view', 'audit_logs.view']
    },
    {
      id: 'adm_3',
      name: 'Karan Mehra',
      email: 'support@justclub.in',
      role: 'Support Admin',
      status: 'ACTIVE',
      lastActive: '1 hr ago',
      permissions: ['clubs.view', 'clubs.edit', 'subscriptions.view', 'support.view', 'support.manage', 'broadcasts.create']
    },
    {
      id: 'adm_4',
      name: 'Siddharth Sen',
      email: 'analyst@justclub.in',
      role: 'Analyst',
      status: 'ACTIVE',
      lastActive: '3 days ago',
      permissions: ['clubs.view', 'subscriptions.view', 'analytics.view']
    }
  ]);

  const [activeAdminRole, setActiveAdminRole] = useState<'Platform Owner' | 'Platform Admin' | 'Finance Admin' | 'Support Admin' | 'Analyst'>('Platform Owner');

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Platform Owner' | 'Platform Admin' | 'Finance Admin' | 'Support Admin' | 'Analyst'>('Support Admin');

  // Broadcast Target Audience Filter
  const [broadcastAudience, setBroadcastAudience] = useState<'ALL' | 'ACTIVE_ONLY' | 'TRIAL_ONLY' | 'EXPIRED_ONLY'>('ALL');
  const [broadcastType, setBroadcastType] = useState<'info' | 'maintenance' | 'urgent' | 'promo'>('info');

  // Club Insights Modal Sub-Tabs
  const [insightsModalTab, setInsightsModalTab] = useState<'usage' | 'billing' | 'support' | 'telemetry'>('usage');
  
  // Managing single tenant modal state
  const [selectedTenantForManage, setSelectedTenantForManage] = useState<SuperAdminClubTenant | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Insights single tenant modal state
  const [selectedTenantForInsights, setSelectedTenantForInsights] = useState<SuperAdminClubTenant | null>(null);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAssetsCount, setEditAssetsCount] = useState<number>(4);
  const [editDueDate, setEditDueDate] = useState('');
  
  // Cashfree Payment Gateway Super Admin Config State
  const [cfEnvironment, setCfEnvironment] = useState<'TEST' | 'PRODUCTION'>('TEST');
  const [cfTestAppId, setCfTestAppId] = useState('');
  const [cfTestSecretKey, setCfTestSecretKey] = useState('');
  const [cfLiveAppId, setCfLiveAppId] = useState('');
  const [cfLiveSecretKey, setCfLiveSecretKey] = useState('');
  const [cfIsEnabled, setCfIsEnabled] = useState(true);
  const [cfWebhookSecret, setCfWebhookSecret] = useState('');

  const [hasTestSecretKey, setHasTestSecretKey] = useState(false);
  const [hasLiveSecretKey, setHasLiveSecretKey] = useState(false);
  const [hasWebhookSecret, setHasWebhookSecret] = useState(false);
  
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [cfTestTesting, setCfTestTesting] = useState(false);
  const [cfTestResult, setCfTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  React.useEffect(() => {
    api.cashfree.getConfig().then((res) => {
      if (res?.success && res.config) {
        setCfEnvironment(res.config.environment || 'TEST');
        setCfTestAppId(res.config.testAppId || '');
        setCfLiveAppId(res.config.liveAppId || '');
        setCfIsEnabled(Boolean(res.config.isEnabled));
        setHasTestSecretKey(Boolean(res.config.hasTestSecretKey));
        setHasLiveSecretKey(Boolean(res.config.hasLiveSecretKey));
        setHasWebhookSecret(Boolean(res.config.hasWebhookSecret));
      }
    }).catch(() => {});
  }, []);

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
  
  // Comprehensive Search & Filter States
  // 1. Club Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRING_SOON'>('ALL');
  const [tenantCityFilter, setTenantCityFilter] = useState<string>('ALL');
  const [tenantAssetRangeFilter, setTenantAssetRangeFilter] = useState<'ALL' | '1-4' | '5-8' | '9+'>('ALL');
  const [tenantSortBy, setTenantSortBy] = useState<'name_asc' | 'name_desc' | 'turnover_desc' | 'turnover_asc' | 'assets_desc' | 'due_date_asc'>('turnover_desc');

  // 2. Live Usage Stats
  const [usageSearchQuery, setUsageSearchQuery] = useState('');
  const [usageStatusFilter, setUsageStatusFilter] = useState<'ALL' | 'ACTIVE_ONLY' | 'VACANT_ONLY'>('ALL');
  const [usageGameFilter, setUsageGameFilter] = useState<string>('ALL');
  const [usageSortBy, setUsageSortBy] = useState<'default' | 'duration_desc' | 'amount_desc' | 'name_asc'>('default');

  // 3. Billing & Invoices
  const [billingSearchQuery, setBillingSearchQuery] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [billingMethodFilter, setBillingMethodFilter] = useState<string>('ALL');
  const [billingPlanFilter, setBillingPlanFilter] = useState<string>('ALL');
  const [billingSortBy, setBillingSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // 4. Support Tickets
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<'ALL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [ticketAdminFilter, setTicketAdminFilter] = useState<string>('ALL');

  // 5. RBAC Team
  const [rbacSearchQuery, setRbacSearchQuery] = useState('');
  const [rbacRoleFilter, setRbacRoleFilter] = useState<string>('ALL');
  const [rbacStatusFilter, setRbacStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // 6. System Telemetry
  const [telemetrySearchQuery, setTelemetrySearchQuery] = useState('');
  const [telemetrySyncFilter, setTelemetrySyncFilter] = useState<'ALL' | 'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE'>('ALL');
  const [telemetryLatencyFilter, setTelemetryLatencyFilter] = useState<'ALL' | 'FAST' | 'NORMAL' | 'SLOW'>('ALL');
  const [telemetrySortBy, setTelemetrySortBy] = useState<'latency_asc' | 'latency_desc' | 'name_asc'>('latency_asc');

  // 7. Audit Logs
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [logsSeverityFilter, setLogsSeverityFilter] = useState<'ALL' | 'success' | 'info' | 'warning'>('ALL');
  const [logsAdminFilter, setLogsAdminFilter] = useState<string>('ALL');

  // 8. Promo Codes
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAXED'>('ALL');
  
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

  // Local state for dynamic subscription tiers editing
  const [editingTrialDays, setEditingTrialDays] = useState(subscriptionConfig.trialPeriodDays);
  const [editingPlans, setEditingPlans] = useState(subscriptionConfig.plans);

  React.useEffect(() => {
    setEditingTrialDays(subscriptionConfig.trialPeriodDays);
    setEditingPlans(subscriptionConfig.plans);
  }, [subscriptionConfig]);

  const handleSaveTrialDays = () => {
    onUpdateSubscriptionConfig({
      ...subscriptionConfig,
      trialPeriodDays: editingTrialDays
    });
    showAlert(`Global trial period set to ${editingTrialDays} days!`);
  };

  const handleUpdatePlanField = (id: 'monthly' | 'quarterly' | 'yearly', field: keyof SubscriptionPlan, value: any) => {
    setEditingPlans(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, [field]: value };
    }));
  };

  const handleSavePlanTier = (id: 'monthly' | 'quarterly' | 'yearly') => {
    const updatedPlan = editingPlans.find(p => p.id === id);
    if (!updatedPlan) return;

    const newPlans = subscriptionConfig.plans.map(p => p.id === id ? updatedPlan : p);
    onUpdateSubscriptionConfig({
      ...subscriptionConfig,
      plans: newPlans
    });
    showAlert(`Successfully updated tier details for "${updatedPlan.name}"!`);
  };

  // Metrics Calculations
  const activeTenantsCount = tenants.filter(t => t.status === 'ACTIVE').length;
  const totalSubRevenue = activeTenantsCount * 499; // Base MRR ₹499
  const arrProjection = totalSubRevenue * 12;
  const totalClubsRevenue = tenants.reduce((acc, t) => acc + t.monthlyRevenue, 0);
  const totalAssetsCount = tenants.reduce((acc, t) => acc + t.activeAssetsCount, 0);

  // Dynamic unique lists for filter dropdowns
  const uniqueCities = Array.from(new Set(tenants.map(t => t.city).filter(Boolean)));
  const uniqueAdmins = Array.from(new Set(adminUsers.map(u => u.email)));
  const uniqueRoles = Array.from(new Set(adminUsers.map(u => u.role)));

  // 1. Filtered & Sorted Tenants List
  const filteredTenants = tenants
    .filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.businessName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.whatsapp.includes(q) ||
        t.id.toLowerCase().includes(q);

      // Status filter logic (including expiring soon <= 7 days)
      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') matchesStatus = t.status === 'ACTIVE';
      else if (statusFilter === 'SUSPENDED') matchesStatus = t.status === 'SUSPENDED';
      else if (statusFilter === 'EXPIRING_SOON') {
        const dueDate = new Date(t.subscriptionDueDate).getTime();
        const now = Date.now();
        const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
        matchesStatus = diffDays >= 0 && diffDays <= 7;
      }

      // City filter
      const matchesCity = tenantCityFilter === 'ALL' || t.city.toLowerCase() === tenantCityFilter.toLowerCase();

      // Asset Range filter
      let matchesAssetRange = true;
      if (tenantAssetRangeFilter === '1-4') matchesAssetRange = t.activeAssetsCount >= 1 && t.activeAssetsCount <= 4;
      else if (tenantAssetRangeFilter === '5-8') matchesAssetRange = t.activeAssetsCount >= 5 && t.activeAssetsCount <= 8;
      else if (tenantAssetRangeFilter === '9+') matchesAssetRange = t.activeAssetsCount >= 9;

      return matchesSearch && matchesStatus && matchesCity && matchesAssetRange;
    })
    .sort((a, b) => {
      if (tenantSortBy === 'name_asc') return a.businessName.localeCompare(b.businessName);
      if (tenantSortBy === 'name_desc') return b.businessName.localeCompare(a.businessName);
      if (tenantSortBy === 'turnover_desc') return b.monthlyRevenue - a.monthlyRevenue;
      if (tenantSortBy === 'turnover_asc') return a.monthlyRevenue - b.monthlyRevenue;
      if (tenantSortBy === 'assets_desc') return b.activeAssetsCount - a.activeAssetsCount;
      if (tenantSortBy === 'due_date_asc') return new Date(a.subscriptionDueDate).getTime() - new Date(b.subscriptionDueDate).getTime();
      return 0;
    });

  // 2. Filtered & Sorted Live Usage Tables Data
  const rawUsageTables = focusedClubId
    ? [
        { id: 'T1', name: 'Snooker Table 1 (Star Tournament)', status: 'ACTIVE', game: 'English Snooker', time: '1h 14m', durationMins: 74, amount: 370, players: 'Vikram & Rohan', club: tenants.find(t => t.id === focusedClubId)?.businessName || 'Current Club' },
        { id: 'T2', name: 'Pool Table 2 (Riley 9ft)', status: 'ACTIVE', game: '9-Ball Rotation', time: '42m', durationMins: 42, amount: 210, players: 'Aditya & Guest', club: tenants.find(t => t.id === focusedClubId)?.businessName || 'Current Club' },
        { id: 'T3', name: 'Pool Table 3 (Apex 8ft)', status: 'VACANT', game: '8-Ball Standard', time: 'Idle 15m', durationMins: 0, amount: 0, players: 'None', club: tenants.find(t => t.id === focusedClubId)?.businessName || 'Current Club' },
        { id: 'T4', name: 'PlayStation 5 VIP Lounge', status: 'ACTIVE', game: 'EA FC 24 Tournament', time: '2h 05m', durationMins: 125, amount: 625, players: 'Karan + 3 Players', club: tenants.find(t => t.id === focusedClubId)?.businessName || 'Current Club' },
      ]
    : [
        { id: 'T1', name: 'Imperial Hub • Table 1', status: 'ACTIVE', game: 'Snooker 15-Red', time: '1h 22m', durationMins: 82, amount: 410, players: 'Vikram & Guest', club: 'Imperial Snooker & Pool Hub' },
        { id: 'T2', name: 'Imperial Hub • Table 2', status: 'ACTIVE', game: '9-Ball Pool', time: '35m', durationMins: 35, amount: 175, players: 'Rohan Sharma', club: 'Imperial Snooker & Pool Hub' },
        { id: 'T3', name: 'Velocity VR • Arena 1', status: 'ACTIVE', game: 'Beat Saber VR', time: '50m', durationMins: 50, amount: 500, players: 'Samantha D.', club: 'Velocity VR Arena' },
        { id: 'T4', name: 'Velocity VR • Arena 2', status: 'VACANT', game: 'Racing Sim Rig', time: 'Idle 8m', durationMins: 0, amount: 0, players: 'None', club: 'Velocity VR Arena' },
        { id: 'T5', name: 'Apex Cue • Table 1', status: 'ACTIVE', game: 'Snooker Match', time: '1h 45m', durationMins: 105, amount: 525, players: 'Adil & Sunny', club: 'Apex Cue Club' },
        { id: 'T6', name: 'Apex Cue • Table 2', status: 'VACANT', game: '8-Ball Pool', time: 'Idle 22m', durationMins: 0, amount: 0, players: 'None', club: 'Apex Cue Club' },
        { id: 'T7', name: 'Royal Lounge • VIP PS5', status: 'ACTIVE', game: 'Tekken 8 League', time: '1h 10m', durationMins: 70, amount: 350, players: 'Pranav & Rishi', club: 'Royal Billiards Lounge' },
        { id: 'T8', name: 'Royal Lounge • Table 1', status: 'ACTIVE', game: 'English Billiards', time: '28m', durationMins: 28, amount: 140, players: 'Mahesh K.', club: 'Royal Billiards Lounge' },
      ];

  const filteredUsageTables = rawUsageTables
    .filter(tbl => {
      const q = usageSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        tbl.name.toLowerCase().includes(q) ||
        tbl.game.toLowerCase().includes(q) ||
        tbl.players.toLowerCase().includes(q) ||
        tbl.club.toLowerCase().includes(q);

      const matchesStatus = usageStatusFilter === 'ALL' ||
        (usageStatusFilter === 'ACTIVE_ONLY' && tbl.status === 'ACTIVE') ||
        (usageStatusFilter === 'VACANT_ONLY' && tbl.status === 'VACANT');

      const matchesGame = usageGameFilter === 'ALL' || tbl.game.toLowerCase().includes(usageGameFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesGame;
    })
    .sort((a, b) => {
      if (usageSortBy === 'duration_desc') return b.durationMins - a.durationMins;
      if (usageSortBy === 'amount_desc') return b.amount - a.amount;
      if (usageSortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  // 3. Filtered & Sorted Billing History Invoices
  const filteredBillingTransactions = cashfreeTransactions
    .filter(tx => {
      const q = billingSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        tx.orderId.toLowerCase().includes(q) ||
        tx.cfPaymentId.toLowerCase().includes(q) ||
        tx.tenantName.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q);

      const matchesClub = !focusedClubId || tx.tenantName === tenants.find(t => t.id === focusedClubId)?.businessName;
      const matchesStatus = billingStatusFilter === 'ALL' || tx.status === billingStatusFilter;
      const matchesMethod = billingMethodFilter === 'ALL' || tx.method.toLowerCase().includes(billingMethodFilter.toLowerCase());
      const matchesPlan = billingPlanFilter === 'ALL' || tx.planName.toLowerCase().includes(billingPlanFilter.toLowerCase());

      return matchesSearch && matchesClub && matchesStatus && matchesMethod && matchesPlan;
    })
    .sort((a, b) => {
      if (billingSortBy === 'date_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (billingSortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (billingSortBy === 'amount_desc') return b.amount - a.amount;
      if (billingSortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

  // 4. Filtered Support Tickets
  const filteredSupportTickets = supportTickets
    .filter(tkt => {
      const q = ticketSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        tkt.id.toLowerCase().includes(q) ||
        tkt.clubName.toLowerCase().includes(q) ||
        tkt.ownerName.toLowerCase().includes(q) ||
        tkt.subject.toLowerCase().includes(q) ||
        tkt.messages.some(m => m.text.toLowerCase().includes(q));

      const matchesStatus = ticketStatusFilter === 'ALL' || tkt.status === ticketStatusFilter;
      const matchesPriority = ticketPriorityFilter === 'ALL' || tkt.priority === ticketPriorityFilter;
      const matchesAdmin = ticketAdminFilter === 'ALL' || tkt.assignedAdmin === ticketAdminFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAdmin;
    })
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  // 5. Filtered Admin Users (RBAC)
  const filteredAdminUsers = adminUsers.filter(u => {
    const q = rbacSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.permissions.some(p => p.toLowerCase().includes(q));

    const matchesRole = rbacRoleFilter === 'ALL' || u.role === rbacRoleFilter;
    const matchesStatus = rbacStatusFilter === 'ALL' || u.status === rbacStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 6. Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const q = logsSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      log.action.toLowerCase().includes(q) ||
      log.targetTenant.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.timestamp.includes(q);

    const matchesSeverity = logsSeverityFilter === 'ALL' || log.severity === logsSeverityFilter;
    const matchesAdmin = logsAdminFilter === 'ALL' || log.adminEmail === logsAdminFilter;

    return matchesSearch && matchesSeverity && matchesAdmin;
  });

  // 7. Filtered Promo Codes
  const filteredPromoCodes = promoCodes.filter(pc => {
    const q = promoSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || pc.code.toLowerCase().includes(q);
    const matchesStatus = promoStatusFilter === 'ALL' ||
      (promoStatusFilter === 'ACTIVE' && pc.usesCount < pc.maxUses) ||
      (promoStatusFilter === 'MAXED' && pc.usesCount >= pc.maxUses);

    return matchesSearch && matchesStatus;
  });

  // 8. Filtered Telemetry Tenants
  const filteredTelemetryTenants = tenants.filter(t => {
    const q = telemetrySearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      t.businessName.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);

    const matchesClub = !focusedClubId || t.id === focusedClubId;
    return matchesSearch && matchesClub;
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

  const handleOpenManageModal = (tenant: SuperAdminClubTenant) => {
    setSelectedTenantForManage(tenant);
    setEditBusinessName(tenant.businessName);
    setEditOwnerName(tenant.ownerName);
    setEditWhatsapp(tenant.whatsapp);
    setEditCity(tenant.city);
    setEditAssetsCount(tenant.activeAssetsCount);
    setEditDueDate(tenant.subscriptionDueDate);
    setIsManageModalOpen(true);
  };

  const handleOpenInsightsModal = (tenant: SuperAdminClubTenant) => {
    setSelectedTenantForInsights(tenant);
    setInsightsModalTab('usage');
    setIsInsightsModalOpen(true);
  };

  const handleSaveTenantManage = () => {
    if (!selectedTenantForManage) return;

    const updated: SuperAdminClubTenant = {
      ...selectedTenantForManage,
      businessName: editBusinessName,
      ownerName: editOwnerName,
      whatsapp: editWhatsapp,
      city: editCity,
      activeAssetsCount: editAssetsCount,
      subscriptionDueDate: editDueDate,
    };

    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    
    if (onUpdateTenant) {
      onUpdateTenant(updated);
    }

    setAuditLogs(prev => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        adminEmail: 'superadmin@justclub.in',
        action: 'Tenant Updated Manually',
        targetTenant: updated.businessName,
        severity: 'info',
      },
      ...prev,
    ]);

    setIsManageModalOpen(false);
    setSelectedTenantForManage(null);
    showAlert(`Successfully updated details for "${updated.businessName}"!`);
  };

  const handleAddDaysToSub = (days: number) => {
    if (!editDueDate) return;
    const current = new Date(editDueDate);
    current.setDate(current.getDate() + days);
    setEditDueDate(current.toISOString().split('T')[0]);
    showAlert(`Added +${days} Days to subscription expiration date.`);
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
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden">
      
      {/* LEFT ENTERPRISE NAVIGATION SIDEBAR */}
      <aside className={`w-full lg:w-64 shrink-0 p-4 lg:p-5 rounded-2xl border flex flex-col justify-between lg:h-full lg:overflow-y-auto ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-5">
          <div className={`pb-3.5 border-b ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Master Control</span>
            </div>
            <div className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aditya V. (Platform Owner)</div>
          </div>

          <div className="space-y-4">
            {/* Category: MAIN CORE */}
            <div>
              <div className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-2 px-1">Main Core</div>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setFocusedClubId(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'overview'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Telemetry & Overview</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tenants');
                    setFocusedClubId(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2.5 ${
                    activeTab === 'tenants'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Club Tenant Directory</span>
                  </div>
                  <span className="bg-slate-950/60 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 border border-slate-800/60">
                    {tenants.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('usage')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'usage'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Live Usage Stats</span>
                </button>

                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'billing'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Billing History & Invoices</span>
                </button>

                <button
                  onClick={() => setActiveTab('plans')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'plans'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Subscription Tiers</span>
                </button>

                <button
                  onClick={() => setActiveTab('cashfree')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'cashfree'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cashfree Gateway</span>
                </button>
              </nav>
            </div>

            {/* Category: OPERATIONS */}
            <div>
              <div className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-2 px-1">Operations</div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('broadcast')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'broadcast'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Send className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Global Broadcast Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2.5 ${
                    activeTab === 'support'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Client Support Tickets</span>
                  </div>
                  {supportTickets.filter(t => t.status === 'OPEN').length > 0 && (
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-red-500/20">
                      {supportTickets.filter(t => t.status === 'OPEN').length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Category: SECURITY & AUDIT */}
            <div>
              <div className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-2 px-1">Security & Audit</div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('rbac')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'rbac'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Admin RBAC & Roles</span>
                </button>

                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'telemetry'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>System Telemetry & Health</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                    activeTab === 'logs'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Server className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Audit & System Logs</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Status */}
        <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <span>SaaS Server Hook:</span>
            <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono">Node ID: master_node_2026</div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN PANEL CONTENT */}
      <div className="flex-1 space-y-6 lg:overflow-y-auto lg:h-full min-h-0 pr-1 pb-12">
        
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
          
          {/* Controls Bar: Multi-Dimensional Search + Filters + Add Button */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-xl">
            {/* Top Row: Search Input + Onboard Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search club name, owner, city, phone (+91), or ID..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsAddTenantModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Plus className="w-4 h-4" /> Onboard New Club
              </button>
            </div>

            {/* Bottom Row: Status Filter Pills + City Dropdown + Asset Range + Sort By */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              {/* Left Group: Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" /> Status:
                </span>
                {[
                  { id: 'ALL', label: 'All Clubs' },
                  { id: 'ACTIVE', label: 'Active (₹499/mo)' },
                  { id: 'SUSPENDED', label: 'Suspended' },
                  { id: 'EXPIRING_SOON', label: 'Expiring Soon (≤7d)' },
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                      statusFilter === st.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Right Group: City, Fleet Size, Sort By Dropdowns & Reset */}
              <div className="flex flex-wrap items-center gap-2">
                {/* City Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">City:</span>
                  <select
                    value={tenantCityFilter}
                    onChange={(e) => setTenantCityFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Cities ({uniqueCities.length})</option>
                    {uniqueCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Fleet Size Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">Fleet:</span>
                  <select
                    value={tenantAssetRangeFilter}
                    onChange={(e) => setTenantAssetRangeFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Sizes</option>
                    <option value="1-4">1-4 Tables</option>
                    <option value="5-8">5-8 Tables</option>
                    <option value="9+">9+ Tables</option>
                  </select>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-0.5">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort:
                  </span>
                  <select
                    value={tenantSortBy}
                    onChange={(e) => setTenantSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="turnover_desc">Turnover (High → Low)</option>
                    <option value="turnover_asc">Turnover (Low → High)</option>
                    <option value="name_asc">Name (A → Z)</option>
                    <option value="name_desc">Name (Z → A)</option>
                    <option value="assets_desc">Assets (Most First)</option>
                    <option value="due_date_asc">Renewal (Earliest First)</option>
                  </select>
                </div>

                {/* Reset Filters button */}
                {(searchQuery || statusFilter !== 'ALL' || tenantCityFilter !== 'ALL' || tenantAssetRangeFilter !== 'ALL' || tenantSortBy !== 'turnover_desc') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setTenantCityFilter('ALL');
                      setTenantAssetRangeFilter('ALL');
                      setTenantSortBy('turnover_desc');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold transition flex items-center gap-1"
                    title="Reset all directory filters"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* Active Filter Summary Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                Showing <strong className="text-white font-mono">{filteredTenants.length}</strong> of <strong className="text-white font-mono">{tenants.length}</strong> partner clubs
              </span>
              {filteredTenants.length < tenants.length && (
                <span className="text-amber-400 font-medium">Filtered active</span>
              )}
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
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* 1. Edit Profile & Status Modal (Has Save function) */}
                              <button
                                onClick={() => handleOpenManageModal(tenant)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 flex items-center gap-1 transition"
                                title="Edit Club Profile, Owner Details & Renewal Due Date"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              {/* 2. Live Usage Stats View */}
                              <button
                                onClick={() => {
                                  setFocusedClubId(tenant.id);
                                  setActiveTab('usage');
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center gap-1 transition"
                                title="View Real-Time Club Usage & Activity Stats"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                Usage
                              </button>

                              {/* 3. Billing History View */}
                              <button
                                onClick={() => {
                                  setFocusedClubId(tenant.id);
                                  setActiveTab('billing');
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 transition"
                                title="View Billing History, Cashfree Payments & Invoices"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Billing
                              </button>

                              {/* 4. Client Tickets View */}
                              <button
                                onClick={() => {
                                  setNewTicketClub(tenant.businessName);
                                  setActiveTab('support');
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-1 transition"
                                title="View & Create Client Support Tickets"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Tickets
                              </button>

                              {/* 5. System Telemetry View */}
                              <button
                                onClick={() => {
                                  setFocusedClubId(tenant.id);
                                  setActiveTab('telemetry');
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 transition"
                                title="View System Telemetry, Latency & Node Health"
                              >
                                <Cpu className="w-3.5 h-3.5" />
                                Telemetry
                              </button>

                              {/* Impersonate */}
                              {onImpersonateClub && (
                                <button
                                  onClick={() => onImpersonateClub(tenant.id)}
                                  className="px-2 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 flex items-center gap-1 transition"
                                  title="Impersonate club POS terminal"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Toggle Suspend/Active */}
                              <button
                                onClick={() => handleToggleTenant(tenant.id)}
                                className={`px-2 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                }`}
                                title={isSuspended ? 'Reactivate Club' : 'Suspend Club Access'}
                              >
                                {isSuspended ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
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
      {/* TAB: LIVE USAGE STATS & CLUB METRICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse text-sky-400" /> Real-time Activity Pulse
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Synced across all POS terminals</span>
                </div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-400" /> Live Club Usage & Asset Utilization
                </h2>
                <p className="text-xs text-slate-400">Monitor live active table sessions, player check-ins, peak occupancy, and hourly gameplay statistics.</p>
              </div>

              {/* Club Selector Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-slate-400">Target Club:</label>
                <select
                  value={focusedClubId || 'ALL'}
                  onChange={(e) => setFocusedClubId(e.target.value === 'ALL' ? null : e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Partner Clubs ({tenants.length})</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.businessName} ({t.city})</option>
                  ))}
                </select>
                {focusedClubId && (
                  <button
                    onClick={() => setFocusedClubId(null)}
                    className="px-2.5 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                    title="Show all clubs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Filters: Search Asset/Player + Session Status + Game Type + Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={usageSearchQuery}
                  onChange={(e) => setUsageSearchQuery(e.target.value)}
                  placeholder="Search table, game type, player..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
                {usageSearchQuery && (
                  <button
                    onClick={() => setUsageSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">State:</span>
                <select
                  value={usageStatusFilter}
                  onChange={(e) => setUsageStatusFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All States (Active & Vacant)</option>
                  <option value="ACTIVE_ONLY">Active In-Session Only</option>
                  <option value="VACANT_ONLY">Vacant / Idle Only</option>
                </select>
              </div>

              {/* Game Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Game:</span>
                <select
                  value={usageGameFilter}
                  onChange={(e) => setUsageGameFilter(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Game Types</option>
                  <option value="Snooker">Snooker Tables</option>
                  <option value="Pool">Pool / 8-Ball / 9-Ball</option>
                  <option value="Billiards">English Billiards</option>
                  <option value="PlayStation">PS5 / Console VIP</option>
                  <option value="VR">VR / Simulators</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-0.5">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort:
                </span>
                <select
                  value={usageSortBy}
                  onChange={(e) => setUsageSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="default">Default Order</option>
                  <option value="duration_desc">Longest Elapsed Time</option>
                  <option value="amount_desc">Highest Accrued Bill</option>
                  <option value="name_asc">Asset Name (A → Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Usage KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Active Table Sessions</span>
                <Activity className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {focusedClubId 
                  ? `${Math.floor((tenants.find(t => t.id === focusedClubId)?.activeAssetsCount || 4) * 0.75)} / ${tenants.find(t => t.id === focusedClubId)?.activeAssetsCount || 4}`
                  : `19 / ${totalAssetsCount}`}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 74% Current Fleet Occupancy
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Players Clocked-in Today</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {focusedClubId ? '38 Players' : '184 Players'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Avg. Group Size: 2.6 Players
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Peak Occupancy Slot</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">08:00 - 11:30 PM</div>
              <div className="text-[11px] text-amber-400 font-semibold">96% Weekend Surge Demand</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Avg. Playtime Duration</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">78 Minutes</div>
              <div className="text-[11px] text-emerald-400 font-semibold">+14% vs. last month</div>
            </div>
          </div>

          {/* Live Table Assets Visual State Grid */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Live Table & Gaming Terminal Fleet Status
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {filteredUsageTables.length} Assets Found
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  {focusedClubId 
                    ? `Viewing live telemetry for ${tenants.find(t => t.id === focusedClubId)?.businessName}`
                    : 'Real-time telemetry across all club partner locations'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                Auto-refreshes every 5s
              </span>
            </div>

            {filteredUsageTables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredUsageTables.map(tbl => {
                  const isActive = tbl.status === 'ACTIVE';
                  return (
                    <div 
                      key={tbl.id} 
                      className={`p-4 rounded-2xl border transition ${
                        isActive 
                          ? 'bg-slate-950/80 border-sky-500/30 shadow-lg shadow-sky-950/20' 
                          : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-white text-xs truncate" title={tbl.name}>{tbl.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tbl.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Game Type:</span>
                          <span className="text-slate-200 font-semibold">{tbl.game}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Session Elapsed:</span>
                          <span className="text-sky-400 font-mono font-bold">{tbl.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Accrued Bill:</span>
                          <span className="text-emerald-400 font-mono font-bold">₹{tbl.amount}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/60 mt-1">
                          Players: <span className="text-slate-300 font-medium">{tbl.players}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850 space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-400">No table sessions match your filter criteria.</div>
                <button
                  onClick={() => {
                    setUsageSearchQuery('');
                    setUsageStatusFilter('ALL');
                    setUsageGameFilter('ALL');
                    setUsageSortBy('default');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold underline"
                >
                  Clear Usage Filters
                </button>
              </div>
            )}
          </div>

          {/* Per-Club Performance Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-black text-white text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" /> Club Tenant Activity & POS Turnover Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="p-3">Club Name</th>
                    <th className="p-3">Active Assets</th>
                    <th className="p-3">Today's Sessions</th>
                    <th className="p-3">Today's POS Turnover</th>
                    <th className="p-3">F&B Cross Sales</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-bold text-white">
                        <div>{t.businessName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{t.city} • {t.ownerName}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-400">
                        {t.activeAssetsCount} Tables/Consoles
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {Math.floor(t.activeAssetsCount * 3.4)} Sessions
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        ₹{(Math.floor(t.monthlyRevenue / 30) * 1.2).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-semibold">
                        ₹{Math.floor(t.monthlyRevenue * 0.08).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setFocusedClubId(t.id);
                            setActiveTab('billing');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition"
                        >
                          View Billing →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: BILLING HISTORY & INVOICES LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Cashfree Gateway Verified
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Automated GST Invoicing & Webhooks</span>
              </div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" /> SaaS Billing History & Invoices Ledger
              </h2>
              <p className="text-xs text-slate-400">Review subscription invoice records, Cashfree online payments, manual bank settlements, and renewal dates.</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  showAlert('Tax invoice summary export generated for all active subscriptions.');
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Export CSV
              </button>
            </div>
          </div>

          {/* Billing KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Monthly Recurring (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ₹{totalSubRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400">Base ₹499/club/month</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Projected ARR</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400 font-mono">
                ₹{arrProjection.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">+22% YoY Growth Rate</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Upcoming Renewals</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {tenants.filter(t => t.status === 'ACTIVE').length} Clubs
              </div>
              <div className="text-[11px] text-amber-400 font-medium">Within next 30 days</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Payment Success Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">99.4%</div>
              <div className="text-[11px] text-slate-400">Via Cashfree UPI & Cards</div>
            </div>
          </div>

          {/* Master Invoices & Payment Ledger Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" /> Complete Subscription Invoices & Payment Logs
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {filteredBillingTransactions.length} Records
                  </span>
                </h3>
                <span className="text-xs text-slate-400">Cashfree transaction ledgers and automated GST billing receipts</span>
              </div>
            </div>

            {/* Filter Toolbar for Billing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
              {/* Search Bar */}
              <div className="relative lg:col-span-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={billingSearchQuery}
                  onChange={(e) => setBillingSearchQuery(e.target.value)}
                  placeholder="Search order ID, CF Ref, tenant, or method..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
                {billingSearchQuery && (
                  <button
                    onClick={() => setBillingSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tenant Dropdown */}
              <select
                value={focusedClubId || 'ALL'}
                onChange={(e) => setFocusedClubId(e.target.value === 'ALL' ? null : e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Tenants ({tenants.length})</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.businessName}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={billingStatusFilter}
                onChange={(e) => setBillingStatusFilter(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success Only</option>
                <option value="PENDING">Pending Only</option>
                <option value="FAILED">Failed Only</option>
              </select>

              {/* Sort By */}
              <select
                value={billingSortBy}
                onChange={(e) => setBillingSortBy(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="date_desc">Date (Newest First)</option>
                <option value="date_asc">Date (Oldest First)</option>
                <option value="amount_desc">Amount (High → Low)</option>
                <option value="amount_asc">Amount (Low → High)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="p-3">Invoice / Order ID</th>
                    <th className="p-3">Club Partner</th>
                    <th className="p-3">Plan Tier</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBillingTransactions.length > 0 ? (
                    filteredBillingTransactions.map((tx) => (
                      <tr key={tx.orderId} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-mono font-bold text-indigo-400">
                          {tx.orderId}
                          <div className="text-[10px] text-slate-500 font-normal">CF Ref: {tx.cfPaymentId}</div>
                        </td>
                        <td className="p-3 font-bold text-white">
                          {tx.tenantName}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                            {tx.planName}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-black text-emerald-400">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-medium text-slate-300">
                          {tx.method}
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          {tx.timestamp}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => showAlert(`Downloading GST Tax Invoice for order ${tx.orderId}...`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Download GST Tax Invoice PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showAlert(`WhatsApp receipt sent to ${tx.tenantName} owner!`)}
                              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold transition flex items-center gap-1"
                              title="Send WhatsApp payment confirmation receipt"
                            >
                              <Send className="w-3 h-3" /> WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No billing transactions match your filter criteria.
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
          
          {/* Global Trial Config Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" /> Dynamic Platform Trial Period Settings
                </h2>
                <p className="text-xs text-slate-400">Configure the number of free trial days granted automatically to newly onboarded clubs.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={editingTrialDays}
                  onChange={(e) => setEditingTrialDays(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center font-bold focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveTrialDays}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Save Trial Days
                </button>
              </div>
            </div>
          </div>

          {/* Active 3 Subscription Tiers Cards */}
          <div>
            <h2 className="text-base font-bold text-white mb-3">Managed Platform Subscription Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editingPlans.map((p, idx) => {
                const isYearly = p.id === 'yearly';
                const isQuarterly = p.id === 'quarterly';
                const borderClass = isYearly 
                  ? 'border-purple-500/40 text-purple-400' 
                  : isQuarterly 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-slate-800 text-slate-400';
                return (
                  <div key={p.id} className={`p-6 rounded-2xl bg-slate-900 border space-y-4 relative ${borderClass}`}>
                    {p.discountLabel && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full">
                        {p.discountLabel}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                        Tier {idx + 1} • {p.id.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-300">
                        Edit Mode
                      </span>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdatePlanField(p.id, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={p.amount}
                            onChange={(e) => handleUpdatePlanField(p.id, 'amount', Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Duration (Months)</label>
                          <input
                            type="number"
                            value={p.periodMonths}
                            onChange={(e) => handleUpdatePlanField(p.id, 'periodMonths', Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Discount Label</label>
                        <input
                          type="text"
                          value={p.discountLabel}
                          onChange={(e) => handleUpdatePlanField(p.id, 'discountLabel', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSavePlanTier(p.id)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Save Tier Settings
                    </button>
                  </div>
                );
              })}
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

            {/* Active Promo Codes List with Search */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" /> Active Marketing Coupons
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {filteredPromoCodes.length} Codes
                  </span>
                </h3>

                {/* Promo search input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={promoSearchQuery}
                    onChange={(e) => setPromoSearchQuery(e.target.value)}
                    placeholder="Search promo code..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                  {promoSearchQuery && (
                    <button
                      onClick={() => setPromoSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {filteredPromoCodes.length > 0 ? (
                  filteredPromoCodes.map(pc => (
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
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No promo codes match "{promoSearchQuery}".
                  </div>
                )}
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
                        placeholder={hasTestSecretKey ? '•••••••••••••••• (Secret Saved - leave blank to keep)' : 'cfsk_ma_test_...'}
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
                        placeholder={hasLiveSecretKey ? '•••••••••••••••• (Secret Saved - leave blank to keep)' : 'cfsk_ma_prod_...'}
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
                <input
                  type="password"
                  value={cfWebhookSecret}
                  onChange={(e) => setCfWebhookSecret(e.target.value)}
                  placeholder={hasWebhookSecret ? '•••••••••••••••• (Webhook Secret Saved - leave blank to keep)' : 'Webhook Signing Secret...'}
                  className="mt-2 w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  disabled={cfTestTesting}
                  onClick={async () => {
                    setCfTestTesting(true);
                    setCfTestResult(null);
                    try {
                      const res = await api.cashfree.saveConfig({
                        environment: cfEnvironment,
                        testAppId: cfTestAppId,
                        testSecretKey: cfTestSecretKey,
                        liveAppId: cfLiveAppId,
                        liveSecretKey: cfLiveSecretKey,
                        isEnabled: cfIsEnabled,
                        webhookSecret: cfWebhookSecret,
                      });
                      if (res.success) {
                        setCfTestResult({ success: true, message: 'Configuration saved successfully' });
                        showAlert('Connection configuration saved successfully!');
                      }
                    } catch (e: any) {
                      setCfTestResult({ success: false, message: e.message || 'Connection test failed' });
                    } finally {
                      setCfTestTesting(false);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cfTestTesting ? 'animate-spin' : ''}`} />
                  <span>Test & Save</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.cashfree.saveConfig({
                        environment: cfEnvironment,
                        testAppId: cfTestAppId,
                        testSecretKey: cfTestSecretKey,
                        liveAppId: cfLiveAppId,
                        liveSecretKey: cfLiveSecretKey,
                        isEnabled: cfIsEnabled,
                        webhookSecret: cfWebhookSecret,
                      });
                      if (res.success) {
                        showAlert('Cashfree credentials saved & updated on full-stack server!');
                        const fresh = await api.cashfree.getConfig();
                        if (fresh?.success && fresh.config) {
                          setHasTestSecretKey(Boolean(fresh.config.hasTestSecretKey));
                          setHasLiveSecretKey(Boolean(fresh.config.hasLiveSecretKey));
                          setHasWebhookSecret(Boolean(fresh.config.hasWebhookSecret));
                          setCfTestSecretKey('');
                          setCfLiveSecretKey('');
                          setCfWebhookSecret('');
                        }
                      }
                    } catch (e: any) {
                      showAlert(`Failed to save: ${e.message || 'Unauthorized'}`);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" /> Push Real-Time Broadcast Message
            </h2>
            <p className="text-xs text-slate-400">
              Publish an urgent notification banner that will appear instantly at the top of targeted Club Owner's POS terminals.
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Broadcast Severity Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e: any) => setBroadcastType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="info">📢 Information / Update (Blue)</option>
                    <option value="maintenance">🔧 Scheduled Maintenance (Orange)</option>
                    <option value="urgent">🚨 Urgent System Alert (Red)</option>
                    <option value="promo">🎁 Promotional offer (Amber)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Audience Segment</label>
                  <select
                    value={broadcastAudience}
                    onChange={(e: any) => setBroadcastAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="ALL">All Clubs (India-wide)</option>
                    <option value="ACTIVE_ONLY">Active Paid Subscribers Only</option>
                    <option value="TRIAL_ONLY">Active Trials Only</option>
                    <option value="EXPIRED_ONLY">Suspended/Expired Terminals Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Push Announcement Now
                </button>
              </div>
            </form>
          </div>

          {/* Broadcast Center Info */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Currently Broadcasted
            </h3>
            <p className="text-[11px] text-slate-400">
              The currently active message displayed on all live terminals:
            </p>

            {activeBroadcast ? (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-indigo-400">
                  <span>Audience: {broadcastAudience}</span>
                  <span>Type: {broadcastType}</span>
                </div>
                <p className="text-white text-[11px] leading-relaxed font-mono">{activeBroadcast}</p>
                <button
                  onClick={() => {
                    setActiveBroadcast(null);
                    showAlert('Broadcast removed from live environment.');
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold underline"
                >
                  Remove Broadcast
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-850 text-slate-500 text-center rounded-xl italic">
                No active broadcast message. Terminals are in default idle state.
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Read / Delivery Telemetry</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-xl">
                  <div className="text-white font-bold font-mono text-base">98.2%</div>
                  <div className="text-[9px] text-slate-500 uppercase font-black">Delivered</div>
                </div>
                <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-xl">
                  <div className="text-indigo-400 font-bold font-mono text-base">84%</div>
                  <div className="text-[9px] text-slate-500 uppercase font-black">Acknowledged</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: GLOBAL SUPPORT CENTER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Panel: Ticket List & Search / Filters */}
          <div className="xl:col-span-1 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-sky-400" /> Client Tickets
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {filteredSupportTickets.length} of {supportTickets.length}
                  </span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  SaaS Helpdesk
                </span>
              </div>

              {/* Support Tickets Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  placeholder="Search subject, club, ticket ID..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
                {ticketSearchQuery && (
                  <button
                    onClick={() => setTicketSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      ticketStatusFilter === st
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Priority:</span>
                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => setTicketPriorityFilter(e.target.value as any)}
                  className="flex-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent Only</option>
                  <option value="HIGH">High Only</option>
                  <option value="MEDIUM">Medium Only</option>
                  <option value="LOW">Low Only</option>
                </select>
              </div>

              {/* Tickets Stack */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 pt-1">
                {filteredSupportTickets.length > 0 ? (
                  filteredSupportTickets.map((tkt) => {
                    const statusColors = {
                      OPEN: 'bg-red-500/20 text-red-400 border-red-500/30',
                      IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                      RESOLVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                      CLOSED: 'bg-slate-850 text-slate-500 border-slate-800'
                    };
                    const priorityColors = {
                      LOW: 'text-slate-400',
                      MEDIUM: 'text-indigo-400',
                      HIGH: 'text-amber-400 font-bold',
                      URGENT: 'text-rose-500 font-black animate-pulse'
                    };

                    return (
                      <div 
                        key={tkt.id} 
                        onClick={() => {
                          setNewTicketClub(tkt.id);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                          newTicketClub === tkt.id 
                            ? 'bg-slate-800/80 border-sky-500/50 shadow-md' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] text-slate-500 font-bold">{tkt.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusColors[tkt.status]}`}>
                            {tkt.status}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-white leading-tight">{tkt.subject}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{tkt.clubName}</p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-900">
                          <span className="text-slate-500">{tkt.createdDate.slice(0, 10)}</span>
                          <span className={priorityColors[tkt.priority]}>{tkt.priority} Priority</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs italic">
                    No tickets found matching your filter criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Create Support Ticket Header */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white">Create On-Behalf Ticket</h3>
              <div className="space-y-2.5">
                <input 
                  type="text"
                  placeholder="Ticket Subject..."
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
                <select
                  value={newTicketPriority}
                  onChange={(e: any) => setNewTicketPriority(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Escalation</option>
                </select>
                <button
                  onClick={() => {
                    if (!newTicketSubject) return;
                    const newT: SupportTicket = {
                      id: `tkt_${Date.now().toString().slice(-3)}`,
                      clubName: 'Apex Cue Club',
                      ownerName: 'Rohan Sharma',
                      subject: newTicketSubject,
                      priority: newTicketPriority,
                      status: 'OPEN',
                      createdDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      assignedAdmin: 'support@justclub.in',
                      messages: [{ sender: 'System On-Behalf', text: newTicketSubject, timestamp: new Date().toISOString() }]
                    };
                    setSupportTickets(prev => [newT, ...prev]);
                    setNewTicketClub(newT.id);
                    setNewTicketSubject('');
                    showAlert('Direct support ticket opened & assigned successfully.');
                  }}
                  className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition"
                >
                  Create Live Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Chat Thread View */}
          <div className="xl:col-span-2">
            {(() => {
              const activeTkt = supportTickets.find(t => t.id === newTicketClub) || supportTickets[0];
              if (!activeTkt) {
                return (
                  <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-850 italic">
                    Select a support ticket to view details and reply to the club administrator.
                  </div>
                );
              }

              return (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between h-full min-h-[50vh]">
                  {/* Ticket Header Controls */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-sky-400">{activeTkt.id}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {activeTkt.priority}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-white text-base leading-snug">{activeTkt.subject}</h3>
                      <p className="text-xs text-slate-400 mt-1">Club: <strong className="text-slate-300">{activeTkt.clubName}</strong> ({activeTkt.ownerName})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={activeTkt.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as any;
                          setSupportTickets(prev => prev.map(t => t.id === activeTkt.id ? { ...t, status: nextStatus } : t));
                          showAlert(`Ticket ${activeTkt.id} status updated to ${nextStatus}.`);
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-xl font-bold text-white focus:outline-none"
                      >
                        <option value="OPEN">🔴 Open</option>
                        <option value="IN_PROGRESS">🟡 In Progress</option>
                        <option value="RESOLVED">🟢 Resolved</option>
                        <option value="CLOSED">⚫ Closed</option>
                      </select>

                      <select
                        value={activeTkt.assignedAdmin}
                        onChange={(e) => {
                          const nextAdmin = e.target.value;
                          setSupportTickets(prev => prev.map(t => t.id === activeTkt.id ? { ...t, assignedAdmin: nextAdmin } : t));
                          showAlert(`Ticket assigned to ${nextAdmin}.`);
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-xl text-slate-300 focus:outline-none"
                      >
                        <option value="superadmin@justclub.in">Aditya (Owner)</option>
                        <option value="finance@justclub.in">Pooja (Finance)</option>
                        <option value="support@justclub.in">Karan (Support)</option>
                      </select>
                    </div>
                  </div>

                  {/* Chat Messages Frame */}
                  <div className="flex-1 overflow-y-auto max-h-[35vh] space-y-3 p-2 bg-slate-950/40 rounded-xl border border-slate-850 my-2">
                    {activeTkt.messages.map((msg, i) => {
                      const isOwner = msg.sender === activeTkt.ownerName || msg.sender === 'System On-Behalf';
                      return (
                        <div key={i} className={`flex flex-col max-w-[80%] ${isOwner ? 'mr-auto items-start' : 'ml-auto items-end'}`}>
                          <span className="text-[9px] text-slate-500 font-bold mb-0.5">{msg.sender}</span>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isOwner 
                              ? 'bg-slate-800 text-slate-200 rounded-tl-none' 
                              : 'bg-indigo-600 text-white rounded-tr-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const inputElement = e.currentTarget.elements.namedItem('replyText') as HTMLTextAreaElement;
                      if (!inputElement || !inputElement.value.trim()) return;
                      const text = inputElement.value;
                      
                      setSupportTickets(prev => prev.map(t => {
                        if (t.id !== activeTkt.id) return t;
                        return {
                          ...t,
                          messages: [...t.messages, { sender: activeTkt.assignedAdmin, text, timestamp: new Date().toISOString() }],
                          status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status
                        };
                      }));
                      inputElement.value = '';
                      showAlert('Reply sent to the club administrator POS terminal.');
                    }}
                    className="space-y-2 text-xs pt-2 border-t border-slate-800"
                  >
                    <label className="text-slate-400 font-bold block">Send Reply to Tenant POS</label>
                    <div className="flex gap-2">
                      <textarea
                        name="replyText"
                        rows={2}
                        placeholder={`Reply as ${activeTkt.assignedAdmin.split('@')[0]}...`}
                        className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition flex items-center justify-center shrink-0 self-stretch"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: ADMIN RBAC & SECURITY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Admin Team List */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" /> Platform Administrative Users & RBAC Roles
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {filteredAdminUsers.length} of {adminUsers.length} Members
                  </span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Granular Permissions Active
                </span>
              </div>

              {/* RBAC Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rbacSearchQuery}
                    onChange={(e) => setRbacSearchQuery(e.target.value)}
                    placeholder="Search team member name, email..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  {rbacSearchQuery && (
                    <button
                      onClick={() => setRbacSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={rbacRoleFilter}
                  onChange={(e) => setRbacRoleFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All SaaS Roles</option>
                  <option value="Platform Owner">Platform Owner</option>
                  <option value="Platform Admin">Platform Admin</option>
                  <option value="Finance Admin">Finance Admin</option>
                  <option value="Support Admin">Support Admin</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-850">
                    <tr>
                      <th className="p-3">Administrator</th>
                      <th className="p-3">SaaS Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Scope Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/40">
                    {filteredAdminUsers.length > 0 ? (
                      filteredAdminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/20">
                          <td className="p-3">
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-[10px] text-slate-500">{user.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[11px]">{user.lastActive}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setActiveAdminRole(user.role);
                                showAlert(`Simulated administrative scope switched to: ${user.role}`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                activeAdminRole === user.role
                                  ? 'bg-emerald-600 text-slate-950'
                                  : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                              }`}
                            >
                              {activeAdminRole === user.role ? 'Active Scope' : 'Assume Role'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
                          No team members match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Admin Form */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Onboard New Team Member</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="E-mail Address"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newAdminRole}
                      onChange={(e: any) => setNewAdminRole(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="Platform Admin">Platform Admin</option>
                      <option value="Finance Admin">Finance Admin</option>
                      <option value="Support Admin">Support Admin</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!newAdminName || !newAdminEmail) return;
                        const newU: AdminUser = {
                          id: `adm_${Date.now().toString().slice(-3)}`,
                          name: newAdminName,
                          email: newAdminEmail,
                          role: newAdminRole,
                          status: 'ACTIVE',
                          lastActive: 'Just now',
                          permissions: ['clubs.view', 'subscriptions.view']
                        };
                        setAdminUsers(prev => [...prev, newU]);
                        setNewAdminName('');
                        setNewAdminEmail('');
                        showAlert(`Team member "${newAdminName}" invited as ${newAdminRole}.`);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Role Scope Permissions Display */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-400" /> Active Role Scope
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Assumed Role Scope:</span>
                  <div className="text-sm font-black text-white mt-0.5">{activeAdminRole}</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Scope Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {(() => {
                      const permissions = adminUsers.find(u => u.role === activeAdminRole)?.permissions || ['clubs.view'];
                      return permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900/50 text-indigo-300 font-mono text-[9px]">
                          {p}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SaaS Control Center Sign-ins</span>
                  <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between p-1.5 rounded bg-slate-950/40">
                      <span>👤 Aditya V. (Mumbai)</span>
                      <span className="text-emerald-400 font-bold">SUCCESS</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-slate-950/40">
                      <span>👤 Pooja N. (Chennai)</span>
                      <span className="text-emerald-400 font-bold">SUCCESS</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-slate-950/40">
                      <span>👤 Karan M. (Delhi)</span>
                      <span className="text-amber-400 font-bold">2FA PENDING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: SYSTEM TELEMETRY & NODE HEALTH */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" /> Edge Node Heartbeat
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Real-time WebSocket & SQLite sync monitoring</span>
              </div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" /> System Telemetry, Terminal Health & Network Latency
              </h2>
              <p className="text-xs text-slate-400">Track per-club POS device synchronization, SQLite offline buffer states, edge API latencies, and server health.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showAlert('⚡ System Ping Diagnostic Suite initiated: All 4 cloud regions reporting <35ms latency.')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <Activity className="w-4 h-4" /> Run Edge Ping Test
              </button>
            </div>
          </div>

          {/* Regional Edge Node Health Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Bangalore Master Node</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-2xl font-black text-white font-mono">18ms</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Primary Core API Gateway (99.99%)</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Mumbai Relay Node</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">22ms</div>
              <div className="text-[11px] text-emerald-400 font-semibold">WebSocket State Broadcast</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Delhi Edge Cache</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">29ms</div>
              <div className="text-[11px] text-emerald-400 font-semibold">POS Offline Sync Relay</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Database Query Latency</span>
                <Database className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">3.8ms</div>
              <div className="text-[11px] text-slate-400 font-mono">Connection Pool: 100% Healthy</div>
            </div>
          </div>

          {/* Per-Club Connected POS Terminal Telemetry */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Club POS Terminal Fleet & Hardware Telemetry
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {filteredTelemetryTenants.length} Active Nodes
                  </span>
                </h3>
                <span className="text-xs text-slate-400">Hardware sync health, browser PWA storage, and websocket channels</span>
              </div>
            </div>

            {/* Filter toolbar for Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <div className="relative lg:col-span-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={telemetrySearchQuery}
                  onChange={(e) => setTelemetrySearchQuery(e.target.value)}
                  placeholder="Search club, node ID, city..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
                {telemetrySearchQuery && (
                  <button
                    onClick={() => setTelemetrySearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={focusedClubId || 'ALL'}
                onChange={(e) => setFocusedClubId(e.target.value === 'ALL' ? null : e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Partner Clubs ({tenants.length})</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.businessName}</option>
                ))}
              </select>

              <select
                value={telemetrySyncFilter}
                onChange={(e) => setTelemetrySyncFilter(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Sync States</option>
                <option value="SYNCED">Synchronized Only</option>
                <option value="BUFFERING">Buffering / Pending</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="p-3">Club & Terminal Node</th>
                    <th className="p-3">POS Environment</th>
                    <th className="p-3">Local SQLite Sync State</th>
                    <th className="p-3">Offline Storage Cache</th>
                    <th className="p-3">Socket Latency</th>
                    <th className="p-3">Last Heartbeat</th>
                    <th className="p-3 text-right">Diagnostic Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTelemetryTenants.length > 0 ? (
                    filteredTelemetryTenants.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-bold text-white font-sans">
                          <div>{t.businessName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Node: node_pos_{t.id.replace('clb_', '')} • {t.city}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-sans text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono">
                            Chrome Desktop PWA
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> SYNCHRONIZED
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {(2.1 + (idx * 0.4)).toFixed(1)} MB IndexedDB
                        </td>
                        <td className="p-3 text-cyan-400 font-bold">
                          {18 + (idx * 5)}ms
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {idx === 0 ? 'Just now' : `${idx * 2}s ago`}
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            onClick={() => showAlert(`📡 Heartbeat test sent to ${t.businessName}: Response returned in ${18 + (idx * 4)}ms (0% packet drop).`)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/20 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <Activity className="w-3 h-3" /> Ping Node
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                        No club terminal nodes match your filter criteria.
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
      {/* TAB 5: AUDIT LOGS & TELEMETRY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" /> System Audit Trail & Telemetry Logs
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {filteredAuditLogs.length} of {auditLogs.length} Events
                </span>
              </h2>

              <button
                onClick={() => showAlert('System audit log exported to CSV file format.')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Logs
              </button>
            </div>

            {/* Audit Log Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={logsSearchQuery}
                  onChange={(e) => setLogsSearchQuery(e.target.value)}
                  placeholder="Search audit action, target club, admin email..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
                {logsSearchQuery && (
                  <button
                    onClick={() => setLogsSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={logsSeverityFilter}
                onChange={(e) => setLogsSeverityFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Event Types</option>
                <option value="success">Success Events</option>
                <option value="warning">Warning Events</option>
                <option value="info">Info Events</option>
              </select>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {filteredAuditLogs.length > 0 ? (
                filteredAuditLogs.map(log => (
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
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs font-sans">
                  No audit logs match your filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div> {/* Close of right-side panel content */}

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

      {/* MANAGE / EDIT CLUB TENANT & SUBSCRIPTION MODAL */}
      {isManageModalOpen && selectedTenantForManage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">Club Administration Suite</span>
                <h3 className="font-extrabold text-white text-base">Manage {selectedTenantForManage.businessName}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsManageModalOpen(false);
                  setSelectedTenantForManage(null);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs overflow-y-auto max-h-[60vh] pr-1">
              
              {/* EDIT PROFILE DETAILS */}
              <div className="space-y-4">
                <div className="space-y-3">
                    <h4 className="font-black text-white text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" /> Club Profile Information
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Club Name</label>
                        <input
                          type="text"
                          value={editBusinessName}
                          onChange={(e) => setEditBusinessName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Owner Name</label>
                        <input
                          type="text"
                          value={editOwnerName}
                          onChange={(e) => setEditOwnerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">WhatsApp Phone</label>
                        <input
                          type="text"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">City / Region</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Active Table/Console Assets Count</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={editAssetsCount}
                        onChange={(e) => setEditAssetsCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: SUBSCRIPTION ADJUSTMENT */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-black text-white text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-400" /> Manual Subscription Controls
                    </h4>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1 text-[10px] uppercase">Manual Subscription Renewal Date</label>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Quick Increment Subscription</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddDaysToSub(30)}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-xl font-bold font-mono transition"
                          >
                            +30 Days
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddDaysToSub(90)}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-xl font-bold font-mono transition"
                          >
                            +90 Days
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddDaysToSub(365)}
                            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-xl font-bold font-mono transition"
                          >
                            +1 Year
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="border-t border-slate-800 pt-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsManageModalOpen(false);
                    setSelectedTenantForManage(null);
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveTenantManage}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" /> Save Changes
                </button>
              </div>
            </div>
          </div>
      )}

    </div>
  );
};
