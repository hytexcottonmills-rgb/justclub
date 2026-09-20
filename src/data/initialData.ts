import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant, LedgerEntry, BillRecord } from '../types';

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

// 10 Distinct Game Asset Types
export const initialGameAssets: GameAsset[] = [
  { id: 'ast_1', name: 'Table 1 - Rasson 9ft Tournament Pool', category: 'Billiards', hourlyRate: 300, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_2', name: 'Table 2 - Star Snooker 12ft Championship', category: 'Billiards', hourlyRate: 360, billingIncrement: '15min', billingBasis: 'PER_TABLE', status: 'occupied' },
  { id: 'ast_3', name: 'Console Station A - PS5 4K (FC 25)', category: 'PS5', hourlyRate: 240, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'occupied' },
  { id: 'ast_4', name: 'Console Station B - PS5 4K (Tekken 8)', category: 'PS5', hourlyRate: 240, billingIncrement: '15min', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_5', name: 'PC Battle Station 1 - RTX 4090 Esports', category: 'PC Gaming', hourlyRate: 200, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_6', name: 'VR Motion Arena 1 - Meta Quest 3', category: 'VR', hourlyRate: 450, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_7', name: 'Table Tennis Arena Pro 1 (Stiga 25mm)', category: 'Table Tennis', hourlyRate: 200, billingIncrement: '15min', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_8', name: 'Tornado Tournament Foosball Table', category: 'Foosball', hourlyRate: 180, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_9', name: 'Dynamo Pro Air Hockey 8ft Arcade', category: 'Air Hockey', hourlyRate: 220, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
  { id: 'ast_10', name: 'Precision Electronic Darts Arena', category: 'Darts', hourlyRate: 160, billingIncrement: 'exact', billingBasis: 'PER_TABLE', status: 'available' },
];

// 20 Realistic Customers with Mathematically Consistent Ledger Balances
export const initialCustomers: CustomerPlayer[] = [
  { id: 'cust_1', name: 'Amitabh Roy', whatsapp: '+919811122233', ledgerBalance: -850, totalVisits: 15, lastVisitedDate: '2026-09-14', lifetimeValue: 6400, notes: 'Snooker regular • 1v1 Loser-Pays specialist' },
  { id: 'cust_2', name: 'Karan Mehra', whatsapp: '+919822233344', ledgerBalance: 0, totalVisits: 9, lastVisitedDate: '2026-09-12', lifetimeValue: 4280, notes: 'Settled ₹480 via Cash on 12 Sep' },
  { id: 'cust_3', name: 'Sneha Kapoor', whatsapp: '+919833344455', ledgerBalance: -1200, totalVisits: 23, lastVisitedDate: '2026-09-15', lifetimeValue: 12400, notes: 'Doubles tournament captain' },
  { id: 'cust_4', name: 'Rohan Verma', whatsapp: '+919844455566', ledgerBalance: 450, totalVisits: 6, lastVisitedDate: '2026-09-10', lifetimeValue: 2550, notes: 'Advance wallet balance credited via UPI' },
  { id: 'cust_5', name: 'Priya Nair', whatsapp: '+919855566677', ledgerBalance: -841, totalVisits: 19, lastVisitedDate: '2026-09-15', lifetimeValue: 9800, notes: 'VR enthusiast & Cafe patron' },
  { id: 'cust_6', name: 'Vikramaditya Singh', whatsapp: '+919866677788', ledgerBalance: 0, totalVisits: 18, lastVisitedDate: '2026-09-11', lifetimeValue: 8900, notes: 'Club VIP • Cleared ₹1,450 via UPI GPay' },
  { id: 'cust_7', name: 'Arjun Singhania', whatsapp: '+919877788899', ledgerBalance: -360, totalVisits: 7, lastVisitedDate: '2026-09-13', lifetimeValue: 3100, notes: 'PS5 Tekken loser pays table share' },
  { id: 'cust_8', name: 'Dev Malhotra', whatsapp: '+919888899900', ledgerBalance: 0, totalVisits: 11, lastVisitedDate: '2026-09-13', lifetimeValue: 4600, notes: 'Cleared bar share ₹120 on spot via UPI' },
  { id: 'cust_9', name: 'Kabir Oberoi', whatsapp: '+919899900011', ledgerBalance: -290, totalVisits: 8, lastVisitedDate: '2026-09-14', lifetimeValue: 3400, notes: 'Foosball & Darts player' },
  { id: 'cust_10', name: 'Zoya Merchant', whatsapp: '+919812345678', ledgerBalance: -350, totalVisits: 12, lastVisitedDate: '2026-09-14', lifetimeValue: 5200, notes: 'Equal split 1v1 pool regular' },
  { id: 'cust_11', name: 'Ananya Deshmukh', whatsapp: '+919823456789', ledgerBalance: -520, totalVisits: 16, lastVisitedDate: '2026-09-15', lifetimeValue: 7800, notes: 'Cafe POS counter orders pending' },
  { id: 'cust_12', name: 'Farhan Akhtar', whatsapp: '+919834567890', ledgerBalance: -220, totalVisits: 5, lastVisitedDate: '2026-09-13', lifetimeValue: 1950, notes: 'Air Hockey treated friend with fries' },
  { id: 'cust_13', name: 'Tanvi Joshi', whatsapp: '+919845678901', ledgerBalance: -160, totalVisits: 4, lastVisitedDate: '2026-09-12', lifetimeValue: 1400, notes: '3-player Cutthroat Darts share' },
  { id: 'cust_14', name: 'Rishi Kapoor', whatsapp: '+919856789012', ledgerBalance: 500, totalVisits: 9, lastVisitedDate: '2026-09-09', lifetimeValue: 3900, notes: 'Advance cash deposit ₹500 on account' },
  { id: 'cust_15', name: 'Meera Nambiar', whatsapp: '+919867890123', ledgerBalance: 0, totalVisits: 14, lastVisitedDate: '2026-09-13', lifetimeValue: 5100, notes: 'Table Tennis match settled on spot via Cash' },
  { id: 'cust_16', name: 'Aditya Sen', whatsapp: '+919878901234', ledgerBalance: -720, totalVisits: 6, lastVisitedDate: '2026-09-14', lifetimeValue: 4800, notes: 'Host & Single Payer for snooker table' },
  { id: 'cust_17', name: 'Tara Sen', whatsapp: '+919889012345', ledgerBalance: 0, totalVisits: 3, lastVisitedDate: '2026-09-14', lifetimeValue: 0, notes: 'Guest of Aditya Sen (covered 100% by host)' },
  { id: 'cust_18', name: 'Harshvardhan Goel', whatsapp: '+919890123456', ledgerBalance: -830, totalVisits: 11, lastVisitedDate: '2026-09-14', lifetimeValue: 5900, notes: '2v2 Foosball & TT losing team share' },
  { id: 'cust_19', name: 'Aryan Saxena', whatsapp: '+919891234567', ledgerBalance: -830, totalVisits: 10, lastVisitedDate: '2026-09-14', lifetimeValue: 5600, notes: '2v2 Doubles teammate of Harshvardhan' },
  { id: 'cust_20', name: 'Simran Kaur', whatsapp: '+919892345678', ledgerBalance: 0, totalVisits: 5, lastVisitedDate: '2026-09-11', lifetimeValue: 1850, notes: 'Solo VR session settled immediately via UPI' },
];

export const initialBarItems: BarItem[] = [
  { id: 'item_1', name: 'Red Bull Energy Drink', category: 'Beverages', price: 175, costPrice: 110, stock: 45 },
  { id: 'item_2', name: 'Cold Brew Iced Coffee', category: 'Beverages', price: 190, costPrice: 70, stock: 30 },
  { id: 'item_3', name: 'Peri Peri French Fries', category: 'Snacks', price: 220, costPrice: 65, stock: 50 },
  { id: 'item_4', name: 'Loaded Cheese Nachos', category: 'Snacks', price: 280, costPrice: 90, stock: 40 },
  { id: 'item_5', name: 'Mint Mojito Mocktail', category: 'Beverages', price: 210, costPrice: 50, stock: 60 },
  { id: 'item_6', name: 'Hookah - Double Apple Ice', category: 'Lounge / Hookah', price: 650, costPrice: 150, stock: 100 },
  { id: 'item_7', name: 'Gamer Fuel Combo (Red Bull + Fries)', category: 'Combos', price: 350, costPrice: 150, stock: 25 },
  { id: 'item_8', name: 'Mineral Water 1L', category: 'Beverages', price: 40, costPrice: 18, stock: 120 },
  { id: 'item_9', name: 'Crispy Chicken Burger', category: 'Snacks', price: 260, costPrice: 95, stock: 35 },
  { id: 'item_10', name: 'Belgian Chocolate Milkshake', category: 'Beverages', price: 220, costPrice: 75, stock: 40 },
];

// Comprehensive Ledger Entries covering all 10 Game Types and all Game & Bar Split Rule combinations
export const initialLedgerEntries: LedgerEntry[] = [
  // -------------------------------------------------------------
  // CUSTOMER 1: Amitabh Roy (Net: -₹850 Dr)
  // COMBINATION 1: 1v1 Loser Pays Table + Link to Game Loser (Loser pays both Game & Bar)
  // -------------------------------------------------------------
  {
    id: 'led_init_0a',
    voucherNo: 'BILL-088',
    customerId: 'cust_1',
    customerName: 'Amitabh Roy',
    customerPhone: '+919811122233',
    type: 'DEBIT_SESSION',
    amount: 600,
    sessionId: 'sess_prev_098',
    assetName: 'Table 1 - Rasson 9ft Tournament Pool',
    assetCategory: 'Billiards',
    description: 'Table 1 - Rasson 9ft • 1v1 Match with Karan Mehra (Game: ₹450, Bar: ₹150)',
    timestamp: '2026-09-08T17:30:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-08T19:40:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-REF-9021849102',
    gameShare: 450,
    totalGameCost: 450,
    durationMinutes: 90,
    hourlyRate: 300,
    matchType: '1v1',
    barShare: 150,
    totalBarCost: 300,
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Mineral Water 1L', quantity: 1, price: 40 }
    ],
    splitRule: '1v1_loser_pays',
    barSplitRule: 'equal_share',
    isLoser: true,
    coPlayers: ['Karan Mehra'],
    notes: 'Amitabh conceded 8-ball in frame 3'
  },
  {
    id: 'led_init_0b',
    voucherNo: 'PAYMENT-001',
    customerId: 'cust_1',
    customerName: 'Amitabh Roy',
    customerPhone: '+919811122233',
    type: 'CREDIT_PAYMENT',
    amount: 600,
    description: 'Payment settlement via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-08T19:40:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-08T19:40:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-REF-9021849102',
    notes: 'Received by Cashier Counter'
  },
  {
    id: 'led_init_1',
    voucherNo: 'BILL-101',
    customerId: 'cust_1',
    customerName: 'Amitabh Roy',
    customerPhone: '+919811122233',
    type: 'DEBIT_SESSION',
    amount: 850,
    sessionId: 'sess_prev_101',
    assetName: 'Table 2 - Star Snooker 12ft Championship',
    assetCategory: 'Billiards',
    description: 'Table 2 - Star Snooker • 1v1 Loser Pays with Karan Mehra (Game: ₹500, Bar: ₹350)',
    timestamp: '2026-09-14T18:45:00Z',
    status: 'PENDING',
    gameShare: 500,
    totalGameCost: 500,
    durationMinutes: 86,
    hourlyRate: 360,
    matchType: '1v1',
    barShare: 350,
    totalBarCost: 350,
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 2, price: 175 }
    ],
    splitRule: '1v1_loser_pays',
    barSplitRule: 'link_to_game_loser',
    isLoser: true,
    coPlayers: ['Karan Mehra'],
    notes: 'Loser pays both table fee and Red Bull orders'
  },

  // -------------------------------------------------------------
  // CUSTOMER 2: Karan Mehra (Net: ₹0.00 All Clear)
  // Settled ₹480 via Cash for PS5 match
  // -------------------------------------------------------------
  {
    id: 'led_init_2a',
    voucherNo: 'BILL-102',
    customerId: 'cust_2',
    customerName: 'Karan Mehra',
    customerPhone: '+919822233344',
    type: 'DEBIT_SESSION',
    amount: 480,
    sessionId: 'sess_prev_102',
    assetName: 'Console Station B - PS5 4K (Tekken 8)',
    assetCategory: 'PS5',
    description: 'Console Station B • 2hr Ranked Sets (Game: ₹480, Bar: ₹0)',
    timestamp: '2026-09-12T14:00:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-12T16:05:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-REC-1049',
    gameShare: 480,
    totalGameCost: 480,
    durationMinutes: 120,
    hourlyRate: 240,
    matchType: '1v1',
    barShare: 0,
    totalBarCost: 0,
    barItemsSummary: [],
    splitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    coPlayers: ['Arjun Singhania'],
    notes: 'Console session settled at checkout'
  },
  {
    id: 'led_init_2b',
    voucherNo: 'PAYMENT-002',
    customerId: 'cust_2',
    customerName: 'Karan Mehra',
    customerPhone: '+919822233344',
    type: 'CREDIT_PAYMENT',
    amount: 480,
    description: 'Settlement via Cash',
    paymentMethod: 'Cash',
    timestamp: '2026-09-12T16:05:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-12T16:05:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-REC-1049',
    notes: 'Cash received at desk by Rahul Sharma'
  },

  // -------------------------------------------------------------
  // CUSTOMER 3: Sneha Kapoor (Net: -₹1,200 Dr)
  // COMBINATION 2: 2v2 Doubles Equal Game Split + Equal Bar Share (25% each)
  // -------------------------------------------------------------
  {
    id: 'led_init_3',
    voucherNo: 'BILL-103',
    customerId: 'cust_3',
    customerName: 'Sneha Kapoor',
    customerPhone: '+919833344455',
    type: 'DEBIT_SESSION',
    amount: 1200,
    sessionId: 'sess_prev_103',
    assetName: 'Table 1 - Rasson 9ft Tournament Pool',
    assetCategory: 'Billiards',
    description: 'Table 1 - Rasson 9ft • 2v2 Doubles Equal Split (Game: ₹600, Cafe & Snacks: ₹600)',
    timestamp: '2026-09-15T21:10:00Z',
    status: 'PENDING',
    gameShare: 600,
    totalGameCost: 1200,
    durationMinutes: 120,
    hourlyRate: 300,
    matchType: '2v2',
    barShare: 600,
    totalBarCost: 1200,
    barItemsSummary: [
      { name: 'Gamer Fuel Combo (Red Bull + Fries)', quantity: 2, price: 350 },
      { name: 'Loaded Cheese Nachos', quantity: 2, price: 250 }
    ],
    splitRule: '2v2_equal',
    barSplitRule: 'equal_share',
    coPlayers: ['Rohan Verma', 'Amitabh Roy', 'Priya Nair'],
    notes: 'Doubles match 50/50 team split'
  },

  // -------------------------------------------------------------
  // CUSTOMER 4: Rohan Verma (Net: +₹450 Cr)
  // Advance Wallet Credit Top-up via UPI
  // -------------------------------------------------------------
  {
    id: 'led_init_4',
    voucherNo: 'PAYMENT-003',
    customerId: 'cust_4',
    customerName: 'Rohan Verma',
    customerPhone: '+919844455566',
    type: 'CREDIT_PAYMENT',
    amount: 450,
    description: 'Advance Wallet Top-up via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-10T14:20:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-10T14:20:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-ADV-78219482',
    notes: 'Prepaid balance credited to member account via GPay'
  },

  // -------------------------------------------------------------
  // CUSTOMER 5: Priya Nair (Net: -₹841 Dr)
  // COMBINATION 3: Solo Player + Single Payer Bar (VR Motion)
  // -------------------------------------------------------------
  {
    id: 'led_init_5',
    voucherNo: 'BILL-105',
    customerId: 'cust_5',
    customerName: 'Priya Nair',
    customerPhone: '+919855566677',
    type: 'DEBIT_SESSION',
    amount: 841,
    sessionId: 'sess_prev_105',
    assetName: 'VR Motion Arena 1 - Meta Quest 3',
    assetCategory: 'VR',
    description: 'VR Motion Arena 1 • Solo Play Session (Game: ₹450, Bar: ₹391)',
    timestamp: '2026-09-15T19:30:00Z',
    status: 'PENDING',
    gameShare: 450,
    totalGameCost: 450,
    durationMinutes: 60,
    hourlyRate: 450,
    matchType: 'solo',
    barShare: 391,
    totalBarCost: 391,
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Peri Peri French Fries', quantity: 1, price: 201 }
    ],
    splitRule: 'standard',
    barSplitRule: 'single_payer',
    notes: 'Solo Beat Saber VR run'
  },

  // -------------------------------------------------------------
  // CUSTOMER 6: Vikramaditya Singh (Net: ₹0.00 All Clear)
  // Cleared ₹1,450 via UPI GPay
  // -------------------------------------------------------------
  {
    id: 'led_init_6a',
    voucherNo: 'BILL-092',
    customerId: 'cust_6',
    customerName: 'Vikramaditya Singh',
    customerPhone: '+919866677788',
    type: 'DEBIT_SESSION',
    amount: 1450,
    sessionId: 'sess_prev_092',
    assetName: 'Table 2 - Star Snooker 12ft Championship',
    assetCategory: 'Billiards',
    description: 'Table 2 - Star Snooker • 3hr Pro Session (Game: ₹1,080, Bar: ₹370)',
    timestamp: '2026-09-11T16:00:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-11T19:15:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-TXN-88219401',
    gameShare: 1080,
    totalGameCost: 1080,
    durationMinutes: 180,
    hourlyRate: 360,
    matchType: '1v1',
    barShare: 370,
    totalBarCost: 370,
    barItemsSummary: [
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 210 },
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 160 }
    ],
    splitRule: 'standard',
    barSplitRule: 'single_payer',
    notes: 'Pro Snooker practice match'
  },
  {
    id: 'led_init_6b',
    voucherNo: 'PAYMENT-004',
    customerId: 'cust_6',
    customerName: 'Vikramaditya Singh',
    customerPhone: '+919866677788',
    type: 'CREDIT_PAYMENT',
    amount: 1450,
    description: 'Payment settlement via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-11T19:15:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-11T19:15:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-TXN-88219401',
    notes: 'Paid via GPay to apexclub@okaxis'
  },

  // -------------------------------------------------------------
  // CUSTOMER 7 & 8: Arjun Singhania (Net: -₹360 Dr) vs Dev Malhotra (Net: ₹0.00)
  // COMBINATION 4: 1v1 Loser Pays Table Only + Equal Bar Share
  // (Arjun lost: pays 100% of Game ₹240 + 50% Bar ₹120 = ₹360; Dev paid ₹120 on spot)
  // -------------------------------------------------------------
  {
    id: 'led_init_7',
    voucherNo: 'BILL-107',
    customerId: 'cust_7',
    customerName: 'Arjun Singhania',
    customerPhone: '+919877788899',
    type: 'DEBIT_SESSION',
    amount: 360,
    sessionId: 'sess_prev_107',
    assetName: 'Console Station B - PS5 4K (Tekken 8)',
    assetCategory: 'PS5',
    description: 'Console Station B • 1v1 Loser Pays Table, Equal Bar (Game: ₹240, Bar: ₹120)',
    timestamp: '2026-09-13T18:00:00Z',
    status: 'PENDING',
    gameShare: 240,
    totalGameCost: 240,
    durationMinutes: 60,
    hourlyRate: 240,
    matchType: '1v1',
    barShare: 120,
    totalBarCost: 240,
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 1, price: 175 },
      { name: 'Mineral Water 1L', quantity: 1, price: 65 }
    ],
    splitRule: '1v1_loser_pays',
    barSplitRule: 'equal_share',
    isLoser: true,
    coPlayers: ['Dev Malhotra'],
    notes: 'Arjun lost Tekken set 2-3 (pays full table, 50% bar)'
  },
  {
    id: 'led_init_8a',
    voucherNo: 'BILL-108',
    customerId: 'cust_8',
    customerName: 'Dev Malhotra',
    customerPhone: '+919888899900',
    type: 'DEBIT_SESSION',
    amount: 120,
    sessionId: 'sess_prev_107',
    assetName: 'Console Station B - PS5 4K (Tekken 8)',
    assetCategory: 'PS5',
    description: 'Console Station B • 1v1 Winner (Game: ₹0, Bar Share: ₹120)',
    timestamp: '2026-09-13T18:00:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-13T19:05:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-DEV-99120',
    gameShare: 0,
    totalGameCost: 240,
    durationMinutes: 60,
    hourlyRate: 240,
    matchType: '1v1',
    barShare: 120,
    totalBarCost: 240,
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 1, price: 120 }
    ],
    splitRule: '1v1_loser_pays',
    barSplitRule: 'equal_share',
    isLoser: false,
    coPlayers: ['Arjun Singhania'],
    notes: 'Winner pays ₹0 table, only personal bar share'
  },
  {
    id: 'led_init_8b',
    voucherNo: 'PAYMENT-005',
    customerId: 'cust_8',
    customerName: 'Dev Malhotra',
    customerPhone: '+919888899900',
    type: 'CREDIT_PAYMENT',
    amount: 120,
    description: 'Payment settlement via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-13T19:05:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-13T19:05:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-DEV-99120',
    notes: 'Settled on spot via PhonePe'
  },

  // -------------------------------------------------------------
  // CUSTOMER 10: Zoya Merchant (Net: -₹350 Dr)
  // COMBINATION 5: 1v1 Equal Game Split + Equal Bar Share (50/50 on everything)
  // -------------------------------------------------------------
  {
    id: 'led_init_10',
    voucherNo: 'BILL-110',
    customerId: 'cust_10',
    customerName: 'Zoya Merchant',
    customerPhone: '+919812345678',
    type: 'DEBIT_SESSION',
    amount: 350,
    sessionId: 'sess_prev_110',
    assetName: 'Table 1 - Rasson 9ft Tournament Pool',
    assetCategory: 'Billiards',
    description: 'Table 1 - Rasson 9ft • 1v1 50/50 Equal Match (Game: ₹150, Bar: ₹200)',
    timestamp: '2026-09-14T20:00:00Z',
    status: 'PENDING',
    gameShare: 150,
    totalGameCost: 300,
    durationMinutes: 60,
    hourlyRate: 300,
    matchType: '1v1',
    barShare: 200,
    totalBarCost: 400,
    barItemsSummary: [
      { name: 'Loaded Cheese Nachos', quantity: 1, price: 280 },
      { name: 'Mineral Water 1L', quantity: 2, price: 40 },
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 80 }
    ],
    splitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    coPlayers: ['Karan Mehra'],
    notes: 'Friendly 8-ball match 50/50 split'
  },

  // -------------------------------------------------------------
  // CUSTOMER 11: Ananya Deshmukh (Net: -₹520 Dr)
  // COMBINATION 6: Pure Cafe POS Order (DEBIT_BAR - Direct Counter Service, No Table)
  // -------------------------------------------------------------
  {
    id: 'led_init_11',
    voucherNo: 'BILL-112',
    customerId: 'cust_11',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+919823456789',
    type: 'DEBIT_BAR',
    amount: 520,
    description: 'Cafe Counter POS Order (Gourmet Burgers & Milkshakes)',
    timestamp: '2026-09-15T17:45:00Z',
    status: 'PENDING',
    barShare: 520,
    totalBarCost: 520,
    barItemsSummary: [
      { name: 'Crispy Chicken Burger', quantity: 1, price: 260 },
      { name: 'Belgian Chocolate Milkshake', quantity: 1, price: 220 },
      { name: 'Mineral Water 1L', quantity: 1, price: 40 }
    ],
    barSplitRule: 'single_payer',
    notes: 'Direct takeaway / cafe lounge billing'
  },

  // -------------------------------------------------------------
  // CUSTOMER 12: Farhan Akhtar (Net: -₹220 Dr)
  // COMBINATION 7: 1v1 Equal Game Split + Single Payer Treats Bar (Air Hockey)
  // (Game split 50/50: ₹110 each; Farhan treated friend with ₹220 fries; Farhan settled game ₹110 via Cash, leaving ₹220 bar on ledger)
  // -------------------------------------------------------------
  {
    id: 'led_init_12a',
    voucherNo: 'BILL-114',
    customerId: 'cust_12',
    customerName: 'Farhan Akhtar',
    customerPhone: '+919834567890',
    type: 'DEBIT_SESSION',
    amount: 330,
    sessionId: 'sess_prev_114',
    assetName: 'Dynamo Pro Air Hockey 8ft Arcade',
    assetCategory: 'Air Hockey',
    description: 'Air Hockey 8ft • 1v1 Match (Game: ₹110, Bar Treated: ₹220)',
    timestamp: '2026-09-13T16:30:00Z',
    status: 'PENDING',
    gameShare: 110,
    totalGameCost: 220,
    durationMinutes: 60,
    hourlyRate: 220,
    matchType: '1v1',
    barShare: 220,
    totalBarCost: 220,
    barItemsSummary: [
      { name: 'Peri Peri French Fries', quantity: 1, price: 220 }
    ],
    splitRule: '1v1_equal',
    barSplitRule: 'single_payer',
    coPlayers: ['Kabir Oberoi'],
    notes: 'Farhan treated friend with peri peri fries'
  },
  {
    id: 'led_init_12b',
    voucherNo: 'PAYMENT-006',
    customerId: 'cust_12',
    customerName: 'Farhan Akhtar',
    customerPhone: '+919834567890',
    type: 'CREDIT_PAYMENT',
    amount: 110,
    description: 'Partial Settlement via Cash',
    paymentMethod: 'Cash',
    timestamp: '2026-09-13T17:35:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-13T17:35:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-REC-1077',
    notes: 'Game share ₹110 paid in cash at counter; fries remaining on ledger'
  },

  // -------------------------------------------------------------
  // CUSTOMER 13: Tanvi Joshi (Net: -₹160 Dr)
  // COMBINATION 8: 3-Player Precision Darts Match (33.3% Game + 33.3% Bar)
  // (Total Game: ₹240, Total Bar: ₹240; Tanvi share: ₹160 Dr)
  // -------------------------------------------------------------
  {
    id: 'led_init_13',
    voucherNo: 'BILL-116',
    customerId: 'cust_13',
    customerName: 'Tanvi Joshi',
    customerPhone: '+919845678901',
    type: 'DEBIT_SESSION',
    amount: 160,
    sessionId: 'sess_prev_116',
    assetName: 'Precision Electronic Darts Arena',
    assetCategory: 'Darts',
    description: 'Electronic Darts • 3-Player 501 Split (Game: ₹80, Bar: ₹80)',
    timestamp: '2026-09-12T19:00:00Z',
    status: 'PENDING',
    gameShare: 80,
    totalGameCost: 240,
    durationMinutes: 90,
    hourlyRate: 160,
    matchType: '1v1',
    barShare: 80,
    totalBarCost: 240,
    barItemsSummary: [
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 210 },
      { name: 'Mineral Water 1L', quantity: 1, price: 30 }
    ],
    splitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    coPlayers: ['Kabir Oberoi', 'Zoya Merchant'],
    notes: '3-player darts match 1/3 equal share'
  },

  // -------------------------------------------------------------
  // CUSTOMER 14: Rishi Kapoor (Net: +₹500 Cr)
  // Advance Cash Deposit on Member Account
  // -------------------------------------------------------------
  {
    id: 'led_init_14',
    voucherNo: 'PAYMENT-007',
    customerId: 'cust_14',
    customerName: 'Rishi Kapoor',
    customerPhone: '+919856789012',
    type: 'CREDIT_PAYMENT',
    amount: 500,
    description: 'Advance Balance Deposit via Cash',
    paymentMethod: 'Cash',
    timestamp: '2026-09-09T15:10:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-09T15:10:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-ADV-201',
    notes: 'Advance deposit for PC Gaming RTX 4090 pass'
  },

  // -------------------------------------------------------------
  // CUSTOMER 15: Meera Nambiar (Net: ₹0.00 All Clear)
  // Settled ₹300 Table Tennis match on the spot via Cash
  // -------------------------------------------------------------
  {
    id: 'led_init_15a',
    voucherNo: 'BILL-118',
    customerId: 'cust_15',
    customerName: 'Meera Nambiar',
    customerPhone: '+919867890123',
    type: 'DEBIT_SESSION',
    amount: 300,
    sessionId: 'sess_prev_118',
    assetName: 'Table Tennis Arena Pro 1 (Stiga 25mm)',
    assetCategory: 'Table Tennis',
    description: 'Table Tennis Arena • 90m Match & Beverages (Game: ₹300, Bar: ₹0)',
    timestamp: '2026-09-13T10:00:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-13T11:35:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-REC-1099',
    gameShare: 300,
    totalGameCost: 300,
    durationMinutes: 90,
    hourlyRate: 200,
    matchType: '1v1',
    barShare: 0,
    totalBarCost: 0,
    barItemsSummary: [],
    splitRule: 'standard',
    barSplitRule: 'single_payer',
    notes: 'TT coaching & drills session'
  },
  {
    id: 'led_init_15b',
    voucherNo: 'PAYMENT-008',
    customerId: 'cust_15',
    customerName: 'Meera Nambiar',
    customerPhone: '+919867890123',
    type: 'CREDIT_PAYMENT',
    amount: 300,
    description: 'Settlement via Cash',
    paymentMethod: 'Cash',
    timestamp: '2026-09-13T11:35:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-13T11:35:00Z',
    settledMethod: 'Cash',
    settlementRef: 'CASH-REC-1099',
    notes: 'Paid exact change at reception desk'
  },

  // -------------------------------------------------------------
  // CUSTOMER 16 & 17: Aditya Sen (Net: -₹720 Dr) & Tara Sen (Net: ₹0.00)
  // COMBINATION 9: Host & Single Payer Covers 100% of Game + 100% of Bar
  // (Total Bill: ₹1,280; Aditya paid ₹560 partial via UPI, leaving ₹720 Dr; Tara billed ₹0)
  // -------------------------------------------------------------
  {
    id: 'led_init_16a',
    voucherNo: 'BILL-120',
    customerId: 'cust_16',
    customerName: 'Aditya Sen',
    customerPhone: '+919878901234',
    type: 'DEBIT_SESSION',
    amount: 1280,
    sessionId: 'sess_prev_120',
    assetName: 'Table 2 - Star Snooker 12ft Championship',
    assetCategory: 'Billiards',
    description: 'Table 2 - Star Snooker • Host Pays All (Game: ₹720, Cafe Treats: ₹560)',
    timestamp: '2026-09-14T15:00:00Z',
    status: 'PENDING',
    gameShare: 720,
    totalGameCost: 720,
    durationMinutes: 120,
    hourlyRate: 360,
    matchType: '1v1',
    barShare: 560,
    totalBarCost: 560,
    barItemsSummary: [
      { name: 'Loaded Cheese Nachos', quantity: 2, price: 280 },
      { name: 'Mineral Water 1L', quantity: 2, price: 40 },
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 210 }
    ],
    splitRule: 'standard',
    barSplitRule: 'single_payer',
    coPlayers: ['Tara Sen'],
    notes: 'Aditya hosted Tara Sen (covered 100% of snooker & cafe)'
  },
  {
    id: 'led_init_16b',
    voucherNo: 'PAYMENT-009',
    customerId: 'cust_16',
    customerName: 'Aditya Sen',
    customerPhone: '+919878901234',
    type: 'CREDIT_PAYMENT',
    amount: 560,
    description: 'Partial settlement via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-14T17:10:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-14T17:10:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-ADI-55601',
    notes: 'Cleared cafe portion via UPI; table fee ₹720 added to ledger'
  },

  // -------------------------------------------------------------
  // CUSTOMER 18 & 19: Harshvardhan Goel (-₹830 Dr) & Aryan Saxena (-₹830 Dr)
  // COMBINATION 10: 2v2 Loser Team Pays Both Game and Bar (Foosball & TT)
  // (Losing team splits 50% each: Game ₹180 + Bar ₹350 = ₹530; plus TT 2v2 loser share ₹300 = ₹830 Dr)
  // -------------------------------------------------------------
  {
    id: 'led_init_18',
    voucherNo: 'BILL-122',
    customerId: 'cust_18',
    customerName: 'Harshvardhan Goel',
    customerPhone: '+919890123456',
    type: 'DEBIT_SESSION',
    amount: 530,
    sessionId: 'sess_prev_122',
    assetName: 'Tornado Tournament Foosball Table',
    assetCategory: 'Foosball',
    description: 'Foosball 2v2 • Loser Team Pays (Game: ₹180, Bar: ₹350)',
    timestamp: '2026-09-14T21:00:00Z',
    status: 'PENDING',
    gameShare: 180,
    totalGameCost: 360,
    durationMinutes: 120,
    hourlyRate: 180,
    matchType: '2v2',
    barShare: 350,
    totalBarCost: 700,
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 4, price: 175 }
    ],
    splitRule: '2v2_loser_pays',
    barSplitRule: 'link_to_game_loser',
    isLoser: true,
    coPlayers: ['Aryan Saxena', 'Vikramaditya Singh', 'Dev Malhotra'],
    notes: 'Harshvardhan & Aryan lost 2v2 Foosball set'
  },
  {
    id: 'led_init_18b',
    voucherNo: 'BILL-123',
    customerId: 'cust_18',
    customerName: 'Harshvardhan Goel',
    customerPhone: '+919890123456',
    type: 'DEBIT_SESSION',
    amount: 300,
    sessionId: 'sess_prev_123',
    assetName: 'Table Tennis Arena Pro 1 (Stiga 25mm)',
    assetCategory: 'Table Tennis',
    description: 'Table Tennis 2v2 • Loser Team Table + Equal Bar (Game: ₹200, Bar: ₹100)',
    timestamp: '2026-09-14T22:30:00Z',
    status: 'PENDING',
    gameShare: 200,
    totalGameCost: 400,
    durationMinutes: 120,
    hourlyRate: 200,
    matchType: '2v2',
    barShare: 100,
    totalBarCost: 400,
    barItemsSummary: [
      { name: 'Peri Peri French Fries', quantity: 1, price: 200 },
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 200 }
    ],
    splitRule: '2v2_loser_pays',
    barSplitRule: 'equal_share',
    isLoser: true,
    coPlayers: ['Aryan Saxena'],
    notes: 'TT doubles 50% game + 25% bar share'
  },
  {
    id: 'led_init_19',
    voucherNo: 'BILL-124',
    customerId: 'cust_19',
    customerName: 'Aryan Saxena',
    customerPhone: '+919891234567',
    type: 'DEBIT_SESSION',
    amount: 530,
    sessionId: 'sess_prev_122',
    assetName: 'Tornado Tournament Foosball Table',
    assetCategory: 'Foosball',
    description: 'Foosball 2v2 • Loser Team Pays (Game: ₹180, Bar: ₹350)',
    timestamp: '2026-09-14T21:00:00Z',
    status: 'PENDING',
    gameShare: 180,
    totalGameCost: 360,
    durationMinutes: 120,
    hourlyRate: 180,
    matchType: '2v2',
    barShare: 350,
    totalBarCost: 700,
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 4, price: 175 }
    ],
    splitRule: '2v2_loser_pays',
    barSplitRule: 'link_to_game_loser',
    isLoser: true,
    coPlayers: ['Harshvardhan Goel', 'Vikramaditya Singh', 'Dev Malhotra'],
    notes: 'Harshvardhan & Aryan lost 2v2 Foosball set'
  },
  {
    id: 'led_init_19b',
    voucherNo: 'BILL-125',
    customerId: 'cust_19',
    customerName: 'Aryan Saxena',
    customerPhone: '+919891234567',
    type: 'DEBIT_SESSION',
    amount: 300,
    sessionId: 'sess_prev_123',
    assetName: 'Table Tennis Arena Pro 1 (Stiga 25mm)',
    assetCategory: 'Table Tennis',
    description: 'Table Tennis 2v2 • Loser Team Table + Equal Bar (Game: ₹200, Bar: ₹100)',
    timestamp: '2026-09-14T22:30:00Z',
    status: 'PENDING',
    gameShare: 200,
    totalGameCost: 400,
    durationMinutes: 120,
    hourlyRate: 200,
    matchType: '2v2',
    barShare: 100,
    totalBarCost: 400,
    barItemsSummary: [
      { name: 'Peri Peri French Fries', quantity: 1, price: 200 },
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 200 }
    ],
    splitRule: '2v2_loser_pays',
    barSplitRule: 'equal_share',
    isLoser: true,
    coPlayers: ['Harshvardhan Goel'],
    notes: 'TT doubles 50% game + 25% bar share'
  },

  // -------------------------------------------------------------
  // CUSTOMER 20: Simran Kaur (Net: ₹0.00 All Clear)
  // Settled ₹225 Solo VR session immediately via UPI PhonePe
  // -------------------------------------------------------------
  {
    id: 'led_init_20a',
    voucherNo: 'BILL-127',
    customerId: 'cust_20',
    customerName: 'Simran Kaur',
    customerPhone: '+919892345678',
    type: 'DEBIT_SESSION',
    amount: 225,
    sessionId: 'sess_prev_127',
    assetName: 'VR Motion Arena 1 - Meta Quest 3',
    assetCategory: 'VR',
    description: 'VR Motion Arena • 30m Solo Experience (Game: ₹225, Bar: ₹0)',
    timestamp: '2026-09-11T14:15:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-11T14:50:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-SIM-44019',
    gameShare: 225,
    totalGameCost: 225,
    durationMinutes: 30,
    hourlyRate: 450,
    matchType: 'solo',
    barShare: 0,
    totalBarCost: 0,
    barItemsSummary: [],
    splitRule: 'standard',
    barSplitRule: 'single_payer',
    notes: 'VR Kayak & Rollercoaster solo experience'
  },
  {
    id: 'led_init_20b',
    voucherNo: 'PAYMENT-010',
    customerId: 'cust_20',
    customerName: 'Simran Kaur',
    customerPhone: '+919892345678',
    type: 'CREDIT_PAYMENT',
    amount: 225,
    description: 'Settlement via UPI',
    paymentMethod: 'UPI',
    timestamp: '2026-09-11T14:50:00Z',
    status: 'SETTLED',
    settledAt: '2026-09-11T14:50:00Z',
    settledMethod: 'UPI',
    settlementRef: 'UPI-SIM-44019',
    notes: 'Scanned UPI QR at billing terminal'
  },

  // -------------------------------------------------------------
  // CUSTOMER 9: Kabir Oberoi (Net: -₹290 Dr)
  // Foosball session share ₹290
  // -------------------------------------------------------------
  {
    id: 'led_init_9',
    voucherNo: 'BILL-129',
    customerId: 'cust_9',
    customerName: 'Kabir Oberoi',
    customerPhone: '+919899900011',
    type: 'DEBIT_SESSION',
    amount: 290,
    sessionId: 'sess_prev_129',
    assetName: 'Tornado Tournament Foosball Table',
    assetCategory: 'Foosball',
    description: 'Foosball • 1v1 Match & Drinks (Game: ₹90, Bar: ₹200)',
    timestamp: '2026-09-14T19:30:00Z',
    status: 'PENDING',
    gameShare: 90,
    totalGameCost: 180,
    durationMinutes: 60,
    hourlyRate: 180,
    matchType: '1v1',
    barShare: 200,
    totalBarCost: 400,
    barItemsSummary: [
      { name: 'Peri Peri French Fries', quantity: 1, price: 200 },
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 200 }
    ],
    splitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    coPlayers: ['Farhan Akhtar'],
    notes: '1v1 Foosball equal share pending'
  }
];

export const initialGameSessions: GameSession[] = [
  {
    id: 'sess_running_1',
    assetId: 'ast_3',
    assetName: 'Console Station A - PS5 4K (FC 25)',
    category: 'PS5',
    hourlyRate: 240,
    billingIncrement: 'exact',
    billingBasis: 'PER_TABLE',
    matchType: '2v2',
    taggedPlayers: [initialCustomers[0], initialCustomers[1]],
    startTime: Date.now() - 48 * 60 * 1000,
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'item_1', name: 'Red Bull Energy Drink', price: 175, quantity: 2 },
      { itemId: 'item_3', name: 'Peri Peri French Fries', price: 220, quantity: 1 }
    ],
    status: 'running',
    endedAt: null,
  },
  {
    id: 'sess_running_2',
    assetId: 'ast_2',
    assetName: 'Table 2 - Star Snooker 12ft Championship',
    category: 'Billiards',
    hourlyRate: 360,
    billingIncrement: '15min',
    billingBasis: 'PER_TABLE',
    matchType: '1v1',
    taggedPlayers: [initialCustomers[5], initialCustomers[6]],
    startTime: Date.now() - 72 * 60 * 1000,
    pausedAt: null,
    totalPausedDuration: 0,
    attachedBarOrders: [
      { itemId: 'item_2', name: 'Cold Brew Iced Coffee', price: 190, quantity: 2 },
      { itemId: 'item_4', name: 'Loaded Cheese Nachos', price: 280, quantity: 1 }
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
    activeAssetsCount: 10,
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
    activeAssetsCount: 14,
    monthlyRevenue: 112000,
  }
];

export const initialBills: BillRecord[] = [
  {
    id: 'bill_001',
    billNo: 'BILL-101',
    sessionId: 'sess_prev_0101',
    assetId: 'ast_2',
    assetName: 'Table 2 - Star Snooker 12ft Championship',
    category: 'Billiards',
    gameType: 'Championship Snooker',
    matchType: '1v1',
    hourlyRate: 360,
    billingIncrement: '15min',
    startTime: '2026-09-14T16:00:00.000Z',
    endTime: '2026-09-14T17:30:00.000Z',
    durationMinutes: 90,
    totalPausedDuration: 0,
    totalGameCost: 540,
    totalBarCost: 310,
    discount: 0,
    grandTotal: 850,
    players: [
      { id: 'cust_1', name: 'Amitabh Roy', whatsapp: '+919811122233' },
      { id: 'cust_6', name: 'Vikramaditya Singh', whatsapp: '+919866677788' }
    ],
    gameSplitRule: '1v1_loser_pays',
    barSplitRule: 'link_to_game_loser',
    losingPlayerIds: ['cust_1'],
    winningPlayerIds: ['cust_6'],
    shares: [
      {
        playerId: 'cust_1',
        playerName: 'Amitabh Roy',
        whatsapp: '+919811122233',
        gameShare: 540,
        barShare: 310,
        totalShare: 850,
        paymentMethod: 'Ledger',
        isSettled: false,
        isLoser: true,
        notes: 'Lost 1v1 decider frame; charged 100% table and cafe'
      },
      {
        playerId: 'cust_6',
        playerName: 'Vikramaditya Singh',
        whatsapp: '+919866677788',
        gameShare: 0,
        barShare: 0,
        totalShare: 0,
        paymentMethod: 'Ledger',
        isSettled: true,
        isWinner: true,
        notes: 'Winner (0% share under Loser Pays rule)'
      }
    ],
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Mineral Water 1L', quantity: 1, price: 40 },
      { name: 'Loaded Cheese Nachos', quantity: 1, price: 80 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-14T17:30:00.000Z',
    notes: 'Amitabh conceded 8-ball in frame 3'
  },
  {
    id: 'bill_002',
    billNo: 'BILL-118',
    sessionId: 'sess_prev_0118',
    assetId: 'ast_8',
    assetName: 'Tornado Tournament Foosball Table',
    category: 'Foosball',
    gameType: 'Foosball Doubles',
    matchType: '2v2',
    hourlyRate: 180,
    billingIncrement: 'exact',
    startTime: '2026-09-14T18:00:00.000Z',
    endTime: '2026-09-14T19:20:00.000Z',
    durationMinutes: 80,
    totalPausedDuration: 0,
    totalGameCost: 240,
    totalBarCost: 1420,
    discount: 0,
    grandTotal: 1660,
    players: [
      { id: 'cust_18', name: 'Harshvardhan Goel', whatsapp: '+919890123456' },
      { id: 'cust_19', name: 'Aryan Saxena', whatsapp: '+919891234567' },
      { id: 'cust_3', name: 'Sneha Kapoor', whatsapp: '+919833344455' },
      { id: 'cust_9', name: 'Kabir Oberoi', whatsapp: '+919899900011' }
    ],
    gameSplitRule: '2v2_loser_pays',
    barSplitRule: 'equal_share',
    losingPlayerIds: ['cust_18', 'cust_19'],
    winningPlayerIds: ['cust_3', 'cust_9'],
    shares: [
      {
        playerId: 'cust_18',
        playerName: 'Harshvardhan Goel',
        whatsapp: '+919890123456',
        gameShare: 120,
        barShare: 355,
        totalShare: 475,
        paymentMethod: 'Ledger',
        isSettled: false,
        isLoser: true,
        notes: 'Team A (Lost 8-10)'
      },
      {
        playerId: 'cust_19',
        playerName: 'Aryan Saxena',
        whatsapp: '+919891234567',
        gameShare: 120,
        barShare: 355,
        totalShare: 475,
        paymentMethod: 'Ledger',
        isSettled: false,
        isLoser: true,
        notes: 'Team A (Lost 8-10)'
      },
      {
        playerId: 'cust_3',
        playerName: 'Sneha Kapoor',
        whatsapp: '+919833344455',
        gameShare: 0,
        barShare: 355,
        totalShare: 355,
        paymentMethod: 'Ledger',
        isSettled: false,
        isWinner: true,
        notes: 'Team B Winner; cafe split 4-ways'
      },
      {
        playerId: 'cust_9',
        playerName: 'Kabir Oberoi',
        whatsapp: '+919899900011',
        gameShare: 0,
        barShare: 355,
        totalShare: 355,
        paymentMethod: 'Ledger',
        isSettled: false,
        isWinner: true,
        notes: 'Team B Winner; cafe split 4-ways'
      }
    ],
    barItemsSummary: [
      { name: 'Hookah - Double Apple Ice', quantity: 2, price: 650 },
      { name: 'Loaded Cheese Nachos', quantity: 1, price: 120 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-14T19:20:00.000Z',
    notes: 'Epic 2v2 doubles match lasting 80 mins'
  },
  {
    id: 'bill_003',
    billNo: 'BILL-095',
    sessionId: 'sess_prev_0095',
    assetId: 'ast_3',
    assetName: 'Console Station A - PS5 4K (FC 25)',
    category: 'PS5',
    gameType: 'PlayStation 5 (FC 25)',
    matchType: '1v1',
    hourlyRate: 240,
    billingIncrement: 'exact',
    startTime: '2026-09-12T14:30:00.000Z',
    endTime: '2026-09-12T16:00:00.000Z',
    durationMinutes: 90,
    totalPausedDuration: 0,
    totalGameCost: 360,
    totalBarCost: 240,
    discount: 0,
    grandTotal: 600,
    players: [
      { id: 'cust_2', name: 'Karan Mehra', whatsapp: '+919822233344' },
      { id: 'cust_4', name: 'Rohan Verma', whatsapp: '+919844455566' }
    ],
    gameSplitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    losingPlayerIds: [],
    shares: [
      {
        playerId: 'cust_2',
        playerName: 'Karan Mehra',
        whatsapp: '+919822233344',
        gameShare: 180,
        barShare: 120,
        totalShare: 300,
        paymentMethod: 'Cash',
        isSettled: true,
        notes: 'Settled on spot in Cash'
      },
      {
        playerId: 'cust_4',
        playerName: 'Rohan Verma',
        whatsapp: '+919844455566',
        gameShare: 180,
        barShare: 120,
        totalShare: 300,
        paymentMethod: 'UPI',
        isSettled: true,
        notes: 'Settled on spot via GPay'
      }
    ],
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Mineral Water 1L', quantity: 1, price: 50 }
    ],
    status: 'SETTLED',
    timestamp: '2026-09-12T16:00:00.000Z',
    notes: 'Friendly rivalry match • 50/50 split on both game and cafe'
  },
  {
    id: 'bill_004',
    billNo: 'BILL-112',
    sessionId: 'sess_prev_0112',
    assetId: 'ast_4',
    assetName: 'Console Station B - PS5 4K (Tekken 8)',
    category: 'PS5',
    gameType: 'PlayStation 5 (Tekken 8)',
    matchType: '1v1',
    hourlyRate: 240,
    billingIncrement: '15min',
    startTime: '2026-09-13T17:00:00.000Z',
    endTime: '2026-09-13T18:30:00.000Z',
    durationMinutes: 90,
    totalPausedDuration: 0,
    totalGameCost: 360,
    totalBarCost: 120,
    discount: 0,
    grandTotal: 480,
    players: [
      { id: 'cust_7', name: 'Arjun Singhania', whatsapp: '+919877788899' },
      { id: 'cust_8', name: 'Dev Malhotra', whatsapp: '+919888899900' }
    ],
    gameSplitRule: '1v1_loser_pays',
    barSplitRule: 'custom_split',
    losingPlayerIds: ['cust_7'],
    winningPlayerIds: ['cust_8'],
    customBarSplitPlayerIds: ['cust_8'],
    shares: [
      {
        playerId: 'cust_7',
        playerName: 'Arjun Singhania',
        whatsapp: '+919877788899',
        gameShare: 360,
        barShare: 0,
        totalShare: 360,
        paymentMethod: 'Ledger',
        isSettled: false,
        isLoser: true,
        notes: 'Lost best of 5 sets; pays entire console rate'
      },
      {
        playerId: 'cust_8',
        playerName: 'Dev Malhotra',
        whatsapp: '+919888899900',
        gameShare: 0,
        barShare: 120,
        totalShare: 120,
        paymentMethod: 'UPI',
        isSettled: true,
        isWinner: true,
        notes: 'Winner paid his own cafe order on spot via UPI'
      }
    ],
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 120 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-13T18:30:00.000Z',
    notes: 'Tekken 8 Ranked match'
  },
  {
    id: 'bill_005',
    billNo: 'BILL-088',
    sessionId: 'sess_prev_0088',
    assetId: 'ast_1',
    assetName: 'Table 1 - Rasson 9ft Tournament Pool',
    category: 'Billiards',
    gameType: '9ft Tournament Pool',
    matchType: '1v1',
    hourlyRate: 300,
    billingIncrement: 'exact',
    startTime: '2026-09-08T17:30:00.000Z',
    endTime: '2026-09-08T19:00:00.000Z',
    durationMinutes: 90,
    totalPausedDuration: 0,
    totalGameCost: 450,
    totalBarCost: 300,
    discount: 0,
    grandTotal: 750,
    players: [
      { id: 'cust_1', name: 'Amitabh Roy', whatsapp: '+919811122233' },
      { id: 'cust_2', name: 'Karan Mehra', whatsapp: '+919822233344' }
    ],
    gameSplitRule: '1v1_loser_pays',
    barSplitRule: 'equal_share',
    losingPlayerIds: ['cust_1'],
    winningPlayerIds: ['cust_2'],
    shares: [
      {
        playerId: 'cust_1',
        playerName: 'Amitabh Roy',
        whatsapp: '+919811122233',
        gameShare: 450,
        barShare: 150,
        totalShare: 600,
        paymentMethod: 'UPI',
        isSettled: true,
        isLoser: true,
        notes: 'Settled via UPI counter QR'
      },
      {
        playerId: 'cust_2',
        playerName: 'Karan Mehra',
        whatsapp: '+919822233344',
        gameShare: 0,
        barShare: 150,
        totalShare: 150,
        paymentMethod: 'Cash',
        isSettled: true,
        isWinner: true,
        notes: 'Winner paid 50% bar share in cash'
      }
    ],
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Mineral Water 1L', quantity: 1, price: 40 },
      { name: 'Red Bull Energy Drink', quantity: 1, price: 70 }
    ],
    status: 'SETTLED',
    timestamp: '2026-09-08T19:00:00.000Z',
    notes: '8-Ball tournament warm-up'
  },
  {
    id: 'bill_006',
    billNo: 'BILL-125',
    sessionId: 'sess_prev_0125',
    assetId: 'ast_7',
    assetName: 'Table Tennis Arena Pro 1 (Stiga 25mm)',
    category: 'Table Tennis',
    gameType: 'Table Tennis Arena Pro',
    matchType: '1v1',
    hourlyRate: 200,
    billingIncrement: '15min',
    startTime: '2026-09-13T10:30:00.000Z',
    endTime: '2026-09-13T11:30:00.000Z',
    durationMinutes: 60,
    totalPausedDuration: 0,
    totalGameCost: 200,
    totalBarCost: 100,
    discount: 0,
    grandTotal: 300,
    players: [
      { id: 'cust_15', name: 'Meera Nambiar', whatsapp: '+919867890123' },
      { id: 'cust_13', name: 'Tanvi Joshi', whatsapp: '+919845678901' }
    ],
    gameSplitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    losingPlayerIds: [],
    shares: [
      {
        playerId: 'cust_15',
        playerName: 'Meera Nambiar',
        whatsapp: '+919867890123',
        gameShare: 100,
        barShare: 50,
        totalShare: 150,
        paymentMethod: 'Cash',
        isSettled: true,
        notes: 'Settled instantly in Cash'
      },
      {
        playerId: 'cust_13',
        playerName: 'Tanvi Joshi',
        whatsapp: '+919845678901',
        gameShare: 100,
        barShare: 50,
        totalShare: 150,
        paymentMethod: 'Ledger',
        isSettled: false,
        notes: 'Added to customer ledger balance'
      }
    ],
    barItemsSummary: [
      { name: 'Mineral Water 1L', quantity: 2, price: 80 },
      { name: 'Mint Mojito Mocktail', quantity: 1, price: 20 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-13T11:30:00.000Z',
    notes: 'Morning session • 60 mins cardio rally'
  },
  {
    id: 'bill_007',
    billNo: 'BILL-130',
    sessionId: 'sess_prev_0130',
    assetId: 'ast_6',
    assetName: 'VR Motion Arena 1 - Meta Quest 3',
    category: 'VR',
    gameType: 'VR Motion Simulation',
    matchType: 'solo',
    hourlyRate: 450,
    billingIncrement: 'exact',
    startTime: '2026-09-11T14:00:00.000Z',
    endTime: '2026-09-11T14:45:00.000Z',
    durationMinutes: 45,
    totalPausedDuration: 0,
    totalGameCost: 337.5,
    totalBarCost: 175,
    discount: 0,
    grandTotal: 512.5,
    players: [
      { id: 'cust_20', name: 'Simran Kaur', whatsapp: '+919892345678' }
    ],
    gameSplitRule: 'standard',
    barSplitRule: 'single_payer',
    losingPlayerIds: [],
    singlePayerId: 'cust_20',
    shares: [
      {
        playerId: 'cust_20',
        playerName: 'Simran Kaur',
        whatsapp: '+919892345678',
        gameShare: 337.5,
        barShare: 175,
        totalShare: 512.5,
        paymentMethod: 'UPI',
        isSettled: true,
        isHost: true,
        notes: 'Solo VR simulator session settled via UPI'
      }
    ],
    barItemsSummary: [
      { name: 'Red Bull Energy Drink', quantity: 1, price: 175 }
    ],
    status: 'SETTLED',
    timestamp: '2026-09-11T14:45:00.000Z',
    notes: 'Beat Saber & Rollercoaster VR experience'
  },
  {
    id: 'bill_008',
    billNo: 'BILL-136',
    sessionId: 'sess_prev_0136',
    assetId: 'ast_9',
    assetName: 'Dynamo Pro Air Hockey 8ft Arcade',
    category: 'Air Hockey',
    gameType: 'Dynamo Pro Air Hockey',
    matchType: '1v1',
    hourlyRate: 220,
    billingIncrement: 'exact',
    startTime: '2026-09-13T16:30:00.000Z',
    endTime: '2026-09-13T17:30:00.000Z',
    durationMinutes: 60,
    totalPausedDuration: 0,
    totalGameCost: 220,
    totalBarCost: 220,
    discount: 0,
    grandTotal: 440,
    players: [
      { id: 'cust_12', name: 'Farhan Akhtar', whatsapp: '+919834567890' },
      { id: 'cust_10', name: 'Zoya Merchant', whatsapp: '+919812345678' }
    ],
    gameSplitRule: '1v1_equal',
    barSplitRule: 'single_payer',
    losingPlayerIds: [],
    singlePayerId: 'cust_12',
    shares: [
      {
        playerId: 'cust_12',
        playerName: 'Farhan Akhtar',
        whatsapp: '+919834567890',
        gameShare: 110,
        barShare: 220,
        totalShare: 330,
        paymentMethod: 'Ledger',
        isSettled: false,
        isHost: true,
        notes: 'Host paid 100% cafe and 50% game rate on account'
      },
      {
        playerId: 'cust_10',
        playerName: 'Zoya Merchant',
        whatsapp: '+919812345678',
        gameShare: 110,
        barShare: 0,
        totalShare: 110,
        paymentMethod: 'UPI',
        isSettled: true,
        notes: 'Guest paid 50% table share via UPI'
      }
    ],
    barItemsSummary: [
      { name: 'Peri Peri French Fries', quantity: 1, price: 220 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-13T17:30:00.000Z',
    notes: 'Arcade air hockey duel with snack treats'
  },
  {
    id: 'bill_009',
    billNo: 'BILL-142',
    sessionId: 'sess_prev_0142',
    assetId: 'ast_10',
    assetName: 'Precision Electronic Darts Arena',
    category: 'Darts',
    gameType: 'Electronic Darts Arena',
    matchType: 'multiplayer',
    hourlyRate: 160,
    billingIncrement: 'exact',
    startTime: '2026-09-12T19:00:00.000Z',
    endTime: '2026-09-12T20:30:00.000Z',
    durationMinutes: 90,
    totalPausedDuration: 0,
    totalGameCost: 240,
    totalBarCost: 240,
    discount: 0,
    grandTotal: 480,
    players: [
      { id: 'cust_13', name: 'Tanvi Joshi', whatsapp: '+919845678901' },
      { id: 'cust_9', name: 'Kabir Oberoi', whatsapp: '+919899900011' },
      { id: 'cust_8', name: 'Dev Malhotra', whatsapp: '+919888899900' }
    ],
    gameSplitRule: '1v1_equal',
    barSplitRule: 'equal_share',
    losingPlayerIds: [],
    shares: [
      {
        playerId: 'cust_13',
        playerName: 'Tanvi Joshi',
        whatsapp: '+919845678901',
        gameShare: 80,
        barShare: 80,
        totalShare: 160,
        paymentMethod: 'Ledger',
        isSettled: false,
        notes: '3-way split: 1/3 game, 1/3 cafe'
      },
      {
        playerId: 'cust_9',
        playerName: 'Kabir Oberoi',
        whatsapp: '+919899900011',
        gameShare: 80,
        barShare: 80,
        totalShare: 160,
        paymentMethod: 'Ledger',
        isSettled: false,
        notes: '3-way split: 1/3 game, 1/3 cafe'
      },
      {
        playerId: 'cust_8',
        playerName: 'Dev Malhotra',
        whatsapp: '+919888899900',
        gameShare: 80,
        barShare: 80,
        totalShare: 160,
        paymentMethod: 'UPI',
        isSettled: true,
        notes: 'Settled ₹160 via UPI on spot'
      }
    ],
    barItemsSummary: [
      { name: 'Cold Brew Iced Coffee', quantity: 1, price: 190 },
      { name: 'Mineral Water 1L', quantity: 1, price: 50 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-12T20:30:00.000Z',
    notes: '3-player Cutthroat 501 Darts'
  },
  {
    id: 'bill_010',
    billNo: 'BILL-148',
    sessionId: 'sess_prev_0148',
    assetId: 'ast_1',
    assetName: 'Table 1 - Rasson 9ft Tournament Pool',
    category: 'Billiards',
    gameType: '9ft Tournament Pool',
    matchType: '1v1',
    hourlyRate: 300,
    billingIncrement: 'exact',
    startTime: '2026-09-14T14:30:00.000Z',
    endTime: '2026-09-14T16:30:00.000Z',
    durationMinutes: 120,
    totalPausedDuration: 0,
    totalGameCost: 600,
    totalBarCost: 480,
    discount: 0,
    grandTotal: 1080,
    players: [
      { id: 'cust_16', name: 'Aditya Sen', whatsapp: '+919878901234' },
      { id: 'cust_17', name: 'Tara Sen', whatsapp: '+919889012345' }
    ],
    gameSplitRule: 'standard',
    barSplitRule: 'single_payer',
    losingPlayerIds: [],
    singlePayerId: 'cust_16',
    shares: [
      {
        playerId: 'cust_16',
        playerName: 'Aditya Sen',
        whatsapp: '+919878901234',
        gameShare: 600,
        barShare: 480,
        totalShare: 1080,
        paymentMethod: 'Ledger',
        isSettled: false,
        isHost: true,
        notes: 'Host covered 100% of bill on customer ledger'
      },
      {
        playerId: 'cust_17',
        playerName: 'Tara Sen',
        whatsapp: '+919889012345',
        gameShare: 0,
        barShare: 0,
        totalShare: 0,
        paymentMethod: 'Ledger',
        isSettled: true,
        notes: 'Guest covered 100% by host'
      }
    ],
    barItemsSummary: [
      { name: 'Mint Mojito Mocktail', quantity: 2, price: 420 },
      { name: 'Mineral Water 1L', quantity: 1, price: 60 }
    ],
    status: 'UNSETTLED',
    timestamp: '2026-09-14T16:30:00.000Z',
    notes: '2-hour private pool session'
  }
];
