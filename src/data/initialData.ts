import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant, LedgerEntry, BillRecord, MembershipPlan } from '../types';

export const initialClubProfile: ClubProfile = {
  id: '',
  businessName: '',
  ownerName: '',
  whatsapp: '',
  pincode: '',
  upiId: '',
  paymentSlug: '',
  tenantStatus: 'ACTIVE',
  monthlyPlanFee: 0,
  renewalDueDate: '',
  totalRevenueThisMonth: 0,
};

export const initialMembershipPlans: MembershipPlan[] = [
  {
    id: 'plan_gold_30',
    name: 'Gold Member (30% Off)',
    price: 999,
    durationDays: 30,
    gameDiscountPercent: 30,
    barDiscountPercent: 0,
    description: '30% discount on all game table sessions for 30 days',
    isActive: true,
  },
  {
    id: 'plan_vip_50',
    name: 'VIP Club Pass (50% Off)',
    price: 1999,
    durationDays: 30,
    gameDiscountPercent: 50,
    barDiscountPercent: 10,
    description: '50% off game tables + 10% off cafe orders for 30 days',
    isActive: true,
  },
  {
    id: 'plan_practice_100',
    name: 'Practice Pass (100% Off)',
    price: 3499,
    durationDays: 30,
    gameDiscountPercent: 100,
    barDiscountPercent: 0,
    description: '100% free table play for solo & practice sessions for 30 days',
    isActive: true,
  },
  {
    id: 'plan_silver_15',
    name: 'Silver Saver (15% Off)',
    price: 499,
    durationDays: 30,
    gameDiscountPercent: 15,
    barDiscountPercent: 0,
    description: '15% discount on all game table sessions for 30 days',
    isActive: true,
  },
];

export const initialGameAssets: GameAsset[] = [];

export const initialCustomers: CustomerPlayer[] = [];

export const initialBarItems: BarItem[] = [];

export const initialLedgerEntries: LedgerEntry[] = [];

export const initialGameSessions: GameSession[] = [];

export const initialSuperAdminTenants: SuperAdminClubTenant[] = [];

export const initialBills: BillRecord[] = [];
