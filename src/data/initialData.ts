import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant } from '../types';

export const initialClubProfile: ClubProfile = {
  id: 'club_001',
  businessName: 'Apex Cue & Gaming Club',
  ownerName: 'Rajaganapathy S.',
  whatsapp: '+919876543210',
  pincode: '600001',
  upiId: 'apexcueclub@okaxis',
  tenantStatus: 'ACTIVE',
  monthlyPlanFee: 499,
  renewalDueDate: '2026-10-01',
  totalRevenueThisMonth: 84250,
};

export const initialGameAssets: GameAsset[] = [
  {
    id: 'ast_1',
    name: 'Table 1 - Rasson 9ft Tournament',
    category: 'Billiards',
    hourlyRate: 300,
    billingIncrement: 'exact',
    status: 'occupied',
  },
  {
    id: 'ast_2',
    name: 'Table 2 - Star Snooker 12ft',
    category: 'Billiards',
    hourlyRate: 350,
    billingIncrement: '15min',
    status: 'occupied',
  },
  {
    id: 'ast_3',
    name: 'Table 3 - Pool Club Classic',
    category: 'Billiards',
    hourlyRate: 250,
    billingIncrement: 'exact',
    status: 'available',
  },
  {
    id: 'ast_4',
    name: 'Console A - PS5 4K (FC 25 & GTA)',
    category: 'PS5',
    hourlyRate: 240,
    billingIncrement: 'exact',
    status: 'occupied',
  },
  {
    id: 'ast_5',
    name: 'Console B - PS5 4K (Tekken 8)',
    category: 'PS5',
    hourlyRate: 240,
    billingIncrement: '15min',
    status: 'available',
  },
  {
    id: 'ast_6',
    name: 'VR Station 1 - Meta Quest 3 Full Motion',
    category: 'VR',
    hourlyRate: 450,
    billingIncrement: '15min',
    status: 'available',
  },
  {
    id: 'ast_7',
    name: 'Table Tennis Arena 1',
    category: 'Table Tennis',
    hourlyRate: 180,
    billingIncrement: 'exact',
    status: 'available',
  },
];

export const initialCustomers: CustomerPlayer[] = [
  {
    id: 'cust_1',
    name: 'Rajaganapathy',
    whatsapp: '919876543210',
    ledgerBalance: -350, // Debit (owes club ₹350)
    totalVisits: 28,
    lastVisitedDate: '2026-09-12',
    lifetimeValue: 18500,
    notes: 'Regular snooker player, prefers Table 2.',
  },
  {
    id: 'cust_2',
    name: 'Vikram Sethi',
    whatsapp: '919840123456',
    ledgerBalance: 0,
    totalVisits: 14,
    lastVisitedDate: '2026-09-13',
    lifetimeValue: 9200,
    notes: 'PS5 FIFA enthusiast.',
  },
  {
    id: 'cust_3',
    name: 'Arjun Verma',
    whatsapp: '919711223344',
    ledgerBalance: -620, // Debit (owes ₹620)
    totalVisits: 9,
    lastVisitedDate: '2026-08-05', // 40 days ago -> At-Risk
    lifetimeValue: 6400,
  },
  {
    id: 'cust_4',
    name: 'Karthik Raja',
    whatsapp: '919940556677',
    ledgerBalance: 0,
    totalVisits: 45,
    lastVisitedDate: '2026-09-14',
    lifetimeValue: 34100,
    notes: 'VIP customer, high spender.',
  },
  {
    id: 'cust_5',
    name: 'Suresh Kumar',
    whatsapp: '919884112233',
    ledgerBalance: -1200, // Debit (owes ₹1200)
    totalVisits: 19,
    lastVisitedDate: '2026-06-10', // > 90 days ago -> Churned
    lifetimeValue: 12800,
  },
  {
    id: 'cust_6',
    name: 'Deepak Sharma',
    whatsapp: '919789012345',
    ledgerBalance: 0,
    totalVisits: 6,
    lastVisitedDate: '2026-08-10', // At-Risk
    lifetimeValue: 3900,
  },
  {
    id: 'cust_7',
    name: 'Rohan Mehta',
    whatsapp: '919654321098',
    ledgerBalance: 150, // Credit (+₹150 advance)
    totalVisits: 22,
    lastVisitedDate: '2026-09-11',
    lifetimeValue: 15400,
  },
];

export const initialBarItems: BarItem[] = [
  {
    id: 'bar_1',
    name: 'Red Bull Energy Drink (250ml)',
    category: 'Beverages',
    price: 160,
    stock: 42,
  },
  {
    id: 'bar_2',
    name: 'Iced Cold Coffee (Large)',
    category: 'Beverages',
    price: 120,
    stock: 80,
  },
  {
    id: 'bar_3',
    name: 'Fresh Lemon Soda (Salt/Sweet)',
    category: 'Beverages',
    price: 80,
    stock: 120,
  },
  {
    id: 'bar_4',
    name: 'Peri Peri Loaded Fries',
    category: 'Snacks',
    price: 150,
    stock: 35,
  },
  {
    id: 'bar_5',
    name: 'Chicken Wings (6 Pcs)',
    category: 'Snacks',
    price: 240,
    stock: 20,
  },
  {
    id: 'bar_6',
    name: 'Paneer Tikka Roll',
    category: 'Snacks',
    price: 180,
    stock: 25,
  },
  {
    id: 'bar_7',
    name: 'Premium Mint Hookah',
    category: 'Lounge / Hookah',
    price: 650,
    stock: 15,
  },
  {
    id: 'bar_8',
    name: 'Gamer Fuel Combo (2x RedBull + Fries)',
    category: 'Combos',
    price: 420,
    stock: 30,
  },
];

const now = Date.now();
// Mock running sessions started 42 minutes ago and 25 minutes ago
export const initialGameSessions: GameSession[] = [
  {
    id: 'sess_101',
    assetId: 'ast_1',
    assetName: 'Table 1 - Rasson 9ft Tournament',
    category: 'Billiards',
    hourlyRate: 300,
    billingIncrement: 'exact',
    matchType: '1v1',
    taggedPlayers: [initialCustomers[0], initialCustomers[1]], // Rajaganapathy & Vikram
    startTime: now - (48 * 60 * 1000 + 30 * 1000), // 48 mins 30 secs running
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'bar_1', name: 'Red Bull Energy Drink (250ml)', price: 160, quantity: 2 },
      { itemId: 'bar_4', name: 'Peri Peri Loaded Fries', price: 150, quantity: 1 },
    ],
    status: 'running',
    endedAt: null,
  },
  {
    id: 'sess_102',
    assetId: 'ast_2',
    assetName: 'Table 2 - Star Snooker 12ft',
    category: 'Billiards',
    hourlyRate: 350,
    billingIncrement: '15min',
    matchType: '2v2',
    taggedPlayers: [initialCustomers[3], initialCustomers[6], initialCustomers[2], initialCustomers[5]], // 4 players
    startTime: now - (85 * 60 * 1000), // 1 hour 25 mins
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'bar_2', name: 'Iced Cold Coffee (Large)', price: 120, quantity: 4 },
      { itemId: 'bar_7', name: 'Premium Mint Hookah', price: 650, quantity: 1 },
    ],
    status: 'running',
    endedAt: null,
  },
  {
    id: 'sess_103',
    assetId: 'ast_4',
    assetName: 'Console A - PS5 4K (FC 25 & GTA)',
    category: 'PS5',
    hourlyRate: 240,
    billingIncrement: 'exact',
    matchType: 'solo',
    taggedPlayers: [initialCustomers[1]], // Vikram
    startTime: now - (22 * 60 * 1000), // 22 mins
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'bar_3', name: 'Fresh Lemon Soda (Salt/Sweet)', price: 80, quantity: 1 },
    ],
    status: 'running',
    endedAt: null,
  },
];

export const initialSuperAdminTenants: SuperAdminClubTenant[] = [
  {
    id: 'club_001',
    businessName: 'Apex Cue & Gaming Club',
    ownerName: 'Rajaganapathy S.',
    whatsapp: '+919876543210',
    city: 'Chennai',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-01',
    activeAssetsCount: 7,
    monthlyRevenue: 84250,
  },
  {
    id: 'club_002',
    businessName: 'Striker Pool Lounge & PS5 Hub',
    ownerName: 'Manish Malhotra',
    whatsapp: '+919812345678',
    city: 'Bengaluru',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-09-28',
    activeAssetsCount: 12,
    monthlyRevenue: 142000,
  },
  {
    id: 'club_003',
    businessName: 'Velocity VR & Cue Arena',
    ownerName: 'Karan Shah',
    whatsapp: '+919799887766',
    city: 'Mumbai',
    status: 'SUSPENDED', // Example suspended tenant (locks POS entry)
    subscriptionDueDate: '2026-08-30', // Overdue
    activeAssetsCount: 5,
    monthlyRevenue: 48000,
  },
  {
    id: 'club_004',
    businessName: '8-Ball Break Lounge',
    ownerName: 'Rahul Dravid',
    whatsapp: '+919900112233',
    city: 'Hyderabad',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-05',
    activeAssetsCount: 9,
    monthlyRevenue: 98500,
  },
];
