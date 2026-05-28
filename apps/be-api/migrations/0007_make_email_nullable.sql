-- Migration: Make email nullable for Sovereign Identity anchoring
-- SQLite doesn't support ALTER COLUMN, so we must recreate the table if we want to be strict,
-- but for D1 we can often just update the schema and handle nulls if the underlying storage allows it.
-- However, to be safe and compatible with the new schema.ts:

PRAGMA foreign_keys=OFF;

CREATE TABLE user_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE, -- Now Nullable
    email_verified INTEGER, -- Now Nullable
    image TEXT,
    bio TEXT,
    display_name TEXT,
    banner TEXT,
    website TEXT,
    nip05 TEXT,
    lud16 TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    pubkey TEXT UNIQUE,
    nsec TEXT
);

INSERT INTO user_new SELECT * FROM user;
DROP TABLE user;
ALTER TABLE user_new RENAME TO user;

PRAGMA foreign_keys=ON;
