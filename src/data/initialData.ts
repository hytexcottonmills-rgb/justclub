import { ClubProfile, GameAsset, CustomerPlayer, BarItem, GameSession, SuperAdminClubTenant, LedgerEntry, BillRecord } from '../types';

export const initialClubProfile: ClubProfile = {
  id: 'club_001',
  businessName: 'Apex Cue & Gaming Club',
  ownerName: 'Rahul Sharma',
  whatsapp: '+919876543210',
  pincode: '400053',
  upiId: 'apexclub@okaxis',
  paymentSlug: 'apexcue',
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

// Ledger Entries
export const initialLedgerEntries: LedgerEntry[] = [

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
  },
  {
    id: 'club_003',
    businessName: 'Royal Break Pool & Billiards',
    ownerName: 'Sunil Hegde',
    whatsapp: '+919845012345',
    city: 'Bengaluru',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-09-25',
    activeAssetsCount: 8,
    monthlyRevenue: 68500,
  },
  {
    id: 'club_004',
    businessName: 'Pro Cue Snooker Arena',
    ownerName: 'Syed Farhan',
    whatsapp: '+919885198765',
    city: 'Hyderabad',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-30',
    activeAssetsCount: 6,
    monthlyRevenue: 52000,
  },
  {
    id: 'club_005',
    businessName: 'Kingsway Billiards & PS5 Lounge',
    ownerName: 'Debabrata Mukherjee',
    whatsapp: '+919830055443',
    city: 'Kolkata',
    status: 'SUSPENDED',
    subscriptionDueDate: '2026-09-10',
    activeAssetsCount: 12,
    monthlyRevenue: 95400,
  },
  {
    id: 'club_006',
    businessName: 'CueCraft Snooker Sanctuary',
    ownerName: 'Aniket Deshmukh',
    whatsapp: '+919890066778',
    city: 'Pune',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-22',
    activeAssetsCount: 4,
    monthlyRevenue: 34200,
  },
  {
    id: 'club_007',
    businessName: 'Vortex Gaming & Cue Hub',
    ownerName: 'Karthik Subramanian',
    whatsapp: '+919840077889',
    city: 'Chennai',
    status: 'ACTIVE',
    subscriptionDueDate: '2026-10-05',
    activeAssetsCount: 7,
    monthlyRevenue: 61800,
  }
];

export const initialBills: BillRecord[] = [];
