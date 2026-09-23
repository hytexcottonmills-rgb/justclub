-- Migration 0002: Add Platform Settings, Promo Codes, Subscription Plans, and roundOffAmount
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discountPercent REAL NOT NULL,
  validUntil TEXT,
  usesCount INTEGER NOT NULL DEFAULT 0,
  maxUses INTEGER NOT NULL DEFAULT 50,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  periodMonths INTEGER NOT NULL,
  discountLabel TEXT,
  updatedAt TEXT
);

INSERT OR IGNORE INTO subscription_plans (id, name, amount, periodMonths, discountLabel, updatedAt)
VALUES
  ('monthly', 'Monthly Plan', 499, 1, 'Standard', datetime('now')),
  ('quarterly', '3-Month Plan', 1299, 3, 'Save 13%', datetime('now')),
  ('yearly', 'Yearly Plan', 4499, 12, 'Save 25% (2 Mo Free)', datetime('now'));
