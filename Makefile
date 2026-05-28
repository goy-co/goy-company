# The Goy Company - Global Build System

.PHONY: install dev dev-grid dev-fe-corporate dev-fe-identity dev-be-api dev-fe-hub tauri-fe-hub-dev deploy-be-api build build-all build-fe-corporate build-fe-identity build-fe-hub tauri-fe-hub-build lint test check db-migrate-local clean help

# --- Installation ---
install:
	pnpm install

# --- Development ---
dev: dev-fe-corporate

# Starts the entire ecosystem: Corporate Site, Identity App, and Edge API
dev-grid:
	pnpm --filter @goy/fe-corporate --filter @goy/fe-identity --filter @goy/be-api --parallel dev

dev-fe-corporate:
	pnpm --filter @goy/fe-corporate dev

dev-fe-identity:
	pnpm --filter @goy/fe-identity dev

dev-be-api:
	pnpm --filter @goy/be-api dev

dev-fe-hub:
	pnpm --filter @goy/fe-hub dev

tauri-fe-hub-dev:
	pnpm --filter @goy/fe-hub tauri dev

# --- Deployment ---
deploy-be-api:
	pnpm --filter @goy/be-api deploy

# --- Database ---
db-migrate-local:
	pnpm --filter @goy/be-api wrangler d1 migrations apply goy-db --local

db-studio:
	pnpm --filter @goy/be-api run db:studio

# --- Build ---
build: build-all

build-all:
	pnpm -r build

build-fe-corporate:
	pnpm --filter @goy/fe-corporate build

build-fe-identity:
	pnpm --filter @goy/fe-identity build

build-fe-hub:
	pnpm --filter @goy/fe-hub build

tauri-fe-hub-build:
	pnpm --filter @goy/fe-hub tauri build

# --- Quality Control ---
lint:
	pnpm -r lint

test:
	pnpm -r test

check:
	pnpm -r check

# --- Cleanup ---
clean:
	find . -name "dist" -type d -exec rm -rf {} +
	find . -name ".astro" -type d -exec rm -rf {} +
	find . -name "node_modules" -type d -exec rm -rf {} +
	rm -rf apps/fe-hub/src-tauri/target

# --- Help ---
help:
	@echo "The Goy Company Monorepo CLI"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install all dependencies"
	@echo "  dev-grid         Run all apps (Corporate, Identity, API) in parallel"
	@echo "  dev-fe-corporate Run fe-corporate in dev mode"
	@echo "  dev-fe-identity  Run fe-identity in dev mode"
	@echo "  dev-be-api       Run be-api in dev mode"
	@echo "  dev-fe-hub       Run fe-hub in dev mode"
	@echo "  tauri-fe-hub-dev Run fe-hub in Tauri desktop client"
	@echo "  db-migrate-local Apply D1 migrations to local development database"
	@echo "  db-studio        Open Drizzle Studio to visualize local data"
	@echo "  build-all        Build all workspace projects"
	@echo "  build-fe-hub     Build fe-hub static frontend"
	@echo "  tauri-fe-hub-build Build and package fe-hub Tauri native client"
	@echo "  lint             Lint all projects"
	@echo "  test             Run all tests"
	@echo "  clean            Remove all build artifacts and node_modules"
