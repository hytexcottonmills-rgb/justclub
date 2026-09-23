-- Migration 0001: Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  periodMonths INTEGER NOT NULL,
  discountLabel TEXT,
  updatedAt TEXT
);
