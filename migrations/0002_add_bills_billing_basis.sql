-- Migration 0002: Add billingBasis column to bills table
ALTER TABLE bills ADD COLUMN billingBasis TEXT DEFAULT 'PER_TABLE';
