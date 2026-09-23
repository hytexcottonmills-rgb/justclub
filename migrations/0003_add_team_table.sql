-- Migration 0003: Add Team table for SuperAdmin management
CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invitedAt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
);
