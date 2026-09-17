-- ==============================================================================
-- JustClub D1 Database Schema — SQLite / Cloudflare D1 Serverless SQL
-- ==============================================================================

-- 1. Cashfree Configuration & Gateway Secrets
CREATE TABLE IF NOT EXISTS cashfree_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment TEXT NOT NULL DEFAULT 'TEST',
  testAppId TEXT,
  testSecretKey TEXT,
  liveAppId TEXT,
  liveSecretKey TEXT,
  isEnabled BOOLEAN NOT NULL DEFAULT 0,
  webhookSecret TEXT,
  lastTestedAt TEXT
);

-- 2. Cashfree Orders & Subscription Transaction History
CREATE TABLE IF NOT EXISTS cashfree_orders (
  orderId TEXT PRIMARY KEY,
  orderAmount REAL NOT NULL,
  orderCurrency TEXT DEFAULT 'INR',
  paymentSessionId TEXT,
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
  cfRawResponse TEXT,
  cfPaymentId TEXT,
  paymentMethod TEXT,
  paidAt TEXT
);

-- 3. Multi-Tenant User Accounts & RBAC
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager', -- 'superadmin' | 'owner' | 'manager' | 'staff'
  clubId TEXT,
  fullName TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 4. Club Tenant Master Profiles
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
  tenantStatus TEXT DEFAULT 'ACTIVE', -- 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED'
  monthlyPlanFee REAL DEFAULT 499,
  renewalDueDate TEXT,
  totalRevenueThisMonth REAL DEFAULT 0,
  activeTableCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 5. Game Assets (Snooker Tables, Billiards, PS5, PC Gaming, VR, TT, Foosball)
CREATE TABLE IF NOT EXISTS game_assets (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'snooker' | '8ball' | 'ps5' | 'pc' | 'vr' | 'foosball' | 'tt'
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL DEFAULT 'per_minute', -- 'per_minute' | 'per_15_min' | 'per_30_min' | 'per_hour'
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'occupied' | 'maintenance'
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Customers & Member Credit Ledgers (CRM)
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

-- 7. Bar, Café & Snack POS Inventory
CREATE TABLE IF NOT EXISTS bar_items (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'beverage' | 'snack' | 'meal' | 'merch'
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 8. Game Sessions & Live Table Tracking
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  assetId TEXT NOT NULL,
  assetName TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL,
  matchType TEXT DEFAULT 'standard',
  taggedPlayers TEXT, -- JSON Array of tagged player customer IDs & names
  startTime INTEGER NOT NULL,
  pausedAt INTEGER,
  totalPausedDuration INTEGER DEFAULT 0,
  attachedBarOrders TEXT, -- JSON Array of bar orders
  status TEXT NOT NULL DEFAULT 'running', -- 'running' | 'paused' | 'ended'
  endedAt INTEGER,
  finalBillAmount REAL,
  paymentMethod TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 9. Support Tickets & Issue Helpdesk
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  clubName TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT
);

-- 10. System Audit Logs & Telemetry
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  adminEmail TEXT NOT NULL,
  targetTenantId TEXT,
  targetClubName TEXT,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info' | 'warning' | 'success' | 'danger'
  metadata TEXT, -- JSON string
  timestamp TEXT NOT NULL
);

-- ==============================================================================
-- Performance Indexes for Cloudflare D1
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_game_assets_club ON game_assets(clubId);
CREATE INDEX IF NOT EXISTS idx_customers_club ON customers(clubId);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_bar_items_club ON bar_items(clubId);
CREATE INDEX IF NOT EXISTS idx_sessions_club_status ON game_sessions(clubId, status);
CREATE INDEX IF NOT EXISTS idx_cf_orders_tenant ON cashfree_orders(tenantId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- ==============================================================================
-- Initial Seeding
-- ==============================================================================
-- Super Admin Default User (hytexcottonmills@gmail.com)
INSERT OR IGNORE INTO users (id, email, passwordHash, role, clubId, fullName)
VALUES (
  'usr_admin_001', 
  'hytexcottonmills@gmail.com', 
  'f20cc593403c75c6812e0f4ad15a5e08dbc286d0b3103e91730020e9c23a04b3', 
  'superadmin', 
  'club_001',
  'Super Admin'
);

-- Seed Tenant Club Profile
INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, whatsapp, pincode, city, state, upiId, tenantStatus, monthlyPlanFee, renewalDueDate, totalRevenueThisMonth, activeTableCount)
VALUES (
  'club_001', 
  'Hytex Cotton Mills Club', 
  'Admin', 
  'hytexcottonmills@gmail.com', 
  '+919876543210', 
  '600001', 
  'Chennai', 
  'Tamil Nadu', 
  'admin@upi', 
  'ACTIVE', 
  499, 
  '2026-10-01', 
  0, 
  8
);
