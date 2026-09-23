import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant, LedgerEntry, BillRecord } from '../types';

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

export const initialGameAssets: GameAsset[] = [];

export const initialCustomers: CustomerPlayer[] = [];

export const initialBarItems: BarItem[] = [];

export const initialLedgerEntries: LedgerEntry[] = [];

export const initialGameSessions: GameSession[] = [];

export const initialSuperAdminTenants: SuperAdminClubTenant[] = [];

export const initialBills: BillRecord[] = [];
