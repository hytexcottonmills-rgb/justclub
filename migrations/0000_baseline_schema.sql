-- ==============================================================================
-- JustClub D1 Database Schema — Baseline Migration 0000
-- Baseline snapshot of live production tables
-- ==============================================================================

-- 1. Multi-Tenant User Accounts & RBAC
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  salt TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  clubId TEXT,
  fullName TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 2. Club Tenant Master Profiles
CREATE TABLE IF NOT EXISTS club_profiles (
  id TEXT PRIMARY KEY,
  businessName TEXT NOT NULL,
  ownerName TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  pincode TEXT,
  city TEXT,
  state TEXT,
  upiId TEXT,
  tenantStatus TEXT DEFAULT 'ACTIVE',
  monthlyPlanFee REAL DEFAULT 499,
  renewalDueDate TEXT,
  totalRevenueThisMonth REAL DEFAULT 0,
  activeTableCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 3. Custom Payment Link Slugs
CREATE TABLE IF NOT EXISTS payment_slugs (
  slug TEXT PRIMARY KEY,
  clubId TEXT NOT NULL UNIQUE,
  upiId TEXT NOT NULL,
  businessName TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 4. Game Assets
CREATE TABLE IF NOT EXISTS game_assets (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL DEFAULT 'per_minute',
  billingBasis TEXT NOT NULL DEFAULT 'PER_TABLE',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 5. Customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ledgerBalance REAL DEFAULT 0,
  totalVisits INTEGER DEFAULT 0,
  lastVisitedDate TEXT,
  lifetimeValue REAL DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Bar & Snack POS Inventory
CREATE TABLE IF NOT EXISTS bar_items (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 7. Game Sessions & Live Table Tracking
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  assetId TEXT NOT NULL,
  assetName TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL,
  billingBasis TEXT NOT NULL DEFAULT 'PER_TABLE',
  matchType TEXT DEFAULT 'standard',
  taggedPlayers TEXT,
  startTime INTEGER NOT NULL,
  pausedAt INTEGER,
  totalPausedDuration INTEGER DEFAULT 0,
  attachedBarOrders TEXT,
  reminderMinutes INTEGER,
  status TEXT NOT NULL DEFAULT 'running',
  endedAt INTEGER,
  finalBillAmount REAL,
  paymentMethod TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 8. Finalized Bills & Checkout Records
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  billNo TEXT NOT NULL,
  voucherNo TEXT,
  sessionId TEXT NOT NULL,
  assetId TEXT,
  assetName TEXT NOT NULL,
  category TEXT NOT NULL,
  gameType TEXT,
  matchType TEXT,
  hourlyRate REAL,
  billingIncrement TEXT,
  startTime TEXT,
  endTime TEXT,
  durationMinutes INTEGER,
  totalPausedDuration INTEGER,
  totalGameCost REAL NOT NULL,
  totalBarCost REAL NOT NULL,
  discount REAL DEFAULT 0,
  grandTotal REAL NOT NULL,
  roundOffAmount REAL DEFAULT 0,
  players TEXT,
  gameSplitRule TEXT,
  barSplitRule TEXT,
  losingPlayerIds TEXT,
  winningPlayerIds TEXT,
  singlePayerId TEXT,
  customBarSplitPlayerIds TEXT,
  shares TEXT,
  barItemsSummary TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  timestamp TEXT NOT NULL,
  notes TEXT
);

-- 9. Customer Khata Ledger Transactions
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  voucherNo TEXT NOT NULL,
  customerId TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerPhone TEXT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  sessionId TEXT,
  assetName TEXT,
  assetCategory TEXT,
  description TEXT NOT NULL,
  paymentMethod TEXT,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  settledAt TEXT,
  settledMethod TEXT,
  settlementRef TEXT,
  gameShare REAL,
  totalGameCost REAL,
  durationMinutes INTEGER,
  hourlyRate REAL,
  matchType TEXT,
  barShare REAL,
  totalBarCost REAL,
  barItemsSummary TEXT,
  splitRule TEXT,
  barSplitRule TEXT,
  isLoser INTEGER,
  coPlayers TEXT,
  notes TEXT
);

-- 10. Operational Expenses
CREATE TABLE IF NOT EXISTS club_expenses (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  receiptNo TEXT,
  expenseDate TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  voidReason TEXT,
  loggedByEmail TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 11. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  clubName TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'OPEN',
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT
);

-- 12. Audit Logs & Telemetry
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  adminEmail TEXT,
  targetTenantId TEXT,
  targetClubName TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  metadata TEXT,
  timestamp TEXT NOT NULL,
  clubId TEXT,
  performedBy TEXT
);

-- 13. Login Attempts & Rate Limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT PRIMARY KEY,
  failCount INTEGER DEFAULT 0,
  lockedUntil TEXT,
  updatedAt TEXT
);

-- 14. Subscription Settings & Plans
CREATE TABLE IF NOT EXISTS subscription_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trialPeriodDays INTEGER NOT NULL DEFAULT 15,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  periodMonths INTEGER NOT NULL,
  discountLabel TEXT,
  updatedAt TEXT
);

-- 15. Idempotency Keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
  requestKey TEXT PRIMARY KEY,
  responseBody TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 16. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discountPercent REAL NOT NULL,
  validUntil TEXT NOT NULL,
  usesCount INTEGER NOT NULL DEFAULT 0,
  maxUses INTEGER NOT NULL DEFAULT 50,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 17. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 18. Razorpay Gateway Configurations & Orders
CREATE TABLE IF NOT EXISTS razorpay_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment TEXT NOT NULL DEFAULT 'TEST',
  testKeyId TEXT,
  testKeySecret TEXT,
  liveKeyId TEXT,
  liveKeySecret TEXT,
  isEnabled BOOLEAN NOT NULL DEFAULT 0,
  webhookSecret TEXT,
  lastTestedAt TEXT
);

CREATE TABLE IF NOT EXISTS razorpay_orders (
  orderId TEXT PRIMARY KEY,
  orderAmount REAL NOT NULL,
  orderCurrency TEXT DEFAULT 'INR',
  paymentStatus TEXT DEFAULT 'PENDING',
  planName TEXT,
  planId TEXT,
  tenantId TEXT,
  tenantName TEXT,
  customerName TEXT,
  customerEmail TEXT,
  customerPhone TEXT,
  createdAt TEXT NOT NULL,
  environment TEXT DEFAULT 'TEST',
  promoCode TEXT,
  rzpPaymentId TEXT,
  paymentMethod TEXT,
  paidAt TEXT
);

-- 19. Cashfree Gateway Configurations & Orders
CREATE TABLE IF NOT EXISTS cashfree_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment TEXT NOT NULL DEFAULT 'TEST',
  appId TEXT,
  secretKey TEXT,
  isEnabled BOOLEAN NOT NULL DEFAULT 0,
  webhookSecret TEXT,
  lastTestedAt TEXT
);

CREATE TABLE IF NOT EXISTS cashfree_orders (
  orderId TEXT PRIMARY KEY,
  orderAmount REAL NOT NULL,
  orderCurrency TEXT DEFAULT 'INR',
  paymentStatus TEXT DEFAULT 'PENDING',
  cfOrderId TEXT,
  paymentSessionId TEXT,
  createdAt TEXT NOT NULL,
  environment TEXT DEFAULT 'TEST',
  paidAt TEXT
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_club ON users(clubId);
CREATE INDEX IF NOT EXISTS idx_game_assets_club ON game_assets(clubId);
CREATE INDEX IF NOT EXISTS idx_customers_club ON customers(clubId);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_bar_items_club ON bar_items(clubId);
CREATE INDEX IF NOT EXISTS idx_sessions_club ON game_sessions(clubId);
CREATE INDEX IF NOT EXISTS idx_sessions_club_status ON game_sessions(clubId, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_club ON support_tickets(clubId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_bills_club ON bills(clubId);
CREATE INDEX IF NOT EXISTS idx_bills_timestamp ON bills(clubId, timestamp);
CREATE INDEX IF NOT EXISTS idx_ledger_club ON ledger_entries(clubId);
CREATE INDEX IF NOT EXISTS idx_ledger_customer ON ledger_entries(clubId, customerId);
CREATE INDEX IF NOT EXISTS idx_ledger_timestamp ON ledger_entries(clubId, timestamp);
CREATE INDEX IF NOT EXISTS idx_expenses_club ON club_expenses(clubId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON club_expenses(clubId, expenseDate);
