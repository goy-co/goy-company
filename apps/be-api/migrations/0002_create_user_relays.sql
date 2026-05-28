-- Migration: Create User Relays Table
CREATE TABLE IF NOT EXISTS user_relays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pubkey TEXT NOT NULL,
  relay_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pubkey, relay_url)
);

CREATE INDEX IF NOT EXISTS idx_user_relays_pubkey ON user_relays(pubkey);
