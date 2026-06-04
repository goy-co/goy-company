# The Goy Company - Global Build System

.PHONY: install dev dev-grid dev-fe-corporate dev-fe-identity dev-be-api dev-fe-hub dev-hub-tauri deploy-be-api build build-all build-fe-corporate build-fe-identity build-fe-hub build-hub-tauri lint test check db-migrate-local db-studio clean help

# --- Installation ---
install:
	pnpm install

# --- Development ---
dev: dev-fe-corporate

# Starts the entire ecosystem: Corporate Site, Identity App, and Edge API via Turbo
dev-grid:
	pnpm turbo run dev --filter=@the-goy-company/fe-corporate --filter=@the-goy-company/fe-identity --filter=@the-goy-company/be-api

dev-fe-corporate:
	pnpm turbo run dev --filter=@the-goy-company/fe-corporate

dev-fe-identity:
	pnpm turbo run dev --filter=@the-goy-company/fe-identity

dev-be-api:
	pnpm turbo run dev --filter=@the-goy-company/be-api

dev-fe-hub:
	pnpm turbo run dev --filter=@the-goy-company/fe-hub

dev-hub-tauri:
	pnpm turbo run tauri --filter=@the-goy-company/fe-hub -- dev

# --- Deployment ---
deploy-be-api:
	pnpm --filter @the-goy-company/be-api deploy

# --- Database ---
db-migrate-local:
	pnpm --filter @the-goy-company/be-api wrangler d1 migrations apply goy-db --local

db-studio:
	pnpm --filter @the-goy-company/be-api run db:studio

# --- Build ---
build: build-all

build-all:
	pnpm turbo run build

build-fe-corporate:
	pnpm turbo run build --filter=@the-goy-company/fe-corporate

build-fe-identity:
	pnpm turbo run build --filter=@the-goy-company/fe-identity

build-fe-hub:
	pnpm turbo run build --filter=@the-goy-company/fe-hub

build-hub-tauri:
	pnpm turbo run tauri --filter=@the-goy-company/fe-hub -- build

# --- Quality Control ---
lint:
	pnpm turbo run lint

lint-commits:
	pnpm commitlint --from=main

test:
	pnpm turbo run test

test-nostr:
	pnpm --filter @the-goy-company/nostr test

check:
	pnpm turbo run check

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
	@echo ""
	@echo "Targets:"
	@echo "  install          Install all dependencies"
	@echo "  dev-grid         Run all apps (Corporate, Identity, API) in parallel via Turbo"
	@echo "  dev-fe-corporate Run fe-corporate in dev mode"
	@echo "  dev-fe-identity  Run fe-identity in dev mode"
	@echo "  dev-be-api       Run be-api in dev mode"
	@echo "  dev-fe-hub       Run fe-hub (Astro) in dev mode"
	@echo "  dev-hub-tauri    Run fe-hub in Tauri desktop client"
	@echo "  db-migrate-local Apply D1 migrations to local development database"
	@echo "  db-studio        Open Drizzle Studio to visualize local data"
	@echo "  build-all        Build all workspace projects (Turbo optimized)"
	@echo "  build-fe-hub     Build fe-hub static frontend"
	@echo "  build-hub-tauri  Build and package fe-hub Tauri native client"
	@echo "  lint             Lint all projects"
	@echo "  test             Run all tests"
	@echo "  test-nostr       Run tests for the Nostr package"
	@echo "  clean            Remove all build artifacts"
