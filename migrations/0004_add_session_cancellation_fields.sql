-- Migration 0004: Add cancellationReason to game_sessions table
ALTER TABLE game_sessions ADD COLUMN cancellationReason TEXT;
