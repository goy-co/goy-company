import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- Goy Grid Tables ---

export const userRelays = sqliteTable('user_relays', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pubkey: text('pubkey').notNull(),
  relayUrl: text('relay_url').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  pubkeyRelayIdx: uniqueIndex('idx_user_relays_pubkey_url').on(table.pubkey, table.relayUrl),
}));

export const ghostOperators = sqliteTable('ghost_operators', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pubkey: text('pubkey').notNull().unique(),
  infrastructureDetails: text('infrastructure_details').notNull(),
  experienceLevel: text('experience_level').notNull(),
  contactNip05: text('contact_nip05'),
  status: text('status').default('PENDING'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Better Auth Tables (Hybrid Identity) ---

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
  bio: text("bio"),
  displayName: text("display_name"),
  banner: text("banner"),
  website: text("website"),
  nip05: text("nip05"),
  lud16: text("lud16"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  pubkey: text("pubkey").unique(), 
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_at_expires_at", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refresh_at_expires_at", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});
