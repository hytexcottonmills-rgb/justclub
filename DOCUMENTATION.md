# JustClub OS — Comprehensive Product & Technical Documentation

---

## 1. Product Overview & Core Modules

JustClub OS is structured into six tightly integrated operational engines:

### 1.1. Live Table & Station Timers (`ActiveTablesView`)
- **Multi-Category Fleet**: Supports Snooker (Standard & Tournament sizes), 8-Ball Pool, PlayStation 5, PC Gaming Rigs, VR Simulators, Table Tennis, Foosball, and Darts.
- **Accurate Billing Math**:
  $$\text{Table Cost} = \left\lceil \frac{\text{Active Minutes}}{\text{Increment Minutes}} \right\rceil \times \left( \frac{\text{Hourly Rate}}{60 / \text{Increment Minutes}} \right)$$
- **Pause & Resume**: Automatically records pause timestamps and deducts non-playing time from the customer's final invoice.
- **Player Tagging**: Attach registered club members or walk-in guests to active sessions.
- **Attached Bar Orders**: Add snacks, energy drinks, and beverages to an active table tab; orders are consolidated on the final checkout invoice.

### 1.2. Split Billing & UPI Payment Engine (`SplitBillingModal` & `UpiQrModal`)
- **Split Strategies**:
  - **Equal Split**: Automatically divides the combined session and bar total evenly across all tagged players.
  - **Custom Split**: Adjust individual player share percentages or fixed monetary portions.
- **Dynamic UPI QR Code**: Generates RFC-compliant UPI payment intent URLs (`upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`) rendered into scannable QR codes for Google Pay, PhonePe, Paytm, and BHIM.
- **Direct WhatsApp Deep Linking**: Generates pre-formatted payment request messages with itemized breakdowns and 1-click UPI pay links sent straight to the customer's WhatsApp number.

### 1.3. Standalone Café & Snack Terminal (`BarPosTerminal`)
- **Quick-Ring POS**: Fast item search, category filters (Beverages, Hot Food, Snacks, Merchandise), and one-click cart additions.
- **Payment Modalities**: Cash, Instant UPI QR, or Charge to Customer Credit Tab (Khata).
- **Auto Stock Decrements**: Inventory balances decrease in real time upon sale confirmation, with low-stock warnings when counts fall below threshold.

### 1.4. Customer CRM & Credit Khata (`LedgersView`)
- **Credit Balance Tracking**: Real-time ledger balances indicating whether a player has an outstanding debt or a prepaid advance.
- **Lifetime Value (LTV) & Visit Counter**: Tracks total visits, last visited date, average spend per visit, and preferred game category.
- **Overdue Settlement Triggers**: 1-click WhatsApp debt collection reminders with live payment links.

### 1.5. Retention & Business Analytics (`AnalyticsView` & `RetentionDashboard`)
- **Velocity Metrics**: Total revenue, average table turn rate, active session count, and hourly utilization percentages.
- **Churn Prediction Engine**: Identifies at-risk players (absent for >14 days) and prompts targeted re-engagement offers.
- **Peak Hour Heatmaps**: Analyzes revenue concentration by hour of day and day of week to optimize staffing and rate cards.

### 1.6. Isolated Super Admin SaaS Portal (`SuperAdminView`)
- **Multi-Tenant Club Management**: View all onboarded clubs, toggle active/suspended states, monitor renewal dates, and review plan tiers.
- **Razorpay Payment Gateway Hub**: Manage Razorpay API key configurations and inspect real-time transaction logs.
- **Support Helpdesk**: Manage ticket queues, prioritize urgent club requests, and track resolution timelines.
- **System Audit Trail**: Immutable logging of all admin actions, status alterations, and security events.

---

## 2. Cloudflare D1 Database Schema

All tables are SQLite/D1 compatible and defined in `schema.sql`:

```sql
-- 1. Cashfree Configuration
CREATE TABLE cashfree_config (
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

-- 2. Cashfree Transaction Logs
CREATE TABLE cashfree_orders (
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
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager', -- 'superadmin' | 'owner' | 'manager' | 'staff'
  clubId TEXT,
  fullName TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 4. Club Tenant Master Profiles
CREATE TABLE club_profiles (
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

-- 5. Game Assets (Fleet Management)
CREATE TABLE game_assets (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'snooker' | '8ball' | 'ps5' | 'pc' | 'vr' | 'foosball' | 'tt'
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL DEFAULT 'per_minute',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Customer CRM & Member Ledgers
CREATE TABLE customers (
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

-- 7. Café & Bar POS Inventory
CREATE TABLE bar_items (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 8. Game Sessions & Billing Records
CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  clubId TEXT NOT NULL,
  assetId TEXT NOT NULL,
  assetName TEXT NOT NULL,
  category TEXT NOT NULL,
  hourlyRate REAL NOT NULL,
  billingIncrement TEXT NOT NULL,
  matchType TEXT DEFAULT 'standard',
  taggedPlayers TEXT, -- Stored as JSON string
  startTime INTEGER NOT NULL,
  pausedAt INTEGER,
  totalPausedDuration INTEGER DEFAULT 0,
  attachedBarOrders TEXT, -- Stored as JSON string
  status TEXT NOT NULL DEFAULT 'running', -- 'running' | 'paused' | 'ended'
  endedAt INTEGER,
  finalBillAmount REAL,
  paymentMethod TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 9. Support Helpdesk Tickets
CREATE TABLE support_tickets (
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

-- 10. Audit Logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  adminEmail TEXT NOT NULL,
  targetTenantId TEXT,
  targetClubName TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  metadata TEXT,
  timestamp TEXT NOT NULL
);
```

---

## 3. Edge API Endpoints (`/functions/api/[[route]].ts`)

All endpoints are hosted on Cloudflare Pages Functions and served under `/api/*`:

### 3.1. Authentication
- `POST /api/auth/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ success: true, token: string, user: AuthUser }`
- `GET /api/auth/verify`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user: AuthUser }`

### 3.2. Club Profile & Settings
- `GET /api/club/profile`: Fetch current club details and UPI configuration.
- `PUT /api/club/profile`: Update business name, owner contact, address, and UPI ID.

### 3.3. Game Fleet (Assets)
- `GET /api/assets`: List all tables and stations for the authenticated club.
- `POST /api/assets`: Register a new game asset with custom hourly rates and billing increments.
- `PUT /api/assets/:id`: Update rate cards, station name, or operational status.
- `DELETE /api/assets/:id`: Remove station from active roster.

### 3.4. Live Game Sessions
- `GET /api/sessions`: List all running tables with elapsed timers.
- `POST /api/sessions`: Start a new game session.
- `POST /api/sessions/:id/pause`: Temporarily pause session timer.
- `POST /api/sessions/:id/resume`: Resume session timer and compute paused duration.
- `POST /api/sessions/:id/bar_orders`: Attach food/beverage order to active session.
- `POST /api/sessions/:id/end`: Settle bill, set table status to `available`, and log final invoice.

### 3.5. Customers & Ledgers
- `GET /api/customers`: Fetch customer list, credit balances, and visit metrics.
- `POST /api/customers`: Create or update customer profile.
- `POST /api/customers/:id/ledger`: Credit or debit customer ledger balance.

### 3.6. Café & Bar Inventory
- `GET /api/bar_items`: Fetch menu items, categories, and inventory stock counts.
- `POST /api/bar_items`: Create a new menu item.
- `POST /api/bar_items/:id/stock`: Add or reduce stock count.

### 3.7. Razorpay Gateway & SaaS Billing
- `GET /api/razorpay/config`: Retrieve Razorpay public key ID and gateway status (Super Admin).
- `POST /api/razorpay/config`: Update Razorpay key ID and secret (Super Admin).
- `POST /api/razorpay/create-order` / `POST /api/create-order`: Create Razorpay checkout order session.
- `POST /api/razorpay/verify-order` / `POST /api/verify-payment`: Verify Razorpay signature and activate subscription.

#### Legacy / Unused Endpoints
- `GET /api/cashfree/config` *(Legacy / unused)*: Retrieve Cashfree parameters.
- `POST /api/cashfree/config` *(Legacy / unused)*: Update Cashfree credentials.
- `POST /api/cashfree/create-order` *(Legacy / unused)*: Legacy Cashfree order creation.
- `GET /api/cashfree/verify/:orderId` *(Legacy / unused)*: Legacy order status polling.
- `POST /api/cashfree/webhook` *(Legacy / unused)*: Legacy asynchronous webhook handler.

### 3.8. Super Admin Management
- `GET /api/admin/tenants`: List all onboarded club tenants.
- `POST /api/admin/tenants/:id/toggle`: Toggle tenant access between `ACTIVE` and `SUSPENDED`.
- `GET /api/admin/tickets`: Support ticket queue.
- `POST /api/admin/tickets/:id/status`: Update support ticket status.
- `GET /api/admin/audit_logs`: View recent administrative actions.

---

## 4. Progressive Web App (PWA) & Store Packaging

### 4.1. Manifest Configuration (`vite.config.ts`)
- **Identifier**: `id: "/"`
- **Start URL & Scope**: `start_url: "/"`, `scope: "/"`
- **Display Mode**: `standalone`
- **Theme Color**: `#0F172A` (Slate 900)
- **Background Color**: `#020617` (Slate 950)
- **Categories**: `["business", "finance", "utilities", "productivity", "entertainment"]`
- **Shortcuts**: One-tap access to Live Tables, Café POS, and Customer Ledgers.

### 4.2. Android Digital Asset Links (`/.well-known/assetlinks.json`)
Allows Google Play Trusted Web Activities (TWA) to run without the browser URL bar:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.justclub.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
      ]
    }
  }
]
```

### 4.3. Apple App Site Association (`/.well-known/apple-app-site-association`)
Enables iOS Universal Links for seamless App Store packaging:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID12345.com.justclub.app",
        "paths": ["*"]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAMID12345.com.justclub.app"]
  }
}
```

---

## 5. Offline-First Resilience Strategy

To guarantee zero downtime in physical lounges:
1. **Local State Cache**: All active tables, customers, and inventory items are maintained in browser memory and synchronized to `localStorage`.
2. **Offline Mode Indicator**: When internet connectivity drops, `OfflineIndicator.tsx` informs the operator while POS billing and table timers continue uninterrupted.
3. **Background Sync**: When network connectivity is restored, mutations are synchronized back to Cloudflare D1.

---

## 6. Environment Variables Reference

| Variable | Scope | Description |
|---|---|---|
| `JWT_SECRET` | Server (Cloudflare) | Secret key used to sign and verify JSON Web Tokens on the edge. |
| `ALLOWED_ORIGINS` | Server (Cloudflare) | Comma-separated allowed domains for CORS. |
| `RAZORPAY_KEY_ID` | Server (Cloudflare) | Razorpay Key ID for backend order creation & verification. |
| `RAZORPAY_KEY_SECRET` | Server (Cloudflare) | Razorpay Key Secret for backend verification. |
| `VITE_RAZORPAY_KEY_ID` | Client (Vite) | Razorpay Public Key ID used in checkout modal. |
| `VITE_GOOGLE_CLIENT_ID` | Client (Vite) | Google OAuth Client ID for client sign-in. |
| `GOOGLE_CLIENT_ID` | Server (Cloudflare) | Google OAuth Client ID for token validation. |
| `ADMIN_EMAILS` | Server (Cloudflare) | Comma-separated superadmin email allowlist. |
