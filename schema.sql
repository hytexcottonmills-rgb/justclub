-- Original Cashfree tables
CREATE TABLE IF NOT EXISTS cashfree_config (
  id INTEGER PRIMARY KEY,
  environment TEXT NOT NULL,
  testAppId TEXT,
  testSecretKey TEXT,
  liveAppId TEXT,
  liveSecretKey TEXT,
  isEnabled BOOLEAN NOT NULL,
  webhookSecret TEXT,
  lastTestedAt TEXT
);

CREATE TABLE IF NOT EXISTS cashfree_orders (
  orderId TEXT PRIMARY KEY,
  orderAmount REAL,
  orderCurrency TEXT,
  paymentSessionId TEXT,
  paymentStatus TEXT,
  planName TEXT,
  planId TEXT,
  tenantId TEXT,
  tenantName TEXT,
  customerName TEXT,
  customerEmail TEXT,
  customerPhone TEXT,
  createdAt TEXT,
  environment TEXT,
  promoCode TEXT,
  cfRawResponse TEXT,
  cfPaymentId TEXT,
  paymentMethod TEXT,
  paidAt TEXT
);

-- New System Tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL,
  clubId TEXT
);

CREATE TABLE IF NOT EXISTS club_profiles (
  id TEXT PRIMARY KEY,
  businessName TEXT NOT NULL,
  ownerName TEXT NOT NULL,
  whatsapp TEXT,
  pincode TEXT,
  upiId TEXT,
  tenantStatus TEXT,
  monthlyPlanFee REAL,
  renewalDueDate TEXT,
  totalRevenueThisMonth REAL
);

CREATE TABLE IF NOT EXISTS game_assets (
  id TEXT PRIMARY KEY,
  clubId TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  clubId TEXT,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ledgerBalance REAL DEFAULT 0,
  totalVisits INTEGER DEFAULT 0,
  lastVisitedDate TEXT,
  lifetimeValue REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS bar_items (
  id TEXT PRIMARY KEY,
  clubId TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  clubId TEXT,
  assetId TEXT NOT NULL,
  assetName TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL,
  matchType TEXT,
  taggedPlayers TEXT, -- Stored as JSON string
  startTime INTEGER NOT NULL,
  pausedAt INTEGER,
  totalPausedDuration INTEGER DEFAULT 0,
  attachedBarOrders TEXT, -- Stored as JSON string
  status TEXT NOT NULL,
  endedAt INTEGER
);

-- Insert Super Admin (hytexcottonmills@gmail.com)
INSERT OR IGNORE INTO users (id, email, passwordHash, role, clubId)
VALUES ('admin_1', 'hytexcottonmills@gmail.com', 'f20cc593403c75c6812e0f4ad15a5e08dbc286d0b3103e91730020e9c23a04b3', 'superadmin', 'club_001');

-- Seed an initial club profile
INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, whatsapp, pincode, upiId, tenantStatus, monthlyPlanFee, renewalDueDate, totalRevenueThisMonth)
VALUES ('club_001', 'Hytex Cotton Mills Club', 'Admin', '+919876543210', '600001', 'admin@upi', 'ACTIVE', 499, '2026-10-01', 0);
