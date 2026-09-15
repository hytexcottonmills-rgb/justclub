import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant } from '../types';

export const initialClubProfile: ClubProfile = {
  id: 'club_001',
  businessName: 'Apex Cue & Gaming Club',
  ownerName: 'Rahul Sharma',
  whatsapp: '+919876543210',
  pincode: '400053',
  upiId: 'apexclub@okaxis',
  tenantStatus: 'ACTIVE',
  monthlyPlanFee: 1999,
  renewalDueDate: '2026-10-15',
  totalRevenueThisMonth: 84250,
};

export const initialGameAssets: GameAsset[] = [
  { id: 'ast_1', name: 'Table 1 - Rasson 9ft Tournament', category: 'Billiards', hourlyRate: 300, billingIncrement: 'exact', status: 'available' },
  { id: 'ast_2', name: 'Table 2 - Star Snooker 12ft', category: 'Billiards', hourlyRate: 350, billingIncrement: '15min', status: 'available' },
  { id: 'ast_3', name: 'Table 3 - Pool Club Classic', category: 'Billiards', hourlyRate: 250, billingIncrement: 'exact', status: 'available' },
  { id: 'ast_4', name: 'Console A - PS5 4K (FC 25 & GTA)', category: 'PS5', hourlyRate: 240, billingIncrement: 'exact', status: 'occupied' },
  { id: 'ast_5', name: 'Console B - PS5 4K (Tekken 8)', category: 'PS5', hourlyRate: 240, billingIncrement: '15min', status: 'available' },
  { id: 'ast_6', name: 'VR Station 1 - Meta Quest 3 Full Motion', category: 'VR', hourlyRate: 450, billingIncrement: 'exact', status: 'available' },
  { id: 'ast_7', name: 'Table Tennis Pro 1', category: 'Table Tennis', hourlyRate: 200, billingIncrement: 'exact', status: 'available' },
];

export const initialCustomers: CustomerPlayer[] = [
  { id: 'cust_1', name: 'Amitabh Roy', whatsapp: '+919811122233', ledgerBalance: -850, totalVisits: 14, lastVisitedDate: '2026-09-14', lifetimeValue: 6400 },
  { id: 'cust_2', name: 'Karan Mehra', whatsapp: '+919822233344', ledgerBalance: 0, totalVisits: 8, lastVisitedDate: '2026-09-12', lifetimeValue: 3800 },
  { id: 'cust_3', name: 'Sneha Kapoor', whatsapp: '+919833344455', ledgerBalance: -1200, totalVisits: 22, lastVisitedDate: '2026-09-15', lifetimeValue: 12400 },
  { id: 'cust_4', name: 'Rohan Verma', whatsapp: '+919844455566', ledgerBalance: 450, totalVisits: 5, lastVisitedDate: '2026-09-10', lifetimeValue: 2100 },
  { id: 'cust_5', name: 'Priya Nair', whatsapp: '+919855566677', ledgerBalance: -841, totalVisits: 19, lastVisitedDate: '2026-09-15', lifetimeValue: 9800 },
];

export const initialBarItems: BarItem[] = [
  { id: 'item_1', name: 'Red Bull Energy Drink', category: 'Beverages', price: 175, costPrice: 110, stock: 45 },
  { id: 'item_2', name: 'Cold Brew Iced Coffee', category: 'Beverages', price: 190, costPrice: 70, stock: 30 },
  { id: 'item_3', name: 'Peri Peri French Fries', category: 'Snacks', price: 220, costPrice: 65, stock: 50 },
  { id: 'item_4', name: 'Loaded Cheese Nachos', category: 'Snacks', price: 280, costPrice: 90, stock: 40 },
  { id: 'item_5', name: 'Mint Mojito Mocktail', category: 'Beverages', price: 210, costPrice: 50, stock: 60 },
  { id: 'item_6', name: 'Hookah - Double Apple Ice', category: 'Lounge / Hookah', price: 650, costPrice: 150, stock: 100 },
  { id: 'item_7', name: 'Gamer Fuel Combo (Red Bull + Fries)', category: 'Combos', price: 350, costPrice: 150, stock: 25 },
];

export const initialGameSessions: GameSession[] = [
  {
    id: 'sess_running_1',
    assetId: 'ast_4',
    assetName: 'Console A - PS5 4K (FC 25 & GTA)',
    category: 'PS5',
    hourlyRate: 240,
    billingIncrement: 'exact',
    matchType: '2v2',
    taggedPlayers: [initialCustomers[0], initialCustomers[1]],
    startTime: Date.now() - 42 * 60 * 1000,
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'item_1', name: 'Red Bull Energy Drink', price: 175, quantity: 2 },
      { itemId: 'item_3', name: 'Peri Peri French Fries', price: 220, quantity: 1 }
    ],
    status: 'running',
    endedAt: null,
  }
];

export const initialSuperAdminTenants: SuperAdminClubTenant[] = [
  {
    id: 'club_001',
    businessName: 'Apex Cue & Gaming Club',
    ownerName: 'Rahul Sharma',
    whatsapp: '+919876543210',
    city: 'Mumbai',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-15',
    activeAssetsCount: 7,
    monthlyRevenue: 84250,
  },
  {
    id: 'club_002',
    businessName: 'Imperial Snooker Lounge',
    ownerName: 'Vikram Malhotra',
    whatsapp: '+919822233344',
    city: 'Delhi',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-09-28',
    activeAssetsCount: 12,
    monthlyRevenue: 112000,
  }
];
