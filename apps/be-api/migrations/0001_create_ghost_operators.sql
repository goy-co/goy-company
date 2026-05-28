-- Migration: Create Ghost Operators Table
CREATE TABLE IF NOT EXISTS ghost_operators (
  pubkey TEXT PRIMARY KEY,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  infrastructure_details TEXT,
  experience_level TEXT,
  contact_nip05 TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ghost_operators_status ON ghost_operators(status);
