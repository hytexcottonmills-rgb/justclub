export type AssetCategory = 
  | 'Billiards' 
  | 'Table Tennis' 
  | 'PS5' 
  | 'PC Gaming' 
  | 'VR' 
  | 'Foosball' 
  | 'Air Hockey' 
  | 'Darts' 
  | 'Karaoke' 
  | 'Board Games';

export type BillingIncrement = 'exact' | '15min';

export interface GameAsset {
  id: string;
  name: string;
  category: AssetCategory;
  hourlyRate: number; // in ₹
  billingIncrement: BillingIncrement;
  status: 'available' | 'occupied' | 'maintenance';
}

export type MatchType = 'solo' | '1v1' | '2v2';

export interface CustomerPlayer {
  id: string;
  name: string;
  whatsapp: string;
  ledgerBalance: number; // in ₹, negative = debit/owes, positive = credit
  totalVisits: number;
  lastVisitedDate: string;
  lifetimeValue: number; // in ₹
  notes?: string;
}

export interface BarItem {
  id: string;
  name: string;
  category: 'Beverages' | 'Snacks' | 'Lounge / Hookah' | 'Combos';
  price: number; // Tax inclusive ₹
  costPrice?: number; // Cost of goods sold ₹ (for profit calculation)
  stock: number | null; // null for unlimited
  iconName?: string;
}

export interface BarOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GameSession {
  id: string;
  assetId: string;
  assetName: string;
  category: AssetCategory;
  hourlyRate: number;
  billingIncrement: BillingIncrement;
  matchType: MatchType;
  taggedPlayers: CustomerPlayer[];
  startTime: number; // Epoch timestamp ms
  pausedAt: number | null;
  totalPausedDuration: number; // in seconds
  attachedBarOrders: BarOrderItem[];
  status: 'running' | 'paused' | 'completed';
  endedAt: number | null;
}

export type GameSplitRule = 'standard' | '1v1_equal' | '1v1_loser_pays' | '2v2_equal' | '2v2_loser_pays';
export type BarSplitRule = 'link_to_game_loser' | 'equal_share' | 'single_payer' | 'custom_split';
export type PaymentMethod = 'Cash' | 'UPI' | 'Ledger';

export interface PlayerSettlementShare {
  playerId: string;
  playerName: string;
  whatsapp: string;
  gameCostShare: number;
  barCostShare: number;
  totalShare: number;
  paymentMethod: PaymentMethod;
  isSettled: boolean;
  notes?: string;
}

export interface BillSettlementResult {
  sessionId: string;
  assetName: string;
  durationMinutes: number;
  totalGameCost: number;
  totalBarCost: number;
  grandTotal: number;
  gameSplitRule: GameSplitRule;
  barSplitRule: BarSplitRule;
  losingPlayerIds: string[];
  singlePayerId?: string;
  customBarSplitPlayerIds?: string[];
  shares: PlayerSettlementShare[];
  timestamp: string;
}

export interface ClubProfile {
  id: string;
  businessName: string;
  ownerName: string;
  whatsapp: string;
  pincode: string;
  upiId: string;
  tenantStatus: 'ACTIVE' | 'SUSPENDED';
  monthlyPlanFee: number; // ₹499/mo
  renewalDueDate: string;
  totalRevenueThisMonth: number;
}

export interface SuperAdminClubTenant {
  id: string;
  businessName: string;
  ownerName: string;
  whatsapp: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED';
  subscriptionDueDate: string;
  activeAssetsCount: number;
  monthlyRevenue: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  googleId?: string;
  role: 'club_owner' | 'club_manager' | 'superadmin';
  clubId?: string;
  loginProvider: 'google_one_tap' | 'google_oauth' | 'demo';
  loggedInAt: string;
}

export type AppView = 'landing' | 'onboarding' | 'login' | 'pos' | 'superadmin';

export interface CashfreeConfig {
  environment: 'TEST' | 'PRODUCTION';
  testAppId: string;
  testSecretKey: string;
  liveAppId: string;
  liveSecretKey: string;
  isEnabled: boolean;
  webhookSecret?: string;
  lastTestedAt?: string;
}

export interface CashfreePaymentOrder {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  paymentSessionId: string;
  paymentStatus: 'CREATED' | 'PAID' | 'FAILED' | 'PENDING';
  planName: string; // 'Monthly' | '3-Month' | 'Yearly'
  planCycle: 'monthly' | 'quarterly' | 'yearly';
  tenantId: string;
  tenantName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  cfPaymentId?: string;
  paymentMethod?: string;
  discountApplied?: number;
  promoCode?: string;
}
