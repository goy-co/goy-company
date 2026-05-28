# The Goy Company - Global Build System
# Powered by Turborepo & pnpm

.PHONY: install dev dev-grid build build-all test test-nostr lint clean help

# --- Installation ---
install:
	pnpm install

# --- Development ---
# Runs dev for all apps in the grid (Corporate, Identity, API)
dev-grid:
	pnpm turbo run dev --filter=@goy/fe-corporate --filter=@goy/fe-identity --filter=@goy/be-api

# Default dev (Corporate)
dev:
	pnpm turbo run dev --filter=@goy/fe-corporate

# Specific App Dev
dev-fe-%:
	pnpm turbo run dev --filter=@goy/fe-$*

# Tauri Dev
dev-hub:
	pnpm turbo run tauri --filter=@goy/fe-hub -- dev

# --- Build ---
# Builds everything in the correct order based on dependencies
build:
	pnpm turbo run build

build-all: build

# Specific App Build
build-fe-%:
	pnpm turbo run build --filter=@goy/fe-$*

# --- Testing & Quality ---
test:
	pnpm turbo run test

test-nostr:
	pnpm --filter @goy/nostr test

lint:
	pnpm turbo run lint

# --- Database ---
db-migrate:
	pnpm --filter @goy/be-api wrangler d1 migrations apply goy-db --local

db-studio:
	pnpm --filter @goy/be-api run db:studio

# --- Cleanup ---
clean:
	pnpm turbo run clean || true
	find . -name "dist" -type d -exec rm -rf {} +
	find . -name ".astro" -type d -exec rm -rf {} +
	rm -rf apps/fe-hub/src-tauri/target

# --- Help ---
help:
	@echo "The Goy Company Monorepo CLI"
	@echo ""
	@echo "Usage: make [target]"
	@echo "  dev-grid      Run the core grid apps (Corporate, Identity, API) in parallel"
	@echo "  build         Build all workspace projects (Turbo optimized)"
	@echo "  test          Run all tests via Turbo"
	@echo "  test-nostr    Run tests specifically for the Nostr package"
	@echo "  db-migrate    Apply D1 migrations to local database"
	@echo "  clean         Remove all build artifacts"
